import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Mail,
    Lock,
    ChevronRight,
    ChevronLeft,
    ChevronDown,
    BadgeCheck,
    Eye,
    EyeOff,
    User,
    Phone,
    Heart,
    Award,
    Calendar,
    ShieldCheck,
    Check,
    AlertTriangle,
    Info,
    Bell,
    CheckCircle,
    ArrowRight,
    PartyPopper,
} from 'lucide-react';
import { signUp, checkIdDuplicate } from '../api/auth';
import '../static/SignUp.css';
import Header from '../components/header.jsx';
import Footer from '../components/footer.jsx';
import MobileTap from '../components/mobileTap.jsx';

function useToast() {
    const [toast, setToast] = useState({ visible: false, message: '', type: 'info' });
    const timerRef = useRef(null);

    const showToast = (message, type = 'info') => {
        clearTimeout(timerRef.current);
        setToast({ visible: true, message, type });
        timerRef.current = setTimeout(() => setToast((t) => ({ ...t, visible: false })), 3000);
    };

    return { toast, showToast };
}

function getPasswordStrength(val) {
    if (!val) return { score: 0, label: '미입력', color: 'gray' };
    let score = 0;
    if (val.length >= 8) score++;
    if (/[0-9]/.test(val) && /[a-zA-Z]/.test(val)) score++;
    if (/[^A-Za-z0-9]/.test(val)) score++;
    if (score === 1) return { score: 1, label: '위험', color: 'rose' };
    if (score === 2) return { score: 2, label: '보통', color: 'amber' };
    return { score: 3, label: '안전', color: 'brand' };
}

