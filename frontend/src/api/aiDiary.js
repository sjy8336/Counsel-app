import axiosInstance from './axiosInstance';

export const analyzeDiary = async ({ diary_text, selected_emotion, emotion_intensity, stress_level }) => {
    const token = localStorage.getItem('access_token');
    const res = await axiosInstance.post(
        '/api/ai-diary/analyze',
        {
            diary_text,
            selected_emotion,
            emotion_intensity: Number(emotion_intensity),
            stress_level: Number(stress_level),
        },
        { headers: { Authorization: `Bearer ${token}` } }
    );
    return res.data;
};

// 최근 일기 목록 조회
export const getRecentDiaries = async (limit = 3) => {
    const token = localStorage.getItem('access_token');
    const res = await axiosInstance.get(`/api/ai-diary/recent?limit=${limit}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
};
