// 휴무일 관련 API
import axiosInstance from './axiosInstance';

// 휴무일 목록 조회
export const getHolidays = async () => {
    const res = await axiosInstance.get('/holiday');
    return res.data;
};

// 휴무일 추가
export const addHoliday = async (date, userId) => {
    const res = await axiosInstance.post(`/holiday?user_id=${userId}`, { date });
    return res.data;
};

// 휴무일 삭제
export const removeHoliday = async (date, userId) => {
    const res = await axiosInstance.delete(`/holiday?user_id=${userId}`, { data: { date } });
    return res.data;
};
