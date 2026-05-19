import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

/**
 * 상담사가 예약을 거절(취소)하는 API
 * @param {string} orderId
 */
export const rejectBooking = async (orderId) => {
    const response = await axios.post(
        `${API_BASE_URL}/booking/reject`,
        { order_id: orderId },
        {
            headers: {
                'Content-Type': 'application/json',
            },
        }
    );
    return response.data;
};
