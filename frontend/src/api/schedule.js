// 상담사 스케줄+휴무 통합 조회 API
import axios from 'axios';

// userId를 쿼리 파라미터로 전달
export const getScheduleCalendar = async (userId) => {
    const res = await axios.get('/api/schedule/calendar', { params: { user_id: userId } });
    return res.data;
};

// 스케줄 추가 (근무일로 변경)
export const addSchedule = async ({ user_id, day_of_week, start_time, end_time }) => {
    const res = await axios.post('/api/schedule', {
        user_id,
        day_of_week,
        start_time,
        end_time,
    });
    return res.data;
};
