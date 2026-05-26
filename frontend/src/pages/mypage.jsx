import React, { useState, useEffect, useRef } from 'react';
import { getMyInquiries } from '../api/inquiry';
import { getNotifications } from '../api/notification';
import { deleteAccount } from '../api/auth';
import { getUserInfo, updateUserInfo, changePassword } from '../api/user';
import { getCounselorClients } from '../api/counselorClients';
import { getClientLogs } from '../api/clientLogs';
import { getFavorites, toggleFavorite } from '../api/favorite';
import CounselorListPage from './CounselorList';
import { isTokenExpired } from '../utils/jwt';
import {
    Settings,
    Bell,
    LogOut,
    ChevronRight,
    ChevronLeft,
    CalendarHeart,
    MessageSquareHeart,
    History,
    Wallet,
    Calendar,
    Ticket,
    MessagesSquare,
    ArrowLeft,
    User,
    ShieldCheck,
    UserX,
    Mail,
    Phone,
    Camera,
    CheckCircle2,
    Lock,
    KeyRound,
    AlertCircle,
    ToggleRight,
    ToggleLeft,
    CalendarDays,
    Heart,
    ClipboardList,
    Target,
    Hash,
    Lightbulb,
    Check,
    HeadphonesIcon,
    HelpCircle,
    MessageCircle,
    FileText,
    MessageSquare,
    CreditCard,
    Receipt,
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import MobileTap from '../components/mobileTap';
import '../static/MyPage.css';
import '../static/CounselorMyPage.css';

const notifSettingsData = [
    { key: 'session', title: '상담 일정 알림', desc: '예약된 상담 시간 및 변동 사항 안내' },
    { key: 'service', title: '서비스 공지사항', desc: '점검 안내 및 주요 이용 정보' },
    { key: 'marketing', title: '이벤트 및 혜택 알림', desc: '새로운 프로그램 및 할인 쿠폰 정보' },
];

const PAYMENT_HISTORY = [
    {
        id: 1,
        date: '2026.05.20',
        time: '14:32',
        title: '이지은 상담사 - 1:1 심리상담 예약금',
        amount: '20,000',
        method: '카카오페이',
        status: '결제완료',
    },
    {
        id: 2,
        date: '2026.05.02',
        time: '10:15',
        title: '김민수 상담사 - 1:1 심리상담 잔금',
        amount: '60,000',
        method: '신용카드 (현대 12**)',
        status: '결제완료',
    },
    {
        id: 3,
        date: '2026.04.15',
        time: '16:40',
        title: '박지영 상담사 - 커플 상담 예약금',
        amount: '30,000',
        method: '네이버페이',
        status: '취소완료',
    },
];

const renderSupportCenter = () => (
    <>
        <div className="cmp-page-header">
            <h2 className="cmp-page-title">고객 지원</h2>
            <p className="cmp-page-sub">이용 중 불편한 점이 있으신가요?</p>
        </div>
        <div className="cmp-support-grid">
            {[
                { icon: <HelpCircle size={21} />, label: '자주 묻는 질문' },
                { icon: <MessageCircle size={21} />, label: '1:1 문의하기' },
                { icon: <FileText size={21} />, label: '가이드북' },
            ].map(({ icon, label }) => (
                <div key={label} className="cmp-support-card">
                    <div className="cmp-support-icon">{icon}</div>
                    <p className="cmp-support-label">{label}</p>
                </div>
            ))}
        </div>
    </>
);

const NotificationSettings = ({ notifSettings, toggleNotif }) => (
    <div className="ns-card">
        <header className="ns-header">
            <div className="ns-header-icon-box">
                <Bell size={20} />
            </div>
            <h1 className="ns-header-title">알림 설정</h1>
        </header>
        <main className="ns-list">
            {notifSettingsData.map((item) => {
                const isActive = notifSettings[item.key];
                return (
                    <div key={item.key} className="ns-toggle-item">
                        <div className="ns-item-text">
                            <p className="ns-item-title">{item.title}</p>
                            <p className="ns-item-desc">{item.desc}</p>
                        </div>
                        <button
                            onClick={() => toggleNotif(item.key)}
                            className={`ns-toggle-btn ${isActive ? 'is-on' : 'is-off'}`}
                        >
                            {isActive ? (
                                <ToggleRight size={48} strokeWidth={1.2} />
                            ) : (
                                <ToggleLeft size={48} strokeWidth={1.2} />
                            )}
                        </button>
                    </div>
                );
            })}
        </main>
        <footer className="ns-footer-box">
            <AlertCircle size={18} className="ns-footer-icon" />
            <p className="ns-footer-text">
                기기 전체 알림이 꺼져있을 경우 앱 설정을 켜도 알림이 전송되지 않습니다. 휴대폰의{' '}
                <span className="ns-footer-highlight">설정 &gt; 알림</span> 메뉴에서 마인드웰의 알림 허용 상태를 확인해
                주세요.
            </p>
        </footer>
    </div>
);

import { getAllBookings } from '../api/booking';

export default function App() {
    // 상담 히스토리 관련 state를 최상단에 선언 (모든 useEffect보다 위)
    const [historyList, setHistoryList] = useState([]);
    const [completedConsultations, setCompletedConsultations] = useState(0);

    const navigate = useNavigate();
    const location = useLocation();
    const contentRef = useRef(null);
    // 모바일/태블릿/폴더블 기기까지 감지
    function isMobileDevice() {
        const ua = navigator.userAgent.toLowerCase();
        return (
            window.innerWidth <= 1024 ||
            /ipad|android(?!.*mobile)|tablet|surface|fold|sm-t|lenovo tab|windows touch|asus|zenbook/i.test(ua)
        );
    }
    const [isMobile, setIsMobile] = useState(isMobileDevice());
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    // 알림 데이터 상태 및 fetch
    const [notifications, setNotifications] = useState([]);
    useEffect(() => {
        const fetchNotifications = async () => {
            const token = localStorage.getItem('access_token');
            if (!token) {
                setNotifications([]);
                return;
            }
            try {
                const res = await getNotifications(token);
                let notifList = Array.isArray(res.data) ? res.data : res.data?.notifications || [];
                // 최신순 정렬 (created_at 기준)
                notifList = notifList.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
                setNotifications(notifList);
            } catch (e) {
                setNotifications([]);
            }
        };
        fetchNotifications();
    }, []);

    // 예약 데이터 불러오기 (home.jsx와 동일)
    useEffect(() => {
        const fetchBookings = async () => {
            const user = localStorage.getItem('user');
            if (!user) {
                setBookings([]);
                setLoading(false);
                return;
            }
            setLoading(true);
            try {
                const data = await getAllBookings({ upcomingOnly: true, limit: 1 });
                setBookings(data || []);
            } catch {
                setBookings([]);
            } finally {
                setLoading(false);
            }
        };
        fetchBookings();
    }, []);

    // 가장 가까운 예약
    const primaryBooking = bookings[0];
    const getDDay = (dateStr, timeStr) => {
        const date = dateStr.replace(/\./g, '-');
        const dt = new Date(`${date}T${timeStr}`);
        const now = new Date();
        return Math.max(1, Math.ceil((dt - now) / (1000 * 60 * 60 * 24)));
    };

    useEffect(() => {
        const handleResize = () => setIsMobile(isMobileDevice());
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const [activeMenu, setActiveMenu] = useState(() => {
        if (location.state && location.state.showNotifications) return 'notifications';
        if (location.state && location.state.showInquiry) return 'inquiry';
        return 'dashboard';
    });
    const [activeSubMenu, setActiveSubMenu] = useState(null);
    const [ticketCount, setTicketCount] = useState(2);
    const [selectedConsultation, setSelectedConsultation] = useState(null);
    const [notifSettings, setNotifSettings] = useState({
        session: true,
        marketing: false,
        report: true,
        service: true,
    });
    const [withdrawAgree, setWithdrawAgree] = useState(false);
    const [withdrawLoading, setWithdrawLoading] = useState(false);
    const [userInfo, setUserInfo] = useState({
        name: '',
        id: '',
        username: '',
        email: '',
        phone: '',
        birth: '',
        gender: '',
    });
    const [openInquiryId, setOpenInquiryId] = useState(null);
    const [pwFields, setPwFields] = useState({ current: '', new1: '', new2: '' });
    const [pwLoading, setPwLoading] = useState(false);
    const [favoritesList, setFavoritesList] = useState([]);
    const [favoritesLoading, setFavoritesLoading] = useState(true);
    const [toast, setToast] = useState(null);

    // (중복 선언 제거)

    // 상담 히스토리 동적 fetch
    useEffect(() => {
        const fetchHistory = async () => {
            const token = localStorage.getItem('access_token');
            const user = localStorage.getItem('user');
            if (!token || !user) {
                setHistoryList([]);
                setCompletedConsultations(0);
                return;
            }
            const userObj = JSON.parse(user);
            try {
                let logs = [];
                if (userObj.role === 'client') {
                    // 내담자(클라이언트)일 때는 별도 API 사용
                    logs = await getClientLogs(userObj.id);
                } else {
                    // 상담사일 때 기존 로직
                    const clients = await getCounselorClients();
                    const myClient = clients.find((c) => String(c.id) === String(userObj.id));
                    logs = myClient?.logs || [];
                }
                // API 필드 → 화면 필드 매핑
                const mapped = logs.map((log) => ({
                    id: log.id,
                    counselor:
                        log.counselor_name || log.counselor ? `${log.counselor_name || log.counselor} 상담사` : '',
                    date: log.created_at ? log.created_at.slice(0, 10).replace(/-/g, '.') : '',
                    time: log.created_at ? log.created_at.slice(11, 16) : '',
                    type: log.session_type || '상담',
                    status: '상담 완료',
                    topic: log.title || '',
                    summary: log.summary || '',
                    feedback: log.content || '',
                    nextStep: log.action_plan || '',
                }));
                setHistoryList(mapped);
                setCompletedConsultations(mapped.length);
            } catch (e) {
                setHistoryList([]);
                setCompletedConsultations(0);
            }
        };
        fetchHistory();
    }, [userInfo.id]);

    const showToast = (msg) => {
        setToast(msg);
        setTimeout(() => setToast(null), 2500);
    };

    useEffect(() => {
        const user = localStorage.getItem('user');
        const token = localStorage.getItem('access_token');
        if (user) {
            const userObj = JSON.parse(user);
            setUserInfo((prev) => ({ ...prev, id: userObj.id }));
            if (!token || isTokenExpired(token)) {
                alert('로그인 세션이 만료되었습니다. 다시 로그인 해주세요.');
                localStorage.removeItem('access_token');
                localStorage.removeItem('user');
                navigate('/login');
                return;
            }
            setFavoritesLoading(true);
            Promise.all([getUserInfo(userObj.id), getFavorites(token)])
                .then(([userData, favoritesData]) => {
                    setUserInfo((prev) => ({
                        ...prev,
                        name: userData.full_name,
                        username: userData.username,
                        email: userData.email,
                        phone: userData.phone_number,
                        birth: userData.birth || '',
                        gender: userData.gender || '',
                    }));
                    setFavoritesList(favoritesData.favorites || []);
                    setFavoritesLoading(false);
                })
                .catch((err) => {
                    setFavoritesLoading(false);
                    if (err?.response?.status === 401) {
                        alert('로그인 세션이 만료되었습니다. 다시 로그인 해주세요.');
                        localStorage.removeItem('access_token');
                        localStorage.removeItem('user');
                        navigate('/login');
                    } else {
                        setFavoritesList([]);
                    }
                });
        }
    }, [navigate]);

    const menuItems = [
        { id: 'history', label: '상담 히스토리', icon: History },
        { id: 'inquiry', label: '문의내역', icon: MessagesSquare },
        { id: 'favorites', label: '찜내역', icon: Heart },
        { id: 'tickets', label: '결제 및 이용내역', icon: Wallet },
        { id: 'profile', label: '계정 설정', icon: Settings },
    ];

    // ★ activeMenu 또는 activeSubMenu 변경 시 콘텐츠 영역 스크롤 최상단으로
    useEffect(() => {
        if (contentRef.current) {
            contentRef.current.scrollTop = 0;
        }
        // 혹시 window 자체가 스크롤되는 환경도 커버
        window.scrollTo(0, 0);
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
    }, [activeMenu, activeSubMenu]);

    const handleMenuClick = (id) => {
        setActiveMenu(id);
        setActiveSubMenu(null);
        setSelectedConsultation(null);
    };

    const handleBackToDashboard = () => {
        setActiveMenu('dashboard');
    };

    const toggleNotif = (key) => setNotifSettings((prev) => ({ ...prev, [key]: !prev[key] }));

    const handleLogout = () => {
        localStorage.removeItem('user');
        navigate('/');
    };

    const handleDeleteAccount = async () => {
        if (!withdrawAgree) {
            alert('유의사항 동의가 필요합니다.');
            return;
        }
        if (!userInfo.id) {
            alert('로그인 정보가 없습니다.');
            return;
        }
        if (!window.confirm('정말로 계정을 영구 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) return;
        setWithdrawLoading(true);
        try {
            await deleteAccount(Number(userInfo.id));
            alert('계정이 영구 삭제되었습니다.');
            handleLogout();
        } catch (e) {
            alert('계정 삭제에 실패했습니다.');
        } finally {
            setWithdrawLoading(false);
        }
    };

    const handleSaveProfile = async () => {
        try {
            await updateUserInfo({
                id: userInfo.id,
                full_name: userInfo.name,
                email: userInfo.email,
                phone_number: userInfo.phone,
            });
            alert('개인정보가 성공적으로 수정되었습니다.');
        } catch (e) {
            alert('개인정보 수정에 실패했습니다.');
        }
    };

    const handleChangePassword = async () => {
        if (!pwFields.current || !pwFields.new1 || !pwFields.new2) {
            alert('모든 비밀번호 입력란을 채워주세요.');
            return;
        }
        if (pwFields.new1.length < 8 || !/[A-Za-z]/.test(pwFields.new1) || !/[0-9]/.test(pwFields.new1)) {
            alert('새 비밀번호는 8자 이상, 영문+숫자를 포함해야 합니다.');
            return;
        }
        if (pwFields.new1 !== pwFields.new2) {
            alert('새 비밀번호가 일치하지 않습니다.');
            return;
        }
        setPwLoading(true);
        try {
            await changePassword({
                user_id: userInfo.id,
                current_password: pwFields.current,
                new_password: pwFields.new1,
            });
            alert('비밀번호가 성공적으로 변경되었습니다.');
            setPwFields({ current: '', new1: '', new2: '' });
        } catch (e) {
            alert(e?.response?.data?.detail || '비밀번호 변경에 실패했습니다.');
        } finally {
            setPwLoading(false);
        }
    };

    const handleUnfavorite = async (id, e, onUpdate) => {
        e.stopPropagation();
        setFavoritesList((prev) => prev.filter((item) => String(item.id ?? item.counselor_id) !== String(id)));
        if (typeof onUpdate === 'function') onUpdate(id, false);
        showToast('찜이 취소되었습니다.');
        const token = localStorage.getItem('access_token');
        if (!token) {
            alert('로그인 후 이용 가능한 기능입니다.');
            return;
        }
        try {
            await toggleFavorite(id, token);
            const data = await getFavorites(token);
            setFavoritesList(data.favorites || []);
        } catch (err) {
            alert('찜 해제 처리 중 오류가 발생했습니다.');
        }
    };

    const renderHistoryDetail = () => {
        if (selectedConsultation) {
            return (
                <div className="consultation-detail-container">
                    <button onClick={() => setSelectedConsultation(null)} className="back-button">
                        <ArrowLeft size={16} /> 전체 목록으로
                    </button>
                    <div className="report-card">
                        <div className="report-header">
                            <div>
                                <span className="badge">Consultation Report</span>
                                <h3 className="report-title">{selectedConsultation.topic}</h3>
                                <p className="report-meta">
                                    {selectedConsultation.counselor} • {selectedConsultation.date}{' '}
                                    {selectedConsultation.time}
                                </p>
                            </div>
                            <div className="icon-wrapper-outer">
                                <div className="icon-wrapper-inner">
                                    <ClipboardList size={24} />
                                </div>
                            </div>
                        </div>
                        <div className="report-body">
                            <section className="report-section">
                                <h4 className="section-title">
                                    <div className="title-indicator"></div>상담 요약
                                </h4>
                                <div className="summary-box">
                                    <p
                                        className="summary-text"
                                        dangerouslySetInnerHTML={{
                                            __html: (selectedConsultation.summary || '').replace(/\n/g, '<br />'),
                                        }}
                                    />
                                </div>
                            </section>
                            <section className="report-section">
                                <h4 className="section-title">
                                    <div className="title-indicator"></div>전문가 소견
                                </h4>
                                <div className="feedback-wrapper">
                                    <p
                                        className="feedback-text"
                                        dangerouslySetInnerHTML={{
                                            __html: (selectedConsultation.feedback || '').replace(/\n/g, '<br />'),
                                        }}
                                    />
                                </div>
                            </section>
                            <section className="action-step-card">
                                <h4 className="action-step-title">
                                    <Target size={20} />
                                    다음 상담까지의 실천 과제
                                </h4>
                                <p
                                    className="action-step-content"
                                    dangerouslySetInnerHTML={{
                                        __html: ('"' + (selectedConsultation.nextStep || '') + '"').replace(
                                            /\n/g,
                                            '<br />'
                                        ),
                                    }}
                                />
                            </section>
                        </div>
                        <div className="report-footer">
                            <p className="privacy-notice">이 기록은 오직 소현님과 담당 상담사만 확인할 수 있습니다.</p>
                        </div>
                    </div>
                </div>
            );
        }

        return (
            <div className="fade-in">
                {isMobile && (
                    <button
                        className="mobile-back-btn mobile-back-btn--compact"
                        onClick={handleBackToDashboard}
                        aria-label="뒤로가기"
                    >
                        <ChevronRight className="mp-rotate-180" size={22} />
                    </button>
                )}
                <div className={isMobile ? 'mp-mobile-top-offset-48' : ''}>
                    <div className="history-header">
                        <div>
                            <h3 className="history-title">상담 히스토리</h3>
                            <p className="history-subtitle">
                                {userInfo.name
                                    ? `${userInfo.name}님이 걸어온 마음의 발자취입니다.`
                                    : '상담 내역입니다.'}
                            </p>
                        </div>
                        <div className="history-total-badge-wrapper">
                            <span className="history-total-badge">총 {completedConsultations}회 상담 완료</span>
                        </div>
                    </div>
                    <div className="history-list-container">
                        {historyList.length === 0 ? (
                            <div className="history-list-empty">
                                <CalendarDays size={32} />
                                <p className="history-list-empty-title">상담 기록이 없습니다</p>
                                <p className="history-list-empty-desc">상담이 완료되면 이곳에 기록이 표시됩니다.</p>
                            </div>
                        ) : (
                            historyList.map((item) => (
                                <div
                                    key={item.id}
                                    onClick={() => setSelectedConsultation(item)}
                                    className="history-item-card"
                                >
                                    <div className="history-item-main">
                                        <div className="history-icon-box">
                                            <CalendarDays size={24} />
                                        </div>
                                        <div>
                                            <div className="history-item-meta">
                                                <span className="meta-date">
                                                    {item.date} {item.time}
                                                </span>
                                                <span className="meta-type">{item.type}</span>
                                            </div>
                                            <h4 className="history-item-counselor">{item.counselor}</h4>
                                            <p className="history-item-topic">상담 주제: {item.topic}</p>
                                        </div>
                                    </div>
                                    <div className="history-item-right">
                                        <div className="history-link-text">
                                            <p>상담 기록지 보기</p>
                                        </div>
                                        <ChevronRight size={20} className="history-arrow-icon" />
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        );
    };

    const renderTicketsDetail = () => (
        <div className="fade-in">
            {isMobile && (
                <button
                    className="mobile-back-btn mobile-back-btn--compact"
                    onClick={handleBackToDashboard}
                    aria-label="뒤로가기"
                >
                    <ChevronRight className="mp-rotate-180" size={22} />
                </button>
            )}
            <div className={isMobile ? 'mp-mobile-top-offset-48' : ''}>
                <div className="ph-header">
                    <h2 className="ph-header-title">결제 내역</h2>
                    <p className="ph-header-desc">상담 예약금 및 추가 결제 내역을 확인할 수 있습니다.</p>
                </div>

                <div className="ph-grid">
                    <div className="ph-col-main">
                        <section className="ph-highlight-card">
                            <div className="ph-highlight-inner">
                                <div className="ph-highlight-meta">
                                    <span className="ph-status-badge">
                                        <CheckCircle2 size={14} /> 예약 확정
                                    </span>
                                    <span className="ph-highlight-date">결제일시: 2026. 05. 20 14:32</span>
                                </div>

                                <h3 className="ph-highlight-title">이지은 상담사 - 1:1 심리상담</h3>
                                <p className="ph-highlight-schedule">2026. 05. 27 (수) 오후 2:00 예정</p>

                                <div className="ph-highlight-payment-box">
                                    <div className="ph-payment-info">
                                        <div className="ph-payment-icon-wrap">
                                            <CreditCard className="ph-payment-icon" size={24} />
                                        </div>
                                        <div>
                                            <p className="ph-payment-label">결제 금액 (예약금)</p>
                                            <p className="ph-payment-amount">
                                                20,000<span className="ph-payment-amount-unit">원</span>
                                            </p>
                                        </div>
                                    </div>
                                    <div className="ph-highlight-actions">
                                        <button className="ph-detail-btn" onClick={() => navigate('/reservation')}>
                                            예약 상세 보기
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section className="ph-history-section">
                            <h4 className="ph-history-heading">
                                <History className="ph-history-heading-icon" size={20} />
                                전체 결제 내역
                            </h4>
                            <div className="ph-table-wrap">
                                <div className="ph-table-scroll">
                                    <table className="ph-table">
                                        <thead className="ph-table-head">
                                            <tr>
                                                <th className="ph-table-th">결제일시</th>
                                                <th className="ph-table-th ph-table-th--right">금액</th>
                                                <th className="ph-table-th ph-table-th--center">상태</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {PAYMENT_HISTORY.map((item) => (
                                                <tr key={item.id} className="ph-table-row">
                                                    <td className="ph-table-td">
                                                        <p className="ph-td-date-main">{item.date}</p>
                                                        <p className="ph-td-date-sub">{item.time}</p>
                                                        {(() => {
                                                            const match = item.title.match(/^(.*?) 상담사/);
                                                            if (match) {
                                                                return (
                                                                    <span className="ph-counselor-name">
                                                                        {match[1]} 상담사
                                                                    </span>
                                                                );
                                                            }
                                                            return (
                                                                <span className="ph-counselor-name">{item.title}</span>
                                                            );
                                                        })()}
                                                        <p className="ph-td-method">{item.method}</p>
                                                    </td>
                                                    <td className="ph-table-td ph-td-amount-wrap">
                                                        <p className="ph-td-amount">{item.amount}원</p>
                                                    </td>
                                                    <td className="ph-table-td ph-td-status-wrap">
                                                        <span
                                                            className={`ph-status-pill ${
                                                                item.status === '결제완료'
                                                                    ? 'ph-status-pill--complete'
                                                                    : 'ph-status-pill--cancel'
                                                            }`}
                                                        >
                                                            {item.status}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </section>
                    </div>

                    <div className={`ph-col-side ${isMobile ? 'ph-col-side--mobile-spaced' : ''}`}>
                        <div className="ph-panel-card">
                            <h4 className="ph-panel-heading">
                                <AlertCircle size={16} className="ph-panel-heading-icon" />
                                예약금 및 환불 규정
                            </h4>
                            <ul className="ph-refund-list">
                                <li className="ph-refund-item">
                                    <div className="ph-refund-dot ph-refund-dot--green" />
                                    <p>
                                        상담 예약 확정을 위해 <strong>20,000원의 예약금</strong> 결제가 필요합니다.
                                    </p>
                                </li>
                                <li className="ph-refund-item">
                                    <div className="ph-refund-dot ph-refund-dot--green" />
                                    <p>
                                        상담 시작 <strong>24시간 전</strong> 취소 시 예약금은 100% 환불됩니다.
                                    </p>
                                </li>
                                <li className="ph-refund-item">
                                    <div className="ph-refund-dot ph-refund-dot--amber" />
                                    <p>상담 시작 24시간 이내 취소 또는 노쇼(No-Show) 시 예약금은 환불되지 않습니다.</p>
                                </li>
                            </ul>
                        </div>

                        <div className="ph-panel-card">
                            <h4 className="ph-panel-heading">
                                <Receipt size={16} className="ph-panel-heading-icon" />
                                증빙 서류 발급 안내
                            </h4>
                            <p className="ph-receipt-desc">
                                결제하신 예약금 및 상담비에 대한 현금영수증 및 카드 전표가 필요한 경우 고객센터 혹은 1:1
                                문의를 통해 발급을 요청하실 수 있습니다.
                            </p>
                            <button className="ph-inquiry-btn">1:1 문의하기</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderPersonalEdit = () => (
        <div className="fade-in mp-w-full">
            <div className="profile-edit-section">
                <div className="profile-upper-layout">
                    <div className="profile-image-container">
                        <div className="profile-image-wrapper">
                            <div className="profile-avatar">
                                <img src="https://api.dicebear.com/7.x/notionists/svg?seed=Sohyun" alt="User Profile" />
                            </div>
                            <button className="profile-camera-btn">
                                <Camera size={24} />
                            </button>
                        </div>
                        <p className="profile-change-text">프로필 사진 변경</p>
                        <p className="profile-change-sub">나를 잘 나타내는 사진을 등록해 주세요.</p>
                    </div>
                    <div className="profile-info-fields">
                        <div className="profile-info-row">
                            <div className="profile-info-half">
                                <label className="input-label">이름</label>
                                <div className="relative-input-box">
                                    <User className="input-icon" size={20} />
                                    <input
                                        type="text"
                                        className="custom-input"
                                        value={userInfo.name}
                                        onChange={(e) => setUserInfo({ ...userInfo, name: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="profile-info-half">
                                <label className="input-label">성별</label>
                                <div className="relative-input-box">
                                    <input
                                        type="text"
                                        className="custom-input bg-readonly"
                                        value={
                                            userInfo.gender === 'female'
                                                ? '여성'
                                                : userInfo.gender === 'male'
                                                  ? '남성'
                                                  : ''
                                        }
                                        readOnly
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="profile-info-row">
                            <div className="profile-info-half">
                                <label className="input-label">생년월일</label>
                                <div className="relative-input-box">
                                    <Calendar className="input-icon" size={20} />
                                    <input
                                        type="date"
                                        className="custom-input"
                                        value={userInfo.birth}
                                        onChange={(e) => setUserInfo({ ...userInfo, birth: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="profile-info-half">
                                <label className="input-label">휴대폰 번호</label>
                                <div className="relative-input-box">
                                    <Phone className="input-icon" size={20} />
                                    <input
                                        type="tel"
                                        className="custom-input"
                                        value={userInfo.phone}
                                        onChange={(e) => setUserInfo({ ...userInfo, phone: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="profile-readonly-grid">
                    <div className="grid-col-1">
                        <label className="input-label">아이디</label>
                        <div className="relative-input-box">
                            <Hash className="input-icon" size={20} />
                            <input
                                type="text"
                                className="custom-input bg-readonly"
                                value={userInfo.username}
                                readOnly
                            />
                        </div>
                        <p className="input-helper-text">* 아이디는 변경할 수 없습니다.</p>
                    </div>
                    <div className="grid-col-1">
                        <label className="input-label">이메일 주소</label>
                        <div className="relative-input-box">
                            <Mail className="input-icon" size={20} />
                            <input
                                type="email"
                                className="custom-input"
                                value={userInfo.email}
                                onChange={(e) => setUserInfo({ ...userInfo, email: e.target.value })}
                            />
                        </div>
                        <p className="input-helper-text">* 이메일은 수정 가능합니다.</p>
                    </div>
                </div>
            </div>
            <div className="profile-edit-section">
                <h4 className="security-section-title">
                    <div className="security-icon-box">
                        <ShieldCheck size={24} />
                    </div>
                    로그인 보안 설정
                </h4>
                <div className="security-fields-layout">
                    <div>
                        <label className="input-label">현재 비밀번호</label>
                        <div className="relative-input-box">
                            <Lock className="input-icon" size={20} />
                            <input
                                type="password"
                                placeholder="현재 비밀번호를 입력해 주세요"
                                className="custom-input"
                                value={pwFields.current}
                                onChange={(e) => setPwFields((f) => ({ ...f, current: e.target.value }))}
                                autoComplete="current-password"
                                disabled={pwLoading}
                            />
                        </div>
                    </div>
                    <div className="security-password-grid security-password-grid--relative">
                        <div>
                            <label className="input-label">새 비밀번호</label>
                            <div className="relative-input-box">
                                <KeyRound className="input-icon" size={20} />
                                <input
                                    type="password"
                                    placeholder="8자 이상 영문+숫자"
                                    className="custom-input"
                                    value={pwFields.new1}
                                    onChange={(e) => setPwFields((f) => ({ ...f, new1: e.target.value }))}
                                    autoComplete="new-password"
                                    disabled={pwLoading}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="input-label">새 비밀번호 확인</label>
                            <div className="relative-input-box">
                                <KeyRound className="input-icon" size={20} />
                                <input
                                    type="password"
                                    placeholder="다시 한번 입력해 주세요"
                                    className="custom-input"
                                    value={pwFields.new2}
                                    onChange={(e) => setPwFields((f) => ({ ...f, new2: e.target.value }))}
                                    autoComplete="new-password"
                                    disabled={pwLoading}
                                />
                            </div>
                        </div>
                    </div>
                    {pwFields.new1 && pwFields.new2 && pwFields.new1 !== pwFields.new2 && (
                        <div className="password-mismatch-text">비밀번호가 일치하지 않습니다.</div>
                    )}
                    <div className="profile-action-row">
                        <button
                            className={`pw-change-btn ${pwLoading ? 'is-loading' : ''}`}
                            onClick={handleChangePassword}
                            disabled={pwLoading}
                        >
                            <CheckCircle2 size={16} className="pw-change-btn-icon" />
                            비밀번호 변경
                        </button>
                    </div>
                </div>
            </div>
            <div className="profile-save-btn-row">
                <button className="profile-save-full-btn" onClick={handleSaveProfile}>
                    <CheckCircle2 size={20} />
                    변경사항 저장
                </button>
            </div>
        </div>
    );

    const renderNotificationEdit = () => (
        <NotificationSettings notifSettings={notifSettings} toggleNotif={toggleNotif} />
    );

    const renderQuitService = () => (
        <div className="wd-page-container">
            <div className="wd-inner-wrapper">
                <div className="wd-header">
                    <button className="wd-back-btn" onClick={() => setActiveSubMenu(null)}>
                        <ArrowLeft size={16} /> 계정 설정으로 돌아가기
                    </button>
                    <h2 className="wd-page-title">서비스 탈퇴</h2>
                    <p className="wd-page-subtitle">탈퇴 시 소중한 기록들이 모두 삭제됩니다.</p>
                </div>
                <div className="wd-withdraw-wrapper wd-fade-in">
                    <div className="wd-top-grid">
                        <div className="wd-notice-card">
                            <h4 className="wd-card-title">탈퇴 시 삭제되는 항목</h4>
                            <div className="wd-notice-list">
                                {[
                                    {
                                        label: '보유 이용권 및 포인트 즉시 소멸',
                                        sub: '환불 불가 — 탈퇴 전 사용을 권장드려요.',
                                    },
                                    {
                                        label: '상담 히스토리 전체 삭제',
                                        sub: '기록은 복구되지 않으며, 영구적으로 제거됩니다.',
                                    },
                                    {
                                        label: '동일 정보로 30일간 재가입 불가',
                                        sub: '이메일과 전화번호 기준으로 제한됩니다.',
                                    },
                                ].map((n) => (
                                    <div key={n.label} className="wd-notice-item">
                                        <div className="wd-notice-bullet" />
                                        <div>
                                            <p className="wd-notice-label">{n.label}</p>
                                            <p className="wd-notice-sub">{n.sub}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="wd-stats-column">
                            <div className="wd-stat-card">
                                <p className="wd-stat-label">잔여 이용권</p>
                                <div>
                                    <span className="wd-stat-value">{ticketCount}</span>
                                    <span className="wd-stat-unit">회</span>
                                </div>
                                <p className="wd-stat-warning">탈퇴 시 환불 불가</p>
                            </div>
                            <div className="wd-stat-card">
                                <p className="wd-stat-label">완료한 상담</p>
                                <div>
                                    <span className="wd-stat-value">{completedConsultations}</span>
                                    <span className="wd-stat-unit">회</span>
                                </div>
                                <p className="wd-stat-warning">기록 전체 삭제</p>
                            </div>
                        </div>
                    </div>
                    <div className="wd-bottom-card">
                        <label className="wd-agree-box">
                            <div className="wd-checkbox-wrapper">
                                <input
                                    type="checkbox"
                                    checked={withdrawAgree}
                                    onChange={(e) => setWithdrawAgree(e.target.checked)}
                                />
                                <div className="wd-check-display">
                                    {withdrawAgree && <Check size={11} strokeWidth={4} />}
                                </div>
                            </div>
                            <span className="wd-agree-text">위 유의사항을 모두 확인하였으며 이에 동의합니다.</span>
                        </label>
                        <button
                            className="wd-delete-btn"
                            onClick={handleDeleteAccount}
                            disabled={!withdrawAgree || withdrawLoading}
                        >
                            {withdrawLoading ? '처리 중...' : '마인드웰 계정 영구 삭제'}
                        </button>
                        <div className="wd-suggestion-box">
                            <Lightbulb size={16} className="wd-suggestion-icon" />
                            <p>
                                탈퇴 대신{' '}
                                <span className="wd-highlight" onClick={() => setActiveSubMenu('notification')}>
                                    알림 설정
                                </span>
                                이나 <span className="wd-highlight">상담 일시 중지</span>를 이용해 보세요.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderProfileDetail = () => {
        const details = {
            personal: {
                title: '개인정보 수정 및 보안',
                desc: '회원님의 소중한 정보와 비밀번호를 안전하게 관리하세요.',
            },
            notification: { title: '알림 설정', desc: '상담 일정 및 서비스 소식을 전해드릴게요.' },
            quit: { title: '서비스 탈퇴', desc: '탈퇴 시 소중한 기록들이 모두 삭제됩니다.' },
        };
        if (activeSubMenu === 'quit') return renderQuitService();
        const current = details[activeSubMenu];
        return (
            <div className="fade-in mp-w-full">
                <div className="submenu-container">
                    <div className="submenu-header-section">
                        <button onClick={() => setActiveSubMenu(null)} className="submenu-back-btn">
                            <ArrowLeft size={16} /> 계정 설정으로 돌아가기
                        </button>
                        <h3 className="submenu-main-title">{current.title}</h3>
                        <p className="submenu-description">{current.desc}</p>
                    </div>
                    <div className="submenu-content-area">
                        {activeSubMenu === 'personal' && renderPersonalEdit()}
                        {activeSubMenu === 'notification' && renderNotificationEdit()}
                    </div>
                </div>
            </div>
        );
    };

    // 문의내역 state 및 fetch
    const [inquiryList, setInquiryList] = useState([]);
    const [inquiryLoading, setInquiryLoading] = useState(false);
    useEffect(() => {
        if (activeMenu === 'inquiry') {
            setInquiryLoading(true);
            getMyInquiries()
                .then((data) => setInquiryList(data))
                .catch(() => setInquiryList([]))
                .finally(() => setInquiryLoading(false));
        }
    }, [activeMenu]);

    const renderInquiryList = () => {
        return (
            <div className="fade-in">
                {isMobile && (
                    <button
                        className="mobile-back-btn mobile-back-btn--compact"
                        onClick={handleBackToDashboard}
                        aria-label="뒤로가기"
                    >
                        <ChevronRight className="mp-rotate-180" size={22} />
                    </button>
                )}
                <div className={isMobile ? 'mp-mobile-top-offset-48' : ''}>
                    <div className="inq-page-header">
                        <h3 className="inq-page-title">문의내역</h3>
                        <p className="inq-page-sub">접수하신 문의와 답변을 확인하세요.</p>
                    </div>

                    {inquiryLoading ? (
                        <div className="mypage-list-empty">불러오는 중...</div>
                    ) : inquiryList.length === 0 ? (
                        <div className="inq-empty-state">
                            <div className="inq-empty-icon">
                                <MessageSquare size={32} />
                            </div>
                            <p className="inq-empty-title">문의내역이 없습니다</p>
                            <p className="inq-empty-sub">궁금한 점이 있으시면 1:1 문의를 남겨주세요.</p>
                        </div>
                    ) : (
                        <div className="inq-list">
                            {inquiryList.map((item) => (
                                <div key={item.id} className="inq-card">
                                    <div
                                        className="inq-card-header"
                                        onClick={() => setOpenInquiryId(openInquiryId === item.id ? null : item.id)}
                                    >
                                        <div
                                            className={`inq-status-dot ${
                                                item.status === 'pending' ? 'dot-pending' : 'dot-done'
                                            }`}
                                        />
                                        <div className="inq-meta">
                                            <div className="inq-top-row">
                                                <span
                                                    className={`inq-badge ${
                                                        item.status === 'pending' ? 'badge-pending' : 'badge-done'
                                                    }`}
                                                >
                                                    {item.status === 'pending' ? '처리 중' : '답변 완료'}
                                                </span>
                                                <span className="inq-date">
                                                    {item.created_at
                                                        ? new Date(item.created_at).toLocaleDateString()
                                                        : ''}
                                                </span>
                                            </div>
                                            <p className="inq-title">{item.title}</p>
                                            {openInquiryId !== item.id && <p className="inq-preview">{item.content}</p>}
                                        </div>
                                        <ChevronRight
                                            size={18}
                                            className={`inq-arrow-icon ${
                                                openInquiryId === item.id ? 'inq-arrow-open' : ''
                                            }`}
                                        />
                                    </div>

                                    {openInquiryId === item.id && (
                                        <div className="inq-body">
                                            <p className="inq-content-label">문의 내용</p>
                                            <p className="inq-content-text">{item.content}</p>

                                            {item.answer ? (
                                                <div className="inq-answer-block">
                                                    <div className="inq-answer-label">
                                                        <CheckCircle2 size={13} />
                                                        관리자 답변
                                                    </div>
                                                    <p className="inq-answer-text">{item.answer}</p>
                                                </div>
                                            ) : (
                                                <div className="inq-pending-notice">
                                                    <AlertCircle size={14} />
                                                    담당자가 검토 중입니다. 영업일 기준 1~2일 내 답변드릴게요.
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        );
    };

    const renderFavoritesList = () => (
        <div className="fade-in">
            {isMobile && (
                <button
                    className="mobile-back-btn mobile-back-btn--compact"
                    onClick={handleBackToDashboard}
                    aria-label="뒤로가기"
                >
                    <ChevronRight className="mp-rotate-180" size={22} />
                </button>
            )}
            <div className={isMobile ? 'mp-mobile-top-offset-48' : ''}>
                <h3 className="history-title history-title--spaced">찜 목록</h3>
                <ul className="mypage-list mypage-list-grid">
                    {favoritesLoading ? (
                        <li className="mypage-list-empty">불러오는 중...</li>
                    ) : favoritesList.length === 0 ? (
                        <li className="mypage-list-empty">찜내역이 없습니다.</li>
                    ) : (
                        favoritesList.map((item) => {
                            const counselorName =
                                item.counselor_name || item.name || item.full_name
                                    ? `${item.counselor_name || item.name || item.full_name} 상담사`
                                    : '알 수 없는 상담사';
                            let specialtiesArr = [];
                            if (item.field) {
                                specialtiesArr = item.field
                                    .split(',')
                                    .map((f) => f.trim())
                                    .filter(Boolean);
                            } else if (Array.isArray(item.specialties)) {
                                specialtiesArr = item.specialties
                                    .map((s) => s.specialty_name || s.name || s)
                                    .filter(Boolean);
                            }
                            const category = item.category || '';
                            const intro = item.intro || item.description || '';
                            const price = item.price || item.consultation_price || '';
                            const avatarInitial = counselorName.slice(0, 1);
                            const itemId = item.counselor_id ? item.counselor_id : item.id;
                            const shownSpecialties = specialtiesArr.slice(0, 3);
                            const extraCount = specialtiesArr.length - 3;
                            const profileImg =
                                item.profile_img_url ||
                                item.profile_image ||
                                item.profileImg ||
                                item.profile_url ||
                                null;

                            return (
                                <li
                                    key={itemId}
                                    className="mypage-list-item mypage-favorite-item"
                                    onClick={() => navigate('/counselor/' + itemId, { state: { isLiked: true } })}
                                >
                                    <div
                                        className="mypage-favorite-heart"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleUnfavorite(itemId, e);
                                        }}
                                        title="찜 취소"
                                    >
                                        <Heart size={14} color="#e74c3c" fill="#e74c3c" />
                                    </div>
                                    <div className="mypage-favorite-avatar">
                                        {profileImg ? (
                                            <img src={profileImg} alt={counselorName + ' 프로필'} />
                                        ) : (
                                            avatarInitial
                                        )}
                                    </div>
                                    <div className="mypage-favorite-content">
                                        <div className="mypage-list-title">{counselorName}</div>
                                        <div className="mypage-list-meta">
                                            {category && <span className="mypage-list-category">{category}</span>}
                                            {shownSpecialties.map((f, i) => (
                                                <span key={i} className="mypage-list-field">
                                                    {f}
                                                </span>
                                            ))}
                                            {extraCount > 0 && (
                                                <span className="mypage-list-field-extra">+{extraCount}</span>
                                            )}
                                        </div>
                                        {intro && <div className="mypage-list-intro">{intro}</div>}
                                        {price && (
                                            <div className="mypage-list-price">
                                                <span className="price-value">{price}</span>
                                                <span className="mypage-list-cta">상세보기</span>
                                            </div>
                                        )}
                                    </div>
                                </li>
                            );
                        })
                    )}
                </ul>
            </div>
        </div>
    );

    const renderContent = () => {
        if (activeMenu === 'profile' && activeSubMenu) return renderProfileDetail();
        if (activeMenu === 'support') return renderSupportCenter();

        // Remove purchase banner (더 많은 위로가 필요하신가요? 및 이용권 충전하기)
        // Only remove the dash-purchase-banner block below
        switch (activeMenu) {
            case 'history':
                return renderHistoryDetail();
            case 'inquiry':
                return renderInquiryList();
            case 'favorites':
                return renderFavoritesList();
            case 'tickets':
                return renderTicketsDetail();
            case 'profile':
                return (
                    <div className="fade-in fade-in--relative">
                        {isMobile && !activeSubMenu && (
                            <button
                                className="mobile-back-btn mobile-back-btn--flush"
                                onClick={handleBackToDashboard}
                                aria-label="뒤로가기"
                            >
                                <ChevronRight className="mp-rotate-180" size={22} />
                            </button>
                        )}
                        <div className={isMobile && !activeSubMenu ? 'mp-mobile-top-offset-48' : ''}>
                            <h3
                                className={`account-main-title ${
                                    isMobile ? 'account-main-title--mobile' : 'account-main-title--desktop'
                                }`}
                            >
                                계정 설정
                            </h3>
                            <div className="setting-items-list">
                                {[
                                    { key: 'personal', label: '개인정보 수정 및 보안', icon: User, type: 'personal' },
                                    { key: 'notification', label: '알림 설정', icon: Bell, type: 'notification' },
                                    { key: 'quit', label: '서비스 탈퇴', icon: UserX, type: 'quit' },
                                ].map((item) => (
                                    <div
                                        key={item.key}
                                        className="setting-item-card"
                                        onClick={() => setActiveSubMenu(item.key)}
                                    >
                                        <div className={`setting-item-left is-${item.type}`}>
                                            <div className={`setting-item-icon-box is-${item.type}`}>
                                                <item.icon size={20} />
                                            </div>
                                            <span className="setting-item-label">{item.label}</span>
                                        </div>
                                        <ChevronRight size={20} className="setting-item-arrow" />
                                    </div>
                                ))}
                            </div>
                            <div className="account-logout-section">
                                <button className="account-logout-btn" onClick={handleLogout}>
                                    <LogOut size={20} />
                                    로그아웃
                                </button>
                            </div>
                        </div>
                    </div>
                );
            default:
                return (
                    <div className="fade-in">
                        <div className="dash-status-grid">
                            <div className="dash-status-item" onClick={() => handleMenuClick('tickets')}>
                                <div className="status-icon-box bg-amber">
                                    <Wallet size={18} />
                                </div>
                                <p className="status-label">결제 및 이용내역</p>
                                <p className="status-value">
                                    {ticketCount}
                                    <span className="unit">회</span>
                                </p>
                            </div>
                            <div className="dash-status-item" onClick={() => navigate('/reserve')}>
                                <div className="status-icon-box bg-blue">
                                    <CalendarHeart size={18} />
                                </div>
                                <p className="status-label">대기 중인 예약</p>
                                <p className="status-value">
                                    1<span className="unit">건</span>
                                </p>
                            </div>
                            <div className="dash-status-item" onClick={() => handleMenuClick('history')}>
                                <div className="status-icon-box bg-rose">
                                    <History size={18} />
                                </div>
                                <p className="status-label">완료한 상담</p>
                                <p className="status-value">
                                    {completedConsultations}
                                    <span className="unit">회</span>
                                </p>
                            </div>
                        </div>
                        <div className="dash-hero-card">
                            <div className="hero-content">
                                <div className="hero-icon-wrapper">
                                    <MessagesSquare size={28} />
                                </div>
                                <div className="hero-text-group">
                                    {primaryBooking ? (
                                        <>
                                            <div className="hero-badge-row">
                                                <span className="hero-d-badge">
                                                    D-{getDDay(primaryBooking.date, primaryBooking.time)}
                                                </span>
                                                <p className="hero-subtitle">Next Session</p>
                                            </div>
                                            <h3 className="hero-main-title">
                                                {primaryBooking.date} {primaryBooking.time}
                                            </h3>
                                            <p className="mypage-hero-desc">
                                                {primaryBooking.name} 상담사와 1:1 상담 예정
                                            </p>
                                        </>
                                    ) : (
                                        <>
                                            <div className="hero-badge-row">
                                                <span className="hero-d-badge">-</span>
                                                <p className="hero-subtitle">Next Session</p>
                                            </div>
                                            <h3 className="hero-main-title">다가오는 예약이 없습니다</h3>
                                            <p className="mypage-hero-desc">상담 예약을 진행해 주세요.</p>
                                        </>
                                    )}
                                </div>
                            </div>
                            <button className="hero-action-btn" onClick={() => handleMenuClick('history')}>
                                상담 상세 보기 <ChevronRight size={18} />
                            </button>
                        </div>
                        <div className="dash-section-header">
                            <h3 className="section-title">
                                <History size={20} className="mp-history-title-icon" /> 최근 상담 기록
                            </h3>
                            <button onClick={() => handleMenuClick('history')} className="section-more-btn">
                                전체보기
                            </button>
                        </div>
                        <div className="dash-history-list">
                            {historyList && historyList.length > 0 ? (
                                historyList.slice(0, 2).map((item, idx) => (
                                    <div
                                        key={item.id}
                                        className="dash-history-card"
                                        onClick={() => handleMenuClick('history')}
                                    >
                                        <div className="history-info-group">
                                            <div className="history-icon-box">
                                                <MessageSquareHeart size={20} />
                                            </div>
                                            <div>
                                                <div className="history-title-row">
                                                    <p className="counselor-name">{item.counselor}</p>
                                                    <span className="status-tag">{item.status}</span>
                                                </div>
                                                <p className="history-meta">
                                                    {item.date} • {item.type}
                                                </p>
                                            </div>
                                        </div>
                                        <button className="history-arrow-btn">
                                            <ChevronRight size={18} />
                                        </button>
                                    </div>
                                ))
                            ) : (
                                <div className="dash-history-card dash-history-card--empty">
                                    <div className="history-info-group">
                                        <div className="history-icon-box">
                                            <MessageSquareHeart size={20} />
                                        </div>
                                        <div>
                                            <div className="history-title-row">
                                                <p className="counselor-name">상담 기록이 없습니다</p>
                                            </div>
                                            <p className="history-meta">상담 완료 후 기록이 표시됩니다.</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                        {/* dash-purchase-banner (더 많은 위로가 필요하신가요? 및 이용권 충전하기) 영역 제거됨 */}
                        <section className="mobile-only-menu mobile-only-menu--spaced">
                            <h4 className="mobile-menu-label">전체 메뉴</h4>
                            <div className="mobile-menu-group">
                                <div onClick={() => handleMenuClick('history')} className="mobile-menu-item border-b">
                                    <span>상담 히스토리</span>
                                    <ChevronRight size={16} />
                                </div>
                                <div onClick={() => handleMenuClick('tickets')} className="mobile-menu-item border-b">
                                    <span>이용권/결제</span>
                                    <ChevronRight size={16} />
                                </div>
                                <div onClick={() => handleMenuClick('inquiry')} className="mobile-menu-item border-b">
                                    <span>문의내역</span>
                                    <ChevronRight size={16} />
                                </div>
                                <div onClick={() => handleMenuClick('favorites')} className="mobile-menu-item border-b">
                                    <span>찜 내역</span>
                                    <ChevronRight size={16} />
                                </div>
                            </div>
                            <div className="mobile-menu-group mp-mt-4">
                                <div onClick={() => handleMenuClick('profile')} className="mobile-menu-item border-b">
                                    <span>계정 설정</span>
                                    <ChevronRight size={16} />
                                </div>
                                <div className="mobile-menu-item text-rose mp-cursor-pointer" onClick={handleLogout}>
                                    <span>로그아웃</span>
                                </div>
                            </div>
                        </section>
                    </div>
                );
        }
    };

    const [showAllNotifications, setShowAllNotifications] = useState(false);
    const renderNotifications = () => {
        const maxCount = isMobile ? 6 : 10;
        const hasMore = notifications.length > maxCount;
        const visibleNotifications = showAllNotifications ? notifications : notifications.slice(0, maxCount);
        return (
            <>
                {isMobile && (
                    <button className="mobile-back-btn mobile-back-btn--with-label" onClick={handleBackToDashboard}>
                        <ChevronRight className="mp-rotate-180" size={20} /> 뒤로가기
                    </button>
                )}
                <div className={isMobile ? 'mp-mobile-top-offset-56' : ''}>
                    <div className="cmp-page-header">
                        <h2 className="cmp-page-title">알림 센터</h2>
                        <p className="cmp-page-sub">상담 일정, 예약 확정 등 최근 알림을 확인하세요.</p>
                    </div>
                    <div className="cmp-list-card">
                        {notifications.length === 0 ? (
                            <div className="cmp-notif-empty">
                                <div className="cmp-notif-empty-icon">
                                    <Bell size={22} />
                                </div>
                                <p className="cmp-notif-empty-title">새로운 알림이 없습니다</p>
                            </div>
                        ) : (
                            <>
                                <div className="cmp-notif-group-label">최근 알림</div>
                                {visibleNotifications.map((item) => (
                                    <div key={item.id} className={`cmp-notif-item${!item.read ? ' unread' : ''}`}>
                                        <span className="cmp-item-avatar notif">
                                            {item.type === 'booking' && <Check size={15} />}
                                            {item.type === 'booking_request' && <CalendarHeart size={15} />}
                                            {item.type === 'booking_confirm' && <CheckCircle2 size={15} />}
                                            {item.type === 'booking_reject' && <XCircle size={15} />}
                                            {item.type === 'msg' && <MessageSquare size={15} />}
                                            {item.type === 'notice' && <AlertCircle size={15} />}
                                            {item.type === 'counsel_log' && <ClipboardList size={15} />}
                                            {item.type === 'inquiry' && <Mail size={15} />}
                                            {item.type === 'inquiry_answered' && <Mail size={15} />}
                                            {/* type이 없거나 매칭 안될 때 기본 아이콘 */}
                                            {![
                                                'booking',
                                                'booking_request',
                                                'booking_confirm',
                                                'booking_reject',
                                                'msg',
                                                'notice',
                                                'counsel_log',
                                                'inquiry',
                                                'inquiry_answered',
                                            ].includes(item.type) && <Bell size={15} />}
                                        </span>
                                        <div className="cmp-notif-content">
                                            <div className="cmp-notif-title">{item.title}</div>
                                            <div className="cmp-notif-desc">{item.desc}</div>
                                        </div>
                                        <div className="cmp-notif-meta">
                                            <span className="cmp-notif-time">
                                                {new Date(item.created_at).toLocaleString()}
                                            </span>
                                            {!item.read && <span className="cmp-notif-dot" />}
                                        </div>
                                    </div>
                                ))}
                                {hasMore && !showAllNotifications && (
                                    <button
                                        className="cmp-notif-more-btn"
                                        onClick={() => setShowAllNotifications(true)}
                                    >
                                        더보기
                                    </button>
                                )}
                                {showAllNotifications && hasMore && (
                                    <button
                                        className="cmp-notif-more-btn"
                                        onClick={() => setShowAllNotifications(false)}
                                    >
                                        접기
                                    </button>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </>
        );
    };

    return (
        <div className="mypage-layout-root">
            {toast && <div className="mp-toast">{toast}</div>}

            <aside className="mypage-sidebar">
                <div
                    className="sidebar-logo-section mp-cursor-pointer"
                    onClick={(e) => {
                        e.stopPropagation();
                        navigate('/');
                    }}
                >
                    <h1 className="sidebar-brand-logo">MINDWELL</h1>
                    <p className="sidebar-brand-sub">Mental Health Care</p>
                </div>

                <nav className="sidebar-nav-list">
                    <div
                        onClick={() => handleMenuClick('dashboard')}
                        className={`sidebar-nav-item ${activeMenu === 'dashboard' ? 'is-active' : ''}`}
                    >
                        <Settings size={20} />
                        <span>대시보드</span>
                    </div>
                    <div
                        onClick={() => setActiveMenu('notifications')}
                        className={`sidebar-nav-item ${activeMenu === 'notifications' ? 'is-active' : ''}`}
                    >
                        <Bell size={20} />
                        <span>알림센터</span>
                    </div>
                    {menuItems.map((item) => (
                        <div
                            key={item.id}
                            onClick={() => handleMenuClick(item.id)}
                            className={`sidebar-nav-item ${activeMenu === item.id ? 'is-active' : ''}`}
                        >
                            <item.icon size={20} />
                            <span>{item.label}</span>
                        </div>
                    ))}
                </nav>

                <div className="sidebar-footer-nav">
                    <div
                        className={`sidebar-nav-item${activeMenu === 'support' ? ' is-active' : ''} mp-cursor-pointer`}
                        onClick={() => setActiveMenu('support')}
                    >
                        <HeadphonesIcon size={20} />
                        <span>고객센터</span>
                    </div>
                    <div className="sidebar-nav-item is-logout-link mp-cursor-pointer" onClick={handleLogout}>
                        <LogOut size={20} />
                        <span>로그아웃</span>
                    </div>
                </div>
            </aside>

            <main className="mypage-content-area" ref={contentRef}>
                {activeMenu === 'dashboard' && (
                    <div className="user-welcome-header">
                        <div className="user-profile-summary" onClick={() => handleMenuClick('dashboard')}>
                            <div className="user-avatar-box">
                                <img src="https://api.dicebear.com/7.x/notionists/svg?seed=Sohyun" alt="User" />
                            </div>
                            <div className="user-info-text">
                                <h2 className="user-name-title">
                                    안녕하세요, {userInfo.name ? userInfo.name + '님' : ''}!
                                </h2>
                                <p className="user-status-msg">마음 근육을 키운 지 42일째 되는 날이에요. 🌿</p>
                            </div>
                        </div>
                        <button
                            className="user-notif-check-btn"
                            onClick={() => {
                                setActiveMenu('notifications');
                            }}
                        >
                            <Bell size={18} className="icon-green" />
                            알림 확인
                        </button>
                    </div>
                )}

                <div className="dynamic-render-content">
                    {activeMenu === 'notifications' ? renderNotifications() : renderContent()}
                </div>
            </main>

            {isMobile && <MobileTap />}
        </div>
    );
}
