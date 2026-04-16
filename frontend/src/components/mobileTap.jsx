import React, { useState } from 'react';
import '../static/common.css';
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
  Zap
} from 'lucide-react';

export default function mobileTap() {
    const [activeTab, setActiveTab] = useState('home');
      const mobileMenuItems = [
    { id: 'home', icon: Home, label: '홈' },
    { id: 'reservation', icon: Calendar, label: '예약 관리' },
    { id: 'diary', icon: BookOpen, label: 'AI 일기' },
    { id: 'lounge', icon: Coffee, label: '힐링 라운지' },
    { id: 'mypage', icon: UserCircle, label: '마이페이지' },
  ];
  return (
    <div>
       {/* 5. 모바일 전용 탭 내비게이션 (고정) */}
        <nav className="mobile-nav">
            <div className="mobile-nav-container">
            {mobileMenuItems.map((item) => (
                <button 
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`mobile-nav-item ${activeTab === item.id ? 'mobile-nav-item-active' : ''}`}
                >
                <item.icon size={22} strokeWidth={activeTab === item.id ? 2.5 : 2} />
                <span className="mobile-nav-item-text">{item.label}</span>
                </button>
            ))}
            </div>
        </nav>
        </div>
    )
}
