import axiosInstance from './axiosInstance';

export const signUp = async (userData) => {
    // 백엔드 엔드포인트 /signup 으로 데이터 전송
    const response = await axiosInstance.post('/signup', {
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
    const response = await axiosInstance.post('/delete-account', {}, { headers: { Authorization: `Bearer ${token}` } });
    return response.data;
};

export const login = async (credentials) => {
    const response = await axiosInstance.post('/login', {
        username: credentials.username,
        password: credentials.password,
    });

    return response;
};

export const checkIdDuplicate = async (username) => {
    const response = await axiosInstance.get(`/check-id/${username}`);
    return response.data; // { available: true/false } 반환
};
