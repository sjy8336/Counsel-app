import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../static/CounselorMyPage.css';
import {
    LayoutDashboard,
    Clock,
    Database,
    User,
    Settings,
    Bell,
    LogOut,
    MapPin,
    Check,
    X,
    ChevronRight,
    HeadphonesIcon,
    ArrowLeft,
    Calendar,
    MessageCircle,
    Search,
    Users,
    MessageSquare,
    AlertCircle,
    ShieldCheck,
    HelpCircle,
    FileText,
    ClipboardList,
    Send,
    MoreVertical,
} from 'lucide-react';

const todaySchedules = [
    {
        id: 1,
        time: '10:00',
        name: '김소현',
        room: '상담 1실',
        status: '상담 예정',
        note: '대인관계 갈등 심화',
        age: '24세',
        gender: '여성',
    },
    {
        id: 2,
        time: '14:00',
        name: '이민준',
        room: '상담 3실',
        status: '상담 예정',
        note: '직장 스트레스',
        age: '31세',
        gender: '남성',
    },
    {
        id: 3,
        time: '16:30',
        name: '박지영',
        room: '상담 2실',
        status: '상담 완료',
        note: '불안 증세 완화 중',
        age: '29세',
        gender: '여성',
    },
];

const clientConsultationHistory = [
    {
        id: 501,
        date: '2024.05.10',
        session: '11회차',
        type: '대면',
        title: '자존감 향상 및 자기 수용',
        content: '지난 과제였던 자기 긍정 일기를 성실히 작성함. 사회적 상황에서의 회피 반응이 소폭 감소한 것으로 보임.',
    },
    {
        id: 502,
        date: '2024.04.26',
        session: '10회차',
        type: '화상',
        title: '가족 관계 내 경계 설정',
        content:
            '부모님과의 갈등 상황에서 자신의 감정을 차분하게 전달하는 연습을 진행함. 정서적 독립에 대한 욕구가 강해짐.',
    },
    {
        id: 503,
        date: '2024.04.12',
        session: '9회차',
        type: '대면',
        title: '초기 불안 증세 조절',
        content: '호흡 명상을 통해 신체화 증상을 완화하는 기법을 익힘. 수면의 질이 이전보다 개선되었다고 보고함.',
    },
];

const pendingRequests = [
    { id: 101, name: '정현우', date: '2024.05.25', topic: '무기력증 및 우울감', age: '32세', gender: '남성' },
    { id: 102, name: '한수지', date: '2024.05.26', topic: '사회적 불안 장애', age: '26세', gender: '여성' },
];

const unreadMessages = [
    { id: 201, name: '최유진', content: '선생님, 오늘 숙제 다 했어요!', time: '10분 전' },
    { id: 202, name: '김소현', content: '상담실 위치가 바뀐 건가요?', time: '35분 전' },
    { id: 203, name: '이민준', content: '오늘 조금 늦을 것 같습니다.', time: '1시간 전' },
];

const notificationList = [
    {
        id: 301,
        title: '시스템 공지',
        content: '내일 오후 2시부터 서버 점검이 예정되어 있습니다.',
        time: '오전 09:00',
        type: 'notice',
    },
    { id: 302, title: '예약 확정', content: '한수지 님의 대면 상담이 승인되었습니다.', time: '어제', type: 'booking' },
    { id: 303, title: '메시지함', content: '내담자들과의 최근 대화 내용을 확인하세요.', time: '2일 전', type: 'msg' },
];

const clientCharts = [
    { id: 1, name: '김소현', age: '24세', lastVisit: '2024.05.20', count: 12, condition: '주의' },
    { id: 2, name: '이민준', age: '31세', lastVisit: '2024.05.21', count: 4, condition: '양호' },
    { id: 3, name: '박지영', age: '29세', lastVisit: '2024.05.15', count: 8, condition: '집중관리' },
    { id: 4, name: '정현우', age: '32세', lastVisit: '2024.05.22', count: 1, condition: '신규' },
];

