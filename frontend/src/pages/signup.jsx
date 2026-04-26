import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Mail,
    Lock,
    ChevronRight,
    ChevronLeft,
    BadgeCheck,
    Eye,
    EyeOff,
    User,
    Phone,
    UserCircle,
    GraduationCap,
    Calendar,
    ShieldCheck,
    ChevronDown,
    Check,
} from 'lucide-react';
import { signUp, checkIdDuplicate } from '../api/auth';
import '../static/SignUp.css';

export default function SignupPage() {
    const [formData, setFormData] = useState({
        role: '',
        name: '',
        id: '',
        phone: '',
        email: '',
        password: '',
        confirmPassword: '',
        birth: '',
        gender: '',
    });
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isCheckingId, setIsCheckingId] = useState(false);
    const [idStatus, setIdStatus] = useState(null);
    const [agree, setAgree] = useState(false);
    const [showDetail, setShowDetail] = useState(false);
    const calendarRef = useRef(null);
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);
    const [currentMonth, setCurrentMonth] = useState(() => {
        // 기본값: 오늘 날짜
        return new Date();
    });

    const formatPhoneNumber = (value) => {
        const numbers = value.replace(/[^\d]/g, '');
        if (numbers.length <= 3) return numbers;
        if (numbers.length <= 7) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
        return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`;
    };

    const formatId = (value) => {
        return value.replace(/[^a-zA-Z0-9]/g, '');
    };

    // 아이디 조건: 4자 이상 8자 이내 (영문/숫자 조합)
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
        // 6자 이상 13자 이하, 문자+숫자 조합
        return value.length >= 6 && value.length <= 13 && /[a-zA-Z]/.test(value) && /[0-9]/.test(value);
    };

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
        setIsCheckingId(true); // 로딩 표시 시작
        try {
            const result = await checkIdDuplicate(formData.id);

            if (result.available) {
                setIdStatus('available'); // 사용 가능
            } else {
                setIdStatus('taken'); // 이미 사용 중
            }
        } catch (error) {
            alert('중복 확인 중 오류가 발생했습니다.');
            setIdStatus(null);
        } finally {
            setIsCheckingId(false); // 로딩 표시 종료
        }
    };

    const isIdValid = validateIdComposition(formData.id);
    const isEmailValid = validateEmailFormat(formData.email);
    const isPasswordValid = validatePasswordFormat(formData.password);
    const isPasswordMatch =
        formData.password && formData.confirmPassword ? formData.password === formData.confirmPassword : null;

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!agree) {
            alert('개인정보 제공에 동의해 주세요.');
            return;
        }
        if (!formData.role) {
            alert('내담자인지 상담자인지 선택해 주세요.');
            return;
        }
        if (idStatus !== 'available') {
            alert('아이디 중복 확인을 진행해주세요.');
            return;
        }
        if (!isPasswordMatch) {
            alert('비밀번호가 일치하지 않습니다.');
            return;
        }

        // 실제 백엔드와 통신하는 부분
        try {
            // 아까 만든 auth.api.js의 signUp 함수 호출
            const result = await signUp(formData);
            // 백엔드에서 성공 응답이 오면 실행
            alert(`${formData.name}님, MINDWELL 회원가입을 축하합니다!`);
            navigate('/login');
        } catch (error) {
            // 백엔드에서 에러(중복 아이디 등)를 보냈을 때 처리
            const errorMsg = error.response?.data?.detail || '회원가입 중 오류가 발생했습니다.';
            alert(errorMsg);
        }
    };

    // 달력 월 이동
    const changeMonth = (offset) => {
        setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + offset, 1));
    };

    // 달력 날짜 렌더링
    const renderCalendarDays = () => {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const firstDay = new Date(year, month, 1).getDay();
        const days = [];
        // 빈 칸
        for (let i = 0; i < firstDay; i++) {
            days.push(<div key={`empty-${i}`} className="cal-day empty"></div>);
        }
        // 날짜
        for (let d = 1; d <= daysInMonth; d++) {
            const dateObj = new Date(year, month, d);
            const isPast = dateObj > today ? false : false;
            const isSelected =
                formData.birth === `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
            days.push(
                <div
                    key={d}
                    className={`cal-day${isSelected ? ' selected' : ''}`}
                    onClick={() => {
                        setFormData((prev) => ({
                            ...prev,
                            birth: `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`,
                        }));
                        setIsCalendarOpen(false);
                    }}
                >
                    {d}
                </div>
            );
        }
        return days;
    };

    return (
        <div className="signup-container">
            <div className="signup-card">
                {/* 좌측: 브랜딩 영역 (image_3b08c0.jpg 스타일 반영) */}
                <div className="branding-area">
                    <div className="branding-decoration"></div>
                    <div className="relative z-10">
                        <button
                            onClick={() => navigate('/')}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                        >
                            <h1 className="brand-logo">MINDWELL</h1>
                        </button>
                        <p className="brand-mobile-tag">당신의 마음을 돌보는 따뜻한 공간</p>
                    </div>

                    <div className="desktop-content">
                        <div className="brand-icon-box">
                            <BadgeCheck size={32} className="text-white" />
                        </div>
                        <h2 className="brand-title">
                            새로운 시작을 <br /> 함께해요.
                        </h2>
                        <p className="brand-desc">
                            MINDWELL의 멤버가 되어 당신의 소중한 감정을
                            <br /> 더욱 체계적으로 관리하고 위로받으세요.
                        </p>
                    </div>

                    <div className="brand-copyright">
                        <span>© 2026 MINDWELL. All rights reserved.</span>
                    </div>
                </div>

                {/* 우측: 폼 영역 */}
                <div className="form-area">
                    <div className="form-container">
                        <h3 className="form-title">반가워요!</h3>
                        <p className="form-subtitle">함께하기 위한 정보를 입력해 주세요.</p>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* 역할 선택 섹션 */}
                            <div className="input-field-group">
                                <label className="input-label">가입 유형</label>
                                <div className="role-selection-wrapper">
                                    <button
                                        type="button"
                                        className={`role-card ${formData.role === 'user' ? 'active' : ''}`}
                                        onClick={() => setFormData({ ...formData, role: 'user' })}
                                    >
                                        <UserCircle size={22} className="role-card-icon" />
                                        <div className="role-card-text">
                                            <span className="role-card-title">내담자</span>
                                            <span className="role-card-desc">상담을 받고 싶어요</span>
                                        </div>
                                    </button>

                                    <button
                                        type="button"
                                        className={`role-card ${formData.role === 'expert' ? 'active' : ''}`}
                                        onClick={() => setFormData({ ...formData, role: 'expert' })}
                                    >
                                        <GraduationCap size={22} className="role-card-icon" />
                                        <div className="role-card-text">
                                            <span className="role-card-title">상담자</span>
                                            <span className="role-card-desc">전문가로 활동할게요</span>
                                        </div>
                                    </button>
                                </div>
                            </div>
                            {/* Name */}
                            <div className="input-field-group">
                                <label className="input-label">Name</label>
                                <div className="input-wrapper">
                                    <User size={16} className="input-icon" />
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="form-input"
                                        placeholder="실명을 입력해 주세요"
                                        required
                                    />
                                </div>
                            </div>

                            {/* 생년월일 섹션 */}
                            <div className="input-field-group" style={{ position: 'relative' }}>
                                <label className="input-label">생년월일</label>
                                <div
                                    className={`input-wrapper pointer-cursor ${isCalendarOpen ? 'active' : ''}`}
                                    onClick={() => setIsCalendarOpen(!isCalendarOpen)}
                                >
                                    <Calendar size={16} className="input-icon" />
                                    <input
                                        type="text"
                                        name="birth"
                                        value={formData.birth}
                                        readOnly
                                        className="form-input pointer-cursor"
                                        placeholder="날짜를 선택해 주세요"
                                        required
                                    />
                                </div>

                                {isCalendarOpen && (
                                    <div className="custom-calendar-popup">
                                        <div className="cal-header">
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    changeMonth(-1);
                                                }}
                                                className="cal-nav-btn"
                                            >
                                                <ChevronLeft size={18} />
                                            </button>
                                            <div className="cal-title-group">
                                                <select
                                                    value={currentMonth.getFullYear()}
                                                    onChange={(e) =>
                                                        setCurrentMonth(
                                                            new Date(
                                                                parseInt(e.target.value),
                                                                currentMonth.getMonth(),
                                                                1
                                                            )
                                                        )
                                                    }
                                                    className="cal-select"
                                                >
                                                    {Array.from(
                                                        { length: 100 },
                                                        (_, i) => new Date().getFullYear() - i
                                                    ).map((year) => (
                                                        <option key={year} value={year}>
                                                            {year}년
                                                        </option>
                                                    ))}
                                                </select>
                                                <select
                                                    value={currentMonth.getMonth()}
                                                    onChange={(e) =>
                                                        setCurrentMonth(
                                                            new Date(
                                                                currentMonth.getFullYear(),
                                                                parseInt(e.target.value),
                                                                1
                                                            )
                                                        )
                                                    }
                                                    className="cal-select"
                                                >
                                                    {Array.from({ length: 12 }, (_, i) => (
                                                        <option key={i} value={i}>
                                                            {i + 1}월
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    changeMonth(1);
                                                }}
                                                className="cal-nav-btn"
                                            >
                                                <ChevronRight size={18} />
                                            </button>
                                        </div>
                                        <div className="cal-weekdays">
                                            {['일', '월', '화', '수', '목', '금', '토'].map((d) => (
                                                <div key={d} className="cal-weekday">
                                                    {d}
                                                </div>
                                            ))}
                                        </div>
                                        <div className="cal-grid">{renderCalendarDays()}</div>
                                    </div>
                                )}
                            </div>

                            {/* 성별 선택 섹션 */}
                            <div className="input-field-group">
                                <label className="input-label">성별</label>
                                <div className="gender-radio-group">
                                    <label className={`gender-radio ${formData.gender === 'male' ? 'checked' : ''}`}>
                                        <input
                                            type="radio"
                                            name="gender"
                                            value="male"
                                            checked={formData.gender === 'male'}
                                            onChange={handleChange}
                                            required
                                        />
                                        남성
                                    </label>
                                    <label className={`gender-radio ${formData.gender === 'female' ? 'checked' : ''}`}>
                                        <input
                                            type="radio"
                                            name="gender"
                                            value="female"
                                            checked={formData.gender === 'female'}
                                            onChange={handleChange}
                                            required
                                        />
                                        여성
                                    </label>
                                </div>
                            </div>

                            {/* ID - 중복확인 버튼을 인풋 내부 우측으로 배치 */}
                            <div className="input-field-group">
                                <label className="input-label">ID</label>
                                <div className="input-wrapper">
                                    <BadgeCheck size={16} className="input-icon" />
                                    <input
                                        type="text"
                                        name="id"
                                        value={formData.id}
                                        onChange={handleChange}
                                        maxLength="8"
                                        className={`form-input ${isIdValid === false ? 'error-input' : ''}`}
                                        placeholder="4~8자 영문, 숫자 조합"
                                        required
                                        style={{ paddingRight: '80px' }} // 버튼 공간 확보
                                    />
                                    <button
                                        type="button"
                                        onClick={handleIdCheck}
                                        disabled={!formData.id || isCheckingId || isIdValid === false}
                                        className="inner-check-button"
                                    >
                                        {isCheckingId ? '...' : '중복확인'}
                                    </button>
                                </div>
                                {isIdValid === false && formData.id.length > 0 && (
                                    <p className="validation-msg msg-error">4~8자의 영문과 숫자를 조합해 주세요.</p>
                                )}
                                {idStatus === 'available' && (
                                    <p className="validation-msg msg-success">사용 가능한 아이디입니다.</p>
                                )}
                                {idStatus === 'taken' && (
                                    <p className="validation-msg msg-error">이미 사용 중인 아이디입니다.</p>
                                )}
                            </div>

                            {/* Phone */}
                            <div className="input-field-group">
                                <label className="input-label">Phone</label>
                                <div className="input-wrapper">
                                    <Phone size={16} className="input-icon" />
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        maxLength="13"
                                        className="form-input"
                                        placeholder="010-0000-0000"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Email */}
                            <div className="input-field-group">
                                <label className="input-label">Email</label>
                                <div className="input-wrapper">
                                    <Mail size={16} className="input-icon" />
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className={`form-input ${isEmailValid === false ? 'error-input' : ''}`}
                                        placeholder="example@mail.com"
                                        required
                                    />
                                </div>
                                {isEmailValid === false && formData.email.length > 0 && (
                                    <p className="validation-msg msg-error">올바른 이메일 형식이 아닙니다.</p>
                                )}
                            </div>

                            {/* Password */}
                            <div className="input-field-group">
                                <label className="input-label">Password</label>
                                <div className="input-wrapper">
                                    <Lock size={16} className="input-icon" />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        className={`form-input ${isPasswordValid === false ? 'error-input' : ''}`}
                                        placeholder="문자+숫자 조합 6~13자"
                                        maxLength={13}
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="password-toggle"
                                    >
                                        {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                                    </button>
                                </div>
                                {isPasswordValid === false && formData.password.length > 0 && (
                                    <p className="validation-msg msg-error">
                                        문자와 숫자를 조합하여 6자 이상 입력하세요.
                                    </p>
                                )}
                            </div>

                            {/* Confirm Password */}
                            <div className="input-field-group">
                                <label className="input-label">Confirm Password</label>
                                <div className="input-wrapper">
                                    <Lock size={16} className="input-icon" />
                                    <input
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        className={`form-input ${isPasswordMatch === false ? 'error-input' : ''}`}
                                        placeholder="비밀번호 재입력 (최대 13자)"
                                        maxLength={13}
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="password-toggle"
                                    >
                                        {showConfirmPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                                    </button>
                                </div>
                                {isPasswordMatch !== null && formData.confirmPassword.length > 0 && (
                                    <p className={`validation-msg ${isPasswordMatch ? 'msg-success' : 'msg-error'}`}>
                                        {isPasswordMatch ? '비밀번호가 일치합니다' : '비밀번호가 일치하지 않습니다'}
                                    </p>
                                )}
                            </div>

                            {/* 개인정보 제공 동의 */}
                            <div className="policy-section-card">
                                <div className="policy-header" onClick={() => setShowDetail(!showDetail)}>
                                    <div className="policy-title-group">
                                        <ShieldCheck size={18} className="policy-icon" />
                                        <span>상담 데이터 제공 및 본인확인 동의 (필수)</span>
                                    </div>
                                    <ChevronDown size={20} className={`policy-arrow ${showDetail ? 'active' : ''}`} />
                                </div>

                                {showDetail && (
                                    <div className="policy-detail-content">
                                        <div className="policy-detail-item">
                                            <span className="policy-dot"></span>
                                            <p>
                                                <strong>제공 받는 자:</strong> 담당 매칭 상담사
                                            </p>
                                        </div>
                                        <div className="policy-detail-item">
                                            <span className="policy-dot"></span>
                                            <p>
                                                <strong>제공 항목:</strong> 성명, 생년월일, 성별
                                            </p>
                                        </div>
                                        <div className="policy-detail-item">
                                            <span className="policy-dot"></span>
                                            <p>
                                                <strong>이용 목적:</strong> 맞춤형 상담 제공 및 본인 확인
                                            </p>
                                        </div>
                                    </div>
                                )}

                                <div className="policy-agree-footer">
                                    <label className="custom-checkbox-wrapper">
                                        <div className={`custom-checkbox-box ${agree ? 'checked' : ''}`}>
                                            <input
                                                type="checkbox"
                                                checked={agree}
                                                onChange={(e) => setAgree(e.target.checked)}
                                                required
                                            />
                                            <Check
                                                size={14}
                                                className={`custom-check-icon ${agree ? 'visible' : ''}`}
                                            />
                                        </div>
                                        <span className="custom-checkbox-text">
                                            내용을 확인했으며, 이에 동의합니다.
                                        </span>
                                    </label>
                                </div>
                            </div>
                            <button type="submit" className="submit-button">
                                <span>MINDWELL 시작하기</span>
                                <ChevronRight size={18} />
                            </button>
                        </form>

                        <p className="login-prompt">
                            이미 계정이 있으신가요?{' '}
                            <button
                                className="login-link"
                                onClick={() => navigate('/login')}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: 'inherit',
                                    cursor: 'pointer',
                                    textDecoration: 'underline',
                                    padding: 0,
                                }}
                            >
                                로그인
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
