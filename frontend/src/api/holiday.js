// 휴무일 관련 API
import axios from 'axios';

// 휴무일 목록 조회
export const getHolidays = async () => {
    const res = await axios.get('/api/holiday');
    return res.data;
};

// 휴무일 추가
export const addHoliday = async (date, userId) => {
    const res = await axios.post(`/api/holiday?user_id=${userId}`, { date });
    return res.data;
};

// 휴무일 삭제
export const removeHoliday = async (date, userId) => {
    const res = await axios.delete(`/api/holiday?user_id=${userId}`, { data: { date } });
    return res.data;
};
