import React, { useState, useEffect, useRef } from 'react';
import { uploadProfileImg } from '../api/profileImg';
import { getMyInquiries } from '../api/inquiry';
import { getNotifications, markNotificationRead } from '../api/notification';
import { deleteAccount } from '../api/auth';
import { getUserInfo, updateUserInfo, changePassword } from '../api/user';
import { getCounselorClients } from '../api/counselorClients';
import { getClientLogs } from '../api/clientLogs';
import { getFavorites, toggleFavorite } from '../api/favorite';
import { getAllBookings } from '../api/booking';
import { isTokenExpired } from '../utils/jwt';
import axiosInstance, { apiUrl } from '../api/axiosInstance';
import { useNavigate, useLocation } from 'react-router-dom';
import MobileTap from '../components/mobileTap';
import '../static/MyPage.css';
import '../static/CounselorMyPage.css';

import {
    Settings,
    Bell,
    LogOut,
    ChevronRight,
    CalendarHeart,
    MessageSquareHeart,
    History,
    Wallet,
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
    Mars,
    Venus,
} from 'lucide-react';

// ─── 상수 ────────────────────────────────────────────────────────────────────

const NOTIF_SETTINGS_DATA = [
    { key: 'session', title: '상담 일정 알림', desc: '예약된 상담 시간 및 변동 사항 안내' },
    { key: 'service', title: '서비스 공지사항', desc: '점검 안내 및 주요 이용 정보' },
    { key: 'marketing', title: '이벤트 및 혜택 알림', desc: '새로운 프로그램 및 할인 쿠폰 정보' },
];

const PAYMENT_HISTORY = [
    {
        id: 1,
        date: '2026.05.20',
        time: '14:32',
        counselor: '이지은',
        title: '1:1 심리상담 예약금',
        amount: '20,000',
        method: '카카오페이',
        status: '결제완료',
    },
    {
        id: 2,
        date: '2026.05.02',
        time: '10:15',
        counselor: '김민수',
        title: '1:1 심리상담 잔금',
        amount: '60,000',
        method: '신용카드 (현대 12**)',
        status: '결제완료',
    },
    {
        id: 3,
        date: '2026.04.15',
        time: '16:40',
        counselor: '박지영',
        title: '커플 상담 예약금',
        amount: '30,000',
        method: '네이버페이',
        status: '취소완료',
    },
];

const WITHDRAW_NOTICE_ITEMS = [
    { label: '상담 기록 및 히스토리', sub: '모든 상담 내용과 기록이 삭제됩니다.' },
    { label: '찜 목록 및 즐겨찾기', sub: '저장된 상담사 정보가 삭제됩니다.' },
    { label: '결제 정보 및 이용권', sub: '잔여 이용권은 환불되지 않습니다.' },
    { label: '개인정보 및 계정', sub: '아이디, 이메일 등 모든 정보가 삭제됩니다.' },
];

const MENU_ITEMS = [
    { id: 'history', label: '상담 히스토리', icon: History },
    { id: 'inquiry', label: '문의내역', icon: MessagesSquare },
    { id: 'favorites', label: '찜내역', icon: Heart },
    { id: 'tickets', label: '결제 및 이용내역', icon: Wallet },
    { id: 'profile', label: '계정 설정', icon: Settings },
];

const PROFILE_SUBMENU = [
    {
        key: 'personal',
        label: '개인정보 수정 및 보안',
        icon: User,
        title: '개인정보 수정 및 보안',
        desc: '회원님의 소중한 정보와 비밀번호를 안전하게 관리하세요.',
    },
    {
        key: 'notification',
        label: '알림 설정',
        icon: Bell,
        title: '알림 설정',
        desc: '상담 일정 및 서비스 소식을 전해드릴게요.',
    },
    {
        key: 'quit',
        label: '서비스 탈퇴',
        icon: UserX,
        title: '서비스 탈퇴',
        desc: '탈퇴 시 소중한 기록들이 모두 삭제됩니다.',
    },
];

// ─── 유틸 ────────────────────────────────────────────────────────────────────

const isMobileDevice = () =>
    window.innerWidth <= 1024 ||
    /ipad|android(?!.*mobile)|tablet|surface|fold|sm-t|lenovo tab|windows touch|asus|zenbook/i.test(
        navigator.userAgent.toLowerCase()
    );

const getDDay = (dateStr, timeStr) => {
    const dt = new Date(`${dateStr.replace(/\./g, '-')}T${timeStr}`);
    return Math.max(1, Math.ceil((dt - new Date()) / 86400000));
};

const nl2br = (str = '') => str.replace(/\n/g, '<br />');

// ─── 서브 컴포넌트 ────────────────────────────────────────────────────────────

