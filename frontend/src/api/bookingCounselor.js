import axiosInstance from './axiosInstance';

// 상담사별 예약 목록 조회
export const getCounselorBookings = async () => {
    const token = localStorage.getItem('access_token');
    const response = await axiosInstance.get('/booking/counselor-list', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    return response.data;
};

// 취소된 예약 삭제
export const deleteCanceledBooking = async (orderId) => {
    const token = localStorage.getItem('access_token');
    const response = await axiosInstance.delete(`/booking/remove/${orderId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    return response.data;
};
