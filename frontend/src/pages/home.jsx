import React, { useState } from 'react';
import { Calendar, ChevronRight, PenTool, MapPin, Clock, Heart, Coffee, User, Lock } from 'lucide-react';
import '../static/home.css';
import Header from '../components/header';
import Footer from '../components/footer';
import MobileTap from '../components/mobileTap';

// --- 마음 챙김 가이드 데이터 ---
const MIND_GUIDES = [
    {
        id: 1,
        category: 'SLEEP CARE',
        title: '깊은 밤, 숙면을 돕는 릴렉스 가이드',
        imgUrl: 'https://cdn.pixabay.com/photo/2016/01/20/11/11/baby-1151351_1280.jpg',
        fallbackImg: 'https://images.unsplash.com/photo-1513694490325-24b4c241dfb3?q=80&w=800&auto=format&fit=crop',
        readTime: '15 min read',
        likes: 412,
        alt: '평온한 침실과 은은한 조명',
    },
    {
        id: 2,
        category: 'PSYCHOLOGY',
        title: "심리학자가 들려주는 '불안'을 다스리는 법",
        imgUrl: 'https://images.unsplash.com/photo-1499209974431-9dac3adaf471?q=80&w=1200&auto=format&fit=crop',
        fallbackImg: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=800&auto=format&fit=crop',
        readTime: '7 min read',
        likes: 189,
        alt: '평화로운 숲속 아침 풍경',
    },
    {
        id: 3,
        category: 'DAILY LIFE',
        title: '퇴근 길, 지친 마음을 위로하는 플레이리스트',
        imgUrl: 'https://images.unsplash.com/photo-1459749411177-042180ce673c?q=80&w=1200&auto=format&fit=crop',
        fallbackImg: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=800&auto=format&fit=crop',
        readTime: '5 min read',
        likes: 312,
        alt: '레코드 플레이어와 따뜻한 차 한잔',
    },
    {
        id: 4,
        category: 'RELATIONSHIP',
        title: "건강한 관계를 위한 '거절'의 기술",
        imgUrl: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?q=80&w=1200&auto=format&fit=crop',
        fallbackImg: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=800&auto=format&fit=crop',
        readTime: '12 min read',
        likes: 156,
        alt: '차분하게 대화하는 두 사람',
    },
];

// --- GuideCard 컴포넌트 ---
const GuideCard = ({ guide }) => (
    <div className="mwl-guide-card">
        <div className="mwl-guide-card__img-wrap">
            <img
                src={guide.imgUrl}
                className="mwl-guide-card__img"
                alt={guide.alt}
                onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = guide.fallbackImg;
                }}
            />
            <div className="mwl-guide-card__category-badge">{guide.category}</div>
        </div>
        <h4 className="mwl-guide-card__title">{guide.title}</h4>
        <div className="mwl-guide-card__meta">
            <span className="mwl-guide-card__meta-item">
                <Clock size={12} /> {guide.readTime}
            </span>
            <span className="mwl-guide-card__meta-item">
                <Heart size={12} className="mwl-guide-card__heart-icon" /> {guide.likes}
            </span>
        </div>
    </div>
);