const NotificationSettings = ({ notifSettings, toggleNotif }) => (
    <div className="ns-card">
        <header className="ns-header">
            <div className="ns-header-icon-box">
                <Bell size={20} />
            </div>
            <h1 className="ns-header-title">알림 설정</h1>
        </header>
        <main className="ns-list">
            {NOTIF_SETTINGS_DATA.map(({ key, title, desc }) => (
                <div key={key} className="ns-toggle-item">
                    <div className="ns-item-text">
                        <p className="ns-item-title">{title}</p>
                        <p className="ns-item-desc">{desc}</p>
                    </div>
                    <button
                        onClick={() => toggleNotif(key)}
                        className={`ns-toggle-btn ${notifSettings[key] ? 'is-on' : 'is-off'}`}
                    >
                        {notifSettings[key] ? (
                            <ToggleRight size={48} strokeWidth={1.2} />
                        ) : (
                            <ToggleLeft size={48} strokeWidth={1.2} />
                        )}
                    </button>
                </div>
            ))}
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

const SupportCenter = () => (
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

// ─── 메인 컴포넌트 ────────────────────────────────────────────────────────────

export default function MyPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const contentRef = useRef(null);

    // ── state ──
    const [isMobile, setIsMobile] = useState(isMobileDevice);
    const [activeMenu, setActiveMenu] = useState(() => {
        if (location.state?.showNotifications) return 'notifications';
        if (location.state?.showInquiry) return 'inquiry';
        if (location.state?.showHistory) return 'history';
        return 'dashboard';
    });
    const [activeSubMenu, setActiveSubMenu] = useState(null);
    const [userInfo, setUserInfo] = useState({
        name: '',
        id: '',
        username: '',
        email: '',
        phone: '',
        gender: '',
        profile_img_url: '',
    });
    const [pwFields, setPwFields] = useState({ current: '', new1: '', new2: '' });
    const [pwLoading, setPwLoading] = useState(false);
    const [notifSettings, setNotifSettings] = useState({
        session: true,
        marketing: false,
        report: true,
        service: true,
    });
    const [bookings, setBookings] = useState([]);
    const [historyList, setHistoryList] = useState([]);
    const [completedConsultations, setCompletedConsultations] = useState(0);
    const [notifications, setNotifications] = useState([]);
    const [showAllNotifications, setShowAllNotifications] = useState(false);
    const [inquiryList, setInquiryList] = useState([]);
    const [inquiryLoading, setInquiryLoading] = useState(false);
    const [openInquiryId, setOpenInquiryId] = useState(null);
    const [favoritesList, setFavoritesList] = useState([]);
    const [favoritesLoading, setFavoritesLoading] = useState(true);
    const [withdrawAgree, setWithdrawAgree] = useState(false);
    const [withdrawLoading, setWithdrawLoading] = useState(false);
    const [ticketCount, setTicketCount] = useState(2);
    const [toast, setToast] = useState(null);
    const [loading, setLoading] = useState(true);

    const showToast = (msg) => {
        setToast(msg);
        setTimeout(() => setToast(null), 2500);
    };

    // ── effects ──

    // 화면 크기 감지
    useEffect(() => {
        const onResize = () => setIsMobile(isMobileDevice());
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, []);

    // 프로필 이미지 동기화
    useEffect(() => {
        const sync = () => {
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            setUserInfo((prev) => ({ ...prev, profile_img_url: user.profile_img_url || '' }));
        };
        window.addEventListener('profileImgChanged', sync);
        sync();
        return () => window.removeEventListener('profileImgChanged', sync);
    }, []);

    // 유저 정보 + 찜 목록 로드
    useEffect(() => {
        const user = localStorage.getItem('user');
        const token = localStorage.getItem('access_token');
        if (!user) return;

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
            .then(([userData, favData]) => {
                setUserInfo((prev) => ({
                    ...prev,
                    name: userData.full_name,
                    username: userData.username,
                    email: userData.email,
                    phone: userData.phone_number,
                    gender: userData.gender || '',
                    profile_img_url: userData.profile_img_url || '',
                    created_at: userData.created_at || '',
                }));
                setFavoritesList(favData.favorites || []);
            })
            .catch((err) => {
                if (err?.response?.status === 401) {
                    alert('로그인 세션이 만료되었습니다. 다시 로그인 해주세요.');
                    localStorage.removeItem('access_token');
                    localStorage.removeItem('user');
                    navigate('/login');
                } else {
                    setFavoritesList([]);
                }
            })
            .finally(() => setFavoritesLoading(false));
    }, [navigate]);

    // 예약 로드
    useEffect(() => {
        if (!localStorage.getItem('user')) {
            setLoading(false);
            return;
        }
        setLoading(true);
        getAllBookings({ upcomingOnly: true, limit: 1 })
            .then((data) => setBookings(data || []))
            .catch(() => setBookings([]))
            .finally(() => setLoading(false));
    }, []);

    // 알림 로드
    useEffect(() => {
        const token = localStorage.getItem('access_token');
        if (!token) return;
        getNotifications(token)
            .then((res) => {
                const list = (Array.isArray(res.data) ? res.data : res.data?.notifications || []).sort(
                    (a, b) => new Date(b.created_at) - new Date(a.created_at)
                );
                setNotifications(list);
            })
            .catch(() => setNotifications([]));
    }, []);

    // 상담 히스토리 로드
    useEffect(() => {
        const token = localStorage.getItem('access_token');
        const user = localStorage.getItem('user');
        if (!token || !user) {
            setHistoryList([]);
            setCompletedConsultations(0);
            return;
        }

        const userObj = JSON.parse(user);
        const fetchLogs =
            userObj.role === 'client'
                ? getClientLogs(userObj.id)
                : getCounselorClients().then(
                      (clients) => clients.find((c) => String(c.id) === String(userObj.id))?.logs || []
                  );

        fetchLogs
            .then((logs) => {
                const mapped = logs.map((log) => ({
                    id: log.id,
                    counselor: log.counselor_name ? `${log.counselor_name} 상담사` : '',
                    date: log.created_at?.slice(0, 10).replace(/-/g, '.') || '',
                    time: log.created_at?.slice(11, 16) || '',
                    type: log.session_type || '상담',
                    status: '상담 완료',
                    topic: log.title || '',
                    summary: log.summary || '',
                    feedback: log.content || '',
                    nextStep: log.action_plan || '',
                }));
                setHistoryList(mapped);
                setCompletedConsultations(mapped.length);
            })
            .catch(() => {
                setHistoryList([]);
                setCompletedConsultations(0);
            });
    }, [userInfo.id]);

    // 문의 내역 로드
    useEffect(() => {
        if (activeMenu !== 'inquiry') return;
        setInquiryLoading(true);
        getMyInquiries()
            .then((data) => setInquiryList(data))
            .catch(() => setInquiryList([]))
            .finally(() => setInquiryLoading(false));
    }, [activeMenu]);

    // 메뉴/서브메뉴 변경 시 스크롤 초기화
    useEffect(() => {
        contentRef.current?.scrollTo(0, 0);
        window.scrollTo(0, 0);
    }, [activeMenu, activeSubMenu]);

    // ── 핸들러 ──

    const handleMenuClick = (id) => {
        setActiveMenu(id);
        setActiveSubMenu(null);
    };
    const handleBackToDashboard = () => setActiveMenu('dashboard');
    const toggleNotif = (key) => setNotifSettings((prev) => ({ ...prev, [key]: !prev[key] }));

    const handleLogout = () => {
        ['access_token', 'user', 'login_time'].forEach((k) => localStorage.removeItem(k));
        navigate('/');
    };

    const handleSaveProfile = async () => {
        try {
            let uploadedImgUrl;
            if (userInfo._profileImgFile) {
                const res = await uploadProfileImg(userInfo._profileImgFile);
                if (res?.profile_img_url) uploadedImgUrl = res.profile_img_url;
            }
            await updateUserInfo({
                id: userInfo.id,
                full_name: userInfo.name,
                email: userInfo.email,
                phone_number: userInfo.phone,
                ...(uploadedImgUrl ? { profile_img_url: uploadedImgUrl } : {}),
            });
            if (uploadedImgUrl) {
                setUserInfo((prev) => ({ ...prev, profile_img_url: uploadedImgUrl, _profileImgFile: undefined }));
                const stored = JSON.parse(localStorage.getItem('user') || '{}');
                localStorage.setItem('user', JSON.stringify({ ...stored, profile_img_url: uploadedImgUrl }));
                window.dispatchEvent(new Event('profileImgChanged'));
            }
            showToast('변경사항이 저장되었습니다.');
        } catch {
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

    const handleDeleteAccount = async () => {
        if (!withdrawAgree) {
            alert('유의사항 동의가 필요합니다.');
            return;
        }
        const token = localStorage.getItem('access_token');
        if (!token) {
            alert('로그인 정보가 없습니다.');
            return;
        }
        if (!window.confirm('정말로 계정을 영구 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) return;
        setWithdrawLoading(true);
        try {
            await deleteAccount(token);
            alert('계정이 영구 삭제되었습니다.');
            handleLogout();
        } catch (error) {
            alert(error?.response?.data?.detail || '계정 삭제에 실패했습니다.');
        } finally {
            setWithdrawLoading(false);
        }
    };

    const handleUnfavorite = async (id, e) => {
        e.stopPropagation();
        setFavoritesList((prev) => prev.filter((item) => String(item.id ?? item.counselor_id) !== String(id)));
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
        } catch {
            alert('찜 해제 처리 중 오류가 발생했습니다.');
        }
    };

    // ── 아바타 공통 ──
    const avatarSrc = (name, url) => {
        if (url?.trim()) {
            if (url.startsWith('/static/')) {
                // apiUrl 함수를 호출하여 경로를 완성합니다.
                return apiUrl(url);
            }
            return url;
        }
        return `https://api.dicebear.com/7.x/notionists/svg?seed=${name || 'default'}`;
    };

    // ── 렌더 함수 ──

    const renderMobileBack = () => (
        <button
            className="mobile-back-btn mobile-back-btn--compact"
            onClick={handleBackToDashboard}
            aria-label="뒤로가기"
        >
            <ChevronRight className="mp-rotate-180" size={22} />
        </button>
    );

    const renderHistoryDetail = (selectedConsultation, setSelectedConsultation) => {
        if (selectedConsultation)
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
                            {[
                                {
                                    label: '상담 요약',
                                    cls: 'summary-box',
                                    textCls: 'summary-text',
                                    val: selectedConsultation.summary,
                                },
                                {
                                    label: '전문가 소견',
                                    cls: 'feedback-wrapper',
                                    textCls: 'feedback-text',
                                    val: selectedConsultation.feedback,
                                },
                            ].map(({ label, cls, textCls, val }) => (
                                <section key={label} className="report-section">
                                    <h4 className="section-title">
                                        <div className="title-indicator" />
                                        {label}
                                    </h4>
                                    <div className={cls}>
                                        <p className={textCls} dangerouslySetInnerHTML={{ __html: nl2br(val) }} />
                                    </div>
                                </section>
                            ))}
                            <section className="action-step-card">
                                <h4 className="action-step-title">
                                    <Target size={20} />
                                    다음 상담까지의 실천 과제
                                </h4>
                                <p
                                    className="action-step-content"
                                    dangerouslySetInnerHTML={{
                                        __html: nl2br(`"${selectedConsultation.nextStep || ''}"`),
                                    }}
                                />
                            </section>
                        </div>
                        <div className="report-footer">
                            <p className="privacy-notice">
                                이 기록은 오직 {userInfo.name}님과 담당 상담사만 확인할 수 있습니다.
                            </p>
                        </div>
                    </div>
                </div>
            );

        return (
            <div className="fade-in">
                {isMobile && renderMobileBack()}
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
                        <span className="history-total-badge-wrapper">
                            <span className="history-total-badge">총 {completedConsultations}회 상담 완료</span>
                        </span>
                    </div>
                    <div className="history-list-container">
                        {historyList.length === 0 ? (
                            <div className="cmp-notif-empty">
                                <div className="cmp-notif-empty-icon">
                                    <Bell size={22} />
                                </div>
                                <p className="cmp-notif-empty-title">상담 기록이 없습니다</p>
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
                                        <p className="history-link-text">상담 기록지 보기</p>
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
            {isMobile && renderMobileBack()}
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
                                    <button className="ph-detail-btn" onClick={() => navigate('/reservation')}>
                                        예약 상세 보기
                                    </button>
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
                                                        <span className="ph-counselor-name">
                                                            {item.counselor} 상담사
                                                        </span>
                                                        <p className="ph-td-method">{item.method}</p>
                                                    </td>
                                                    <td className="ph-table-td ph-td-amount-wrap">
                                                        <p className="ph-td-amount">{item.amount}원</p>
                                                    </td>
                                                    <td className="ph-table-td ph-td-status-wrap">
                                                        <span
                                                            className={`ph-status-pill ${item.status === '결제완료' ? 'ph-status-pill--complete' : 'ph-status-pill--cancel'}`}
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
                                {[
                                    {
                                        color: 'green',
                                        text: (
                                            <>
                                                상담 예약 확정을 위해 <strong>20,000원의 예약금</strong> 결제가
                                                필요합니다.
                                            </>
                                        ),
                                    },
                                    {
                                        color: 'green',
                                        text: (
                                            <>
                                                상담 시작 <strong>24시간 전</strong> 취소 시 예약금은 100% 환불됩니다.
                                            </>
                                        ),
                                    },
                                    {
                                        color: 'amber',
                                        text: '상담 시작 24시간 이내 취소 또는 노쇼(No-Show) 시 예약금은 환불되지 않습니다.',
                                    },
                                ].map(({ color, text }, i) => (
                                    <li key={i} className="ph-refund-item">
                                        <div className={`ph-refund-dot ph-refund-dot--${color}`} />
                                        <p>{text}</p>
                                    </li>
                                ))}
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

    const renderPersonalEdit = () => {
        const profileImg = avatarSrc(userInfo.name, userInfo.profile_img_url);
        return (
            <div className="fade-in mp-w-full">
                <div className="profile-edit-section">
                    <div className="profile-upper-layout">
                        <div className="profile-image-container">
                            <input
                                type="file"
                                accept="image/*"
                                className="u-hidden"
                                ref={(ref) => (window.__profileImgInputRef = ref)}
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (!file) return;
                                    const reader = new FileReader();
                                    reader.onload = (ev) =>
                                        setUserInfo((prev) => ({
                                            ...prev,
                                            profile_img_url: ev.target.result,
                                            _profileImgFile: file,
                                        }));
                                    reader.readAsDataURL(file);
                                }}
                            />
                            <div className="profile-image-wrapper">
                                <div
                                    className="profile-avatar u-pointer"
                                    onClick={() => window.__profileImgInputRef?.click()}
                                >
                                    <img
                                        src={profileImg}
                                        alt="User Profile"
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = avatarSrc(userInfo.name);
                                        }}
                                    />
                                </div>
                                <button
                                    className="profile-camera-btn"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        window.__profileImgInputRef?.click();
                                    }}
                                >
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
                                            onChange={(e) => setUserInfo((p) => ({ ...p, name: e.target.value }))}
                                        />
                                    </div>
                                </div>
                                <div className="profile-info-half">
                                    <label className="input-label">성별</label>
                                    <div className="relative-input-box">
                                        {userInfo.gender === 'female' && <Venus className="input-icon" size={20} />}
                                        {userInfo.gender === 'male' && <Mars className="input-icon" size={20} />}
                                        <input
                                            type="text"
                                            className="custom-input bg-readonly"
                                            value={
                                                userInfo.gender === 'female'
                                                    ? '여성'
                                                    : userInfo.gender === 'male'
                                                      ? '남성'
                                                      : userInfo.gender || ''
                                            }
                                            readOnly
                                        />
                                    </div>
                                </div>
                            </div>
                            {/* ↓ 생년월일 제거 후 휴대폰 번호만 단독 렌더 */}
                            <div className="profile-info-half">
                                <label className="input-label">휴대폰 번호</label>
                                <div className="relative-input-box">
                                    <Phone className="input-icon" size={20} />
                                    <input
                                        type="tel"
                                        className="custom-input"
                                        value={userInfo.phone}
                                        onChange={(e) => setUserInfo((p) => ({ ...p, phone: e.target.value }))}
                                    />
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
                                    onChange={(e) => setUserInfo((p) => ({ ...p, email: e.target.value }))}
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
                        <div className="security-password-grid">
                            {[
                                { field: 'new1', placeholder: '8자 이상 영문+숫자', label: '새 비밀번호' },
                                { field: 'new2', placeholder: '다시 한번 입력해 주세요', label: '새 비밀번호 확인' },
                            ].map(({ field, placeholder, label }) => (
                                <div key={field}>
                                    <label className="input-label">{label}</label>
                                    <div className="relative-input-box">
                                        <KeyRound className="input-icon" size={20} />
                                        <input
                                            type="password"
                                            placeholder={placeholder}
                                            className="custom-input"
                                            value={pwFields[field]}
                                            onChange={(e) => setPwFields((f) => ({ ...f, [field]: e.target.value }))}
                                            autoComplete="new-password"
                                            disabled={pwLoading}
                                        />
                                    </div>
                                </div>
                            ))}
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
                                <CheckCircle2 size={16} className="pw-change-btn-icon" /> 비밀번호 변경
                            </button>
                        </div>
                    </div>
                </div>

                <div className="profile-save-btn-row">
                    <button className="profile-save-full-btn" onClick={handleSaveProfile}>
                        <CheckCircle2 size={20} /> 변경사항 저장
                    </button>
                </div>
            </div>
        );
    };

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
                                {WITHDRAW_NOTICE_ITEMS.map(({ label, sub }) => (
                                    <div key={label} className="wd-notice-item">
                                        <div className="wd-notice-bullet" />
                                        <div>
                                            <p className="wd-notice-label">{label}</p>
                                            <p className="wd-notice-sub">{sub}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="wd-stats-column">
                            {[
                                { label: '잔여 이용권', value: ticketCount, unit: '회', warning: '탈퇴 시 환불 불가' },
                                {
                                    label: '완료한 상담',
                                    value: completedConsultations,
                                    unit: '회',
                                    warning: '기록 전체 삭제',
                                },
                            ].map(({ label, value, unit, warning }) => (
                                <div key={label} className="wd-stat-card">
                                    <p className="wd-stat-label">{label}</p>
                                    <div>
                                        <span className="wd-stat-value">{value}</span>
                                        <span className="wd-stat-unit">{unit}</span>
                                    </div>
                                    <p className="wd-stat-warning">{warning}</p>
                                </div>
                            ))}
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

    const renderInquiryList = () => (
        <div className="fade-in">
            {isMobile && renderMobileBack()}
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
                                        className={`inq-status-dot ${item.status === 'pending' ? 'dot-pending' : 'dot-done'}`}
                                    />
                                    <div className="inq-meta">
                                        <div className="inq-top-row">
                                            <span
                                                className={`inq-badge ${item.status === 'pending' ? 'badge-pending' : 'badge-done'}`}
                                            >
                                                {item.status === 'pending' ? '처리 중' : '답변 완료'}
                                            </span>
                                            <span className="inq-date">
                                                {item.created_at ? new Date(item.created_at).toLocaleDateString() : ''}
                                            </span>
                                        </div>
                                        <p className="inq-title">{item.title}</p>
                                        {openInquiryId !== item.id && <p className="inq-preview">{item.content}</p>}
                                    </div>
                                    <ChevronRight
                                        size={18}
                                        className={`inq-arrow-icon ${openInquiryId === item.id ? 'inq-arrow-open' : ''}`}
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

    const renderFavoritesList = () => (
        <div className="fade-in">
            {isMobile && renderMobileBack()}
            <div className={isMobile ? 'mp-mobile-top-offset-48' : ''}>
                <h3 className="history-title history-title--spaced">찜 목록</h3>
                <ul className="mypage-list mypage-list-grid">
                    {favoritesLoading ? (
                        <li className="mypage-list-empty">불러오는 중...</li>
                    ) : favoritesList.length === 0 ? (
                        <li className="u-grid-full">
                            <div className="inq-empty-state">
                                <div className="inq-empty-icon">
                                    <Heart size={32} />
                                </div>
                                <p className="inq-empty-title">찜내역이 없습니다</p>
                                <p className="inq-empty-sub">관심있는 상담사를 찜해보세요.</p>
                            </div>
                        </li>
                    ) : (
                        favoritesList.map((item) => {
                            const itemId = item.counselor_id || item.id;
                            const name = item.counselor_name || item.name || item.full_name || '';
                            const counselorName = name ? `${name} 상담사` : '알 수 없는 상담사';
                            const specialties = item.field
                                ? item.field
                                      .split(',')
                                      .map((f) => f.trim())
                                      .filter(Boolean)
                                : Array.isArray(item.specialties)
                                  ? item.specialties.map((s) => s.specialty_name || s.name || s).filter(Boolean)
                                  : [];
                            const shown = specialties.slice(0, 3);
                            const extra = specialties.length - 3;

                            let src = null;
                            let showUserIcon = false;
                            if (item.profile_img_url && item.profile_img_url.trim() !== '') {
                                src = item.profile_img_url.startsWith('http')
                                    ? item.profile_img_url
                                    : API_URL.replace(/\/$/, '') + item.profile_img_url;
                            } else {
                                showUserIcon = true;
                            }

                            return (
                                <li
                                    key={itemId}
                                    className="mypage-list-item mypage-favorite-item"
                                    onClick={() => navigate('/counselor/' + itemId, { state: { isLiked: true } })}
                                >
                                    <div
                                        className="mypage-favorite-heart"
                                        onClick={(e) => handleUnfavorite(itemId, e)}
                                        title="찜 취소"
                                    >
                                        <Heart size={14} color="#e74c3c" fill="#e74c3c" />
                                    </div>
                                    <div className="mypage-favorite-avatar">
                                        {showUserIcon ? <User size={32} /> : <img src={src} alt={counselorName} />}
                                    </div>
                                    <div className="mypage-favorite-content">
                                        <div className="mypage-list-title">{counselorName}</div>
                                        <div className="mypage-list-meta">
                                            {item.category && (
                                                <span className="mypage-list-category">{item.category}</span>
                                            )}
                                            {shown.map((f, i) => (
                                                <span key={i} className="mypage-list-field">
                                                    {f}
                                                </span>
                                            ))}
                                            {extra > 0 && <span className="mypage-list-field-extra">+{extra}</span>}
                                        </div>
                                        {item.intro && (
                                            <div className="mypage-list-intro">{item.intro || item.description}</div>
                                        )}
                                        {item.price && (
                                            <div className="mypage-list-price">
                                                <span className="price-value">
                                                    {item.price || item.consultation_price}
                                                </span>
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

    // ── 히스토리 detail state (컴포넌트 내 로컬) ──
    const [selectedConsultation, setSelectedConsultation] = useState(null);

    const renderProfileDetail = () => {
        if (activeSubMenu === 'quit') return renderQuitService();
        const sub = PROFILE_SUBMENU.find((s) => s.key === activeSubMenu);
        return (
            <div className="fade-in mp-w-full">
                <div className="submenu-container">
                    <div className="submenu-header-section">
                        <button onClick={() => setActiveSubMenu(null)} className="submenu-back-btn">
                            <ArrowLeft size={16} /> 계정 설정으로 돌아가기
                        </button>
                        <h3 className="submenu-main-title">{sub?.title}</h3>
                        <p className="submenu-description">{sub?.desc}</p>
                    </div>
                    <div className="submenu-content-area">
                        {activeSubMenu === 'personal' && renderPersonalEdit()}
                        {activeSubMenu === 'notification' && (
                            <NotificationSettings notifSettings={notifSettings} toggleNotif={toggleNotif} />
                        )}
                    </div>
                </div>
            </div>
        );
    };

    const renderNotifications = () => {
        const maxCount = isMobile ? 6 : 10;
        const visible = showAllNotifications ? notifications : notifications.slice(0, maxCount);
        const hasMore = notifications.length > maxCount;

        const NOTIF_ICON_MAP = {
            booking: <Check size={15} />,
            booking_request: <CalendarHeart size={15} />,
            booking_confirm: <CheckCircle2 size={15} />,
            msg: <MessageSquare size={15} />,
            notice: <AlertCircle size={15} />,
            counsel_log: <ClipboardList size={15} />,
            inquiry: <Mail size={15} />,
            inquiry_answered: <Mail size={15} />,
        };

        const handleNotificationClick = async (item) => {
            if (!item.read) {
                const token = localStorage.getItem('access_token');
                setNotifications((prev) => prev.map((n) => (n.id === item.id ? { ...n, read: true } : n)));
                try {
                    await markNotificationRead(item.id, token);
                } catch (e) {
                    // 실패해도 UI는 유지
                }
            }

            const type = (item.type || '').toLowerCase();
            if (
                type === 'booking' ||
                type === 'booking_request' ||
                type === 'booking_confirm' ||
                type === 'booking_confirmed' ||
                type === 'booking_rejected' ||
                type === 'booking_cancelled' ||
                type === 'reservation'
            ) {
                navigate('/reserve');
            } else if (
                type === 'counsel_log' ||
                type === 'counseling_log_registered' ||
                type === 'counsel' ||
                type === 'session' ||
                type === 'log'
            ) {
                setActiveMenu('history');
                setActiveSubMenu(null);
            } else if (type === 'inquiry' || type === 'inquiry_answered') {
                setActiveMenu('inquiry');
                setActiveSubMenu(null);
            }
        };

        return (
            <>
                {isMobile && (
                    <button className="mobile-back-btn mobile-back-btn--with-label" onClick={handleBackToDashboard}>
                        <ChevronRight className="mp-rotate-180" size={20} />
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
                                {visible.map((item) => (
                                    <div
                                        key={item.id}
                                        className={`cmp-notif-item${item.read ? ' read' : ' unread'} u-pointer`}
                                        onClick={() => handleNotificationClick(item)}
                                    >
                                        <span className="cmp-item-avatar notif">
                                            {NOTIF_ICON_MAP[item.type] ?? <Bell size={15} />}
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
                                {hasMore && (
                                    <button
                                        className="cmp-notif-more-btn"
                                        onClick={() => setShowAllNotifications((v) => !v)}
                                    >
                                        {showAllNotifications ? '접기' : '더보기'}
                                    </button>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </>
        );
    };

    const renderContent = () => {
        if (activeMenu === 'profile' && activeSubMenu) return renderProfileDetail();
        if (activeMenu === 'support') return <SupportCenter />;
        if (activeMenu === 'history') return renderHistoryDetail(selectedConsultation, setSelectedConsultation);
        if (activeMenu === 'inquiry') return renderInquiryList();
        if (activeMenu === 'favorites') return renderFavoritesList();
        if (activeMenu === 'tickets') return renderTicketsDetail();

        if (activeMenu === 'profile')
            return (
                <div className="fade-in fade-in--relative">
                    {isMobile && (
                        <button
                            className="mobile-back-btn mobile-back-btn--flush"
                            onClick={handleBackToDashboard}
                            aria-label="뒤로가기"
                        >
                            <ChevronRight className="mp-rotate-180" size={22} />
                        </button>
                    )}
                    <div className={isMobile ? 'mp-mobile-top-offset-48' : ''}>
                        <h3
                            className={`account-main-title ${isMobile ? 'account-main-title--mobile' : 'account-main-title--desktop'}`}
                        >
                            계정 설정
                        </h3>
                        <div className="setting-items-list">
                            {PROFILE_SUBMENU.map(({ key, label, icon: Icon, key: type }) => (
                                <div key={key} className="setting-item-card" onClick={() => setActiveSubMenu(key)}>
                                    <div className={`setting-item-left is-${key}`}>
                                        <div className={`setting-item-icon-box is-${key}`}>
                                            <Icon size={20} />
                                        </div>
                                        <span className="setting-item-label">{label}</span>
                                    </div>
                                    <ChevronRight size={20} className="setting-item-arrow" />
                                </div>
                            ))}
                        </div>
                        <div className="account-logout-section">
                            <button className="account-logout-btn" onClick={handleLogout}>
                                <LogOut size={20} /> 로그아웃
                            </button>
                        </div>
                    </div>
                </div>
            );

        // dashboard (default)
        const primaryBooking = bookings[0];
        return (
            <div className="fade-in">
                <div className="dash-status-grid">
                    {[
                        {
                            icon: <Wallet size={18} />,
                            bg: 'bg-amber',
                            label: '결제 및 이용내역',
                            value: ticketCount,
                            unit: '회',
                            onClick: () => handleMenuClick('tickets'),
                        },
                        {
                            icon: <CalendarHeart size={18} />,
                            bg: 'bg-blue',
                            label: '대기 중인 예약',
                            value: 1,
                            unit: '건',
                            onClick: () => navigate('/reserve'),
                        },
                        {
                            icon: <History size={18} />,
                            bg: 'bg-rose',
                            label: '완료한 상담',
                            value: completedConsultations,
                            unit: '회',
                            onClick: () => handleMenuClick('history'),
                        },
                    ].map(({ icon, bg, label, value, unit, onClick }) => (
                        <div key={label} className="dash-status-item" onClick={onClick}>
                            <div className={`status-icon-box ${bg}`}>{icon}</div>
                            <p className="status-label">{label}</p>
                            <p className="status-value">
                                {value}
                                <span className="unit">{unit}</span>
                            </p>
                        </div>
                    ))}
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
                    {historyList.length > 0 ? (
                        historyList.slice(0, 2).map((item) => (
                            <div key={item.id} className="dash-history-card" onClick={() => handleMenuClick('history')}>
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

                <section className="mobile-only-menu mobile-only-menu--spaced">
                    <h4 className="mobile-menu-label">전체 메뉴</h4>
                    <div className="mobile-menu-group">
                        {[
                            { label: '상담 히스토리', id: 'history' },
                            { label: '이용권/결제', id: 'tickets' },
                            { label: '문의내역', id: 'inquiry' },
                            { label: '찜 내역', id: 'favorites' },
                        ].map(({ label, id }) => (
                            <div key={id} onClick={() => handleMenuClick(id)} className="mobile-menu-item border-b">
                                <span>{label}</span>
                                <ChevronRight size={16} />
                            </div>
                        ))}
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
    };

    // ── JSX ──
    return (
        <div className="mypage-layout-root">
            {toast && <div className="mp-toast">{toast}</div>}

            <aside className="mypage-sidebar">
                <div className="sidebar-logo-section mp-cursor-pointer" onClick={() => navigate('/')}>
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
                    {MENU_ITEMS.map(({ id, label, icon: Icon }) => (
                        <div
                            key={id}
                            onClick={() => handleMenuClick(id)}
                            className={`sidebar-nav-item ${activeMenu === id ? 'is-active' : ''}`}
                        >
                            <Icon size={20} />
                            <span>{label}</span>
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
                                <img
                                    src={avatarSrc(userInfo.name, userInfo.profile_img_url)}
                                    alt="User"
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = avatarSrc(userInfo.name);
                                    }}
                                />
                            </div>
                            <div className="user-info-text">
                                <h2 className="user-name-title">
                                    안녕하세요, {userInfo.name ? `${userInfo.name}님` : ''}!
                                </h2>
                                <p className="user-status-msg">
                                    {(() => {
                                        if (!userInfo.created_at) return '마음 근육을 키운 지 0일째 되는 날이에요. 🌿';
                                        const joinDate = new Date(userInfo.created_at);
                                        const today = new Date();
                                        // 시차 보정 (UTC → KST)
                                        const diffTime = today.setHours(0, 0, 0, 0) - joinDate.setHours(0, 0, 0, 0);
                                        const days = Math.max(1, Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1);
                                        return `마음 근육을 키운 지 ${days}일째 되는 날이에요. 🌿`;
                                    })()}
                                </p>
                            </div>
                        </div>
                        <button className="user-notif-check-btn" onClick={() => setActiveMenu('notifications')}>
                            <Bell size={18} className="icon-green" /> 알림 확인
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
