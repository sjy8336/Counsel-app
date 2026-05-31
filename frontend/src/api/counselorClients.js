import axiosInstance from './axiosInstance';

// 상담일지 삭제 API
export const deleteCounselingLog = async (log_id) => {
    const token = localStorage.getItem('access_token');
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    return axiosInstance.delete(`/counseling-logs/${log_id}`, { headers });
};

// 상담일지 수정 API
export const putCounselingLog = async ({ log_id, content, summary, action_plan }) => {
    const token = localStorage.getItem('access_token');
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const body = { content, summary, action_plan };
    const res = await axiosInstance.put(`/counseling-logs/${log_id}`, body, { headers });
    return res.data;
};

// 상담일지 생성 API
export const addCounselingLog = async ({
    booking_id,
    client_id,
    title,
    session_number,
    content,
    summary,
    action_plan,
    quick_memo,
}) => {
    const token = localStorage.getItem('access_token');
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const body = { booking_id, title, session_number, content, summary, action_plan, quick_memo };
    if (client_id !== null && client_id !== undefined) {
        body.client_id = client_id;
    }
    const res = await axiosInstance.post('/counseling-logs/create', body, { headers });
    return res.data;
};

// 상담사별 확정된 내담자 목록 및 일지 조회
export const getCounselorClients = async () => {
    const token = localStorage.getItem('access_token');
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    // 1. 예약 목록 조회
    const response = await axiosInstance.get('/booking/counselor-list', { headers });
    const data = Array.isArray(response.data) ? response.data : [];
    const confirmed = data.filter((r) => r.status === '확정됨');
    const uniqueClients = [];
    const seen = new Map();

    for (const r of confirmed) {
        const isManual = !r.client_id;
        const phoneKey = (r.client_phone || '').replace(/\D/g, '');
        let uniqueKey = null;
        if (!isManual) {
            uniqueKey = `id-${r.client_id}`;
        } else if (phoneKey) {
            uniqueKey = `phone-${phoneKey}`;
        } else {
            uniqueKey = `manual-${r.id}`;
        }

        if (seen.has(uniqueKey)) {
            const idx = seen.get(uniqueKey);
            uniqueClients[idx].bookings.push({
                id: r.id,
                date: r.date,
                time: r.time,
                status: r.status,
                order_id: r.order_id,
                survey_content: r.survey_content,
            });
            continue;
        }
        uniqueClients.push({
            id: isManual ? null : r.client_id,
            bookingId: r.id,
            name: r.client_name,
            birth: r.client_birth || '',
            gender: r.client_gender === 'female' ? '여' : '남',
            phone: r.client_phone || '',
            status: '진행 중',
            profile_img_url: r.client_profile_img_url || '',
            keywords: r.survey_content?.keywords || [],
            survey: {
                reason: r.survey_content?.reason || '선택 없음',
                prev: r.survey_content?.experience === 'yes' ? '있음' : '없음',
                goal: r.survey_content?.wants || '작성된 목표가 없습니다.',
            },
            logs: [],
            isManual,
            bookings: [
                {
                    id: r.id,
                    date: r.date,
                    time: r.time,
                    status: r.status,
                    order_id: r.order_id,
                    survey_content: r.survey_content,
                },
            ],
        });
        seen.set(uniqueKey, uniqueClients.length - 1);
    }

    try {
        const logPromises = uniqueClients.map(async (client) => {
            if (client.isManual) {
                try {
                    const logRes = await axiosInstance.get(`/counseling-logs/booking/${client.bookingId}`, { headers });
                    client.logs = logRes.data ? [logRes.data] : [];
                    const allKeywords = new Set();
                    client.logs.forEach((log) => {
                        if (log.keywords && Array.isArray(log.keywords)) {
                            log.keywords.forEach((k) => allKeywords.add(k));
                        }
                    });
                    client.keywords = Array.from(allKeywords);
                } catch {
                    client.logs = [];
                    client.keywords = [];
                }
                return;
            }
            try {
                const logRes = await axiosInstance.get(`/counseling-logs/client/${client.id}`, { headers });
                const allKeywords = new Set();
                client.logs = logRes.data.map((log) => {
                    if (log.keywords && Array.isArray(log.keywords)) {
                        log.keywords.forEach((k) => allKeywords.add(k));
                    }
                    return log;
                });
                client.keywords = Array.from(allKeywords);
            } catch {
                client.logs = [];
            }
        });
        await Promise.all(logPromises);
    } catch {
        return uniqueClients;
    }
    return uniqueClients;
};
