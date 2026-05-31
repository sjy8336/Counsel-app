import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Bell, Search, User, Check, MessageSquare, AlertCircle, ShieldCheck, CalendarPlus } from 'lucide-react';
import { getNotifications } from '../api/notification';
import { getCounselorProfile } from '../api/counselor.js';
import { getUserInfo } from '../api/user';
import { API_ORIGIN_URL } from '../api/axiosInstance';

const API_URL = API_ORIGIN_URL;
const avatarSrc = (name, url) => {
    if (url?.trim()) {
        if (url.startsWith('/static/')) {
            return API_URL + url;
        }
        return url;
    }
    return `https://api.dicebear.com/7.x/notionists/svg?seed=${name || 'default'}`;
};
import '../static/Common.css';
import '../static/NotifPopup.css';

function formatTime(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const kstDate = new Date(date.getTime() + 9 * 60 * 60 * 1000);
    const diff = Math.floor((Date.now() - kstDate.getTime()) / 1000);
    if (diff < 60) return '방금 전';
    if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`;
    return `${Math.floor(diff / 86400)}일 전`;
}

export default function Header({
    activeTab,
    setActiveTab,
    userName = '',
    setUserName,
    isLoggedIn = false,
    setIsLoggedIn,
}) {
    const navigate = useNavigate();
    const location = useLocation(); // ← 한 번만 선언

    const getInitialRole = () => {
        try {
            const u = JSON.parse(localStorage.getItem('user'));
            if (u?.role) return u.role;
        } catch {}
        return '';
    };

    const [userRole, setUserRole] = useState(getInitialRole());
    const [profileImgUrl, setProfileImgUrl] = useState('');
    const [notifOpen, setNotifOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
    const notifRef = useRef(null);
    const searchInputRef = useRef(null);

    // 리사이즈
    useEffect(() => {
        const h = () => setIsMobile(window.innerWidth < 1024);
        window.addEventListener('resize', h);
        return () => window.removeEventListener('resize', h);
    }, []);

    // profileImgChanged 이벤트 + 로그인/페이지 이동 시 localStorage 동기화
    useEffect(() => {
        const sync = () => {
            const u = JSON.parse(localStorage.getItem('user') || '{}');
            setProfileImgUrl(u.profile_img_url || '');
        };
        sync();
        window.addEventListener('profileImgChanged', sync);
        return () => window.removeEventListener('profileImgChanged', sync);
    }, [isLoggedIn, location.pathname]);

    // userRole 동기화
    useEffect(() => {
        try {
            const u = JSON.parse(localStorage.getItem('user') || '{}');
            if (u.role) setUserRole(u.role);
        } catch {}
    }, [isLoggedIn, location.pathname]);

    // 프로필 이미지 fetch (상담사/내담자 모두 DB에서 최신값 동기화)
    useEffect(() => {
        const fetchUserProfileImg = async () => {
            const token = localStorage.getItem('access_token');
            if (!token) return;
            try {
                const user = JSON.parse(localStorage.getItem('user') || '{}');
                if (user.role === 'counselor') {
                    // 상담사: getCounselorProfile 사용
                    const prof = await getCounselorProfile(token);
                    if (prof?.profile_img_url !== undefined) {
                        setProfileImgUrl(prof.profile_img_url || '');
                        user.profile_img_url = prof.profile_img_url || '';
                        localStorage.setItem('user', JSON.stringify(user));
                    }
                    setUserRole('counselor');
                } else if (user.role === 'client' && user.id) {
                    // 내담자: getUserInfo 사용
                    const userData = await getUserInfo(user.id);
                    if (userData?.profile_img_url !== undefined) {
                        setProfileImgUrl(userData.profile_img_url || '');
                        user.profile_img_url = userData.profile_img_url || '';
                        localStorage.setItem('user', JSON.stringify(user));
                    }
                    setUserRole('client');
                }
            } catch {
                /* ignore */
            }
        };
        fetchUserProfileImg();
    }, [location.pathname]);

    // 알림 fetch (로그인 시)
    useEffect(() => {
        if (!isLoggedIn) return;
        const fetchNotifications = async () => {
            const token = localStorage.getItem('access_token');
            if (!token) {
                setNotifications([]);
                return;
            }
            try {
                const res = await getNotifications(token);
                const mapped = (res.data || [])
                    .map((n) => ({ ...n, unread: !n.read, time: formatTime(n.created_at) }))
                    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
                setNotifications(mapped);
            } catch {
                setNotifications([]);
            }
        };
        fetchNotifications();
    }, [isLoggedIn]);

    // 알림창 열릴 때마다 새로고침
    useEffect(() => {
        if (!notifOpen) return;
        const fetchNotifications = async () => {
            const token = localStorage.getItem('access_token');
            if (!token) return;
            try {
                const res = await getNotifications(token);
                const mapped = (res.data || [])
                    .map((n) => ({ ...n, unread: !n.read, time: formatTime(n.created_at) }))
                    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
                setNotifications(mapped);
            } catch {}
        };
        fetchNotifications();
    }, [notifOpen]);

    // 알림창 외부 클릭 닫기
    useEffect(() => {
        if (!notifOpen) return;
        const h = (e) => {
            if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
        };
        document.addEventListener('mousedown', h);
        return () => document.removeEventListener('mousedown', h);
    }, [notifOpen]);

    // 검색창 자동 포커스
    useEffect(() => {
        if (searchOpen && searchInputRef.current) setTimeout(() => searchInputRef.current?.focus(), 100);
    }, [searchOpen]);

    const hasUnread = notifications.some((n) => n.unread);

    let pcGnbItems = [];
    if (!isLoggedIn) {
        pcGnbItems = [
            { id: 'search', label: '전문가 찾기' },
            { id: 'reservation', label: '예약 관리' },
            { id: 'diary', label: 'AI 일기' },
            { id: 'lounge', label: '힐링 라운지' },
        ];
    } else if (userRole === 'counselor') {
        pcGnbItems = [
            { id: 'reservation', label: '예약 관리' },
            { id: 'client', label: '내담자 관리' },
            { id: 'inquiry', label: '문의하기' },
        ];
    } else {
        pcGnbItems = [
            { id: 'search', label: '전문가 찾기' },
            { id: 'reservation', label: '예약 관리' },
            { id: 'diary', label: 'AI 일기' },
            { id: 'lounge', label: '힐링 라운지' },
        ];
    }

    const handleMenuClick = (item) => {
        setActiveTab(item.id);
        if (!isLoggedIn) {
            if (item.id === 'reservation' || item.id === 'diary') {
                if (window.confirm('로그인해야 이용 가능합니다. 로그인 페이지로 이동할까요?')) navigate('/login');
                return;
            }
            if (item.id === 'search') {
                navigate('/counselors');
                return;
            }
            if (item.id === 'lounge') {
                navigate('/healing');
                return;
            }
            return;
        }
        if (userRole === 'counselor') {
            if (item.id === 'reservation') navigate('/CounselorPlanner');
            else if (item.id === 'client') navigate('/CounselorClient');
            else if (item.id === 'inquiry') navigate('/CounselorMessages');
        } else {
            if (item.id === 'search') navigate('/counselors');
            else if (item.id === 'reservation') navigate('/reserve');
            else if (item.id === 'diary') navigate('/diary');
            else if (item.id === 'lounge') navigate('/healing');
        }
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        navigate(searchQuery.trim() ? `/counselors?q=${encodeURIComponent(searchQuery.trim())}` : '/counselors');
        setSearchOpen(false);
        setSearchQuery('');
    };

    return (
        <header className="global-header">
            <div className="header-content">
                <h1
                    className="logo"
                    onClick={() => {
                        setActiveTab('home');
                        navigate(isLoggedIn && userRole === 'counselor' ? '/CounselorHome' : '/');
                    }}
                >
                    MINDWELL
                </h1>

                <nav className="pc-nav">
                    {pcGnbItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => handleMenuClick(item)}
                            className={`nav-item ${activeTab === item.id ? 'nav-item-active' : ''}`}
                        >
                            <span className="nav-item-text">{item.label}</span>
                        </button>
                    ))}
                </nav>

                <div className="user-actions">
                    {isMobile && (
                        <button
                            className="mobile-search-btn"
                            onClick={() => setSearchOpen((p) => !p)}
                            aria-label="검색"
                            style={{
                                minWidth: '40px',
                                minHeight: '40px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: '0.5rem',
                            }}
                        >
                            <Search style={{ width: '24px', height: '24px', display: 'block' }} />
                        </button>
                    )}

                    {isLoggedIn && userRole === 'admin' && (
                        <button className="admin-page-btn" onClick={() => navigate('/admin')} title="관리자 페이지">
                            <ShieldCheck size={16} />
                            <span className="hidden-mobile">관리자</span>
                        </button>
                    )}

                    {isLoggedIn && (
                        <div style={{ position: 'relative', display: 'inline-block' }} ref={notifRef}>
                            <button
                                className="bell-btn"
                                onClick={() => setNotifOpen((p) => !p)}
                                style={{
                                    position: 'relative',
                                    minWidth: '40px',
                                    minHeight: '40px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    padding: '0.5rem',
                                }}
                            >
                                <Bell style={{ width: '24px', height: '24px', display: 'block' }} />
                                {hasUnread && (
                                    <span
                                        style={{
                                            position: 'absolute',
                                            top: '2px',
                                            right: '2px',
                                            width: '8px',
                                            height: '8px',
                                            borderRadius: '50%',
                                            background: '#ef4444',
                                            border: '1.5px solid #fff',
                                            display: 'block',
                                        }}
                                    />
                                )}
                            </button>

                            {notifOpen && (
                                <div className="notif-popup">
                                    <div className="notif-popup-header">
                                        알림
                                        <button className="notif-popup-close" onClick={() => setNotifOpen(false)}>
                                            ×
                                        </button>
                                    </div>
                                    <div className="notif-popup-list">
                                        {notifications.length === 0 ? (
                                            <div className="notif-popup-empty">알림이 없습니다.</div>
                                        ) : (
                                            notifications.slice(0, 5).map((n) => (
                                                <div
                                                    key={n.id}
                                                    className={`notif-popup-item${n.unread ? ' unread' : ''}`}
                                                    style={{ cursor: 'pointer' }}
                                                    onClick={() => {
                                                        navigate(
                                                            userRole === 'counselor'
                                                                ? '/CounselorMyPage?tab=notifications'
                                                                : '/mypage',
                                                            { state: { showNotifications: true } }
                                                        );
                                                        setNotifOpen(false);
                                                    }}
                                                >
                                                    <span className="notif-popup-icon">
                                                        {n.type === 'booking' && <Check size={15} />}
                                                        {n.type === 'booking_request' && <CalendarPlus size={15} />}
                                                        {n.type === 'msg' && <MessageSquare size={15} />}
                                                        {n.type === 'notice' && <AlertCircle size={15} />}
                                                    </span>
                                                    <div className="notif-popup-content">
                                                        <span className="notif-popup-title-desc">
                                                            <div className="notif-popup-title">{n.title}</div>
                                                            <div className="notif-popup-desc">{n.desc}</div>
                                                        </span>
                                                        <span className="notif-popup-time">{n.time || ''}</span>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {isLoggedIn ? (
                        <div
                            className="user-profile"
                            style={{ cursor: 'pointer' }}
                            onClick={() => navigate(userRole === 'counselor' ? '/CounselorMyPage' : '/mypage')}
                        >
                            <div className="user-avatar">
                                <img
                                    src={avatarSrc(userName, profileImgUrl)}
                                    alt="프로필"
                                    className="cmp-profile-img-content"
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = `https://api.dicebear.com/7.x/notionists/svg?seed=${userName || 'default'}`;
                                    }}
                                />
                            </div>
                            <span className="user-name">{userName} 님</span>
                        </div>
                    ) : (
                        <button className="user-login" onClick={() => navigate('/login')}>
                            <User size={22} className="login-icon" />
                            <span className="login-text">로그인</span>
                        </button>
                    )}
                </div>
            </div>

            {isMobile && searchOpen && (
                <div className="mobile-search-panel open">
                    <form onSubmit={handleSearchSubmit} className="mobile-search-form">
                        <div className="mobile-search-input-wrap">
                            <Search size={18} className="mobile-search-input-icon" />
                            <input
                                ref={searchInputRef}
                                type="text"
                                className="mobile-search-input"
                                placeholder="상담사 이름, 고민 분야 검색..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            {searchQuery && (
                                <button
                                    type="button"
                                    className="mobile-search-clear"
                                    onClick={() => setSearchQuery('')}
                                >
                                    ×
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            )}
        </header>
    );
}
