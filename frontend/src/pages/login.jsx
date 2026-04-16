import React, { useState } from 'react';
import { Mail, Lock, ChevronRight, BookHeart, Eye, EyeOff, User } from 'lucide-react';
import './login.css'

export default function LoginPage() {
    const [id, setId] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Login attempt:', id);
    };

    return (
        <div className="login-container">
        <style>{loginStyles}</style>
        <div className="login-card">
            
            {/* 좌측: 브랜딩 영역 */}
            <div className="branding-section">
            <div className="branding-decoration"></div>
            
            <div>
                <h1 className="brand-logo-text">MINDWELL</h1>
                <span className="brand-mobile-desc">당신의 마음을 돌보는 따뜻한 공간</span>
            </div>

            <div className="desktop-branding-content">
                <div className="brand-icon-wrapper">
                <BookHeart size={32} className="text-white" />
                </div>
                <h2 className="brand-main-title">
                오늘도 <br/>
                수고 많았어요.
                </h2>
                <p className="brand-sub-desc">
                MINDWELL은 당신의 감정을 안전하게 기록하고,<br/>
                가장 잘 맞는 상담사를 연결해 드립니다.
                </p>
            </div>
            
            <div className="brand-footer">
                <span>© 2026 MINDWELL. All rights reserved.</span>
            </div>
            </div>

            {/* 우측: 로그인 폼 영역 */}
            <div className="form-section">
            <div className="form-inner-container">
                <h3 className="form-header-title">다시 오셨군요!</h3>
                <p className="form-header-sub">당신의 이야기를 들려주세요.</p>

                <form onSubmit={handleSubmit}>
                <div className="input-group-container">
                    <label className="input-label">ID</label>
                    <div className="input-group">
                    <User size={16} className="input-icon" />
                    <input
                        type="text"
                        value={id}
                        onChange={(e) => setId(e.target.value)}
                        className="input-field"
                        placeholder="아이디를 입력해 주세요"
                        required
                    />
                    </div>
                </div>

                <div className="input-group-container">
                    <label className="input-label">Password</label>
                    <div className="input-group">
                    <Lock size={16} className="input-icon" />
                    <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="input-field"
                        placeholder="••••••••"
                        required
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="password-toggle"
                    >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                    </div>
                </div>

                <button type="submit" className="submit-btn">
                    <span>로그인하기</span>
                    <ChevronRight size={18} />
                </button>
                </form>

                <div className="divider-container">
                <div className="divider-line"></div>
                <span className="divider-text">SNS 계정으로 시작하기</span>
                </div>

                <div className="social-buttons-container">
                <button type="button" className="social-btn google-btn">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" width="20" height="20">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    <span>Google 계정으로 로그인</span>
                </button>
                <button type="button" className="social-btn kakao-btn">
                    <span style={{fontWeight: 900}}>K</span>
                    <span>카카오톡으로 로그인</span>
                </button>
                </div>

                <p className="signup-prompt">
                계정이 없으신가요?{' '}
                <button className="signup-link">회원가입</button>
                </p>
            </div>
            </div>
        </div>
        </div>
    );
}