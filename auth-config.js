/**
 * Microsoft Entra ID (Azure AD) 로그인 설정
 *
 * Azure Portal → Microsoft Entra ID → 앱 등록 후 값을 넣으면 회사 계정만 로그인됩니다.
 *
 * 1) 새 등록: 이름 예) "ES Career 채용툴"
 *    계정 유형: "이 조직 디렉터리의 계정만" (단일 테넌트)
 * 2) 플랫폼 추가 → 단일 페이지 애플리케이션(SPA)
 *    리디렉션 URI 예)
 *    - http://127.0.0.1:8765/
 *    - https://실제배포주소/
 * 3) 개요에서 애플리케이션(클라이언트) ID, 디렉터리(테넌트) ID 복사
 */
window.MS_AUTH = {
  clientId: '',
  tenantId: '',
  // @univ.me 회사 계정만 허용
  allowedDomains: ['univ.me']
};
