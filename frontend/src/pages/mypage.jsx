import React, { useState, useEffect, useRef } from 'react';
import { mockNotifications } from '../components/mockNotifications';
import { deleteAccount } from '../api/auth';
import { getUserInfo, updateUserInfo, changePassword } from '../api/user';
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
    const navigate = useNavigate();
    const location = useLocation();
    const contentRef = useRef(null);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

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
                const data = await getAllBookings();
                const now = new Date();
                const futureBookings = (data || [])
                    .filter((b) => {
                        const date = b.date.replace(/\./g, '-');
                        const dt = new Date(`${date}T${b.time}`);
                        return dt > now && b.booking_status !== 'canceled';
                    })
                    .sort((a, b) => {
                        const aDate = new Date(a.date.replace(/\./g, '-') + 'T' + a.time);
                        const bDate = new Date(b.date.replace(/\./g, '-') + 'T' + b.time);
                        return aDate - bDate;
                    });
                setBookings(futureBookings);
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
        const handleResize = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const [activeMenu, setActiveMenu] = useState(() =>
        location.state && location.state.showInquiry ? 'inquiry' : 'dashboard'
    );
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

    const historyList = [
        {
            id: 1,
            counselor: '이은지 상담사',
            date: '2024.05.13',
            time: '14:00',
            type: '대면 상담',
            status: '상담 완료',
            topic: '대인관계 스트레스',
            summary:
                '주변인들의 부탁을 거절하지 못해 발생하는 번아웃과 스트레스에 대해 논의함. 자신의 욕구를 먼저 파악하는 연습이 필요함.',
            feedback:
                '소현님은 타인에 대한 배려가 깊지만, 그만큼 자신을 돌보는 데 소홀해져 있었습니다. 오늘은 "나의 경계선 설정하기"를 주제로 구체적인 거절의 기술을 연습해 보았습니다.',
            nextStep: '하루에 한 번, 내키지 않는 제안에 대해 정중히 거절해 보기',
        },
        {
            id: 2,
            counselor: '박민우 상담사',
            date: '2024.05.06',
            time: '11:00',
            type: '대면 상담',
            status: '상담 완료',
            topic: '직장 내 갈등 관리',
            summary: '상사의 일방적인 업무 지시 방식으로 인한 무력감과 갈등 상황을 공유함.',
            feedback:
                '감정적인 대응보다는 업무 효율성과 연계된 소통 방식을 제안했습니다. 본인의 감정이 "무시당함"에 집중되어 있음을 인지하고 이를 객관적으로 분리하는 훈련을 진행했습니다.',
            nextStep: '갈등 상황 발생 시 즉시 반응하지 않고 10초간 호흡하기',
        },
    ];
    const completedConsultations = historyList.filter((item) => item.status === '상담 완료').length;

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
        { id: 'tickets', label: '이용권/결제', icon: Wallet },
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
                                    <p className="summary-text">{selectedConsultation.summary}</p>
                                </div>
                            </section>
                            <section className="report-section">
                                <h4 className="section-title">
                                    <div className="title-indicator"></div>전문가 소견
                                </h4>
                                <div className="feedback-wrapper">
                                    <p className="feedback-text">{selectedConsultation.feedback}</p>
                                </div>
                            </section>
                            <section className="action-step-card">
                                <h4 className="action-step-title">
                                    <Target size={20} />
                                    다음 상담까지의 실천 과제
                                </h4>
                                <p className="action-step-content">"{selectedConsultation.nextStep}"</p>
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
                        className="mobile-back-btn"
                        style={{
                            background: 'transparent',
                            border: 'none',
                            outline: 'none',
                            boxShadow: 'none',
                            padding: '1rem 0.5rem 0.5rem 0.5rem',
                            margin: '0 0 0 0.2rem',
                            display: 'flex',
                            alignItems: 'center',
                            color: '#222',
                            fontSize: 18,
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            zIndex: 1000,
                        }}
                        onClick={handleBackToDashboard}
                        aria-label="뒤로가기"
                    >
                        <ChevronRight style={{ transform: 'rotate(180deg)' }} size={22} />
                    </button>
                )}
                <div style={{ paddingTop: isMobile ? 48 : 0 }}>
                    <div className="history-header">
                        <div>
                            <h3 className="history-title">상담 히스토리</h3>
                            <p className="history-subtitle">{userInfo.name ? `${userInfo.name}님이 걸어온 마음의 발자취입니다.` : '상담 내역입니다.'}</p>
                        </div>
                        <div className="history-total-badge-wrapper">
                            <span className="history-total-badge">총 {completedConsultations}회 상담 완료</span>
                        </div>
                    </div>
                    <div className="history-list-container">
                        {historyList.map((item) => (
                            <div key={item.id} onClick={() => setSelectedConsultation(item)} className="history-item-card">
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
                        ))}
                    </div>
                </div>
            </div>
        );
    };

    const renderTicketsDetail = () => (
        <div className="fade-in">
            {isMobile && (
                <button
                    className="mobile-back-btn"
                    style={{
                        background: 'transparent',
                        border: 'none',
                        outline: 'none',
                        boxShadow: 'none',
                        padding: '1rem 0.5rem 0.5rem 0.5rem',
                        margin: '0 0 0 0.2rem',
                        display: 'flex',
                        alignItems: 'center',
                        color: '#222',
                        fontSize: 18,
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        zIndex: 1000,
                    }}
                    onClick={handleBackToDashboard}
                    aria-label="뒤로가기"
                >
                    <ChevronRight style={{ transform: 'rotate(180deg)' }} size={22} />
                </button>
            )}
            <div style={{ paddingTop: isMobile ? 48 : 0 }}>
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
                                        <button className="ph-detail-btn" onClick={() => navigate('/reservation')}>예약 상세 보기</button>
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
                                                                    <span style={{ color: '#222', fontWeight: 600 }}>
                                                                        {match[1]} 상담사
                                                                    </span>
                                                                );
                                                            }
                                                            return (
                                                                <span style={{ color: '#222', fontWeight: 600 }}>{item.title}</span>
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

                    <div className="ph-col-side" style={isMobile ? { paddingBottom: 88 } : {}}>
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
                                    <p>
                                        상담 시작 24시간 이내 취소 또는 노쇼(No-Show) 시 예약금은 환불되지 않습니다.
                                    </p>
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
                            <input type="text" className="custom-input bg-readonly" value={userInfo.username} readOnly />
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
                    <div className="security-password-grid" style={{ position: 'relative' }}>
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
                        <div
                            style={{
                                color: '#e57373',
                                fontSize: '0.95rem',
                                marginTop: 8,
                                marginBottom: 0,
                                fontWeight: 600,
                            }}
                        >
                            비밀번호가 일치하지 않습니다.
                        </div>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
                        <button
                            className="pw-change-btn"
                            onClick={handleChangePassword}
                            disabled={pwLoading}
                            style={{ opacity: pwLoading ? 0.6 : 1 }}
                        >
                            <CheckCircle2 size={16} style={{ marginRight: 4 }} />
                            비밀번호 변경
                        </button>
                    </div>
                </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 32 }}>
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

    const renderInquiryList = () => {
        const inquiryList = [
            {
                id: 1,
                title: '상담 예약 관련 문의',
                content: '상담 예약이 정상적으로 되었는지 확인 부탁드립니다.',
                date: '2026.04.20',
                status: '답변 완료',
                answer: '안녕하세요. 상담 예약이 정상적으로 완료되었습니다. 예약 시간에 맞춰 방문해 주세요.',
            },
            {
                id: 2,
                title: '결제 환불 요청',
                content: '결제한 이용권 환불이 가능한가요?',
                date: '2026.04.15',
                status: '처리 중',
                answer: null,
            },
        ];
        return (
            <div className="fade-in">
                {isMobile && (
                    <button
                        className="mobile-back-btn"
                        style={{
                            background: 'transparent',
                            border: 'none',
                            outline: 'none',
                            boxShadow: 'none',
                            padding: '1rem 0.5rem 0.5rem 0.5rem',
                            margin: '0 0 0 0.2rem',
                            display: 'flex',
                            alignItems: 'center',
                            color: '#222',
                            fontSize: 18,
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            zIndex: 1000,
                        }}
                        onClick={handleBackToDashboard}
                        aria-label="뒤로가기"
                    >
                        <ChevronRight style={{ transform: 'rotate(180deg)' }} size={22} />
                    </button>
                )}
                <div style={{ paddingTop: isMobile ? 48 : 0 }}>
                    <h3 className="history-title" style={{ marginBottom: '2.2rem' }}>문의내역</h3>
                    <ul className="mypage-list mypage-list-grid">
                        {inquiryList.map((item) => (
                            <li key={item.id} className="mypage-list-item">
                                <div className="mypage-list-title">{item.title}</div>
                                <div className="mypage-list-meta">
                                    {item.date} <span className="mypage-list-status">{item.status}</span>
                                </div>
                                <div className="mypage-list-content">{item.content}</div>
                                {item.answer && (
                                    <button
                                        className="inquiry-answer-btn"
                                        onClick={() => setOpenInquiryId(openInquiryId === item.id ? null : item.id)}
                                    >
                                        {openInquiryId === item.id ? '답변 닫기' : '답변 보기'}
                                    </button>
                                )}
                                {item.answer && openInquiryId === item.id && (
                                    <div className="inquiry-answer-box">
                                        <div className="inquiry-answer-label">관리자 답변</div>
                                        <div className="inquiry-answer-content">{item.answer}</div>
                                    </div>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        );
    };

    const renderFavoritesList = () => (
        <div className="fade-in">
            {isMobile && (
                <button
                    className="mobile-back-btn"
                    style={{
                        background: 'transparent',
                        border: 'none',
                        outline: 'none',
                        boxShadow: 'none',
                        padding: '1rem 0.5rem 0.5rem 0.5rem',
                        margin: '0 0 0 0.2rem',
                        display: 'flex',
                        alignItems: 'center',
                        color: '#222',
                        fontSize: 18,
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        zIndex: 1000,
                    }}
                    onClick={handleBackToDashboard}
                    aria-label="뒤로가기"
                >
                    <ChevronRight style={{ transform: 'rotate(180deg)' }} size={22} />
                </button>
            )}
            <div style={{ paddingTop: isMobile ? 48 : 0 }}>
                <h3 className="history-title" style={{ marginBottom: '2.2rem' }}>찜 목록</h3>
                <ul className="mypage-list mypage-list-grid">
                    {favoritesLoading ? (
                        <li className="mypage-list-empty">불러오는 중...</li>
                    ) : favoritesList.length === 0 ? (
                        <li className="mypage-list-empty">찜내역이 없습니다.</li>
                    ) : (
                        favoritesList.map((item) => {
                            const counselorName = item.counselor_name || item.name || item.full_name || '알 수 없는 상담사';
                            let specialtiesArr = [];
                            if (item.field) {
                                specialtiesArr = item.field.split(',').map((f) => f.trim()).filter(Boolean);
                            } else if (Array.isArray(item.specialties)) {
                                specialtiesArr = item.specialties.map((s) => s.specialty_name || s.name || s).filter(Boolean);
                            }
                            const category = item.category || '';
                            const intro = item.intro || item.description || '';
                            const price = item.price || item.consultation_price || '';
                            const avatarInitial = counselorName.slice(0, 1);
                            const itemId = item.counselor_id ? item.counselor_id : item.id;
                            const shownSpecialties = specialtiesArr.slice(0, 3);
                            const extraCount = specialtiesArr.length - 3;
                            const profileImg =
                                item.profile_img_url || item.profile_image || item.profileImg || item.profile_url || null;

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
                                                <span key={i} className="mypage-list-field">{f}</span>
                                            ))}
                                            {extraCount > 0 && <span className="mypage-list-field-extra">+{extraCount}</span>}
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
                    <div className="fade-in" style={{ position: 'relative' }}>
                        {isMobile && !activeSubMenu && (
                            <button
                                className="mobile-back-btn"
                                style={{
                                    background: 'transparent',
                                    border: 'none',
                                    outline: 'none',
                                    boxShadow: 'none',
                                    margin: '0 0 0 0.2rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    color: '#222',
                                    fontSize: 18,
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    zIndex: 1000,
                                }}
                                onClick={handleBackToDashboard}
                                aria-label="뒤로가기"
                            >
                                <ChevronRight style={{ transform: 'rotate(180deg)' }} size={22} />
                            </button>
                        )}
                        <div style={{ paddingTop: isMobile && !activeSubMenu ? 48 : 0 }}>
                            <h3
                                className="account-main-title"
                                style={{
                                    marginTop: isMobile ? 0 : '2.2rem',
                                    marginLeft: isMobile ? 40 : 0,
                                    textAlign: 'left',
                                    minHeight: 40,
                                    lineHeight: '40px',
                                }}
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
                                <p className="status-label">잔여 이용권</p>
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
                                    {completedConsultations}<span className="unit">회</span>
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
                                                <span className="hero-d-badge">D-{getDDay(primaryBooking.date, primaryBooking.time)}</span>
                                                <p className="hero-subtitle">Next Session</p>
                                            </div>
                                            <h3 className="hero-main-title">{primaryBooking.date} {primaryBooking.time}</h3>
                                            <p className="mypage-hero-desc">{primaryBooking.name} 상담사와 1:1 상담 예정</p>
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
                            {[
                                {
                                    counselor: '이은지 상담사',
                                    date: '2024.05.13',
                                    type: '대면 상담',
                                    status: '상담 완료',
                                },
                                {
                                    counselor: '박민우 상담사',
                                    date: '2024.05.06',
                                    type: '대면 상담',
                                    status: '상담 완료',
                                },
                            ].map((item, idx) => (
                                <div key={idx} className="dash-history-card" onClick={() => handleMenuClick('history')}>
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
                            ))}
                        </div>
                        {/* dash-purchase-banner (더 많은 위로가 필요하신가요? 및 이용권 충전하기) 영역 제거됨 */}
                        <section className="mobile-only-menu" style={{ paddingBottom: 72 }}>
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

    const renderNotifications = () => (
        <>
            {isMobile && (
                <button
                    className="mobile-back-btn"
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        background: 'transparent',
                        border: 'none',
                        outline: 'none',
                        boxShadow: 'none',
                        fontSize: 16,
                        padding: '1rem',
                        cursor: 'pointer',
                        margin: '16px 0 0 8px',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        zIndex: 1000,
                        color: '#222',
                    }}
                    onClick={handleBackToDashboard}
                >
                    <ChevronRight style={{ transform: 'rotate(180deg)' }} size={20} /> 뒤로가기
                </button>
            )}
            <div style={{ paddingTop: isMobile ? 56 : 0 }}>
                <div className="cmp-page-header">
                    <h2 className="cmp-page-title">알림 센터</h2>
                    <p className="cmp-page-sub">상담 일정, 예약 확정 등 최근 알림을 확인하세요.</p>
                </div>
                <div className="cmp-list-card">
                    {mockNotifications.length === 0 ? (
                        <div className="cmp-notif-empty">
                            <div className="cmp-notif-empty-icon">
                                <Bell size={22} />
                            </div>
                            <p className="cmp-notif-empty-title">새로운 알림이 없습니다</p>
                        </div>
                    ) : (
                        <>
                            <div className="cmp-notif-group-label">최근 알림</div>
                            {mockNotifications.map((item) => (
                                <div key={item.id} className={`cmp-notif-item${item.unread ? ' unread' : ''}`}>
                                    <span className="cmp-item-avatar notif">
                                        {item.type === 'booking' && <Check size={15} />}
                                        {item.type === 'msg' && <MessageSquare size={15} />}
                                        {item.type === 'notice' && <AlertCircle size={15} />}
                                    </span>
                                    <div className="cmp-notif-content">
                                        <div className="cmp-notif-title">{item.title}</div>
                                        <div className="cmp-notif-desc">{item.desc}</div>
                                    </div>
                                    <div className="cmp-notif-meta">
                                        <span className="cmp-notif-time">{item.time}</span>
                                        {item.unread && <span className="cmp-notif-dot" />}
                                    </div>
                                </div>
                            ))}
                        </>
                    )}
                </div>
            </div>
        </>
    );

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
                        <button className="user-notif-check-btn" onClick={() => {
                            setActiveMenu('notifications');
                        }}>
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