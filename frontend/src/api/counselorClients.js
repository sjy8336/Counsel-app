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
    const confirmed = response.data.filter((r) => r.status === '확정됨');

    const uniqueClients = [];
    const seen = new Set();

    // 2. 내담자별 중복 제거 및 기본 객체 생성
    for (const r of confirmed) {
        // 중복 체크 기준을 고유 ID(client_id)로 잡는 것이 안전합니다.
        if (!seen.has(r.client_id)) {
            uniqueClients.push({
                id: r.client_id, // ★ 중요: r.id(예약ID) 대신 내담자 유저 ID를 매핑합니다.
                bookingId: r.id, // 일지 작성 시 필요할 수 있으므로 예약 ID도 슬쩍 저장해둡니다.
                name: r.client_name,
                birth: r.client_birth || '',
                gender: r.client_gender === 'female' ? '여' : '남', // ENUM 분기 처리
                phone: r.client_phone || '',
                status: r.booking_status === 'confirmed' ? '진행 중' : '대기 중', // 상태 연동
                keywords: r.survey_content?.keywords || [],
                survey: {
                    reason: r.survey_content?.reason || '선택 없음',
                    prev: r.survey_content?.experience === 'yes' ? '있음' : '없음', // Survey.js 스펙 매칭
                    goal: r.survey_content?.wants || '작성된 목표가 없습니다.',
                },
                logs: [],
            });
            seen.add(r.client_id);
        }
    }

    // 3. 각 내담자들의 상담일지(logs)를 백엔드에서 병렬로 받아와 매핑
    try {
        const logPromises = uniqueClients.map(async (client) => {
            try {
                const logRes = await axios.get(`${API_BASE_URL}/counseling-logs/client/${client.id}`, { headers });

                // [수정] 내담자 고유의 키워드를 임시로 담아둘 Set 생성
                const allKeywords = new Set();

                client.logs = logRes.data.map((log) => {
                    // 백엔드가 준 데이터에 키워드가 배열로 들어있다면 Set에 무조건 추가
                    if (log.keywords && Array.isArray(log.keywords)) {
                        log.keywords.forEach((k) => allKeywords.add(k));
                    }

                    return {
                        id: log.id,
                        date: new Date(log.created_at).toLocaleDateString('ko-KR').slice(0, -1),
                        title: log.title,
                        content: log.content,
                        quickMemo: log.quick_memo,
                        keywords: log.keywords, // 일지 자체에도 키워드 보관
                    };
                });

                // Set에 누적된 키워드가 있다면 쓰고, 하나도 없다면 기존 설문조사 키워드나 기본값 부여
                client.keywords = allKeywords.size > 0 ? Array.from(allKeywords) : client.survey?.keywords || ['기본'];
            } catch (err) {
                console.error(`상담일지(${client.id}) 불러오기 실패:`, err);
                client.keywords = ['기본']; // 에러 시 안전장치
            }
        });

        await Promise.all(logPromises);
    } catch (error) {
        console.error('상담일지 데이터를 불러오는 중 오류 발생:', error);
    }

    // 💡 기존에 맨 밑에 있던 uniqueClients.forEach 합치기 루프는 통째로 지워주셔도 됩니다!
    return uniqueClients;
};