import axios from 'axios';
import { API_BASE_URL } from './axiosInstance';

// 내담자(클라이언트)용 상담일지 전체 조회
export const getClientLogs = async (client_id) => {
    const token = localStorage.getItem('access_token');
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const res = await axios.get(`${API_BASE_URL}/counseling-logs/client-view/${client_id}`, { headers });
    return res.data;
};
