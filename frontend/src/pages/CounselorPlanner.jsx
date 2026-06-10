import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { confirmBooking } from '../api/bookingConfirm';
import { rejectBooking } from '../api/bookingReject';
import { getCounselorBookings, deleteCanceledBooking } from '../api/bookingCounselor';
import { createBooking } from '../api/booking';
import Header from '../components/header';
import Footer from '../components/footer';
import MobileTap from '../components/mobileTap';
import { getHolidays, addHoliday, removeHoliday } from '../api/holiday';
import { getScheduleCalendar, addSchedule } from '../api/schedule';
import { getBlockedSlots, addBlockedSlot, deleteBlockedSlot } from '../api/blockedSlot';
import { resolveImageUrl } from '../api/axiosInstance';
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
    AlertCircle,
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
const CANCELED_STATUSES = new Set(['취소됨', '승인 거절', '내담자 취소', '예약 취소']);
const DELETABLE_STATUSES = new Set(['상담 완료', '취소됨', '승인 거절', '내담자 취소', '예약 취소']);
const CALENDAR_VISIBLE = new Set(['대기 중', '확정됨']);
const DAYS = ['일', '월', '화', '수', '목', '금', '토'];
const KOR_DAYS = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
const TIME_OPTIONS = Array.from({ length: 30 }, (_, i) => {
    const h = String(9 + Math.floor(i / 2)).padStart(2, '0');
    return `${h}:${i % 2 === 0 ? '00' : '30'}`;
});

// ── 유틸 ─────────────────────────────────────────────────
const timeToMinutes = (t) => {
    const [h, m] = t.split(':');
    return parseInt(h, 10) * 60 + parseInt(m, 10);
};

