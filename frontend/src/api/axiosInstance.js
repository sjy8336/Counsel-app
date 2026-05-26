// 환경에 맞게 BASE URL 지정 (예시)
export const API_BASE_URL = '/api';
import axios from 'axios';

// 공통 axios 인스턴스 생성
const axiosInstance = axios.create();

// 401 에러 인터셉터
axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            // 토큰 만료/인증 실패 시
            alert('로그인 세션이 만료되었습니다. 다시 로그인 해주세요.');
            localStorage.removeItem('access_token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;
