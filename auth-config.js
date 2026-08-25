/**
 * Microsoft 로그인 설정
 *
 * Azure 앱 등록 후 애플리케이션(클라이언트) ID를 clientId에 넣습니다.
 * tenantId를 넣으면 해당 회사 테넌트만, 비우면 조직 계정 로그인 후 @univ.me만 통과합니다.
 *
 * SPA 리디렉션 URI 예:
 * - http://127.0.0.1:8765/
 * - https://실제배포주소/
 */
window.MS_AUTH = {
  clientId: '15984078-1c24-449f-8015-d6fcef874fc3',
  tenantId: '62159e29-f055-4971-a953-1dcb60ae4f0c',
  allowedDomains: ['univ.me']
};
