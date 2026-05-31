import axios from 'axios';
import { API_BASE_URL } from './axiosInstance';

export const getBlockedSlots = async (user_id, date) => {
    const params = { user_id };
    if (date) params.date = date;
    const res = await axios.get(`${API_BASE_URL}/blocked-slot`, { params });
    return res.data;
};

export const addBlockedSlot = async (slot) => {
    const token = localStorage.getItem('access_token');
    const res = await axios.post(`${API_BASE_URL}/blocked-slot`, slot, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    return res.data;
};

export const deleteBlockedSlot = async (block_id) => {
    const token = localStorage.getItem('access_token');
    const res = await axios.delete(`${API_BASE_URL}/blocked-slot/${block_id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    return res.data;
};
