import axiosInstance from './axiosInstance';

export async function getNotifications(token) {
    return axiosInstance.get('/notifications', {
        headers: { Authorization: `Bearer ${token}` },
    });
}

export async function markNotificationRead(notifId, token) {
    return axiosInstance.post(
        `/notifications/${notifId}/read`,
        {},
        {
            headers: { Authorization: `Bearer ${token}` },
        }
    );
}
