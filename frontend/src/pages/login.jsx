import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, ChevronRight, BookHeart, Eye, EyeOff, User } from 'lucide-react';
import { login } from '../api/auth';
import '../static/Login.css';

export default function LoginPage() {
    const [id, setId] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const result = await login({ username: id, password: password });
            // 디버깅: 로그인 응답 user 객체 확인
            if (typeof result.user.id === 'undefined') {
                console.warn('로그인 응답에 id(PK)가 없습니다:', result.user);
            } else {
                console.log('로그인 응답 user:', result.user);
                // role, username 등 주요 정보 명확히 출력
                console.log('user.role:', result.user.role);
                console.log('user.username:', result.user.username);
            }
            localStorage.setItem('user', JSON.stringify(result.user));
            if (result.access_token) {
                localStorage.setItem('access_token', result.access_token); // header.jsx와 통일
            }
            // 로그인 시간 저장 (UTC ms)
            localStorage.setItem('login_time', Date.now().toString());
            alert(`${result.user.full_name}님, 환영합니다!`);
            // role에 따라 이동 경로 분기
            if (result.user.role === 'counselor') {
                navigate('/counselorhome');
            } else {
                navigate('/');
            }
        } catch (error) {
            console.error('3. 로그인 에러 발생!');
            console.log('에러 객체 전체:', error);
            console.log('백엔드 메시지:', error.response?.data);
            alert(error.response?.data?.detail || '로그인에 실패했습니다.');
        }
        console.log('Login attempt:', id);
    };

    return (
        <div className="login-container">
            <div className="login-card">
                {/* 좌측: 브랜딩 영역 */}
                <div className="branding-section">
                    <div className="branding-glass-overlay"></div>
                    <div className="branding-top">
                        <button onClick={() => navigate('/')} className="brand-logo-btn">
                            <h1 className="brand-logo">MINDWELL</h1>
                            <span className="brand-slogan">당신의 마음을 돌보는 따뜻한 공간</span>
                        </button>
                    </div>

                    <div className="branding-middle">
                        <div className="brand-message-box">
                            <BookHeart size={36} className="brand-icon" />
                            <h2 className="brand-main-title">
                                오늘도 <br />
                                수고 많았어요.
                            </h2>
                            <p className="brand-sub-desc">
                                MINDWELL은 당신의 감정을 안전하게 기록하고, 가장 잘 맞는 상담사를 연결해 드립니다.
                            </p>
                        </div>
                    </div>

                    <div className="branding-bottom">
                        <span className="brand-footer-text">© 2026 MINDWELL. All rights reserved.</span>
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
                                        placeholder="비밀번호를 입력해 주세요"
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
                            </div>

                            <button type="submit" className="submit-btn">
                                <span>로그인하기</span>
                                <ChevronRight size={18} />
                            </button>
                        </form>

                        <div className="auth-links-container">
                            <button className="auth-link" onClick={() => navigate('/signup')}>
                                회원가입
                            </button>
                            <span className="auth-divider">|</span>
                            <button className="auth-link" onClick={() => navigate('/find-password')}>
                                비밀번호 찾기
                            </button>
                        </div>

                        {/* 소셜 로그인 구분선 */}
                        <div className="divider-container social-divider center-divider">
                            <span className="divider-text">소셜 로그인</span>
                        </div>

                        {/* 소셜 버튼 컨테이너 - 이미지 기반 방식 */}
                        <div className="social-icon-wrapper">
                            {['Google', 'Kakao', 'Naver'].map((p) => (
                                <button
                                    key={p}
                                    type="button"
                                    className={`social-icon-item ${p.toLowerCase()}-bg`}
                                    style={{ border: 'none', cursor: 'pointer' }}
                                >
                                    {p === 'Naver' ? (
                                        <span className="naver-text">N</span>
                                    ) : (
                                        <img
                                            src={
                                                p === 'Google'
                                                    ? 'https://www.gstatic.com/images/branding/product/2x/googleg_48dp.png'
                                                    : 'https://upload.wikimedia.org/wikipedia/commons/e/e3/KakaoTalk_logo.svg'
                                            }
                                            alt={p}
                                            className="social-img-icon"
                                        />
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
