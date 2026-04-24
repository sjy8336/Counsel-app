import React, { useState } from 'react';
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
  Check,
  ChevronDown,
} from 'lucide-react';
import '../static/CounselorPlanner.css';

const App = () => {
  const [viewMode, setViewMode] = useState('calendar');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [selectedDateDetails, setSelectedDateDetails] = useState(null);
  const [showBlockInput, setShowBlockInput] = useState(false);
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
  for (let i = 9; i < 24; i += 1) {
    const hour = i.toString().padStart(2, '0');
    timeOptions.push(`${hour}:00`);
    timeOptions.push(`${hour}:30`);
  }

  const prevMonth = () =>
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1),
    );

  const nextMonth = () =>
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1),
    );

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const days = new Date(year, month + 1, 0).getDate();
    return { firstDay, days, year, month };
  };

  const handleAddBlock = () => {
    if (startTime && endTime && selectedDateDetails) {
      setBlockedSlots([
        ...blockedSlots,
        {
          date: selectedDateDetails,
          time: `${startTime} - ${endTime}`,
          reason: '개인 일정',
        },
      ]);
      setShowBlockInput(false);
    }
  };

  const getStatusClassName = (status) =>
    status === '확정됨'
      ? 'reservepanel-status-badge reservepanel-status-badge-confirmed'
      : 'reservepanel-status-badge reservepanel-status-badge-pending';

  const getDayCellClassName = (isPast, isOff) => {
    let className = 'reservepanel-calendar-cell';

    if (isPast) {
      className += ' reservepanel-calendar-cell-past';
    } else {
      className += ' reservepanel-calendar-cell-active';
    }

    if (isOff) {
      className += ' reservepanel-calendar-cell-off';
    }

    return className;
  };

  const getDateNumberClassName = (isToday, isPast, isOff) => {
    let className = 'reservepanel-date-number';

    if (isToday) {
      className += ' reservepanel-date-number-today';
    } else if (isPast) {
      className += ' reservepanel-date-number-past';
    } else {
      className += ' reservepanel-date-number-default';
    }

    if (isOff) {
      className += ' reservepanel-date-number-off';
    }

    return className;
  };

  const getReservationChipClassName = (isPast) =>
    isPast
      ? 'reservepanel-reservation-chip reservepanel-reservation-chip-past'
      : 'reservepanel-reservation-chip reservepanel-reservation-chip-active';

  const getOffCardClassName = (isOff, hasReservations) => {
    let className = 'reservepanel-offday-card';

    className += isOff
      ? ' reservepanel-offday-card-active'
      : ' reservepanel-offday-card-default';

    if (hasReservations) {
      className += ' reservepanel-offday-card-disabled';
    }

    return className;
  };

  const getOffIconClassName = (isOff) =>
    isOff
      ? 'reservepanel-offday-icon reservepanel-offday-icon-active'
      : 'reservepanel-offday-icon reservepanel-offday-icon-default';

  const getOffButtonClassName = (isOff, hasReservations) => {
    if (isOff) {
      return 'reservepanel-offday-button reservepanel-offday-button-active';
    }

    if (hasReservations) {
      return 'reservepanel-offday-button reservepanel-offday-button-disabled';
    }

    return 'reservepanel-offday-button reservepanel-offday-button-default';
  };

  const getPickerButtonClassName = (isActive) =>
    isActive
      ? 'reservepanel-picker-trigger reservepanel-picker-trigger-open'
      : 'reservepanel-picker-trigger';

  const getPickerChevronClassName = (isActive) =>
    isActive
      ? 'reservepanel-picker-chevron reservepanel-picker-chevron-open'
      : 'reservepanel-picker-chevron';

  const getPickerOptionClassName = (value, time) =>
    value === time
      ? 'reservepanel-picker-option reservepanel-picker-option-selected'
      : 'reservepanel-picker-option reservepanel-picker-option-default';

  const getViewToggleClassName = (mode) =>
    viewMode === mode
      ? 'reservepanel-view-toggle-button reservepanel-view-toggle-button-active'
      : 'reservepanel-view-toggle-button reservepanel-view-toggle-button-inactive';

  const TimePicker = ({ value, onChange, label, isActive, setIsActive }) => (
    <div className="reservepanel-picker">
      <label className="reservepanel-picker-label">{label}</label>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsActive(!isActive);
        }}
        className={getPickerButtonClassName(isActive)}
      >
        {value}
        <ChevronDown size={14} className={getPickerChevronClassName(isActive)} />
      </button>

      {isActive && (
        <div className="reservepanel-picker-menu reservepanel-no-scrollbar">
          {timeOptions.map((time) => (
            <div
              key={time}
              onClick={() => {
                onChange(time);
                setIsActive(false);
              }}
              className={getPickerOptionClassName(value, time)}
            >
              {time}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderDetailModal = () => {
    if (!selectedReservation && !selectedDateDetails) return null;

    if (selectedReservation) {
      return (
        <div
          className="reservepanel-overlay reservepanel-overlay-front reservepanel-fade-in"
          onClick={() => setSelectedReservation(null)}
        >
          <div
            className="reservepanel-modal reservepanel-modal-compact reservepanel-zoom-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="reservepanel-modal-content">
              <div className="reservepanel-modal-header-row">
                <div className="reservepanel-person-header">
                  <div className="reservepanel-person-avatar reservepanel-person-avatar-large">
                    <User className="reservepanel-icon-main" size={24} />
                  </div>
                  <div>
                    <h3 className="reservepanel-modal-title">
                      {selectedReservation.client}님
                    </h3>
                    <p className="reservepanel-modal-subtitle">
                      {selectedReservation.type}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedReservation(null)}
                  className="reservepanel-close-button"
                >
                  <X size={20} className="reservepanel-icon-muted" />
                </button>
              </div>

              <div className="reservepanel-detail-list">
                <div className="reservepanel-detail-item">
                  <div className="reservepanel-detail-icon-wrap">
                    <CalendarIcon size={18} />
                  </div>
                  <div>
                    <p className="reservepanel-detail-label">날짜 및 시간</p>
                    <p className="reservepanel-detail-value">
                      {selectedReservation.date} | {selectedReservation.time}
                    </p>
                  </div>
                </div>

                <div className="reservepanel-detail-item">
                  <div className="reservepanel-detail-icon-wrap">
                    <Info size={18} />
                  </div>
                  <div>
                    <p className="reservepanel-detail-label">상담 주제</p>
                    <p className="reservepanel-detail-text">
                      {selectedReservation.topic}
                    </p>
                  </div>
                </div>

                <div className="reservepanel-status-row">
                  <div className="reservepanel-status-row-inner">
                    <span className="reservepanel-status-row-label">
                      진행 상태
                    </span>
                    <span className={getStatusClassName(selectedReservation.status)}>
                      {selectedReservation.status}
                    </span>
                  </div>
                </div>
              </div>

              <div className="reservepanel-modal-actions reservepanel-modal-actions-split">
                <button
                  onClick={() => setSelectedReservation(null)}
                  className="reservepanel-secondary-button"
                >
                  닫기
                </button>
                <button className="reservepanel-primary-button">
                  일지 작성
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (selectedDateDetails) {
      const isOff = offDays.includes(selectedDateDetails);
      const dayBlocks = blockedSlots.filter(
        (blockedSlot) => blockedSlot.date === selectedDateDetails,
      );
      const dayReservations = reservations.filter(
        (reservation) => reservation.date === selectedDateDetails,
      );
      const hasReservations = dayReservations.length > 0;

      return (
        <div
          className="reservepanel-overlay reservepanel-overlay-base reservepanel-fade-in"
          onClick={() => {
            setSelectedDateDetails(null);
            setShowBlockInput(false);
            setActivePicker(null);
          }}
        >
          <div
            className="reservepanel-modal reservepanel-modal-scroll reservepanel-zoom-in reservepanel-no-scrollbar"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="reservepanel-modal-content reservepanel-modal-scroll-body reservepanel-no-scrollbar">
              <div className="reservepanel-modal-topline">
                <h3 className="reservepanel-modal-title">
                  {selectedDateDetails} 관리
                </h3>
                <button
                  onClick={() => {
                    setSelectedDateDetails(null);
                    setShowBlockInput(false);
                    setActivePicker(null);
                  }}
                  className="reservepanel-close-button"
                >
                  <X size={20} className="reservepanel-icon-muted" />
                </button>
              </div>

              <div className="reservepanel-section-stack">
                <div className="reservepanel-section-block">
                  <p className="reservepanel-section-title">
                    <User size={16} className="reservepanel-icon-main" />
                    예약된 내담자
                  </p>
                  {hasReservations ? (
                    <div className="reservepanel-card-stack">
                      {dayReservations.map((reservation) => (
                        <div
                          key={reservation.id}
                          className="reservepanel-booked-card"
                        >
                          <span className="reservepanel-booked-name">
                            {reservation.client}님
                          </span>
                          <span className="reservepanel-booked-time">
                            {reservation.time}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="reservepanel-empty-copy">
                      예약된 일정이 없습니다.
                    </p>
                  )}
                </div>

                <div className={getOffCardClassName(isOff, hasReservations)}>
                  <div className="reservepanel-offday-row">
                    <div className="reservepanel-offday-info">
                      <CalendarOff
                        className={getOffIconClassName(isOff)}
                        size={20}
                      />
                      <div>
                        <p className="reservepanel-offday-title">일일 휴무</p>
                        <p className="reservepanel-offday-copy">
                          {hasReservations
                            ? '예약이 있어 휴무 설정 불가'
                            : '전체 휴무 지정'}
                        </p>
                      </div>
                    </div>
                    <button
                      disabled={hasReservations}
                      onClick={() =>
                        isOff
                          ? setOffDays(
                              offDays.filter((day) => day !== selectedDateDetails),
                            )
                          : setOffDays([...offDays, selectedDateDetails])
                      }
                      className={getOffButtonClassName(isOff, hasReservations)}
                    >
                      {isOff ? '취소' : hasReservations ? '예약 있음' : '설정'}
                    </button>
                  </div>
                </div>

                <div className="reservepanel-section-block">
                  <p className="reservepanel-section-title">
                    <Clock size={16} />
                    예약 불가 시간
                  </p>

                  {dayBlocks.length > 0 && (
                    <div className="reservepanel-card-stack">
                      {dayBlocks.map((block, index) => (
                        <div
                          key={`${block.date}-${block.time}-${index}`}
                          className="reservepanel-blocked-row"
                        >
                          <span className="reservepanel-blocked-time">
                            {block.time}
                          </span>
                          <button
                            onClick={() =>
                              setBlockedSlots(
                                blockedSlots.filter(
                                  (blockedSlot) =>
                                    !(
                                      blockedSlot.date === block.date &&
                                      blockedSlot.time === block.time
                                    ),
                                ),
                              )
                            }
                            className="reservepanel-blocked-remove"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {showBlockInput ? (
                    <div className="reservepanel-block-form reservepanel-block-form-animate">
                      <div className="reservepanel-block-form-grid">
                        <TimePicker
                          label="시작 시간"
                          value={startTime}
                          onChange={setStartTime}
                          isActive={activePicker === 'start'}
                          setIsActive={(value) =>
                            setActivePicker(value ? 'start' : null)
                          }
                        />
                        <TimePicker
                          label="종료 시간"
                          value={endTime}
                          onChange={setEndTime}
                          isActive={activePicker === 'end'}
                          setIsActive={(value) =>
                            setActivePicker(value ? 'end' : null)
                          }
                        />
                      </div>
                      <div className="reservepanel-block-actions">
                        <button
                          onClick={handleAddBlock}
                          className="reservepanel-block-add"
                        >
                          <Check size={16} />
                          시간 추가
                        </button>
                        <button
                          onClick={() => {
                            setShowBlockInput(false);
                            setActivePicker(null);
                          }}
                          className="reservepanel-block-cancel"
                        >
                          취소
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowBlockInput(true)}
                      className="reservepanel-block-trigger"
                    >
                      + 시간대 예약 막기
                    </button>
                  )}
                </div>
              </div>

              <div className="reservepanel-modal-footer">
                <button
                  onClick={() => {
                    setSelectedDateDetails(null);
                    setShowBlockInput(false);
                  }}
                  className="reservepanel-primary-button reservepanel-primary-button-full"
                >
                  확인
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  const renderCalendar = () => {
    const { firstDay, days, year, month } = getDaysInMonth(currentDate);
    const calendarDays = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < firstDay; i += 1) {
      calendarDays.push(
        <div key={`empty-${i}`} className="reservepanel-calendar-empty" />,
      );
    }

    for (let d = 1; d <= days; d += 1) {
      const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(
        d,
      ).padStart(2, '0')}`;
      const dayDate = new Date(year, month, d);
      const isPast = dayDate < today;
      const dayReservations = reservations.filter(
        (reservation) => reservation.date === dateString,
      );
      const isOff = offDays.includes(dateString);
      const dayBlocks = blockedSlots.filter(
        (blockedSlot) => blockedSlot.date === dateString,
      );
      const isToday = today.toDateString() === dayDate.toDateString();

      calendarDays.push(
        <div
          key={d}
          onClick={() => !isPast && setSelectedDateDetails(dateString)}
          className={getDayCellClassName(isPast, isOff)}
        >
          <div className="reservepanel-calendar-dayhead">
            <span className={getDateNumberClassName(isToday, isPast, isOff)}>
              {d}
            </span>
            {isOff && <span className="reservepanel-off-badge">휴무</span>}
          </div>
          <div className="reservepanel-calendar-entrylist">
            {dayReservations.slice(0, 2).map((reservation) => (
              <div
                key={reservation.id}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedReservation(reservation);
                }}
                className={getReservationChipClassName(isPast)}
              >
                <span className="reservepanel-reservation-time">
                  {reservation.time.split(' ')[0]}
                </span>
                {reservation.client}
              </div>
            ))}

            {dayBlocks.length > 0 && (
              <div className="reservepanel-blocked-chip">
                <Slash size={8} />
                <span className="reservepanel-blocked-chip-time">
                  {dayBlocks[0].time}
                </span>
                불가
              </div>
            )}
          </div>
        </div>,
      );
    }

    return (
      <div className="reservepanel-calendar-grid-wrap">
        {['일', '월', '화', '수', '목', '금', '토'].map((day) => (
          <div key={day} className="reservepanel-calendar-weekday">
            {day}
          </div>
        ))}
        {calendarDays}
      </div>
    );
  };

  const renderList = () => (
    <div className="reservepanel-list-grid">
      {reservations.map((reservation) => (
        <div
          key={reservation.id}
          onClick={() => setSelectedReservation(reservation)}
          className="reservepanel-list-card"
        >
          <div className="reservepanel-list-card-main">
            <div className="reservepanel-person-avatar reservepanel-person-avatar-card">
              <User className="reservepanel-icon-main" size={20} />
            </div>
            <div>
              <div className="reservepanel-list-card-head">
                <h3 className="reservepanel-list-card-title">
                  {reservation.client}님
                </h3>
                <div className="reservepanel-list-type-badge">상담</div>
              </div>
              <div className="reservepanel-list-meta">
                <span className="reservepanel-list-meta-item">
                  <CalendarIcon size={12} /> {reservation.date}
                </span>
                <span className="reservepanel-list-meta-item">
                  <Clock size={12} /> {reservation.time}
                </span>
              </div>
            </div>
          </div>
          <button className="reservepanel-list-arrow">
            <ChevronRight className="reservepanel-icon-muted" size={18} />
          </button>
        </div>
      ))}
    </div>
  );

  return (
    <div className="reservepanel-shell reservepanel-no-scrollbar">
      {renderDetailModal()}

      <header className="reservepanel-header">
        <div className="reservepanel-header-inner">
          <div className="reservepanel-brand-row">
            <h1 className="reservepanel-brand">MINDWELL</h1>
            <nav className="reservepanel-nav">
              <a href="#" className="reservepanel-nav-link">
                전문가 찾기
              </a>
              <a
                href="#"
                className="reservepanel-nav-link reservepanel-nav-link-active"
              >
                예약 관리
              </a>
              <a href="#" className="reservepanel-nav-link">
                AI 일기
              </a>
            </nav>
          </div>

          <div className="reservepanel-header-actions">
            <button className="reservepanel-mobile-menu">
              <Menu size={20} />
            </button>
            <button className="reservepanel-bell-button">
              <Bell size={22} />
              <span className="reservepanel-bell-dot" />
            </button>
            <div className="reservepanel-user-badge">
              <User className="reservepanel-icon-main" size={18} />
            </div>
          </div>
        </div>
      </header>

      <main className="reservepanel-main reservepanel-no-scrollbar">
        <div className="reservepanel-hero">
          <div>
            <h2 className="reservepanel-hero-title">상담 일정 관리</h2>
            <p className="reservepanel-hero-copy">
              본인의 휴무와 상담 일정을 통합 관리합니다.
            </p>
          </div>
          <div className="reservepanel-view-toggle">
            <button
              onClick={() => setViewMode('calendar')}
              className={getViewToggleClassName('calendar')}
            >
              <CalendarIcon size={22} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={getViewToggleClassName('list')}
            >
              <List size={22} />
            </button>
          </div>
        </div>

        <div className="reservepanel-body">
          {viewMode === 'calendar' ? (
            <div className="reservepanel-calendar-view reservepanel-fade-panel">
              <div className="reservepanel-toolbar">
                <div className="reservepanel-toolbar-main">
                  <h3 className="reservepanel-month-title">
                    {currentDate.getFullYear()}년 {currentDate.getMonth() + 1}월
                  </h3>
                  <div className="reservepanel-month-nav">
                    <button
                      onClick={prevMonth}
                      className="reservepanel-month-nav-button"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <button
                      onClick={nextMonth}
                      className="reservepanel-month-nav-button"
                    >
                      <ChevronRight size={20} />
                    </button>
                  </div>
                </div>

                <div className="reservepanel-toolbar-side">
                  <div className="reservepanel-legend">
                    <div className="reservepanel-legend-item">
                      <span className="reservepanel-legend-dot reservepanel-legend-dot-main" />
                      상담
                    </div>
                    <div className="reservepanel-legend-item">
                      <span className="reservepanel-legend-dot reservepanel-legend-dot-off" />
                      휴무
                    </div>
                  </div>
                  <button className="reservepanel-add-button">+ 추가</button>
                </div>
              </div>

              <div className="reservepanel-calendar-area">{renderCalendar()}</div>
            </div>
          ) : (
            <div className="reservepanel-list-view reservepanel-slide-panel">
              <div className="reservepanel-search-row">
                <div className="reservepanel-searchbox">
                  <Search className="reservepanel-search-icon" size={16} />
                  <input
                    type="text"
                    placeholder="내담자 성함 검색"
                    className="reservepanel-search-input"
                  />
                </div>
              </div>
              {renderList()}
            </div>
          )}
        </div>
      </main>

      <footer className="reservepanel-footer">
        <div className="reservepanel-footer-inner">
          <h2 className="reservepanel-footer-brand">MINDWELL</h2>
          <p className="reservepanel-footer-copy">
            © 2026 MINDWELL LAB. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
