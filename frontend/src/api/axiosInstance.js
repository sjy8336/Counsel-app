import axios from 'axios';

const normalizeUrl = (value) => value?.replace(/\/$/, '') || '';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const API_ORIGIN_URL = normalizeUrl(import.meta.env.VITE_API_URL || API_BASE_URL?.replace(/\/api$/, ''));

export const apiUrl = (path = '') => {
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    return `${API_BASE_URL}${normalizedPath}`;
};

export const resolveImageUrl = (path = '') => {
    if (!path) return '';
    if (path.startsWith('data:') || path.startsWith('blob:')) return path;
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    if (path.startsWith('/static/')) return `${API_ORIGIN_URL}${path}`;
    if (path.startsWith('static/')) return `${API_ORIGIN_URL}/${path}`;
    if (path.startsWith('/')) return `${API_ORIGIN_URL}${path}`;
    return `${API_ORIGIN_URL}/static/profile_images/${path}`;
};

// 공통 axios 인스턴스 생성
const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
});

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
