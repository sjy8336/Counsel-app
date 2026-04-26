import React, { useState } from 'react';
import '../static/Common.css';
import {
    Bell,
    Calendar,
    Video,
    ChevronRight,
    Home,
    UserCircle,
    Coffee,
    Activity,
    CalendarHeart,
    Search,
    BookOpen,
    Sparkles,
    TrendingUp,
    Smile,
    Frown,
    Zap,
    MessageCircle,
} from 'lucide-react';

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function mobileTap() {
    const [activeTab, setActiveTab] = useState('home');
    const [userRole, setUserRole] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        // 로그인 시 role 정보 동기화
        const user = localStorage.getItem('user');
        if (user) {
            const userObj = JSON.parse(user);
            setUserRole(userObj.role || '');
        } else {
            setUserRole('');
        }
    }, []);

    let mobileMenuItems = [];
    if (userRole === 'counselor') {
        mobileMenuItems = [
            { id: 'home', icon: Home, label: '홈' },
            { id: 'reservation', icon: Calendar, label: '예약관리' },
            { id: 'client', icon: UserCircle, label: '내담자관리' },
            { id: 'inquiry', icon: MessageCircle, label: '문의하기' },
            { id: 'mypage', icon: UserCircle, label: '마이페이지' },
        ];
    } else {
        // 비로그인, client, admin
        mobileMenuItems = [
            { id: 'home', icon: Home, label: '홈' },
            { id: 'reservation', icon: Calendar, label: '예약 관리' },
            { id: 'diary', icon: BookOpen, label: 'AI 일기' },
            { id: 'lounge', icon: Coffee, label: '힐링 라운지' },
            { id: 'mypage', icon: UserCircle, label: '마이페이지' },
        ];
    }

    const handleMobileMenuClick = (item) => {
        setActiveTab(item.id);
        if (userRole === 'counselor') {
            if (item.id === 'home') navigate('/CounselorHome');
            else if (item.id === 'reservation') navigate('/CounselorMyPage');
            else if (item.id === 'client') navigate('/CounselorClient');
            else if (item.id === 'inquiry') navigate('/CounselorMyPage?tab=inquiry');
            else if (item.id === 'mypage') navigate('/CounselorMyPage?tab=mypage');
        } else {
            if (item.id === 'home') navigate('/');
            else if (item.id === 'reservation') navigate('/reserve');
            else if (item.id === 'diary') navigate('/diary');
            else if (item.id === 'lounge') navigate('/healing');
            else if (item.id === 'mypage') navigate('/mypage');
        }
    };

    return (
        <div>
            {/* 5. 모바일 전용 탭 내비게이션 (고정) */}
            <nav className="mobile-nav">
                <div className="mobile-nav-container">
                    {mobileMenuItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => handleMobileMenuClick(item)}
                            className={`mobile-nav-item ${activeTab === item.id ? 'mobile-nav-item-active' : ''}`}
                        >
                            <item.icon size={22} strokeWidth={activeTab === item.id ? 2.5 : 2} />
                            <span className="mobile-nav-item-text">{item.label}</span>
                        </button>
                    ))}
                </div>
            </nav>
        </div>
    );
}
