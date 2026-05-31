import axiosInstance from './axiosInstance';

export const getBlockedSlots = async (user_id, date) => {
    const params = { user_id };
    if (date) params.date = date;
    const res = await axiosInstance.get('/blocked-slot', { params });
    return res.data;
};

export const addBlockedSlot = async (slot) => {
    const token = localStorage.getItem('access_token');
    const res = await axiosInstance.post('/blocked-slot', slot, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    return res.data;
};

export const deleteBlockedSlot = async (block_id) => {
    const token = localStorage.getItem('access_token');
    const res = await axiosInstance.delete(`/blocked-slot/${block_id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    return res.data;
};
