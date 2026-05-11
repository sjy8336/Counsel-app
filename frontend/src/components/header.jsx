import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Bell, Search, User, Check, MessageSquare, AlertCircle, ShieldCheck } from 'lucide-react';
import { getNotifications } from '../api/notification';
import '../static/Common.css';
import '../static/NotifPopup.css';

/* *
 * Header 컴포넌트
 * @param {string} activeTab - 현재 활성화된 탭 ID
 * @param {function} setActiveTab - 탭 변경 함수
 * @param {Array} pcGnbItems - PC 네비게이션 메뉴 리스트 (방어 코드를 위해 기본값 [] 설정)
 */
export default function Header({
    activeTab,
    setActiveTab,
    userName = '',
    setUserName,
    isLoggedIn = false,
    setIsLoggedIn,
}) {
    const [userRole, setUserRole] = useState('');
    const [notifOpen, setNotifOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const notifRef = useRef(null);
    const location = useLocation();

    // 알림 불러오기
    useEffect(() => {
        const fetchNotifications = async () => {
            const token = localStorage.getItem('access_token');
            if (!token) {
                setNotifications([]);
                return;
            }
            try {
                const res = await getNotifications(token);
                setNotifications(res.data || []);
            } catch (e) {
                setNotifications([]);
            }
        };
        if (notifOpen) fetchNotifications();
    }, [notifOpen]);

    useEffect(() => {
        const user = localStorage.getItem('user');
        if (user) {
            const userObj = JSON.parse(user);
            setUserRole(userObj.role || '');
        } else {
            setUserRole('');
        }
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
                    {/* ✅ 관리자 전용 버튼 - role이 admin일 때만 노출 */}
                    {isLoggedIn && userRole === 'admin' && (
                        <button
                            className="admin-page-btn"
                            onClick={() => navigate('/admin')}
                            title="관리자 페이지"
                        >
                            <ShieldCheck size={16} />
                            <span>관리자</span>
                        </button>
                    )}

                    {isLoggedIn && (
                        <div style={{ position: 'relative', display: 'inline-block' }} ref={notifRef}>
                            {/* 벨 버튼 — 읽지 않은 알림이 있으면 빨간 점 표시 */}
                            <button className="bell-btn" onClick={handleBellClick} style={{ position: 'relative' }}>
                                <Bell size={22} />
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
                                            notifications.map((n) => (
                                                <div
                                                    key={n.id}
                                                    className={`notif-popup-item${n.unread ? ' unread' : ''}`}
                                                >
                                                    <span className="notif-popup-icon">
                                                        {n.type === 'booking' && <Check size={15} />}
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
                                } else if (userRole === 'client' || userRole === 'admin') {
                                    navigate('/mypage');
                                } else {
                                    navigate('/mypage');
                                }
                            }}
                            style={{ cursor: 'pointer' }}
                        >
                            <div className="user-avatar">
                                {userName && userName.trim() ? (
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
        </header>
    );
}