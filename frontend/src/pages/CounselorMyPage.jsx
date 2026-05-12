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
    updateSchedule
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
} from 'lucide-react';

const uid = () => Date.now() + Math.random();
const dayLabels = ['일', '월', '화', '수', '목', '금', '토'];
const timeOptions = Array.from({ length: 30 }, (_, index) => {
    const totalMinutes = 9 * 60 + index * 30;
    const hour = String(Math.floor(totalMinutes / 60)).padStart(2, '0');
    const minute = String(totalMinutes % 60).padStart(2, '0');
    return `${hour}:${minute}`;
});

const formatMonthValue = (value) => {
    if (!value) return '';
    const [year, month] = value.split('-');
    return `${year}년 ${Number(month)}월`;
};

const formatDateValue = (value) => {
    if (!value) return '';
    const [year, month, day] = value.split('-');
    return `${year}년 ${Number(month)}월 ${Number(day)}일`;
};

const isTimeBefore = (leftTime, rightTime) => {
    if (!leftTime || !rightTime) return false;
    return leftTime < rightTime;
};

const isTodayDate = (year, month, day) => {
    const today = new Date();
    return today.getFullYear() === year && today.getMonth() === month && today.getDate() === day;
};

const useOutsideClose = (open, ref, onClose) => {
    useEffect(() => {
        if (!open) return undefined;
        const handleMouseDown = (event) => {
            if (ref.current && !ref.current.contains(event.target)) {
                onClose();
            }
        };
        document.addEventListener('mousedown', handleMouseDown);
        return () => document.removeEventListener('mousedown', handleMouseDown);
    }, [open, onClose, ref]);
};

