import React, { useState } from 'react';
import Header from '../components/header';
import Footer from '../components/footer';
import MobileTap from '../components/mobileTap';
import { useNavigate } from 'react-router-dom';
import { Lock, ChevronRight, Eye, EyeOff, User, Sparkles, HeartHandshake, ShieldCheck } from 'lucide-react';
import { login } from '../api/auth';
import '../static/Login.css';

// 데모 계정 정보
const DEMO_ACCOUNTS = {
    client: { id: 'sjy8336', pw: 'demo1234!!', label: '내담자' },
    counselor: { id: 'sang1', pw: 'qqqq0000', label: '상담사' },
    admin: { id: 'sang2', pw: 'qwer1234', label: '관리자' },
};

export default function LoginPage({ setUserName, setIsLoggedIn }) {
    const [activeTab, setActiveTab] = useState('home');
    const [loginId, setLoginId] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [demoFilled, setDemoFilled] = useState(null); 
    const navigate = useNavigate();

    const handleDemoLogin = (type) => {
        const account = DEMO_ACCOUNTS[type];
        if (!account) return;
        setLoginId(account.id);
        setPassword(account.pw);
        setDemoFilled(type);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!loginId || !password) {
            alert('아이디와 비밀번호를 모두 입력해주세요.');
            return;
        }

        try {
            const result = await login({ username: loginId, password: password });

            const responseData = result?.data;
            const user = responseData?.user;
            const token = responseData?.access_token;

            if (!user) {
                alert('로그인에 실패했습니다. 서버 응답을 확인해주세요.');
                return;
            }

            localStorage.setItem('user', JSON.stringify(user));
            if (token) {
                localStorage.setItem('access_token', token);
            }
            localStorage.setItem('login_time', Date.now().toString());

            const displayName = user.full_name || user.username || '사용자';
            setUserName(displayName);
            setIsLoggedIn(true);

            alert(`${displayName}님, 환영합니다!`);

            if (user.role === 'counselor') {
                navigate('/counselorhome');
            } else {
                navigate('/');
            }
        } catch (error) {
            const serverMessage = error.response?.data?.detail || error.response?.data?.message;
            const clientMessage = error.message;

            alert(serverMessage || clientMessage || '로그인 중 오류가 발생했습니다.');
        }
    };

    return (
        <>
            <Header activeTab={activeTab} setActiveTab={setActiveTab} />
            <div className="login-container">
                <div className="login-card">
                    <div className="form-section">
                        <div className="form-inner-container">
                            <h3 className="form-header-title">다시 오셨군요!</h3>
                            <p className="form-header-sub">당신의 이야기를 들려주세요.</p>

                            {/* 데모 로그인 섹션 */}
                            <div className="demo-login-box">
                                <div className="demo-login-heading">
                                    <Sparkles size={14} />
                                    <span>데모 계정으로 빠르게 둘러보기</span>
                                </div>
                                <div className="demo-btn-group">
                                    <button
                                        type="button"
                                        className={`demo-btn demo-btn-client ${demoFilled === 'client' ? 'active' : ''}`}
                                        onClick={() => handleDemoLogin('client')}
                                    >
                                        <User size={15} />
                                        <span>내담자</span>
                                    </button>
                                    <button
                                        type="button"
                                        className={`demo-btn demo-btn-counselor ${demoFilled === 'counselor' ? 'active' : ''}`}
                                        onClick={() => handleDemoLogin('counselor')}
                                    >
                                        <HeartHandshake size={15} />
                                        <span>상담사</span>
                                    </button>
                                    <button
                                        type="button"
                                        className={`demo-btn demo-btn-admin ${demoFilled === 'admin' ? 'active' : ''}`}
                                        onClick={() => handleDemoLogin('admin')}
                                    >
                                        <ShieldCheck size={15} />
                                        <span>관리자</span>
                                    </button>
                                </div>
                                {demoFilled && (
                                    <p className="demo-filled-hint">
                                        {DEMO_ACCOUNTS[demoFilled].label} 계정 정보가 입력되었어요.<br/>아래 로그인하기
                                        버튼을 눌러주세요.
                                    </p>
                                )}
                            </div>

                            <form onSubmit={handleSubmit}>
                                <div className="input-group-container">
                                    <label className="input-label">아이디</label>
                                    <div className="input-group">
                                        <User size={16} className="input-icon" />
                                        <input
                                            type="text"
                                            value={loginId}
                                            onChange={(e) => {
                                                setLoginId(e.target.value);
                                                setDemoFilled(null);
                                            }}
                                            className="input-field"
                                            placeholder="아이디를 입력해 주세요"
                                            autoComplete="username"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="input-group-container">
                                    <label className="input-label">비밀번호</label>
                                    <div className="input-group">
                                        <Lock size={16} className="input-icon" />
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            value={password}
                                            onChange={(e) => {
                                                setPassword(e.target.value);
                                                setDemoFilled(null);
                                            }}
                                            className="input-field"
                                            placeholder="비밀번호를 입력해 주세요"
                                            autoComplete="current-password"
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
                            <div className="divider-container">
                                <span className="divider-text">간편 로그인</span>
                            </div>
                            <div className="social-icon-wrapper">
                                {['Google', 'Kakao', 'Naver'].map((p) => (
                                    <button
                                        key={p}
                                        type="button"
                                        className={`social-icon-item ${p.toLowerCase()}-bg`}
                                        aria-label={`${p}로 로그인`}
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
            <MobileTap activeTab={activeTab} setActiveTab={setActiveTab} />
            <Footer />
        </>
    );
}