const consultationThreads = [
    {
        id: 1,
        date: '2024년 5월 22일',
        inquiry: {
            title: '상담실 위치 변경 관련 문의',
            content:
                '안녕하세요 선생님! 다름이 아니라 상담실 위치가 바뀐 건지 여쭤보려고요. 이번 주 상담 때 어디로 가야 할지 확인 부탁드립니다.',
            time: '오후 2:15',
            status: '답변완료',
        },
        response: {
            content:
                '네, 소현 님! 이번 주부터는 2층 1실이 아니라 3층 4실에서 진행하게 되었습니다. 안내 문자가 늦어서 죄송합니다. 3층 엘리베이터에서 내리시면 바로 보이실 거예요.',
            time: '오후 2:20',
        },
    },
    {
        id: 2,
        date: '2024년 5월 20일',
        inquiry: {
            title: '다음 상담 일정 조정 요청',
            content:
                '선생님 안녕하세요. 다음 주 수요일 상담이 예정되어 있는데, 회사 일정이 급하게 잡혀서 목요일이나 금요일로 변경 가능할까요?',
            time: '오전 10:30',
            status: '답변완료',
        },
        response: {
            content:
                '안녕하세요 소현 님. 목요일 오후 3시 또는 금요일 오전 11시 중 편하신 시간으로 변경 도와드릴게요. 어느 시간이 괜찮으실까요?',
            time: '오전 11:05',
        },
    },
    {
        id: 3,
        date: '2024년 5월 18일',
        inquiry: {
            title: '과제 관련 질문',
            content:
                '지난 시간에 받은 감정 일기 작성하는 것 관련해서 궁금한 점이 있어요. 하루에 여러 번 작성해도 되나요?',
            time: '오후 9:45',
            status: '답변완료',
        },
        response: {
            content:
                '물론입니다! 하루에 여러 번 작성하셔도 좋아요. 오히려 감정 변화를 더 세밀하게 관찰하실 수 있어 도움이 될 거예요.',
            time: '오후 10:12',
        },
    },
];

const conditionBadgeClass = (c) => {
    if (c === '주의') return 'mw-badge mw-badge-pending';
    if (c === '집중관리') return 'mw-badge mw-badge-critical';
    return 'mw-badge mw-badge-done';
};

const SimpleHeader = ({ title, sub }) => (
    <div style={{ marginBottom: '32px' }}>
        <h2 className="mw-page-title">{title}</h2>
        <p className="mw-page-sub">{sub}</p>
    </div>
);

