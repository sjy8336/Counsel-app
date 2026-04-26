import React, { useState } from 'react';
import {
    Bell,
    ChevronRight,
    Calendar,
    Coffee,
    Users,
    Activity,
    ShieldCheck,
    CheckCircle2,
    Menu,
    X,
} from 'lucide-react';
import Header from '../components/header';
import Footer from '../components/footer';
import MobileTap from '../components/mobileTap';
import '../static/home.css';

// --- Constants & Mock Data ---
const USER_NAME = '먹보';

const NAVIGATION_LINKS = [
    { label: '전문가 찾기', href: '#' },
    { label: '예약 관리', href: '#' },
    { label: 'AI 일기', href: '#' },
    { label: '힐링 라운지', href: '#' },
];

const TEST_RESULTS = [
    { id: 'stress', label: '스트레스 지수', status: '양호', value: '30%', color: '#8BA888' },
    { id: 'depression', label: '우울 지수', status: '주의', value: '65%', color: '#F59E0B' },
    { id: 'anxiety', label: '불안 지수', status: '안정', value: '20%', color: '#8BA888' },
];

const UPCOMING_RESERVATIONS = [
    { id: 1, type: '심리 상담', doctor: '이은지 상담사', date: '5월 20일 (수) 오후 2:00', dDay: 'D-2' },
    { id: 2, type: '심리 상담', doctor: '박민우 상담사', date: '5월 27일 (수) 오후 3:00', tag: 'NEXT WEEK' },
    { id: 3, type: '심리 상담', doctor: '김지현 상담사', date: '6월 3일 (수) 오후 2:00', tag: 'NEXT MONTH' },
];

