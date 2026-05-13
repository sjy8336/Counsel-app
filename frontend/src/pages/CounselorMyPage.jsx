// 요일별 시간대 추가/삭제
    const addTimeSlot = (dayIdx) => {
        setWorkDays((prev) =>
            prev.map((d, i) =>
                i === dayIdx
                    ? {
                          ...d,
                          slots: Array.isArray(d.slots)
                              ? [...d.slots, { start: '09:00', end: '18:00' }]
                              : [{ start: '09:00', end: '18:00' }],
                      }
                    : d
            )
        );
    };
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import '../static/CounselorMyPage.css';
import axios from 'axios';
import {
    getCounselorProfile,
    updateCounselorProfile,
    getSpecialty,
    updateSpecialty,
    getCertificates,
    updateCertificate,
    getEducations,
    updateEducation,
    getExperiences,
    updateExperience,
    getSchedules,
    updateSchedule,
} from '../api/counselor.js';
import { getNotifications, markNotificationRead } from '../api/notification.js';
import {
    LayoutDashboard,
    Bell,
    Settings,
    LogOut,
    HeadphonesIcon,
    ChevronRight,
    MessageCircle,
    MessageSquare,
    AlertCircle,
    HelpCircle,
    FileText,
    User,
    Check,
    X,
    Calendar,
    Clock,
    Menu,
    Trash2,
    UserCog,
    BellRing,
    ChevronDown,
    ChevronLeft,
    Plus,
    Save,
} from 'lucide-react';

// ─── 상수 ────────────────────────────────────────────────────────────────────
const uid = () => Date.now() + Math.random();
const DAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'];
const TIME_OPTIONS = Array.from({ length: 30 }, (_, i) => {
    const total = 9 * 60 + i * 30;
    return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
});
const SPECIALTY_OPTIONS = [
    '개인심리',
    '취업상담',
    '가족상담',
    '부부상담',
    '청소년상담',
    '트라우마',
    '우울/불안',
    '진로상담',
    '대인관계',
    '기타',
];
const INIT_WORK_DAYS = DAY_LABELS.slice(1)
    .concat(DAY_LABELS[0])
    .map((day) => ({
        day,
        active: !['토', '일'].includes(day),
        slots: [{ start: '09:00', end: '18:00' }],
    }));
const INIT_NOTIF_SETTINGS = [
    { id: 'schedule', label: '상담 일정 알림', desc: '오늘 예정된 상담 일정을 알려드립니다.', on: true },
    { id: 'booking', label: '예약 확정 알림', desc: '새로운 예약이 확정되면 알려드립니다.', on: true },
    { id: 'cancel', label: '예약 취소 알림', desc: '내담자가 예약을 취소하면 알려드립니다.', on: true },
    { id: 'msg', label: '메시지 알림', desc: '읽지 않은 메시지가 있을 때 알려드립니다.', on: false },
    { id: 'notice', label: '시스템 공지 알림', desc: '서비스 점검 및 공지사항을 알려드립니다.', on: true },
    { id: 'marketing', label: '마케팅 알림', desc: '이벤트 및 혜택 소식을 알려드립니다.', on: false },
];
const SETTINGS_MENU = [
    { id: 'profile', icon: <UserCog size={16} />, label: '상담사 프로필 수정', sub: '프로필 정보를 수정합니다.' },
    { id: 'notifSettings', icon: <BellRing size={16} />, label: '알림 설정', sub: '받을 알림 종류를 설정합니다.' },
    {
        id: 'deleteAccount',
        icon: <Trash2 size={16} />,
        label: '회원 탈퇴',
        sub: '계정 및 모든 데이터를 삭제합니다.',
        danger: true,
    },
];

// ─── 유틸 함수 ───────────────────────────────────────────────────────────────
const formatMonth = (v) => {
    if (!v) return '';
    const [y, m] = v.split('-');
    return `${y}년 ${Number(m)}월`;
};
const formatDate = (v) => {
    if (!v) return '';
    const [y, m, d] = v.split('-');
    return `${y}년 ${Number(m)}월 ${Number(d)}일`;
};
const isTodayDate = (y, m, d) => {
    const t = new Date();
    return t.getFullYear() === y && t.getMonth() === m && t.getDate() === d;
};

