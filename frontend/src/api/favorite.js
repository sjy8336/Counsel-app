import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// 찜(하트) 토글
export const toggleFavorite = async (counselor_id, token) => {
    const response = await axios.post(
        `${API_URL}/favorites/${counselor_id}`,
        {},
        { headers: token ? { Authorization: `Bearer ${token}` } : {} }
    );
    return response.data;
};

// 찜 목록 가져오기
export const getFavorites = async (token) => {
    const response = await axios.get(`${API_URL}/favorites`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    return response.data;
};
