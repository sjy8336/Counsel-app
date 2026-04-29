import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Search, User } from 'lucide-react';
import { getMyInfo } from '../api/user';
import '../static/Common.css';

/* *
 * Header 컴포넌트
 * @param {string} activeTab - 현재 활성화된 탭 ID
 * @param {function} setActiveTab - 탭 변경 함수
 * @param {Array} pcGnbItems - PC 네비게이션 메뉴 리스트 (방어 코드를 위해 기본값 [] 설정)
 */
export default function Header({ activeTab, setActiveTab, userName = '', setUserName, isLoggedIn = false, setIsLoggedIn }) {
    // 상태는 상위에서 관리, userRole만 내부에서 관리
    const [userRole, setUserRole] = useState('');
    useEffect(() => {
        // localStorage에 access_token이 있으면 /me로 내 정보 최신화
        const token = localStorage.getItem('access_token');
        if (token) {
            getMyInfo(token)
                .then((userObj) => {
                    setIsLoggedIn && setIsLoggedIn(true);
                    setUserName && setUserName(userObj.full_name || userObj.username || '');
                    setUserRole(userObj.role || '');
                    // 최신 user 정보 localStorage에도 저장
                    localStorage.setItem('user', JSON.stringify(userObj));
                })
                .catch(() => {
                    setIsLoggedIn && setIsLoggedIn(false);
                    setUserName && setUserName('');
                    setUserRole('');
                });
        } else {
            // 토큰 없으면 기존 방식
            const user = localStorage.getItem('user');
            if (user) {
                const userObj = JSON.parse(user);
                setIsLoggedIn && setIsLoggedIn(true);
                setUserName && setUserName(userObj.full_name || userObj.username || '');
                setUserRole(userObj.role || '');
            } else {
                setIsLoggedIn && setIsLoggedIn(false);
                setUserName && setUserName('');
                setUserRole('');
            }
        }
    }, [setIsLoggedIn, setUserName]);
    const navigate = useNavigate();

    // PC 메뉴: role에 따라 다르게 렌더링
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
        // client, admin
        pcGnbItems = [
            { id: 'search', label: '전문가 찾기' },
            { id: 'reservation', label: '예약 관리' },
            { id: 'diary', label: 'AI 일기' },
            { id: 'lounge', label: '힐링 라운지' },
        ];
    }

    // 메뉴별 네비게이션 경로 (role별로 다르게 처리할 수 있도록 분기)
    const handleMenuClick = (item) => {
        setActiveTab(item.id);
        if (!isLoggedIn) {
            // 비로그인 시 기존 경로
            if (item.id === 'search') navigate('/counselors');
            else if (item.id === 'reservation') navigate('/reserve');
            else if (item.id === 'diary') navigate('/diary');
            else if (item.id === 'lounge') navigate('/healing');
        } else if (userRole === 'counselor') {
            if (item.id === 'reservation') navigate('/CounselorPlanner');
            else if (item.id === 'client') navigate('/CounselorClient');
            else if (item.id === 'inquiry') navigate('/CounselorMessages');
        } else {
            // client, admin
            if (item.id === 'search') navigate('/counselors');
            else if (item.id === 'reservation') navigate('/reserve');
            else if (item.id === 'diary') navigate('/diary');
            else if (item.id === 'lounge') navigate('/healing');
        }
    };

    // 벨 버튼 클릭 — role에 따라 마이페이지로 이동 (알람센터)
  const handleBellClick = () => {
    if (userRole === 'counselor') {
        navigate('/CounselorMyPage?tab=notifications'); // ← ?tab=notifications 추가
    } else {
        navigate('/mypage');
    }
};

    return (
        //1. 글로벌 네비게이션 (Header)
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
                    {isLoggedIn && (
                        <button className="bell-btn" onClick={handleBellClick}>
                        <Bell size={22} />
                        <span className="notification-dot"></span>
                        </button>
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
                                    // fallback: 로그인은 했지만 role 정보가 없을 때
                                    navigate('/mypage');
                                }
                            }}
                            style={{ cursor: 'pointer' }}
                        >
                            <div className="user-avatar">
                                <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${userName}`} alt="User" />
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
