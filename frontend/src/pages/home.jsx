import React from 'react';
import Header from '../components/header';
import Footer from '../components/footer';
import { 
    Video, 
    ChevronRight, 
    Calendar, 
    Sparkles, 
    TrendingUp, 
    Activity, 
    Coffee, 
    CalendarHeart,
    Smile,
    Zap,
    Frown
} from 'lucide-react';
import '../static/home.css'

export default function Home() {
    const emotionStats = [
        { label: '행복/기쁨', value: 65, color: '#8BA888', icon: Smile },
        { label: '스트레스', value: 20, color: '#FCD34D', icon: Zap },
        { label: '불안/우울', value: 15, color: '#FDA4AF', icon: Frown },
    ];

    return (
        <>
        <Header />
        <main className="main-content">

        <div className="content-grid">
            {/* 콘텐츠 영역 (좌측/중앙) */}
            <div className="main-column">
            {/* Hero 카드 */}
            <section className="hero-card">
                <div className="hero-flex">
                <div className="hero-text">
                    <span className="tag">Emotion Care</span>
                    <h2>소현님, <br/>지금 마음은 <span className="highlight">안녕</span>한가요?</h2>
                    <p>오늘의 감정을 기록하면 AI가 소현님의 마음 상태를 분석해 따뜻한 처방을 내려드려요.</p>
                </div>
                <div className="hero-emoji">🫣</div>
                </div>
                <button className="primary-button">
                <Sparkles size={20} />
                <span>오늘의 마음 기록하기</span>
                </button>
            </section>

            {/* AI 감정 리포트 */}
            <section className="report-card">
                <div className="report-header">
                <h3><TrendingUp className="accent-color" size={22} /> 이번 주 감정 리포트</h3>
                <div className="date-badge">5월 14일 ~ 5월 20일</div>
                </div>
                <div className="report-body">
                <div className="chart-area">
                    <svg className="donut-chart">
                    <circle cx="88" cy="88" r="70" className="chart-bg" />
                    <circle cx="88" cy="88" r="70" className="chart-fill" />
                    </svg>
                    <div className="chart-label">
                    <span className="percent">65%</span>
                    <span className="status">맑음</span>
                    </div>
                </div>
                <div className="stats-list">
                    {emotionStats.map((stat, idx) => (
                    <div key={idx} className="stat-item">
                        <div className="stat-info">
                        <div className="stat-icon-bg" style={{ color: stat.color }}><stat.icon size={18} /></div>
                        <span>{stat.label}</span>
                        </div>
                        <span className="stat-value">{stat.value}%</span>
                    </div>
                    ))}
                </div>
                </div>
            </section>

            {/* 하단 2열 카드 */}
            <div className="bottom-cards">
                <section className="info-card">
                <div className="card-top">
                    <div className="icon-box green"><Activity size={18} /></div>
                    <h3>AI 맞춤 추천</h3>
                </div>
                <p>최근 일기 데이터를 통해 <br/><strong>박민우 코치</strong>님을 찾았어요.</p>
                <button className="text-button">전문가 찾기 <ChevronRight size={16} /></button>
                </section>
                <section className="info-card">
                <div className="card-top">
                    <div className="icon-box amber"><Coffee size={18} /></div>
                    <h3>오늘의 힐링</h3>
                </div>
                <div className="healing-content">
                    <div className="icon-circle"><Coffee size={32} /></div>
                    <h4>카모마일 차 한 잔</h4>
                    <p>긴장을 풀어주는 향긋한 차 한 잔 어때요?</p>
                </div>
                </section>
            </div>
            </div>

            {/* 사이드바 (예약 현황) */}
            <aside className="side-column">
            <div className="side-header">
                <h3><CalendarHeart size={20} className="accent-color" /> 예약 현황</h3>
                <button className="more-btn">전체보기</button>
            </div>
            <div className="reservation-list">
                <div className="main-res-card">
                <div className="res-top">
                    <div className="res-icon"><Video size={24} /></div>
                    <span className="d-day">D-2</span>
                </div>
                <div className="res-info">
                    <p>화상 심리 상담</p>
                    <h4>이은지 코치님</h4>
                </div>
                <div className="res-time">
                    <Calendar size={18} /> <span>5월 20일 (수) 오후 2:00</span>
                </div>
                </div>
                <div className="sub-res-card">
                <div className="icon-box-small"><Activity size={22} /></div>
                <div className="sub-info">
                    <span className="next-week">Next Week</span>
                    <p className="title">정기 명상 세션</p>
                    <p className="date">5월 27일 (수)</p>
                </div>
                <ChevronRight size={18} className="arrow" />
                </div>
            </div>
            </aside>
        </div>
        </main>
        <Footer />
        </>
    );
}