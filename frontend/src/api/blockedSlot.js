import axios from 'axios';

export const getBlockedSlots = async (user_id, date) => {
    const params = { user_id };
    if (date) params.date = date;
    const res = await axios.get(`/api/blocked-slot`, { params });
    return res.data;
};

export const addBlockedSlot = async (slot) => {
    const res = await axios.post(`/api/blocked-slot`, slot);
    return res.data;
};

export const deleteBlockedSlot = async (block_id) => {
    const res = await axios.delete(`/api/blocked-slot/${block_id}`);
    return res.data;
};
