import axiosInstance from './axiosInstance';

// 상담사 받은 문의 리스트
export const getReceivedInquiries = async () => {
    const token = localStorage.getItem('access_token');
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const res = await axiosInstance.get('/inquiries/received', { headers });
    return res.data;
};

// 내 문의내역 조회 (내가 작성한 문의 리스트)
export const getMyInquiries = async () => {
    const token = localStorage.getItem('access_token');
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const res = await axiosInstance.get('/inquiries/my', { headers });
    return res.data;
};

export const createInquiry = async ({ counselor_id, type, title, content }) => {
    const token = localStorage.getItem('access_token');
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    const body = { counselor_id, type, title, content };
    const res = await axiosInstance.post('/inquiries/create', body, { headers });
    return res.data;
};

// 상담사 답장 전송 API
export const replyInquiry = async (inquiry_id, answer) => {
    const token = localStorage.getItem('access_token');
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    const res = await axiosInstance.put(`/inquiries/${inquiry_id}/reply`, { answer }, { headers });
    return res.data;
};
