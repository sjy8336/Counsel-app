import axiosInstance from './axiosInstance';

// 예약 전체 조회 (상태별 필터링은 프론트에서)
export const getAllBookings = async (options = {}) => {
    const token = localStorage.getItem('access_token');
    const params = new URLSearchParams();
    if (options.upcomingOnly) params.append('upcoming_only', 'true');
    if (options.limit) params.append('limit', String(options.limit));
    const response = await axiosInstance.get('/booking/list', {
        params,
        headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    return response.data;
};

// 예약 취소(삭제)
export const cancelBooking = async (orderId) => {
    const token = localStorage.getItem('access_token');
    const response = await axiosInstance.delete(`/booking/cancel/${orderId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    return response.data;
};

// 상담 완료 처리
export const completeBooking = async (orderId) => {
    const token = localStorage.getItem('access_token');
    const response = await axiosInstance.post(
        `/booking/complete/${orderId}`,
        {},
        {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
    );
    return response.data;
};
/**
 * 예약 생성 API
 * @param {Object} bookingData - 예약 정보 (orderId, counselorName, selectedDate, selectedTime, survey 등)
 */
export const createBooking = async (bookingData) => {
    const token = localStorage.getItem('access_token');
    const response = await axiosInstance.post('/booking/create', bookingData, {
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
    });
    return response.data;
};
