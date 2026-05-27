// utils/jwt.js
// JWT 만료 체크 함수
export function isTokenExpired(token) {
    if (!token) return true;
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        // exp가 있으면 exp 기준 만료
        if (payload.exp) {
            return Date.now() >= payload.exp * 1000;
        }
        // exp가 없으면 localStorage의 login_time 기준 24시간 만료
        const loginTime = localStorage.getItem('login_time');
        if (loginTime) {
            const now = Date.now();
            const loginTimestamp = parseInt(loginTime, 10);
            // 24시간(86400000ms) 초과 시 만료
            return now - loginTimestamp > 86400000;
        }
        // login_time 없으면 만료로 간주
        return true;
    } catch (e) {
        return true; // 파싱 실패시 만료로 간주
    }
}
