import React, { useState, useRef, useEffect } from 'react';
import { toggleFavorite } from '../api/favorite';
import { isTokenExpired } from '../utils/jwt';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
    User,
    Calendar,
    CalendarIcon,
    ChevronLeft,
    ChevronRight,
    Clock,
    CheckCircle,
    MessageCircle,
} from 'lucide-react';
import Header from '../components/header';
import Footer from '../components/footer';
import '../static/Counselor.css';

const detailedCounselorData = {
    1: {
        name: '이은지 상담사',
        category: '개인 심리',
        major: '임상심리학 석사',
        fields: ['우울', '불안', '공황'],
        type: '대면',
        price: '60,000원',
        description:
            '당신의 마음 일기 속 숨겨진 감정을 함께 찾아냅니다. 10년 간의 임상 경험을 바탕으로, 일상에서 느끼는 미묘한 불안과 우울의 원인을 분석합니다.',
        history: ['한국심리학회 공인 상담심리사 1급', '전 OO대학교 학생상담센터 상담원'],
        availableTimes: ['10:00', '14:00', '16:00'],
    },
    2: {
        name: '김태현 상담사',
        category: '직장',
        major: '산업심리학 박사',
        fields: ['스트레스', '번아웃', '대인관계'],
        type: '대면',
        price: '60,000원',
        description: '조직 내 갈등과 업무 압박으로 인한 번아웃은 단순한 휴식만으로 해결되지 않습니다.',
        history: ['기업 상담(EAP) 전문 상담사'],
        availableTimes: ['11:00', '15:00', '17:00'],
    },
};

