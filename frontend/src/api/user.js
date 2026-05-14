import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const getUserInfo = async (user_id) => {
    const response = await axios.get(`${API_URL}/api/user/${user_id}`);
    return response.data;
};

export const updateUserInfo = async (userData) => {
    const response = await axios.post(`${API_URL}/api/user/update`, userData);
    return response.data;
};

// 비밀번호 변경
export const changePassword = async ({ user_id, current_password, new_password }) => {
    const response = await axios.post(`${API_URL}/user/change-password`, {
        user_id,
        current_password,
        new_password,
    });
    return response.data;
};

// 내 정보(/me) 가져오기 - 토큰 필요시 Authorization 헤더 사용
export const getMyInfo = async (token) => {
    const response = await axios.get(`${API_URL}/api/me`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    return response.data;
};
