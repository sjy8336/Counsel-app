import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Bell, Search, User, Check, MessageSquare, AlertCircle, ShieldCheck, CalendarPlus } from 'lucide-react';
import { getNotifications } from '../api/notification';
import { getMyInfo } from '../api/user.js';
import { getCounselorProfile } from '../api/counselor.js';
import '../static/Common.css';
import '../static/NotifPopup.css';

/* *
 * Header 컴포넌트
 * @param {string} activeTab - 현재 활성화된 탭 ID
 * @param {function} setActiveTab - 탭 변경 함수
 * @param {Array} pcGnbItems - PC 네비게이션 메뉴 리스트 (방어 코드를 위해 기본값 [] 설정)
 */
function formatTime(dateStr) {
    if (!dateStr) return '';
    // 서버에서 UTC로 내려올 경우 KST(+9시간) 보정
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
    // localStorage에서 바로 읽어서 초기값 세팅
    const getInitialRole = () => {
        try {
            const userStr = localStorage.getItem('user');
            if (userStr) {
                const user = JSON.parse(userStr);
                if (user.role) return user.role;
            }
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
    const location = useLocation();

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 1024);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // 로그인 시점 또는 알림창 열릴 때 알림 불러오기
    useEffect(() => {
        const fetchNotifications = async () => {
            const token = localStorage.getItem('access_token');
            if (!token) {
                setNotifications([]);
                return;
            }
            try {
                const res = await getNotifications(token);
                // 최신순 정렬
                const mapped = (res.data || [])
                    .map((n) => ({
                        ...n,
                        unread: !n.read,
                        time: formatTime(n.created_at),
                    }))
                    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
                setNotifications(mapped);
            } catch (e) {
                setNotifications([]);
            }
        };
        if (isLoggedIn) fetchNotifications();
    }, [isLoggedIn]);

    // 로그인/페이지 이동 시 userRole을 항상 세팅
    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            try {
                const user = JSON.parse(userStr);
                if (user.role) setUserRole(user.role);
            } catch {}
        }
    }, [isLoggedIn, location.pathname]);

    // 알림창 열릴 때마다 새로고침 (알림 삭제 X, 최신순 5개만 보여줌)
    useEffect(() => {
        if (!notifOpen) return;
        const fetchNotifications = async () => {
            const token = localStorage.getItem('access_token');
            if (!token) return;
            try {
                const res = await getNotifications(token);
                const mapped = (res.data || [])
                    .map((n) => ({
                        ...n,
                        unread: !n.read,
                        time: formatTime(n.created_at),
                    }))
                    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
                setNotifications(mapped);
            } catch {}
        };
        fetchNotifications();
    }, [notifOpen]);
    // 로그인/페이지 이동 시 userRole을 항상 세팅
    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            try {
                const user = JSON.parse(userStr);
                if (user.role) setUserRole(user.role);
            } catch {}
        }
    }, [isLoggedIn, location.pathname]);

    // 상담사라면 DB에서 최신 프로필 이미지 fetch
    useEffect(() => {
        const fetchCounselorProfileImg = async () => {
            const token = localStorage.getItem('access_token');
            if (!token) return;
            try {
                const user = JSON.parse(localStorage.getItem('user') || '{}');
                if (user.role === 'counselor') {
                    const prof = await getCounselorProfile(token);
                    if (prof && prof.profile_img_url) {
                        setProfileImgUrl(prof.profile_img_url);
                        user.profile_img_url = prof.profile_img_url;
                        localStorage.setItem('user', JSON.stringify(user));
                    }
                    setUserRole('counselor'); // 명시적으로 counselor로 설정
                }
            } catch {
                // ignore
            }
        };
        fetchCounselorProfileImg();
    }, [location.pathname]);

    const navigate = useNavigate();

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
            if (item.id === 'search') navigate('/counselors');
            else if (item.id === 'reservation') navigate('/reserve');
            else if (item.id === 'diary') navigate('/diary');
            else if (item.id === 'lounge') navigate('/healing');
        } else if (userRole === 'counselor') {
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

    const handleBellClick = () => {
        setNotifOpen((prev) => !prev);
    };

    useEffect(() => {
        if (!notifOpen) return;
        const handleClick = (e) => {
            if (notifRef.current && !notifRef.current.contains(e.target)) {
                setNotifOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, [notifOpen]);

    const hasUnread = notifications.some((n) => n.unread);

    // 검색창 열릴 때 자동 포커스
    useEffect(() => {
        if (searchOpen && searchInputRef.current) {
            setTimeout(() => searchInputRef.current?.focus(), 100);
        }
    }, [searchOpen]);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/counselors?q=${encodeURIComponent(searchQuery.trim())}`);
        } else {
            navigate('/counselors');
        }
        setSearchOpen(false);
        setSearchQuery('');
    };

    const quickMenuItems = userRole === 'counselor'
        ? [
            { label: '예약 관리', path: '/CounselorPlanner' },
            { label: '내담자 관리', path: '/CounselorClient' },
            { label: '문의하기', path: '/CounselorMessages' },
          ]
        : [
            { label: '전문가 찾기', path: '/counselors' },
            { label: '예약 관리', path: '/reserve' },
            { label: 'AI 일기', path: '/diary' },
            { label: '힐링 라운지', path: '/healing' },
          ];

    return (
        <header className="global-header">
            <div className="header-content">
                <h1
                    className="logo"
                    onClick={() => {
                        setActiveTab('home');
                        if (isLoggedIn && userRole === 'counselor') {
                            navigate('/CounselorHome');
                        } else {
                            navigate('/');
                        }
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
                    {/* 모바일 전용 검색 버튼 */}
                    {isMobile && (
                        <button
                            className="mobile-search-btn"
                            onClick={() => setSearchOpen((prev) => !prev)}
                            aria-label="검색"
                            style={{
                                minWidth: '40px', minHeight: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0.5rem',
                            }}
                        >
                            <Search style={{ width: '24px', height: '24px', display: 'block' }} />
                        </button>
                    )}
                    {/* ✅ 관리자 전용 버튼 - role이 admin일 때만 노출 */}
                    {isLoggedIn && userRole === 'admin' && (
                        <button className="admin-page-btn" onClick={() => navigate('/admin')} title="관리자 페이지">
                            <ShieldCheck size={16} />
                            <span>관리자</span>
                        </button>
                    )}

                    {isLoggedIn && (
                        <div style={{ position: 'relative', display: 'inline-block' }} ref={notifRef}>
                            {/* 벨 버튼 — 읽지 않은 알림이 있으면 빨간 점 표시 */}
                            <button
                                className="bell-btn"
                                onClick={handleBellClick}
                                style={{
                                    position: 'relative',
                                    minWidth: '40px', minHeight: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0.5rem',
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
                                                    onClick={() => {
                                                        // 알림 삭제/숨김 없이, 단순히 페이지 이동만
                                                        navigate('/CounselorMyPage?tab=notifications');
                                                        setNotifOpen(false);
                                                    }}
                                                    style={{ cursor: 'pointer' }}
                                                >
                                                    <span className="notif-popup-icon">
                                                        {n.type === 'booking' && <Check size={15} />}
                                                        {n.type === 'booking_request' && <CalendarPlus size={15} />}
                                                        {n.type === 'msg' && <MessageSquare size={15} />}
                                                        {n.type === 'notice' && <AlertCircle size={15} />}
                                                    </span>
                                                    <div className="notif-popup-content">
                                                        <div className="notif-popup-title">{n.title}</div>
                                                        <div className="notif-popup-desc">{n.desc}</div>
                                                    </div>
                                                    <span className="notif-popup-time">{n.time || ''}</span>
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
                            onClick={() => {
                                if (userRole === 'counselor') {
                                    navigate('/CounselorMyPage');
                                } else if (userRole === 'client') {
                                    navigate('/mypage');
                                } else if (userRole === 'admin') {
                                    navigate('/mypage');
                                } else {
                                    navigate('/mypage');
                                }
                            }}
                            style={{ cursor: 'pointer' }}
                        >
                            <div className="user-avatar">
                                {profileImgUrl ? (
                                    <img src={profileImgUrl} alt="프로필" className="cmp-profile-img-content" />
                                ) : userName && userName.trim() ? (
                                    <img
                                        src={`https://api.dicebear.com/7.x/notionists/svg?seed=${userName}`}
                                        alt="User"
                                    />
                                ) : null}
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

                       {/* 모바일 전용 검색 패널 - searchOpen일 때만 렌더링 */}
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
                            {searchQuery ? (
                                <button
                                    type="button"
                                    className="mobile-search-clear"
                                    onClick={() => setSearchQuery('')}
                                >×</button>
                            ) : null}
                        </div>
                    </form>
                </div>
            )}
        </header>
    );
}