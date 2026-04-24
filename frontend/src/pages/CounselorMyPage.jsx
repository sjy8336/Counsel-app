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
    Menu,
} from 'lucide-react';

const todaySchedules = [
    {
        id: 1,
        time: '10:00',
        name: '김소현',
        type: '대면 상담',
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
        type: '대면 상담',
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
        type: '대면 상담',
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

const getBadgeClass = (condition) => {
    const map = {
        주의: 'mw-badge mw-badge-warn',
        집중관리: 'mw-badge mw-badge-danger',
        신규: 'mw-badge mw-badge-new',
        양호: 'mw-badge mw-badge-done',
        '상담 완료': 'mw-badge mw-badge-done',
        확인: 'mw-badge mw-badge-done',
    };
    return map[condition] || 'mw-badge mw-badge-active';
};

const SimpleHeader = ({ title, sub }) => (
    <div style={{ marginBottom: '32px' }}>
        <h2 className="mw-detail-title">{title}</h2>
        <p className="mw-detail-sub">{sub}</p>
    </div>
);

const App = () => {
    const navigate = useNavigate();
    const [activeMenu, setActiveMenu] = useState('dashboard');
    const [currentView, setCurrentView] = useState('dashboard');
    const [selectedClient, setSelectedClient] = useState(null);
    const [activeChat, setActiveChat] = useState(null);
    const [showMoreMenu, setShowMoreMenu] = useState(false);
    const [isCounselorRegistered, setIsCounselorRegistered] = useState(false);
    const [careers, setCareers] = useState([
        { id: 1, startDate: '2019-03', endDate: '2022-06', description: '서울심리상담센터 상담사' },
        { id: 2, startDate: '2022-07', endDate: '현재', description: '마인드웰 서울 강남센터 수석 상담사' },
    ]);
    const [educations, setEducations] = useState([
        { id: 1, startDate: '2013-03', endDate: '2017-02', school: '서울대학교 심리학과', degree: '학사' },
        { id: 2, startDate: '2017-03', endDate: '2019-02', school: '서울대학교 심리학과', degree: '석사' },
    ]);
    const [certificates, setCertificates] = useState([
        { id: 1, name: '임상심리전문가 1급', issuer: '한국심리학회', date: '2019-06' },
        { id: 2, name: '상담심리사 1급', issuer: '한국상담심리학회', date: '2020-03' },
    ]);
    const [workingDays, setWorkingDays] = useState([
        { day: '월', active: true, startTime: '09:00', endTime: '18:00' },
        { day: '화', active: true, startTime: '09:00', endTime: '18:00' },
        { day: '수', active: true, startTime: '09:00', endTime: '18:00' },
        { day: '목', active: true, startTime: '09:00', endTime: '18:00' },
        { day: '금', active: true, startTime: '09:00', endTime: '18:00' },
        { day: '토', active: false, startTime: '09:00', endTime: '18:00' },
        { day: '일', active: false, startTime: '09:00', endTime: '18:00' },
    ]);
    const [holidays, setHolidays] = useState(['2024-06-01', '2024-06-15']);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
    const [newHolidayDate, setNewHolidayDate] = useState('');

    const goHome = () => {
        navigate('/');
        setActiveMenu('dashboard');
        setCurrentView('dashboard');
        setSelectedClient(null);
        setActiveChat(null);
    };

    const navItems = [
        { id: 'dashboard', icon: <LayoutDashboard size={20} />, label: '대시보드' },
        { id: 'history', icon: <Clock size={20} />, label: '오늘의 일정' },
        { id: 'payment', icon: <Database size={20} />, label: '내담자 차트' },
        { id: 'report', icon: <User size={20} />, label: '신규 접수' },
        { id: 'notifications', icon: <Bell size={20} />, label: '알림센터' },
        { id: 'settings', icon: <Settings size={20} />, label: '설정' },
    ];

    const renderChatView = () => (
        <div className="mw-chat-container">
            <div className="mw-chat-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1 }}>
                    <ArrowLeft
                        size={22}
                        style={{ cursor: 'pointer', color: 'var(--mw-sub)' }}
                        onClick={() => setCurrentView('messageDetail')}
                    />
                    <div
                        className="mw-item-avatar"
                        style={{ width: 42, height: 42, background: 'var(--mw-primary-light)' }}
                    >
                        👤
                    </div>
                    <div style={{ flex: 1 }}>
                        <p className="mw-item-name" style={{ marginBottom: 2 }}>
                            {activeChat?.sender || '내담자'}
                        </p>
                        <p className="mw-item-sub" style={{ fontSize: 12 }}>
                            문의 {consultationThreads.length}건
                        </p>
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
                            <div className="mw-more-menu-item" onClick={() => setShowMoreMenu(false)}>
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
                        <div className="mw-chat-thread-date">
                            <span className="mw-chat-date-chip">{thread.date}</span>
                        </div>
                        <div className="mw-chat-thread-body">
                            <div className="mw-chat-thread-header">
                                <h4 className="mw-chat-thread-title">{thread.inquiry.title}</h4>
                                <span className="mw-badge mw-badge-green">{thread.inquiry.status}</span>
                            </div>
                            <p className="mw-chat-thread-content">{thread.inquiry.content}</p>
                            <div className="mw-chat-time">
                                <Clock size={13} />
                                <span>{thread.inquiry.time}</span>
                            </div>
                            {thread.response && (
                                <div className="mw-chat-response">
                                    <div className="mw-chat-response-label">
                                        <div className="mw-chat-response-icon">✓</div>
                                        <span className="mw-chat-response-tag">상담사 답변</span>
                                    </div>
                                    <p className="mw-chat-response-text">{thread.response.content}</p>
                                    <span className="mw-chat-response-time">{thread.response.time}</span>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
            <div className="mw-chat-footer">
                <input
                    className="mw-input"
                    style={{ margin: 0, flex: 1, background: '#FAFAFA' }}
                    placeholder="답변을 입력하세요..."
                />
                <button className="mw-btn-primary mw-chat-send-btn">
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
                            <div className="mw-item-avatar mw-notif-icon">
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
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <p style={{ fontSize: 12, color: 'var(--mw-sub)', margin: 0 }}>{item.time}</p>
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
                        <h2 className="mw-welcome">안녕하세요, 이은지 상담사님!</h2>
                        <p className="mw-welcome-sub">
                            오늘 예정된 대면 상담은 3건입니다. 센터 환경을 점검해 주세요. 🌿
                        </p>
                    </div>
                </div>
                <button className="mw-notif-btn" onClick={() => setCurrentView('notifications')}>
                    <Bell size={18} />
                    알림 확인
                </button>
            </header>
            <div className="mw-stats-grid">
                {[
                    {
                        icon: <Calendar size={18} color="#66BB6A" />,
                        bg: '#E8F5E9',
                        label: '오늘 예정 상담',
                        value: '3 건',
                        onClick: () => {
                            setActiveMenu('history');
                            setCurrentView('scheduleDetail');
                        },
                    },
                    {
                        icon: <Clock size={18} color="#FFB74D" />,
                        bg: '#FFF5E6',
                        label: '승인 대기 요청',
                        value: '2 건',
                        onClick: () => {
                            setActiveMenu('report');
                            setCurrentView('pendingDetail');
                        },
                    },
                    {
                        icon: <MessageCircle size={18} color="#EF5350" />,
                        bg: '#FFEBEE',
                        label: '읽지 않은 메시지',
                        value: '5 건',
                        onClick: () => setCurrentView('messageDetail'),
                    },
                ].map(({ icon, bg, label, value, onClick }) => (
                    <div key={label} className="mw-stat-card" onClick={onClick}>
                        <div className="mw-stat-icon" style={{ background: bg }}>
                            {icon}
                        </div>
                        <p className="mw-stat-label">{label}</p>
                        <p className="mw-stat-value">{value}</p>
                        <ChevronRight
                            size={16}
                            style={{ position: 'absolute', right: 24, bottom: 24, color: 'var(--mw-sub)' }}
                        />
                    </div>
                ))}
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
                            <div className="mw-item-avatar mw-sched-time">{item.time}</div>
                            <div>
                                <p className="mw-item-name">
                                    {item.name} 님{' '}
                                    <span style={{ fontSize: 12, color: 'var(--mw-sub)', fontWeight: 'normal' }}>
                                        | {item.room}
                                    </span>
                                </p>
                                <p className="mw-item-sub mw-sched-note">{item.note}</p>
                            </div>
                        </div>
                        <div className="mw-loc-row">
                            <MapPin size={14} /> 대면 상담
                        </div>
                    </div>
                ))}
            </div>
        </>
    );

    const renderClientHistory = () => (
        <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
                <div className="mw-profile-img" style={{ width: 64, height: 64 }}>
                    👤
                </div>
                <div>
                    <h2 className="mw-detail-title" style={{ marginBottom: 4 }}>
                        {selectedClient?.name} 내담자 기록
                    </h2>
                    <p className="mw-detail-sub" style={{ margin: 0 }}>
                        {selectedClient?.gender} / {selectedClient?.age} • 현재 12회차 진행 중
                    </p>
                </div>
            </div>
            <div className="mw-client-stats">
                {[
                    { label: '총 상담 횟수', value: '12회' },
                    { label: '주요 호소 문제', value: '대인관계 스트레스' },
                ].map(({ label, value }) => (
                    <div key={label} className="mw-stat-card" style={{ padding: 20 }}>
                        <p className="mw-stat-label">{label}</p>
                        <p className="mw-stat-value" style={{ fontSize: label === '주요 호소 문제' ? 15 : 20 }}>
                            {value}
                        </p>
                    </div>
                ))}
                <div className="mw-stat-card" style={{ padding: 20 }}>
                    <p className="mw-stat-label">상태 분류</p>
                    <span className="mw-badge mw-badge-active" style={{ display: 'inline-block', marginTop: 4 }}>
                        주의 관찰
                    </span>
                </div>
            </div>
            <div className="mw-section-header">
                <h3 className="mw-section-title">
                    <ClipboardList size={22} /> 상담 기록 리스트
                </h3>
                <button className="mw-btn-outline">
                    <ClipboardList size={16} />
                    기록 추가
                </button>
            </div>
            <div className="mw-list-card">
                {clientConsultationHistory.map((h) => (
                    <div key={h.id} className="mw-history-item">
                        <div className="mw-history-header">
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <span style={{ fontSize: 15, fontWeight: 800, color: 'var(--mw-primary)' }}>
                                    {h.session}
                                </span>
                                <span style={{ fontSize: 14, color: 'var(--mw-sub)' }}>|</span>
                                <span style={{ fontSize: 15, fontWeight: 700 }}>{h.title}</span>
                            </div>
                            <span style={{ fontSize: 13, color: 'var(--mw-sub)' }}>
                                {h.date} ({h.type})
                            </span>
                        </div>
                        <p className="mw-history-content">{h.content}</p>
                    </div>
                ))}
            </div>
        </>
    );

    const renderSchedule = () => (
        <>
            <SimpleHeader
                title="오늘 예정 상담 상세"
                sub="상담 일정을 클릭하면 해당 내담자의 상세 기록을 볼 수 있습니다."
            />
            <div className="mw-list-card">
                {todaySchedules.map((item) => (
                    <div key={item.id} className="mw-list-item">
                        <div className="mw-item-info">
                            <div className="mw-item-avatar mw-sched-time">{item.time}</div>
                            <div>
                                <p className="mw-item-name">
                                    {item.name} 내담자{' '}
                                    <span style={{ fontSize: 13, color: 'var(--mw-sub)', fontWeight: 400 }}>
                                        ( {item.room} )
                                    </span>
                                </p>
                                <p className="mw-item-sub mw-loc-row">
                                    <MapPin size={14} /> 대면 상담
                                </p>
                            </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <span className={getBadgeClass(item.status)}>{item.status}</span>
                            <ChevronRight size={18} color="var(--mw-sub)" />
                        </div>
                    </div>
                ))}
            </div>
        </>
    );

    const renderClientDB = () => (
        <>
            <SimpleHeader title="내담자 차트 데이터베이스" sub="관리 중인 내담자의 상담 이력과 상태를 관리합니다." />
            <div className="mw-search-wrap">
                <input className="mw-input" style={{ margin: 0 }} placeholder="내담자 이름 혹은 연락처로 검색하세요." />
                <Search size={20} className="mw-search-icon" />
            </div>
            <div className="mw-list-card">
                {clientCharts.map((client) => (
                    <div
                        key={client.id}
                        className="mw-list-item"
                        onClick={() => {
                            setSelectedClient(client);
                            setCurrentView('clientHistory');
                        }}
                    >
                        <div className="mw-item-info">
                            <div className="mw-item-avatar">
                                <User size={20} />
                            </div>
                            <div>
                                <p className="mw-item-name">
                                    {client.name} ({client.age})
                                </p>
                                <p className="mw-item-sub">
                                    최근 방문: {client.lastVisit} | 총 {client.count}회 상담
                                </p>
                            </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <span className={getBadgeClass(client.condition)}>{client.condition}</span>
                            <ChevronRight size={18} color="var(--mw-sub)" />
                        </div>
                    </div>
                ))}
            </div>
        </>
    );

    const renderPending = () => (
        <>
            <SimpleHeader title="승인 대기 요청 상세" sub="새로운 상담 신청 내역을 검토하세요." />
            <div className="mw-grid-request">
                {pendingRequests.map((req) => (
                    <div key={req.id} className="mw-detail-card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                            <h4 style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>
                                {req.name} ({req.gender}, {req.age})
                            </h4>
                            <span className="mw-badge mw-badge-pending">대기중</span>
                        </div>
                        <p style={{ fontSize: 14, color: 'var(--mw-sub)', margin: '0 0 8px' }}>신청일: {req.date}</p>
                        <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--mw-primary)', margin: '0 0 24px' }}>
                            "{req.topic}"
                        </p>
                        <div className="mw-btn-row">
                            <button className="mw-btn-primary" style={{ flex: 1 }}>
                                <Check size={16} /> 수락
                            </button>
                            <button className="mw-btn-secondary" style={{ flex: 1 }}>
                                <X size={16} /> 반려
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </>
    );

    const renderSettings = () => {
        if (!isCounselorRegistered)
            return (
                <>
                    <SimpleHeader title="설정" sub="상담사 프로필 등록 및 시스템 환경을 설정합니다." />
                    <div className="mw-detail-card" style={{ textAlign: 'center', padding: '60px 40px' }}>
                        <div
                            style={{
                                width: 80,
                                height: 80,
                                borderRadius: 20,
                                background: 'var(--mw-primary-light)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto 24px',
                                fontSize: 36,
                            }}
                        >
                            👤
                        </div>
                        <h3 style={{ fontSize: 22, fontWeight: 800, margin: '0 0 12px' }}>
                            상담사 프로필을 등록해주세요
                        </h3>
                        <p style={{ fontSize: 15, color: 'var(--mw-sub)', margin: '0 0 32px', lineHeight: 1.6 }}>
                            내담자가 상담사님의 정보를 확인하고 예약할 수 있도록
                            <br />
                            프로필 정보를 입력해주세요.
                        </p>
                        <button
                            className="mw-btn-primary"
                            style={{ maxWidth: 200, padding: '16px 32px', fontSize: 16, margin: '0 auto' }}
                            onClick={() => setIsCounselorRegistered(true)}
                        >
                            상담사 등록하기
                        </button>
                    </div>
                </>
            );

        return (
            <>
                <SimpleHeader title="설정" sub="프로필 정보 및 상담 일정을 관리합니다." />

                <div className="mw-detail-card">
                    <h4 className="mw-card-header">
                        <User size={20} color="var(--mw-primary)" />
                        상담사 프로필 수정
                    </h4>
                    <div className="mw-profile-upload">
                        <div className="mw-profile-img-lg">
                            🧔‍♂️
                            <button className="mw-profile-edit-btn">
                                <Settings size={16} />
                            </button>
                        </div>
                        <div style={{ flex: 1 }}>
                            <p style={{ fontSize: 13, color: 'var(--mw-sub)', margin: '0 0 6px' }}>프로필 사진</p>
                            <p style={{ fontSize: 14, fontWeight: 600, margin: 0 }}>사진을 클릭하여 업로드</p>
                        </div>
                    </div>
                    <div className="mw-grid-2" style={{ marginBottom: 20 }}>
                        {[
                            ['이름', '이은지'],
                            ['연락처', '010-1234-5678'],
                        ].map(([label, val]) => (
                            <div key={label}>
                                <p className="mw-field-label">{label}</p>
                                <input className="mw-input" defaultValue={val} />
                            </div>
                        ))}
                    </div>
                    <div className="mw-grid-2" style={{ marginBottom: 20 }}>
                        {[
                            ['전화번호', '02-1234-5678'],
                            ['전문 분야', '성인 우울, 불안 장애'],
                        ].map(([label, val]) => (
                            <div key={label}>
                                <p className="mw-field-label">{label}</p>
                                <input className="mw-input" defaultValue={val} />
                            </div>
                        ))}
                    </div>

                    <div className="mw-section-divider">
                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginBottom: 16,
                            }}
                        >
                            <p className="mw-field-label">경력 사항</p>
                            <button
                                className="mw-btn-outline-sm"
                                onClick={() =>
                                    setCareers([
                                        ...careers,
                                        { id: Date.now(), startDate: '', endDate: '', description: '' },
                                    ])
                                }
                            >
                                + 추가
                            </button>
                        </div>
                        {careers.map((c, idx) => (
                            <div key={c.id} className={`mw-row-card${c.active ? '' : ''}`}>
                                <div className="mw-career-grid">
                                    {[
                                        ['시작', 'month', c.startDate, false],
                                        ['종료', 'month', c.endDate === '현재' ? '' : c.endDate, c.endDate === '현재'],
                                    ].map(([label, type, val, disabled]) => (
                                        <div key={label}>
                                            <p className="mw-field-label-sm">{label}</p>
                                            <input
                                                type={type}
                                                className="mw-input mw-input-sm"
                                                defaultValue={val}
                                                disabled={disabled}
                                            />
                                        </div>
                                    ))}
                                    <div>
                                        <p className="mw-field-label-sm">경력 내용</p>
                                        <input
                                            type="text"
                                            className="mw-input mw-input-sm"
                                            defaultValue={c.description}
                                            placeholder="예: OO센터 상담사"
                                        />
                                    </div>
                                    <button
                                        className="mw-btn-icon"
                                        onClick={() => setCareers(careers.filter((x) => x.id !== c.id))}
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                                <div className="mw-checkbox-row">
                                    <input
                                        type="checkbox"
                                        id={`cur-${c.id}`}
                                        defaultChecked={c.endDate === '현재'}
                                        onChange={(e) =>
                                            setCareers(
                                                careers.map((x) =>
                                                    x.id === c.id
                                                        ? { ...x, endDate: e.target.checked ? '현재' : '' }
                                                        : x
                                                )
                                            )
                                        }
                                    />
                                    <label htmlFor={`cur-${c.id}`}>현재 진행중</label>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mw-section-divider">
                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginBottom: 16,
                            }}
                        >
                            <p className="mw-field-label">자격증</p>
                            <button
                                className="mw-btn-outline-sm"
                                onClick={() =>
                                    setCertificates([
                                        ...certificates,
                                        { id: Date.now(), name: '', issuer: '', date: '' },
                                    ])
                                }
                            >
                                + 추가
                            </button>
                        </div>
                        {certificates.map((cert) => (
                            <div key={cert.id} className="mw-row-card">
                                <div className="mw-cert-grid">
                                    <div>
                                        <p className="mw-field-label-sm">자격증명</p>
                                        <input
                                            type="text"
                                            className="mw-input mw-input-sm"
                                            defaultValue={cert.name}
                                            placeholder="예: 임상심리전문가 1급"
                                        />
                                    </div>
                                    <div>
                                        <p className="mw-field-label-sm">발급 기관</p>
                                        <input
                                            type="text"
                                            className="mw-input mw-input-sm"
                                            defaultValue={cert.issuer}
                                            placeholder="예: 한국심리학회"
                                        />
                                    </div>
                                    <div>
                                        <p className="mw-field-label-sm">취득일</p>
                                        <input type="month" className="mw-input mw-input-sm" defaultValue={cert.date} />
                                    </div>
                                    <button
                                        className="mw-btn-icon"
                                        onClick={() => setCertificates(certificates.filter((x) => x.id !== cert.id))}
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mw-section-divider">
                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginBottom: 16,
                            }}
                        >
                            <p className="mw-field-label">학력 사항</p>
                            <button
                                className="mw-btn-outline-sm"
                                onClick={() =>
                                    setEducations([
                                        ...educations,
                                        { id: Date.now(), startDate: '', endDate: '', school: '', degree: '' },
                                    ])
                                }
                            >
                                + 추가
                            </button>
                        </div>
                        {educations.map((edu) => (
                            <div key={edu.id} className="mw-row-card">
                                <div className="mw-edu-grid">
                                    <div>
                                        <p className="mw-field-label-sm">시작</p>
                                        <input
                                            type="month"
                                            className="mw-input mw-input-sm"
                                            defaultValue={edu.startDate}
                                        />
                                    </div>
                                    <div>
                                        <p className="mw-field-label-sm">졸업</p>
                                        <input
                                            type="month"
                                            className="mw-input mw-input-sm"
                                            defaultValue={edu.endDate}
                                        />
                                    </div>
                                    <div>
                                        <p className="mw-field-label-sm">학교명 / 전공</p>
                                        <input
                                            type="text"
                                            className="mw-input mw-input-sm"
                                            defaultValue={edu.school}
                                            placeholder="예: 서울대학교 심리학과"
                                        />
                                    </div>
                                    <div>
                                        <p className="mw-field-label-sm">학위</p>
                                        <input
                                            type="text"
                                            className="mw-input mw-input-sm"
                                            defaultValue={edu.degree}
                                            placeholder="학사/석사/박사"
                                        />
                                    </div>
                                    <button
                                        className="mw-btn-icon"
                                        onClick={() => setEducations(educations.filter((x) => x.id !== edu.id))}
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mw-grid-2" style={{ marginBottom: 20 }}>
                        {[
                            ['상담소명', '마인드웰 서울 강남센터'],
                            ['상담소 주소', '서울시 강남구 테헤란로 123'],
                        ].map(([label, val]) => (
                            <div key={label}>
                                <p className="mw-field-label">{label}</p>
                                <input className="mw-input" defaultValue={val} />
                            </div>
                        ))}
                    </div>
                    <div style={{ marginBottom: 20 }}>
                        <p className="mw-field-label">자기소개</p>
                        <textarea
                            className="mw-textarea"
                            defaultValue="안녕하세요. 10년 경력의 임상심리전문가 이은지입니다. 우울, 불안, 대인관계 등 다양한 심리적 어려움을 겪고 계신 분들과 함께 하고 있습니다."
                        />
                    </div>
                    <button className="mw-btn-primary" style={{ maxWidth: 140 }}>
                        프로필 저장
                    </button>
                </div>

                <div className="mw-detail-card">
                    <h4 className="mw-card-header">
                        <Clock size={20} color="var(--mw-primary)" />
                        상담 시간 설정
                    </h4>
                    <div style={{ marginBottom: 24 }}>
                        <p className="mw-field-label" style={{ marginBottom: 16 }}>
                            요일별 운영 시간
                        </p>
                        {workingDays.map((d, idx) => (
                            <div key={idx} className={`mw-day-row${!d.active ? ' inactive' : ''}`}>
                                <div className="mw-day-grid">
                                    <div className={`mw-day-chip${d.active ? ' active' : ''}`}>{d.day}</div>
                                    {['startTime', 'endTime'].map((key) => (
                                        <div key={key}>
                                            <p className="mw-field-label-sm">{key === 'startTime' ? '시작' : '종료'}</p>
                                            <input
                                                type="time"
                                                className="mw-input mw-input-sm"
                                                disabled={!d.active}
                                                value={d[key]}
                                                onChange={(e) => {
                                                    const n = [...workingDays];
                                                    n[idx][key] = e.target.value;
                                                    setWorkingDays(n);
                                                }}
                                                style={{ background: d.active ? '#fff' : '#FAFAFA' }}
                                            />
                                        </div>
                                    ))}
                                    <div className="mw-checkbox-row">
                                        <input
                                            type="checkbox"
                                            id={`rest-${idx}`}
                                            checked={!d.active}
                                            onChange={() => {
                                                const n = [...workingDays];
                                                n[idx].active = !n[idx].active;
                                                setWorkingDays(n);
                                            }}
                                        />
                                        <label htmlFor={`rest-${idx}`}>쉬는 날</label>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div style={{ marginBottom: 24 }}>
                        <p className="mw-field-label" style={{ marginBottom: 12 }}>
                            휴무일 설정
                        </p>
                        <div className="mw-flex-gap" style={{ marginBottom: 12 }}>
                            <input
                                type="date"
                                className="mw-input"
                                style={{ margin: 0, flex: 1 }}
                                value={newHolidayDate}
                                onChange={(e) => setNewHolidayDate(e.target.value)}
                            />
                            <button
                                className="mw-btn-add-time"
                                onClick={() => {
                                    if (newHolidayDate && !holidays.includes(newHolidayDate)) {
                                        setHolidays([...holidays, newHolidayDate]);
                                        setNewHolidayDate('');
                                    }
                                }}
                            >
                                + 추가
                            </button>
                        </div>
                        <div className="mw-holiday-list">
                            {holidays.length === 0 ? (
                                <p className="mw-holiday-empty">등록된 휴무일이 없습니다</p>
                            ) : (
                                <div className="mw-holiday-chips">
                                    {holidays.sort().map((date, idx) => (
                                        <div key={idx} className="mw-holiday-chip">
                                            <Calendar size={14} color="var(--mw-primary)" />
                                            <span>{date}</span>
                                            <X
                                                size={14}
                                                style={{ cursor: 'pointer', color: 'var(--mw-sub)' }}
                                                onClick={() => setHolidays(holidays.filter((_, i) => i !== idx))}
                                            />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                    <button className="mw-btn-primary" style={{ maxWidth: 140 }}>
                        시간 저장
                    </button>
                </div>

                <div className="mw-detail-card danger-border">
                    <h4 className="mw-card-header danger">
                        <AlertCircle size={20} />
                        회원 탈퇴
                    </h4>
                    <p style={{ fontSize: 14, color: 'var(--mw-sub)', margin: '0 0 20px', lineHeight: 1.6 }}>
                        회원 탈퇴 시 모든 상담 기록과 내담자 정보가 삭제되며, 복구가 불가능합니다.
                        <br />
                        신중하게 결정해 주세요.
                    </p>
                    <button
                        className="mw-btn-danger"
                        style={{ maxWidth: 140 }}
                        onClick={() => setShowDeleteConfirm(true)}
                    >
                        회원 탈퇴
                    </button>
                </div>

                {showDeleteConfirm && (
                    <div className="mw-modal-overlay">
                        <div className="mw-modal">
                            <div className="mw-modal-icon">
                                <AlertCircle size={32} color="var(--mw-danger)" />
                            </div>
                            <h3 className="mw-modal-title">정말 탈퇴하시겠습니까?</h3>
                            <p className="mw-modal-desc">
                                모든 상담 기록과 내담자 정보가 영구 삭제되며,
                                <br />
                                <strong style={{ color: 'var(--mw-danger)' }}>복구가 불가능</strong>합니다.
                            </p>
                            <div className="mw-modal-btns">
                                <button
                                    className="mw-btn-secondary"
                                    style={{ flex: 1 }}
                                    onClick={() => setShowDeleteConfirm(false)}
                                >
                                    취소
                                </button>
                                <button
                                    className="mw-btn-danger"
                                    style={{ flex: 1 }}
                                    onClick={() => {
                                        setShowDeleteConfirm(false);
                                        alert('회원 탈퇴가 완료되었습니다.');
                                    }}
                                >
                                    탈퇴하기
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </>
        );
    };

    const renderCustomer = () => (
        <>
            <SimpleHeader title="고객 지원" sub="이용 중 불편한 점이 있으신가요?" />
            <div className="mw-stats-grid">
                {[
                    { icon: <HelpCircle size={24} />, label: '자주 묻는 질문' },
                    { icon: <MessageCircle size={24} />, label: '1:1 문의하기' },
                    { icon: <FileText size={24} />, label: '가이드북' },
                ].map(({ icon, label }) => (
                    <div key={label} className="mw-stat-card" style={{ textAlign: 'center' }}>
                        <div className="mw-support-icon-wrap">{icon}</div>
                        <p style={{ fontWeight: 700, margin: 0 }}>{label}</p>
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
                                <p style={{ fontSize: 12, color: 'var(--mw-sub)', margin: 0 }}>{msg.time}</p>
                            </div>
                        ))}
                    </div>
                </>
            );
        switch (activeMenu) {
            case 'dashboard':
                return renderDashboard();
            case 'history':
                return renderSchedule();
            case 'payment':
                return renderClientDB();
            case 'report':
                return renderPending();
            case 'settings':
                return renderSettings();
            case 'customer':
                return renderCustomer();
            case 'notifications':
                return renderNotifications();
            default:
                return renderDashboard();
        }
    };

    // 로그아웃 핸들러
    const handleLogout = () => {
        // 토큰 및 사용자 정보 삭제
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
        sessionStorage.removeItem('access_token');
        sessionStorage.removeItem('user');
        // 로그인 페이지로 이동
        navigate('/login');
    };

    return (
        <div className="mw-app">
            <button className="mw-mobile-btn" onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}>
                <Menu size={20} />
            </button>
            {isMobileSidebarOpen && (
                <div className="mw-overlay visible" onClick={() => setIsMobileSidebarOpen(false)} />
            )}

            <aside className={`mw-sidebar${isMobileSidebarOpen ? ' open' : ''}`}>
                <div className="mw-logo" onClick={goHome}>
                    <h1 className="mw-logo-title">MINDWELL</h1>
                    <p className="mw-logo-sub">COUNSELOR ADMIN</p>
                </div>
                <nav className="mw-nav">
                    {navItems.map((item) => (
                        <div
                            key={item.id}
                            className={`mw-nav-item${activeMenu === item.id ? ' active' : ''}`}
                            onClick={() => {
                                setActiveMenu(item.id);
                                setSelectedClient(null);
                                setActiveChat(null);
                                if (item.id === 'history') setCurrentView('scheduleDetail');
                                else if (item.id === 'notifications') setCurrentView('notifications');
                                else setCurrentView('dashboard');
                                setIsMobileSidebarOpen(false);
                            }}
                        >
                            {item.icon}
                            <span>{item.label}</span>
                        </div>
                    ))}
                </nav>
                <div className="mw-sidebar-footer">
                    <div
                        className={`mw-footer-item${activeMenu === 'customer' ? ' active' : ''}`}
                        onClick={() => {
                            setActiveMenu('customer');
                            setCurrentView('dashboard');
                            setSelectedClient(null);
                            setActiveChat(null);
                            setIsMobileSidebarOpen(false);
                        }}
                    >
                        <HeadphonesIcon size={20} />
                        <span>고객센터</span>
                    </div>
                    <div className="mw-footer-item danger" onClick={handleLogout}>
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
