import axios from 'axios';
const API_BASE_URL = 'http://localhost:8000/api';

// 상담사별 예약 목록 조회
export const getCounselorBookings = async () => {
    const token = localStorage.getItem('access_token');
    const response = await axios.get(`${API_BASE_URL}/booking/counselor-list`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    return response.data;
};

// 취소된 예약 삭제
export const deleteCanceledBooking = async (orderId) => {
    const token = localStorage.getItem('access_token');
    const response = await axios.delete(`${API_BASE_URL}/booking/remove/${orderId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    return response.data;
};
