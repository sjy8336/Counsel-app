import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../static/CounselorMyPage.css';
import {
    LayoutDashboard,
    Bell,
    Settings,
    LogOut,
    HeadphonesIcon,
    ChevronRight,
    MessageCircle,
    MessageSquare,
    AlertCircle,
    HelpCircle,
    FileText,
    User,
    Check,
    X,
    Calendar,
    Clock,
    Menu,
    Trash2,
    UserCog,
    BellRing,
    ChevronDown,
} from 'lucide-react';

// ─── DATA ────────────────────────────────────────────────────────────────────
const unreadMessages = [
    { id: 201, name: '최유진', content: '선생님, 오늘 숙제 다 했어요!', time: '10분 전' },
    { id: 202, name: '김소현', content: '상담실 위치가 바뀐 건가요?', time: '35분 전' },
    { id: 203, name: '이민준', content: '오늘 조금 늦을 것 같습니다.', time: '1시간 전' },
];

const initialNotifications = [
    {
        id: 1,
        group: '오늘',
        items: [
            {
                id: 101,
                type: 'schedule',
                title: '오늘 상담 일정',
                desc: '10:00 김소현 • 상담 1실 / 14:00 이민준 • 상담 3실',
                time: '오전 8:00',
                unread: true,
            },
            {
                id: 102,
                type: 'booking',
                title: '예약 확정',
                desc: '한수지 님의 대면 상담이 승인되었습니다.',
                time: '오전 9:10',
                unread: true,
            },
            {
                id: 103,
                type: 'msg',
                title: '새 메시지',
                desc: '이민준 님: 오늘 조금 늦을 것 같습니다.',
                time: '오전 9:45',
                unread: true,
            },
        ],
    },
    {
        id: 2,
        group: '어제',
        items: [
            {
                id: 104,
                type: 'booking',
                title: '예약 확정',
                desc: '정현우 님의 화상 상담이 확정되었습니다.',
                time: '오후 3:20',
                unread: false,
            },
            {
                id: 105,
                type: 'notice',
                title: '시스템 공지',
                desc: '내일 오후 2시부터 서버 점검이 예정되어 있습니다.',
                time: '오전 9:00',
                unread: false,
            },
        ],
    },
    {
        id: 3,
        group: '이번 주',
        items: [
            {
                id: 106,
                type: 'schedule',
                title: '예약 취소',
                desc: '박지영 님이 5월 22일 상담을 취소했습니다.',
                time: '5월 21일',
                unread: false,
            },
        ],
    },
];

const careers = [
    { id: 1, startDate: '2019-03', endDate: '2022-06', description: '서울심리상담센터 상담사' },
    { id: 2, startDate: '2022-07', endDate: '현재', description: '마인드웰 서울 강남센터 수석 상담사' },
];
const educations = [
    { id: 1, startDate: '2013-03', endDate: '2017-02', school: '서울대학교 심리학과', degree: '학사' },
    { id: 2, startDate: '2017-03', endDate: '2019-02', school: '서울대학교 심리학과', degree: '석사' },
];
const certificates = [
    { id: 1, name: '임상심리전문가 1급', issuer: '한국심리학회', date: '2019-06' },
    { id: 2, name: '상담심리사 1급', issuer: '한국상담심리학회', date: '2020-03' },
];
const defaultWorkingDays = [
    { day: '월', active: true, startTime: '09:00', endTime: '18:00' },
    { day: '화', active: true, startTime: '09:00', endTime: '18:00' },
    { day: '수', active: true, startTime: '09:00', endTime: '18:00' },
    { day: '목', active: true, startTime: '09:00', endTime: '18:00' },
    { day: '금', active: true, startTime: '09:00', endTime: '18:00' },
    { day: '토', active: false, startTime: '09:00', endTime: '18:00' },
    { day: '일', active: false, startTime: '09:00', endTime: '18:00' },
];
const defaultNotifSettings = [
    { id: 'schedule', label: '상담 일정 알림', desc: '오늘 예정된 상담 일정을 알려드립니다.', on: true },
    { id: 'booking', label: '예약 확정 알림', desc: '새로운 예약이 확정되면 알려드립니다.', on: true },
    { id: 'cancel', label: '예약 취소 알림', desc: '내담자가 예약을 취소하면 알려드립니다.', on: true },
    { id: 'msg', label: '메시지 알림', desc: '읽지 않은 메시지가 있을 때 알려드립니다.', on: false },
    { id: 'notice', label: '시스템 공지 알림', desc: '서비스 점검 및 공지사항을 알려드립니다.', on: true },
    { id: 'marketing', label: '마케팅 알림', desc: '이벤트 및 혜택 소식을 알려드립니다.', on: false },
];