// --- Main Component ---
export default function HomePage() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('home');

    const toggleMenu = () => setIsMenuOpen((prev) => !prev);

    return (
        <div className="mw-root">
            {/* PC Header (hidden on mobile) */}
            <Header activeTab={activeTab} setActiveTab={setActiveTab} />

            {/* ── Main Content ── */}
            <main className="mw-main">
                <div className="mw-content-grid">
                    {/* Left Column */}
                    <div className="mw-left-col">
                        {/* Welcome Banner */}
                        <div className="mw-banner">
                            <div className="mw-banner-content">
                                <span className="mw-banner-tag">EMOTION CARE</span>
                                <h1 className="mw-banner-title">
                                    {USER_NAME}님,
                                    <br />
                                    지금 마음은 <span className="mw-banner-title-sub">안녕</span>한가요?
                                </h1>
                                <p className="mw-banner-desc">
                                    오늘의 감정을 기록하면 AI가 {USER_NAME}님의 마음 상태를 분석해 가장 따뜻한 처방을
                                    내려드려요.
                                </p>
                                <button className="mw-banner-btn">
                                    <Activity size={18} />
                                    오늘의 마음 기록하기
                                </button>
                            </div>

                            {/* Emoji Decoration */}
                            <div className="mw-banner-emoji">
                                <span>😊</span>
                            </div>

                            {/* Background Decorations */}
                            <div className="mw-banner-deco-1" />
                            <div className="mw-banner-deco-2" />
                        </div>

                        {/* Recent Test Results */}
                        <div className="mw-test-card">
                            <div className="mw-test-card-header">
                                <div className="mw-test-card-title-row">
                                    <ShieldCheck size={20} />
                                    <h2 className="mw-test-card-title">최근 자가진단 결과</h2>
                                </div>
                                <span className="mw-test-date-badge">5월 14일 검사</span>
                            </div>

                            <div className="mw-test-list">
                                {TEST_RESULTS.map((result) => (
                                    <div key={result.id}>
                                        <div className="mw-test-item-label-row">
                                            <span className="mw-test-item-name">{result.label}</span>
                                            <span className="mw-test-item-status" style={{ color: result.color }}>
                                                {result.status}
                                            </span>
                                        </div>
                                        <div className="mw-progress-track">
                                            <div
                                                className="mw-progress-fill"
                                                style={{ width: result.value, backgroundColor: result.color }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mw-test-footer">
                                <CheckCircle2 size={18} />
                                <p className="mw-test-footer-text">
                                    전반적으로 안정적인 상태를 유지하고 계시네요. 약간의 우울감이 감지되었으나, 다가오는
                                    상담 세션에서 코치님과 함께 이야기 나누어 보시면 좋겠습니다.
                                </p>
                            </div>
                        </div>

                        {/* Bottom 2-col Widgets */}
                        <div className="mw-widget-row">
                            {/* AI Recommendation */}
                            <div className="mw-ai-widget">
                                <div>
                                    <div className="mw-widget-title-row">
                                        <Activity size={18} />
                                        <h3 className="mw-widget-title">AI 맞춤 추천</h3>
                                    </div>
                                    <p className="mw-ai-desc">
                                        최근 일기 데이터를 통해
                                        <br />
                                        <strong>박민우 상담사</strong>님을 찾았어요.
                                    </p>
                                </div>
                                <button className="mw-ai-btn">
                                    전문가 찾기 <ChevronRight size={16} />
                                </button>
                            </div>

                            {/* Today's Healing */}
                            <div className="mw-healing-widget">
                                <div className="mw-healing-title-row">
                                    <Coffee size={18} />
                                    <h3 className="mw-widget-title">오늘의 힐링</h3>
                                </div>
                                <div className="mw-healing-icon-box">
                                    <Coffee size={24} />
                                </div>
                                <p className="mw-healing-name">카모마일 차 한 잔</p>
                                <p className="mw-healing-desc">긴장을 풀어주는 향긋한 차 한 잔 어때요?</p>
                            </div>
                        </div>
                    </div>

                    {/* Right Column (Schedule) */}
                    <div className="mw-right-col">
                        <div className="mw-schedule-header">
                            <div className="mw-schedule-title-row">
                                <Calendar size={18} />
                                <h2 className="mw-schedule-title">예약 현황</h2>
                            </div>
                            <a href="#" className="mw-schedule-more">
                                전체보기
                            </a>
                        </div>

                        {UPCOMING_RESERVATIONS.map((res, index) =>
                            index === 0 ? (
                                // Primary Reservation Card
                                <div key={res.id} className="mw-res-primary">
                                    <div className="mw-res-primary-top">
                                        <div className="mw-res-primary-icon">
                                            <Users size={18} />
                                        </div>
                                        <span className="mw-d-day-badge">{res.dDay}</span>
                                    </div>
                                    <div className="mw-res-primary-body">
                                        <div className="mw-res-type">{res.type}</div>
                                        <p className="mw-res-doctor">{res.doctor}</p>
                                    </div>
                                    <div className="mw-res-date-box">
                                        <Calendar size={14} />
                                        <span>{res.date}</span>
                                    </div>
                                </div>
                            ) : (
                                // Small Reservation Card
                                <div key={res.id} className="mw-res-small">
                                    <div className="mw-res-small-left">
                                        <div className="mw-res-small-icon-box">
                                            <Users size={16} className="mw-res-small-icon" />
                                        </div>
                                        <div>
                                            <div className="mw-res-small-tag">{res.tag}</div>
                                            <div className="mw-res-small-type">{res.type}</div>
                                            <div className="mw-res-small-date">{res.date}</div>
                                        </div>
                                    </div>
                                    <ChevronRight size={16} className="mw-res-small-arrow" />
                                </div>
                            )
                        )}
                    </div>
                </div>
            </main>

            {/* Footer (always visible, PC/Mobile 모두) */}
            <Footer />
            {/* MobileTap 하단 고정 */}
            <MobileTap activeTab={activeTab} setActiveTab={setActiveTab} className="mobile-tap-fixed" />
        </div>
    );
}
