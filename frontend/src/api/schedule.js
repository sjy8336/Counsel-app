// 상담사 스케줄+휴무 통합 조회 API
import axiosInstance from './axiosInstance';

// userId를 쿼리 파라미터로 전달
export const getScheduleCalendar = async (userId) => {
    const res = await axiosInstance.get('/schedule/calendar', { params: { user_id: userId } });
    return res.data;
};

// 스케줄 추가 (근무일로 변경)
export const addSchedule = async ({ user_id, day_of_week, start_time, end_time }) => {
    const token = localStorage.getItem('access_token');
    const res = await axiosInstance.post(
        '/schedule',
        {
            user_id,
            day_of_week,
            start_time,
            end_time,
        },
        {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
    );
    return res.data;
};
