// 상담사 받은 문의 리스트
export const getReceivedInquiries = async () => {
    const token = localStorage.getItem('access_token');
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const res = await axios.get(`${API_BASE_URL}/inquiries/received`, { headers });
    return res.data;
};
// 내 문의내역 조회 (내가 작성한 문의 리스트)
export const getMyInquiries = async () => {
    const token = localStorage.getItem('access_token');
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const res = await axios.get(`${API_BASE_URL}/inquiries/my`, { headers });
    return res.data;
};
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const createInquiry = async ({ counselor_id, type, title, content }) => {
    const token = localStorage.getItem('access_token');
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    const body = { counselor_id, type, title, content };
    const res = await axios.post(`${API_BASE_URL}/inquiries/create`, body, { headers });
    return res.data;
};

// 상담사 답장 전송 API
export const replyInquiry = async (inquiry_id, answer) => {
    const token = localStorage.getItem('access_token');
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    
    const res = await axios.put(`${API_BASE_URL}/api/inquiries/${inquiry_id}/reply`, { answer }, { headers });
    return res.data;
};