import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Header from '../components/header';
import Footer from '../components/footer';
import { Calendar, Clock, MapPin, Home, BookOpen, Heart, User, AlertCircle, ChevronRight, X } from 'lucide-react';
import '../static/Reservation.css';

export default function ReservationHistoryPage({ userName, setUserName, isLoggedIn, setIsLoggedIn }) {
    const navigate = useNavigate();
    useEffect(() => {
        const user = localStorage.getItem('user');
        if (user) {
            const userObj = JSON.parse(user);
            if (userObj.role === 'counselor') {
                // 상담사라면 상담사용 예약관리로 리다이렉트
                navigate('/CounselorPlanner', { replace: true });
            }
        }
    }, []);
    const [filter, setFilter] = useState('전체');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedId, setSelectedId] = useState(null);
    const [blockedMessage, setBlockedMessage] = useState('');

    // userName은 props로 전달됨 (App.jsx에서)

    const [historyData, setHistoryData] = useState([
        {
            id: 1,
            name: '이은지 상담사',
            date: '2026.05.20',
            time: '14:00',
            status: '예약 확정',
            location: '서울 강남구 테헤란로 센터',
        },
        {
            id: 2,
            name: '김태현 상담사',
            date: '2026.05.25',
            time: '11:00',
            status: '예약 대기',
            location: '서울 서초구 서초대로 점',
        },
        {
            id: 3,
            name: '이은지 상담사',
            date: '2026.04.10',
            time: '16:00',
            status: '상담 완료',
            location: '서울 강남구 테헤란로 센터',
        },
        {
            id: 4,
            name: '박소연 상담사',
            date: '2026.03.15',
            time: '15:00',
            status: '예약 취소',
            location: '서울 마포구 양화로 점',
        },
    ]);

    const filteredData = historyData.filter((item) => (filter === '전체' ? true : item.status === filter));

    // 예약일 2일 전 이내인지 확인하는 함수
    const isTooLateToCancelFn = (dateStr) => {
        // "2026.05.20" 형식을 파싱
        const parts = dateStr.split('.');
        const reservationDate = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const diffMs = reservationDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

        // 2일 이하로 남으면 취소 불가
        return diffDays <= 2;
    };

    const handleCancelClick = (id) => {
        const item = historyData.find((i) => i.id === id);
        if (!item) return;

        if (isTooLateToCancelFn(item.date)) {
            setBlockedMessage('예약일 2일 전에는 취소가 불가합니다.\n변경이 필요하시면 고객센터로 문의해 주세요.');
            setSelectedId(null);
            setIsModalOpen(true);
            return;
        }

        setBlockedMessage('');
        setSelectedId(id);
        setIsModalOpen(true);
    };

    const confirmCancel = () => {
        setHistoryData((prev) =>
            prev.map((item) => (item.id === selectedId ? { ...item, status: '예약 취소' } : item))
        );
        setIsModalOpen(false);
        setSelectedId(null);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedId(null);
        setBlockedMessage('');
    };

    return (
        <div className="res-history-page-root">
            <Header
                activeTab="reservation"
                setActiveTab={() => {}}
                userName={userName}
                setUserName={setUserName}
                isLoggedIn={isLoggedIn}
                setIsLoggedIn={setIsLoggedIn}
            />

            <main className="res-history-container">
                <div className="res-history-top-section">
                    <h2>예약 관리</h2>
                    <p className="res-sub-desc">
                        <strong>{userName}님,</strong> 상담사와 함께하는 일정을 관리하세요.
                    </p>
                </div>

                <nav className="res-history-tabs">
                    {['전체', '예약 대기', '예약 확정', '상담 완료', '예약 취소'].map((tab) => (
                        <button
                            key={tab}
                            className={`res-tab-btn-modern ${filter === tab ? 'active' : ''}`}
                            onClick={() => setFilter(tab)}
                        >
                            {tab}
                        </button>
                    ))}
                </nav>

                <div className="res-history-list">
                    {filteredData.map((item) => (
                        <div key={item.id} className="res-history-list-item">
                            <div className="res-item-main-info">
                                <div className="res-date-badge-column">
                                    <span className="res-date-display">{item.date}</span>
                                    <span className={`res-status-tag ${getStatusClass(item.status)}`}>
                                        {item.status}
                                    </span>
                                </div>
                                <div className="res-item-content-box">
                                    <h3 className="res-counselor-name">
                                        {item.name} <span className="res-type-tag">대면 상담</span>
                                    </h3>
                                    <div className="res-item-details">
                                        <span>
                                            <Clock size={16} /> {item.time}
                                        </span>
                                        <span className="res-divider">|</span>
                                        <span>
                                            <MapPin size={16} /> {item.location}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="res-item-actions">
                                {(item.status === '예약 대기' || item.status === '예약 확정') && (
                                    <button
                                        className="res-cancel-trigger-btn"
                                        onClick={() => handleCancelClick(item.id)}
                                    >
                                        취소하기
                                    </button>
                                )}
                                <ChevronRight size={24} className="res-arrow-icon" />
                            </div>
                        </div>
                    ))}
                </div>
            </main>

            {/* 취소 확인 / 취소 불가 팝업 — portal처럼 DOM 최상위에서 렌더링 */}
            {isModalOpen && (
                <div className="res-modal-overlay-modern" onClick={closeModal}>
                    <div className="res-modal-content-modern" onClick={(e) => e.stopPropagation()}>
                        <button className="res-modal-close-icon" onClick={closeModal}>
                            <X size={20} />
                        </button>

                        {blockedMessage ? (
                            /* ── 취소 불가 안내 모달 ── */
                            <>
                                <div className="res-modal-icon-wrapper res-modal-icon-wrapper--warn">
                                    <AlertCircle size={40} color="#F59E0B" strokeWidth={2.5} />
                                </div>
                                <h3 className="res-modal-title">취소가 불가합니다</h3>
                                <p className="res-modal-desc">{blockedMessage}</p>
                                <div className="res-modal-btns-modern">
                                    <button className="res-btn-confirm res-btn-confirm--single" onClick={closeModal}>
                                        확인
                                    </button>
                                </div>
                            </>
                        ) : (
                            /* ── 취소 확인 모달 ── */
                            <>
                                <div className="res-modal-icon-wrapper">
                                    <AlertCircle size={40} color="#FDA4AF" strokeWidth={2.5} />
                                </div>
                                <h3 className="res-modal-title">예약을 취소하시겠습니까?</h3>
                                <p className="res-modal-desc">취소하시면 해당 시간의 상담은 자동으로 사라집니다.</p>
                                <div className="res-modal-btns-modern">
                                    <button className="res-btn-confirm" onClick={confirmCancel}>
                                        네, 취소합니다
                                    </button>
                                    <button className="res-btn-back" onClick={closeModal}>
                                        아니오
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}

            <nav className="res-mobile-bottom-nav">
                <Link to="/" className="res-nav-item">
                    <Home size={24} />
                    <span>홈</span>
                </Link>
                <Link to="/reservation" className="res-nav-item active">
                    <Calendar size={24} />
                    <span>예약 관리</span>
                </Link>
                <Link to="/ai-diary" className="res-nav-item">
                    <BookOpen size={24} />
                    <span>AI 일기</span>
                </Link>
                <Link to="/healing" className="res-nav-item">
                    <Heart size={24} />
                    <span>힐링 라운지</span>
                </Link>
                <Link to="/mypage" className="res-nav-item">
                    <User size={24} />
                    <span>마이페이지</span>
                </Link>
            </nav>
            <Footer />
        </div>
    );
}

const getStatusClass = (status) => {
    if (status === '예약 확정') return 'confirmed';
    if (status === '예약 대기') return 'pending';
    if (status === '상담 완료') return 'completed';
    return 'cancelled';
};
