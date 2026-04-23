import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, ChevronRight, BookHeart, User, ChevronLeft } from 'lucide-react';
import axios from 'axios'; // axios 라이브러리 사용
import '../static/Login.css'; // 기존 로그인 스타일 시트 유지

export default function FindPwPage() {
    const [id, setId] = useState('');
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleFindPw = async (e) => {
        e.preventDefault();
        
        if (!id || !email) {
            return alert('정보를 모두 입력해주세요.');
        }

        setIsLoading(true);
        try {
            // 백엔드 API 호출
            const response = await axios.post('/api/auth/find-password', {
                username: id,
                email: email
            });

            if (response.status === 200) {
                alert('등록된 이메일로 안내 메일이 발송되었습니다.');
                navigate('/login');
            }
        } catch (error) {
            console.error('발송 에러:', error);
            alert(error.response?.data?.detail || "정보가 일치하지 않습니다.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                {/* 좌측: 브랜딩 영역 (기존 LoginPage와 동일 구성 유지) */}
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
                                비밀번호를 <br />
                                잊으셨나요?
                            </h2>
                            <p className="brand-sub-desc">
                                가입하신 아이디와 이메일을 입력하시면 <br />
                                안전하게 비밀번호 재설정을 도와드립니다.
                            </p>
                        </div>
                    </div>

                    <div className="branding-bottom">
                        <span className="brand-footer-text">© 2026 MINDWELL. All rights reserved.</span>
                    </div>
                </div>

                {/* 우측: 비밀번호 찾기 폼 영역 */}
                <div className="form-section">
                    <div className="form-inner-container">
                        <button onClick={() => navigate('/login')} className="back-to-login" style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'none', border: 'none', color: '#666', cursor: 'pointer', marginBottom: '20px', fontSize: '14px' }}>
                            <ChevronLeft size={16} /> 로그인으로 돌아가기
                        </button>
                        
                        <h3 className="form-header-title">비밀번호 찾기</h3>
                        <p className="form-header-sub">계정에 등록된 정보를 입력해 주세요.</p>

                        <form onSubmit={handleFindPw}>
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
                                <label className="input-label">Email</label>
                                <div className="input-group">
                                    <Mail size={16} className="input-icon" />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="input-field"
                                        placeholder="등록된 이메일을 입력해 주세요"
                                        required
                                    />
                                </div>
                            </div>

                            <button type="submit" className="submit-btn" disabled={isLoading}>
                                <span>{isLoading ? '발송 중...' : '안내 메일 발송하기'}</span>
                                <ChevronRight size={18} />
                            </button>
                        </form>

                        <div className="auth-links-container" style={{ marginTop: '30px', textAlign: 'center' }}>
                            <p style={{ fontSize: '13px', color: '#888' }}>
                                아직 회원이 아니신가요? 
                                <button className="auth-link" onClick={() => navigate('/signup')} style={{ marginLeft: '8px', fontWeight: '600' }}>
                                    회원가입
                                </button>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}