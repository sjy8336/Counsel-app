import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

/**
 * 결제 완료된 예약만 조회
 */
export const getCompletedBookings = async () => {
    const response = await axios.get(`${API_BASE_URL}/booking/completed`);
    return response.data;
};