const MonthPicker = ({ value, onChange, icon = true, placeholder = '', className = '' }) => {
    const [open, setOpen] = useState(false);
    const [viewYear, setViewYear] = useState(() => {
        if (value) return Number(value.split('-')[0]);
        return new Date().getFullYear();
    });
    const ref = useRef(null);
    const months = Array.from({ length: 12 }, (_, index) => index + 1);

    useOutsideClose(open, ref, () => setOpen(false));

    const handleSelect = (year, month) => {
        onChange(`${year}-${String(month).padStart(2, '0')}`);
        setOpen(false);
    };

    return (
        <div className={`cmp-monthpicker-wrap ${className}`.trim()} ref={ref}>
            <button
                type="button"
                className={`cmp-monthpicker-input${value ? ' filled' : ''}`}
                onClick={() => setOpen((prev) => !prev)}
            >
                {icon && (
                    <span className="cmp-picker-input-icon">
                        <Calendar size={15} />
                    </span>
                )}
                <span>{value ? formatMonthValue(value) : placeholder || '연/월 선택'}</span>
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
                                onClick={() => setViewYear((year) => year - 1)}
                            >
                                <ChevronLeft size={14} />
                            </button>
                            <button
                                type="button"
                                className="cmp-picker-nav-btn"
                                onClick={() => setViewYear((year) => year + 1)}
                            >
                                <ChevronRight size={14} />
                            </button>
                        </div>
                    </div>

                    <div className="cmp-monthpicker-months">
                        {months.map((month) => {
                            const selected =
                                value &&
                                Number(value.split('-')[0]) === viewYear &&
                                Number(value.split('-')[1]) === month;

                            return (
                                <button
                                    key={month}
                                    type="button"
                                    className={`cmp-monthpicker-month${selected ? ' selected' : ''}`}
                                    onClick={() => handleSelect(viewYear, month)}
                                >
                                    {month}월
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

const DatePicker = ({ value, onChange, icon = true, placeholder = '', className = '' }) => {
    const [open, setOpen] = useState(false);
    const initialDate = value ? new Date(value) : new Date();
    const [viewYear, setViewYear] = useState(initialDate.getFullYear());
    const [viewMonth, setViewMonth] = useState(initialDate.getMonth());
    const ref = useRef(null);

    useOutsideClose(open, ref, () => setOpen(false));

    useEffect(() => {
        if (!value) return;
        const parsed = new Date(value);
        if (Number.isNaN(parsed.getTime())) return;
        setViewYear(parsed.getFullYear());
        setViewMonth(parsed.getMonth());
    }, [value]);

    const firstDay = new Date(viewYear, viewMonth, 1).getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const blanks = Array.from({ length: firstDay }, (_, index) => index);
    const days = Array.from({ length: daysInMonth }, (_, index) => index + 1);

    const handlePrevMonth = () => {
        const next = new Date(viewYear, viewMonth - 1, 1);
        setViewYear(next.getFullYear());
        setViewMonth(next.getMonth());
    };

    const handleNextMonth = () => {
        const next = new Date(viewYear, viewMonth + 1, 1);
        setViewYear(next.getFullYear());
        setViewMonth(next.getMonth());
    };

    const handleSelect = (day) => {
        const nextValue = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        onChange(nextValue);
        setOpen(false);
    };

    return (
        <div className={`cmp-monthpicker-wrap ${className}`.trim()} ref={ref}>
            <button
                type="button"
                className={`cmp-monthpicker-input${value ? ' filled' : ''}`}
                onClick={() => setOpen((prev) => !prev)}
            >
                {icon && (
                    <span className="cmp-picker-input-icon">
                        <Calendar size={15} />
                    </span>
                )}
                <span>{value ? formatDateValue(value) : placeholder || '날짜 선택'}</span>
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
                            <button type="button" className="cmp-picker-nav-btn" onClick={handlePrevMonth}>
                                <ChevronLeft size={14} />
                            </button>
                            <button type="button" className="cmp-picker-nav-btn" onClick={handleNextMonth}>
                                <ChevronRight size={14} />
                            </button>
                        </div>
                    </div>

                    <div className="cmp-datepicker-weekdays">
                        {dayLabels.map((dayLabel) => (
                            <span key={dayLabel}>{dayLabel}</span>
                        ))}
                    </div>

                    <div className="cmp-datepicker-grid">
                        {blanks.map((blank) => (
                            <div key={`blank-${blank}`} className="cmp-datepicker-blank" />
                        ))}
                        {days.map((day) => {
                            const selected =
                                value ===
                                `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                            const isToday = isTodayDate(viewYear, viewMonth, day);

                            return (
                                <button
                                    key={day}
                                    type="button"
                                    className={`cmp-datepicker-day${selected ? ' selected' : ''}${isToday ? ' today' : ''}`}
                                    onClick={() => handleSelect(day)}
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

const TimePicker = ({ value, onChange, minTime = '', disabled = false, className = '' }) => {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    useOutsideClose(open, ref, () => setOpen(false));

    const availableTimes = timeOptions.filter((time) => !minTime || time >= minTime);

    return (
        <div className={`cmp-monthpicker-wrap ${className}`.trim()} ref={ref}>
            <button
                type="button"
                className={`cmp-monthpicker-input cmp-timepicker-input${value ? ' filled' : ''}${disabled ? ' disabled' : ''}`}
                onClick={() => {
                    if (!disabled) setOpen((prev) => !prev);
                }}
                disabled={disabled}
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
                        {availableTimes.map((time) => (
                            <button
                                key={time}
                                type="button"
                                className={`cmp-timepicker-option${value === time ? ' selected' : ''}`}
                                onClick={() => {
                                    onChange(time);
                                    setOpen(false);
                                }}
                            >
                                {time}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

const initCareers = [
    {
        id: 1,
        startDate: '2019-03',
        endDate: '2022-06',
        isCurrent: false,
        description: '서울심리상담센터 상담사',
    },
    {
        id: 2,
        startDate: '2022-07',
        endDate: '',
        isCurrent: true,
        description: '마인드웰 서울 강남센터 수석 상담사',
    },
];

const initEducations = [
    {
        id: 1,
        startDate: '2013-03',
        endDate: '2017-02',
        school: '서울대학교 심리학과',
        degree: '학사',
    },
    {
        id: 2,
        startDate: '2017-03',
        endDate: '2019-02',
        school: '서울대학교 심리학과',
        degree: '석사',
    },
];

const initCertificates = [
    { id: 1, name: '임상심리전문가 1급', issuer: '한국심리학회', date: '2019-06' },
    { id: 2, name: '상담심리사 1급', issuer: '한국상담심리학회', date: '2020-03' },
];

const initWorkDays = [
    { day: '월', active: true, startTime: '09:00', endTime: '18:00' },
    { day: '화', active: true, startTime: '09:00', endTime: '18:00' },
    { day: '수', active: true, startTime: '09:00', endTime: '18:00' },
    { day: '목', active: true, startTime: '09:00', endTime: '18:00' },
    { day: '금', active: true, startTime: '09:00', endTime: '18:00' },
    { day: '토', active: false, startTime: '09:00', endTime: '18:00' },
    { day: '일', active: false, startTime: '09:00', endTime: '18:00' },
];

const initNotifications = [
    {
        id: 1,
        group: '오늘',
        items: [
            {
                id: 101,
                type: 'schedule',
                title: '오늘 상담 일정',
                desc: '10:00 김소현 • 상담 1실 / 14:00 이민준 • 상담 3실',
                time: '오전 8:00',
                unread: true,
            },
            {
                id: 102,
                type: 'booking',
                title: '예약 확정',
                desc: '한수지 님의 대면 상담이 승인되었습니다.',
                time: '오전 9:10',
                unread: true,
            },
            {
                id: 103,
                type: 'msg',
                title: '새 메시지',
                desc: '이민준 님: 오늘 조금 늦을 것 같습니다.',
                time: '오전 9:45',
                unread: true,
            },
        ],
    },
    {
        id: 2,
        group: '어제',
        items: [
            {
                id: 104,
                type: 'booking',
                title: '예약 확정',
                desc: '정현우 님의 화상 상담이 확정되었습니다.',
                time: '오후 3:20',
                unread: false,
            },
            {
                id: 105,
                type: 'notice',
                title: '시스템 공지',
                desc: '내일 오후 2시부터 서버 점검이 예정되어 있습니다.',
                time: '오전 9:00',
                unread: false,
            },
        ],
    },
    {
        id: 3,
        group: '이번 주',
        items: [
            {
                id: 106,
                type: 'schedule',
                title: '예약 취소',
                desc: '박지영 님이 5월 22일 상담을 취소했습니다.',
                time: '5월 21일',
                unread: false,
            },
        ],
    },
];

const initNotifSettings = [
    {
        id: 'schedule',
        label: '상담 일정 알림',
        desc: '오늘 예정된 상담 일정을 알려드립니다.',
        on: true,
    },
    {
        id: 'booking',
        label: '예약 확정 알림',
        desc: '새로운 예약이 확정되면 알려드립니다.',
        on: true,
    },
    {
        id: 'cancel',
        label: '예약 취소 알림',
        desc: '내담자가 예약을 취소하면 알려드립니다.',
        on: true,
    },
    {
        id: 'msg',
        label: '메시지 알림',
        desc: '읽지 않은 메시지가 있을 때 알려드립니다.',
        on: false,
    },
    {
        id: 'notice',
        label: '시스템 공지 알림',
        desc: '서비스 점검 및 공지사항을 알려드립니다.',
        on: true,
    },
    {
        id: 'marketing',
        label: '마케팅 알림',
        desc: '이벤트 및 혜택 소식을 알려드립니다.',
        on: false,
    },
];

const NotifIcon = ({ type }) => {
    const iconMap = {
        schedule: <Calendar size={15} />,
        booking: <Check size={15} />,
        msg: <MessageSquare size={15} />,
        notice: <AlertCircle size={15} />,
    };
    return <div className="cmp-item-avatar notif">{iconMap[type] || <Bell size={15} />}</div>;
};

const PageHeader = ({ title, sub }) => (
    <div className="cmp-page-header">
        <h2 className="cmp-page-title">{title}</h2>
        {sub && <p className="cmp-page-sub">{sub}</p>}
    </div>
);

const Toggle = ({ on, onChange }) => (
    <button className={`cmp-toggle${on ? ' on' : ''}`} onClick={onChange} aria-label="toggle">
        <span className="cmp-toggle-thumb" />
    </button>
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

const App = () => {
    const navigate = useNavigate();

    const [searchParams] = useSearchParams();
    const [activeMenu, setActiveMenu] = useState(searchParams.get('tab') || 'dashboard');
    const [settingsView, setSettingsView] = useState(null);
    const [settingsOpen, setSettingsOpen] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    // 등록 여부를 항상 백엔드에서 확인
    const [registered, setRegistered] = useState(false);
    const [loadingRegistered, setLoadingRegistered] = useState(true);
    const [profileStatus, setProfileStatus] = useState('');

    // 상담사 프로필 등록 여부 확인 API 호출
    const fetchRegistered = useCallback(async () => {
        setLoadingRegistered(true);
        try {
            const token = localStorage.getItem('access_token');
            if (!token) {
                setRegistered(false);
                setProfileStatus('');
                setLoadingRegistered(false);
                return;
            }
            const profile = await getCounselorProfile(token);
            if (profile && profile.status) {
                setRegistered(true);
                setProfileStatus(profile.status);
            } else {
                setRegistered(false);
                setProfileStatus('');
            }
        } catch (e) {
            setRegistered(false);
            setProfileStatus('');
        } finally {
            setLoadingRegistered(false);
        }
    }, []);

    useEffect(() => {
        fetchRegistered();
    }, [fetchRegistered]);
    // DB 연동용 state
    const [profile, setProfile] = useState({});
    const [specialties, setSpecialties] = useState([]);
    const [careers, setCareers] = useState([]);
    const [educations, setEducations] = useState([]);
    const [certificates, setCertificates] = useState([]);
    const [workDays, setWorkDays] = useState([]);
    const [holidays, setHolidays] = useState([]);
    const [newHoliday, setNewHoliday] = useState('');
        // DB에서 상담사 정보 불러오기
        useEffect(() => {
            const fetchAll = async () => {
                const token = localStorage.getItem('access_token');
                if (!token) return;
                try {
                    // 프로필
                    const prof = await getCounselorProfile(token);
                    setProfile(prof || {});
                    // 전문분야
                    const specs = await getSpecialty(token);
                    setSpecialties(specs || []);
                    // 자격증: DB → 프론트 필드명 변환
                    const certs = await getCertificates(token);
                    setCertificates(
                        (certs || []).map((c, idx) => ({
                            id: c.id || idx + 1,
                            name: c.certificate_name || '',
                            issuer: c.issuer || '',
                            date: c.acquisition_date || '',
                        }))
                    );
                    // 학력: DB → 프론트 필드명 변환
                    const edus = await getEducations(token);
                    setEducations(
                        (edus || []).map((e, idx) => ({
                            id: e.id || idx + 1,
                            school: e.school_name || '',
                            degree: e.major || '',
                            startDate: e.start_date || '',
                            endDate: e.end_date || '',
                        }))
                    );
                    // 경력: DB → 프론트 필드명 변환
                    const exps = await getExperiences(token);
                    setCareers(
                        (exps || []).map((e, idx) => ({
                            id: e.id || idx + 1,
                            startDate: e.start_date || '',
                            endDate: e.end_date || '',
                            isCurrent: e.is_current || false,
                            description: e.content || '',
                        }))
                    );
                    // 스케줄
                    const scheds = await getSchedules(token);
                    // workDays: [{day, active, startTime, endTime}]
                    setWorkDays(
                        (scheds || []).length === 7
                            ? scheds.map((s) => ({
                                  day: s.day,
                                  active: s.active,
                                  startTime: s.start_time,
                                  endTime: s.end_time,
                              }))
                            : initWorkDays
                    );
                    // 휴무일(추가 구현 필요시)
                    setHolidays([]); // DB에 별도 저장 필요시 구현
                } catch (e) {
                    // ignore
                }
            };
            fetchAll();
        }, [registered]);
    const [notifications, setNotifications] = useState([]);
    // 알림 불러오기
    useEffect(() => {
        const fetchNotifications = async () => {
            const token = localStorage.getItem('access_token');
            if (!token) return;
            try {
                const res = await getNotifications(token);
                // 날짜별 그룹핑 (오늘/어제/이번 주 등은 단순화, 실제 서비스에서는 날짜별 그룹핑 필요)
                const notifs = res.data || [];
                // 예시: 오늘/어제/이전 등으로 그룹핑 (여기선 모두 '최근 알림'으로 묶음)
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
            } catch (e) {
                // ignore
            }
        };
        fetchNotifications();
    }, [activeMenu]);
    const [notifSettings, setNotifSettings] = useState(initNotifSettings);
    const [deleteStep, setDeleteStep] = useState(1);
    const [deleteInput, setDeleteInput] = useState('');


    // CRUD 핸들러 (DB 연동)
    const addCareer = () => setCareers((prev) => [...prev, { id: uid(), startDate: '', endDate: '', isCurrent: false, description: '' }]);
    const removeCareer = (id) => setCareers((prev) => prev.filter((career) => career.id !== id));
    const updateCareer = (id, key, value) => setCareers((prev) => prev.map((career) => (career.id === id ? { ...career, [key]: value } : career)));
    const toggleCareerCurrent = (id) => setCareers((prev) => prev.map((career) => (career.id === id ? { ...career, isCurrent: !career.isCurrent, endDate: '' } : career)));
    const addEducation = () => setEducations((prev) => [...prev, { id: uid(), startDate: '', endDate: '', school: '', degree: '' }]);
    const removeEducation = (id) => setEducations((prev) => prev.filter((education) => education.id !== id));
    const updateEducation = (id, key, value) => setEducations((prev) => prev.map((education) => (education.id === id ? { ...education, [key]: value } : education)));
    const addCertificate = () => setCertificates((prev) => [...prev, { id: uid(), name: '', issuer: '', date: '' }]);
    const removeCertificate = (id) => setCertificates((prev) => prev.filter((certificate) => certificate.id !== id));
    const updateCertificate = (id, key, value) => setCertificates((prev) => prev.map((certificate) => (certificate.id === id ? { ...certificate, [key]: value } : certificate)));
    const toggleWorkDay = (index) => {
        const next = [...workDays];
        next[index].active = !next[index].active;
        setWorkDays(next);
    };
    const updateWorkTime = (index, key, value) => {
        const next = [...workDays];
        next[index][key] = value;
        if (key === 'startTime' && isTimeBefore(next[index].endTime, value)) {
            next[index].endTime = value;
        }
        setWorkDays(next);
    };

    const addHoliday = () => {
        if (newHoliday && !holidays.includes(newHoliday)) {
            setHolidays((prev) => [...prev, newHoliday]);
            setNewHoliday('');
        }
    };

    // 알림 클릭 시 읽음 처리
    const handleNotifClick = async (groupId, itemId) => {
        const token = localStorage.getItem('access_token');
        try {
            await markNotificationRead(itemId, token);
            setNotifications((prev) =>
                prev.map((group) =>
                    group.id === groupId
                        ? {
                              ...group,
                              items: group.items.map((item) =>
                                  item.id === itemId ? { ...item, unread: false } : item
                              ),
                          }
                        : group
                )
            );
        } catch (e) {}
    };

    const toggleNotifSetting = (id) =>
        setNotifSettings((prev) =>
            prev.map((setting) => (setting.id === id ? { ...setting, on: !setting.on } : setting))
        );

    const go = (menu) => {
        setActiveMenu(menu);
        setSettingsView(null);
        setSidebarOpen(false);
        if (menu !== 'settings') setSettingsOpen(false);
    };

    // 로고 클릭 시 CounselorHome.jsx로 이동
    const handleLogoClick = () => {
        navigate('/counselorhome');
    };

    const goSettings = (view) => {
        // 등록이 안 되어 있어도 무조건 settings/profile로 진입 (이동 막음)
        setActiveMenu('settings');
        setSettingsView(view);
        setSidebarOpen(false);
    };

    const handleLogout = () => {
        ['access_token', 'user'].forEach((key) => {
            localStorage.removeItem(key);
            sessionStorage.removeItem(key);
        });
        navigate('/login');
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

    const settingsMenuItems = [
        {
            id: 'profile',
            icon: <UserCog size={16} />,
            label: registered ? '상담사 프로필 수정' : '상담사 등록하기',
            sub: registered ? '프로필 정보를 수정합니다.' : '상담사 정보를 처음 등록합니다.',
        },
        {
            id: 'notifSettings',
            icon: <BellRing size={16} />,
            label: '알림 설정',
            sub: '받을 알림 종류를 설정합니다.',
        },
        {
            id: 'deleteAccount',
            icon: <Trash2 size={16} />,
            label: '회원 탈퇴',
            sub: '계정 및 모든 데이터를 삭제합니다.',
            danger: true,
        },
    ];

    // 로그인한 상담사 이름 가져오기
    const getCounselorName = () => {
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            if (!user) return '';
            return user.full_name || user.name || user.username || '';
        } catch {
            return '';
        }
    };

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
                        onClick: () => navigate('/CounselorPlanner'),
                    },
                    {
                        icon: <Clock size={15} color="#FFB74D" />,
                        bg: '#FFF5E6',
                        label: '승인 대기 요청',
                        value: '2 건',
                        onClick: () => navigate('/CounselorPlanner'),
                    },
                    {
                        icon: <MessageCircle size={15} color="#EF5350" />,
                        bg: '#FFEBEE',
                        label: '읽지 않은 메시지',
                        value: '5 건',
                        onClick: () => navigate('/CounselorMessages'),
                    },
                ].map(({ icon, bg, label, value, onClick }) => (
                    <div key={label} className="cmp-stat-card" onClick={onClick}>
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
                <button className="cmp-next-session-btn" onClick={() => navigate('/CounselorClient')}>
                    내담자 관리 <ChevronRight size={14} />
                </button>
            </div>
        </>
    );

    const renderNotifications = () => (
        <>
            <PageHeader title="알림 센터" sub="상담 일정, 예약 확정 등 최근 알림을 확인하세요." />
            <div className="cmp-list-card">
                {notifications.length === 0 || notifications.every((g) => !g.items?.length) ? (
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
                {settingsMenuItems.map((item) => (
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

    // DB 연동 프로필 저장
    const handleSaveProfile = async () => {
        const token = localStorage.getItem('access_token');
        // 1. 프로필
        await updateCounselorProfile(profile, token);
        // 2. 전문분야(추후 구현)
        // await updateSpecialty(specialties, token);
        // 3. 자격증
        await updateCertificate(certificates.map(({ id, ...rest }) => rest), token);
        // 4. 학력
        await updateEducation(educations.map(({ id, ...rest }) => rest), token);
        // 5. 경력
        await updateExperience(careers.map(({ id, ...rest }) => rest), token);
        // 6. 스케줄
        await updateSchedule(
            workDays.map((d) => ({
                day: d.day,
                active: d.active,
                start_time: d.startTime,
                end_time: d.endTime,
            })),
            token
        );
        alert('저장되었습니다.');
    };

    const renderProfile = () => (
        <>
            <BackHeader
                title={registered ? '상담사 프로필 수정' : '상담사 등록하기'}
                onBack={() => setSettingsView(null)}
            />
            {loadingRegistered ? (
                <div className="cmp-settings-card" style={{ textAlign: 'center', padding: '52px 28px' }}>
                    <div className="cmp-register-title">상태 확인 중...</div>
                </div>
            ) : !registered ? (
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
            ) : profileStatus === '심사중' ? (
                <div className="cmp-settings-card" style={{ textAlign: 'center', padding: '52px 28px' }}>
                    <div className="cmp-register-icon">⏳</div>
                    <h3 className="cmp-register-title">프로필 등록 심사중</h3>
                    <p className="cmp-register-sub">관리자 심사 후 승인 시 프로필이 공개됩니다.</p>
                    <button
                        className="cmp-btn cmp-btn-disabled"
                        style={{ padding: '13px 28px', fontSize: 14 }}
                        disabled
                    >
                        심사중
                    </button>
                </div>
            ) : profileStatus === '반려' ? (
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
            ) : (
                <>
                    <div className="cmp-settings-card">
                        <div className="cmp-card-title">
                            <User size={15} color="var(--cmp-primary)" /> 기본 정보
                        </div>
                        <div className="cmp-profile-upload">
                            <div className="cmp-profile-img-lg">
                                🧔‍♂️
                                <button className="cmp-profile-edit-btn">
                                    <Settings size={11} />
                                </button>
                            </div>
                            <div>
                                <p style={{ fontSize: 11, color: 'var(--cmp-sub)', marginBottom: 3 }}>프로필 사진</p>
                                <p style={{ fontSize: 12, fontWeight: 600 }}>사진을 클릭하여 업로드</p>
                            </div>
                        </div>
                        {/* DB 연동 기본 정보 */}
                        <div className="cmp-grid-2">
                            <div>
                                <label className="cmp-field-label">아이디</label>
                                <input className="cmp-input" value={profile.user_id || ''} readOnly style={{ background: '#f5f5f5', color: '#888' }} />
                            </div>
                            <div>
                                <label className="cmp-field-label">이메일</label>
                                <input className="cmp-input" value={profile.email || ''} onChange={e => setProfile(p => ({ ...p, email: e.target.value }))} />
                            </div>
                            <div>
                                <label className="cmp-field-label">이름</label>
                                <input className="cmp-input" value={profile.name || ''} onChange={e => setProfile(p => ({ ...p, name: e.target.value }))} />
                            </div>
                            <div>
                                <label className="cmp-field-label">연락처</label>
                                <input className="cmp-input" value={profile.phone || ''} onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))} />
                            </div>
                            <div>
                                <label className="cmp-field-label">전화번호</label>
                                <input className="cmp-input" value={profile.tel || ''} onChange={e => setProfile(p => ({ ...p, tel: e.target.value }))} />
                            </div>
                            <div>
                                <label className="cmp-field-label">전문 분야</label>
                                <input className="cmp-input" value={profile.specialty || ''} onChange={e => setProfile(p => ({ ...p, specialty: e.target.value }))} />
                            </div>
                            <div>
                                <label className="cmp-field-label">상담 가격(원)</label>
                                <input
                                    className="cmp-input"
                                    type="text"
                                    inputMode="numeric"
                                    pattern="[0-9]*"
                                    value={
                                        profile.price !== undefined && profile.price !== ''
                                            ? Number(profile.price).toLocaleString('ko-KR')
                                            : ''
                                    }
                                    onChange={e => {
                                        // 숫자만 추출
                                        const onlyNum = e.target.value.replace(/[^0-9]/g, '');
                                        setProfile(p => ({ ...p, price: onlyNum }));
                                    }}
                                />
                            </div>
                        </div>
                        <div className="cmp-section-divider" style={{ marginTop: 14 }}>
                            <div className="cmp-sub-section-header">
                                <span className="cmp-field-label" style={{ margin: 0 }}>
                                    경력 사항
                                </span>
                                <button className="cmp-btn-outline-sm" onClick={addCareer}>
                                    + 추가
                                </button>
                            </div>
                            {careers.map((career) => (
                                <div key={career.id} className="cmp-row-card">
                                    <div className="cmp-career-grid">
                                        <div>
                                            <label className="cmp-field-label-sm">시작</label>
                                            <MonthPicker
                                                value={career.startDate}
                                                onChange={(value) => updateCareer(career.id, 'startDate', value)}
                                                className="cmp-input-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="cmp-field-label-sm">종료</label>
                                            <MonthPicker
                                                value={career.endDate}
                                                onChange={(value) => updateCareer(career.id, 'endDate', value)}
                                                className="cmp-input-sm"
                                                icon={!career.isCurrent}
                                                placeholder={career.isCurrent ? '진행중' : ''}
                                                disabled={career.isCurrent}
                                            />
                                        </div>
                                        <div>
                                            <label className="cmp-field-label-sm">경력 내용</label>
                                            <input
                                                type="text"
                                                className="cmp-input cmp-input-sm"
                                                value={career.description}
                                                onChange={(event) =>
                                                    updateCareer(career.id, 'description', event.target.value)
                                                }
                                            />
                                        </div>
                                        <button className="cmp-btn-icon" onClick={() => removeCareer(career.id)}>
                                            <X size={12} />
                                        </button>
                                    </div>
                                    <div className="cmp-checkbox-row">
                                        <input
                                            type="checkbox"
                                            checked={career.isCurrent}
                                            onChange={() => toggleCareerCurrent(career.id)}
                                        />
                                        <label>현재 진행중</label>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="cmp-section-divider">
                            <div className="cmp-sub-section-header" style={{ alignItems: 'center' }}>
                                <span className="cmp-field-label" style={{ margin: 0 }}>
                                    자격증
                                </span>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                    <button className="cmp-btn-outline-sm" onClick={addCertificate}>
                                        + 추가
                                    </button>
                                    {certificates.length > 1 && (
                                        <button
                                            className="cmp-btn-icon"
                                            style={{ marginLeft: 2 }}
                                            onClick={() => removeCertificate(certificates[certificates.length - 1].id)}
                                            title="마지막 자격증 삭제"
                                        >
                                            <X size={14} />
                                        </button>
                                    )}
                                </div>
                            </div>
                            {certificates.map((certificate) => (
                                <div key={certificate.id} className="cmp-row-card">
                                    <div className="cmp-cert-grid">
                                        <div>
                                            <label className="cmp-field-label-sm">자격증명</label>
                                            <input
                                                type="text"
                                                className="cmp-input cmp-input-sm"
                                                value={certificate.name}
                                                onChange={(event) =>
                                                    updateCertificate(certificate.id, 'name', event.target.value)
                                                }
                                            />
                                        </div>
                                        <div>
                                            <label className="cmp-field-label-sm">발급 기관</label>
                                            <input
                                                type="text"
                                                className="cmp-input cmp-input-sm"
                                                value={certificate.issuer}
                                                onChange={(event) =>
                                                    updateCertificate(certificate.id, 'issuer', event.target.value)
                                                }
                                            />
                                        </div>
                                        <div>
                                            <label className="cmp-field-label-sm">취득일</label>
                                            <MonthPicker
                                                value={certificate.date}
                                                onChange={(value) => updateCertificate(certificate.id, 'date', value)}
                                                className="cmp-input-sm"
                                            />
                                        </div>
                                        {/* x버튼 제거됨 */}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="cmp-section-divider">
                            <div className="cmp-sub-section-header">
                                <span className="cmp-field-label" style={{ margin: 0 }}>
                                    학력 사항
                                </span>
                                <button className="cmp-btn-outline-sm" onClick={addEducation}>
                                    + 추가
                                </button>
                            </div>
                            {educations.map((education) => (
                                <div key={education.id} className="cmp-row-card">
                                    <div className="cmp-edu-grid">
                                        <div>
                                            <label className="cmp-field-label-sm">시작</label>
                                            <MonthPicker
                                                value={education.startDate}
                                                onChange={(value) => updateEducation(education.id, 'startDate', value)}
                                                className="cmp-input-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="cmp-field-label-sm">졸업</label>
                                            <MonthPicker
                                                value={education.endDate}
                                                onChange={(value) => updateEducation(education.id, 'endDate', value)}
                                                className="cmp-input-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="cmp-field-label-sm">학교 / 전공</label>
                                            <input
                                                type="text"
                                                className="cmp-input cmp-input-sm"
                                                value={education.school}
                                                onChange={(event) =>
                                                    updateEducation(education.id, 'school', event.target.value)
                                                }
                                            />
                                        </div>
                                        <div>
                                            <label className="cmp-field-label-sm">학위</label>
                                            <input
                                                type="text"
                                                className="cmp-input cmp-input-sm"
                                                value={education.degree}
                                                onChange={(event) =>
                                                    updateEducation(education.id, 'degree', event.target.value)
                                                }
                                            />
                                        </div>
                                        <button className="cmp-btn-icon" onClick={() => removeEducation(education.id)}>
                                            <X size={12} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="cmp-grid-2">
                            <div>
                                <label className="cmp-field-label">상담소명</label>
                                <input className="cmp-input" value={profile.office_name || ''} onChange={e => setProfile(p => ({ ...p, office_name: e.target.value }))} />
                            </div>
                            <div>
                                <label className="cmp-field-label">상담소 주소</label>
                                <input className="cmp-input" value={profile.office_address || ''} onChange={e => setProfile(p => ({ ...p, office_address: e.target.value }))} />
                            </div>
                        </div>
                        <div style={{ marginTop: 12, marginBottom: 14 }}>
                            <label className="cmp-field-label">자기소개</label>
                            <textarea
                                className="cmp-textarea"
                                value={profile.intro || ''}
                                onChange={e => setProfile(p => ({ ...p, intro: e.target.value }))}
                            />
                        </div>
                        <button className="cmp-btn cmp-btn-primary" style={{ maxWidth: 130 }} onClick={handleSaveProfile}>
                            프로필 저장
                        </button>
                    </div>
                    <div className="cmp-settings-card">
                        <div className="cmp-card-title">
                            <Clock size={15} color="var(--cmp-primary)" /> 상담 시간 설정
                        </div>
                        <label className="cmp-field-label" style={{ marginBottom: 12 }}>
                            요일별 운영 시간
                        </label>
                        {workDays.map((day, index) => (
                            <div key={day.day} className={`cmp-day-row${!day.active ? ' inactive' : ''}`}>
                                <div className="cmp-day-grid">
                                    <div className={`cmp-day-chip${day.active ? ' active' : ''}`}>{day.day}</div>
                                    <div>
                                        <label className="cmp-field-label-sm">시작</label>
                                        <TimePicker
                                            className="cmp-input-sm"
                                            disabled={!day.active}
                                            value={day.startTime}
                                            onChange={(value) => updateWorkTime(index, 'startTime', value)}
                                        />
                                    </div>
                                    <div>
                                        <label className="cmp-field-label-sm">종료</label>
                                        <TimePicker
                                            className="cmp-input-sm"
                                            disabled={!day.active}
                                            minTime={day.startTime}
                                            value={day.endTime}
                                            onChange={(value) => updateWorkTime(index, 'endTime', value)}
                                        />
                                    </div>
                                    <div className="cmp-checkbox-row">
                                        <input
                                            type="checkbox"
                                            checked={!day.active}
                                            onChange={() => toggleWorkDay(index)}
                                        />
                                        <label>쉬는 날</label>
                                    </div>
                                </div>
                            </div>
                        ))}
                        <label className="cmp-field-label" style={{ marginTop: 18, marginBottom: 9 }}>
                            휴무일 설정
                        </label>
                        <div className="cmp-flex-gap" style={{ marginBottom: 9 }}>
                            <DatePicker
                                value={newHoliday}
                                onChange={setNewHoliday}
                                className="cmp-date-input"
                                icon
                                placeholder="휴무일 선택"
                            />
                            <button className="cmp-btn-add" onClick={addHoliday}>
                                + 추가
                            </button>
                        </div>
                        <div className="cmp-holiday-list">
                            {holidays.length === 0 ? (
                                <p className="cmp-holiday-empty">등록된 휴무일이 없습니다</p>
                            ) : (
                                <div className="cmp-holiday-chips">
                                    {[...holidays].sort().map((date, index) => (
                                        <div key={date} className="cmp-holiday-chip">
                                            <Calendar size={11} color="var(--cmp-primary)" />
                                            <span>{date}</span>
                                            <X
                                                size={11}
                                                style={{ cursor: 'pointer', color: 'var(--cmp-sub)' }}
                                                onClick={() =>
                                                    setHolidays(
                                                        holidays.filter((_, innerIndex) => innerIndex !== index)
                                                    )
                                                }
                                            />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        <button className="cmp-btn cmp-btn-primary" style={{ maxWidth: 130, marginTop: 14 }} onClick={handleSaveProfile}>
                            시간 저장
                        </button>
                    </div>
                </>
            )}
        </>
    );

    const renderNotifSettings = () => (
        <>
            <BackHeader title="알림 설정" onBack={() => setSettingsView(null)} />
            <p className="cmp-page-sub" style={{ marginBottom: 20 }}>
                받고 싶은 알림 종류를 선택하세요.
            </p>
            <div className="cmp-list-card">
                {notifSettings.map((setting) => (
                    <div key={setting.id} className="cmp-notif-setting-item">
                        <div>
                            <p className="cmp-item-name" style={{ marginBottom: 2 }}>
                                {setting.label}
                            </p>
                            <p className="cmp-item-sub">{setting.desc}</p>
                        </div>
                        <Toggle on={setting.on} onChange={() => toggleNotifSetting(setting.id)} />
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
            {deleteStep === 1 ? (
                <div className="cmp-settings-card">
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
                        ].map((text, index) => (
                            <div key={index} className="cmp-delete-warn-item">
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
                        <button className="cmp-btn cmp-btn-danger" style={{ flex: 1 }} onClick={() => setDeleteStep(2)}>
                            다음 단계
                        </button>
                    </div>
                </div>
            ) : (
                <div className="cmp-settings-card">
                    <h3 className="cmp-delete-confirm-title">탈퇴를 확인해주세요</h3>
                    <p className="cmp-delete-confirm-sub">
                        아래 입력창에 <strong style={{ color: 'var(--cmp-danger)' }}>탈퇴합니다</strong>를 입력하면
                        탈퇴가 진행됩니다.
                    </p>
                    <input
                        className="cmp-input cmp-delete-input"
                        placeholder="탈퇴합니다"
                        value={deleteInput}
                        onChange={(event) => setDeleteInput(event.target.value)}
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
                </div>
            )}
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
            if (settingsView === 'profile') return renderProfile();
            if (settingsView === 'notifSettings') return renderNotifSettings();
            if (settingsView === 'deleteAccount') return renderDeleteAccount();
            return renderSettingsList();
        }

        switch (activeMenu) {
            case 'notifications':
                return renderNotifications();
            case 'customer':
                return renderCustomer();
            default:
                return renderDashboard();
        }
    };

    return (
        <div className="cmp-app">
            <div className="cmp-mobile-header">
                <button className="cmp-mobile-menu-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
                    <Menu size={21} />
                </button>
                <span className="cmp-mobile-logo">MINDWELL</span>
                <button className="cmp-mobile-menu-btn" onClick={() => go('notifications')}>
                    <Bell size={19} />
                </button>
            </div>

            {sidebarOpen && <div className="cmp-overlay visible" onClick={() => setSidebarOpen(false)} />}

            <aside className={`cmp-sidebar${sidebarOpen ? ' open' : ''}`}>
                <div className="cmp-logo" onClick={handleLogoClick} style={{ cursor: 'pointer' }}>
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
                            setSettingsOpen((open) => !open);
                            setActiveMenu('settings');
                            setSettingsView(null);
                            setSidebarOpen(false);
                        }}
                    >
                        <Settings size={17} />
                        <span style={{ flex: 1 }}>설정</span>
                        <ChevronDown
                            size={13}
                            style={{
                                transition: 'transform .2s',
                                transform: settingsOpen ? 'rotate(180deg)' : 'none',
                            }}
                        />
                    </div>

                    {settingsOpen && (
                        <div className="cmp-nav-submenu">
                            {settingsMenuItems.map((item) => (
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
