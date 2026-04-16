import React, { useState } from 'react';
import { Mail, Lock, ChevronRight, BadgeCheck, Eye, EyeOff, User, Phone } from 'lucide-react';
import './signup.css'


export default function SignupPage() {
    const [formData, setFormData] = useState({
        name: '',
        id: '',
        phone: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isCheckingId, setIsCheckingId] = useState(false);
    const [idStatus, setIdStatus] = useState(null);

    const formatPhoneNumber = (value) => {
        const numbers = value.replace(/[^\d]/g, '');
        if (numbers.length <= 3) return numbers;
        if (numbers.length <= 7) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
        return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`;
    };

    const formatId = (value) => {
        return value.replace(/[^a-zA-Z0-9]/g, '');
    };

    const validateIdComposition = (value) => {
        if (!value) return null;
        return value.length >= 6 && value.length <= 12 && /[a-zA-Z]/.test(value) && /[0-9]/.test(value);
    };

    const validateEmailFormat = (value) => {
        if (!value) return null;
        return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value);
    };

    const validatePasswordFormat = (value) => {
        if (!value) return null;
        return value.length >= 8 && value.length <= 13 && /[A-Z]/.test(value) && /[a-z]/.test(value) && /[0-9]/.test(value) && /[!@#$%^&*(),.?":{}|<>]/.test(value);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'phone') {
        setFormData(prev => ({ ...prev, [name]: formatPhoneNumber(value) }));
        } else if (name === 'id') {
        setFormData(prev => ({ ...prev, [name]: formatId(value) }));
        setIdStatus(null);
        } else {
        setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleIdCheck = () => {
        if (!formData.id || !validateIdComposition(formData.id)) return;
        setIsCheckingId(true);
        setTimeout(() => {
        setIsCheckingId(false);
        setIdStatus(formData.id.length > 5 ? 'available' : 'taken');
        }, 800);
    };

    const isIdValid = validateIdComposition(formData.id);
    const isEmailValid = validateEmailFormat(formData.email);
    const isPasswordValid = validatePasswordFormat(formData.password);
    const isPasswordMatch = formData.password && formData.confirmPassword 
        ? formData.password === formData.confirmPassword 
        : null;

    return (
        <div className="signup-container">
        <style>{signupStyles}</style>
        <div className="signup-card">
            
            {/* 좌측: 브랜딩 영역 */}
            <div className="branding-area">
            <div className="branding-decoration"></div>
            <div className="relative z-10">
                <h1 className="brand-logo">MINDWELL</h1>
                <p className="brand-mobile-tag">당신의 마음을 돌보는 따뜻한 공간</p>
            </div>
            
            <div className="desktop-content">
                <div className="brand-icon-box">
                <BadgeCheck size={32} className="text-white" />
                </div>
                <h2 className="brand-title">새로운 시작을 <br/> 함께해요.</h2>
                <p className="brand-desc">
                MINDWELL의 멤버가 되어 당신의 소중한 감정을<br/> 더욱 체계적으로 관리하고 위로받으세요.
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

                <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
                
                <div className="input-field-group">
                    <label className="input-label">Name</label>
                    <div className="input-wrapper">
                    <User size={16} className="input-icon" />
                    <input type="text" name="name" value={formData.name} onChange={handleChange} className="form-input" placeholder="실명을 입력해 주세요" required />
                    </div>
                </div>

                <div className="input-field-group">
                    <label className="input-label">ID</label>
                    <div className="flex gap-2">
                    <div className="input-wrapper flex-1">
                        <BadgeCheck size={16} className="input-icon" />
                        <input 
                        type="text" 
                        name="id" 
                        value={formData.id} 
                        onChange={handleChange} 
                        maxLength="12"
                        className={`form-input ${isIdValid === false ? 'error-input' : ''}`} 
                        placeholder="6~12자 영문, 숫자 조합" 
                        required 
                        />
                    </div>
                    <button type="button" onClick={handleIdCheck} disabled={!formData.id || isCheckingId || isIdValid === false} className="check-button">
                        {isCheckingId ? '...' : '중복 확인'}
                    </button>
                    </div>
                    {isIdValid === false && <p className="validation-msg msg-error">6~12자의 영문과 숫자를 조합해 주세요.</p>}
                    {idStatus === 'available' && <p className="validation-msg msg-success">사용 가능한 아이디입니다.</p>}
                    {idStatus === 'taken' && <p className="validation-msg msg-error">이미 사용 중인 아이디입니다.</p>}
                </div>

                <div className="input-field-group">
                    <label className="input-label">Phone</label>
                    <div className="input-wrapper">
                    <Phone size={16} className="input-icon" />
                    <input type="tel" name="phone" value={formData.phone} onChange={handleChange} maxLength="13" className="form-input" placeholder="010-0000-0000" required />
                    </div>
                </div>

                <div className="input-field-group">
                    <label className="input-label">Email</label>
                    <div className="input-wrapper">
                    <Mail size={16} className="input-icon" />
                    <input type="email" name="email" value={formData.email} onChange={handleChange} className={`form-input ${isEmailValid === false ? 'error-input' : ''}`} placeholder="example@mail.com" required />
                    </div>
                </div>

                <div className="input-field-group">
                    <label className="input-label">Password</label>
                    <div className="input-wrapper">
                    <Lock size={16} className="input-icon" />
                    <input type={showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={handleChange} className={`form-input ${isPasswordValid === false ? 'error-input' : ''}`} placeholder="비밀번호 입력" required />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="password-toggle">{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>
                    </div>
                </div>

                <div className="input-field-group">
                    <label className="input-label">Confirm Password</label>
                    <div className="input-wrapper">
                    <Lock size={16} className="input-icon" />
                    <input type={showConfirmPassword ? 'text' : 'password'} name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} className={`form-input ${isPasswordMatch === false ? 'error-input' : ''}`} placeholder="비밀번호 재입력" required />
                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="password-toggle">{showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>
                    </div>
                    {isPasswordMatch !== null && (
                    <p className={`validation-msg ${isPasswordMatch ? 'msg-success' : 'msg-error'}`}>{isPasswordMatch ? '비밀번호가 일치합니다' : '비밀번호가 일치하지 않습니다'}</p>
                    )}
                </div>

                <button type="submit" className="submit-button">
                    <span>MINDWELL 시작하기</span>
                    <ChevronRight size={18} />
                </button>
                </form>
                
                <p className="login-prompt">
                이미 계정이 있으신가요? <button className="login-link">로그인</button>
                </p>
            </div>
            </div>
        </div>
        </div>
    );
    }