/* ══════════════════════════════════════════
   커스텀 달력 드롭다운 컴포넌트
══════════════════════════════════════════ */
function CalDropdown({ label, value, options, onChange }) {
    const [open, setOpen] = useState(false);
    const wrapRef = useRef(null);
    const listRef = useRef(null);
    const selectedRef = useRef(null);

    // 외부 클릭 시 닫기
    useEffect(() => {
        const handler = (e) => {
            if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    // 열릴 때 리스트 컨테이너 내부에서만 선택 항목으로 스크롤 (페이지 스크롤 없음)
    useEffect(() => {
        if (open && listRef.current && selectedRef.current) {
            const list = listRef.current;
            const item = selectedRef.current;
            const listCenter = list.clientHeight / 2;
            const itemOffset = item.offsetTop + item.clientHeight / 2;
            list.scrollTop = itemOffset - listCenter;
        }
    }, [open]);

    return (
        <div className="su3-cal-dropdown-wrap" ref={wrapRef}>
            <button
                type="button"
                className={`su3-cal-select-btn${open ? ' su3-cal-select-btn--open' : ''}`}
                onClick={(e) => { e.stopPropagation(); setOpen(!open); }}
            >
                {label}
                <ChevronDown size={13} className="su3-cal-select-chevron" />
            </button>

            {open && (
                <div className="su3-cal-dropdown" onClick={(e) => e.stopPropagation()}>
                    <div className="su3-cal-dropdown-list" ref={listRef}>
                        {options.map((opt) => (
                            <div
                                key={opt.value}
                                ref={opt.value === value ? selectedRef : null}
                                className={`su3-cal-dropdown-item${opt.value === value ? ' su3-cal-dropdown-item--selected' : ''}`}
                                onClick={() => { onChange(opt.value); setOpen(false); }}
                            >
                                {opt.label}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export default function SignupPage() {
    const [activeTab, setActiveTab] = useState('');
    const navigate = useNavigate();
    const { toast, showToast } = useToast();

    /* ── state ── */
    const [currentStep, setCurrentStep] = useState(1);
    const [isSuccess, setIsSuccess] = useState(false);
    const [successInfo, setSuccessInfo] = useState({});

    const [formData, setFormData] = useState({
        role: 'user',
        name: '',
        id: '',
        phone: '',
        email: '',
        password: '',
        confirmPassword: '',
        birth: '',
        gender: 'male',
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isCheckingId, setIsCheckingId] = useState(false);
    const [idStatus, setIdStatus] = useState(null);
    const [agree, setAgree] = useState(false);
    const [agreeMarketing, setAgreeMarketing] = useState(false);
    const [showDetail, setShowDetail] = useState(false);

    const calendarRef = useRef(null);
    const topRef = useRef(null);
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);
    const [currentMonth, setCurrentMonth] = useState(() => new Date());

    /* ── formatters / validators ── */
    const formatPhoneNumber = (value) => {
        const numbers = value.replace(/[^\d]/g, '');
        if (numbers.length <= 3) return numbers;
        if (numbers.length <= 7) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
        return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`;
    };
    const formatId = (value) => value.replace(/[^a-zA-Z0-9]/g, '');
    const validateIdComposition = (value) => {
        if (!value) return null;
        return value.length >= 4 && value.length <= 8 && /[a-zA-Z]/.test(value) && /[0-9]/.test(value);
    };
    const validateEmailFormat = (value) => {
        if (!value) return null;
        return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value);
    };
    const validatePasswordFormat = (value) => {
        if (!value) return null;
        return value.length >= 6 && value.length <= 13 && /[a-zA-Z]/.test(value) && /[0-9]/.test(value);
    };

    /* ── handlers ── */
    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'phone') {
            setFormData((prev) => ({ ...prev, [name]: formatPhoneNumber(value) }));
        } else if (name === 'id') {
            setFormData((prev) => ({ ...prev, [name]: formatId(value) }));
            setIdStatus(null);
        } else if (name === 'password' || name === 'confirmPassword') {
            setFormData((prev) => ({ ...prev, [name]: value.slice(0, 13) }));
        } else {
            setFormData((prev) => ({ ...prev, [name]: value }));
        }
    };

    const handleIdCheck = async () => {
        if (!formData.id || !validateIdComposition(formData.id)) return;
        setIsCheckingId(true);
        try {
            const result = await checkIdDuplicate(formData.id);
            setIdStatus(result.available ? 'available' : 'taken');
            showToast(
                result.available ? '사용 가능한 아이디입니다.' : '이미 사용 중인 아이디입니다.',
                result.available ? 'success' : 'error'
            );
        } catch {
            showToast('중복 확인 중 오류가 발생했습니다.', 'error');
            setIdStatus(null);
        } finally {
            setIsCheckingId(false);
        }
    };

    /* derived validation */
    const isIdValid = validateIdComposition(formData.id);
    const isEmailValid = validateEmailFormat(formData.email);
    const isPasswordValid = validatePasswordFormat(formData.password);
    const isPasswordMatch =
        formData.password && formData.confirmPassword
            ? formData.password === formData.confirmPassword
            : null;
    const pwStrength = getPasswordStrength(formData.password);

    /* ── step navigation ── */
    const goNext = () => {
        if (currentStep === 1) {
            if (!formData.role) { showToast('가입 유형을 선택해 주세요.', 'error'); return; }
            if (isEmailValid === false || !formData.email) { showToast('올바른 이메일 주소를 입력해 주세요.', 'error'); return; }
            if (idStatus !== 'available') { showToast('아이디 중복 확인을 진행해 주세요.', 'warn'); return; }
            if (!isPasswordValid) { showToast('비밀번호를 올바르게 입력해 주세요.', 'error'); return; }
            if (!isPasswordMatch) { showToast('비밀번호가 일치하지 않습니다.', 'error'); return; }
            setCurrentStep(2);
            topRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    };
    const goPrev = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
            topRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    };

    /* ── final submit ── */
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!agree) { showToast('필수 약관에 동의해 주세요.', 'error'); return; }
        if (!formData.name) { showToast('이름을 입력해 주세요.', 'error'); return; }
        if (formData.phone.length < 13) { showToast('올바른 휴대폰 번호를 입력해 주세요.', 'error'); return; }

        try {
            await signUp(formData);
            setSuccessInfo({ name: formData.name, email: formData.email, role: formData.role });
            setIsSuccess(true);
            topRef.current?.scrollIntoView({ behavior: 'smooth' });
        } catch (error) {
            const errorMsg = error.response?.data?.detail || '회원가입 중 오류가 발생했습니다.';
            showToast(errorMsg, 'error');
        }
    };

    /* ── calendar helpers ── */
    const changeMonth = (offset) =>
        setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + offset, 1));

    /* 년도 옵션 (현재 연도 기준 100년) */
    const yearOptions = Array.from(
        { length: 100 },
        (_, i) => {
            const y = new Date().getFullYear() - i;
            return { value: y, label: `${y}년` };
        }
    );

    /* 월 옵션 */
    const monthOptions = Array.from({ length: 12 }, (_, i) => ({
        value: i,
        label: `${i + 1}월`,
    }));

    const renderCalendarDays = () => {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const firstDay = new Date(year, month, 1).getDay();
        const days = [];

        for (let i = 0; i < firstDay; i++)
            days.push(<div key={`e-${i}`} className="su3-cal-day su3-cal-day--empty" />);

        for (let d = 1; d <= daysInMonth; d++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
            const isSelected = formData.birth === dateStr;
            days.push(
                <div
                    key={d}
                    className={`su3-cal-day${isSelected ? ' su3-cal-day--selected' : ''}`}
                    onClick={() => {
                        setFormData((prev) => ({ ...prev, birth: dateStr }));
                        setIsCalendarOpen(false);
                    }}
                >
                    {d}
                </div>
            );
        }
        return days;
    };

    /* ── click outside calendar ── */
    useEffect(() => {
        const handler = (e) => {
            if (calendarRef.current && !calendarRef.current.contains(e.target))
                setIsCalendarOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const progressPct = isSuccess ? 100 : currentStep === 1 ? 50 : 100;

    /* ══════════════════════════════════════
       RENDER
    ══════════════════════════════════════ */
    return (
        <div className="su3-shell" ref={topRef}>
            {/* bg blobs */}
            <div className="su3-blob su3-blob--tr" />
            <div className="su3-blob su3-blob--bl" />
            <div className="su3-blob su3-blob--mid" />

            {/* header */}
            <Header isLoggedIn={false} setIsLoggedIn={() => {}} activeTab={activeTab} setActiveTab={setActiveTab} />

            {/* main card */}
            <main className="su3-main">
                <div className="su3-card">

                    {/* step header */}
                    <div className="su3-step-header">
                        <div className="su3-step-meta">
                            <span className="su3-step-badge">
                                {isSuccess ? '가입 완료' : `STEP ${currentStep}/2`}
                            </span>
                            <span className="su3-step-title">
                                {isSuccess ? '환영합니다!' : currentStep === 1 ? '회원 유형 및 계정 설정' : '인적 사항 및 약관 설정'}
                            </span>
                        </div>
                        <div className="su3-progress-track">
                            <div className="su3-progress-bar" style={{ width: `${progressPct}%` }} />
                        </div>
                    </div>

                    {/* ──────────── SUCCESS ──────────── */}
                    {isSuccess && (
                        <div className="su3-success">
                            <div className="su3-success-icon-wrap">
                                <div className="su3-success-ping" />
                                <PartyPopper size={40} strokeWidth={1.5} />
                            </div>
                            <h2 className="su3-success-title">가입을 축하합니다!</h2>
                            <p className="su3-success-desc">
                                <strong className="su3-success-name">{successInfo.name}</strong>님, MINDWELL 마인드케어에 오신 것을 환영합니다.<br />
                                <span className="su3-success-role">
                                    {successInfo.role === 'user' ? '내담자' : '마음 파트너 상담사'}
                                </span>로서의 따뜻한 여정을 시작해보세요.
                            </p>
                            <div className="su3-success-info-card">
                                <div className="su3-success-row">
                                    <span className="su3-success-key">가입 계정</span>
                                    <span className="su3-success-val">{successInfo.email}</span>
                                </div>
                                <div className="su3-success-row">
                                    <span className="su3-success-key">회원 유형</span>
                                    <span className="su3-success-val su3-success-val--brand">
                                        {successInfo.role === 'user' ? '내담자 (상담 희망)' : '전문 상담사'}
                                    </span>
                                </div>
                                <div className="su3-success-row su3-success-row--border">
                                    <span className="su3-success-key">시작 혜택</span>
                                    <span className="su3-success-val su3-success-val--amber">
                                        {successInfo.role === 'user' ? '🌱 신규 마음상담 15% 할인 쿠폰' : '💼 상담 센터 파트너 웰컴 패키지'}
                                    </span>
                                </div>
                            </div>
                            <button type="button" className="su3-start-btn" onClick={() => navigate('/login')}>
                                <span>시작하기</span>
                                <ArrowRight size={16} />
                            </button>
                        </div>
                    )}

                    {/* ──────────── STEP 1 ──────────── */}
                    {!isSuccess && currentStep === 1 && (
                        <div className="su3-step-body">
                            <div className="su3-section-head">
                                <h2 className="su3-section-title">회원 유형 선택 및 설정</h2>
                                <p className="su3-section-desc">상담을 신청하는 내담자인지, 상담을 이끄는 전문 상담사인지 선택해 주세요.</p>
                            </div>

                            {/* role cards */}
                            <div className="su3-field">
                                <label className="su3-label">가입 유형 <span className="su3-required">*</span></label>
                                <div className="su3-role-grid">
                                    <button
                                        type="button"
                                        className={`su3-role-card${formData.role === 'user' ? ' su3-role-card--active' : ''}`}
                                        onClick={() => setFormData({ ...formData, role: 'user' })}
                                    >
                                        <div className={`su3-role-icon-wrap su3-role-icon-wrap--brand`}>
                                            <Heart size={20} />
                                        </div>
                                        <span className="su3-role-name">내담자 가입</span>
                                        <span className="su3-role-desc">마음의 위로와 상담이 필요해요</span>
                                    </button>
                                    <button
                                        type="button"
                                        className={`su3-role-card${formData.role === 'expert' ? ' su3-role-card--active' : ''}`}
                                        onClick={() => setFormData({ ...formData, role: 'expert' })}
                                    >
                                        <div className={`su3-role-icon-wrap su3-role-icon-wrap--amber`}>
                                            <Award size={20} />
                                        </div>
                                        <span className="su3-role-name">상담사 가입</span>
                                        <span className="su3-role-desc">전문 역량으로 돕고 싶어요</span>
                                    </button>
                                </div>
                            </div>

                            {/* email */}
                            <div className="su3-field">
                                <label className="su3-label">이메일 주소 <span className="su3-required">*</span></label>
                                <div className="su3-input-row">
                                    <div className="su3-input-wrap su3-input-wrap--grow">
                                        <Mail size={16} className="su3-input-icon" />
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            className={`su3-input${isEmailValid === false ? ' su3-input--error' : ''}`}
                                            placeholder="example@email.com"
                                            required
                                        />
                                    </div>
                                </div>
                                {isEmailValid === false && formData.email.length > 0 && (
                                    <p className="su3-hint su3-hint--error">올바른 이메일 형식이 아닙니다.</p>
                                )}
                            </div>

                            {/* id */}
                            <div className="su3-field">
                                <label className="su3-label">아이디 <span className="su3-required">*</span></label>
                                <div className="su3-input-wrap">
                                    <BadgeCheck size={16} className="su3-input-icon" />
                                    <input
                                        type="text"
                                        name="id"
                                        value={formData.id}
                                        onChange={handleChange}
                                        maxLength="8"
                                        className={`su3-input su3-input--with-btn${isIdValid === false ? ' su3-input--error' : ''}`}
                                        placeholder="4~8자 영문, 숫자 조합"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={handleIdCheck}
                                        disabled={!formData.id || isCheckingId || isIdValid === false}
                                        className="su3-inner-btn"
                                    >
                                        {isCheckingId ? '...' : '중복확인'}
                                    </button>
                                </div>
                                {isIdValid === false && formData.id.length > 0 && (
                                    <p className="su3-hint su3-hint--error">4~8자의 영문과 숫자를 조합해 주세요.</p>
                                )}
                                {idStatus === 'available' && <p className="su3-hint su3-hint--success">사용 가능한 아이디입니다.</p>}
                                {idStatus === 'taken' && <p className="su3-hint su3-hint--error">이미 사용 중인 아이디입니다.</p>}
                            </div>

                            {/* password */}
                            <div className="su3-field">
                                <label className="su3-label">비밀번호 <span className="su3-required">*</span></label>
                                <div className="su3-input-wrap">
                                    <Lock size={16} className="su3-input-icon" />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        maxLength={13}
                                        className={`su3-input${isPasswordValid === false ? ' su3-input--error' : ''}`}
                                        placeholder="영문, 숫자 조합 6~13자"
                                        required
                                        autoComplete="new-password"
                                    />
                                    <button type="button" className="su3-pw-toggle" onClick={() => setShowPassword(!showPassword)}>
                                        {showPassword ? <Eye size={16} /> : <EyeOff size={16} />}
                                    </button>
                                </div>
                                {/* strength bar */}
                                <div className="su3-strength">
                                    <div className="su3-strength-meta">
                                        <span>비밀번호 안전도</span>
                                        <span className={`su3-strength-label su3-strength-label--${pwStrength.color}`}>{pwStrength.label}</span>
                                    </div>
                                    <div className="su3-strength-bars">
                                        {[1, 2, 3].map((i) => (
                                            <div
                                                key={i}
                                                className={`su3-strength-bar${pwStrength.score >= i ? ` su3-strength-bar--${pwStrength.color}` : ''}`}
                                            />
                                        ))}
                                    </div>
                                </div>
                                {isPasswordValid === false && formData.password.length > 0 && (
                                    <p className="su3-hint su3-hint--error">문자와 숫자를 조합하여 6자 이상 입력하세요.</p>
                                )}
                            </div>

                            {/* confirm password */}
                            <div className="su3-field">
                                <label className="su3-label">비밀번호 재확인 <span className="su3-required">*</span></label>
                                <div className="su3-input-wrap">
                                    <ShieldCheck size={16} className="su3-input-icon" />
                                    <input
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        maxLength={13}
                                        className={`su3-input${isPasswordMatch === false ? ' su3-input--error' : ''}`}
                                        placeholder="비밀번호를 다시 한번 입력해 주세요."
                                        required
                                        autoComplete="new-password"
                                    />
                                    <button type="button" className="su3-pw-toggle" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                                        {showConfirmPassword ? <Eye size={16} /> : <EyeOff size={16} />}
                                    </button>
                                </div>
                                {isPasswordMatch !== null && formData.confirmPassword.length > 0 && (
                                    <p className={`su3-hint${isPasswordMatch ? ' su3-hint--success' : ' su3-hint--error'}`}>
                                        {isPasswordMatch ? '비밀번호가 일치합니다.' : '비밀번호가 일치하지 않습니다.'}
                                    </p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* ──────────── STEP 2 ──────────── */}
                    {!isSuccess && currentStep === 2 && (
                        <form onSubmit={handleSubmit} className="su3-step-body">
                            <div className="su3-section-head">
                                <h2 className="su3-section-title">인적 사항 및 약관 설정</h2>
                                <p className="su3-section-desc">상담 서비스 이용을 위해 실명 정보 등록과 서비스 이용약관 동의가 필요합니다.</p>
                            </div>

                            {/* name */}
                            <div className="su3-field">
                                <label className="su3-label">이름 (실명) <span className="su3-required">*</span></label>
                                <div className="su3-input-wrap">
                                    <User size={16} className="su3-input-icon" />
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="su3-input"
                                        placeholder="실명을 정확하게 입력해 주세요."
                                        required
                                    />
                                </div>
                            </div>

                            {/* phone */}
                            <div className="su3-field">
                                <label className="su3-label">휴대폰 번호 <span className="su3-required">*</span></label>
                                <div className="su3-input-wrap">
                                    <Phone size={16} className="su3-input-icon" />
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        maxLength="13"
                                        className="su3-input"
                                        placeholder="010-0000-0000"
                                        required
                                    />
                                </div>
                                {formData.phone.length > 0 && (
                                    <p className={`su3-hint${formData.phone.length === 13 ? ' su3-hint--success' : ' su3-hint--warn'}`}>
                                        {formData.phone.length === 13 ? '올바른 휴대폰 번호 형식입니다.' : '휴대폰 번호 11자리를 모두 입력해주세요.'}
                                    </p>
                                )}
                            </div>

                            {/* birth + gender grid */}
                            <div className="su3-two-col">
                                {/* birth */}
                                <div className="su3-field su3-field--calendar" ref={calendarRef}>
                                    <label className="su3-label">생년월일</label>
                                    <div
                                        className={`su3-input-wrap su3-input-wrap--pointer${isCalendarOpen ? ' su3-input-wrap--active' : ''}`}
                                        onClick={() => setIsCalendarOpen(!isCalendarOpen)}
                                    >
                                        <Calendar size={16} className="su3-input-icon" />
                                        <input
                                            type="text"
                                            name="birth"
                                            value={formData.birth}
                                            readOnly
                                            className="su3-input su3-input--pointer"
                                            placeholder="날짜를 선택해 주세요"
                                        />
                                    </div>

                                    {isCalendarOpen && (
                                        <div className="su3-cal-popup">
                                            <div className="su3-cal-header">
                                                {/* 이전 달 버튼 */}
                                                <button
                                                    type="button"
                                                    className="su3-cal-nav"
                                                    onClick={(e) => { e.stopPropagation(); changeMonth(-1); }}
                                                >
                                                    <ChevronLeft size={16} />
                                                </button>

                                                {/* ✦ 커스텀 드롭다운: 년도 & 월 ✦ */}
                                                <div className="su3-cal-selects">
                                                    <CalDropdown
                                                        label={`${currentMonth.getFullYear()}년`}
                                                        value={currentMonth.getFullYear()}
                                                        options={yearOptions}
                                                        onChange={(y) =>
                                                            setCurrentMonth(new Date(y, currentMonth.getMonth(), 1))
                                                        }
                                                    />
                                                    <CalDropdown
                                                        label={`${currentMonth.getMonth() + 1}월`}
                                                        value={currentMonth.getMonth()}
                                                        options={monthOptions}
                                                        onChange={(m) =>
                                                            setCurrentMonth(new Date(currentMonth.getFullYear(), m, 1))
                                                        }
                                                    />
                                                </div>

                                                {/* 다음 달 버튼 */}
                                                <button
                                                    type="button"
                                                    className="su3-cal-nav"
                                                    onClick={(e) => { e.stopPropagation(); changeMonth(1); }}
                                                >
                                                    <ChevronRight size={16} />
                                                </button>
                                            </div>

                                            <div className="su3-cal-weekdays">
                                                {['일','월','화','수','목','금','토'].map((d) => (
                                                    <div key={d} className="su3-cal-weekday">{d}</div>
                                                ))}
                                            </div>
                                            <div className="su3-cal-grid">{renderCalendarDays()}</div>
                                        </div>
                                    )}
                                </div>

                                {/* gender */}
                                <div className="su3-field">
                                    <label className="su3-label">성별</label>
                                    <div className="su3-gender-grid">
                                        {[{ val: 'male', label: '남성' }, { val: 'female', label: '여성' }].map(({ val, label }) => (
                                            <label key={val} className={`su3-gender-card${formData.gender === val ? ' su3-gender-card--active' : ''}`}>
                                                <input type="radio" name="gender" value={val} checked={formData.gender === val} onChange={handleChange} className="su3-sr-only" />
                                                <span className={`su3-gender-label${formData.gender === val ? ' su3-gender-label--active' : ''}`}>{label}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* agreements */}
                            <div className="su3-agree-box">
                                <div className="su3-agree-header">
                                    <ShieldCheck size={17} className="su3-agree-shield" />
                                    <span className="su3-agree-header-text">상담데이터 제공 및 본인확인 동의(필수)</span>
                                </div>
                                <div className="su3-agree-footer-row">
                                    <label className="su3-agree-check-row su3-agree-check-row--nomargin">
                                        <div className={`su3-agree-check-box${agree ? ' su3-agree-check-box--checked' : ''}`}>
                                            <input
                                                type="checkbox"
                                                checked={agree}
                                                onChange={(e) => { setAgree(e.target.checked); setAgreeMarketing(e.target.checked); }}
                                                className="su3-sr-only"
                                                required
                                            />
                                            <Check size={12} className={`su3-agree-check-icon${agree ? ' su3-agree-check-icon--visible' : ''}`} />
                                        </div>
                                        <span className="su3-agree-check-text">내용을 확인했으며, 이에 동의합니다</span>
                                    </label>
                                    <button
                                        type="button"
                                        className="su3-agree-arrow-btn"
                                        onClick={() => setShowDetail(!showDetail)}
                                        aria-label="상세 약관 보기"
                                    >
                                        <ChevronDown size={20} className={`su3-agree-arrow${showDetail ? ' su3-agree-arrow--open' : ''}`}/>
                                    </button>
                                </div>
                                {showDetail && (
                                    <div className="su3-agree-detail">
                                        <div className="su3-agree-detail-item">
                                            <span className="su3-agree-dot" />
                                            <p><strong>제공 받는 자:</strong> 담당 매칭 상담사</p>
                                        </div>
                                        <div className="su3-agree-detail-item">
                                            <span className="su3-agree-dot" />
                                            <p><strong>제공 항목:</strong> 성명, 생년월일, 성별</p>
                                        </div>
                                        <div className="su3-agree-detail-item">
                                            <span className="su3-agree-dot" />
                                            <p><strong>이용 목적:</strong> 맞춤형 상담 제공 및 본인 확인</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <button type="submit" className="su3-hidden-submit" aria-hidden="true" tabIndex={-1} />
                        </form>
                    )}

                    {/* ──────────── NAV BUTTONS ──────────── */}
                    {!isSuccess && (
                        <div className={`su3-nav${currentStep === 1 ? ' su3-nav--center' : ''}`}>
                            {currentStep !== 1 && (
                                <button
                                    type="button"
                                    onClick={goPrev}
                                    className="su3-nav-prev"
                                >
                                    <ChevronLeft size={16} />
                                    이전
                                </button>
                            )}
                            {currentStep === 1 ? (
                                <button type="button" onClick={goNext} className="su3-nav-next">
                                    다음 단계
                                    <ChevronRight size={16} />
                                </button>
                            ) : (
                                <button type="button" onClick={handleSubmit} className="su3-nav-next">
                                    가입완료
                                    <Check size={16} />
                                </button>
                            )}
                        </div>
                    )}

                    {/* login prompt */}
                    {!isSuccess && (
                        <p className="su3-login-prompt">
                            이미 계정이 있으신가요?{' '}
                            <button type="button" className="su3-login-link" onClick={() => navigate('/login')}>
                                로그인
                            </button>
                        </p>
                    )}
                </div>
            </main>

            {/* footer */}
            <Footer />

            {/* toast */}
            <div className={`su3-toast${toast.visible ? ' su3-toast--visible' : ''} su3-toast--${toast.type}`}>
                <span className="su3-toast-icon">
                    {toast.type === 'success' && <CheckCircle size={16} />}
                    {toast.type === 'error' && <AlertTriangle size={16} />}
                    {toast.type === 'warn' && <Info size={16} />}
                    {toast.type === 'info' && <Bell size={16} />}
                </span>
                <span>{toast.message}</span>
            </div>

            {/* 모바일 하단 탭 네비게이션 */}
            <MobileTap />
        </div>
    );
}