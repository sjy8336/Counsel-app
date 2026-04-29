import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// 상담사 프로필 전체 등록
export const registerCounselorProfile = async (data, token) => {
    const res = await axios.post(`${API_URL}/counselor/profile`, data, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return res.data;
};
