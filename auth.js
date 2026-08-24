(function () {
  const LOGIN_ID = 'ms-login-overlay';
  let pca = null;
  let booted = false;

  function config() {
    return window.MS_AUTH || {};
  }

  function configured() {
    const c = config();
    return !!(c.clientId && c.tenantId);
  }

  function redirectUri() {
    const { origin, pathname } = window.location;
    if (/index\.html$/i.test(pathname)) {
      return origin + pathname.replace(/index\.html$/i, '');
    }
    return origin + pathname;
  }

  function usernameOf(account) {
    if (!account) return '';
    const claims = account.idTokenClaims || {};
    return String(claims.preferred_username || claims.email || account.username || '').toLowerCase();
  }

  function displayNameOf(account) {
    if (!account) return '';
    const claims = account.idTokenClaims || {};
    return String(claims.name || account.name || usernameOf(account) || '구성원');
  }

  function domainAllowed(account) {
    const domains = (config().allowedDomains || [])
      .map((d) => String(d).trim().toLowerCase().replace(/^@/, ''))
      .filter(Boolean);
    if (!domains.length) return true;
    const user = usernameOf(account);
    if (!user) return false;
    return domains.some((d) => user === d || user.endsWith('@' + d));
  }

  function setLocked(on) {
    document.body.classList.toggle('auth-locked', !!on);
  }

  function setError(msg) {
    const el = document.getElementById('ms-login-error');
    if (!el) return;
    el.textContent = msg || '';
    el.style.display = msg ? 'block' : 'none';
  }

  function setHint(html) {
    const el = document.getElementById('ms-login-hint');
    if (!el) return;
    el.innerHTML = html || '';
  }

  function updateUserChip(account) {
    const chip = document.getElementById('auth-user');
    const nameEl = document.getElementById('auth-user-name');
    if (!chip) return;
    if (!account) {
      chip.classList.add('hidden');
      return;
    }
    chip.classList.remove('hidden');
    if (nameEl) nameEl.textContent = displayNameOf(account);
    chip.title = usernameOf(account);
  }

  function activeAccount() {
    if (!pca) return null;
    const current = pca.getActiveAccount();
    if (current) return current;
    const all = pca.getAllAccounts();
    if (all[0]) {
      pca.setActiveAccount(all[0]);
      return all[0];
    }
    return null;
  }

  async function finishIfAllowed(account) {
    if (!account) return false;
    if (!domainAllowed(account)) {
      setError('@univ.me 계정만 로그인할 수 있습니다. 다른 계정으로 다시 시도해 주세요.');
      try {
        pca.setActiveAccount(null);
        await pca.clearCache();
      } catch (_) {}
      return false;
    }
    updateUserChip(account);
    setLocked(false);
    if (!booted && typeof window.bootApp === 'function') {
      booted = true;
      window.bootApp();
    }
    return true;
  }

  async function signIn() {
    setError('');
    if (!configured()) {
      setError('auth-config.js에 clientId와 tenantId를 입력해야 합니다.');
      return;
    }
    if (location.protocol === 'file:') {
      setError('file:// 에서는 Microsoft 로그인을 쓸 수 없습니다. 로컬 서버로 열어 주세요.');
      return;
    }
    try {
      await pca.loginRedirect({
        scopes: ['openid', 'profile', 'email'],
        prompt: 'select_account'
      });
    } catch (e) {
      console.error('[ms-auth] login', e);
      setError('로그인에 실패했습니다. 잠시 후 다시 시도해 주세요.');
    }
  }

  async function signOut() {
    const account = activeAccount();
    try {
      await pca.logoutRedirect({
        account: account || undefined,
        postLogoutRedirectUri: redirectUri()
      });
    } catch (e) {
      console.error('[ms-auth] logout', e);
      pca.clearCache();
      location.reload();
    }
  }

  function bindUi() {
    const btn = document.getElementById('ms-login-btn');
    const out = document.getElementById('auth-logout-btn');
    if (btn) btn.addEventListener('click', () => { signIn(); });
    if (out) out.addEventListener('click', () => { signOut(); });
  }

  async function start() {
    setLocked(true);
    bindUi();

    if (location.protocol === 'file:') {
      setHint('Microsoft 로그인은 로컬 서버(http://127.0.0.1:8765) 또는 배포 URL에서만 동작합니다.');
      return;
    }

    if (!configured()) {
      setHint(
        'IT 담당자가 Azure에서 앱을 등록한 뒤 <code>auth-config.js</code>에 ' +
        '<strong>clientId</strong>와 <strong>tenantId</strong>를 넣어 주세요.'
      );
      return;
    }

    if (typeof msal === 'undefined') {
      setError('로그인 라이브러리를 불러오지 못했습니다. 네트워크를 확인해 주세요.');
      return;
    }

    const c = config();
    pca = new msal.PublicClientApplication({
      auth: {
        clientId: c.clientId,
        authority: 'https://login.microsoftonline.com/' + c.tenantId,
        redirectUri: redirectUri(),
        navigateToLoginRequestUrl: false
      },
      cache: {
        cacheLocation: 'sessionStorage',
        storeAuthStateInCookie: false
      }
    });

    await pca.initialize();

    let result = null;
    try {
      result = await pca.handleRedirectPromise();
    } catch (e) {
      console.error('[ms-auth] redirect', e);
      setError('로그인 처리 중 오류가 발생했습니다. 다시 시도해 주세요.');
      return;
    }

    if (result && result.account) {
      pca.setActiveAccount(result.account);
    }

    const account = activeAccount();
    if (account) {
      await finishIfAllowed(account);
    }
  }

  window.msSignIn = signIn;
  window.msSignOut = signOut;
  window.startMsAuth = start;
})();
