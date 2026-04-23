import axios from 'axios';

// .env 파일에 설정한 VITE_API_URL을 가져옵니다.
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const signUp = async (userData) => {
    try {
        // 백엔드 엔드포인트 /signup 으로 데이터 전송
        const response = await axios.post(`${API_URL}/signup`, {
            full_name: userData.name,
            username: userData.id,
            email: userData.email,
            password: userData.password,
            phone_number: userData.phone,
            role: userData.role === 'expert' ? 'counselor' : 'client', // 'expert'를 DB의 'counselor'로 변환
        });
        return response.data;
    } catch (error) {
        // 에러 발생 시 처리
        console.error('회원가입 에러:', error.response?.data?.detail || error.message);
        throw error;
    }
};

// 계정 영구 삭제 API
export const deleteAccount = async (user_id) => {
    try {
        const response = await axios.post(`${API_URL}/delete-account`, { user_id });
        return response.data;
    } catch (error) {
        console.error('계정 삭제 에러:', error.response?.data?.detail || error.message);
        throw error;
    }
};

export const login = async (credentials) => {
    try {
        const response = await axios.post(`${API_URL}/login`, {
            username: credentials.username, // username 필드로 전달
            password: credentials.password,
        });
        return response.data;
    } catch (error) {
        console.error('로그인 에러:', error.response?.data?.detail || error.message);
        throw error;
    }
};

export const checkIdDuplicate = async (username) => {
    try {
        const response = await axios.get(`${API_URL}/check-id/${username}`);
        return response.data; // { available: true/false } 반환
    } catch (error) {
        console.error('아이디 중복 확인 에러:', error);
        throw error;
    }
};
