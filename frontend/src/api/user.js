import axiosInstance from './axiosInstance';

export const getUserInfo = async (user_id) => {
    const response = await axiosInstance.get(`/user/${user_id}`);
    return response.data;
};

export const updateUserInfo = async (userData) => {
    const response = await axiosInstance.post('/user/update', userData);
    return response.data;
};

// 비밀번호 변경
export const changePassword = async ({ user_id, current_password, new_password }) => {
    const response = await axiosInstance.post('/user/change-password', {
        user_id,
        current_password,
        new_password,
    });
    return response.data;
};

// 내 정보(/me) 가져오기 - 토큰 필요시 Authorization 헤더 사용
export const getMyInfo = async (token) => {
    const response = await axiosInstance.get('/me', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    return response.data;
};
