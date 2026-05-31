import axiosInstance from './axiosInstance';

/**
 * 결제 완료된 예약만 조회
 */
export const getCompletedBookings = async () => {
    const response = await axiosInstance.get('/booking/completed');
    return response.data;
};