// --- Home 컴포넌트 ---
const Home = ({ userName, setUserName, isLoggedIn, setIsLoggedIn }) => {
    const [activeTab, setActiveTab] = useState('home');
    return (
        <div className="mwl-root">
            <Header
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                userName={userName}
                setUserName={setUserName}
                isLoggedIn={isLoggedIn}
                setIsLoggedIn={setIsLoggedIn}
            />
            <main className="mwl-main">
                {/* Left Column */}
                <div className="mwl-col-left">
                    {/* Welcome Banner */}
                    <section className="mwl-banner">
                        <div className="mwl-banner__body">
                            <span className="mwl-banner__badge">EMOTION CARE</span>
                            <h2 className="mwl-banner__title">
                                {isLoggedIn && userName ? (
                                    <>
                                        {userName}님,
                                        <br />
                                    </>
                                ) : null}
                                지금 마음은 안녕한가요?
                            </h2>
                            <p className="mwl-banner__desc">
                                오늘의 감정을 기록하면 AI가 {isLoggedIn && userName ? `${userName}님의` : ''}마음 상태를
                                분석해
                                <br />
                                가장 따뜻한 처방을 내려드려요.
                            </p>
                            <button className="mwl-banner__cta">
                                <PenTool size={18} />
                                오늘의 마음 기록하기
                            </button>
                        </div>
                        <div className="mwl-banner__emoji-wrap">
                            <div className="mwl-banner__emoji-circle">😊</div>
                            <div className="mwl-banner__emoji-badge">✨</div>
                        </div>
                    </section>

                    {/* 마음 챙김 가이드 */}
                    <section className="mwl-guide-section">
                        <div className="mwl-guide-section__header">
                            <div>
                                <h3 className="mwl-guide-section__title">마음 챙김 가이드</h3>
                                <p className="mwl-guide-section__subtitle">
                                    {isLoggedIn && userName ? `${userName}님의` : ''} 최근 상담 주제와 관련된 추천
                                    콘텐츠입니다.
                                </p>
                            </div>
                            <button className="mwl-guide-section__more-btn">
                                전체보기 <ChevronRight size={14} />
                            </button>
                        </div>
                        <div className="mwl-guide-grid">
                            {MIND_GUIDES.map((guide) => (
                                <GuideCard key={guide.id} guide={guide} />
                            ))}
                        </div>
                    </section>

                    {/* Bottom Grid */}
                    <div className="mwl-bottom-grid">
                        {/* AI 맞춤 추천 */}
                        <div className="mwl-widget-card">
                            <div>
                                <div className="mwl-widget-card__icon-row">
                                    <div className="mwl-widget-card__icon-box mwl-widget-card__icon-box--green">
                                        <User size={16} className="mwl-widget-card__icon--green" />
                                    </div>
                                    <span className="mwl-widget-card__label">AI 맞춤 추천</span>
                                </div>
                                <p className="mwl-widget-card__desc">
                                    최근 일기 데이터를 통해
                                    <br />
                                    <span className="mwl-widget-card__counselor-name">박민우 상담사</span>님을 찾았어요.
                                </p>
                            </div>
                            <button className="mwl-widget-card__cta">
                                전문가 찾기 <ChevronRight size={14} />
                            </button>
                        </div>

                        {/* 오늘의 힐링 */}
                        <div className="mwl-widget-card">
                            <div>
                                <div className="mwl-widget-card__icon-row">
                                    <div className="mwl-widget-card__icon-box mwl-widget-card__icon-box--amber">
                                        <Coffee size={16} className="mwl-widget-card__icon--amber" />
                                    </div>
                                    <span className="mwl-widget-card__label">오늘의 힐링</span>
                                </div>
                                <div className="mwl-widget-card__healing-body">
                                    <div className="mwl-widget-card__healing-icon-box">
                                        <Coffee size={28} className="mwl-widget-card__healing-icon" />
                                    </div>
                                    <h4 className="mwl-widget-card__healing-title">카모마일 차 한 잔</h4>
                                    <p className="mwl-widget-card__healing-desc">
                                        긴장을 풀어주는 향긋한 차 한 잔 어때요?
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column */}
                <div className="mwl-col-right">
                    <div className="mwl-sidebar-header">
                        <h3 className="mwl-sidebar-header__title">
                            <Calendar size={18} /> 예약 현황
                        </h3>
                        <button className="mwl-sidebar-header__btn">전체보기</button>
                    </div>

                    {/* Primary Appointment */}
                    <div className={isLoggedIn ? 'mwl-appt-primary' : 'mwl-appt-primary--login-required'}>
                        {isLoggedIn ? (
                            <>
                                <div className="mwl-appt-primary__top-row">
                                    <div className="mwl-appt-primary__map-icon-box">
                                        <MapPin size={20} />
                                    </div>
                                    <span className="mwl-appt-primary__d-badge">D-2</span>
                                </div>
                                <p className="mwl-appt-primary__type">대면 심리 상담</p>
                                <h4 className="mwl-appt-primary__name">이은지 상담사님</h4>
                                <div className="mwl-appt-primary__datetime-box">
                                    <Calendar size={14} />
                                    5월 20일 (수) 오후 2:00
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="mwl-appt-primary__lock-icon">
                                    <Lock size={24} />
                                </div>
                                <span>
                                    상담 예약 및 관리 기능은
                                    <br />
                                    <strong>로그인 후</strong> 이용할 수 있습니다.
                                </span>
                            </>
                        )}
                    </div>

                    {/* Upcoming */}
                    {isLoggedIn && (
                        <div className="mwl-upcoming-list">
                            <h4 className="mwl-upcoming-list__label">다가오는 예약</h4>
                            <div className="mwl-appt-card">
                                <div className="mwl-appt-card__top">
                                    <div className="mwl-appt-card__info">
                                        <div className="mwl-appt-card__icon-box">
                                            <MapPin size={16} />
                                        </div>
                                        <div>
                                            <h5 className="mwl-appt-card__type">정기 대면 상담</h5>
                                            <p className="mwl-appt-card__counselor">김준서 상담사님</p>
                                        </div>
                                    </div>
                                    <ChevronRight size={16} className="mwl-appt-card__chevron" />
                                </div>
                                <div className="mwl-appt-card__datetime">
                                    <Calendar size={12} className="mwl-appt-card__cal-icon" />
                                    5월 27일 (수) 오후 4:00
                                </div>
                            </div>
                            <div className="mwl-appt-card mwl-appt-card--dimmed">
                                <div className="mwl-appt-card__top">
                                    <div className="mwl-appt-card__info">
                                        <div className="mwl-appt-card__icon-box">
                                            <MapPin size={16} />
                                        </div>
                                        <div>
                                            <h5 className="mwl-appt-card__type">심리 인지 검사</h5>
                                            <p className="mwl-appt-card__counselor">최유리 상담사님</p>
                                        </div>
                                    </div>
                                    <ChevronRight size={16} className="mwl-appt-card__chevron" />
                                </div>
                                <div className="mwl-appt-card__datetime">
                                    <Calendar size={12} className="mwl-appt-card__cal-icon" />
                                    6월 03일 (수) 오후 1:30
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>
            <Footer />
            <MobileTap />
        </div>
    );
};

export default Home;
