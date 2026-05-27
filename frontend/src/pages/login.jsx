import React, { useState } from 'react';
import Header from '../components/header';
import Footer from '../components/footer';
import MobileTap from '../components/mobileTap';
import { useNavigate } from 'react-router-dom';
import { Lock, ChevronRight, Eye, EyeOff, User } from 'lucide-react';
import { login } from '../api/auth';
import '../static/Login.css';

export default function LoginPage({ setUserName, setIsLoggedIn }) {
    // 헤더/모바일탭 activeTab 상태 관리
    const [activeTab, setActiveTab] = useState('home');
    // 변수명 충돌 방지를 위해 id 대신 loginId 사용
    const [loginId, setLoginId] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        // 1. 입력값 검증 (방어 코드)
        if (!loginId || !password) {
            alert('아이디와 비밀번호를 모두 입력해주세요.');
            return;
        }

        try {
            console.log('로그인 시도 아이디:', loginId);

            // 2. API 호출
            // 서버의 요구 형식에 따라 username: loginId로 매핑하여 전달
            const result = await login({ username: loginId, password: password });

            // 3. 응답 데이터 안전하게 추출 (Optional Chaining 적용)
            const responseData = result?.data;
            const user = responseData?.user;
            const token = responseData?.access_token;

            // 4. 로그인 성공 여부 확인
            if (!user) {
                console.error('로그인 응답에 사용자 정보가 없습니다.', result);
                alert('로그인에 실패했습니다. 서버 응답을 확인해주세요.');
                return;
            }

            // 5. 로컬 스토리지 데이터 저장
            // 나중에 새로고침해도 로그인이 유지되도록 함
            localStorage.setItem('user', JSON.stringify(user));
            if (token) {
                localStorage.setItem('access_token', token);
            }
            localStorage.setItem('login_time', Date.now().toString());

            // 6. 상위 컴포넌트(App) 상태 업데이트
            // DB 테이블의 full_name이 없으면 username을, 둘 다 없으면 '사용자' 표시
            const displayName = user.full_name || user.username || '사용자';
            setUserName(displayName);
            setIsLoggedIn(true);

            alert(`${displayName}님, 환영합니다!`);

            // 7. DB 역할(role)에 따른 페이지 라우팅
            if (user.role === 'counselor') {
                navigate('/counselorhome');
            } else {
                navigate('/');
            }
        } catch (error) {
            console.error('로그인 프로세스 중 에러 발생:', error);

            // Axios 에러 처리: 서버에서 보내준 상세 메시지가 있다면 출력
            const serverMessage = error.response?.data?.detail || error.response?.data?.message;
            const clientMessage = error.message;

            alert(serverMessage || clientMessage || '로그인 중 오류가 발생했습니다.');
        }
    };

    return (
        <>
            <Header activeTab={activeTab} setActiveTab={setActiveTab} />
            <div className="login-container">
                {/* 단일 카드 (브랜딩 섹션 제거, 폼만 유지) */}
                <div className="login-card">
                    <div className="form-section">
                        <div className="form-inner-container">
                            <h3 className="form-header-title">다시 오셨군요!</h3>
                            <p className="form-header-sub">당신의 이야기를 들려주세요.</p>
                            <form onSubmit={handleSubmit}>
                                <div className="input-group-container">
                                    <label className="input-label">아이디</label>
                                    <div className="input-group">
                                        <User size={16} className="input-icon" />
                                        <input
                                            type="text"
                                            value={loginId}
                                            onChange={(e) => setLoginId(e.target.value)}
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
                                            onChange={(e) => setPassword(e.target.value)}
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
                            {/* 소셜 로그인 구분선 - 양옆 라인 스타일 */}
                            <div className="divider-container">
                                <span className="divider-text">간편 로그인</span>
                            </div>
                            {/* 소셜 버튼 - 원형 */}
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
