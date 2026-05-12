import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
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

export default function CounselorDetailPage({ userName, setUserName, isLoggedIn, setIsLoggedIn }) {
    const { id } = useParams();
    // 페이지 진입 시 스크롤 맨 위로 이동
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);
    const navigate = useNavigate();
    const location = useLocation();

    // location.state?.counselor가 있으면 우선 사용, 없으면 API로 fetch
    const [counselor, setCounselor] = useState(location.state?.counselor || null);

    useEffect(() => {
        // location.state에 없으면 API로 fetch
        if (!location.state?.counselor) {
            axios
                .get(`/api/counselors/${id}`)
                .then((res) => {
                    setCounselor(res.data);
                })
                .catch((err) => {
                    setCounselor(null); // 더미데이터 없이 null 처리
                });
        }
    }, [id, location.state]);

    // 더미데이터 없이, location.state 또는 fetch 데이터만 사용
    const effectiveCounselor = counselor;
    // DB에서 온 counselor 객체의 상세 정보 매핑
    const safeCounselor = {
        name: effectiveCounselor?.name || effectiveCounselor?.user?.name || '',
        category: effectiveCounselor?.category || effectiveCounselor?.profile_category || '',
        major: effectiveCounselor?.major || effectiveCounselor?.profile_major || '',
        fields:
            effectiveCounselor?.fields ||
            (Array.isArray(effectiveCounselor?.specialties)
                ? effectiveCounselor.specialties.map((s) => s.name || s.specialty || s)
                : effectiveCounselor?.field
                  ? effectiveCounselor.field.split(',').map((f) => f.trim())
                  : []),
        type: effectiveCounselor?.type || effectiveCounselor?.profile_type || '',
        price: effectiveCounselor?.price || effectiveCounselor?.profile_price || '',
        description:
            effectiveCounselor?.description || effectiveCounselor?.intro || effectiveCounselor?.profile_intro || '',
        certificates: Array.isArray(effectiveCounselor?.certificates)
            ? effectiveCounselor.certificates
                  .map((c) => c && (c.certificate_name || c.name || c.certificate || c))
                  .filter(Boolean)
            : [],
        educations: Array.isArray(effectiveCounselor?.educations)
            ? effectiveCounselor.educations
                  .map(
                      (e) =>
                          e &&
                          (e.school_name && e.major
                              ? `${e.school_name} ${e.major}${e.degree_type ? ' (' + e.degree_type + ')' : ''} ${e.start_date ? e.start_date + '~' : ''}${e.end_date || ''}`.trim()
                              : e.school_name || e.major || e)
                  )
                  .filter(Boolean)
            : [],
        experiences: Array.isArray(effectiveCounselor?.experiences)
            ? effectiveCounselor.experiences
                  .map(
                      (ex) =>
                          ex &&
                          (ex.company_name && ex.content
                              ? `${ex.company_name} ${ex.content} ${ex.start_date ? ex.start_date + '~' : ''}${ex.end_date || ''}`.trim()
                              : ex.company_name || ex.content || ex)
                  )
                  .filter(Boolean)
            : [],
        history: effectiveCounselor?.history || [],
        availableTimes:
            Array.isArray(effectiveCounselor?.schedules) && effectiveCounselor.schedules.length > 0
                ? effectiveCounselor.schedules
                      .map((s) => {
                          if (s.start_time && s.end_time) {
                              return `${s.start_time}~${s.end_time}`;
                          }
                          return s.time || s;
                      })
                      .filter(Boolean)
                : effectiveCounselor?.availableTimes || ['10:00', '14:00', '16:00'],
        profileImg: effectiveCounselor?.profile_img_url || effectiveCounselor?.profileImg || '',
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
                                {safeCounselor.profileImg ? (
                                    <img
                                        src={safeCounselor.profileImg}
                                        alt="상담사 프로필"
                                        className="cld-large-profile-img"
                                    />
                                ) : (
                                    <User size={64} />
                                )}
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

                            {safeCounselor.certificates.length > 0 && (
                                <>
                                    <h3>자격증</h3>
                                    <ul className="cld-history-list">
                                        {safeCounselor.certificates.map((c, i) => (
                                            <li key={i}>
                                                <CheckCircle size={18} className="cld-check-icon" /> {c}
                                            </li>
                                        ))}
                                    </ul>
                                </>
                            )}
                            {safeCounselor.educations.length > 0 && (
                                <>
                                    <h3>학력</h3>
                                    <ul className="cld-history-list">
                                        {safeCounselor.educations.map((e, i) => (
                                            <li key={i}>
                                                <CheckCircle size={18} className="cld-check-icon" /> {e}
                                            </li>
                                        ))}
                                    </ul>
                                </>
                            )}
                            {safeCounselor.experiences.length > 0 && (
                                <>
                                    <h3>경력</h3>
                                    <ul className="cld-history-list">
                                        {safeCounselor.experiences.map((ex, i) => (
                                            <li key={i}>
                                                <CheckCircle size={18} className="cld-check-icon" /> {ex}
                                            </li>
                                        ))}
                                    </ul>
                                </>
                            )}
                            {safeCounselor.history.length > 0 && (
                                <>
                                    <h3>기타 이력</h3>
                                    <ul className="cld-history-list">
                                        {safeCounselor.history.map((h, i) => (
                                            <li key={i}>
                                                <CheckCircle size={18} className="cld-check-icon" /> {h}
                                            </li>
                                        ))}
                                    </ul>
                                </>
                            )}
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

                            <button
                                className="cld-inquiry-btn"
                                onClick={() => navigate('/contact-coach', { state: { counselorName: counselor.name } })}
                            >
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
