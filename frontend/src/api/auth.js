import axios from 'axios';

// .env 파일에 설정한 VITE_API_URL을 가져옵니다.
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const signUp = async (userData) => {
    // 백엔드 엔드포인트 /signup 으로 데이터 전송
    const response = await axios.post(`${API_URL}/api/signup`, {
        full_name: userData.name,
        username: userData.id,
        email: userData.email,
        password: userData.password,
        phone_number: userData.phone,
        birth_date: userData.birth,
        gender: userData.gender,
        role: userData.role === 'expert' ? 'counselor' : 'client', // 'expert'를 DB의 'counselor'로 변환
    });
    return response.data;
};

// 계정 영구 삭제 API
export const deleteAccount = async (token) => {
    const response = await axios.post(
        `${API_URL}/api/delete-account`,
        {},
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );
    return response.data;
};

export const login = async (credentials) => {
    const response = await axios.post(`${API_URL}/api/login`, {
        username: credentials.username,
        password: credentials.password,
    });

    return response;
};

export const checkIdDuplicate = async (username) => {
    const response = await axios.get(`${API_URL}/api/check-id/${username}`);
    return response.data; // { available: true/false } 반환
};
