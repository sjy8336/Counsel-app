import React, { useState, useEffect } from 'react';
import Header from '../components/header.jsx';
import Footer from '../components/footer.jsx';
import MobileTap from '../components/mobileTap.jsx';
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
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import '../static/Home.css';

export default function App() {
    const [activeTab, setActiveTab] = useState('home');
    const [userName, setUserName] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const user = localStorage.getItem('user');
        if (user) {
            const userObj = JSON.parse(user);
            setUserName(userObj.full_name || userObj.username || '');
        } else {
            setUserName('');
        }
    }, []);

    // 데이터 구성

    const emotionStats = [
        { label: '행복/기쁨', value: 65, color: '#8BA888', icon: Smile },
        { label: '스트레스', value: 20, color: '#FCD34D', icon: Zap },
        { label: '불안/우울', value: 15, color: '#FDA4AF', icon: Frown },
    ];

    // record-btn 클릭 핸들러
    const handleRecordClick = () => {
        const user = localStorage.getItem('user');
        if (!user) {
            alert('로그인 후 이용 가능합니다.');
            navigate('/login');
            return;
        }
        // 로그인 상태라면 실제 기록 페이지로 이동 등 추가 동작 구현 가능
    };

    return (
        <div className="app-container">
            <Header activeTab={activeTab} setActiveTab={setActiveTab} />
            {/* 2. 모바일 전용 검색바 */}
            <section className="mobile-search-section">
                <div className="search-container">
                    <div className="search-input-wrapper">
                        <Search className="search-icon" size={20} />
                        <input type="text" placeholder="전문가 찾기" className="search-input" />
                    </div>
                </div>
            </section>

            {/* 3. 메인 콘텐츠 */}
            <main className="main-content">
                <div className="main-grid">
                    {/* 콘텐츠 영역 (좌측/중앙) */}
                    <div className="content-col">
                        {/* Hero 카드 */}
                        <section className="hero-section">
                            <div className="hero-content">
                                <div>
                                    <span className="emotion-badge">Emotion Care</span>
                                    <h2 className="hero-title">
                                        {userName && (
                                            <>
                                                {userName}님, <br />
                                            </>
                                        )}
                                        지금 마음은 <span className="highlight-text">안녕</span>한가요?
                                    </h2>
                                    <p className="home-hero-desc">
                                        오늘의 감정을 기록하면 AI가 소현님의 마음 상태를 분석해 가장 따뜻한 처방을
                                        내려드려요.
                                    </p>
                                </div>
                                <div className="hero-emoji">😊</div>
                            </div>
                            <button className="record-btn" onClick={handleRecordClick}>
                                <Sparkles size={20} />
                                <span>오늘의 마음 기록하기</span>
                            </button>
                        </section>

                        {/* AI 감정 리포트 */}
                        <section className="report-section">
                            <div className="report-header">
                                <div>
                                    <h3 className="report-title">
                                        <TrendingUp className="report-icon" size={22} />
                                        이번 주 감정 리포트
                                    </h3>
                                </div>
                                <div className="report-date">5월 14일 ~ 5월 20일</div>
                            </div>

                            <div className="report-grid">
                                <div className="donut-chart-container">
                                    <svg className="donut-svg">
                                        <circle
                                            cx="88"
                                            cy="88"
                                            r="70"
                                            stroke="#F1F5F9"
                                            strokeWidth="24"
                                            fill="transparent"
                                        />
                                        <circle
                                            cx="88"
                                            cy="88"
                                            r="70"
                                            stroke="#8BA888"
                                            strokeWidth="24"
                                            fill="transparent"
                                            strokeDasharray="440"
                                            strokeDashoffset={440 - (440 * 65) / 100}
                                            strokeLinecap="round"
                                        />
                                        <circle
                                            cx="88"
                                            cy="88"
                                            r="70"
                                            stroke="#FCD34D"
                                            strokeWidth="24"
                                            fill="transparent"
                                            strokeDasharray="440"
                                            strokeDashoffset={440 - (440 * 20) / 100}
                                            transform="rotate(234, 88, 88)"
                                            strokeLinecap="round"
                                        />
                                    </svg>
                                    <div className="donut-text-container">
                                        <span className="donut-value">65%</span>
                                        <span className="donut-label">맑음</span>
                                    </div>
                                </div>

                                <div className="stats-list">
                                    {emotionStats.map((stat, idx) => (
                                        <div key={idx} className="stat-item">
                                            <div className="stat-info">
                                                <div className="stat-icon-wrap" style={{ color: stat.color }}>
                                                    <stat.icon size={18} />
                                                </div>
                                                <span className="stat-label">{stat.label}</span>
                                            </div>
                                            <span className="stat-value-text">{stat.value}%</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </section>

                        <div className="card-grid">
                            {/* AI 맞춤 추천 */}
                            <section className="recommend-section">
                                <div className="recommend-content">
                                    <div className="card-header">
                                        <div className="card-icon">
                                            <Activity size={18} />
                                        </div>
                                        <h3 className="card-title">AI 맞춤 추천</h3>
                                    </div>
                                    <p className="recommend-text">
                                        최근 일기 데이터를 통해 <br />
                                        <strong className="recommend-expert">박민우 코치</strong>님을 찾았어요.
                                    </p>
                                </div>
                                <button className="recommend-btn">
                                    <span>전문가 찾기</span>
                                    <ChevronRight size={16} className="arrow-icon" />
                                </button>
                            </section>

                            {/* 오늘의 힐링 */}
                            <section className="healing-section">
                                <div className="card-header healing-header">
                                    <div className="card-icon healing-icon">
                                        <Coffee size={18} />
                                    </div>
                                    <h3 className="card-title">오늘의 힐링</h3>
                                </div>
                                <div className="healing-content">
                                    <div className="healing-icon-large">
                                        <Coffee size={32} />
                                    </div>
                                    <h4 className="healing-title">카모마일 차 한 잔</h4>
                                    <p className="healing-desc">긴장을 풀어주는 향긋한 차 한 잔 어때요?</p>
                                </div>
                            </section>
                        </div>
                    </div>

                    {/* 서브 컬럼 (사이드바) */}
                    <div className="sidebar-col">
                        <section className="reservation-section">
                            <div className="reservation-header">
                                <h3 className="reservation-title">
                                    <CalendarHeart size={20} className="res-title-icon" />
                                    <span>예약 현황</span>
                                </h3>
                                <button className="view-all-btn">전체보기</button>
                            </div>

                            <div className="reservation-list">
                                {/* 메인 예약 카드 */}
                                <div className="main-reservation-card">
                                    <div className="res-card-top">
                                        <div className="res-icon">
                                            <Video size={24} />
                                        </div>
                                        <span className="res-dday">D-2</span>
                                    </div>
                                    <div className="res-info">
                                        <p className="res-type">화상 심리 상담</p>
                                        <h4 className="res-name">이은지 코치님</h4>
                                    </div>
                                    <div className="res-date-wrap">
                                        <Calendar size={18} className="res-date-icon" />
                                        <span className="res-date-text">5월 20일 (수) 오후 2:00</span>
                                    </div>
                                </div>

                                {/* 다음 예약 */}
                                <div className="next-reservation-card">
                                    <div className="next-res-content">
                                        <div className="next-res-icon">
                                            <Activity size={22} />
                                        </div>
                                        <div className="next-res-info">
                                            <p className="next-res-label">Next Week</p>
                                            <p className="next-res-title">정기 명상 세션</p>
                                            <p className="next-res-date">5월 27일 (수)</p>
                                        </div>
                                        <ChevronRight size={18} className="next-res-arrow" />
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>
                </div>
            </main>
            <Footer />
            <MobileTap />
        </div>
    );
}