import React, { useState, useEffect } from 'react';
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
import { useNavigate, useLocation } from 'react-router-dom';

export default function MobileTap() {
    const [activeTab, setActiveTab] = useState('home');
    const location = useLocation();
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

    // URL 경로에 따라 activeTab 자동 설정
    useEffect(() => {
        const path = location.pathname;
        if (userRole === 'counselor') {
            if (path.startsWith('/CounselorHome')) setActiveTab('home');
            else if (path.startsWith('/CounselorPlanner')) setActiveTab('reservation');
            else if (path.startsWith('/CounselorClient')) setActiveTab('client');
            else if (path.startsWith('/CounselorMessages')) setActiveTab('inquiry');
            else if (path.startsWith('/CounselorMyPage')) setActiveTab('mypage');
        } else {
            if (path === '/' || path.startsWith('/home')) setActiveTab('home');
            else if (path.startsWith('/reserve') || path.startsWith('/reservation')) setActiveTab('reservation');
            else if (path.startsWith('/diary') || path.startsWith('/AIdiary') || path.startsWith('/ai-diary'))
                setActiveTab('diary');
            else if (path.startsWith('/healing')) setActiveTab('lounge');
            else if (path.startsWith('/mypage')) setActiveTab('mypage');
        }
    }, [location.pathname, userRole]);

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
        // 비로그인(내담자/관리자/비회원) 보호 메뉴 처리
        if (!userRole || userRole === 'client' || userRole === 'admin' || userRole === '') {
            // 전문가 찾기, 힐링 라운지는 로그인 없이 접근 허용
            if (item.id === 'reservation' || item.id === 'diary' || item.id === 'mypage') {
                if (window.confirm('로그인해야 이용 가능합니다.\n로그인 페이지로 이동할까요?')) {
                    navigate('/login');
                }
                return;
            }
            if (item.id === 'home') navigate('/');
            else if (item.id === 'lounge') navigate('/healing');
            else if (item.id === 'search') navigate('/counselors');
            return;
        }
        // 상담사 메뉴
        if (userRole === 'counselor') {
            if (item.id === 'home') navigate('/CounselorHome');
            else if (item.id === 'reservation') navigate('/CounselorPlanner');
            else if (item.id === 'client') navigate('/CounselorClient');
            else if (item.id === 'inquiry') navigate('/CounselorMessages');
            else if (item.id === 'mypage') navigate('/CounselorMyPage');
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