export default function CounselorDetailPage({ userName, setUserName, isLoggedIn, setIsLoggedIn }) {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    // location.state?.counselor가 있으면 우선 사용
    const counselor = location.state?.counselor || detailedCounselorData[id] || detailedCounselorData['1'];
    // counselor의 필드가 없을 때 안전하게 처리
    const safeCounselor = {
        name: counselor?.name || '',
        category: counselor?.category || '',
        major: counselor?.major || '',
        fields: counselor?.fields || (counselor?.field ? counselor.field.split(',').map((f) => f.trim()) : []),
        type: counselor?.type || '',
        price: counselor?.price || '',
        description: counselor?.description || counselor?.intro || '',
        history: counselor?.history || [],
        availableTimes: counselor?.availableTimes || ['10:00', '14:00', '16:00'],
    };

    const [selectedDate, setSelectedDate] = useState('');
    const [selectedTime, setSelectedTime] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    // location.state?.isLiked가 있으면 그 값으로 초기화
    const [liked, setLiked] = useState(location.state?.isLiked || false);
    const [toast, setToast] = useState(null);
    const containerRef = useRef(null);

    // 토스트 표시 함수
    const showToast = (msg) => setToast(msg);
    useEffect(() => {
        if (toast) {
            const timer = setTimeout(() => setToast(null), 2500);
            return () => clearTimeout(timer);
        }
    }, [toast]);

    // --- 수정된 예약 핸들러: 바로 완료하지 않고 설문 페이지로 데이터 전송 ---
    const handleReservation = () => {
        if (!selectedDate || !selectedTime) {
            alert('상담 일자와 시간을 모두 선택해주세요.');
            return;
        }

        // Survey.jsx로 이동하면서 상담사 이름, 날짜, 시간 정보를 state에 담아 보냅니다.
        navigate('/survey', {
            state: {
                counselorName: counselor.name,
                selectedDate: selectedDate,
                selectedTime: selectedTime,
            },
        });
    };

    const handleLike = async () => {
        const user = localStorage.getItem('user');
        const token = localStorage.getItem('access_token');
        if (!user || !token) {
            alert('로그인 후 이용 가능한 기능입니다.');
            navigate('/login');
            return;
        }
        if (isTokenExpired(token)) {
            alert('로그인 세션이 만료되었습니다. 다시 로그인 해주세요.');
            localStorage.removeItem('access_token');
            localStorage.removeItem('user');
            navigate('/login');
            return;
        }
        try {
            const res = await toggleFavorite(id, token);
            setLiked(res.is_favorite);
            showToast(res.is_favorite ? '찜 목록에 추가되었습니다.' : '찜이 취소되었습니다.');
        } catch (err) {
            // 401 Unauthorized 처리
            if (err?.response?.status === 401) {
                alert('로그인 세션이 만료되었습니다. 다시 로그인 해주세요.');
                localStorage.removeItem('access_token');
                localStorage.removeItem('user');
                navigate('/login');
            } else {
                alert('찜 처리 중 오류가 발생했습니다.');
            }
        }
    };

    const [isOpen, setIsOpen] = useState(false);
    const [currentMonth, setCurrentMonth] = useState(new Date());

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const daysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

    const handleDateClick = (day) => {
        const clickedDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
        if (clickedDate >= today) {
            const formattedDate = `${clickedDate.getFullYear()}-${String(clickedDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            setSelectedDate(formattedDate);
            setIsOpen(false);
        }
    };

    const changeMonth = (offset) => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + offset, 1));
    };

    const renderCalendar = () => {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();
        const totalDays = daysInMonth(year, month);
        const firstDay = firstDayOfMonth(year, month);
        const days = [];

        for (let i = 0; i < firstDay; i++) {
            days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
        }

        for (let d = 1; d <= totalDays; d++) {
            const dateObj = new Date(year, month, d);
            const isPast = dateObj < today;
            const isSelected =
                selectedDate === `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

            days.push(
                <div
                    key={d}
                    className={`calendar-day ${isPast ? 'disabled' : 'enabled'} ${isSelected ? 'selected' : ''}`}
                    onClick={() => !isPast && handleDateClick(d)}
                >
                    {d}
                </div>
            );
        }
        return days;
    };

    return (
        <>
            {toast && <div className="cld-mp-toast">{toast}</div>}
            <div className="cld-full-page-wrapper">
                <Header
                    activeTab="search"
                    setActiveTab={() => {}}
                    userName={userName}
                    setUserName={setUserName}
                    isLoggedIn={isLoggedIn}
                    setIsLoggedIn={setIsLoggedIn}
                />

                <div className="cld-detail-split-container">
                    <section className="cld-detail-left">
                        <button className="cld-back-btn-clear" onClick={() => navigate(-1)}>
                            <ChevronLeft size={18} /> 목록으로 돌아가기
                        </button>

                        <div className="cld-counselor-profile-header">
                            <div className="cld-large-profile">
                                <User size={48} />
                            </div>
                            <div className="cld-info-text">
                                <span className="cld-detail-category">
                                    {safeCounselor.category} | {safeCounselor.major}
                                </span>
                                <h2 className="cld-detail-name">{safeCounselor.name}</h2>
                                <span className="cld-type-tag">{safeCounselor.type} 상담 전문</span>
                            </div>
                        </div>

                        <div className="cld-detail-content">
                            <h3>전문가 소개</h3>
                            <p>{safeCounselor.description}</p>

                            <h3>상담 분야</h3>
                            <div className="cld-field-chips">
                                {safeCounselor.fields.map((f) => (
                                    <span key={f}>#{f}</span>
                                ))}
                            </div>

                            <h3>주요 약력</h3>
                            <ul className="cld-history-list">
                                {safeCounselor.history.map((h, i) => (
                                    <li key={i}>
                                        <CheckCircle size={18} className="cld-check-icon" /> {h}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </section>

                    <section className="cld-detail-right">
                        <div className="cld-sticky-reservation-card">
                            <h3>상담 예약하기</h3>

                            <div className="cld-price-tag-large">
                                <span className="cld-price-label">대면 상담 (50분)</span>
                                <span className="cld-price-value">{safeCounselor.price}</span>
                            </div>

                            <div className="cld-reservation-step">
                                <label>
                                    <Calendar size={18} /> 상담 일자 선택
                                </label>
                                <div className="cld-date-picker-container" ref={containerRef}>
                                    <div className="cld-date-input-wrapper" onClick={() => setIsOpen(!isOpen)}>
                                        <input
                                            type="text"
                                            readOnly
                                            placeholder="상담 날짜를 선택해주세요"
                                            value={selectedDate}
                                            className="cld-date-display-input"
                                        />
                                    </div>
                                    {isOpen && (
                                        <div className="cld-calendar-popup">
                                            <div className="cld-calendar-header">
                                                <button onClick={() => changeMonth(-1)} className="cld-nav-button">
                                                    <ChevronLeft size={20} />
                                                </button>
                                                <span className="cld-current-month-text">
                                                    {currentMonth.getFullYear()}년 {currentMonth.getMonth() + 1}월
                                                </span>
                                                <button onClick={() => changeMonth(1)} className="cld-nav-button">
                                                    <ChevronRight size={20} />
                                                </button>
                                            </div>

                                            <div className="cld-calendar-weekdays">
                                                {['일', '월', '화', '수', '목', '금', '토'].map((d) => (
                                                    <div key={d} className="cld-weekday-label">
                                                        {d}
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="cld-calendar-grid">{renderCalendar()}</div>

                                            <div className="cld-calendar-footer">
                                                <div className="cld-legend-item">
                                                    <span className="cld-dot accent"></span> 오늘 이후 예약 가능
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="cld-reservation-step">
                                <label>
                                    <Clock size={18} /> 시간 선택
                                </label>
                                <div className="cld-time-grid">
                                    {safeCounselor.availableTimes.map((time) => (
                                        <button
                                            key={time}
                                            className={`cld-time-btn ${selectedTime === time ? 'active' : ''}`}
                                            onClick={() => setSelectedTime(time)}
                                            disabled={isSubmitting}
                                        >
                                            {time}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="cld-reserve-action-row">
                                <button
                                    className="cld-reserve-submit-btn"
                                    onClick={handleReservation}
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? '처리 중...' : '예약 신청하기'}
                                </button>
                                <button
                                    className={`cld-heart-btn-reserve${liked ? ' liked' : ''}`}
                                    aria-label="찜하기"
                                    onClick={handleLike}
                                    type="button"
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="26"
                                        height="26"
                                        viewBox="0 0 24 24"
                                        fill={liked ? '#fda4af' : 'none'}
                                        stroke={liked ? '#f43f5e' : '#64748b'}
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        style={{ verticalAlign: 'middle', transition: 'fill 0.2s, stroke 0.2s' }}
                                    >
                                        <path d="M19.5 13.6l-7.5 7.4-7.5-7.4C2.1 11.7 2.1 8.7 4 6.9c1.8-1.8 4.8-1.8 6.6 0l.9.9.9-.9c1.8-1.8 4.8-1.8 6.6 0 1.9 1.8 1.9 4.8 0 6.7z" />
                                    </svg>
                                </button>
                            </div>

                            <button className="cld-inquiry-btn" onClick={() => navigate('/mypage')}>
                                <MessageCircle size={18} /> 상담사에게 예약 문의하기
                            </button>
                        </div>
                    </section>
                </div>

                <Footer />
            </div>
        </>
    );
}
