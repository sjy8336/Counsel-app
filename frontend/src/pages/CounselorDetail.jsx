import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
    // 필요 시 3, 4, 5... 추가 가능
};

export default function CounselorDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const counselor = detailedCounselorData[id] || detailedCounselorData['1'];

    const [selectedDate, setSelectedDate] = useState('');
    const [selectedTime, setSelectedTime] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [liked, setLiked] = useState(false);
    const containerRef = useRef(null);

    const handleReservation = async () => {
        if (!selectedDate || !selectedTime) {
            alert('상담 일자와 시간을 모두 선택해주세요.');
            return;
        }

        setIsSubmitting(true);

        try {
            // 시뮬레이션
            await new Promise((resolve) => setTimeout(resolve, 1000));
            alert('예약 신청이 완료되었습니다.');

            // [중요] App.js의 Route path가 "/reservation" 인지 "/Reservation" 인지 확인 필요!
            // 보통 소문자로 작성하는 것이 표준입니다.
            navigate('/reservation');
        } catch (error) {
            alert('에러가 발생했습니다.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleLike = () => {
        const user = localStorage.getItem('user');
        if (!user) {
            alert('로그인 후 이용 가능한 기능입니다.');
            navigate('/login');
            return;
        }
        setLiked((prev) => !prev);
    };

    const [isOpen, setIsOpen] = useState(false);
    const [currentMonth, setCurrentMonth] = useState(new Date());

    // 외부 클릭 시 달력 닫기
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // 오늘 날짜 정보
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 달력 계산 로직
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

        // 빈 칸 (이전 달 날짜 공간)
        for (let i = 0; i < firstDay; i++) {
            days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
        }

        // 실제 날짜
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
        <div className="full-page-wrapper">
            <Header activeTab="search" setActiveTab={() => {}} />

            <div className="detail-split-container">
                <section className="detail-left">
                    <button className="back-btn-clear" onClick={() => navigate(-1)}>
                        <ChevronLeft size={18} /> 목록으로 돌아가기
                    </button>

                    <div className="counselor-profile-header">
                        <div className="large-profile">
                            <User size={48} />
                        </div>
                        <div className="info-text">
                            <span className="detail-category">
                                {counselor.category} | {counselor.major}
                            </span>
                            <h2 className="detail-name">{counselor.name}</h2>
                            <span className="type-tag">{counselor.type} 상담 전문</span>
                        </div>
                    </div>

                    <div className="detail-content">
                        <h3>전문가 소개</h3>
                        <p>{counselor.description}</p>

                        <h3>상담 분야</h3>
                        <div className="field-chips">
                            {counselor.fields.map((f) => (
                                <span key={f}>#{f}</span>
                            ))}
                        </div>

                        <h3>주요 약력</h3>
                        <ul className="history-list">
                            {counselor.history.map((h, i) => (
                                <li key={i}>
                                    <CheckCircle size={18} className="check-icon" /> {h}
                                </li>
                            ))}
                        </ul>
                    </div>
                </section>

                <section className="detail-right">
                    <div className="sticky-reservation-card">
                        <h3>상담 예약하기</h3>

                        <div className="price-tag-large">
                            <span className="price-label">대면 상담 (50분)</span>
                            <span className="price-value">{counselor.price}</span>
                        </div>

                        <div className="reservation-step">
                            <label>
                                <Calendar size={18} /> 상담 일자 선택
                            </label>
                            <div className="date-picker-container" ref={containerRef}>
                                {/* 입력 영역 */}
                                <div className="date-input-wrapper" onClick={() => setIsOpen(!isOpen)}>
                                    <input
                                        type="text"
                                        readOnly
                                        placeholder="상담 날짜를 선택해주세요"
                                        value={selectedDate}
                                        className="date-display-input"
                                    />
                                </div>
                                {/* 달력 팝업 */}
                                {isOpen && (
                                    <div className="calendar-popup">
                                        <div className="calendar-header">
                                            <button onClick={() => changeMonth(-1)} className="nav-button">
                                                <ChevronLeft size={20} />
                                            </button>
                                            <span className="current-month-text">
                                                {currentMonth.getFullYear()}년 {currentMonth.getMonth() + 1}월
                                            </span>
                                            <button onClick={() => changeMonth(1)} className="nav-button">
                                                <ChevronRight size={20} />
                                            </button>
                                        </div>

                                        <div className="calendar-weekdays">
                                            {['일', '월', '화', '수', '목', '금', '토'].map((d) => (
                                                <div key={d} className="weekday-label">
                                                    {d}
                                                </div>
                                            ))}
                                        </div>

                                        <div className="calendar-grid">{renderCalendar()}</div>

                                        <div className="calendar-footer">
                                            <div className="legend-item">
                                                <span className="dot accent"></span> 오늘 이후 예약 가능
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="reservation-step">
                            <label>
                                <Clock size={18} /> 시간 선택
                            </label>
                            <div className="time-grid">
                                {counselor.availableTimes.map((time) => (
                                    <button
                                        key={time}
                                        className={`time-btn ${selectedTime === time ? 'active' : ''}`}
                                        onClick={() => setSelectedTime(time)}
                                        disabled={isSubmitting}
                                    >
                                        {time}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="reserve-action-row">
                            <button className="reserve-submit-btn" onClick={handleReservation} disabled={isSubmitting}>
                                {isSubmitting ? '처리 중...' : '예약 신청하기'}
                            </button>
                            <button
                                className={`heart-btn-reserve${liked ? ' liked' : ''}`}
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

                        <button className="inquiry-btn" onClick={() => navigate('/mypage')}>
                            <MessageCircle size={18} /> 상담사에게 예약 문의하기
                        </button>
                    </div>
                </section>
            </div>

            <Footer />
        </div>
    );
}
