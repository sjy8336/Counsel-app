import axiosInstance from './axiosInstance';

// 찜(하트) 토글
export const toggleFavorite = async (counselor_id, token) => {
    const response = await axiosInstance.post(`/favorites/${counselor_id}`, {}, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
    return response.data;
};

// 찜 목록 가져오기
export const getFavorites = async (token) => {
    const response = await axiosInstance.get('/favorites', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    return response.data;
};