const useOutsideClose = (open, ref, onClose) => {
    useEffect(() => {
        if (!open) return;
        const handler = (e) => {
            if (ref.current && !ref.current.contains(e.target)) onClose();
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [open, onClose, ref]);
};

// ─── 공통 컴포넌트 ────────────────────────────────────────────────────────────
const Toggle = ({ on, onChange }) => (
    <button className={`cmp-toggle${on ? ' on' : ''}`} onClick={onChange} aria-label="toggle">
        <span className="cmp-toggle-thumb" />
    </button>
);

const PageHeader = ({ title, sub }) => (
    <div className="cmp-page-header">
        <h2 className="cmp-page-title">{title}</h2>
        {sub && <p className="cmp-page-sub">{sub}</p>}
    </div>
);

const BackHeader = ({ title, onBack }) => (
    <div className="cmp-subview-header">
        <button className="cmp-back-btn" onClick={onBack}>
            <ChevronRight size={15} style={{ transform: 'rotate(180deg)' }} /> 설정
        </button>
        <h2 className="cmp-page-title" style={{ margin: 0 }}>
            {title}
        </h2>
    </div>
);

const NotifIcon = ({ type }) => {
    const map = {
        schedule: <Calendar size={15} />,
        booking: <Check size={15} />,
        msg: <MessageSquare size={15} />,
        notice: <AlertCircle size={15} />,
    };
    return <div className="cmp-item-avatar notif">{map[type] || <Bell size={15} />}</div>;
};

// ─── MonthPicker ──────────────────────────────────────────────────────────────
const MonthPicker = ({ value, onChange, icon = true, placeholder = '', className = '' }) => {
    const [open, setOpen] = useState(false);
    const [viewYear, setViewYear] = useState(() => (value ? Number(value.split('-')[0]) : new Date().getFullYear()));
    const ref = useRef(null);
    useOutsideClose(open, ref, () => setOpen(false));

    return (
        <div className={`cmp-monthpicker-wrap ${className}`.trim()} ref={ref}>
            <button
                type="button"
                className={`cmp-monthpicker-input${value ? ' filled' : ''}`}
                onClick={() => setOpen((p) => !p)}
            >
                {icon && (
                    <span className="cmp-picker-input-icon">
                        <Calendar size={15} />
                    </span>
                )}
                <span>{value ? formatMonth(value) : placeholder || '연/월 선택'}</span>
                <ChevronDown size={14} className={`cmp-picker-input-chevron${open ? ' open' : ''}`} />
            </button>
            {open && (
                <div className="cmp-picker-popover cmp-monthpicker-modal">
                    <div className="cmp-picker-popover-head">
                        <div>
                            <div className="cmp-picker-popover-eyebrow">Month</div>
                            <div className="cmp-picker-popover-title">{viewYear}년</div>
                        </div>
                        <div className="cmp-picker-nav">
                            <button
                                type="button"
                                className="cmp-picker-nav-btn"
                                onClick={() => setViewYear((y) => y - 1)}
                            >
                                <ChevronLeft size={14} />
                            </button>
                            <button
                                type="button"
                                className="cmp-picker-nav-btn"
                                onClick={() => setViewYear((y) => y + 1)}
                            >
                                <ChevronRight size={14} />
                            </button>
                        </div>
                    </div>
                    <div className="cmp-monthpicker-months">
                        {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => {
                            const sel =
                                value && Number(value.split('-')[0]) === viewYear && Number(value.split('-')[1]) === m;
                            return (
                                <button
                                    key={m}
                                    type="button"
                                    className={`cmp-monthpicker-month${sel ? ' selected' : ''}`}
                                    onClick={() => {
                                        onChange(`${viewYear}-${String(m).padStart(2, '0')}`);
                                        setOpen(false);
                                    }}
                                >
                                    {m}월
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

// ─── DatePicker ───────────────────────────────────────────────────────────────
const DatePicker = ({ value, onChange, icon = true, placeholder = '', className = '' }) => {
    const [open, setOpen] = useState(false);
    const init = value ? new Date(value) : new Date();
    const [viewYear, setViewYear] = useState(init.getFullYear());
    const [viewMonth, setViewMonth] = useState(init.getMonth());
    const ref = useRef(null);
    useOutsideClose(open, ref, () => setOpen(false));

    useEffect(() => {
        if (!value) return;
        const d = new Date(value);
        if (!isNaN(d)) {
            setViewYear(d.getFullYear());
            setViewMonth(d.getMonth());
        }
    }, [value]);

    const firstDay = new Date(viewYear, viewMonth, 1).getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const goMonth = (delta) => {
        const d = new Date(viewYear, viewMonth + delta, 1);
        setViewYear(d.getFullYear());
        setViewMonth(d.getMonth());
    };

    return (
        <div className={`cmp-monthpicker-wrap ${className}`.trim()} ref={ref}>
            <button
                type="button"
                className={`cmp-monthpicker-input${value ? ' filled' : ''}`}
                onClick={() => setOpen((p) => !p)}
            >
                {icon && (
                    <span className="cmp-picker-input-icon">
                        <Calendar size={15} />
                    </span>
                )}
                <span>{value ? formatDate(value) : placeholder || '날짜 선택'}</span>
                <ChevronDown size={14} className={`cmp-picker-input-chevron${open ? ' open' : ''}`} />
            </button>
            {open && (
                <div className="cmp-picker-popover cmp-datepicker-modal">
                    <div className="cmp-picker-popover-head">
                        <div>
                            <div className="cmp-picker-popover-eyebrow">Date</div>
                            <div className="cmp-picker-popover-title">
                                {viewYear}년 {viewMonth + 1}월
                            </div>
                        </div>
                        <div className="cmp-picker-nav">
                            <button type="button" className="cmp-picker-nav-btn" onClick={() => goMonth(-1)}>
                                <ChevronLeft size={14} />
                            </button>
                            <button type="button" className="cmp-picker-nav-btn" onClick={() => goMonth(1)}>
                                <ChevronRight size={14} />
                            </button>
                        </div>
                    </div>
                    <div className="cmp-datepicker-weekdays">
                        {DAY_LABELS.map((d) => (
                            <span key={d}>{d}</span>
                        ))}
                    </div>
                    <div className="cmp-datepicker-grid">
                        {Array.from({ length: firstDay }, (_, i) => (
                            <div key={`b${i}`} className="cmp-datepicker-blank" />
                        ))}
                        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
                            const val = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                            return (
                                <button
                                    key={day}
                                    type="button"
                                    className={`cmp-datepicker-day${value === val ? ' selected' : ''}${isTodayDate(viewYear, viewMonth, day) ? ' today' : ''}`}
                                    onClick={() => {
                                        onChange(val);
                                        setOpen(false);
                                    }}
                                >
                                    {day}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

// ─── TimePicker ───────────────────────────────────────────────────────────────
const TimePicker = ({ value, onChange, minTime = '', disabled = false, className = '' }) => {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);
    useOutsideClose(open, ref, () => setOpen(false));
    const times = TIME_OPTIONS.filter((t) => !minTime || t >= minTime);

    return (
        <div className={`cmp-monthpicker-wrap ${className}`.trim()} ref={ref}>
            <button
                type="button"
                disabled={disabled}
                className={`cmp-monthpicker-input cmp-timepicker-input${value ? ' filled' : ''}${disabled ? ' disabled' : ''}`}
                onClick={() => {
                    if (!disabled) setOpen((p) => !p);
                }}
            >
                <span className="cmp-picker-input-icon">
                    <Clock size={15} />
                </span>
                <span>{value || '시간 선택'}</span>
                <ChevronDown size={14} className={`cmp-picker-input-chevron${open ? ' open' : ''}`} />
            </button>
            {open && (
                <div className="cmp-picker-popover cmp-timepicker-modal">
                    <div className="cmp-picker-popover-head">
                        <div>
                            <div className="cmp-picker-popover-eyebrow">Time</div>
                            <div className="cmp-picker-popover-title">{value || '시간 선택'}</div>
                        </div>
                    </div>
                    <div className="cmp-timepicker-list">
                        {times.map((t) => (
                            <button
                                key={t}
                                type="button"
                                className={`cmp-timepicker-option${value === t ? ' selected' : ''}`}
                                onClick={() => {
                                    onChange(t);
                                    setOpen(false);
                                }}
                            >
                                {t}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

// ─── SpecialtySelector ────────────────────────────────────────────────────────
// specialties: [{ specialty_name, custom_description }]
const SpecialtySelector = ({ specialties, onChange }) => {
    const [customText, setCustomText] = useState('');
    const selectedNames = specialties.map((s) => s.specialty_name);

    const toggle = (name) => {
        if (selectedNames.includes(name)) {
            onChange(specialties.filter((s) => s.specialty_name !== name));
        } else {
            onChange([...specialties, { specialty_name: name, custom_description: '' }]);
        }
    };

    const addCustom = () => {
        const trimmed = customText.trim();
        if (!trimmed || selectedNames.includes(trimmed)) return;
        onChange([...specialties, { specialty_name: trimmed, custom_description: trimmed }]);
        setCustomText('');
    };

    return (
        <div>
            <div className="cmp-specialty-grid">
                {SPECIALTY_OPTIONS.map((name) => {
                    const sel = selectedNames.includes(name);
                    return (
                        <button
                            key={name}
                            type="button"
                            className={`cmp-specialty-chip${sel ? ' selected' : ''}`}
                            onClick={() => toggle(name)}
                        >
                            {sel && <Check size={11} />}
                            {name}
                        </button>
                    );
                })}
            </div>
            {selectedNames.includes('기타') && (
                <div className="cmp-specialty-custom">
                    <input
                        className="cmp-input cmp-input-sm cmp-specialty-custom-input"
                        placeholder="기타 전문분야 직접 입력"
                        value={customText}
                        onChange={(e) => setCustomText(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && addCustom()}
                    />
                    <button className="cmp-btn-add" style={{ padding: '8px 14px', fontSize: 12 }} onClick={addCustom}>
                        추가
                    </button>
                </div>
            )}
            {/* 선택된 기타 커스텀 항목 표시 */}
            {specialties.filter((s) => s.custom_description && !SPECIALTY_OPTIONS.includes(s.specialty_name)).length >
                0 && (
                <div className="cmp-specialty-grid" style={{ marginTop: 6 }}>
                    {specialties
                        .filter((s) => !SPECIALTY_OPTIONS.includes(s.specialty_name))
                        .map((s) => (
                            <button
                                key={s.specialty_name}
                                type="button"
                                className="cmp-specialty-chip selected"
                                onClick={() =>
                                    onChange(specialties.filter((x) => x.specialty_name !== s.specialty_name))
                                }
                            >
                                <Check size={11} />
                                {s.specialty_name}
                            </button>
                        ))}
                </div>
            )}
        </div>
    );
};

// ─── 메인 App ─────────────────────────────────────────────────────────────────
const App = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const fileInputRef = useRef(null);

    const [activeMenu, setActiveMenu] = useState(searchParams.get('tab') || 'dashboard');
    const [settingsView, setSettingsView] = useState(null);
    const [settingsOpen, setSettingsOpen] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [registered, setRegistered] = useState(false);
    const [loadingRegistered, setLoadingRegistered] = useState(true);
    const [profileStatus, setProfileStatus] = useState('');

    const [profile, setProfile] = useState({});
    const [specialties, setSpecialties] = useState([]); // [{ specialty_name, custom_description }]
    const [careers, setCareers] = useState([]);
    const [educations, setEducations] = useState([]);
    const [certificates, setCertificates] = useState([]);
    const [workDays, setWorkDays] = useState(INIT_WORK_DAYS);
    const [holidays, setHolidays] = useState([]);
    const [newHoliday, setNewHoliday] = useState('');
    const [notifications, setNotifications] = useState([]);
    const [notifSettings, setNotifSettings] = useState(INIT_NOTIF_SETTINGS);
    const [deleteStep, setDeleteStep] = useState(1);
    const [deleteInput, setDeleteInput] = useState('');

    // ── 등록 여부 확인 ─────────────────────────────────────────────────────────
    const fetchRegistered = useCallback(async () => {
        setLoadingRegistered(true);
        try {
            const token = localStorage.getItem('access_token');
            if (!token) return;
            const prof = await getCounselorProfile(token);
            if (prof?.status) {
                setRegistered(true);
                setProfileStatus(prof.status);
            } else {
                setRegistered(false);
                setProfileStatus('');
            }
        } catch {
            setRegistered(false);
            setProfileStatus('');
        } finally {
            setLoadingRegistered(false);
        }
    }, []);

    useEffect(() => {
        fetchRegistered();
    }, [fetchRegistered]);

    // ── 데이터 불러오기 ─────────────────────────────────────────────────────────
    useEffect(() => {
        const fetchAll = async () => {
            const token = localStorage.getItem('access_token');
            if (!token) return;
            try {
                const [prof, specs, certs, edus, exps, scheds] = await Promise.all([
                    getCounselorProfile(token),
                    getSpecialty(token),
                    getCertificates(token),
                    getEducations(token),
                    getExperiences(token),
                    getSchedules(token),
                ]);

                setProfile({
                    ...prof,
                    tel: prof.center_phone || '',
                    price: prof.consultation_price || '',
                    office_name: prof.center_name || '',
                    office_address: prof.center_address || '',
                    intro: prof.intro_line || '',
                });

                // 전문분야: DB row 배열 그대로 사용
                setSpecialties(
                    (specs || []).map((s) => ({
                        specialty_name: s.specialty_name || '',
                        custom_description: s.custom_description || '',
                    }))
                );

                setCertificates(
                    (certs || []).map((c, i) => ({
                        id: c.id || i + 1,
                        name: c.certificate_name || '',
                        issuer: c.issuer || '',
                        date: c.acquisition_date || '',
                    }))
                );

                setEducations(
                    (edus || []).map((e, i) => ({
                        id: e.id || i + 1,
                        school: e.school_name || '',
                        degree: e.major || '',
                        startDate: e.start_date || '',
                        endDate: e.end_date || '',
                    }))
                );

                setCareers(
                    (exps || []).map((e, i) => ({
                        id: e.id || i + 1,
                        startDate: e.start_date || '',
                        endDate: e.end_date || '',
                        isCurrent: e.is_current || false,
                        description: e.content || '',
                    }))
                );

                // scheds: [{ day_of_week, start_time, end_time } ...] 여러 row
                if (Array.isArray(scheds) && scheds.length > 0) {
                    // 요일별로 그룹핑
                    const days = ['월', '화', '수', '목', '금', '토', '일'];
                    const grouped = days.map((day) => {
                        const slots = scheds
                            .filter((s) => (s.day || s.day_of_week) === day || (s.day_of_week && s.day_of_week.includes(day)))
                            .map((s) => ({ start: s.start_time?.slice(0,5) || '09:00', end: s.end_time?.slice(0,5) || '18:00' }));
                        return {
                            day,
                            active: slots.length > 0,
                            slots: slots.length > 0 ? slots : [{ start: '09:00', end: '18:00' }],
                        };
                    });
                    setWorkDays(grouped);
                } else {
                    // 기본값도 09:00~18:00
                    setWorkDays(DAY_LABELS.slice(1).concat(DAY_LABELS[0]).map((day) => ({
                        day,
                        active: !['토', '일'].includes(day),
                        slots: [{ start: '09:00', end: '18:00' }],
                    })));
                }
            } catch {
                /* ignore */
            }
        };
        fetchAll();
    }, [registered]);

    // ── 알림 불러오기 ──────────────────────────────────────────────────────────
    useEffect(() => {
        const fetchNotifs = async () => {
            const token = localStorage.getItem('access_token');
            if (!token) return;
            try {
                const res = await getNotifications(token);
                const notifs = res.data || [];
                setNotifications([
                    {
                        id: 1,
                        group: '최근 알림',
                        items: notifs.map((n) => ({
                            id: n.id,
                            type: n.type,
                            title: n.title,
                            desc: n.desc,
                            time: new Date(n.created_at).toLocaleString('ko-KR', {
                                hour: '2-digit',
                                minute: '2-digit',
                                month: 'short',
                                day: 'numeric',
                            }),
                            unread: !n.read,
                        })),
                    },
                ]);
            } catch {
                /* ignore */
            }
        };
        fetchNotifs();
    }, [activeMenu]);

    // ── CRUD 핸들러 ────────────────────────────────────────────────────────────
    const addCareer = () =>
        setCareers((p) => [...p, { id: uid(), startDate: '', endDate: '', isCurrent: false, description: '' }]);
    const removeCareer = (id) => setCareers((p) => p.filter((c) => c.id !== id));
    const updateCareerField = (id, key, val) =>
        setCareers((p) => p.map((c) => (c.id === id ? { ...c, [key]: val } : c)));
    const toggleCareerCurrent = (id) =>
        setCareers((p) => p.map((c) => (c.id === id ? { ...c, isCurrent: !c.isCurrent, endDate: '' } : c)));

    const addEducation = () =>
        setEducations((p) => [...p, { id: uid(), startDate: '', endDate: '', school: '', degree: '' }]);
    const removeEducation = (id) => setEducations((p) => p.filter((e) => e.id !== id));
    const updateEducationField = (id, key, val) =>
        setEducations((p) => p.map((e) => (e.id === id ? { ...e, [key]: val } : e)));

    const addCertificate = () => setCertificates((p) => [...p, { id: uid(), name: '', issuer: '', date: '' }]);
    const removeCertificate = (id) => setCertificates((p) => p.filter((c) => c.id !== id));
    const updateCertificateField = (id, key, val) =>
        setCertificates((p) => p.map((c) => (c.id === id ? { ...c, [key]: val } : c)));

    const toggleWorkDay = (i) => setWorkDays((p) => p.map((d, idx) => (idx === i ? { ...d, active: !d.active } : d)));
    const updateWorkTime = (i, key, val) =>
        setWorkDays((p) =>
            p.map((d, idx) => {
                if (idx !== i) return d;
                const next = { ...d, [key]: val };
                if (key === 'startTime' && next.endTime < val) next.endTime = val;
                return next;
            })
        );

    const addHoliday = () => {
        if (newHoliday && !holidays.includes(newHoliday)) {
            setHolidays((p) => [...p, newHoliday]);
            setNewHoliday('');
        }
    };

    const handleNotifClick = async (groupId, itemId) => {
        const token = localStorage.getItem('access_token');
        try {
            await markNotificationRead(itemId, token);
            setNotifications((p) =>
                p.map((g) =>
                    g.id !== groupId
                        ? g
                        : {
                              ...g,
                              items: g.items.map((item) => (item.id === itemId ? { ...item, unread: false } : item)),
                          }
                )
            );
        } catch {
            /* ignore */
        }
    };

    const toggleNotifSetting = (id) => setNotifSettings((p) => p.map((s) => (s.id === id ? { ...s, on: !s.on } : s)));

    // ── 저장 ───────────────────────────────────────────────────────────────────
    const handleSaveProfile = async () => {
        const token = localStorage.getItem('access_token');
        try {
            await updateCounselorProfile(profile, token);
            // 전문분야: DB 구조에 맞게 배열 전달
            await updateSpecialty(specialties, token);
            await updateCertificate(
                certificates.map(({ id, ...rest }) => rest),
                token
            );
            await updateEducation(
                educations.map(({ id, ...rest }) => rest),
                token
            );
            await updateExperience(
                careers.map(({ id, ...rest }) => rest),
                token
            );
            // slots를 flat하게 풀어서 [{ day_of_week, start_time, end_time }, ...] 형태로 변환
            const flatSlots = workDays.flatMap((d) =>
                d.active && Array.isArray(d.slots)
                    ? d.slots.map((s) => ({
                          day_of_week: d.day,
                          start_time: (s.start && s.start.length === 5 ? s.start : '09:00') + ':00',
                          end_time: (s.end && s.end.length === 5 ? s.end : '18:00') + ':00',
                      }))
                    : []
            );
            await updateSchedule(flatSlots, token);
            alert('저장되었습니다.');
        } catch {
            alert('저장 중 오류가 발생했습니다.');
        }
    };

    const handleProfileImgChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const formData = new FormData();
        formData.append('file', file);
        try {
            const res = await axios.post('/api/counselor/upload-profile-image', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });
            if (res.data?.url) setProfile((p) => ({ ...p, profile_img_url: res.data.url }));
        } catch {
            alert('이미지 업로드에 실패했습니다.');
        }
    };

    // ── 네비게이션 ─────────────────────────────────────────────────────────────
    const go = (menu) => {
        setActiveMenu(menu);
        setSettingsView(null);
        setSidebarOpen(false);
        if (menu !== 'settings') setSettingsOpen(false);
    };
    const goSettings = (view) => {
        setActiveMenu('settings');
        setSettingsView(view);
        setSidebarOpen(false);
    };
    const handleLogout = () => {
        ['access_token', 'user'].forEach((k) => {
            localStorage.removeItem(k);
            sessionStorage.removeItem(k);
        });
        navigate('/login');
    };
    const getCounselorName = () => {
        try {
            const u = JSON.parse(localStorage.getItem('user'));
            return u?.full_name || u?.name || u?.username || '';
        } catch {
            return '';
        }
    };

    // ─── 렌더 함수들 ───────────────────────────────────────────────────────────
    const renderDashboard = () => (
        <>
            <header className="cmp-header">
                <div className="cmp-profile-section">
                    <div className="cmp-profile-img">🧔‍♂️</div>
                    <div>
                        <h2 className="cmp-welcome">안녕하세요, {getCounselorName()} 상담사님!</h2>
                        <p className="cmp-welcome-sub">오늘도 따뜻한 상담 부탁드립니다 🌿</p>
                    </div>
                </div>
                <button className="cmp-notif-btn" onClick={() => go('notifications')}>
                    <Bell size={14} /> 알림 확인
                </button>
            </header>
            <div className="cmp-stats-grid">
                {[
                    {
                        icon: <Calendar size={15} color="#66BB6A" />,
                        bg: '#E8F5E9',
                        label: '오늘 예정 상담',
                        value: '3 건',
                        to: '/CounselorPlanner',
                    },
                    {
                        icon: <Clock size={15} color="#FFB74D" />,
                        bg: '#FFF5E6',
                        label: '승인 대기 요청',
                        value: '2 건',
                        to: '/CounselorPlanner',
                    },
                    {
                        icon: <MessageCircle size={15} color="#EF5350" />,
                        bg: '#FFEBEE',
                        label: '읽지 않은 메시지',
                        value: '5 건',
                        to: '/CounselorMessages',
                    },
                ].map(({ icon, bg, label, value, to }) => (
                    <div key={label} className="cmp-stat-card" onClick={() => navigate(to)}>
                        <div className="cmp-stat-icon" style={{ background: bg }}>
                            {icon}
                        </div>
                        <p className="cmp-stat-label">{label}</p>
                        <p className="cmp-stat-value">{value}</p>
                        <span className="cmp-stat-chevron">
                            <ChevronRight size={14} />
                        </span>
                    </div>
                ))}
            </div>
            <div className="cmp-next-session" onClick={() => navigate('/CounselorClient')}>
                <div className="cmp-next-session-icon">
                    <User size={24} color="#fff" />
                </div>
                <div className="cmp-next-session-body">
                    <div className="cmp-next-session-label">NEXT SESSION</div>
                    <div className="cmp-next-session-name">오후 2:00 이민준 님</div>
                    <div className="cmp-next-session-sub">대면 상담 • 상담 3실 • 4회차 진행 예정</div>
                </div>
                <button
                    className="cmp-next-session-btn"
                    onClick={(e) => {
                        e.stopPropagation();
                        navigate('/CounselorClient');
                    }}
                >
                    내담자 관리 <ChevronRight size={14} />
                </button>
            </div>
        </>
    );

    const renderNotifications = () => (
        <>
            <PageHeader title="알림 센터" sub="상담 일정, 예약 확정 등 최근 알림을 확인하세요." />
            <div className="cmp-list-card">
                {!notifications.length || notifications.every((g) => !g.items?.length) ? (
                    <div className="cmp-notif-empty">
                        <div className="cmp-notif-empty-icon">
                            <Bell size={22} />
                        </div>
                        <p className="cmp-notif-empty-title">새로운 알림이 없습니다</p>
                        <p className="cmp-notif-empty-sub">
                            상담 일정, 예약 확정 등 새로운 알림이
                            <br />
                            생기면 여기에 표시됩니다.
                        </p>
                    </div>
                ) : (
                    notifications.map(
                        (group) =>
                            group.items?.length > 0 && (
                                <div key={group.id}>
                                    <div className="cmp-notif-group-label">{group.group}</div>
                                    {group.items.map((item) => (
                                        <div
                                            key={item.id}
                                            className={`cmp-notif-item${item.unread ? ' unread' : ''}`}
                                            onClick={() => handleNotifClick(group.id, item.id)}
                                        >
                                            <NotifIcon type={item.type} />
                                            <div className="cmp-notif-content">
                                                <div className="cmp-notif-title">{item.title}</div>
                                                <div className="cmp-notif-desc">{item.desc}</div>
                                            </div>
                                            <div className="cmp-notif-meta">
                                                <span className="cmp-notif-time">{item.time}</span>
                                                {item.unread && <span className="cmp-notif-dot" />}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )
                    )
                )}
            </div>
        </>
    );

    const renderSettingsList = () => (
        <>
            <PageHeader title="설정" sub="계정 및 서비스 환경을 설정합니다." />
            <div className="cmp-list-card">
                {SETTINGS_MENU.map((item) => (
                    <div key={item.id} className="cmp-list-item" onClick={() => goSettings(item.id)}>
                        <div className="cmp-item-info">
                            <div className={`cmp-item-avatar${item.danger ? ' danger-icon' : ' notif'}`}>
                                {item.icon}
                            </div>
                            <div>
                                <p className={`cmp-item-name${item.danger ? ' danger-text' : ''}`}>{item.label}</p>
                                <p className="cmp-item-sub">{item.sub}</p>
                            </div>
                        </div>
                        <ChevronRight size={15} color="var(--cmp-sub)" />
                    </div>
                ))}
            </div>
        </>
    );

    const renderProfile = () => {
        if (loadingRegistered)
            return (
                <div className="cmp-settings-card" style={{ textAlign: 'center', padding: '52px 28px' }}>
                    <div className="cmp-register-title">상태 확인 중...</div>
                </div>
            );
        if (!registered)
            return (
                <div className="cmp-settings-card" style={{ textAlign: 'center', padding: '52px 28px' }}>
                    <div className="cmp-register-icon">👤</div>
                    <h3 className="cmp-register-title">상담사 프로필을 등록해주세요</h3>
                    <p className="cmp-register-sub">
                        내담자가 상담사님의 정보를 확인하고 예약할 수 있도록
                        <br />
                        프로필 정보를 입력해주세요.
                    </p>
                    <button
                        className="cmp-btn cmp-btn-primary"
                        style={{ padding: '13px 28px', fontSize: 14 }}
                        onClick={() => navigate('/counselorUpload')}
                    >
                        상담사 등록하기
                    </button>
                </div>
            );
        if (profileStatus === '심사중')
            return (
                <div className="cmp-settings-card" style={{ textAlign: 'center', padding: '52px 28px' }}>
                    <div className="cmp-register-icon">⏳</div>
                    <h3 className="cmp-register-title">프로필 등록 심사중</h3>
                    <p className="cmp-register-sub">관리자 심사 후 승인 시 프로필이 공개됩니다.</p>
                    <button
                        className="cmp-btn"
                        style={{ padding: '13px 28px', fontSize: 14, background: '#ccc', color: '#fff' }}
                        disabled
                    >
                        심사중
                    </button>
                </div>
            );
        if (profileStatus === '반려')
            return (
                <div className="cmp-settings-card" style={{ textAlign: 'center', padding: '52px 28px' }}>
                    <div className="cmp-register-icon">❌</div>
                    <h3 className="cmp-register-title">프로필 등록이 반려되었습니다</h3>
                    <p className="cmp-register-sub">사유를 확인 후 정보를 수정해 다시 등록해 주세요.</p>
                    <button
                        className="cmp-btn cmp-btn-primary"
                        style={{ padding: '13px 28px', fontSize: 14 }}
                        onClick={() => navigate('/counselorUpload')}
                    >
                        재등록하기
                    </button>
                </div>
            );

        return (
            <>
                <div className="cmp-settings-card">
                    <div className="cmp-card-title">
                        <User size={15} color="var(--cmp-primary)" /> 기본 정보
                    </div>

                    {/* 프로필 이미지 */}
                    <div className="cmp-profile-upload">
                        <div
                            className="cmp-profile-img-lg cmp-cursor-pointer cmp-pos-rel"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            {profile.profile_img_url ? (
                                <img src={profile.profile_img_url} alt="프로필" className="cmp-profile-img-content" />
                            ) : (
                                <span className="cmp-fs-48">🧔‍♂️</span>
                            )}
                            <button className="cmp-profile-edit-btn" type="button">
                                <Settings size={11} />
                            </button>
                            <input
                                type="file"
                                accept="image/*"
                                ref={fileInputRef}
                                className="cmp-d-none"
                                onChange={handleProfileImgChange}
                            />
                        </div>
                        <div>
                            <p className="cmp-fs-11 cmp-color-sub cmp-mb-3">프로필 사진</p>
                            <p className="cmp-fs-12 cmp-fw-600">사진을 클릭하여 업로드</p>
                        </div>
                    </div>

                    {/* 기본 필드 */}
                    <div className="cmp-grid-2">
                        {[
                            { label: '아이디', key: 'username', readOnly: true },
                            { label: '이메일', key: 'user_email' },
                            { label: '이름', key: 'user_name' },
                            { label: '연락처', key: 'user_phone' },
                            { label: '전화번호', key: 'tel' },
                        ].map(({ label, key, readOnly }) => (
                            <div key={key}>
                                <label className="cmp-field-label">{label}</label>
                                <input
                                    className={`cmp-input${readOnly ? ' cmp-bg-f5 cmp-color-888' : ''}`}
                                    value={profile[key] || ''}
                                    readOnly={readOnly}
                                    onChange={
                                        readOnly
                                            ? undefined
                                            : (e) => setProfile((p) => ({ ...p, [key]: e.target.value }))
                                    }
                                />
                            </div>
                        ))}
                        <div>
                            <label className="cmp-field-label">상담 가격(원)</label>
                            <input
                                className="cmp-input"
                                type="text"
                                inputMode="numeric"
                                value={
                                    profile.price !== undefined && profile.price !== ''
                                        ? Number(profile.price).toLocaleString('ko-KR')
                                        : ''
                                }
                                onChange={(e) =>
                                    setProfile((p) => ({ ...p, price: e.target.value.replace(/[^0-9]/g, '') }))
                                }
                            />
                        </div>
                    </div>

                    {/* ── 전문분야 칩 선택 ── */}
                    <div className="cmp-section-divider" style={{ marginTop: 14 }}>
                        <div className="cmp-sub-section-header">
                            <span className="cmp-field-label" style={{ margin: 0 }}>
                                전문 상담 분야
                            </span>
                            <span style={{ fontSize: 11, color: 'var(--cmp-sub)' }}>{specialties.length}개 선택됨</span>
                        </div>
                        <SpecialtySelector specialties={specialties} onChange={setSpecialties} />
                    </div>

                    {/* 경력 */}
                    <div className="cmp-section-divider">
                        <div className="cmp-sub-section-header">
                            <span className="cmp-field-label" style={{ margin: 0 }}>
                                경력 사항
                            </span>
                            <button className="cmp-btn-outline-sm" onClick={addCareer}>
                                + 추가
                            </button>
                        </div>
                        {careers.map((c) => (
                            <div key={c.id} className="cmp-row-card">
                                <div className="cmp-career-grid">
                                    <div>
                                        <label className="cmp-field-label-sm">시작</label>
                                        <MonthPicker
                                            value={c.startDate}
                                            onChange={(v) => updateCareerField(c.id, 'startDate', v)}
                                            className="cmp-input-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="cmp-field-label-sm">종료</label>
                                        <MonthPicker
                                            value={c.endDate}
                                            onChange={(v) => updateCareerField(c.id, 'endDate', v)}
                                            className="cmp-input-sm"
                                            icon={!c.isCurrent}
                                            placeholder={c.isCurrent ? '진행중' : ''}
                                            disabled={c.isCurrent}
                                        />
                                    </div>
                                    <div>
                                        <label className="cmp-field-label-sm">경력 내용</label>
                                        <input
                                            type="text"
                                            className="cmp-input cmp-input-sm"
                                            value={c.description}
                                            onChange={(e) => updateCareerField(c.id, 'description', e.target.value)}
                                        />
                                    </div>
                                    <button className="cmp-btn-icon" onClick={() => removeCareer(c.id)}>
                                        <X size={12} />
                                    </button>
                                </div>
                                <div className="cmp-checkbox-row">
                                    <input
                                        type="checkbox"
                                        checked={c.isCurrent}
                                        onChange={() => toggleCareerCurrent(c.id)}
                                    />
                                    <label>현재 진행중</label>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* 자격증 */}
                    <div className="cmp-section-divider">
                        <div className="cmp-sub-section-header">
                            <span className="cmp-field-label" style={{ margin: 0 }}>
                                자격증
                            </span>
                            <div style={{ display: 'flex', gap: 4 }}>
                                <button className="cmp-btn-outline-sm" onClick={addCertificate}>
                                    + 추가
                                </button>
                                {certificates.length > 1 && (
                                    <button
                                        className="cmp-btn-icon"
                                        onClick={() => removeCertificate(certificates.at(-1).id)}
                                    >
                                        <X size={14} />
                                    </button>
                                )}
                            </div>
                        </div>
                        {certificates.map((c) => (
                            <div key={c.id} className="cmp-row-card">
                                <div className="cmp-cert-grid">
                                    <div>
                                        <label className="cmp-field-label-sm">자격증명</label>
                                        <input
                                            type="text"
                                            className="cmp-input cmp-input-sm"
                                            value={c.name}
                                            onChange={(e) => updateCertificateField(c.id, 'name', e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label className="cmp-field-label-sm">발급 기관</label>
                                        <input
                                            type="text"
                                            className="cmp-input cmp-input-sm"
                                            value={c.issuer}
                                            onChange={(e) => updateCertificateField(c.id, 'issuer', e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label className="cmp-field-label-sm">취득일</label>
                                        <MonthPicker
                                            value={c.date}
                                            onChange={(v) => updateCertificateField(c.id, 'date', v)}
                                            className="cmp-input-sm"
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* 학력 */}
                    <div className="cmp-section-divider">
                        <div className="cmp-sub-section-header">
                            <span className="cmp-field-label" style={{ margin: 0 }}>
                                학력 사항
                            </span>
                            <button className="cmp-btn-outline-sm" onClick={addEducation}>
                                + 추가
                            </button>
                        </div>
                        {educations.map((e) => (
                            <div key={e.id} className="cmp-row-card">
                                <div className="cmp-edu-grid">
                                    <div>
                                        <label className="cmp-field-label-sm">시작</label>
                                        <MonthPicker
                                            value={e.startDate}
                                            onChange={(v) => updateEducationField(e.id, 'startDate', v)}
                                            className="cmp-input-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="cmp-field-label-sm">졸업</label>
                                        <MonthPicker
                                            value={e.endDate}
                                            onChange={(v) => updateEducationField(e.id, 'endDate', v)}
                                            className="cmp-input-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="cmp-field-label-sm">학교 / 전공</label>
                                        <input
                                            type="text"
                                            className="cmp-input cmp-input-sm"
                                            value={e.school}
                                            onChange={(ev) => updateEducationField(e.id, 'school', ev.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label className="cmp-field-label-sm">학위</label>
                                        <input
                                            type="text"
                                            className="cmp-input cmp-input-sm"
                                            value={e.degree}
                                            onChange={(ev) => updateEducationField(e.id, 'degree', ev.target.value)}
                                        />
                                    </div>
                                    <button className="cmp-btn-icon" onClick={() => removeEducation(e.id)}>
                                        <X size={12} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* 상담소 & 자기소개 */}
                    <div className="cmp-grid-2">
                        <div>
                            <label className="cmp-field-label">상담소명</label>
                            <input
                                className="cmp-input"
                                value={profile.office_name || ''}
                                onChange={(e) => setProfile((p) => ({ ...p, office_name: e.target.value }))}
                            />
                        </div>
                        <div>
                            <label className="cmp-field-label">상담소 주소</label>
                            <input
                                className="cmp-input"
                                value={profile.office_address || ''}
                                onChange={(e) => setProfile((p) => ({ ...p, office_address: e.target.value }))}
                            />
                        </div>
                    </div>
                    <div style={{ marginTop: 12, marginBottom: 14 }}>
                        <label className="cmp-field-label">자기소개</label>
                        <textarea
                            className="cmp-textarea"
                            value={profile.intro || ''}
                            onChange={(e) => setProfile((p) => ({ ...p, intro: e.target.value }))}
                        />
                    </div>

                    <button className="cmp-btn cmp-btn-primary" style={{ maxWidth: 130 }} onClick={handleSaveProfile}>
                        프로필 저장
                    </button>
                </div>

                {/* 상담 시간 설정 - registration page style */}
                <div className="cu-ep-expertise cu-ep-animate" style={{ marginTop: 32 }}>
                    <section>
                        <h3 className="cu-ep-section-title">
                            <Clock size={15} color="#8BA888" /> 상담 시간 설정
                        </h3>
                        <div className="cu-ep-schedule-list">
                            {workDays.map((day, i) => {
                                const d = day;
                                return (
                                    <div key={d.day} className={`cu-ep-schedule-row${d.active ? ' cu-ep-day-on' : ''}`}>
                                        <div className="cu-ep-day-toggle">
                                            <button
                                                onClick={() => toggleWorkDay(i)}
                                                className={`cu-ep-toggle-btn${d.active ? ' cu-ep-toggle-on' : ''}`}
                                            >
                                                <Check size={16} />
                                            </button>
                                            <span className={`cu-ep-day-label${d.active ? ' cu-ep-day-label-on' : ''}`}>{d.day}</span>
                                        </div>
                                        <div className="cu-ep-slots">
                                            {d.active ? (
                                                <div className="cu-ep-slots-row">
                                                    {Array.isArray(d.slots) && d.slots.map((slot, idx) => (
                                                        <div key={idx} className="cu-ep-slot">
                                                            <div className="cu-ep-time-select">
                                                                <select
                                                                    value={slot.start}
                                                                    onChange={e => {
                                                                        setWorkDays(prev => prev.map((wd, wi) => wi === i ? {
                                                                            ...wd,
                                                                            slots: wd.slots.map((s, si) => si === idx ? { ...s, start: e.target.value } : s)
                                                                        } : wd));
                                                                    }}
                                                                >
                                                                    {TIME_OPTIONS.map(t => (
                                                                        <option key={t} value={t}>{t}</option>
                                                                    ))}
                                                                </select>
                                                                <ChevronDown className="cu-ep-dp-chevron" />
                                                            </div>
                                                            <span className="cu-ep-time-sep">~</span>
                                                            <div className="cu-ep-time-select">
                                                                <select
                                                                    value={slot.end}
                                                                    onChange={e => {
                                                                        setWorkDays(prev => prev.map((wd, wi) => wi === i ? {
                                                                            ...wd,
                                                                            slots: wd.slots.map((s, si) => si === idx ? { ...s, end: e.target.value } : s)
                                                                        } : wd));
                                                                    }}
                                                                >
                                                                    {END_TIME_OPTIONS.filter(t => !slot.start || t > slot.start).map(t => (
                                                                        <option key={t} value={t}>{t}</option>
                                                                    ))}
                                                                </select>
                                                                <ChevronDown className="cu-ep-dp-chevron" />
                                                            </div>
                                                            {d.slots.length > 1 && (
                                                                <button
                                                                    onClick={() => {
                                                                        setWorkDays(prev => prev.map((wd, wi) => wi === i ? {
                                                                            ...wd,
                                                                            slots: wd.slots.filter((_, si) => si !== idx)
                                                                        } : wd));
                                                                    }}
                                                                    className="cu-ep-slot-rm"
                                                                >
                                                                    <X style={{ width: '.875rem', height: '.875rem' }} />
                                                                </button>
                                                            )}
                                                        </div>
                                                    ))}
                                                    <button
                                                        onClick={() => addTimeSlot(i)}
                                                        className="cu-ep-slot-add"
                                                        title="시간 추가"
                                                        disabled={!d.active}
                                                    >
                                                        <Plus style={{ width: '1rem', height: '1rem' }} />
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="cu-ep-day-off-msg">휴무일입니다.</div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        <button
                            className="cu-ep-float-btn"
                            style={{ marginTop: 24, alignSelf: 'flex-end' }}
                            onClick={handleSaveProfile}
                        >
                            <Save style={{ width: '1.2rem', height: '1.2rem' }} />
                            <span className="cu-ep-float-label">시간 저장</span>
                        </button>
                    </section>
                </div>
            </>
        );
    };

    const renderNotifSettings = () => (
        <>
            <BackHeader title="알림 설정" onBack={() => setSettingsView(null)} />
            <p className="cmp-page-sub" style={{ marginBottom: 20 }}>
                받고 싶은 알림 종류를 선택하세요.
            </p>
            <div className="cmp-list-card">
                {notifSettings.map((s) => (
                    <div key={s.id} className="cmp-notif-setting-item">
                        <div>
                            <p className="cmp-item-name" style={{ marginBottom: 2 }}>
                                {s.label}
                            </p>
                            <p className="cmp-item-sub">{s.desc}</p>
                        </div>
                        <Toggle on={s.on} onChange={() => toggleNotifSetting(s.id)} />
                    </div>
                ))}
            </div>
        </>
    );

    const renderDeleteAccount = () => (
        <>
            <BackHeader
                title="회원 탈퇴"
                onBack={() => {
                    setSettingsView(null);
                    setDeleteStep(1);
                    setDeleteInput('');
                }}
            />
            <div className="cmp-settings-card">
                {deleteStep === 1 ? (
                    <>
                        <div className="cmp-delete-icon-wrap">
                            <div className="cmp-delete-icon">
                                <Trash2 size={26} color="var(--cmp-danger)" />
                            </div>
                        </div>
                        <h3 className="cmp-delete-title">탈퇴 전 꼭 확인하세요</h3>
                        <div className="cmp-delete-warn-list">
                            {[
                                '모든 상담 기록과 내담자 데이터가 영구 삭제됩니다.',
                                '삭제된 데이터는 복구가 불가능합니다.',
                                '진행 중인 상담이 있는 경우 내담자에게 별도 안내가 필요합니다.',
                                '탈퇴 후 동일 이메일로 재가입 시 기존 데이터는 복원되지 않습니다.',
                            ].map((text, i) => (
                                <div key={i} className="cmp-delete-warn-item">
                                    <span className="cmp-delete-warn-dot" />
                                    <span>{text}</span>
                                </div>
                            ))}
                        </div>
                        <div className="cmp-btn-row" style={{ marginTop: 26 }}>
                            <button
                                className="cmp-btn cmp-btn-secondary"
                                style={{ flex: 1 }}
                                onClick={() => setSettingsView(null)}
                            >
                                취소
                            </button>
                            <button
                                className="cmp-btn cmp-btn-danger"
                                style={{ flex: 1 }}
                                onClick={() => setDeleteStep(2)}
                            >
                                다음 단계
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        <h3 className="cmp-delete-confirm-title">탈퇴를 확인해주세요</h3>
                        <p className="cmp-delete-confirm-sub">
                            아래 입력창에 <strong style={{ color: 'var(--cmp-danger)' }}>탈퇴합니다</strong>를 입력하면
                            탈퇴가 진행됩니다.
                        </p>
                        <input
                            className="cmp-input cmp-delete-input"
                            placeholder="탈퇴합니다"
                            value={deleteInput}
                            onChange={(e) => setDeleteInput(e.target.value)}
                        />
                        <div className="cmp-btn-row" style={{ marginTop: 18 }}>
                            <button
                                className="cmp-btn cmp-btn-secondary"
                                style={{ flex: 1 }}
                                onClick={() => setDeleteStep(1)}
                            >
                                이전
                            </button>
                            <button
                                className="cmp-btn cmp-btn-danger"
                                style={{ flex: 1, opacity: deleteInput === '탈퇴합니다' ? 1 : 0.4 }}
                                disabled={deleteInput !== '탈퇴합니다'}
                                onClick={() => alert('회원 탈퇴가 완료되었습니다.')}
                            >
                                탈퇴하기
                            </button>
                        </div>
                    </>
                )}
            </div>
        </>
    );

    const renderCustomer = () => (
        <>
            <PageHeader title="고객 지원" sub="이용 중 불편한 점이 있으신가요?" />
            <div className="cmp-support-grid">
                {[
                    { icon: <HelpCircle size={21} />, label: '자주 묻는 질문' },
                    { icon: <MessageCircle size={21} />, label: '1:1 문의하기' },
                    { icon: <FileText size={21} />, label: '가이드북' },
                ].map(({ icon, label }) => (
                    <div key={label} className="cmp-support-card">
                        <div className="cmp-support-icon">{icon}</div>
                        <p className="cmp-support-label">{label}</p>
                    </div>
                ))}
            </div>
        </>
    );

    const renderContent = () => {
        if (activeMenu === 'settings') {
            if (settingsView === 'profile')
                return (
                    <>
                        {
                            <BackHeader
                                title={registered ? '상담사 프로필 수정' : '상담사 등록하기'}
                                onBack={() => setSettingsView(null)}
                            />
                        }
                        {renderProfile()}
                    </>
                );
            if (settingsView === 'notifSettings') return renderNotifSettings();
            if (settingsView === 'deleteAccount') return renderDeleteAccount();
            return renderSettingsList();
        }
        const map = { notifications: renderNotifications, customer: renderCustomer };
        return (map[activeMenu] || renderDashboard)();
    };

    const navItems = [
        { id: 'dashboard', icon: <LayoutDashboard size={17} />, label: '대시보드' },
        { id: 'notifications', icon: <Bell size={17} />, label: '알림센터' },
    ];
    const tabItems = [
        { id: 'dashboard', icon: <LayoutDashboard size={19} />, label: '홈' },
        { id: 'notifications', icon: <Bell size={19} />, label: '알림' },
        { id: 'settings', icon: <Settings size={19} />, label: '설정' },
        { id: 'customer', icon: <HeadphonesIcon size={19} />, label: '고객' },
    ];

    return (
        <div className="cmp-app">
            <div className="cmp-mobile-header">
                <button className="cmp-mobile-menu-btn" onClick={() => setSidebarOpen((p) => !p)}>
                    <Menu size={21} />
                </button>
                <span className="cmp-mobile-logo">MINDWELL</span>
                <button className="cmp-mobile-menu-btn" onClick={() => go('notifications')}>
                    <Bell size={19} />
                </button>
            </div>

            {sidebarOpen && <div className="cmp-overlay visible" onClick={() => setSidebarOpen(false)} />}

            <aside className={`cmp-sidebar${sidebarOpen ? ' open' : ''}`}>
                <div className="cmp-logo" onClick={() => navigate('/counselorhome')} style={{ cursor: 'pointer' }}>
                    <div className="cmp-logo-title">MINDWELL</div>
                    <div className="cmp-logo-sub">COUNSELOR ADMIN</div>
                </div>
                <nav className="cmp-nav">
                    {navItems.map((item) => (
                        <div
                            key={item.id}
                            className={`cmp-nav-item${activeMenu === item.id ? ' active' : ''}`}
                            onClick={() => go(item.id)}
                        >
                            {item.icon}
                            <span>{item.label}</span>
                        </div>
                    ))}
                    <div
                        className={`cmp-nav-item${activeMenu === 'settings' ? ' active' : ''}`}
                        onClick={() => {
                            setSettingsOpen((p) => !p);
                            setActiveMenu('settings');
                            setSettingsView(null);
                            setSidebarOpen(false);
                        }}
                    >
                        <Settings size={17} />
                        <span style={{ flex: 1 }}>설정</span>
                        <ChevronDown
                            size={13}
                            style={{ transition: 'transform .2s', transform: settingsOpen ? 'rotate(180deg)' : 'none' }}
                        />
                    </div>
                    {settingsOpen && (
                        <div className="cmp-nav-submenu">
                            {SETTINGS_MENU.map((item) => (
                                <div
                                    key={item.id}
                                    className={`cmp-nav-subitem${settingsView === item.id ? ' active' : ''}${item.danger ? ' danger' : ''}`}
                                    onClick={() => goSettings(item.id)}
                                >
                                    {item.icon}
                                    <span>{item.label}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </nav>
                <div className="cmp-sidebar-footer">
                    <div
                        className={`cmp-footer-item${activeMenu === 'customer' ? ' active' : ''}`}
                        onClick={() => go('customer')}
                    >
                        <HeadphonesIcon size={17} />
                        <span>고객센터</span>
                    </div>
                    <div className="cmp-footer-item danger" onClick={handleLogout}>
                        <LogOut size={17} />
                        <span>로그아웃</span>
                    </div>
                </div>
            </aside>

            <main className="cmp-main">{renderContent()}</main>

            <nav className="cmp-bottom-tab">
                {tabItems.map((item) => (
                    <div
                        key={item.id}
                        className={`cmp-tab-item${activeMenu === item.id ? ' active' : ''}`}
                        onClick={() => go(item.id)}
                    >
                        <span className="cmp-tab-icon">{item.icon}</span>
                        <span className="cmp-tab-label">{item.label}</span>
                    </div>
                ))}
            </nav>
        </div>
    );
};

export default App;
