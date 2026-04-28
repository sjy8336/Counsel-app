import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/header.jsx';
import Footer from '../components/footer.jsx';
import '../static/CounselorHome.css';

const CounselorHome = () => {
    const navigate = useNavigate();

    const todaySessions = [
        { time: '13:00', name: '이은지', room: '제1상담실 (대면)' },
        { time: '15:00', name: '박지연', room: '제2상담실 (대면)' },
        { time: '17:00', name: '정민우', room: '온라인 화상' },
    ];

    const [reservations, setReservations] = useState([
        { id: 1, name: '최민수', type: '심리 상담', date: '5월 27일 (화) 오후 2:00', dday: 2,  status: '확정' },
        { id: 2, name: '김지아', type: '심리 상담', date: '6월 3일 (화) 오후 3:00',  dday: 9,  status: '대기' },
        { id: 3, name: '이하늘', type: '초기 면담', date: '6월 10일 (화) 오전 11:00', dday: 16, status: '대기' },
    ]);

    const [toast, setToast] = useState(null); // { message, type }

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const handleConfirm = (id, name) => {
        setReservations(prev =>
            prev.map(r => r.id === id ? { ...r, status: '확정' } : r)
        );
        showToast(`${name} 내담자 예약이 승인되었습니다.`, 'success');
    };

    const handleReject = (id, name) => {
        // 거절 로직은 추후 결정 후 구현 예정
        showToast(`${name} 내담자 예약이 거절되었습니다.`, 'error');
        setReservations(prev => prev.filter(r => r.id !== id));
    };
    const getToday = () => {
    const now = new Date();
    const days = ['일', '월', '화', '수', '목', '금', '토'];
    return `${now.getFullYear()}년 ${now.getMonth() + 1}월 ${now.getDate()}일 ${days[now.getDay()]}요일`;
};

    return (
        <div className="counselor-main">
            <Header activeTab="" setActiveTab={() => {}} />
            <div className="counselor-container">

                {/* 배너 */}
                <section className="banner-card">
                    <div className="banner-text">
                        <p className="banner-date">{getToday()}</p>
                        <h1>두부님, 오늘 상담은 <span className="point-color">총 3건</span>입니다.</h1>
                        <p className="banner-sub">오늘도 내담자들의 마음을 따뜻하게 안아주세요.</p>
                    </div>
                </section>

                {/* 통계 */}
                <div className="stats-container">
                    <div className="stat-card">
                        <span className="stat-label">이번 달 상담</span>
                        <strong>24<em>건</em></strong>
                        <p className="stat-note">지난달보다 <b>+3건</b> 많아요</p>
                    </div>
                    <div className="stat-card">
                        <span className="stat-label">이번 주 예정</span>
                        <strong>8<em>건</em></strong>
                        <p className="stat-note">내일 <b>2건</b> 포함</p>
                    </div>
                    <div className="stat-card accent-rose">
                        <span className="stat-label">미답변 문의</span>
                        <strong>3<em>건</em></strong>
                        <p className="stat-note">확인이 필요해요</p>
                    </div>
                </div>

                <div className="main-content">
                    <div className="left-section">

                        {/* 오늘 상담 요약 */}
                        <section className="content-box">
                            <h3 className="section-title">오늘의 상담 요약</h3>
                            <div className="list-wrapper">
                                {todaySessions.map((s, i) => (
                                    <div className="list-item" key={i}>
                                        <div className="item-info">
                                            <span className="time">{s.time}</span>
                                            <strong>{s.name} 내담자</strong>
                                            <span className="desc">{s.room}</span>
                                        </div>
                                        <button className="action-btn" onClick={() => navigate('/CounselorClient')}>
                                            일지 작성
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* 업무 현황 */}
                        <div className="work-status-grid">
                            <div className="work-card highlight">
                                <div className="card-header">작성 대기 중인 상담 일지</div>
                                <div className="card-body">
                                    <strong>1<span>건</span></strong>
                                    <p>최민수 님 (5.19 상담)</p>
                                    <button className="go-btn primary" onClick={() => navigate('/counselor/client')}>
                                        지금 작성하기
                                    </button>
                                </div>
                            </div>
                            <div className="work-card">
                                <div className="card-header">신규 매칭 내담자</div>
                                <div className="card-body">
                                    <strong>2<span>명</span></strong>
                                    <p>사전 질문지가 도착했습니다.</p>
                                    <button className="go-btn secondary">설문지 확인하기</button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 우측 — 다가오는 예약 */}
                    <aside className="side-content">
                        <div className="side-header">
                            <h3>다가오는 예약</h3>
                            <button className="side-more">전체보기</button>
                        </div>

                        {reservations.map((r, i) => (
                            <div className={`reservation-card ${i === 0 ? 'is-next' : ''}`} key={r.id}>
                                {i === 0 && <span className="next-badge">NEXT</span>}
                                <div className="res-top">
                                    <div className="res-avatar">{r.name[0]}</div>
                                    <div className="res-info">
                                        <strong>{r.name} 내담자</strong>
                                        <span>{r.type}</span>
                                    </div>
                                    <span className={`dday-badge ${r.status === '대기' ? 'dday-wait' : ''}`}>
                                        D-{r.dday}
                                    </span>
                                </div>
                                <p className="res-date">📅 {r.date}</p>
                                {r.status === '대기' && (
                                    <div className="res-actions">
                                        <button className="res-btn confirm" onClick={() => handleConfirm(r.id, r.name)}>승인</button>
                                        <button className="res-btn reject"  onClick={() => handleReject(r.id, r.name)}>거절</button>
                                    </div>
                                )}
                                {r.status === '확정' && i !== 0 && (
                                    <p className="res-confirmed">✓ 승인 완료</p>
                                )}
                            </div>
                        ))}
                    </aside>
                </div>
            </div>

            {/* 토스트 팝업 */}
            {toast && (
                <div className={`toast toast-${toast.type}`}>
                    <span className="toast-icon">{toast.type === 'success' ? '✓' : '✕'}</span>
                    {toast.message}
                </div>
            )}

            <Footer />
        </div>
    );
};

export default CounselorHome;