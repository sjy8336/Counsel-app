import axiosInstance from './axiosInstance';

/**
 * 상담사가 예약을 거절(취소)하는 API
 * @param {string} orderId
 */
export const rejectBooking = async (orderId) => {
    const token = localStorage.getItem('access_token');
    const response = await axiosInstance.post(
        '/booking/reject',
        { order_id: orderId },
        {
            headers: {
                'Content-Type': 'application/json',
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
        }
    );
    return response.data;
};
