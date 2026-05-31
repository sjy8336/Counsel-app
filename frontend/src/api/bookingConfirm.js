import axios from 'axios';
import { API_BASE_URL } from './axiosInstance';

/**
 * 상담사가 예약을 승인(확정)하는 API
 * @param {string} orderId
 */
export const confirmBooking = async (orderId) => {
    const token = localStorage.getItem('access_token');
    const response = await axios.post(
        `${API_BASE_URL}/booking/confirm`,
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
