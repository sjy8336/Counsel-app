// 상담일지 삭제 API
export const deleteCounselingLog = async (log_id) => {
    const token = localStorage.getItem('access_token');
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    return axios.delete(`${API_BASE_URL}/counseling-logs/${log_id}`, { headers });
};
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// 상담일지 수정 API
export const putCounselingLog = async ({ log_id, content }) => {
    const token = localStorage.getItem('access_token');
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const res = await axios.put(`${API_BASE_URL}/counseling-logs/${log_id}`, null, {
        params: { content },
        headers,
    });
    return res.data;
};
// 상담일지 생성 API
export const addCounselingLog = async ({ booking_id, client_id, title, session_number, content, quick_memo }) => {
    const token = localStorage.getItem('access_token');
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const body = { booking_id, client_id, title, session_number, content, quick_memo };
    const res = await axios.post(`${API_BASE_URL}/counseling-logs/create`, body, { headers });
    return res.data;
};

// 상담사별 확정된 내담자 목록 및 일지 조회
export const getCounselorClients = async () => {
    const token = localStorage.getItem('access_token');
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    // 1. 예약 목록 조회
    const response = await axios.get(`${API_BASE_URL}/booking/counselor-list`, { headers });
    // status: '확정됨'만 필터링 (백엔드 반환값 기준)
    const data = Array.isArray(response.data) ? response.data : [];
    const confirmed = data.filter((r) => r.status === '확정됨');
    const uniqueClients = [];
    const seen = new Set();

    // 2. 내담자별 중복 제거 및 기본 객체 생성 (client_id가 null인 경우도 포함)
    for (const r of confirmed) {
        // 비회원 내담자(직접 입력)는 id를 예약 id로 대체, logs는 빈 배열, 상담일지 조회 생략
        const isManual = !r.client_id;
        const uniqueKey = isManual ? `manual-${r.id}` : r.client_id;
        if (!seen.has(uniqueKey)) {
            uniqueClients.push({
                id: isManual ? null : r.client_id, // 비회원은 null, 회원은 client_id
                bookingId: r.id, // 일지 작성 시 필요할 수 있으므로 예약 ID도 저장
                name: r.client_name,
                birth: r.client_birth || '',
                gender: r.client_gender === 'female' ? '여' : '남',
                phone: r.client_phone || '',
                status: r.booking_status === 'confirmed' ? '진행 중' : '대기 중',
                keywords: r.survey_content?.keywords || [],
                survey: {
                    reason: r.survey_content?.reason || '선택 없음',
                    prev: r.survey_content?.experience === 'yes' ? '있음' : '없음',
                    goal: r.survey_content?.wants || '작성된 목표가 없습니다.',
                },
                logs: [],
                isManual, // 직접입력 여부 플래그
            });
            seen.add(uniqueKey);
        }
    }

    // 3. 각 내담자들의 상담일지(logs)를 백엔드에서 병렬로 받아와 매핑 (직접입력 내담자는 생략)
    try {
        const logPromises = uniqueClients.map(async (client) => {
            if (client.isManual) return; // 직접입력 내담자는 상담일지 조회 생략
            try {
                const logRes = await axios.get(`${API_BASE_URL}/counseling-logs/client/${client.id}`, { headers });
                const allKeywords = new Set();
                client.logs = logRes.data.map((log) => {
                    if (log.keywords && Array.isArray(log.keywords)) {
                        log.keywords.forEach((k) => allKeywords.add(k));
                    }
                    return log;
                });
                client.keywords = Array.from(allKeywords);
            } catch (err) {
                client.logs = [];
            }
        });
        await Promise.all(logPromises);
    } catch (error) {
        console.error('상담일지 데이터를 불러오는 중 오류 발생:', error);
    }
    return uniqueClients;
};
