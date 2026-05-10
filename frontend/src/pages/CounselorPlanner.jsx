import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { confirmBooking } from '../api/bookingConfirm';
import Header from '../components/header';
import Footer from '../components/footer';
import MobileTap from '../components/mobileTap';
import {
    Calendar as CalendarIcon,
    List,
    ChevronLeft,
    ChevronRight,
    User,
    Clock,
    Bell,
    Search,
    X,
    Info,
    CalendarOff,
    Slash,
    Menu,
    Plus,
    Check,
    ChevronDown,
    Trash2,
    CalendarDays,
} from 'lucide-react';
import '../static/CounselorPlanner.css';

const CounselorPlanner = ({ userName, setUserName, isLoggedIn, setIsLoggedIn }) => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = React.useState('reservation');
    const [viewMode, setViewMode] = useState('calendar');
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedReservation, setSelectedReservation] = useState(null);
    const [selectedDateDetails, setSelectedDateDetails] = useState(null);

    const [showBlockInput, setShowBlockInput] = useState(false);
    const [showAddReservation, setShowAddReservation] = useState(false);

    const [newClientName, setNewClientName] = useState('');
    const [manualSelectedDate, setManualSelectedDate] = useState('');
    const [startTime, setStartTime] = useState('09:00');
    const [endTime, setEndTime] = useState('10:00');
    const [activePicker, setActivePicker] = useState(null);

    const [reservations, setReservations] = useState([
        {
            id: 1,
            client: '김지아',
            date: '2026-04-21',
            time: '14:00 - 15:00',
            type: '상담',
            status: '확정됨',
            location: '마인드웰 서울 센터 3번실',
            topic: '대인관계 및 사회 공포증',
        },
        {
            id: 2,
            client: '박민우',
            date: '2026-04-21',
            time: '16:30 - 17:30',
            type: '상담',
            status: '확정됨',
            location: '마인드웰 서울 센터 1번실',
            topic: '직장 내 번아웃 및 스트레스 관리',
        },
        {
            id: 3,
            client: '이하늘',
            date: '2026-04-22',
            time: '10:00 - 11:00',
            type: '상담',
            status: '대기 중',
            location: '미정',
            topic: '자기이해 및 자존감 향상',
        },
        {
            id: 4,
            client: '최현우',
            date: '2026-05-12',
            time: '13:00 - 14:00',
            type: '상담',
            status: '확정됨',
            location: '마인드웰 서울 센터 2번실',
            topic: '진로 고민 및 취업 스트레스',
        },
    ]);

    const [offDays, setOffDays] = useState(['2026-04-25', '2026-04-26']);
    const [blockedSlots, setBlockedSlots] = useState([
        { date: '2026-04-23', time: '10:00 - 12:00', reason: '외부 세미나' },
    ]);

    const timeOptions = [];
    for (let i = 9; i < 24; i++) {
        const hour = i.toString().padStart(2, '0');
        timeOptions.push(`${hour}:00`);
        timeOptions.push(`${hour}:30`);
    }

    const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

    const getDaysInMonth = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1).getDay();
        const days = new Date(year, month + 1, 0).getDate();
        return { firstDay, days, year, month };
    };

    // 내담자 차트로 데이터 넘기며 이동[cite: 5]
    const handleGoToClientChart = (clientName) => {
        const clientReservations = reservations.filter((r) => r.client === clientName);
        navigate('/CounselorClient', {
            state: {
                selectedClientName: clientName,
                clientReservations: clientReservations,
            },
        });
    };

    // 일정 추가 후 캘린더에 즉시 반영하는 로직[cite: 5]
    const handleManualAddReservation = () => {
        if (!newClientName || !manualSelectedDate) {
            alert('상담 날짜와 내담자 성함을 모두 입력해 주세요.');
            return;
        }

        const newRes = {
            id: Date.now(),
            client: newClientName,
            date: manualSelectedDate,
            time: `${startTime} - ${endTime}`,
            type: '상담',
            status: '확정됨',
            location: '지정되지 않음',
            topic: '직접 추가된 일정입니다.',
        };

        setReservations((prev) => [...prev, newRes]);
        setNewClientName('');
        setShowAddReservation(false);
        // 여기서 바로 navigate를 쓰지 않고, 사용자가 상세 내역의 '일지 작성' 버튼을 누를 때 넘어가도록 흐름 유지
    };

    // 예약 승인(확정) - 실제 API 연동
    const handleApproveReservation = async (id) => {
        const res = reservations.find((r) => r.id === id);
        if (!res || !res.order_id) {
            alert('예약 정보에 order_id가 없습니다.');
            return;
        }
        try {
            await confirmBooking(res.order_id);
            setReservations((prev) => prev.map((item) => (item.id === id ? { ...item, status: '확정됨' } : item)));
            if (selectedReservation?.id === id) {
                setSelectedReservation({ ...selectedReservation, status: '확정됨' });
            }
            alert('예약이 확정되었습니다.');
        } catch (e) {
            alert('예약 확정에 실패했습니다.');
        }
    };

    const handleRejectReservation = (id) => {
        setReservations(reservations.filter((res) => res.id !== id));
        setSelectedReservation(null);
    };

    const handleAddBlock = () => {
        if (startTime && endTime && selectedDateDetails) {
            setBlockedSlots([
                ...blockedSlots,
                { date: selectedDateDetails, time: `${startTime} - ${endTime}`, reason: '개인 일정' },
            ]);
            setShowBlockInput(false);
        }
    };

    const TimePicker = ({ value, onChange, label, isActive, setIsActive }) => (
        <div className="mwc-timepicker-wrap">
            <label className="mwc-timepicker-label">{label}</label>
            <button
                type="button"
                onClick={(e) => {
                    e.stopPropagation();
                    setIsActive(!isActive);
                }}
                className="mwc-timepicker-btn"
            >
                {value}
                <ChevronDown
                    size={14}
                    className={`mwc-timepicker-chevron${isActive ? ' mwc-timepicker-chevron--open' : ''}`}
                />
            </button>

            {isActive && (
                <div className="mwc-timepicker-dropdown">
                    {timeOptions.map((time) => (
                        <div
                            key={time}
                            onClick={() => {
                                onChange(time);
                                setIsActive(false);
                            }}
                            className={`mwc-timepicker-option${value === time ? ' mwc-timepicker-option--selected' : ''}`}
                        >
                            {time}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );

    const renderDetailModal = () => {
        if (!selectedReservation && !selectedDateDetails && !showAddReservation) return null;

        if (selectedReservation) {
            return (
                <div className="mwc-modal-overlay" onClick={() => setSelectedReservation(null)}>
                    <div className="mwc-modal-box" onClick={(e) => e.stopPropagation()}>
                        <div className="mwc-modal-body">
                            <div className="mwc-res-header">
                                <div className="mwc-res-header-left">
                                    <div className="mwc-res-avatar">
                                        <User className="text-[#8BA888]" size={24} />
                                    </div>
                                    <div>
                                        <h3 className="mwc-res-name">{selectedReservation.client}님</h3>
                                        <p className="mwc-res-type">{selectedReservation.type}</p>
                                    </div>
                                </div>
                                <button onClick={() => setSelectedReservation(null)} className="mwc-modal-close-btn">
                                    <X size={20} className="text-[#94A3B8]" />
                                </button>
                            </div>
                            <div className="mwc-res-details">
                                <div className="mwc-res-detail-row">
                                    <div className="mwc-res-detail-icon">
                                        <CalendarIcon size={18} />
                                    </div>
                                    <div>
                                        <p className="mwc-res-detail-label">날짜 및 시간</p>
                                        <p className="mwc-res-detail-value">
                                            {selectedReservation.date} | {selectedReservation.time}
                                        </p>
                                    </div>
                                </div>
                                <div className="mwc-res-detail-row">
                                    <div className="mwc-res-detail-icon">
                                        <Info size={18} />
                                    </div>
                                    <div>
                                        <p className="mwc-res-detail-label">상담 주제</p>
                                        <p className="mwc-res-detail-value">{selectedReservation.topic}</p>
                                    </div>
                                </div>
                                <div className="mwc-res-status-row">
                                    <span className="mwc-res-status-label">진행 상태</span>
                                    <span
                                        className={`mwc-res-status-badge${selectedReservation.status === '확정됨' ? ' mwc-res-status-badge--confirmed' : ' mwc-res-status-badge--pending'}`}
                                    >
                                        {selectedReservation.status}
                                    </span>
                                </div>
                            </div>

                            <div className="mwc-res-actions">
                                {selectedReservation.status === '대기 중' ? (
                                    <div className="mwc-res-action-grid">
                                        <button
                                            onClick={() => handleRejectReservation(selectedReservation.id)}
                                            className="mwc-reject-btn"
                                        >
                                            거절하기
                                        </button>
                                        <button
                                            onClick={() => handleApproveReservation(selectedReservation.id)}
                                            className="mwc-approve-btn"
                                        >
                                            <Check size={18} /> 승인하기
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        className="mwc-journal-btn"
                                        style={{ width: '100%' }}
                                        onClick={() => handleGoToClientChart(selectedReservation.client)}
                                    >
                                        일지 작성
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        if (selectedDateDetails) {
            const isOff = offDays.includes(selectedDateDetails);
            const dayBlocks = blockedSlots.filter((b) => b.date === selectedDateDetails);
            const dayReservations = reservations.filter((r) => r.date === selectedDateDetails);
            const hasReservations = dayReservations.length > 0;

            return (
                <div
                    className="mwc-modal-overlay mwc-modal-overlay--date"
                    onClick={() => {
                        setSelectedDateDetails(null);
                        setShowBlockInput(false);
                        setShowAddReservation(false);
                    }}
                >
                    <div className="mwc-modal-box mwc-modal-box--date" onClick={(e) => e.stopPropagation()}>
                        <div className="mwc-modal-body--scroll">
                            <div className="mwc-date-modal-header">
                                <h3 className="mwc-date-modal-title">{selectedDateDetails} 관리</h3>
                                <button
                                    onClick={() => {
                                        setSelectedDateDetails(null);
                                        setShowBlockInput(false);
                                        setShowAddReservation(false);
                                    }}
                                    className="mwc-modal-close-btn"
                                >
                                    <X size={20} className="text-[#94A3B8]" />
                                </button>
                            </div>

                            <div className="mwc-date-modal-sections">
                                {showAddReservation ? (
                                    <div className="mwc-add-res-panel">
                                        <div>
                                            <p className="mwc-add-res-panel-title">직접 일정 추가</p>
                                        </div>
                                        <div>
                                            <label className="mwc-field-label">상담 날짜</label>
                                            <div className="mwc-input-wrap">
                                                <CalendarDays className="mwc-input-icon" size={16} />
                                                <input
                                                    type="date"
                                                    value={manualSelectedDate}
                                                    onChange={(e) => setManualSelectedDate(e.target.value)}
                                                    className="mwc-date-input"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="mwc-field-label">내담자 성함</label>
                                            <input
                                                type="text"
                                                value={newClientName}
                                                onChange={(e) => setNewClientName(e.target.value)}
                                                placeholder="이름 입력"
                                                className="mwc-text-input"
                                            />
                                        </div>
                                        <div className="mwc-time-row">
                                            <TimePicker
                                                label="시작 시간"
                                                value={startTime}
                                                onChange={setStartTime}
                                                isActive={activePicker === 'start'}
                                                setIsActive={(val) => setActivePicker(val ? 'start' : null)}
                                            />
                                            <TimePicker
                                                label="종료 시간"
                                                value={endTime}
                                                onChange={setEndTime}
                                                isActive={activePicker === 'end'}
                                                setIsActive={(val) => setActivePicker(val ? 'end' : null)}
                                            />
                                        </div>
                                        <div className="mwc-add-res-actions">
                                            <button onClick={handleManualAddReservation} className="mwc-submit-btn">
                                                <Check size={16} /> 추가 완료
                                            </button>
                                            <button
                                                onClick={() => setShowAddReservation(false)}
                                                className="mwc-cancel-btn"
                                            >
                                                취소
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => {
                                            setManualSelectedDate(selectedDateDetails);
                                            setShowAddReservation(true);
                                        }}
                                        className="mwc-add-schedule-btn"
                                    >
                                        <Plus size={18} /> 새 상담 일정 추가
                                    </button>
                                )}

                                <div>
                                    <p className="mwc-section-title">
                                        <User size={16} className="text-[#8BA888]" /> 내담자 예약 현황
                                    </p>
                                    {hasReservations ? (
                                        <div className="mwc-reservation-list">
                                            {dayReservations.map((res) => (
                                                <div
                                                    key={res.id}
                                                    className="mwc-reservation-item"
                                                    onClick={() => setSelectedReservation(res)}
                                                >
                                                    <div>
                                                        <span className="mwc-reservation-item-name">
                                                            {res.client}님
                                                        </span>
                                                        <span className="mwc-reservation-item-time">{res.time}</span>
                                                    </div>
                                                    <div className="mwc-reservation-item-btns">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleRejectReservation(res.id);
                                                            }}
                                                            className="mwc-item-delete-btn"
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="mwc-empty-text">예약된 일정이 없습니다.</p>
                                    )}
                                </div>

                                {/* 휴무 설정 복구[cite: 5] */}
                                <div
                                    className={`mwc-off-box${isOff ? ' mwc-off-box--active' : ' mwc-off-box--normal'}${hasReservations ? ' mwc-off-box--disabled' : ''}`}
                                >
                                    <div className="mwc-off-box-inner">
                                        <div className="mwc-off-box-left">
                                            <CalendarOff
                                                className={isOff ? 'text-[#FDA4AF]' : 'text-[#94A3B8]'}
                                                size={20}
                                            />
                                            <div>
                                                <p className="mwc-off-box-label">일일 휴무</p>
                                                <p className="mwc-off-box-sub">
                                                    {hasReservations ? '예약이 있어 휴무 설정 불가' : '전체 휴무 지정'}
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            disabled={hasReservations}
                                            onClick={() =>
                                                isOff
                                                    ? setOffDays(offDays.filter((d) => d !== selectedDateDetails))
                                                    : setOffDays([...offDays, selectedDateDetails])
                                            }
                                            className={`mwc-off-toggle-btn${isOff ? ' mwc-off-toggle-btn--active' : ' mwc-off-toggle-btn--normal'}`}
                                        >
                                            {isOff ? '취소' : '설정'}
                                        </button>
                                    </div>
                                </div>

                                {/* 타임슬롯 차단 복구[cite: 5] */}
                                <div>
                                    <p className="mwc-section-title">
                                        <Clock size={16} /> 예약 불가 시간
                                    </p>
                                    {dayBlocks.length > 0 && (
                                        <div className="mwc-block-list">
                                            {dayBlocks.map((block, idx) => (
                                                <div key={idx} className="mwc-block-item">
                                                    <span className="mwc-block-item-time">{block.time}</span>
                                                    <button
                                                        onClick={() =>
                                                            setBlockedSlots(blockedSlots.filter((b) => b !== block))
                                                        }
                                                        className="mwc-block-remove-btn"
                                                    >
                                                        <X size={14} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {showBlockInput ? (
                                        <div className="mwc-block-input-panel">
                                            <div className="mwc-time-row">
                                                <TimePicker
                                                    label="시작"
                                                    value={startTime}
                                                    onChange={setStartTime}
                                                    isActive={activePicker === 'start'}
                                                    setIsActive={(v) => setActivePicker(v ? 'start' : null)}
                                                />
                                                <TimePicker
                                                    label="종료"
                                                    value={endTime}
                                                    onChange={setEndTime}
                                                    isActive={activePicker === 'end'}
                                                    setIsActive={(v) => setActivePicker(v ? 'end' : null)}
                                                />
                                            </div>
                                            <div className="mwc-block-actions">
                                                <button onClick={handleAddBlock} className="mwc-block-submit-btn">
                                                    불가 시간 등록
                                                </button>
                                                <button
                                                    onClick={() => setShowBlockInput(false)}
                                                    className="mwc-cancel-btn"
                                                >
                                                    취소
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <button onClick={() => setShowBlockInput(true)} className="mwc-add-block-btn">
                                            + 시간대 예약 막기
                                        </button>
                                    )}
                                </div>
                            </div>
                            <button onClick={() => setSelectedDateDetails(null)} className="mwc-modal-confirm-btn">
                                확인
                            </button>
                        </div>
                    </div>
                </div>
            );
        }
    };

    const renderCalendar = () => {
        const { firstDay, days, year, month } = getDaysInMonth(currentDate);
        const calendarDays = [];
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        for (let i = 0; i < firstDay; i++)
            calendarDays.push(<div key={`empty-${i}`} className="mwc-calendar-cell-empty"></div>);

        for (let d = 1; d <= days; d++) {
            const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
            const dayReservations = reservations.filter((r) => r.date === dateString);
            const isOff = offDays.includes(dateString);
            const dayBlocks = blockedSlots.filter((b) => b.date === dateString);
            const isToday = today.toDateString() === new Date(year, month, d).toDateString();

            calendarDays.push(
                <div
                    key={d}
                    onClick={() => {
                        setSelectedDateDetails(dateString);
                        setManualSelectedDate(dateString);
                    }}
                    className={`mwc-calendar-cell${isOff ? ' mwc-calendar-cell--off' : ''}`}
                >
                    <div className="mwc-cell-top">
                        <span className={`mwc-cell-day${isToday ? ' mwc-cell-day--today' : ''}`}>{d}</span>
                        {isOff && <span className="mwc-cell-off-badge">휴무</span>}
                    </div>
                    <div className="mwc-cell-events">
                        {dayReservations.map((res) => (
                            <div
                                key={res.id}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedReservation(res);
                                }}
                                className={`mwc-cell-event ${res.status === '대기 중' ? 'mwc-cell-event--pending' : 'mwc-cell-event--confirmed'}`}
                            >
                                {res.client}
                            </div>
                        ))}
                        {dayBlocks.length > 0 && (
                            <div className="mwc-cell-block">
                                <Slash size={8} /> 불가
                            </div>
                        )}
                    </div>
                </div>
            );
        }

        return (
            <div className="mwc-calendar-grid">
                {['일', '월', '화', '수', '목', '금', '토'].map((day) => (
                    <div key={day} className="mwc-calendar-weekday">
                        {day}
                    </div>
                ))}
                {calendarDays}
            </div>
        );
    };

    return (
        <div className="planner-root">
            <Header
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                userName={userName}
                setUserName={setUserName}
                isLoggedIn={isLoggedIn}
                setIsLoggedIn={setIsLoggedIn}
            />
            <main className="mwc-main">
                {renderDetailModal()}
                <div className="mwc-page-header">
                    <div>
                        <h2 className="mwc-page-title">상담 일정 관리</h2>
                        <p className="mwc-page-subtitle">본인의 휴무와 상담 일정을 통합 관리합니다.</p>
                    </div>
                    <div className="mwc-view-tabs">
                        <button
                            onClick={() => setViewMode('calendar')}
                            className={`mwc-view-tab${viewMode === 'calendar' ? ' mwc-view-tab--active' : ''}`}
                        >
                            <CalendarIcon size={22} />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`mwc-view-tab${viewMode === 'list' ? ' mwc-view-tab--active' : ''}`}
                        >
                            <List size={22} />
                        </button>
                    </div>
                </div>
                <div className="mwc-content">
                    {viewMode === 'calendar' ? (
                        <div className="mwc-calendar-view">
                            <div className="mwc-calendar-toolbar">
                                <div className="mwc-calendar-nav">
                                    <div className="mwc-month-nav-btns">
                                        <button className="mwc-month-nav-btn" onClick={prevMonth}>
                                            <ChevronLeft size={18} />
                                        </button>
                                        <span className="mwc-calendar-month">
                                            {currentDate.getFullYear()}년 {currentDate.getMonth() + 1}월
                                        </span>
                                        <button className="mwc-month-nav-btn" onClick={nextMonth}>
                                            <ChevronRight size={18} />
                                        </button>
                                    </div>
                                </div>
                                <button
                                    onClick={() => {
                                        setSelectedDateDetails(new Date().toISOString().split('T')[0]);
                                        setShowAddReservation(true);
                                    }}
                                    className="mwc-add-btn"
                                >
                                    + 일정 추가
                                </button>
                            </div>
                            <div className="mwc-calendar-wrap">{renderCalendar()}</div>
                        </div>
                    ) : (
                        <div className="mwc-list-view">
                            <div className="mwc-list-toolbar">
                                <div className="mwc-search-wrap">
                                    <Search size={16} className="mwc-search-icon" />
                                    <input type="text" placeholder="내담자 성함 검색" className="mwc-search-input" />
                                </div>
                            </div>
                            <div className="mwc-list-grid">
                                {reservations.map((res) => (
                                    <div
                                        key={res.id}
                                        onClick={() => setSelectedReservation(res)}
                                        className="mwc-list-card"
                                    >
                                        <div className="mwc-list-card-left">
                                            <div className="mwc-list-avatar">
                                                <User size={22} className="text-[#8BA888]" />
                                            </div>
                                            <div>
                                                <div className="mwc-list-name-row">
                                                    <span className="mwc-list-name">{res.client}님</span>
                                                    <span
                                                        className={`mwc-status-badge ${res.status === '확정됨' ? 'mwc-status-badge--confirmed' : 'mwc-status-badge--pending'}`}
                                                    >
                                                        {res.status}
                                                    </span>
                                                </div>
                                                <div className="mwc-list-meta">
                                                    <span className="mwc-list-meta-item">
                                                        <CalendarIcon size={12} /> {res.date}
                                                    </span>
                                                    <span className="mwc-list-meta-item">
                                                        <Clock size={12} /> {res.time}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="mwc-list-card-right">
                                            {res.status === '대기 중' && (
                                                <button
                                                    className="mwc-list-approve-btn"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleApproveReservation(res.id);
                                                    }}
                                                >
                                                    <Check size={12} /> 승인
                                                </button>
                                            )}
                                            <button className="mwc-list-arrow-btn">
                                                <ChevronRight size={18} className="text-[#94A3B8]" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </main>
            <Footer />
            <MobileTap />
        </div>
    );
};

export default CounselorPlanner;
