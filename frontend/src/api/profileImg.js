import axiosInstance from './axiosInstance';

export const uploadProfileImg = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const token = localStorage.getItem('access_token');
    const response = await axiosInstance.post('/upload/profile-image', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
    });
    return response.data;
};
