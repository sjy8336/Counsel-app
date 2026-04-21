import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Search, User } from 'lucide-react';
import '../static/Common.css';

/* *
 * Header 컴포넌트
 * @param {string} activeTab - 현재 활성화된 탭 ID
 * @param {function} setActiveTab - 탭 변경 함수
 * @param {Array} pcGnbItems - PC 네비게이션 메뉴 리스트 (방어 코드를 위해 기본값 [] 설정)
 */
export default function Header({ activeTab, setActiveTab }) {
    // 로그인 상태 및 사용자 이름
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userName, setUserName] = useState('');
    useEffect(() => {
        const user = localStorage.getItem('user');
        if (user) {
            const userObj = JSON.parse(user);
            setIsLoggedIn(true);
            setUserName(userObj.full_name || userObj.username || '');
        } else {
            setIsLoggedIn(false);
            setUserName('');
        }
    }, []);
    const navigate = useNavigate();
    const pcGnbItems = [
        { id: 'search', label: '전문가 찾기' },
        { id: 'reservation', label: '예약 관리' },
        { id: 'diary', label: 'AI 일기' },
        { id: 'lounge', label: '힐링 라운지' },
    ];
    return (
        //1. 글로벌 네비게이션 (Header)
        <header className="global-header">
            <div className="header-content">
                <h1 className="logo" onClick={() => { setActiveTab('home'); navigate('/'); }}>
                    MINDWELL
                </h1>

                <nav className="pc-nav">
                    {pcGnbItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => {
                                setActiveTab(item.id);
                                if (item.id === 'search') {
                                    navigate('/counselors');
                                } else if (item.id === 'reservation') {
                                    navigate('/reserve');
                                }
                            }}
                            className={`nav-item ${activeTab === item.id ? 'nav-item-active' : ''}`}
                        >
                            <span className="nav-item-text">{item.label}</span>
                        </button>
                    ))}
                </nav>

                <div className="user-actions">
                    {isLoggedIn && (
                        <button className="bell-btn">
                            <Bell size={22} />
                            <span className="notification-dot"></span>
                        </button>
                    )}
                    {isLoggedIn ? (
                        <div className="user-profile" onClick={() => navigate('/mypage')} style={{ cursor: 'pointer' }}>
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
