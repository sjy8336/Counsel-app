import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Header from '../components/header';
import Footer from '../components/footer';
import { Calendar, Clock, MapPin, Home, BookOpen, Heart, User, AlertCircle, ChevronRight, X } from 'lucide-react';
import '../static/Reservation.css';

export default function ReservationHistoryPage() {
    const [filter, setFilter] = useState('전체');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedId, setSelectedId] = useState(null);
    const [blockedMessage, setBlockedMessage] = useState('');

    // 나중에 실제 로그인 정보를 가져와서 이 변수에 할당하면 자동으로 이름이 바뀝니다.
    const userName = "소현";

    const [historyData, setHistoryData] = useState([
        { id: 1, name: "이은지 상담사", date: "2026.05.20", time: "14:00", status: "예약 확정", location: "서울 강남구 테헤란로 센터" },
        { id: 2, name: "김태현 상담사", date: "2026.05.25", time: "11:00", status: "예약 대기", location: "서울 서초구 서초대로 점" },
        { id: 3, name: "이은지 상담사", date: "2026.04.10", time: "16:00", status: "상담 완료", location: "서울 강남구 테헤란로 센터" },
        { id: 4, name: "박소연 상담사", date: "2026.03.15", time: "15:00", status: "예약 취소", location: "서울 마포구 양화로 점" },
    ]);

    const filteredData = historyData.filter(item => filter === '전체' ? true : item.status === filter);

    // 예약일 2일 전 이내인지 확인하는 함수
    const isTooLateToCancelFn = (dateStr) => {
        // "2026.05.20" 형식을 파싱
        const parts = dateStr.split('.');
        const reservationDate = new Date(
            parseInt(parts[0]),
            parseInt(parts[1]) - 1,
            parseInt(parts[2])
        );
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const diffMs = reservationDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

        // 2일 이하로 남으면 취소 불가
        return diffDays <= 2;
    };

    const handleCancelClick = (id) => {
        const item = historyData.find(i => i.id === id);
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
        setHistoryData(prev => prev.map(item =>
            item.id === selectedId ? { ...item, status: '예약 취소' } : item
        ));
        setIsModalOpen(false);
        setSelectedId(null);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedId(null);
        setBlockedMessage('');
    };

    return (
        <div className="history-page-root">
            <Header activeTab="reservation" setActiveTab={() => {}} />

            <main className="history-container">
                <div className="history-top-section">
                    <h2>예약 관리</h2>
                    <p className="sub-desc"><strong>{userName}님,</strong> 상담사와 함께하는 일정을 관리하세요.</p>
                </div>

                <nav className="history-tabs">
                    {['전체', '예약 대기', '예약 확정', '상담 완료', '예약 취소'].map(tab => (
                        <button
                            key={tab}
                            className={`tab-btn-modern ${filter === tab ? 'active' : ''}`}
                            onClick={() => setFilter(tab)}
                        >
                            {tab}
                        </button>
                    ))}
                </nav>

                <div className="history-list">
                    {filteredData.map(item => (
                        <div key={item.id} className="history-list-item">
                            <div className="item-main-info">
                                <div className="date-badge-column">
                                    <span className="date-display">{item.date}</span>
                                    <span className={`status-tag ${getStatusClass(item.status)}`}>{item.status}</span>
                                </div>
                                <div className="item-content-box">
                                    <h3 className="counselor-name">{item.name} <span className="type-tag">대면 상담</span></h3>
                                    <div className="item-details">
                                        <span><Clock size={16}/> {item.time}</span>
                                        <span className="divider">|</span>
                                        <span><MapPin size={16}/> {item.location}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="item-actions">
                                {(item.status === '예약 대기' || item.status === '예약 확정') && (
                                    <button
                                        className="cancel-trigger-btn"
                                        onClick={() => handleCancelClick(item.id)}
                                    >
                                        취소하기
                                    </button>
                                )}
                                <ChevronRight size={24} className="arrow-icon" />
                            </div>
                        </div>
                    ))}
                </div>
            </main>

            {/* 취소 확인 / 취소 불가 팝업 — portal처럼 DOM 최상위에서 렌더링 */}
            {isModalOpen && (
                <div className="modal-overlay-modern" onClick={closeModal}>
                    <div className="modal-content-modern" onClick={e => e.stopPropagation()}>
                        <button className="modal-close-icon" onClick={closeModal}>
                            <X size={20}/>
                        </button>

                        {blockedMessage ? (
                            /* ── 취소 불가 안내 모달 ── */
                            <>
                                <div className="modal-icon-wrapper modal-icon-wrapper--warn">
                                    <AlertCircle size={40} color="#F59E0B" strokeWidth={2.5}/>
                                </div>
                                <h3 className="modal-title">취소가 불가합니다</h3>
                                <p className="modal-desc">{blockedMessage}</p>
                                <div className="modal-btns-modern">
                                    <button className="btn-confirm btn-confirm--single" onClick={closeModal}>확인</button>
                                </div>
                            </>
                        ) : (
                            /* ── 취소 확인 모달 ── */
                            <>
                                <div className="modal-icon-wrapper">
                                    <AlertCircle size={40} color="#FDA4AF" strokeWidth={2.5}/>
                                </div>
                                <h3 className="modal-title">예약을 취소하시겠습니까?</h3>
                                <p className="modal-desc">취소하시면 해당 시간의 상담은 자동으로 사라집니다.</p>
                                <div className="modal-btns-modern">
                                    <button className="btn-confirm" onClick={confirmCancel}>네, 취소합니다</button>
                                    <button className="btn-back" onClick={closeModal}>아니오</button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}

            <nav className="mobile-bottom-nav">
                <Link to="/" className="nav-item"><Home size={24}/><span>홈</span></Link>
                <Link to="/reservation" className="nav-item active"><Calendar size={24}/><span>예약 관리</span></Link>
                <Link to="/ai-diary" className="nav-item"><BookOpen size={24}/><span>AI 일기</span></Link>
                <Link to="/healing" className="nav-item"><Heart size={24}/><span>힐링 라운지</span></Link>
                <Link to="/mypage" className="nav-item"><User size={24}/><span>마이페이지</span></Link>
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