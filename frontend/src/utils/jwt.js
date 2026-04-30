// utils/jwt.js
// JWT 만료 체크 함수
export function isTokenExpired(token) {
    if (!token) return true;
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (!payload.exp) return false; // exp 없으면 만료 체크 안함
        // exp는 초 단위, Date.now()는 ms 단위
        return Date.now() >= payload.exp * 1000;
    } catch (e) {
        return true; // 파싱 실패시 만료로 간주
    }
}
