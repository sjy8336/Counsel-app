// 예약 전체 조회 (상태별 필터링은 프론트에서)
export const getAllBookings = async () => {
    const response = await axios.get(`${API_BASE_URL}/booking/list`);
    return response.data;
};

// 예약 취소(삭제)
export const cancelBooking = async (orderId) => {
    const response = await axios.delete(`${API_BASE_URL}/booking/cancel/${orderId}`);
    return response.data;
};

// 상담 완료 처리
export const completeBooking = async (orderId) => {
    const response = await axios.post(`${API_BASE_URL}/booking/complete/${orderId}`);
    return response.data;
};
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

/**
 * 예약 생성 API
 * @param {Object} bookingData - 예약 정보 (orderId, counselorName, selectedDate, selectedTime, survey 등)
 */
export const createBooking = async (bookingData) => {
    const response = await axios.post(`${API_BASE_URL}/booking/create`, bookingData, {
        headers: {
            'Content-Type': 'application/json',
        },
    });
    return response.data;
};