const App = () => {
    const [activeMenu, setActiveMenu] = useState('dashboard');
    const [currentView, setCurrentView] = useState('dashboard');
    const [selectedClient, setSelectedClient] = useState(null);
    const [activeChat, setActiveChat] = useState(null);
    const [showMoreMenu, setShowMoreMenu] = useState(false);
    const navigate = useNavigate();

    // 로고 클릭 시 홈으로 이동
    const goHome = () => {
        navigate('/');
        setActiveMenu('dashboard');
        setCurrentView('dashboard');
        setSelectedClient(null);
        setActiveChat(null);
    };

    const navTo = (id) => {
        setActiveMenu(id);
        setSelectedClient(null);
        setActiveChat(null);
        if (id === 'history') setCurrentView('scheduleDetail');
        else if (id === 'notifications') setCurrentView('notifications');
        else setCurrentView('dashboard');
    };

    const renderChatView = () => (
        <div className="mw-chat-container">
            <div className="mw-chat-header">
                <div className="mw-item-info" style={{ flex: 1 }}>
                    <ArrowLeft
                        size={22}
                        style={{ cursor: 'pointer', color: 'var(--mw-sub)' }}
                        onClick={() => setCurrentView('messageDetail')}
                    />
                    <div className="mw-item-avatar mw-item-avatar-primary" style={{ width: 42, height: 42 }}>
                        👤
                    </div>
                    <div style={{ flex: 1 }}>
                        <p className="mw-item-name">{activeChat?.sender || '내담자'}</p>
                        <p className="mw-item-sub">문의 {consultationThreads.length}건</p>
                    </div>
                </div>
                <div style={{ position: 'relative' }}>
                    <MoreVertical
                        size={20}
                        style={{ cursor: 'pointer', color: 'var(--mw-sub)' }}
                        onClick={() => setShowMoreMenu(!showMoreMenu)}
                    />
                    {showMoreMenu && (
                        <div className="mw-more-menu">
                            {[
                                { icon: <ShieldCheck size={16} />, label: '내담자 정보 보기' },
                                { icon: <AlertCircle size={16} />, label: '알림 설정' },
                            ].map(({ icon, label }) => (
                                <div key={label} className="mw-more-menu-item" onClick={() => setShowMoreMenu(false)}>
                                    {icon}
                                    <span>{label}</span>
                                </div>
                            ))}
                            <div className="mw-more-menu-item danger" onClick={() => setShowMoreMenu(false)}>
                                <X size={16} />
                                <span>신고하기</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <div className="mw-chat-body">
                {consultationThreads.map((thread) => (
                    <div key={thread.id}>
                        <div className="mw-chat-date-divider">
                            <span className="mw-chat-date-chip">{thread.date}</span>
                        </div>
                        <div className="mw-chat-thread">
                            <div className="mw-chat-thread-header">
                                <h4 className="mw-chat-thread-title">{thread.inquiry.title}</h4>
                                <span className="mw-badge-green">{thread.inquiry.status}</span>
                            </div>
                            <p className="mw-chat-thread-content">{thread.inquiry.content}</p>
                            <div className="mw-chat-thread-time">
                                <Clock size={13} color="var(--mw-sub)" />
                                <span className="mw-text-sub-sm">{thread.inquiry.time}</span>
                            </div>
                            {thread.response && (
                                <div className="mw-chat-reply">
                                    <div className="mw-chat-reply-header">
                                        <div className="mw-chat-reply-badge">✓</div>
                                        <span className="mw-chat-reply-label">상담사 답변</span>
                                    </div>
                                    <p className="mw-chat-reply-content">{thread.response.content}</p>
                                    <span className="mw-text-sub-sm">{thread.response.time}</span>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
            <div className="mw-chat-footer">
                <input className="mw-input mw-input-bare" style={{ flex: 1 }} placeholder="답변을 입력하세요..." />
                <button className="mw-send-btn">
                    <Send size={18} />
                </button>
            </div>
        </div>
    );

    const renderNotifications = () => (
        <>
            <SimpleHeader title="알림 센터" sub="최근 발생한 소식을 확인하세요." />
            <div className="mw-list-card">
                {notificationList.map((item) => (
                    <div
                        key={item.id}
                        className="mw-list-item"
                        onClick={() => item.type === 'msg' && setCurrentView('messageDetail')}
                    >
                        <div className="mw-item-info">
                            <div className="mw-item-avatar mw-item-avatar-primary">
                                {item.type === 'notice' ? (
                                    <AlertCircle size={20} />
                                ) : item.type === 'booking' ? (
                                    <Calendar size={20} />
                                ) : (
                                    <MessageSquare size={20} />
                                )}
                            </div>
                            <div>
                                <p className="mw-item-name">{item.title}</p>
                                <p className="mw-item-sub">{item.content}</p>
                            </div>
                        </div>
                        <div className="mw-inline-row">
                            <span className="mw-text-sub-sm">{item.time}</span>
                            <ChevronRight size={16} color="var(--mw-sub)" />
                        </div>
                    </div>
                ))}
            </div>
        </>
    );

    const renderDashboard = () => (
        <>
            <header className="mw-header">
                <div className="mw-profile-section">
                    <div className="mw-profile-img">🧔‍♂️</div>
                    <div>
                        <h2 className="mw-welcome-text">안녕하세요, 이은지 상담사님!</h2>
                        <p className="mw-welcome-sub">
                            오늘 예정된 대면 상담은 3건입니다. 센터 환경을 점검해 주세요. 🌿
                        </p>
                    </div>
                </div>
                <button className="mw-notif-btn" onClick={() => setCurrentView('notifications')}>
                    <Bell size={18} /> 알림 확인
                </button>
            </header>

            <div className="mw-stats-grid">
                <div
                    className="mw-stat-card"
                    onClick={() => {
                        setActiveMenu('history');
                        setCurrentView('scheduleDetail');
                    }}
                >
                    <div className="mw-stat-icon" style={{ backgroundColor: '#E8F5E9' }}>
                        <Calendar size={18} color="#66BB6A" />
                    </div>
                    <p className="mw-stat-label">오늘 예정 상담</p>
                    <p className="mw-stat-value">3 건</p>
                    <ChevronRight
                        size={16}
                        style={{ position: 'absolute', right: 24, bottom: 24, color: 'var(--mw-sub)' }}
                    />
                </div>
                <div
                    className="mw-stat-card"
                    onClick={() => {
                        setActiveMenu('report');
                        setCurrentView('pendingDetail');
                    }}
                >
                    <div className="mw-stat-icon" style={{ backgroundColor: '#FFF5E6' }}>
                        <Clock size={18} color="#FFB74D" />
                    </div>
                    <p className="mw-stat-label">승인 대기 요청</p>
                    <p className="mw-stat-value">2 건</p>
                    <ChevronRight
                        size={16}
                        style={{ position: 'absolute', right: 24, bottom: 24, color: 'var(--mw-sub)' }}
                    />
                </div>
                <div className="mw-stat-card" onClick={() => setCurrentView('messageDetail')}>
                    <div className="mw-stat-icon" style={{ backgroundColor: '#FFEBEE' }}>
                        <MessageCircle size={18} color="#EF5350" />
                    </div>
                    <p className="mw-stat-label">읽지 않은 메시지</p>
                    <p className="mw-stat-value">5 건</p>
                    <ChevronRight
                        size={16}
                        style={{ position: 'absolute', right: 24, bottom: 24, color: 'var(--mw-sub)' }}
                    />
                </div>
            </div>

            <div
                className="mw-banner"
                onClick={() => {
                    setActiveMenu('payment');
                    setCurrentView('dashboard');
                }}
            >
                <div>
                    <div className="mw-banner-label">NEXT SESSION</div>
                    <h3 className="mw-banner-title">오후 2:00 이민준 님</h3>
                    <p className="mw-banner-sub">대면 상담 • 상담 3실 • 4회차 진행 예정</p>
                </div>
                <button className="mw-banner-btn">
                    내담자 차트 확인 <ChevronRight size={18} />
                </button>
            </div>

            <div className="mw-section-header">
                <h3 className="mw-section-title">
                    <Clock size={22} /> 오늘의 상담 일정
                </h3>
            </div>
            <div className="mw-list-card">
                {todaySchedules.map((item) => (
                    <div
                        key={item.id}
                        className="mw-list-item"
                        onClick={() => {
                            setSelectedClient(item);
                            setCurrentView('clientHistory');
                        }}
                    >
                        <div className="mw-item-info">
                            <div className="mw-item-avatar" style={{ width: 50, fontWeight: 800 }}>
                                {item.time}
                            </div>
                            <div>
                                <p className="mw-item-name">
                                    {item.name} 님{' '}
                                    <span style={{ fontSize: 12, color: 'var(--mw-sub)', fontWeight: 'normal' }}>
                                        | {item.room}
                                    </span>
                                </p>
                                <p className="mw-item-sub-primary">{item.note}</p>
                            </div>
                        </div>
                        <div className="mw-inline-row mw-text-sub-sm">
                            <MapPin size={14} /> 대면 상담
                        </div>
                    </div>
                ))}
            </div>
        </>
    );

    const renderClientHistory = () => (
        <>
            <div className="mw-client-detail-header">
                <div className="mw-profile-img-lg">👤</div>
                <div>
                    <h2 className="mw-page-title" style={{ marginBottom: 4 }}>
                        {selectedClient?.name} 내담자 기록
                    </h2>
                    <p className="mw-page-sub" style={{ marginBottom: 0 }}>
                        {selectedClient?.gender} / {selectedClient?.age} • 현재 12회차 진행 중
                    </p>
                </div>
            </div>
            <div className="mw-stats-grid">
                <div className="mw-stat-card mw-stat-card-sm">
                    <p className="mw-stat-label">총 상담 횟수</p>
                    <p className="mw-stat-value-md">12회</p>
                </div>
                <div className="mw-stat-card mw-stat-card-sm">
                    <p className="mw-stat-label">주요 호소 문제</p>
                    <p className="mw-stat-value-sm">대인관계 스트레스</p>
                </div>
                <div className="mw-stat-card mw-stat-card-sm">
                    <p className="mw-stat-label">상태 분류</p>
                    <span className="mw-badge mw-badge-pending" style={{ display: 'inline-block', marginTop: 4 }}>
                        주의 관찰
                    </span>
                </div>
            </div>
            <div className="mw-section-header">
                <h3 className="mw-section-title">
                    <ClipboardList size={22} /> 상담 기록 리스트
                </h3>
            </div>
            <div className="mw-list-card">
                {clientConsultationHistory.map((h) => (
                    <div key={h.id} className="mw-history-item">
                        <div className="mw-history-header">
                            <div className="mw-inline-row">
                                <span style={{ fontSize: 15, fontWeight: 800, color: 'var(--mw-primary)' }}>
                                    {h.session}
                                </span>
                                <span style={{ fontSize: 14, color: 'var(--mw-sub)' }}>|</span>
                                <span style={{ fontSize: 15, fontWeight: 700 }}>{h.title}</span>
                            </div>
                            <span className="mw-text-sub-sm">
                                {h.date} ({h.type})
                            </span>
                        </div>
                        <p className="mw-history-content">{h.content}</p>
                    </div>
                ))}
            </div>
        </>
    );

    const renderContent = () => {
        if (currentView === 'notifications') return renderNotifications();
        if (currentView === 'clientHistory') return renderClientHistory();
        if (currentView === 'directChat') return renderChatView();
        if (currentView === 'messageDetail')
            return (
                <>
                    <SimpleHeader title="메시지함" sub="내담자들과의 최근 대화 내용을 확인하세요." />
                    <div className="mw-list-card">
                        {unreadMessages.map((msg) => (
                            <div
                                key={msg.id}
                                className="mw-list-item"
                                onClick={() => {
                                    setActiveChat({ sender: msg.name });
                                    setCurrentView('directChat');
                                }}
                            >
                                <div className="mw-item-info">
                                    <div className="mw-item-avatar" style={{ color: 'var(--mw-primary)' }}>
                                        <MessageSquare size={20} />
                                    </div>
                                    <div>
                                        <p className="mw-item-name">{msg.name} 님</p>
                                        <p className="mw-item-sub">{msg.content}</p>
                                    </div>
                                </div>
                                <span className="mw-text-sub-sm">{msg.time}</span>
                            </div>
                        ))}
                    </div>
                </>
            );

        switch (activeMenu) {
            case 'dashboard':
                return renderDashboard();
            case 'history':
                return (
                    <>
                        <SimpleHeader
                            title="오늘 예정 상담 상세"
                            sub="상담 일정을 클릭하면 해당 내담자의 상세 기록을 볼 수 있습니다."
                        />
                        <div className="mw-list-card">
                            {todaySchedules.map((item) => (
                                <div key={item.id} className="mw-list-item">
                                    <div className="mw-item-info">
                                        <div className="mw-time-col">{item.time}</div>
                                        <div>
                                            <p className="mw-item-name">
                                                {item.name} 내담자{' '}
                                                <span style={{ fontSize: 13, color: 'var(--mw-sub)', fontWeight: 400 }}>
                                                    ( {item.room} )
                                                </span>
                                            </p>
                                            <p
                                                className="mw-item-sub"
                                                style={{ display: 'flex', alignItems: 'center', gap: 4 }}
                                            >
                                                <MapPin size={14} /> 대면 상담
                                            </p>
                                        </div>
                                    </div>
                                    <div className="mw-inline-row">
                                        <span
                                            className={
                                                item.status === '상담 완료' ? 'mw-badge mw-badge-done' : 'mw-badge'
                                            }
                                        >
                                            {item.status}
                                        </span>
                                        <ChevronRight size={18} color="var(--mw-sub)" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                );
            case 'payment':
                return (
                    <>
                        <SimpleHeader
                            title="내담자 차트 데이터베이스"
                            sub="관리 중인 내담자의 상담 이력과 상태를 관리합니다."
                        />
                        <div className="mw-search-wrap">
                            <input
                                className="mw-input mw-input-bare"
                                placeholder="내담자 이름 혹은 연락처로 검색하세요."
                            />
                            <Search size={20} className="mw-search-icon" />
                        </div>
                        <div className="mw-list-card">
                            {clientCharts.map((c) => (
                                <div
                                    key={c.id}
                                    className="mw-list-item"
                                    onClick={() => {
                                        setSelectedClient(c);
                                        setCurrentView('clientHistory');
                                    }}
                                >
                                    <div className="mw-item-info">
                                        <div className="mw-item-avatar">
                                            <User size={20} />
                                        </div>
                                        <div>
                                            <p className="mw-item-name">
                                                {c.name} ({c.age})
                                            </p>
                                            <p className="mw-item-sub">
                                                최근 방문: {c.lastVisit} | 총 {c.count}회 상담
                                            </p>
                                        </div>
                                    </div>
                                    <div className="mw-inline-row">
                                        <span className={conditionBadgeClass(c.condition)}>{c.condition}</span>
                                        <ChevronRight size={18} color="var(--mw-sub)" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                );
            case 'report':
                return (
                    <>
                        <SimpleHeader title="승인 대기 요청 상세" sub="새로운 상담 신청 내역을 검토하세요." />
                        <div className="mw-request-grid">
                            {pendingRequests.map((req) => (
                                <div key={req.id} className="mw-detail-card">
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                                        <h4 style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>
                                            {req.name} ({req.gender}, {req.age})
                                        </h4>
                                        <span className="mw-badge">대기중</span>
                                    </div>
                                    <p style={{ fontSize: 14, color: 'var(--mw-sub)', margin: '0 0 8px' }}>
                                        신청일: {req.date}
                                    </p>
                                    <p className="mw-text-primary-bold">"{req.topic}"</p>
                                    <div className="mw-btn-row">
                                        <button className="mw-btn-accept">
                                            <Check size={16} /> 수락
                                        </button>
                                        <button className="mw-btn-decline">
                                            <X size={16} /> 반려
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                );
            case 'settings':
                return (
                    <>
                        <SimpleHeader title="시스템 설정" sub="관리자 프로필 및 센터 운영 환경을 설정합니다." />
                        <div className="mw-detail-card">
                            <h4 style={{ fontSize: 18, fontWeight: 800, margin: '0 0 20px' }}>내 프로필 설정</h4>
                            <div className="mw-settings-profile-row">
                                <div className="mw-profile-img-xl">🧔‍♂️</div>
                                <div style={{ flex: 1 }}>
                                    <p className="mw-field-label">상담사 성함</p>
                                    <input className="mw-input mw-input-bare" defaultValue="이은지" />
                                </div>
                            </div>
                            <div className="mw-settings-row">
                                <div>
                                    <p className="mw-field-label">전문 분야</p>
                                    <input className="mw-input mw-input-bare" defaultValue="성인 우울, 불안 장애" />
                                </div>
                                <div>
                                    <p className="mw-field-label">소속 센터</p>
                                    <input className="mw-input mw-input-bare" defaultValue="마인드웰 서울 강남센터" />
                                </div>
                            </div>
                            <button className="mw-btn-accept" style={{ maxWidth: 120, marginTop: 20 }}>
                                저장하기
                            </button>
                        </div>
                    </>
                );
            case 'customer':
                return (
                    <>
                        <SimpleHeader title="고객 지원" sub="이용 중 불편한 점이 있으신가요?" />
                        <div className="mw-support-grid">
                            {[
                                { icon: <HelpCircle size={24} />, label: '자주 묻는 질문' },
                                { icon: <MessageCircle size={24} />, label: '1:1 문의하기' },
                                { icon: <FileText size={24} />, label: '가이드북' },
                            ].map(({ icon, label }) => (
                                <div key={label} className="mw-support-card">
                                    <div className="mw-support-icon">{icon}</div>
                                    <p style={{ fontWeight: 700, margin: 0 }}>{label}</p>
                                </div>
                            ))}
                        </div>
                    </>
                );
            case 'notifications':
                return renderNotifications();
            default:
                return renderDashboard();
        }
    };

    const navItems = [
        { id: 'dashboard', icon: <LayoutDashboard size={20} />, label: '대시보드' },
        { id: 'history', icon: <Clock size={20} />, label: '오늘의 일정' },
        { id: 'payment', icon: <Database size={20} />, label: '내담자 차트' },
        { id: 'report', icon: <User size={20} />, label: '신규 접수' },
        { id: 'notifications', icon: <Bell size={20} />, label: '알림센터' },
        { id: 'settings', icon: <Settings size={20} />, label: '설정' },
    ];

    return (
        <div className="mw-container">
            <aside className="mw-sidebar">
                <div className="mw-logo" onClick={goHome}>
                    <h1 className="mw-logo-title">MINDWELL</h1>
                    <p className="mw-logo-sub">COUNSELOR ADMIN</p>
                </div>
                <nav className="mw-nav">
                    {navItems.map((item) => (
                        <div
                            key={item.id}
                            className={`mw-nav-item${activeMenu === item.id ? ' active' : ''}`}
                            onClick={() => navTo(item.id)}
                        >
                            {item.icon}
                            <span>{item.label}</span>
                        </div>
                    ))}
                </nav>
                <div className="mw-sidebar-footer">
                    <div
                        className={`mw-footer-item${activeMenu === 'customer' ? ' active' : ''}`}
                        onClick={() => navTo('customer')}
                    >
                        <HeadphonesIcon size={20} />
                        <span>고객센터</span>
                    </div>
                    <div className="mw-footer-item danger">
                        <LogOut size={20} />
                        <span>로그아웃</span>
                    </div>
                </div>
            </aside>
            <main className="mw-main">{renderContent()}</main>
        </div>
    );
};

export default App;
