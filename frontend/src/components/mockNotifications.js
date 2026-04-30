// 간단한 알림 mock 데이터 (실제 서비스에서는 API로 대체)
export const mockNotifications = [
    {
        id: 1,
        type: 'booking',
        title: '예약 확정',
        desc: '상담 예약이 확정되었습니다.',
        time: '5분 전',
        unread: true,
    },
    {
        id: 2,
        type: 'msg',
        title: '새 메시지',
        desc: '상담사에게 새 메시지가 도착했습니다.',
        time: '10분 전',
        unread: true,
    },
    {
        id: 3,
        type: 'notice',
        title: '시스템 공지',
        desc: '내일 오후 2시 서버 점검 예정',
        time: '1일 전',
        unread: false,
    },
];
