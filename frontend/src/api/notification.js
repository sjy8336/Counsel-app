import axios from 'axios';

export async function getNotifications(token) {
    return axios.get('/api/notifications', {
        headers: { Authorization: `Bearer ${token}` },
    });
}

export async function markNotificationRead(notifId, token) {
    return axios.post(
        `/api/notifications/${notifId}/read`,
        {},
        {
            headers: { Authorization: `Bearer ${token}` },
        }
    );
}
