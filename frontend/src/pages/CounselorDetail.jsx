import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { toggleFavorite } from '../api/favorite';
import { isTokenExpired } from '../utils/jwt';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { User, Calendar, ChevronLeft, ChevronRight, Clock, CheckCircle, MessageCircle } from 'lucide-react';
import Header from '../components/header';
import Footer from '../components/footer';
import '../static/Counselor.css';

export default function CounselorDetailPage({ userName, setUserName, isLoggedIn, setIsLoggedIn }) {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const containerRef = useRef(null);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const [counselor, setCounselor] = useState(null);
    useEffect(() => {
        axios
            .get(`/api/counselors/${id}`)
            .then((res) => setCounselor(res.data))
            .catch(() => setCounselor(null));
    }, [id]);

    function formatPeriod(start, end) {
        if (!start && !end) return '';
        if (start && end) return `${start} ~ ${end}`;
        return start ? `${start} ~` : end;
    }

    const safeCounselor = {
        name: counselor?.name || counselor?.user?.name || counselor?.user?.full_name || counselor?.user?.username || '',
        category: counselor?.category || counselor?.profile_category || counselor?.user?.category || '',
        major: counselor?.major || counselor?.profile_major || counselor?.user?.major || '',
        fields:
            counselor?.fields ||
            (Array.isArray(counselor?.specialties)
                ? counselor.specialties.map((s) => s.specialty_name || s.name || s.specialty || s)
                : counselor?.field
                  ? counselor.field.split(',').map((f) => f.trim())
                  : []),
        type: counselor?.type || counselor?.profile_type || counselor?.user?.type || '',
        price: counselor?.price || counselor?.profile_price || counselor?.profile?.consultation_price || '',
        description:
            counselor?.description ||
            counselor?.intro ||
            counselor?.profile_intro ||
            counselor?.profile?.intro_line ||
            '',
        certificates: Array.isArray(counselor?.certificates)
            ? counselor.certificates
                  .map((c) => c && (c.certificate_name || c.name || c.certificate || c))
                  .filter(Boolean)
            : [],
        educations: Array.isArray(counselor?.educations)
            ? counselor.educations
                  .map((e) => {
                      if (!e) return null;
                      const period = formatPeriod(e.start_date, e.end_date);
                      const content = [e.school_name, e.major, e.degree_type ? `(${e.degree_type})` : '']
                          .filter(Boolean)
                          .join(' ');
                      return `${period}${period && content ? ' | ' : ''}${content}`.trim();
                  })
                  .filter(Boolean)
            : [],
        experiences: Array.isArray(counselor?.experiences)
            ? counselor.experiences
                  .map((ex) => {
                      if (!ex) return null;
                      const period = formatPeriod(ex.start_date, ex.end_date);
                      const detail = [ex.company_name, ex.content].filter(Boolean).join(' ');
                      return `${period}${period && detail ? ' | ' : ''}${detail}`.trim();
                  })
                  .filter(Boolean)
            : [],
        history: counselor?.history || [],
        availableTimes:
            Array.isArray(counselor?.schedules) && counselor.schedules.length > 0
                ? counselor.schedules
                      .map((s) => (s.start_time && s.end_time ? `${s.start_time}~${s.end_time}` : s.time || s))
                      .filter(Boolean)
                : counselor?.availableTimes || ['10:00', '14:00', '16:00'],
        profileImg:
            counselor?.profile_img_url ||
            counselor?.profileImg ||
            counselor?.user?.profile_img_url ||
            counselor?.profile?.profile_img_url ||
            '',
        schedules: counselor?.schedules || [],
    };
    // 상담 가능한 요일 인덱스 추출 (0=일, 1=월, ...)
    const availableDaysOfWeek = Array.isArray(safeCounselor.schedules)
        ? safeCounselor.schedules
              .map((s) => {
                  const map = { 일요일: 0, 월요일: 1, 화요일: 2, 수요일: 3, 목요일: 4, 금요일: 5, 토요일: 6 };
                  return map[s.day_of_week];
              })
              .filter((d) => d !== undefined)
        : [];

    const [selectedDate, setSelectedDate] = useState('');
    const [selectedTime, setSelectedTime] = useState('');
    const [availableTimesForDate, setAvailableTimesForDate] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [liked, setLiked] = useState(location.state?.isLiked || false);
    const [toast, setToast] = useState(null);
    const [isOpen, setIsOpen] = useState(false);
    const [currentMonth, setCurrentMonth] = useState(new Date());

    const showToast = (msg) => setToast(msg);
    useEffect(() => {
        if (toast) {
            const t = setTimeout(() => setToast(null), 2500);
            return () => clearTimeout(t);
        }
    }, [toast]);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) setIsOpen(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleReservation = () => {
        if (!selectedDate || !selectedTime) {
            alert('상담 일자와 시간을 모두 선택해주세요.');
            return;
        }
        navigate('/survey', { state: { counselorName: counselor.name, selectedDate, selectedTime } });
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

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const daysInMonth = (y, m) => new Date(y, m + 1, 0).getDate();
    const firstDayOfMonth = (y, m) => new Date(y, m, 1).getDay();

    // 날짜 클릭 시 해당 요일의 상담 가능 시간대 추출
    const handleDateClick = (day) => {
        const clicked = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
        if (clicked >= today) {
            const dateStr = `${clicked.getFullYear()}-${String(clicked.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            setSelectedDate(dateStr);
            setIsOpen(false);

            // 해당 요일의 상담 가능 시간대 추출
            const dayIdx = clicked.getDay();
            const dayMap = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
            const dayName = dayMap[dayIdx];
            // 동일 요일의 모든 schedule 구간을 합쳐서 시간대 생성
            const schedulesForDay = safeCounselor.schedules.filter((s) => s.day_of_week === dayName);
            let times = [];
            schedulesForDay.forEach((schedule) => {
                const start = parseInt(schedule.start_time.split(':')[0], 10);
                const end = parseInt(schedule.end_time.split(':')[0], 10);
                for (let h = start; h < end; h++) {
                    times.push(`${String(h).padStart(2, '0')}:00`);
                }
            });
            setAvailableTimesForDate(times);
            setSelectedTime(''); // 날짜 바뀌면 시간 초기화
        }
    };

    const changeMonth = (offset) =>
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + offset, 1));

    const renderCalendar = () => {
        const y = currentMonth.getFullYear(),
            m = currentMonth.getMonth();
        const totalDays = daysInMonth(y, m),
            firstDay = firstDayOfMonth(y, m);
        const days = [];
        for (let i = 0; i < firstDay; i++) days.push(<div key={`e-${i}`} className="cld-calendar-day" />);
        for (let d = 1; d <= totalDays; d++) {
            const dateObj = new Date(y, m, d);
            const isPast = dateObj < today;
            // DB에 등록된 상담 가능 요일만 활성화, 나머지는 휴무일(비활성화)
            const isHoliday = !availableDaysOfWeek.includes(dateObj.getDay());
            const isSelected = selectedDate === `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
            days.push(
                <div
                    key={d}
                    className={`cld-calendar-day${isPast || isHoliday ? ' disabled' : ' enabled'}${isSelected ? ' selected' : ''}`}
                    onClick={isPast || isHoliday ? undefined : () => handleDateClick(d)}
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
                                    {safeCounselor.category}
                                    {safeCounselor.category && safeCounselor.major && ' | '}
                                    {safeCounselor.major}
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
                                {safeCounselor.fields.map((f, idx) => {
                                    const label =
                                        typeof f === 'object' && f !== null
                                            ? f.specialty_name || f.name || f.specialty || JSON.stringify(f)
                                            : f;
                                    return (
                                        <span className="cld-field-tag" key={label + idx}>
                                            {label}
                                        </span>
                                    );
                                })}
                            </div>

                            {safeCounselor.certificates.length > 0 && (
                                <>
                                    <h3>자격증</h3>
                                    <ul className="cld-history-list">
                                        {safeCounselor.certificates.map((c, i) => (
                                            <li key={i}>
                                                <CheckCircle size={16} className="cld-check-icon" />
                                                {c}
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
                                                <CheckCircle size={16} className="cld-check-icon" />
                                                {e}
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
                                                <CheckCircle size={16} className="cld-check-icon" />
                                                {ex}
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
                                                <CheckCircle size={16} className="cld-check-icon" />
                                                {h}
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
                                        <span className="cld-calendar-icon">
                                            <Calendar size={16} />
                                        </span>
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
                                                    <span className="cld-dot accent" /> 오늘 이후 예약 가능
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
                                    {availableTimesForDate.length === 0 && selectedDate && (
                                        <span style={{ color: '#b0b0b0', fontSize: '14px' }}>
                                            선택한 날짜에 가능한 시간이 없습니다.
                                        </span>
                                    )}
                                    {availableTimesForDate.map((time, idx) => (
                                        <button
                                            key={time + idx}
                                            className={`cld-time-btn${selectedTime === time ? ' active' : ''}`}
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