// ─── HELPERS ─────────────────────────────────────────────────────────────────
const NotifIcon = ({ type }) => {
    const map = {
        schedule: <Calendar size={15} />,
        booking: <Check size={15} />,
        msg: <MessageSquare size={15} />,
        notice: <AlertCircle size={15} />,
    };
    return <div className="mw-item-avatar notif">{map[type] || <Bell size={15} />}</div>;
};
const PageHeader = ({ title, sub }) => (
    <div className="mw-page-header">
        <h2 className="mw-page-title">{title}</h2>
        {sub && <p className="mw-page-sub">{sub}</p>}
    </div>
);
const Toggle = ({ on, onChange }) => (
    <button className={`mw-toggle${on ? ' on' : ''}`} onClick={onChange} aria-label="toggle">
        <span className="mw-toggle-thumb" />
    </button>
);

// ─── APP ─────────────────────────────────────────────────────────────────────
const App = () => {
    const navigate = useNavigate();

    const [activeMenu, setActiveMenu] = useState('dashboard');
    const [settingsView, setSettingsView] = useState(null); // null | 'profile' | 'notifSettings' | 'deleteAccount'
    const [settingsOpen, setSettingsOpen] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [registered, setRegistered] = useState(false);
    const [notifications, setNotifications] = useState(initialNotifications);
    const [notifSettings, setNotifSettings] = useState(defaultNotifSettings);
    const [holidays, setHolidays] = useState(['2024-06-01', '2024-06-15']);
    const [newHoliday, setNewHoliday] = useState('');
    const [workDays, setWorkDays] = useState(defaultWorkingDays);
    const [deleteStep, setDeleteStep] = useState(1);
    const [deleteInput, setDeleteInput] = useState('');

    const navItems = [
        { id: 'dashboard', icon: <LayoutDashboard size={17} />, label: '대시보드' },
        { id: 'notifications', icon: <Bell size={17} />, label: '알림센터' },
    ];
    const tabItems = [
        { id: 'dashboard', icon: <LayoutDashboard size={19} />, label: '홈' },
        { id: 'notifications', icon: <Bell size={19} />, label: '알림' },
        { id: 'settings', icon: <Settings size={19} />, label: '설정' },
        { id: 'customer', icon: <HeadphonesIcon size={19} />, label: '고객' },
    ];
    const settingsMenuItems = [
        {
            id: 'profile',
            icon: <UserCog size={16} />,
            label: registered ? '상담사 프로필 수정' : '상담사 등록하기',
            sub: registered ? '프로필 정보를 수정합니다.' : '상담사 정보를 처음 등록합니다.',
        },
        { id: 'notifSettings', icon: <BellRing size={16} />, label: '알림 설정', sub: '받을 알림 종류를 설정합니다.' },
        {
            id: 'deleteAccount',
            icon: <Trash2 size={16} />,
            label: '회원 탈퇴',
            sub: '계정 및 모든 데이터를 삭제합니다.',
            danger: true,
        },
    ];

    const go = (menu, sv = null) => {
        setActiveMenu(menu);
        setSettingsView(sv);
        setSidebarOpen(false);
        if (menu !== 'settings') setSettingsOpen(false);
    };

    // 로고 클릭 시 home.jsx로 이동
    const handleLogoClick = () => {
        navigate('/');
    };
    const goSettings = (sv) => {
        setActiveMenu('settings');
        setSettingsView(sv);
        setSidebarOpen(false);
    };
    const handleLogout = () => {
        ['access_token', 'user'].forEach((k) => {
            localStorage.removeItem(k);
            sessionStorage.removeItem(k);
        });
        navigate('/login');
    };
    const toggleWorkDay = (idx) => {
        const n = [...workDays];
        n[idx].active = !n[idx].active;
        setWorkDays(n);
    };
    const updateWorkTime = (idx, key, val) => {
        const n = [...workDays];
        n[idx][key] = val;
        setWorkDays(n);
    };
    const addHoliday = () => {
        if (newHoliday && !holidays.includes(newHoliday)) {
            setHolidays([...holidays, newHoliday]);
            setNewHoliday('');
        }
    };
    const handleNotifClick = (gId, iId) =>
        setNotifications((prev) =>
            prev.map((g) =>
                g.id === gId ? { ...g, items: g.items.map((i) => (i.id === iId ? { ...i, unread: false } : i)) } : g
            )
        );
    const toggleNotifSetting = (id) =>
        setNotifSettings((prev) => prev.map((s) => (s.id === id ? { ...s, on: !s.on } : s)));

    // ── 뷰 렌더 ─────────────────────────────────────────────────────────────
    const renderDashboard = () => (
        <>
            <header className="mw-header">
                <div className="mw-profile-section">
                    <div className="mw-profile-img">🧔‍♂️</div>
                    <div>
                        <h2 className="mw-welcome">안녕하세요, 이은지 상담사님!</h2>
                        <p className="mw-welcome-sub">오늘도 따뜻한 상담 부탁드립니다 🌿</p>
                    </div>
                </div>
                <button className="mw-notif-btn" onClick={() => go('notifications')}>
                    <Bell size={14} /> 알림 확인
                </button>
            </header>
            <div className="mw-stats-grid">
                {[
                    {
                        icon: <Calendar size={15} color="#66BB6A" />,
                        bg: '#E8F5E9',
                        label: '오늘 예정 상담',
                        value: '3 건',
                    },
                    {
                        icon: <Clock size={15} color="#FFB74D" />,
                        bg: '#FFF5E6',
                        label: '승인 대기 요청',
                        value: '2 건',
                    },
                    {
                        icon: <MessageCircle size={15} color="#EF5350" />,
                        bg: '#FFEBEE',
                        label: '읽지 않은 메시지',
                        value: '5 건',
                    },
                ].map(({ icon, bg, label, value }) => (
                    <div key={label} className="mw-stat-card" onClick={() => go('notifications')}>
                        <div className="mw-stat-icon" style={{ background: bg }}>
                            {icon}
                        </div>
                        <p className="mw-stat-label">{label}</p>
                        <p className="mw-stat-value">{value}</p>
                        <span className="mw-stat-chevron">
                            <ChevronRight size={14} />
                        </span>
                    </div>
                ))}
            </div>
            <div className="mw-next-session" onClick={() => go('notifications')}>
                <div className="mw-next-session-icon">
                    <User size={24} color="#fff" />
                </div>
                <div className="mw-next-session-body">
                    <div className="mw-next-session-label">NEXT SESSION</div>
                    <div className="mw-next-session-name">오후 2:00 이민준 님</div>
                    <div className="mw-next-session-sub">대면 상담 • 상담 3실 • 4회차 진행 예정</div>
                </div>
                <button className="mw-next-session-btn">
                    내담자 관리 <ChevronRight size={14} />
                </button>
            </div>
        </>
    );

    const renderNotifications = () => (
        <>
            <PageHeader title="알림 센터" sub="상담 일정, 예약 확정 등 최근 알림을 확인하세요." />
            <div className="mw-list-card">
                {notifications.map((group) => (
                    <div key={group.id}>
                        <div className="mw-notif-group-label">{group.group}</div>
                        {group.items.map((item) => (
                            <div
                                key={item.id}
                                className={`mw-notif-item${item.unread ? ' unread' : ''}`}
                                onClick={() => handleNotifClick(group.id, item.id)}
                            >
                                <NotifIcon type={item.type} />
                                <div className="mw-notif-content">
                                    <div className="mw-notif-title">{item.title}</div>
                                    <div className="mw-notif-desc">{item.desc}</div>
                                </div>
                                <div className="mw-notif-meta">
                                    <span className="mw-notif-time">{item.time}</span>
                                    {item.unread && <span className="mw-notif-dot" />}
                                </div>
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </>
    );

    const renderSettingsList = () => (
        <>
            <PageHeader title="설정" sub="계정 및 서비스 환경을 설정합니다." />
            <div className="mw-list-card">
                {settingsMenuItems.map((item) => (
                    <div key={item.id} className="mw-list-item" onClick={() => goSettings(item.id)}>
                        <div className="mw-item-info">
                            <div className={`mw-item-avatar${item.danger ? ' danger-icon' : ' notif'}`}>
                                {item.icon}
                            </div>
                            <div>
                                <p className={`mw-item-name${item.danger ? ' danger-text' : ''}`}>{item.label}</p>
                                <p className="mw-item-sub">{item.sub}</p>
                            </div>
                        </div>
                        <ChevronRight size={15} color="var(--mw-sub)" />
                    </div>
                ))}
            </div>
        </>
    );

    const renderProfile = () => (
        <>
            <div className="mw-subview-header">
                <button className="mw-back-btn" onClick={() => setSettingsView(null)}>
                    <ChevronRight size={15} style={{ transform: 'rotate(180deg)' }} /> 설정
                </button>
                <h2 className="mw-page-title" style={{ margin: 0 }}>
                    {registered ? '상담사 프로필 수정' : '상담사 등록하기'}
                </h2>
            </div>
            {!registered ? (
                <div className="mw-settings-card" style={{ textAlign: 'center', padding: '52px 28px' }}>
                    <div className="mw-register-icon">👤</div>
                    <h3 className="mw-register-title">상담사 프로필을 등록해주세요</h3>
                    <p className="mw-register-sub">
                        내담자가 상담사님의 정보를 확인하고 예약할 수 있도록
                        <br />
                        프로필 정보를 입력해주세요.
                    </p>
                    <button
                        className="mw-btn mw-btn-primary"
                        style={{ padding: '13px 28px', fontSize: 14 }}
                        onClick={() => setRegistered(true)}
                    >
                        상담사 등록하기
                    </button>
                </div>
            ) : (
                <>
                    <div className="mw-settings-card">
                        <div className="mw-card-title">
                            <User size={15} color="var(--mw-primary)" /> 기본 정보
                        </div>
                        <div className="mw-profile-upload">
                            <div className="mw-profile-img-lg">
                                🧔‍♂️
                                <button className="mw-profile-edit-btn">
                                    <Settings size={11} />
                                </button>
                            </div>
                            <div>
                                <p style={{ fontSize: 11, color: 'var(--mw-sub)', marginBottom: 3 }}>프로필 사진</p>
                                <p style={{ fontSize: 12, fontWeight: 600 }}>사진을 클릭하여 업로드</p>
                            </div>
                        </div>
                        <div className="mw-grid-2">
                            {[
                                ['이름', '이은지'],
                                ['연락처', '010-1234-5678'],
                                ['전화번호', '02-1234-5678'],
                                ['전문 분야', '성인 우울, 불안 장애'],
                            ].map(([l, v]) => (
                                <div key={l}>
                                    <label className="mw-field-label">{l}</label>
                                    <input className="mw-input" defaultValue={v} />
                                </div>
                            ))}
                        </div>
                        <div className="mw-section-divider" style={{ marginTop: 14 }}>
                            <div className="mw-sub-section-header">
                                <span className="mw-field-label" style={{ margin: 0 }}>
                                    경력 사항
                                </span>
                                <button className="mw-btn-outline-sm">+ 추가</button>
                            </div>
                            {careers.map((c) => (
                                <div key={c.id} className="mw-row-card">
                                    <div className="mw-career-grid">
                                        <div>
                                            <label className="mw-field-label-sm">시작</label>
                                            <input
                                                type="month"
                                                className="mw-input mw-input-sm"
                                                defaultValue={c.startDate}
                                            />
                                        </div>
                                        <div>
                                            <label className="mw-field-label-sm">종료</label>
                                            <input
                                                type="month"
                                                className="mw-input mw-input-sm"
                                                defaultValue={c.endDate === '현재' ? '' : c.endDate}
                                                disabled={c.endDate === '현재'}
                                            />
                                        </div>
                                        <div>
                                            <label className="mw-field-label-sm">경력 내용</label>
                                            <input
                                                type="text"
                                                className="mw-input mw-input-sm"
                                                defaultValue={c.description}
                                            />
                                        </div>
                                        <button className="mw-btn-icon">
                                            <X size={12} />
                                        </button>
                                    </div>
                                    <div className="mw-checkbox-row">
                                        <input type="checkbox" defaultChecked={c.endDate === '현재'} />
                                        <label>현재 진행중</label>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="mw-section-divider">
                            <div className="mw-sub-section-header">
                                <span className="mw-field-label" style={{ margin: 0 }}>
                                    자격증
                                </span>
                                <button className="mw-btn-outline-sm">+ 추가</button>
                            </div>
                            {certificates.map((cert) => (
                                <div key={cert.id} className="mw-row-card">
                                    <div className="mw-cert-grid">
                                        <div>
                                            <label className="mw-field-label-sm">자격증명</label>
                                            <input
                                                type="text"
                                                className="mw-input mw-input-sm"
                                                defaultValue={cert.name}
                                            />
                                        </div>
                                        <div>
                                            <label className="mw-field-label-sm">발급 기관</label>
                                            <input
                                                type="text"
                                                className="mw-input mw-input-sm"
                                                defaultValue={cert.issuer}
                                            />
                                        </div>
                                        <div>
                                            <label className="mw-field-label-sm">취득일</label>
                                            <input
                                                type="month"
                                                className="mw-input mw-input-sm"
                                                defaultValue={cert.date}
                                            />
                                        </div>
                                        <button className="mw-btn-icon">
                                            <X size={12} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="mw-section-divider">
                            <div className="mw-sub-section-header">
                                <span className="mw-field-label" style={{ margin: 0 }}>
                                    학력 사항
                                </span>
                                <button className="mw-btn-outline-sm">+ 추가</button>
                            </div>
                            {educations.map((edu) => (
                                <div key={edu.id} className="mw-row-card">
                                    <div className="mw-edu-grid">
                                        <div>
                                            <label className="mw-field-label-sm">시작</label>
                                            <input
                                                type="month"
                                                className="mw-input mw-input-sm"
                                                defaultValue={edu.startDate}
                                            />
                                        </div>
                                        <div>
                                            <label className="mw-field-label-sm">졸업</label>
                                            <input
                                                type="month"
                                                className="mw-input mw-input-sm"
                                                defaultValue={edu.endDate}
                                            />
                                        </div>
                                        <div>
                                            <label className="mw-field-label-sm">학교 / 전공</label>
                                            <input
                                                type="text"
                                                className="mw-input mw-input-sm"
                                                defaultValue={edu.school}
                                            />
                                        </div>
                                        <div>
                                            <label className="mw-field-label-sm">학위</label>
                                            <input
                                                type="text"
                                                className="mw-input mw-input-sm"
                                                defaultValue={edu.degree}
                                            />
                                        </div>
                                        <button className="mw-btn-icon">
                                            <X size={12} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="mw-grid-2">
                            {[
                                ['상담소명', '마인드웰 서울 강남센터'],
                                ['상담소 주소', '서울시 강남구 테헤란로 123'],
                            ].map(([l, v]) => (
                                <div key={l}>
                                    <label className="mw-field-label">{l}</label>
                                    <input className="mw-input" defaultValue={v} />
                                </div>
                            ))}
                        </div>
                        <div style={{ marginTop: 12, marginBottom: 14 }}>
                            <label className="mw-field-label">자기소개</label>
                            <textarea
                                className="mw-textarea"
                                defaultValue="안녕하세요. 10년 경력의 임상심리전문가 이은지입니다."
                            />
                        </div>
                        <button className="mw-btn mw-btn-primary" style={{ maxWidth: 130 }}>
                            프로필 저장
                        </button>
                    </div>
                    <div className="mw-settings-card">
                        <div className="mw-card-title">
                            <Clock size={15} color="var(--mw-primary)" /> 상담 시간 설정
                        </div>
                        <label className="mw-field-label" style={{ marginBottom: 12 }}>
                            요일별 운영 시간
                        </label>
                        {workDays.map((d, idx) => (
                            <div key={idx} className={`mw-day-row${!d.active ? ' inactive' : ''}`}>
                                <div className="mw-day-grid">
                                    <div className={`mw-day-chip${d.active ? ' active' : ''}`}>{d.day}</div>
                                    <div>
                                        <label className="mw-field-label-sm">시작</label>
                                        <input
                                            type="time"
                                            className="mw-input mw-input-sm"
                                            disabled={!d.active}
                                            value={d.startTime}
                                            onChange={(e) => updateWorkTime(idx, 'startTime', e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label className="mw-field-label-sm">종료</label>
                                        <input
                                            type="time"
                                            className="mw-input mw-input-sm"
                                            disabled={!d.active}
                                            value={d.endTime}
                                            onChange={(e) => updateWorkTime(idx, 'endTime', e.target.value)}
                                        />
                                    </div>
                                    <div className="mw-checkbox-row">
                                        <input
                                            type="checkbox"
                                            checked={!d.active}
                                            onChange={() => toggleWorkDay(idx)}
                                        />
                                        <label>쉬는 날</label>
                                    </div>
                                </div>
                            </div>
                        ))}
                        <label className="mw-field-label" style={{ marginTop: 18, marginBottom: 9 }}>
                            휴무일 설정
                        </label>
                        <div className="mw-flex-gap" style={{ marginBottom: 9 }}>
                            <input
                                type="date"
                                className="mw-input"
                                style={{ margin: 0, flex: 1 }}
                                value={newHoliday}
                                onChange={(e) => setNewHoliday(e.target.value)}
                            />
                            <button className="mw-btn-add" onClick={addHoliday}>
                                + 추가
                            </button>
                        </div>
                        <div className="mw-holiday-list">
                            {holidays.length === 0 ? (
                                <p className="mw-holiday-empty">등록된 휴무일이 없습니다</p>
                            ) : (
                                <div className="mw-holiday-chips">
                                    {[...holidays].sort().map((date, i) => (
                                        <div key={i} className="mw-holiday-chip">
                                            <Calendar size={11} color="var(--mw-primary)" />
                                            <span>{date}</span>
                                            <X
                                                size={11}
                                                style={{ cursor: 'pointer', color: 'var(--mw-sub)' }}
                                                onClick={() => setHolidays(holidays.filter((_, j) => j !== i))}
                                            />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        <button className="mw-btn mw-btn-primary" style={{ maxWidth: 130, marginTop: 14 }}>
                            시간 저장
                        </button>
                    </div>
                </>
            )}
        </>
    );

    const renderNotifSettings = () => (
        <>
            <div className="mw-subview-header">
                <button className="mw-back-btn" onClick={() => setSettingsView(null)}>
                    <ChevronRight size={15} style={{ transform: 'rotate(180deg)' }} /> 설정
                </button>
                <h2 className="mw-page-title" style={{ margin: 0 }}>
                    알림 설정
                </h2>
            </div>
            <p className="mw-page-sub" style={{ marginBottom: 20 }}>
                받고 싶은 알림 종류를 선택하세요.
            </p>
            <div className="mw-list-card">
                {notifSettings.map((s) => (
                    <div key={s.id} className="mw-notif-setting-item">
                        <div>
                            <p className="mw-item-name" style={{ marginBottom: 2 }}>
                                {s.label}
                            </p>
                            <p className="mw-item-sub">{s.desc}</p>
                        </div>
                        <Toggle on={s.on} onChange={() => toggleNotifSetting(s.id)} />
                    </div>
                ))}
            </div>
        </>
    );

    const renderDeleteAccount = () => (
        <>
            <div className="mw-subview-header">
                <button
                    className="mw-back-btn"
                    onClick={() => {
                        setSettingsView(null);
                        setDeleteStep(1);
                        setDeleteInput('');
                    }}
                >
                    <ChevronRight size={15} style={{ transform: 'rotate(180deg)' }} /> 설정
                </button>
                <h2 className="mw-page-title" style={{ margin: 0 }}>
                    회원 탈퇴
                </h2>
            </div>
            {deleteStep === 1 ? (
                <div className="mw-settings-card">
                    <div className="mw-delete-icon-wrap">
                        <div className="mw-delete-icon">
                            <Trash2 size={26} color="var(--mw-danger)" />
                        </div>
                    </div>
                    <h3 className="mw-delete-title">탈퇴 전 꼭 확인하세요</h3>
                    <div className="mw-delete-warn-list">
                        {[
                            '모든 상담 기록과 내담자 데이터가 영구 삭제됩니다.',
                            '삭제된 데이터는 복구가 불가능합니다.',
                            '진행 중인 상담이 있는 경우 내담자에게 별도 안내가 필요합니다.',
                            '탈퇴 후 동일 이메일로 재가입 시 기존 데이터는 복원되지 않습니다.',
                        ].map((txt, i) => (
                            <div key={i} className="mw-delete-warn-item">
                                <span className="mw-delete-warn-dot" />
                                <span>{txt}</span>
                            </div>
                        ))}
                    </div>
                    <div className="mw-btn-row" style={{ marginTop: 26 }}>
                        <button
                            className="mw-btn mw-btn-secondary"
                            style={{ flex: 1 }}
                            onClick={() => setSettingsView(null)}
                        >
                            취소
                        </button>
                        <button className="mw-btn mw-btn-danger" style={{ flex: 1 }} onClick={() => setDeleteStep(2)}>
                            다음 단계
                        </button>
                    </div>
                </div>
            ) : (
                <div className="mw-settings-card">
                    <h3 className="mw-delete-confirm-title">탈퇴를 확인해주세요</h3>
                    <p className="mw-delete-confirm-sub">
                        아래 입력창에 <strong style={{ color: 'var(--mw-danger)' }}>탈퇴합니다</strong>를 입력하면
                        탈퇴가 진행됩니다.
                    </p>
                    <input
                        className="mw-input mw-delete-input"
                        placeholder="탈퇴합니다"
                        value={deleteInput}
                        onChange={(e) => setDeleteInput(e.target.value)}
                    />
                    <div className="mw-btn-row" style={{ marginTop: 18 }}>
                        <button
                            className="mw-btn mw-btn-secondary"
                            style={{ flex: 1 }}
                            onClick={() => setDeleteStep(1)}
                        >
                            이전
                        </button>
                        <button
                            className="mw-btn mw-btn-danger"
                            style={{ flex: 1, opacity: deleteInput === '탈퇴합니다' ? 1 : 0.4 }}
                            disabled={deleteInput !== '탈퇴합니다'}
                            onClick={() => alert('회원 탈퇴가 완료되었습니다.')}
                        >
                            탈퇴하기
                        </button>
                    </div>
                </div>
            )}
        </>
    );

    const renderCustomer = () => (
        <>
            <PageHeader title="고객 지원" sub="이용 중 불편한 점이 있으신가요?" />
            <div className="mw-support-grid">
                {[
                    { icon: <HelpCircle size={21} />, label: '자주 묻는 질문' },
                    { icon: <MessageCircle size={21} />, label: '1:1 문의하기' },
                    { icon: <FileText size={21} />, label: '가이드북' },
                ].map(({ icon, label }) => (
                    <div key={label} className="mw-support-card">
                        <div className="mw-support-icon">{icon}</div>
                        <p className="mw-support-label">{label}</p>
                    </div>
                ))}
            </div>
        </>
    );

    const renderContent = () => {
        if (activeMenu === 'settings') {
            if (settingsView === 'profile') return renderProfile();
            if (settingsView === 'notifSettings') return renderNotifSettings();
            if (settingsView === 'deleteAccount') return renderDeleteAccount();
            return renderSettingsList();
        }
        switch (activeMenu) {
            case 'notifications':
                return renderNotifications();
            case 'customer':
                return renderCustomer();
            default:
                return renderDashboard();
        }
    };

    return (
        <div className="mw-app">
            <div className="mw-mobile-header">
                <button className="mw-mobile-menu-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
                    <Menu size={21} />
                </button>
                <span className="mw-mobile-logo">MINDWELL</span>
                <button className="mw-mobile-menu-btn" onClick={() => go('notifications')}>
                    <Bell size={19} />
                </button>
            </div>

            {sidebarOpen && <div className="mw-overlay visible" onClick={() => setSidebarOpen(false)} />}

            <aside className={`mw-sidebar${sidebarOpen ? ' open' : ''}`}>
                <div className="mw-logo" onClick={handleLogoClick} style={{ cursor: 'pointer' }}>
                    <div className="mw-logo-title">MINDWELL</div>
                    <div className="mw-logo-sub">COUNSELOR ADMIN</div>
                </div>
                <nav className="mw-nav">
                    {navItems.map((item) => (
                        <div
                            key={item.id}
                            className={`mw-nav-item${activeMenu === item.id ? ' active' : ''}`}
                            onClick={() => go(item.id)}
                        >
                            {item.icon}
                            <span>{item.label}</span>
                        </div>
                    ))}
                    {/* 설정 드롭다운 */}
                    <div
                        className={`mw-nav-item${activeMenu === 'settings' ? ' active' : ''}`}
                        onClick={() => {
                            setSettingsOpen((o) => !o);
                            setActiveMenu('settings');
                            setSettingsView(null);
                            setSidebarOpen(false);
                        }}
                    >
                        <Settings size={17} />
                        <span style={{ flex: 1 }}>설정</span>
                        <ChevronDown
                            size={13}
                            style={{ transition: 'transform .2s', transform: settingsOpen ? 'rotate(180deg)' : 'none' }}
                        />
                    </div>
                    {settingsOpen && (
                        <div className="mw-nav-submenu">
                            {settingsMenuItems.map((item) => (
                                <div
                                    key={item.id}
                                    className={`mw-nav-subitem${settingsView === item.id ? ' active' : ''}${item.danger ? ' danger' : ''}`}
                                    onClick={() => goSettings(item.id)}
                                >
                                    {item.icon}
                                    <span>{item.label}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </nav>
                <div className="mw-sidebar-footer">
                    <div
                        className={`mw-footer-item${activeMenu === 'customer' ? ' active' : ''}`}
                        onClick={() => go('customer')}
                    >
                        <HeadphonesIcon size={17} />
                        <span>고객센터</span>
                    </div>
                    <div className="mw-footer-item danger" onClick={handleLogout}>
                        <LogOut size={17} />
                        <span>로그아웃</span>
                    </div>
                </div>
            </aside>

            <main className="mw-main">{renderContent()}</main>

            <nav className="mw-bottom-tab">
                {tabItems.map((item) => (
                    <div
                        key={item.id}
                        className={`mw-tab-item${activeMenu === item.id ? ' active' : ''}`}
                        onClick={() => go(item.id)}
                    >
                        <span className="mw-tab-icon">{item.icon}</span>
                        <span className="mw-tab-label">{item.label}</span>
                    </div>
                ))}
            </nav>
        </div>
    );
};

export default App;
