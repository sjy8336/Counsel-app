import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/header.jsx';
import Footer from '../components/footer.jsx';
import MobileTap from '../components/mobileTap.jsx';
import '../static/CounselorHome.css';

import { getCounselorBookings } from '../api/bookingCounselor';
import { confirmBooking } from '../api/bookingConfirm';
import { rejectBooking } from '../api/bookingReject';

const CounselorHome = () => {
    const navigate = useNavigate();

    const getCounselorName = () => {
        const u = JSON.parse(localStorage.getItem('user'));
        return u?.full_name || u?.name || u?.username || (typeof u === 'string' ? u : '상담사');
    };

    const userName = getCounselorName();
    const [headerUserName, setHeaderUserName] = useState(userName);
    const [isLoggedIn, setIsLoggedIn] = useState(!!userName);
    const [reservations, setReservations] = useState([]);
    const [toast, setToast] = useState(null);
    // 문의 상태 및 미답변 문의 계산
    const [inquiries, setInquiries] = useState([]);
    const unreadInquiries = inquiries.filter((i) => i.status === 'pending');

    useEffect(() => {
        // 실제 문의 데이터 fetch 함수로 교체 필요
        // 예: getCounselorInquiries().then(setInquiries);
        setInquiries([]); // 문의 데이터가 없으면 빈 배열
    }, []);

    const getToday = () => {
        const now = new Date();
        const days = ['일', '월', '화', '수', '목', '금', '토'];
        return `${now.getFullYear()}년 ${now.getMonth() + 1}월 ${now.getDate()}일 ${days[now.getDay()]}요일`;
    };

    // 오늘 날짜(yyyy-mm-dd)
    const todayStr = (() => {
        const now = new Date();
        const mm = String(now.getMonth() + 1).padStart(2, '0');
        const dd = String(now.getDate()).padStart(2, '0');
        return `${now.getFullYear()}-${mm}-${dd}`;
    })();

    // 오늘 확정된 상담 건수(내담자 신청+상담사 등록 모두 포함)
    const todaySessions = reservations.filter(
        (r) => r.status.includes('확정') && r.dateObj && r.dateObj.toISOString().slice(0, 10) === todayStr
    );

    // 예약 데이터 변환 함수
    const mapReservations = (data) => {
        const today = new Date();
        return (data || []).map((r) => {
            const dateObj = new Date(r.date);
            const dday = Math.ceil((dateObj - today) / (1000 * 60 * 60 * 24));
            const days = ['일', '월', '화', '수', '목', '금', '토'];
            // 예약 객체에서 프로필 이미지 우선순위: r.profile_img_url → r.client_profile_img_url → ''
            const profile_img_url = r.profile_img_url || r.client_profile_img_url || '';
            return {
                id: r.id,
                order_id: r.order_id,
                name: r.client_name,
                type: r.survey_content?.type || '상담',
                date: `${dateObj.getMonth() + 1}월 ${dateObj.getDate()}일 (${days[dateObj.getDay()]}) ${r.time}`,
                dateObj,
                dday,
                status: r.status,
                profile_img_url,
            };
        });
    };

    const fetchReservations = async () => {
        try {
            const data = await getCounselorBookings();
            setReservations(mapReservations(data));
        } catch {
            setReservations([]);
        }
    };

    useEffect(() => {
        fetchReservations();
    }, []);

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const handleConfirm = async (order_id, name) => {
        try {
            await confirmBooking(order_id);
            showToast(`${name} 내담자 예약이 승인되었습니다.`, 'success');
            fetchReservations();
        } catch {
            showToast('예약 승인에 실패했습니다.', 'error');
        }
    };

    const handleReject = async (id, name, order_id) => {
        try {
            await rejectBooking(order_id);
            showToast(`${name} 내담자 예약이 거절되었습니다.`, 'error');
            fetchReservations();
        } catch {
            showToast('예약 거절에 실패했습니다.', 'error');
        }
    };

    // ── 예약 분리 로직 ─────────────────────────────────────
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 확정된 예약 중 오늘 이후 가장 가까운 1개
    const nextConfirmed =
        reservations
            .filter((r) => r.status.includes('확정') && r.dateObj >= today)
            .sort((a, b) => a.dateObj - b.dateObj)[0] || null;

    // 대기 중인 예약 전체
    const pendingList = reservations.filter((r) => r.status.includes('대기'));

    // 이번 달, 지난달 확정 상담 건수 계산
    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();
    const lastMonth = thisMonth === 0 ? 11 : thisMonth - 1;
    const lastMonthYear = thisMonth === 0 ? thisYear - 1 : thisYear;

    const monthCount = (year, month) =>
        reservations.filter(
            (r) =>
                r.status.includes('확정') &&
                r.dateObj &&
                r.dateObj.getFullYear() === year &&
                r.dateObj.getMonth() === month
        ).length;

    const thisMonthCount = monthCount(thisYear, thisMonth);
    const lastMonthCount = monthCount(lastMonthYear, lastMonth);
    const diffCount = thisMonthCount - lastMonthCount;

    // 이번 주(월~일) 확정 상담 건수, 내일 확정 상담 건수 계산
    const getWeekRange = (date) => {
        const day = date.getDay(); // 0(일)~6(토)
        const monday = new Date(date);
        monday.setDate(date.getDate() - ((day + 6) % 7)); // 월요일
        const sunday = new Date(monday);
        sunday.setDate(monday.getDate() + 6); // 일요일
        return [monday, sunday];
    };
    const nowDate = new Date();
    const [weekStart, weekEnd] = getWeekRange(nowDate);
    weekStart.setHours(0, 0, 0, 0);
    weekEnd.setHours(23, 59, 59, 999);

    const weekCount = reservations.filter(
        (r) => r.status.includes('확정') && r.dateObj && r.dateObj >= weekStart && r.dateObj <= weekEnd
    ).length;

    const tomorrow = new Date(nowDate);
    tomorrow.setDate(nowDate.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    const tomorrowStr = tomorrow.toISOString().slice(0, 10);
    const tomorrowCount = reservations.filter(
        (r) => r.status.includes('확정') && r.dateObj && r.dateObj.toISOString().slice(0, 10) === tomorrowStr
    ).length;

    return (
        <div className="counselor-main">
            <Header
                activeTab=""
                setActiveTab={() => {}}
                userName={headerUserName}
                setUserName={setHeaderUserName}
                isLoggedIn={isLoggedIn}
                setIsLoggedIn={setIsLoggedIn}
            />
            <div className="counselor-container">
                <section className="banner-card">
                    <div className="banner-text">
                        <p className="banner-date">{getToday()}</p>
                        <h1 style={{ wordBreak: 'keep-all', lineHeight: '1.4' }}>
                            {userName}님, 오늘 상담은 <span className="point-color">총 {todaySessions.length}건</span>
                            입니다.
                        </h1>
                        <p className="banner-sub">오늘도 내담자들의 마음을 따뜻하게 안아주세요.</p>
                    </div>
                </section>

                <div className="stats-container">
                    <div className="stat-card">
                        <span className="stat-label">이번 달 상담</span>
                        <strong>
                            {thisMonthCount}
                            <em>건</em>
                        </strong>
                        <p className="stat-note">
                            지난달보다 <b>{diffCount >= 0 ? `+${diffCount}` : diffCount}건</b>{' '}
                            {diffCount >= 0 ? '많아요' : '적어요'}
                        </p>
                    </div>
                    <div className="stat-card">
                        <span className="stat-label">이번 주 예정</span>
                        <strong>
                            {weekCount}
                            <em>건</em>
                        </strong>
                        <p className="stat-note">
                            내일 <b>{tomorrowCount}건</b> 포함
                        </p>
                    </div>
                    <div className="stat-card accent-rose clickable" onClick={() => navigate('/CounselorMessages')}>
                        <span className="stat-label">미답변 문의</span>
                        <strong>
                            {unreadInquiries.length}
                            <em>건</em>
                        </strong>
                        <p className="stat-note">확인이 필요해요 →</p>
                    </div>
                </div>

                <div className="main-content">
                    <div className="left-section">
                        <section className="content-box">
                            <h3 className="section-title">오늘의 상담 요약</h3>
                            <div className="list-wrapper">
                                {todaySessions.length === 0 ? (
                                    <div
                                        style={{
                                            padding: '32px 0',
                                            textAlign: 'center',
                                            color: '#888',
                                            fontSize: '1.05rem',
                                        }}
                                    >
                                        오늘 예정된 상담이 없습니다.
                                        <br />
                                        편안한 하루 보내세요!
                                    </div>
                                ) : (
                                    todaySessions.map((s, i) => (
                                        <div
                                            key={i}
                                            className="list-item"
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                                gap: '12px',
                                                padding: '12px 16px',
                                                marginBottom: '10px',
                                            }}
                                        >
                                            <div
                                                className="item-info"
                                                style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}
                                            >
                                                <span className="time" style={{ minWidth: '45px', fontWeight: 'bold' }}>
                                                    {s.time}
                                                </span>
                                                <div
                                                    style={{
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        overflow: 'hidden',
                                                    }}
                                                >
                                                    <strong style={{ fontSize: '1rem', whiteSpace: 'nowrap' }}>
                                                        {s.name} 내담자
                                                    </strong>
                                                    <span
                                                        className="desc"
                                                        style={{
                                                            fontSize: '0.85rem',
                                                            color: '#666',
                                                            whiteSpace: 'nowrap',
                                                        }}
                                                    >
                                                        {s.room}
                                                    </span>
                                                </div>
                                            </div>
                                            <button
                                                className="action-btn"
                                                onClick={() =>
                                                    navigate('/CounselorClient', { state: { scrollToTop: true } })
                                                }
                                                style={{
                                                    width: 'auto',
                                                    minWidth: '80px',
                                                    padding: '8px 12px',
                                                    fontSize: '0.85rem',
                                                    flexShrink: 0,
                                                }}
                                            >
                                                일지 작성
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </section>

                        <div className="work-status-grid">
                            <div className="work-card highlight">
                                <div className="card-header">작성 대기 중인 상담 일지</div>
                                <div className="card-body">
                                    <strong>
                                        {reservations.filter((r) => r.status.includes('확정')).length}
                                        <span>건</span>
                                    </strong>
                                    <p>대기 중인 일지를 작성해주세요.</p>
                                    <button
                                        className="go-btn primary"
                                        onClick={() => navigate('/CounselorClient', { state: { scrollToTop: true } })}
                                    >
                                        지금 작성하기
                                    </button>
                                </div>
                            </div>
                            <div className="work-card">
                                <div className="card-header">신규 매칭 내담자</div>
                                <div className="card-body">
                                    <strong>
                                        {reservations.filter((r) => r.status.includes('확정')).length}
                                        <span>명</span>
                                    </strong>
                                    <p>사전 질문지가 도착했습니다.</p>
                                    <button
                                        className="go-btn secondary"
                                        onClick={() => navigate('/CounselorClient', { state: { scrollToTop: true } })}
                                    >
                                        설문지 확인하기
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <aside className="side-content">
                        <div className="side-header">
                            <h3>다가오는 예약</h3>
                        </div>

                        {/* 확정된 예약 — 가장 가까운 1개만, 없으면 렌더링 안 함 */}
                        {nextConfirmed && (
                            <div
                                className="reservation-card is-next"
                                onClick={() => navigate('/CounselorPlanner')}
                                style={{ cursor: 'pointer' }}
                            >
                                <span className="next-badge">NEXT</span>
                                <div className="res-top">
                                    <div className="res-avatar">
                                        {nextConfirmed.profile_img_url ? (
                                            <img
                                                src={nextConfirmed.profile_img_url}
                                                alt="프로필"
                                                className="res-avatar-img"
                                                onError={(e) => {
                                                    e.target.style.display = 'none';
                                                    e.target.parentNode.textContent = nextConfirmed.name[0];
                                                }}
                                            />
                                        ) : (
                                            nextConfirmed.name[0]
                                        )}
                                    </div>
                                    <div className="res-info">
                                        <strong>{nextConfirmed.name} 내담자</strong>
                                        <span>{nextConfirmed.type}</span>
                                    </div>
                                    <span className="dday-badge">D-{nextConfirmed.dday}</span>
                                </div>
                                <p className="res-date">📅 {nextConfirmed.date}</p>
                            </div>
                        )}

                        {/* 대기 중인 예약 — 전체 표시 */}
                        {pendingList.map((r) => (
                            <div
                                key={r.id}
                                className="reservation-card"
                                onClick={() => navigate('/CounselorPlanner')}
                                style={{ cursor: 'pointer' }}
                            >
                                <div className="res-top">
                                    <div className="res-avatar">
                                        {r.profile_img_url ? (
                                            <img
                                                src={r.profile_img_url}
                                                alt="프로필"
                                                className="res-avatar-img"
                                                onError={(e) => {
                                                    e.target.style.display = 'none';
                                                    e.target.parentNode.textContent = r.name[0];
                                                }}
                                            />
                                        ) : (
                                            r.name[0]
                                        )}
                                    </div>
                                    <div className="res-info">
                                        <strong>{r.name} 내담자</strong>
                                        <span>{r.type}</span>
                                    </div>
                                    <span className="dday-badge dday-wait">D-{r.dday}</span>
                                </div>
                                <p className="res-date">📅 {r.date}</p>
                                <div className="res-actions" onClick={(e) => e.stopPropagation()}>
                                    <button
                                        className="res-btn confirm"
                                        onClick={() => handleConfirm(r.order_id, r.name)}
                                    >
                                        승인
                                    </button>
                                    <button
                                        className="res-btn reject"
                                        onClick={() => handleReject(r.id, r.name, r.order_id)}
                                    >
                                        거절
                                    </button>
                                </div>
                            </div>
                        ))}

                        {/* 확정도 대기도 없을 때 */}
                        {!nextConfirmed && pendingList.length === 0 && (
                            <div className="res-empty-side">
                                <p>다가오는 예약이 없습니다.</p>
                            </div>
                        )}
                    </aside>
                </div>
            </div>

            {toast && (
                <div className={`toast toast-${toast.type}`}>
                    <span className="toast-icon">{toast.type === 'success' ? '✓' : '✕'}</span>
                    {toast.message}
                </div>
            )}

            <MobileTap />
            <Footer />
        </div>
    );
};

export default CounselorHome;
