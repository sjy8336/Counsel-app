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
export default function HomePage({ nickname }) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('home');

    const toggleMenu = () => setIsMenuOpen((prev) => !prev);

    return (
        <div className="mwh-root">
            {/* PC Header (hidden on mobile) */}
            <Header activeTab={activeTab} setActiveTab={setActiveTab} />

            {/* ── Main Content ── */}
            <main className="mwh-main">
                <div className="mwh-content-grid">
                    {/* Left Column */}
                    <div className="mwh-left-col">
                        {/* Welcome Banner */}
                        <div className="mwh-banner">
                            <div className="mwh-banner-content">
                                <span className="mwh-banner-tag">EMOTION CARE</span>
                                <h1 className="mwh-banner-title">
                                    {nickname ? `${nickname}님,` : '내담자님,'}
                                    <br />
                                    지금 마음은 안녕한가요?
                                </h1>
                                <p className="mwh-banner-desc">
                                    오늘의 감정을 기록하면 AI가 {nickname ? `${nickname}님의` : '내담자님의'} 마음 상태를 분석해 가장 따뜻한 처방을
                                    내려드려요.
                                </p>
                                <button className="mwh-banner-btn">
                                    <Activity size={18} />
                                    오늘의 마음 기록하기
                                </button>
                            </div>

                            {/* Emoji Decoration */}
                            <div className="mwh-banner-emoji">
                                <span>😊</span>
                            </div>

                            {/* Background Decorations */}
                            <div className="mwh-banner-deco-1" />
                            <div className="mwh-banner-deco-2" />
                        </div>

                        {/* Recent Test Results */}
                        <div className="mwh-test-card">
                            <div className="mwh-test-card-header">
                                <div className="mwh-test-card-title-row">
                                    <ShieldCheck size={20} />
                                    <h2 className="mwh-test-card-title">최근 자가진단 결과</h2>
                                </div>
                                <span className="mwh-test-date-badge">5월 14일 검사</span>
                            </div>

                            <div className="mwh-test-list">
                                {TEST_RESULTS.map((result) => (
                                    <div key={result.id}>
                                        <div className="mwh-test-item-label-row">
                                            <span className="mwh-test-item-name">{result.label}</span>
                                            <span className="mwh-test-item-status" style={{ color: result.color }}>
                                                {result.status}
                                            </span>
                                        </div>
                                        <div className="mwh-progress-track">
                                            <div
                                                className="mwh-progress-fill"
                                                style={{ width: result.value, backgroundColor: result.color }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mwh-test-footer">
                                <CheckCircle2 size={18} />
                                <p className="mwh-test-footer-text">
                                    전반적으로 안정적인 상태를 유지하고 계시네요. 약간의 우울감이 감지되었으나, 다가오는
                                    상담 세션에서 코치님과 함께 이야기 나누어 보시면 좋겠습니다.
                                </p>
                            </div>
                        </div>

                        {/* Bottom 2-col Widgets */}
                        <div className="mwh-widget-row">
                            {/* AI Recommendation */}
                            <div className="mwh-ai-widget">
                                <div>
                                    <div className="mwh-widget-title-row">
                                        <Activity size={18} />
                                        <h3 className="mwh-widget-title">AI 맞춤 추천</h3>
                                    </div>
                                    <p className="mwh-ai-desc">
                                        최근 일기 데이터를 통해
                                        <br />
                                        <strong>박민우 상담사</strong>님을 찾았어요.
                                    </p>
                                </div>
                                <button className="mwh-ai-btn">
                                    전문가 찾기 <ChevronRight size={16} />
                                </button>
                            </div>

                            {/* Today's Healing */}
                            <div className="mwh-healing-widget">
                                <div className="mwh-healing-title-row">
                                    <Coffee size={18} />
                                    <h3 className="mwh-widget-title">오늘의 힐링</h3>
                                </div>
                                <div className="mwh-healing-icon-box">
                                    <Coffee size={24} />
                                </div>
                                <p className="mwh-healing-name">카모마일 차 한 잔</p>
                                <p className="mwh-healing-desc">긴장을 풀어주는 향긋한 차 한 잔 어때요?</p>
                            </div>
                        </div>
                    </div>

                    {/* Right Column (Schedule) */}
                    <div className="mwh-right-col">
                        <div className="mwh-schedule-header">
                            <div className="mwh-schedule-title-row">
                                <Calendar size={18} />
                                <h2 className="mwh-schedule-title">예약 현황</h2>
                            </div>
                            <a href="#" className="mwh-schedule-more">
                                전체보기
                            </a>
                        </div>

                        {UPCOMING_RESERVATIONS.map((res, index) =>
                            index === 0 ? (
                                // Primary Reservation Card
                                <div key={res.id} className="mwh-res-primary">
                                    <div className="mwh-res-primary-top">
                                        <div className="mwh-res-primary-icon">
                                            <Users size={18} />
                                        </div>
                                        <span className="mwh-d-day-badge">{res.dDay}</span>
                                    </div>
                                    <div className="mwh-res-primary-body">
                                        <div className="mwh-res-type">{res.type}</div>
                                        <p className="mwh-res-doctor">{res.doctor}</p>
                                    </div>
                                    <div className="mwh-res-date-box">
                                        <Calendar size={14} />
                                        <span>{res.date}</span>
                                    </div>
                                </div>
                            ) : (
                                // Small Reservation Card
                                <div key={res.id} className="mwh-res-small">
                                    <div className="mwh-res-small-left">
                                        <div className="mwh-res-small-icon-box">
                                            <Users size={16} className="mwh-res-small-icon" />
                                        </div>
                                        <div>
                                            <div className="mwh-res-small-tag">{res.tag}</div>
                                            <div className="mwh-res-small-type">{res.type}</div>
                                            <div className="mwh-res-small-date">{res.date}</div>
                                        </div>
                                    </div>
                                    <ChevronRight size={16} className="mwh-res-small-arrow" />
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
