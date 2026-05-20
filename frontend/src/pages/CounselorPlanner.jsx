import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { confirmBooking } from '../api/bookingConfirm';
import { getCounselorBookings } from '../api/bookingCounselor';
import Header from '../components/header';
import Footer from '../components/footer';
import MobileTap from '../components/mobileTap';
import { getHolidays, addHoliday, removeHoliday } from '../api/holiday';
import { getScheduleCalendar, addSchedule } from '../api/schedule';
import { getBlockedSlots, addBlockedSlot, deleteBlockedSlot } from '../api/blockedSlot';
import {
    Calendar as CalendarIcon,
    List,
    ChevronLeft,
    ChevronRight,
    User,
    Clock,
    Search,
    X,
    Info,
    CalendarOff,
    Slash,
    Plus,
    Check,
    ChevronDown,
    Trash2,
    CalendarDays,
} from 'lucide-react';
import '../static/CounselorPlanner.css';

// ── 상수 ─────────────────────────────────────────────────
const STATUS_MAP = {
    waiting: '대기 중',
    confirmed: '확정됨',
    completed: '상담 완료',
    canceled: '내담자 취소',
    rejected: '승인 거절',
};
const CALENDAR_VISIBLE = new Set(['대기 중', '확정됨']);
const CAN_LOG = new Set(['확정됨', '상담 완료']);
const DAYS = ['일', '월', '화', '수', '목', '금', '토'];
const TIME_OPTIONS = Array.from({ length: 30 }, (_, i) => {
    const h = String(9 + Math.floor(i / 2)).padStart(2, '0');
    return `${h}:${i % 2 === 0 ? '00' : '30'}`;
});

const mapBooking = (b) => ({
    id: b.id,
    client: b.client_name || b.client || '',
    date: b.date || b.booking_date,
    time: b.time || b.booking_time,
    type: '상담',
    status: b.status || STATUS_MAP[b.booking_status] || '취소됨',
    location: b.location || b.center_name || '',
    topic: b.survey_content?.reason || b.survey_content?.topic || b.topic || '',
    order_id: b.order_id,
});