const toDateStr = (y, m, d) => `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

const mapBooking = (b) => {
    let client = '';
    if (b.client_name) {
        client = b.client_name;
    } else if (b.client) {
        client = typeof b.client === 'string' ? b.client : b.client?.client_name || '';
    }
    const dateStr = b.date || b.booking_date;
    const timeStr = b.time || b.booking_time;
    const status = b.status || STATUS_MAP[b.booking_status] || '취소됨';
    return {
        id: b.id,
        client,
        date: dateStr,
        time: timeStr,
        type: '상담',
        status,
        location: b.location || b.center_name || '',
        topic: b.survey_content?.reason || b.survey_content?.topic || b.topic || '',
        order_id: b.order_id,
        client_profile_img_url: b.client_profile_img_url || '',
    };
};

// ── TimePicker ───────────────────────────────────────────
const TimePicker = ({ value, onChange, label, isActive, setIsActive, options }) => (
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
                {(options || TIME_OPTIONS).map((t) => (
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

// ── Toast ─────────────────────────────────────────────────
const Toast = ({ msg }) => (
    <div className="mwc-toast">
        <Check size={14} /> {msg}
    </div>
);

// ── ConfirmModal ──────────────────────────────────────────
const ConfirmModal = ({ title, desc, onConfirm, onCancel }) => (
    <div className="mwc-modal-overlay mwc-modal-overlay--confirm" onClick={onCancel}>
        <div className="mwc-confirm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="mwc-confirm-icon">
                <AlertCircle size={28} />
            </div>
            <h3 className="mwc-confirm-title">{title}</h3>
            <p className="mwc-confirm-desc">{desc}</p>
            <div className="mwc-confirm-btns">
                <button className="mwc-cancel-btn" onClick={onCancel}>
                    취소
                </button>
                <button className="mwc-reject-btn mwc-confirm-ok-btn" onClick={onConfirm}>
                    확인
                </button>
            </div>
        </div>
    </div>
);

// ── DateModal ─────────────────────────────────────────────
const DateModal = ({
    selectedDateDetails,
    offDays,
    offWeekdays,
    blockedSlots,
    reservations,
    userId,
    setOffDays,
    setBlockedSlots,
    onClose,
    onSelectReservation,
    onReject,
    onAddReservationDone,
    fetchScheduleAndHolidays,
    showToast,
}) => {
    const korDay = KOR_DAYS[new Date(selectedDateDetails).getDay()];
    const isHoliday = offDays.includes(selectedDateDetails);
    const isWeekdayOff = offWeekdays.includes(korDay);
    const isOff = isHoliday || isWeekdayOff;
    const dayBlocks = blockedSlots.filter((b) => b.date === selectedDateDetails);
    const dayRes = reservations.filter((r) => r.date === selectedDateDetails && CALENDAR_VISIBLE.has(r.status));
    const hasRes = dayRes.length > 0;

    const [showAddReservation, setShowAddReservation] = useState(false);
    const [newClientName, setNewClientName] = useState('');
    const [newClientPhone, setNewClientPhone] = useState('');
    const [manualDate, setManualDate] = useState(selectedDateDetails);
    const [addStart, setAddStart] = useState('09:00');
    const [addEnd, setAddEnd] = useState('10:00');
    const [addPicker, setAddPicker] = useState(null);

    const [showAddSchedule, setShowAddSchedule] = useState(false);
    const [workStart, setWorkStart] = useState('09:00');
    const [workEnd, setWorkEnd] = useState('18:00');
    const [workPicker, setWorkPicker] = useState(null);

    const [showBlockInput, setShowBlockInput] = useState(false);
    const [blkStart, setBlkStart] = useState('09:00');
    const [blkEnd, setBlkEnd] = useState('10:00');
    const [blkPicker, setBlkPicker] = useState(null);

    const handlePhoneChange = (e) => {
        let v = e.target.value.replace(/[^0-9]/g, '');
        if (v.length > 7) v = v.replace(/(\d{3})(\d{4})(\d{1,4})/, '$1-$2-$3');
        else if (v.length > 3) v = v.replace(/(\d{3})(\d{1,4})/, '$1-$2');
        setNewClientPhone(v);
    };

    const handleAddReservation = async () => {
        if (!newClientName || !manualDate || !newClientPhone) {
            alert('상담 날짜, 내담자 성함, 전화번호를 모두 입력해 주세요.');
            return;
        }
        try {
            await createBooking({
                counselorId: userId,
                selectedDate: manualDate,
                selectedTime: addStart,
                survey: { reason: '직접 추가', topic: '직접 추가된 일정입니다.' },
                client_name: newClientName,
                client_phone: newClientPhone,
            });
            await onAddReservationDone();
            setNewClientName('');
            setNewClientPhone('');
            setShowAddReservation(false);
            setAddStart('09:00');
            setAddEnd('10:00');
            showToast('일정이 추가되었습니다.');
        } catch {
            alert('일정 추가에 실패했습니다.');
        }
    };

    const handleAddBlock = async () => {
        if (!blkStart || !blkEnd) return;
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

    return (
        <div className="mwc-modal-overlay mwc-modal-overlay--date" onClick={onClose}>
            <div className="mwc-modal-box mwc-modal-box--date" onClick={(e) => e.stopPropagation()}>
                <div className="mwc-modal-body--scroll">
                    <div className="mwc-date-modal-header">
                        <h3 className="mwc-date-modal-title">{selectedDateDetails} 관리</h3>
                        <button className="mwc-modal-close-btn" onClick={onClose}>
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
                                <div>
                                    <label className="mwc-field-label">전화번호</label>
                                    <input
                                        type="text"
                                        value={newClientPhone}
                                        onChange={handlePhoneChange}
                                        placeholder="010-0000-0000"
                                        className="mwc-text-input"
                                        maxLength={13}
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
                                        options={TIME_OPTIONS.filter((t) => timeToMinutes(t) > timeToMinutes(addStart))}
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
                                    {dayRes.map((res) => (
                                        <div
                                            key={res.id}
                                            className="mwc-reservation-item"
                                            onClick={() => onSelectReservation(res)}
                                        >
                                            <div>
                                                <span className="mwc-reservation-item-name">{res.client}님</span>
                                                <span className="mwc-reservation-item-time">{res.time}</span>
                                            </div>
                                            <button
                                                className="mwc-item-delete-btn"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onReject(res.id);
                                                }}
                                            >
                                                <Trash2 size={14} />
                                            </button>
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
                                    {isWeekdayOff && !showAddSchedule && (
                                        <button
                                            className="mwc-off-toggle-btn mwc-off-toggle-btn--active"
                                            onClick={() => setShowAddSchedule(true)}
                                        >
                                            근무일로 변경
                                        </button>
                                    )}
                                    {!isHoliday && !isWeekdayOff && !hasRes && (
                                        <button
                                            className="mwc-off-toggle-btn mwc-off-toggle-btn--normal"
                                            onClick={async () => {
                                                await addHoliday(selectedDateDetails, userId);
                                                setOffDays((p) => [...p, selectedDateDetails]);
                                            }}
                                        >
                                            휴무 지정
                                        </button>
                                    )}
                                    {isHoliday && (
                                        <button
                                            disabled={hasRes}
                                            className="mwc-off-toggle-btn mwc-off-toggle-btn--active"
                                            onClick={async () => {
                                                await removeHoliday(selectedDateDetails, userId);
                                                setOffDays((p) => p.filter((d) => d !== selectedDateDetails));
                                            }}
                                        >
                                            휴무 취소
                                        </button>
                                    )}
                                </div>
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
                                                onClick={() =>
                                                    addSchedule({
                                                        user_id: userId,
                                                        day_of_week: korDay,
                                                        start_time: workStart,
                                                        end_time: workEnd,
                                                    })
                                                        .then(() => {
                                                            showToast(
                                                                `근무일로 등록: ${korDay} ${workStart}~${workEnd}`
                                                            );
                                                            setShowAddSchedule(false);
                                                            fetchScheduleAndHolidays();
                                                        })
                                                        .catch(() => alert('근무일 등록에 실패했습니다.'))
                                                }
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
                                                        setBlockedSlots((p) => p.filter((b) => b.id !== block.id));
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
                                            options={TIME_OPTIONS.filter(
                                                (t) => timeToMinutes(t) > timeToMinutes(blkStart)
                                            )}
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

                    <button className="mwc-modal-confirm-btn" onClick={onClose}>
                        확인
                    </button>
                </div>
            </div>
        </div>
    );
};

// ── 메인 ─────────────────────────────────────────────────
const CounselorPlanner = ({ userId, userName, setUserName, isLoggedIn, setIsLoggedIn }) => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = React.useState('reservation');
    const [viewMode, setViewMode] = useState('calendar');
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedReservation, setSelectedReservation] = useState(null);
    const [selectedDateDetails, setSelectedDateDetails] = useState(null);
    const [reservations, setReservations] = useState([]);
    const [offDays, setOffDays] = useState([]);
    const [offWeekdays, setOffWeekdays] = useState([]);
    const [blockedSlots, setBlockedSlots] = useState([]);
    const [toast, setToast] = useState(null);
    const [confirmModal, setConfirmModal] = useState(null);

    const showToast = (msg) => {
        setToast(msg);
        setTimeout(() => setToast(null), 2500);
    };
    const openConfirm = (title, desc, onConfirm) => setConfirmModal({ title, desc, onConfirm });
    const closeConfirm = () => setConfirmModal(null);

    // ── 데이터 ─────────────────────────────────────────────
    const fetchBookings = async () => {
        try {
            setReservations((await getCounselorBookings()).map(mapBooking));
        } catch {}
    };

    const fetchScheduleAndHolidays = async () => {
        try {
            const data = await getScheduleCalendar(userId || 1);
            setOffDays(data.holidays ?? []);
            setOffWeekdays(data.off_weekdays ?? []);
        } catch {
            setOffDays([]);
            setOffWeekdays([]);
        }
    };

    const fetchBlockedSlots = async () => {
        try {
            setBlockedSlots(
                (await getBlockedSlots(userId)).map((b) => ({
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

    // ── 유틸 ───────────────────────────────────────────────
    const changeMonth = (delta) => setCurrentDate((d) => new Date(d.getFullYear(), d.getMonth() + delta, 1));

    const getDaysInMonth = (d) => ({
        firstDay: new Date(d.getFullYear(), d.getMonth(), 1).getDay(),
        days: new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate(),
        year: d.getFullYear(),
        month: d.getMonth(),
    });

    const updateStatus = (id, status) => {
        setReservations((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
        if (selectedReservation?.id === id) setSelectedReservation((p) => ({ ...p, status }));
    };

    // ── 핸들러 ─────────────────────────────────────────────
    const handleGoToClient = (client) =>
        navigate('/CounselorClient', {
            state: { selectedClientName: client, clientReservations: reservations.filter((r) => r.client === client) },
        });

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
            showToast('예약이 승인되었습니다.');
        } catch {
            alert('예약 확정에 실패했습니다.');
        }
    };

    const handleReject = async (id) => {
        const res = reservations.find((r) => r.id === id);
        if (!res?.order_id) {
            alert('예약 정보에 order_id가 없습니다.');
            return;
        }
        try {
            await rejectBooking(res.order_id);
            await fetchBookings();
            updateStatus(id, '취소됨');
            showToast('예약이 거절되었습니다.');
        } catch {
            alert('예약 거절에 실패했습니다.');
        }
    };

    const handleCancelConfirmed = (id, clientName) => {
        openConfirm(
            '승인을 취소하시겠습니까?',
            `${clientName}님의 예약 승인을 취소합니다. 이 작업은 되돌릴 수 없습니다.`,
            async () => {
                const resv = reservations.find((r) => r.id === id);
                if (!resv?.order_id) {
                    alert('예약 정보에 order_id가 없습니다.');
                    return;
                }
                try {
                    await rejectBooking(resv.order_id);
                    await fetchBookings();
                    updateStatus(id, '취소됨');
                    showToast('예약 승인이 취소되었습니다.');
                } catch {
                    alert('예약 승인 취소에 실패했습니다.');
                }
                closeConfirm();
                setSelectedReservation(null);
            }
        );
    };

    const handleDeleteBookingHistory = (id, clientName) => {
        openConfirm(
            '예약 내역을 삭제하시겠습니까?',
            `${clientName}님의 예약 내역을 삭제합니다. 이 작업은 되돌릴 수 없습니다.`,
            async () => {
                const resv = reservations.find((r) => r.id === id);
                if (!resv?.order_id) {
                    alert('예약 정보에 order_id가 없습니다.');
                    return;
                }
                try {
                    await deleteCanceledBooking(resv.order_id);
                    setReservations((prev) => prev.filter((r) => r.id !== id));
                    if (selectedReservation?.id === id) {
                        setSelectedReservation(null);
                    }
                    showToast('예약 내역이 삭제되었습니다.');
                } catch (e) {
                    const message = e?.response?.data?.detail || '예약 삭제에 실패했습니다.';
                    alert(message);
                }
                closeConfirm();
            }
        );
    };

    // ── 예약 상세 모달 ──────────────────────────────────────
    const ReservationModal = ({ res }) => {
        const isPending = res.status === '대기 중';
        const isConfirmed = res.status === '확정됨';
        const isCompleted = res.status === '상담 완료';
        const isCanceled = CANCELED_STATUSES.has(res.status);
        const isDeletable = DELETABLE_STATUSES.has(res.status);
        const statusBadge = isConfirmed
            ? ' mwc-res-status-badge--confirmed'
            : isCanceled
              ? ' mwc-res-status-badge--canceled'
              : ' mwc-res-status-badge--pending';

        return (
            <div className="mwc-modal-overlay" onClick={() => setSelectedReservation(null)}>
                <div className="mwc-modal-box" onClick={(e) => e.stopPropagation()}>
                    <div className="mwc-modal-body">
                        <div className="mwc-res-header">
                            <div className="mwc-res-header-left">
                                <div className="mwc-res-avatar">
                                    {res.client_profile_img_url && res.client_profile_img_url.trim() ? (
                                        <img
                                            src={resolveImageUrl(res.client_profile_img_url)}
                                            alt={res.client + ' 프로필'}
                                            className="u-img-cover-inherit"
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.style.display = 'none';
                                            }}
                                        />
                                    ) : (
                                        <User className="text-[#8BA888]" size={24} />
                                    )}
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
                                    onClick={() => handleGoToClient(res.client)}
                                >
                                    일지 작성
                                </button>
                            )}
                            {isConfirmed && (
                                <button
                                    className="mwc-reject-btn"
                                    onClick={() => handleCancelConfirmed(res.id, res.client)}
                                >
                                    승인 취소
                                </button>
                            )}
                            {isDeletable && (
                                <button
                                    className="mwc-reject-btn"
                                    onClick={() => handleDeleteBookingHistory(res.id, res.client)}
                                >
                                    <Trash2 size={16} /> 삭제하기
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // ── 캘린더 ─────────────────────────────────────────────
    const renderCalendar = () => {
        const { firstDay, days, year, month } = getDaysInMonth(currentDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        return (
            <div className="mwc-calendar-grid">
                {DAYS.map((d) => (
                    <div key={d} className="mwc-calendar-weekday">
                        {d}
                    </div>
                ))}
                {Array.from({ length: firstDay }, (_, i) => (
                    <div key={`e${i}`} className="mwc-calendar-cell-empty" />
                ))}
                {Array.from({ length: days }, (_, i) => {
                    const d = i + 1;
                    const dateStr = toDateStr(year, month, d);
                    const dayRes = reservations.filter((r) => r.date === dateStr && CALENDAR_VISIBLE.has(r.status));
                    const dayBlks = blockedSlots.filter((b) => b.date === dateStr);
                    const isOff = offDays.includes(dateStr);
                    const isToday = today.toDateString() === new Date(year, month, d).toDateString();
                    const isPast = new Date(year, month, d) < today;
                    const korDay = KOR_DAYS[new Date(year, month, d).getDay()];
                    const isWeekdayOff = offWeekdays.includes(korDay);

                    return (
                        <div
                            key={d}
                            className={`mwc-calendar-cell${isOff || isWeekdayOff ? ' mwc-calendar-cell--off' : ''}${isPast ? ' mwc-calendar-cell--disabled' : ''}`}
                            style={isPast ? { pointerEvents: 'none', opacity: 0.4, cursor: 'not-allowed' } : {}}
                            onClick={() => {
                                if (!isPast) setSelectedDateDetails(dateStr);
                            }}
                        >
                            <div className="mwc-cell-top">
                                <span className={`mwc-cell-day${isToday ? ' mwc-cell-day--today' : ''}`}>{d}</span>
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
                })}
            </div>
        );
    };

    // ── 리스트 ─────────────────────────────────────────────
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
                    const isDeletable = DELETABLE_STATUSES.has(res.status);
                    const isCanceled = CANCELED_STATUSES.has(res.status);
                    const badgeClass = isConfirmed
                        ? 'mwc-status-badge--confirmed'
                        : isPending
                          ? 'mwc-status-badge--pending'
                          : 'mwc-status-badge--canceled';
                    const hasProfileImg = res.client_profile_img_url && res.client_profile_img_url.trim();
                    return (
                        <div key={res.id} className="mwc-list-card" onClick={() => setSelectedReservation(res)}>
                            <div className="mwc-list-card-left">
                                <div className="mwc-list-avatar">
                                    {hasProfileImg ? (
                                        <img
                                            src={resolveImageUrl(res.client_profile_img_url)}
                                            alt={res.client + ' 프로필'}
                                            className="u-img-cover-inherit"
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.style.display = 'none';
                                            }}
                                        />
                                    ) : (
                                        <User size={22} className="text-[#8BA888]" />
                                    )}
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
                                            handleCancelConfirmed(res.id, res.client);
                                        }}
                                    >
                                        승인 취소
                                    </button>
                                )}
                                {isDeletable && (
                                    <button
                                        className="mwc-list-reject-btn"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeleteBookingHistory(res.id, res.client);
                                        }}
                                    >
                                        <Trash2 size={12} /> 삭제하기
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

    // ── 렌더 ───────────────────────────────────────────────
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
                {selectedDateDetails && (
                    <DateModal
                        selectedDateDetails={selectedDateDetails}
                        offDays={offDays}
                        offWeekdays={offWeekdays}
                        blockedSlots={blockedSlots}
                        reservations={reservations}
                        userId={userId}
                        setOffDays={setOffDays}
                        setBlockedSlots={setBlockedSlots}
                        onClose={() => setSelectedDateDetails(null)}
                        onSelectReservation={setSelectedReservation}
                        onReject={handleReject}
                        onAddReservationDone={fetchBookings}
                        fetchScheduleAndHolidays={fetchScheduleAndHolidays}
                        showToast={showToast}
                    />
                )}
                {confirmModal && (
                    <ConfirmModal
                        title={confirmModal.title}
                        desc={confirmModal.desc}
                        onConfirm={confirmModal.onConfirm}
                        onCancel={closeConfirm}
                    />
                )}
                {toast && <Toast msg={toast} />}

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
                                    onClick={() => setSelectedDateDetails(new Date().toISOString().split('T')[0])}
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