const toDateStr = (y, m, d) => `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

// ── 서브 컴포넌트 ─────────────────────────────────────────
const TimePicker = ({ value, onChange, label, isActive, setIsActive }) => (
    <div className="mwc-timepicker-wrap">
        <label className="mwc-timepicker-label">{label}</label>
        <button
            type="button"
            className="mwc-timepicker-btn"
            onClick={(e) => {
                e.stopPropagation();
                setIsActive(!isActive);
            }}
        >
            {value}
            <ChevronDown
                size={14}
                className={`mwc-timepicker-chevron${isActive ? ' mwc-timepicker-chevron--open' : ''}`}
            />
        </button>
        {isActive && (
            <div className="mwc-timepicker-dropdown">
                {TIME_OPTIONS.map((t) => (
                    <div
                        key={t}
                        className={`mwc-timepicker-option${value === t ? ' mwc-timepicker-option--selected' : ''}`}
                        onClick={() => {
                            onChange(t);
                            setIsActive(false);
                        }}
                    >
                        {t}
                    </div>
                ))}
            </div>
        )}
    </div>
);

// ── 메인 ─────────────────────────────────────────────────
// userId prop을 명확히 추가
const CounselorPlanner = ({ userId, userName, setUserName, isLoggedIn, setIsLoggedIn }) => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = React.useState('reservation');
    const [viewMode, setViewMode] = useState('calendar');
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedReservation, setSelectedReservation] = useState(null);
    const [selectedDateDetails, setSelectedDateDetails] = useState(null);
    const [showBlockInput, setShowBlockInput] = useState(false);
    const [showAddReservation, setShowAddReservation] = useState(false);
    const [newClientName, setNewClientName] = useState('');
    const [manualDate, setManualDate] = useState('');
    const [addStart, setAddStart] = useState('09:00');
    const [addEnd, setAddEnd] = useState('10:00');
    const [addPicker, setAddPicker] = useState(null);
    const [blkStart, setBlkStart] = useState('09:00');
    const [blkEnd, setBlkEnd] = useState('10:00');
    const [blkPicker, setBlkPicker] = useState(null);
    const [reservations, setReservations] = useState([]);
    const [offDays, setOffDays] = useState([]); // 예외 휴무일
    const [schedule, setSchedule] = useState([]); // 요일별 근무시간
    const [blockedSlots, setBlockedSlots] = useState([]);
    const [offWeekdays, setOffWeekdays] = useState([]); // 설정된 휴무 요일

    // ── 데이터 ───────────────────────────────────────────
    const fetchBookings = async () => {
        try {
            setReservations((await getCounselorBookings()).map(mapBooking));
        } catch {}
    };
    const fetchScheduleAndHolidays = async () => {
        try {
            const id = userId || 1;
            const data = await getScheduleCalendar(id);
            setOffDays(Array.isArray(data.holidays) ? data.holidays : []);
            setSchedule(Array.isArray(data.schedules) ? data.schedules : []);
            setOffWeekdays(Array.isArray(data.off_weekdays) ? data.off_weekdays : []);
        } catch {
            setOffDays([]);
            setSchedule([]);
            setOffWeekdays([]);
        }
    };
    // 예약불가시간 불러오기
    const fetchBlockedSlots = async () => {
        try {
            const data = await getBlockedSlots(userId);
            setBlockedSlots(
                data.map((b) => ({
                    id: b.id,
                    date: b.date,
                    start_time: b.start_time,
                    end_time: b.end_time,
                    reason: b.reason,
                }))
            );
        } catch {
            setBlockedSlots([]);
        }
    };
    useEffect(() => {
        fetchBookings();
        fetchScheduleAndHolidays();
        fetchBlockedSlots();
    }, []);

    // ── 날짜 유틸 ─────────────────────────────────────────
    const changeMonth = (delta) => setCurrentDate((d) => new Date(d.getFullYear(), d.getMonth() + delta, 1));

    const getDaysInMonth = (d) => ({
        firstDay: new Date(d.getFullYear(), d.getMonth(), 1).getDay(),
        days: new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate(),
        year: d.getFullYear(),
        month: d.getMonth(),
    });

    // ── 상태 변경 헬퍼 ────────────────────────────────────
    const updateStatus = (id, status) => {
        setReservations((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
        if (selectedReservation?.id === id) setSelectedReservation((p) => ({ ...p, status }));
    };

    // ── 핸들러 ───────────────────────────────────────────
    const handleGoToClient = (client) =>
        navigate('/CounselorClient', {
            state: { selectedClientName: client, clientReservations: reservations.filter((r) => r.client === client) },
        });

    const handleAddReservation = () => {
        if (!newClientName || !manualDate) {
            alert('상담 날짜와 내담자 성함을 모두 입력해 주세요.');
            return;
        }
        setReservations((prev) => [
            ...prev,
            {
                id: Date.now(),
                client: newClientName,
                date: manualDate,
                time: `${addStart} - ${addEnd}`,
                type: '상담',
                status: '확정됨',
                location: '지정되지 않음',
                topic: '직접 추가된 일정입니다.',
            },
        ]);
        setNewClientName('');
        setShowAddReservation(false);
        setAddStart('09:00');
        setAddEnd('10:00');
    };

    const handleApprove = async (id) => {
        const res = reservations.find((r) => r.id === id);
        if (!res?.order_id) {
            alert('예약 정보에 order_id가 없습니다.');
            return;
        }
        try {
            await confirmBooking(res.order_id);
            await fetchBookings();
            updateStatus(id, '확정됨');
            alert('예약이 확정되었습니다.');
        } catch {
            alert('예약 확정에 실패했습니다.');
        }
    };

    const handleReject = (id) => updateStatus(id, '승인 거절');
    const handleCancel = (id) => updateStatus(id, '승인 거절');

    const handleAddBlock = async () => {
        if (!blkStart || !blkEnd || !selectedDateDetails) return;
        try {
            const newBlock = await addBlockedSlot({
                user_id: userId,
                date: selectedDateDetails,
                start_time: blkStart,
                end_time: blkEnd,
                reason: '개인 일정',
            });
            setBlockedSlots((prev) => [...prev, newBlock]);
            setShowBlockInput(false);
            setBlkStart('09:00');
            setBlkEnd('10:00');
        } catch {
            alert('예약 불가 시간 등록에 실패했습니다.');
        }
    };

    const closeDate = () => {
        setSelectedDateDetails(null);
        setShowBlockInput(false);
        setShowAddReservation(false);
    };

    // ── 예약 상세 모달 ────────────────────────────────────
    const ReservationModal = ({ res }) => {
        const isPending = res.status === '대기 중';
        const isConfirmed = res.status === '확정됨';
        const isCompleted = res.status === '상담 완료';
        const statusBadge = isConfirmed ? ' mwc-res-status-badge--confirmed' : ' mwc-res-status-badge--pending';

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
                                    <h3 className="mwc-res-name">{res.client}님</h3>
                                    <p className="mwc-res-type">{res.type}</p>
                                </div>
                            </div>
                            <button className="mwc-modal-close-btn" onClick={() => setSelectedReservation(null)}>
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
                                        {res.date} | {res.time}
                                    </p>
                                </div>
                            </div>
                            <div className="mwc-res-detail-row">
                                <div className="mwc-res-detail-icon">
                                    <Info size={18} />
                                </div>
                                <div>
                                    <p className="mwc-res-detail-label">상담 주제</p>
                                    <p className="mwc-res-detail-value">{res.topic}</p>
                                </div>
                            </div>
                            <div className="mwc-res-status-row">
                                <span className="mwc-res-status-label">진행 상태</span>
                                <span className={`mwc-res-status-badge${statusBadge}`}>{res.status}</span>
                            </div>
                        </div>

                        <div className="mwc-res-actions">
                            {isPending && (
                                <div className="mwc-res-action-grid">
                                    <button className="mwc-reject-btn" onClick={() => handleReject(res.id)}>
                                        거절하기
                                    </button>
                                    <button className="mwc-approve-btn" onClick={() => handleApprove(res.id)}>
                                        <Check size={18} /> 승인하기
                                    </button>
                                </div>
                            )}
                            {(isConfirmed || isCompleted) && (
                                <button
                                    className="mwc-journal-btn"
                                    style={{ width: '100%' }}
                                    onClick={() => handleGoToClient(res.client)}
                                >
                                    일지 작성
                                </button>
                            )}
                            {isConfirmed && (
                                <button
                                    className="mwc-reject-btn"
                                    style={{ width: '100%' }}
                                    onClick={() => handleCancel(res.id)}
                                >
                                    승인 취소
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // ── 날짜 관리 모달 ────────────────────────────────────

    const DateModal = () => {
        const dayOfWeekKor = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'][
            new Date(selectedDateDetails).getDay()
        ];
        const isHoliday = offDays.includes(selectedDateDetails); // 예외휴무(holiday)
        const isWeekdayOff = offWeekdays.includes(dayOfWeekKor); // 설정휴무(요일휴무)
        const isOff = isHoliday || isWeekdayOff;
        const dayBlocks = blockedSlots.filter((b) => b.date === selectedDateDetails);
        const dayReservations = reservations.filter(
            (r) => r.date === selectedDateDetails && CALENDAR_VISIBLE.has(r.status)
        );
        const hasRes = dayReservations.length > 0;

        // 근무일로 변경(스케줄 추가) UI 상태
        const [showAddSchedule, setShowAddSchedule] = useState(false);
        const [workStart, setWorkStart] = useState('09:00');
        const [workEnd, setWorkEnd] = useState('18:00');
        const [workPicker, setWorkPicker] = useState(null);

        return (
            <div className="mwc-modal-overlay mwc-modal-overlay--date" onClick={closeDate}>
                <div className="mwc-modal-box mwc-modal-box--date" onClick={(e) => e.stopPropagation()}>
                    <div className="mwc-modal-body--scroll">
                        {/* 헤더 */}
                        <div className="mwc-date-modal-header">
                            <h3 className="mwc-date-modal-title">{selectedDateDetails} 관리</h3>
                            <button className="mwc-modal-close-btn" onClick={closeDate}>
                                <X size={20} className="text-[#94A3B8]" />
                            </button>
                        </div>

                        <div className="mwc-date-modal-sections">
                            {/* 일정 추가 */}
                            {showAddReservation ? (
                                <div className="mwc-add-res-panel">
                                    <p className="mwc-add-res-panel-title">직접 일정 추가</p>
                                    <div>
                                        <label className="mwc-field-label">상담 날짜</label>
                                        <div className="mwc-input-wrap">
                                            <CalendarDays className="mwc-input-icon" size={16} />
                                            <input
                                                type="date"
                                                value={manualDate}
                                                onChange={(e) => setManualDate(e.target.value)}
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
                                            value={addStart}
                                            onChange={setAddStart}
                                            isActive={addPicker === 'start'}
                                            setIsActive={(v) => setAddPicker(v ? 'start' : null)}
                                        />
                                        <TimePicker
                                            label="종료 시간"
                                            value={addEnd}
                                            onChange={setAddEnd}
                                            isActive={addPicker === 'end'}
                                            setIsActive={(v) => setAddPicker(v ? 'end' : null)}
                                        />
                                    </div>
                                    <div className="mwc-add-res-actions">
                                        <button className="mwc-submit-btn" onClick={handleAddReservation}>
                                            <Check size={16} /> 추가 완료
                                        </button>
                                        <button className="mwc-cancel-btn" onClick={() => setShowAddReservation(false)}>
                                            취소
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <button
                                    className="mwc-add-schedule-btn"
                                    onClick={() => {
                                        setManualDate(selectedDateDetails);
                                        setShowAddReservation(true);
                                    }}
                                >
                                    <Plus size={18} /> 새 상담 일정 추가
                                </button>
                            )}

                            {/* 예약 현황 */}
                            <div>
                                <p className="mwc-section-title">
                                    <User size={16} className="text-[#8BA888]" /> 내담자 예약 현황
                                </p>
                                {hasRes ? (
                                    <div className="mwc-reservation-list">
                                        {dayReservations.map((res) => (
                                            <div
                                                key={res.id}
                                                className="mwc-reservation-item"
                                                onClick={() => setSelectedReservation(res)}
                                            >
                                                <div>
                                                    <span className="mwc-reservation-item-name">{res.client}님</span>
                                                    <span className="mwc-reservation-item-time">{res.time}</span>
                                                </div>
                                                <div className="mwc-reservation-item-btns">
                                                    <button
                                                        className="mwc-item-delete-btn"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleReject(res.id);
                                                        }}
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

                            {/* 휴무 설정 */}
                            <div
                                className={`mwc-off-box${isOff ? ' mwc-off-box--active' : ' mwc-off-box--normal'}${hasRes ? ' mwc-off-box--disabled' : ''}`}
                            >
                                <div className="mwc-off-box-inner">
                                    <div className="mwc-off-box-row">
                                        <div className="mwc-off-box-left">
                                            <CalendarOff
                                                className={isOff ? 'text-[#FDA4AF]' : 'text-[#94A3B8]'}
                                                size={20}
                                            />
                                            <div>
                                                <p className="mwc-off-box-label">일일 휴무</p>
                                                <p className="mwc-off-box-sub">
                                                    {hasRes
                                                        ? '예약이 있어 휴무 설정 불가'
                                                        : isWeekdayOff
                                                          ? '설정된 요일 휴무'
                                                          : '전체 휴무 지정'}
                                                </p>
                                            </div>
                                        </div>
                                        {/* 근무일로 변경 버튼을 요일휴무 옆에 가로정렬 */}
                                        {isWeekdayOff && !showAddSchedule && (
                                            <button
                                                className={`mwc-off-toggle-btn mwc-off-toggle-btn--active`}
                                                onClick={() => setShowAddSchedule(true)}
                                            >
                                                근무일로 변경
                                            </button>
                                        )}
                                        {/* 휴무지정 버튼: 예외휴무/요일휴무가 아닌 경우만 노출 */}
                                        {!isHoliday && !isWeekdayOff && !hasRes && (
                                            <button
                                                className={`mwc-off-toggle-btn mwc-off-toggle-btn--normal`}
                                                onClick={async () => {
                                                    // 예외휴무 지정
                                                    await addHoliday(selectedDateDetails, userId);
                                                    setOffDays((prev) => [...prev, selectedDateDetails]);
                                                }}
                                            >
                                                휴무 지정
                                            </button>
                                        )}
                                        {isHoliday && (
                                            <button
                                                disabled={hasRes}
                                                className={`mwc-off-toggle-btn mwc-off-toggle-btn--active`}
                                                onClick={async () => {
                                                    // 예외휴무 해제
                                                    await removeHoliday(selectedDateDetails, userId);
                                                    setOffDays((prev) => prev.filter((d) => d !== selectedDateDetails));
                                                }}
                                            >
                                                휴무 취소
                                            </button>
                                        )}
                                    </div>
                                    {/* 근무일로 변경 패널은 버튼 아래에만 노출 */}
                                    {isWeekdayOff && showAddSchedule && (
                                        <div className="mwc-add-schedule-panel">
                                            <div className="mwc-time-row">
                                                <TimePicker
                                                    label="시작 시간"
                                                    value={workStart}
                                                    onChange={setWorkStart}
                                                    isActive={workPicker === 'start'}
                                                    setIsActive={(v) => setWorkPicker(v ? 'start' : null)}
                                                />
                                                <TimePicker
                                                    label="종료 시간"
                                                    value={workEnd}
                                                    onChange={setWorkEnd}
                                                    isActive={workPicker === 'end'}
                                                    setIsActive={(v) => setWorkPicker(v ? 'end' : null)}
                                                />
                                            </div>
                                            <div className="mwc-add-res-actions">
                                                <button
                                                    className="mwc-submit-btn"
                                                    onClick={() => {
                                                        // 스케줄 추가 API 연동
                                                        addSchedule({
                                                            user_id: userId,
                                                            day_of_week: dayOfWeekKor,
                                                            start_time: workStart,
                                                            end_time: workEnd,
                                                        })
                                                            .then(() => {
                                                                alert(
                                                                    `근무일로 등록: ${dayOfWeekKor} ${workStart}~${workEnd}`
                                                                );
                                                                setShowAddSchedule(false);
                                                                fetchScheduleAndHolidays();
                                                            })
                                                            .catch((err) => {
                                                                alert('근무일 등록에 실패했습니다.');
                                                            });
                                                    }}
                                                >
                                                    <Check size={16} /> 근무일로 등록
                                                </button>
                                                <button
                                                    className="mwc-cancel-btn"
                                                    onClick={() => setShowAddSchedule(false)}
                                                >
                                                    취소
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* 예약 불가 시간 */}
                            <div>
                                <p className="mwc-section-title">
                                    <Clock size={16} /> 예약 불가 시간
                                </p>
                                {dayBlocks.length > 0 && (
                                    <div className="mwc-block-list">
                                        {dayBlocks.map((block) => (
                                            <div key={block.id} className="mwc-block-item">
                                                <span className="mwc-block-item-time">
                                                    {block.start_time} - {block.end_time}
                                                </span>
                                                <button
                                                    className="mwc-block-remove-btn"
                                                    onClick={async () => {
                                                        try {
                                                            await deleteBlockedSlot(block.id);
                                                            setBlockedSlots((prev) =>
                                                                prev.filter((b) => b.id !== block.id)
                                                            );
                                                        } catch {
                                                            alert('삭제 실패');
                                                        }
                                                    }}
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
                                                value={blkStart}
                                                onChange={setBlkStart}
                                                isActive={blkPicker === 'start'}
                                                setIsActive={(v) => setBlkPicker(v ? 'start' : null)}
                                            />
                                            <TimePicker
                                                label="종료"
                                                value={blkEnd}
                                                onChange={setBlkEnd}
                                                isActive={blkPicker === 'end'}
                                                setIsActive={(v) => setBlkPicker(v ? 'end' : null)}
                                            />
                                        </div>
                                        <div className="mwc-block-actions">
                                            <button className="mwc-block-submit-btn" onClick={handleAddBlock}>
                                                불가 시간 등록
                                            </button>
                                            <button className="mwc-cancel-btn" onClick={() => setShowBlockInput(false)}>
                                                취소
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <button className="mwc-add-block-btn" onClick={() => setShowBlockInput(true)}>
                                        + 시간대 예약 막기
                                    </button>
                                )}
                            </div>
                        </div>

                        <button className="mwc-modal-confirm-btn" onClick={() => setSelectedDateDetails(null)}>
                            확인
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    // ── 캘린더 렌더 ──────────────────────────────────────
    const renderCalendar = () => {
        const { firstDay, days, year, month } = getDaysInMonth(currentDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const empties = Array.from({ length: firstDay }, (_, i) => (
            <div key={`e${i}`} className="mwc-calendar-cell-empty" />
        ));

        const dayCells = Array.from({ length: days }, (_, i) => {
            const d = i + 1;
            const dateStr = toDateStr(year, month, d);
            const dayRes = reservations.filter((r) => r.date === dateStr && CALENDAR_VISIBLE.has(r.status));
            const dayBlks = blockedSlots.filter((b) => b.date === dateStr);
            const isOff = offDays.includes(dateStr); // 예외 휴무(날짜 기준)
            const isToday = today.toDateString() === new Date(year, month, d).toDateString();
            const isPast = new Date(year, month, d) < today;
            // 요일별 스케줄 체크
            const dayOfWeekIdx = new Date(year, month, d).getDay();
            const dayOfWeekKor = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'][dayOfWeekIdx];
            const hasSchedule = schedule.some((s) => s.day_of_week === dayOfWeekKor);
            const isWeekdayOff = offWeekdays.includes(dayOfWeekKor);

            // 실제 예외휴무(holiday)는 날짜 기준, 설정 휴무는 요일 기준(스케줄 없는 요일)
            // 날짜가 예외휴무면 무조건 휴무, 아니고 요일이 설정휴무면 '설정휴무'만 표시
            const isDisabled = isPast;

            return (
                <div
                    key={d}
                    className={`mwc-calendar-cell${isOff ? ' mwc-calendar-cell--off' : ''}${isWeekdayOff ? ' mwc-calendar-cell--weekdayoff' : ''}${!hasSchedule ? ' mwc-calendar-cell--noschedule' : ''}${isDisabled ? ' mwc-calendar-cell--disabled' : ''}`}
                    style={isDisabled ? { pointerEvents: 'none', opacity: 0.4, cursor: 'not-allowed' } : {}}
                    onClick={() => {
                        if (isDisabled) return;
                        setSelectedDateDetails(dateStr);
                        setManualDate(dateStr);
                    }}
                >
                    <div className="mwc-cell-top">
                        <span className={`mwc-cell-day${isToday ? ' mwc-cell-day--today' : ''}`}>{d}</span>
                        {/* 예외휴무(holiday)는 날짜 기준, 설정휴무는 요일 기준 */}
                        {(isOff || isWeekdayOff) && <span className="mwc-cell-off-badge">휴무</span>}
                    </div>
                    <div className="mwc-cell-events">
                        {dayRes.map((res) => (
                            <div
                                key={res.id}
                                className={`mwc-cell-event ${res.status === '대기 중' ? 'mwc-cell-event--pending' : 'mwc-cell-event--confirmed'}`}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedReservation(res);
                                }}
                            >
                                {res.client}
                            </div>
                        ))}
                        {dayBlks.length > 0 && (
                            <div className="mwc-cell-block">
                                <Slash size={8} /> 불가
                            </div>
                        )}
                    </div>
                </div>
            );
        });

        return (
            <div className="mwc-calendar-grid">
                {DAYS.map((d) => (
                    <div key={d} className="mwc-calendar-weekday">
                        {d}
                    </div>
                ))}
                {empties}
                {dayCells}
            </div>
        );
    };

    // ── 리스트 뷰 ─────────────────────────────────────────
    const renderList = () => (
        <div className="mwc-list-view">
            <div className="mwc-list-toolbar">
                <div className="mwc-search-wrap">
                    <Search size={16} className="mwc-search-icon" />
                    <input type="text" placeholder="내담자 성함 검색" className="mwc-search-input" />
                </div>
            </div>
            <div className="mwc-list-grid">
                {reservations.map((res) => {
                    const isPending = res.status === '대기 중';
                    const isConfirmed = res.status === '확정됨';
                    const badgeClass = isConfirmed
                        ? 'mwc-status-badge--confirmed'
                        : isPending
                          ? 'mwc-status-badge--pending'
                          : 'mwc-status-badge--canceled';
                    return (
                        <div key={res.id} className="mwc-list-card" onClick={() => setSelectedReservation(res)}>
                            <div className="mwc-list-card-left">
                                <div className="mwc-list-avatar">
                                    <User size={22} className="text-[#8BA888]" />
                                </div>
                                <div>
                                    <div className="mwc-list-name-row">
                                        <span className="mwc-list-name">{res.client}님</span>
                                        <span className={`mwc-status-badge ${badgeClass}`}>{res.status}</span>
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
                                {isPending && (
                                    <>
                                        <button
                                            className="mwc-list-reject-btn"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleReject(res.id);
                                            }}
                                        >
                                            거절
                                        </button>
                                        <button
                                            className="mwc-list-approve-btn"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleApprove(res.id);
                                            }}
                                        >
                                            <Check size={12} /> 승인
                                        </button>
                                    </>
                                )}
                                {isConfirmed && (
                                    <button
                                        className="mwc-list-reject-btn"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleCancel(res.id);
                                        }}
                                    >
                                        승인 취소
                                    </button>
                                )}
                                <button className="mwc-list-arrow-btn">
                                    <ChevronRight size={18} className="text-[#94A3B8]" />
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );

    // ── 렌더 ─────────────────────────────────────────────
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
                {selectedReservation && <ReservationModal res={selectedReservation} />}
                {selectedDateDetails && <DateModal />}

                <div className="mwc-page-header">
                    <div>
                        <h2 className="mwc-page-title">상담 일정 관리</h2>
                        <p className="mwc-page-subtitle">본인의 휴무와 상담 일정을 통합 관리합니다.</p>
                    </div>
                    <div className="mwc-view-tabs">
                        {[
                            ['calendar', <CalendarIcon size={22} />],
                            ['list', <List size={22} />],
                        ].map(([mode, icon]) => (
                            <button
                                key={mode}
                                onClick={() => setViewMode(mode)}
                                className={`mwc-view-tab${viewMode === mode ? ' mwc-view-tab--active' : ''}`}
                            >
                                {icon}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="mwc-content">
                    {viewMode === 'calendar' ? (
                        <div className="mwc-calendar-view">
                            <div className="mwc-calendar-toolbar">
                                <div className="mwc-calendar-nav">
                                    <div className="mwc-month-nav-btns">
                                        <button className="mwc-month-nav-btn" onClick={() => changeMonth(-1)}>
                                            <ChevronLeft size={18} />
                                        </button>
                                        <span className="mwc-calendar-month">
                                            {currentDate.getFullYear()}년 {currentDate.getMonth() + 1}월
                                        </span>
                                        <button className="mwc-month-nav-btn" onClick={() => changeMonth(1)}>
                                            <ChevronRight size={18} />
                                        </button>
                                    </div>
                                </div>
                                <button
                                    className="mwc-add-btn"
                                    onClick={() => {
                                        setSelectedDateDetails(new Date().toISOString().split('T')[0]);
                                        setShowAddReservation(true);
                                    }}
                                >
                                    + 일정 추가
                                </button>
                            </div>
                            <div className="mwc-calendar-wrap">{renderCalendar()}</div>
                        </div>
                    ) : (
                        renderList()
                    )}
                </div>
            </main>

            <Footer />
            <MobileTap />
        </div>
    );
};

export default CounselorPlanner;
