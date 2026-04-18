import React, { useState, useEffect } from 'react';
import {
    Settings,
    Bell,
    LogOut,
    ChevronRight,
    CalendarHeart,
    MessageSquareHeart,
    FileText,
    Clock,
    LayoutDashboard,
    Heart,
    History,
    Wallet,
    PlusCircle,
    Calendar,
    Headset,
    Ticket,
    Video,
    MessagesSquare,
    ArrowLeft,
    User,
    ShieldCheck,
    UserX,
    CreditCard,
    Mail,
    Phone,
    Camera,
    CheckCircle2,
    Lock,
    KeyRound,
    AlertCircle,
    ToggleRight,
    ToggleLeft,
    CalendarDays,
    CreditCard as PaymentIcon,
    Smile,
    Frown,
    Meh,
    ClipboardList,
    Stethoscope,
    Target,
    Hash,
} from 'lucide-react';

import { useNavigate } from 'react-router-dom';
import Header from '../components/header';
import Footer from '../components/footer';
import '../static/MyPage.css';

export default function App() {
    const navigate = useNavigate();
    const [activeMenu, setActiveMenu] = useState('dashboard');
    const [activeSubMenu, setActiveSubMenu] = useState(null);
    const [ticketCount, setTicketCount] = useState(2);

    const [selectedConsultation, setSelectedConsultation] = useState(null);

    const [notifSettings, setNotifSettings] = useState({
        session: true,
        marketing: false,
        report: true,
        service: true,
    });

    const [userInfo, setUserInfo] = useState({
        name: '',
        id: '',
        email: '',
        phone: '',
        birth: '',
    });

    // 로그인한 사용자 정보 localStorage에서 불러오기
    useEffect(() => {
        const user = localStorage.getItem('user');
        if (user) {
            const userObj = JSON.parse(user);
            setUserInfo((prev) => ({
                ...prev,
                name: userObj.full_name || userObj.username || '',
                id: userObj.username || '',
                email: userObj.email || '',
                // phone, birth 등은 필요시 추가
            }));
        }
    }, []);

    // 로그아웃 핸들러
    const handleLogout = () => {
        localStorage.removeItem('user');
        navigate('/');
    };

    const menuItems = [
        { id: 'history', label: '상담 히스토리', icon: History },
        { id: 'tickets', label: '상담권/결제', icon: Wallet },
        { id: 'diary', label: '마음 리포트', icon: FileText },
        { id: 'profile', label: '계정 설정', icon: Settings },
    ];

    const handleMenuClick = (id) => {
        setActiveMenu(id);
        setActiveSubMenu(null);
        setSelectedConsultation(null);
    };

    const toggleNotif = (key) => {
        setNotifSettings((prev) => ({ ...prev, [key]: !prev[key] }));
    };

    const renderHistoryDetail = () => {
        const historyList = [
            {
                id: 1,
                counselor: '이은지 상담사',
                date: '2024.05.13',
                time: '14:00',
                type: '대면 상담',
                status: '상담 완료',
                topic: '대인관계 스트레스',
                summary:
                    '주변인들의 부탁을 거절하지 못해 발생하는 번아웃과 스트레스에 대해 논의함. 자신의 욕구를 먼저 파악하는 연습이 필요함.',
                feedback:
                    '소현님은 타인에 대한 배려가 깊지만, 그만큼 자신을 돌보는 데 소홀해져 있었습니다. 오늘은 "나의 경계선 설정하기"를 주제로 구체적인 거절의 기술을 연습해 보았습니다.',
                nextStep: '하루에 한 번, 내키지 않는 제안에 대해 정중히 거절해 보기',
            },
            {
                id: 2,
                counselor: '박민우 상담사',
                date: '2024.05.06',
                time: '11:00',
                type: '대면 상담',
                status: '상담 완료',
                topic: '직장 내 갈등 관리',
                summary: '상사의 일방적인 업무 지시 방식으로 인한 무력감과 갈등 상황을 공유함.',
                feedback:
                    '감정적인 대응보다는 업무 효율성과 연계된 소통 방식을 제안했습니다. 본인의 감정이 "무시당함"에 집중되어 있음을 인지하고 이를 객관적으로 분리하는 훈련을 진행했습니다.',
                nextStep: '갈등 상황 발생 시 즉시 반응하지 않고 10초간 호흡하기',
            },
            {
                id: 3,
                counselor: '이은지 상담사',
                date: '2024.04.29',
                time: '14:00',
                type: '대면 상담',
                status: '상담 완료',
                topic: '자존감 회복 훈련',
                summary: '과거의 실패 경험이 현재의 의사 결정에 미치는 부정적 영향 분석.',
                feedback:
                    '성취 경험을 기록하는 "칭찬 일기"를 통해 자신감을 회복하는 단계입니다. 오늘은 본인이 가진 강점 5가지를 찾아내는 시간을 가졌습니다.',
                nextStep: '매일 잠들기 전 나를 위한 칭찬 한 문장 적기',
            },
            {
                id: 4,
                counselor: '김하나 상담사',
                date: '2024.04.15',
                time: '16:30',
                type: '대면 상담',
                status: '상담 완료',
                topic: '불안 장애 상담',
                summary: '원인 모를 급격한 심박수 증가와 신체적 불안 증상에 대한 대처법.',
                feedback:
                    '공황 증상과 유사한 불안 발작 시 사용할 수 있는 접지법(Grounding)과 복식 호흡법을 숙달했습니다. 심리적 안전 기지를 설정하는 명상을 함께 진행했습니다.',
                nextStep: '불안 신호 포착 시 5-4-3-2-1 접지법 시행하기',
            },
        ];

        if (selectedConsultation) {
            return (
                <div className="consultation-detail-container">
                    <button onClick={() => setSelectedConsultation(null)} className="back-button">
                        <ArrowLeft size={16} /> 전체 목록으로
                    </button>

                    <div className="report-card">
                        <div className="report-header">
                            <div>
                                <span className="badge">Consultation Report</span>
                                <h3 className="report-title">{selectedConsultation.topic}</h3>
                                <p className="report-meta">
                                    {selectedConsultation.counselor} • {selectedConsultation.date}{' '}
                                    {selectedConsultation.time}
                                </p>
                            </div>
                            <div className="icon-wrapper-outer">
                                <div className="icon-wrapper-inner">
                                    <ClipboardList size={24} />
                                </div>
                            </div>
                        </div>

                        <div className="report-body">
                            <section className="report-section">
                                <h4 className="section-title">
                                    <div className="title-indicator"></div>
                                    상담 요약
                                </h4>
                                <div className="summary-box">
                                    <p className="summary-text">{selectedConsultation.summary}</p>
                                </div>
                            </section>

                            <section className="report-section">
                                <h4 className="section-title">
                                    <div className="title-indicator"></div>
                                    전문가 소견
                                </h4>
                                <div className="feedback-wrapper">
                                    <p className="feedback-text">{selectedConsultation.feedback}</p>
                                </div>
                            </section>

                            <section className="action-step-card">
                                <h4 className="action-step-title">
                                    <Target size={20} />
                                    다음 상담까지의 실천 과제
                                </h4>
                                <p className="action-step-content">"{selectedConsultation.nextStep}"</p>
                            </section>
                        </div>

                        <div className="report-footer">
                            <p className="privacy-notice">이 기록은 오직 소현님과 담당 상담사만 확인할 수 있습니다.</p>
                        </div>
                    </div>
                </div>
            );
        }

        return (
            <div className="fade-in">
                <button onClick={() => handleMenuClick('dashboard')} className="history-back-button">
                    <ArrowLeft size={16} /> 대시보드
                </button>

                <div className="history-header">
                    <div>
                        <h3 className="history-title">상담 히스토리</h3>
                        <p className="history-subtitle">소현님이 걸어온 마음의 발자취입니다.</p>
                    </div>
                    <div className="history-total-badge-wrapper">
                        <span className="history-total-badge">총 12회 상담 완료</span>
                    </div>
                </div>

                <div className="history-list-container">
                    {historyList.map((item) => (
                        <div key={item.id} onClick={() => setSelectedConsultation(item)} className="history-item-card">
                            <div className="history-item-main">
                                <div className="history-icon-box">
                                    <CalendarDays size={24} />
                                </div>
                                <div>
                                    <div className="history-item-meta">
                                        <span className="meta-date">
                                            {item.date} {item.time}
                                        </span>
                                        <span className="meta-type">{item.type}</span>
                                    </div>
                                    <h4 className="history-item-counselor">{item.counselor}</h4>
                                    <p className="history-item-topic">상담 주제: {item.topic}</p>
                                </div>
                            </div>

                            <div className="history-item-right">
                                <div className="history-link-text">
                                    <p>상담 기록지 보기</p>
                                </div>
                                <ChevronRight size={20} className="history-arrow-icon" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    const renderTicketsDetail = () => {
        const paymentHistory = [
            { id: 1, title: '마음 돌봄 5회권 패키지', date: '2024.04.10', amount: '250,000원', status: '결제완료' },
            { id: 2, title: '1:1 집중 상담 1회권', date: '2024.03.15', amount: '60,000원', status: '결제완료' },
        ];

        return (
            <div className="fade-in">
                <button onClick={() => handleMenuClick('dashboard')} className="payment-back-button">
                    <ArrowLeft size={16} /> 대시보드
                </button>
                <h3 className="payment-main-title">상담권/결제 상세</h3>

                <div className="payment-grid-layout">
                    {/* 왼쪽: 상담권 보유 및 구매 섹션 */}
                    <div className="payment-main-content bg-white">
                        <div className="ticket-status-card">
                            <div>
                                <p className="ticket-status-label">현재 사용 가능한 상담권</p>
                                <p className="ticket-status-count">{ticketCount}회</p>
                            </div>
                            <div className="ticket-wallet-icon">
                                <Wallet size={40} className="text-amber-300" />
                            </div>
                        </div>

                        <button className="payment-primary-btn">
                            <PlusCircle size={20} />
                            추가 결제하기
                        </button>

                        <h4 className="payment-section-title">
                            <PlusCircle size={18} className="text-[#8BA888]" /> 상담권 구매하기
                        </h4>
                        <div className="purchase-options-grid">
                            <button className="purchase-card featured">
                                <p className="purchase-card-tag">가장 인기있는</p>
                                <p className="purchase-card-name">5회 패키지</p>
                                <p className="purchase-card-price">250,000원</p>
                            </button>
                            <button className="purchase-card">
                                <p className="purchase-card-tag">부담 없이 시작하는</p>
                                <p className="purchase-card-name">1회 체험권</p>
                                <p className="purchase-card-price">60,000원</p>
                            </button>
                        </div>
                    </div>

                    {/* 오른쪽: 최근 결제 내역 섹션 */}
                    <div className="payment-side-content bg-white">
                        <h4 className="payment-section-title">
                            <PaymentIcon size={18} className="text-[#8BA888]" /> 최근 결제 내역
                        </h4>
                        <div className="payment-history-list">
                            {paymentHistory.map((item) => (
                                <div key={item.id} className="payment-history-item">
                                    <p className="history-item-date">{item.date}</p>
                                    <p className="history-item-title">{item.title}</p>
                                    <div className="history-item-info">
                                        <span className="history-item-status">{item.status}</span>
                                        <span className="history-item-amount">{item.amount}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button className="payment-view-all-btn">전체 결제 내역 보기</button>
                    </div>
                </div>
            </div>
        );
    };

    const renderDiaryDetail = () => {
        return (
            <div className="fade-in">
                <button onClick={() => handleMenuClick('dashboard')} className="report-detail-back-btn">
                    <ArrowLeft size={16} /> 대시보드
                </button>
                <h3 className="report-detail-main-title">마음 리포트 상세</h3>

                <div className="report-detail-grid">
                    {/* 왼쪽 영역: 감정 분석 및 AI 코멘트 */}
                    <div className="report-detail-left-col">
                        <div className="report-detail-card main-chart-card">
                            <div className="chart-header">
                                <div>
                                    <h4 className="chart-title">주간 감정 흐름 분석</h4>
                                    <p className="chart-subtitle">최근 7일간 소현님의 마음 날씨입니다.</p>
                                </div>
                                <div className="emotion-status-badge">
                                    <Smile size={16} className="text-[#8BA888]" />
                                    <span>평온함</span>
                                </div>
                            </div>

                            {/* 그래프 영역 */}
                            <div className="emotion-chart-container">
                                <div className="chart-bar h-40-pct"></div>
                                <div className="chart-bar h-60-pct"></div>
                                <div className="chart-bar h-30-pct bg-dim"></div>
                                <div className="chart-bar h-85-pct bg-active"></div>
                                <div className="chart-bar h-70-pct bg-active"></div>
                                <div className="chart-bar h-50-pct"></div>
                                <div className="chart-bar h-90-pct bg-active"></div>
                            </div>
                            <div className="chart-labels">
                                {['월', '화', '수', '목', '금', '토', '일'].map((d) => (
                                    <span key={d}>{d}</span>
                                ))}
                            </div>
                        </div>

                        <div className="report-detail-card ai-comment-card">
                            <h4 className="ai-comment-title">
                                <MessagesSquare size={20} className="text-[#8BA888]" /> AI 마음 코멘트
                            </h4>
                            <div className="ai-comment-bubble">
                                <p>
                                    "소현님, 이번 주에는 평소보다 직장에서의 인간관계에 대한 고민이 많으셨네요. 하지만
                                    상담을 통해 감정을 객관화하려는 노력이 엿보여요. 목요일 이후로 감정 상태가 눈에 띄게
                                    회복된 것은 아주 긍정적인 신호입니다. 자신을 다독이는 시간을 조금 더 가져보세요."
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* 오른쪽 영역: 에너지 바 및 추천 테라피 */}
                    <div className="report-detail-right-col">
                        <div className="report-detail-card energy-card">
                            <h4 className="energy-title">현재 마음 에너지</h4>
                            <div className="energy-item-list">
                                <div className="energy-item">
                                    <div className="energy-info">
                                        <span className="label">회복 탄력성</span>
                                        <span className="value text-primary">72%</span>
                                    </div>
                                    <div className="progress-bar">
                                        <div className="progress-fill" style={{ width: '72%' }}></div>
                                    </div>
                                </div>
                                <div className="energy-item">
                                    <div className="energy-info">
                                        <span className="label">스트레스 조절</span>
                                        <span className="value text-muted">48%</span>
                                    </div>
                                    <div className="progress-bar">
                                        <div className="progress-fill bg-warning" style={{ width: '48%' }}></div>
                                    </div>
                                </div>
                                <div className="energy-item">
                                    <div className="energy-info">
                                        <span className="label">자아 긍정</span>
                                        <span className="value text-primary">65%</span>
                                    </div>
                                    <div className="progress-bar">
                                        <div className="progress-fill" style={{ width: '65%' }}></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="report-detail-card therapy-card">
                            <h4 className="therapy-title">추천 테라피</h4>
                            <div className="therapy-content-box">
                                <div className="therapy-icon-wrapper">
                                    <Clock size={20} />
                                </div>
                                <div>
                                    <p className="therapy-name">명상 10분</p>
                                    <p className="therapy-desc">호흡에 집중해 보세요</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const renderPersonalEdit = () => {
        return (
            <div className="fade-in w-full">
                {/* 프로필 및 기본 정보 섹션 */}
                <div className="profile-edit-section">
                    <div className="profile-upper-layout">
                        <div className="profile-image-container">
                            <div className="profile-image-wrapper">
                                <div className="profile-avatar">
                                    <img
                                        src="https://api.dicebear.com/7.x/notionists/svg?seed=Sohyun"
                                        alt="User Profile"
                                    />
                                </div>
                                <button className="profile-camera-btn">
                                    <Camera size={24} />
                                </button>
                            </div>
                            <p className="profile-change-text">프로필 사진 변경</p>
                            <p className="profile-change-sub">나를 잘 나타내는 사진을 등록해 주세요.</p>
                        </div>

                        <div className="profile-info-fields">
                            <div>
                                <label className="input-label">이름</label>
                                <div className="relative-input-box">
                                    <User className="input-icon" size={20} />
                                    <input
                                        type="text"
                                        className="custom-input"
                                        value={userInfo.name}
                                        onChange={(e) => setUserInfo({ ...userInfo, name: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="input-label">휴대폰 번호</label>
                                <div className="relative-input-box">
                                    <Phone className="input-icon" size={20} />
                                    <input
                                        type="tel"
                                        className="custom-input"
                                        value={userInfo.phone}
                                        onChange={(e) => setUserInfo({ ...userInfo, phone: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="profile-readonly-grid">
                        <div className="grid-col-1">
                            <label className="input-label">아이디</label>
                            <div className="relative-input-box">
                                <Hash className="input-icon" size={20} />
                                <input type="text" className="custom-input bg-readonly" value={userInfo.id} readOnly />
                            </div>
                            <p className="input-helper-text">* 아이디는 변경할 수 없습니다.</p>
                        </div>
                        <div className="grid-col-1">
                            <label className="input-label">이메일 주소</label>
                            <div className="relative-input-box">
                                <Mail className="input-icon" size={20} />
                                <input
                                    type="email"
                                    className="custom-input bg-readonly"
                                    value={userInfo.email}
                                    readOnly
                                />
                            </div>
                            <p className="input-helper-text">* 이메일은 가입 시 고유 정보로 변경할 수 없습니다.</p>
                        </div>
                    </div>
                </div>

                {/* 보안 설정 섹션 */}
                <div className="profile-edit-section">
                    <h4 className="security-section-title">
                        <div className="security-icon-box">
                            <ShieldCheck size={24} />
                        </div>
                        로그인 보안 설정
                    </h4>
                    <div className="security-fields-layout">
                        <div>
                            <label className="input-label">현재 비밀번호</label>
                            <div className="relative-input-box">
                                <Lock className="input-icon" size={20} />
                                <input
                                    type="password"
                                    placeholder="현재 비밀번호를 입력해 주세요"
                                    className="custom-input"
                                />
                            </div>
                        </div>
                        <div className="security-password-grid">
                            <div>
                                <label className="input-label">새 비밀번호</label>
                                <div className="relative-input-box">
                                    <KeyRound className="input-icon" size={20} />
                                    <input type="password" placeholder="8자 이상 영문+숫자" className="custom-input" />
                                </div>
                            </div>
                            <div>
                                <label className="input-label">새 비밀번호 확인</label>
                                <div className="relative-input-box">
                                    <KeyRound className="input-icon" size={20} />
                                    <input
                                        type="password"
                                        placeholder="다시 한번 입력해 주세요"
                                        className="custom-input"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <button className="profile-save-full-btn">
                    <CheckCircle2 size={24} />
                    변경 사항 안전하게 저장하기
                </button>
            </div>
        );
    };

    const renderNotificationEdit = () => {
        const settings = [
            { key: 'session', title: '상담 일정 알림', desc: '예약된 상담 시간 및 변동 사항을 알려드려요.' },
            { key: 'report', title: '마음 리포트 알림', desc: '분석이 완료된 나만의 리포트 도착 소식을 알려드려요.' },
            { key: 'service', title: '서비스 공지사항', desc: '점검 안내 등 서비스 이용에 필요한 정보를 알려드려요.' },
            { key: 'marketing', title: '이벤트 및 혜택 알림', desc: '새로운 프로그램과 할인 쿠폰 정보를 받아보세요.' },
        ];

        return (
            <div className="fade-in w-full">
                <div className="notif-settings-container">
                    <div className="notif-list-wrapper">
                        {settings.map((item) => (
                            <div key={item.key} className="notif-toggle-item group">
                                <div className="notif-item-content">
                                    <p className="notif-item-title">{item.title}</p>
                                    <p className="notif-item-desc">{item.desc}</p>
                                </div>
                                <button
                                    onClick={() => toggleNotif(item.key)}
                                    className={`notif-toggle-btn ${notifSettings[item.key] ? 'active' : 'inactive'}`}
                                >
                                    {notifSettings[item.key] ? (
                                        <ToggleRight size={56} strokeWidth={1.2} />
                                    ) : (
                                        <ToggleLeft size={56} strokeWidth={1.2} />
                                    )}
                                </button>
                            </div>
                        ))}
                    </div>

                    <div className="notif-alert-box">
                        <AlertCircle size={24} className="notif-alert-icon" />
                        <p className="notif-alert-text">
                            기기 전체 알림이 꺼져있을 경우 앱 설정을 켜도 알림이 전송되지 않을 수 있습니다. 휴대폰의{' '}
                            <span className="notif-alert-highlight">설정 {' > '} 알림</span> 메뉴에서 마인드웰의 '알림
                            허용' 상태를 확인해 주세요.
                        </p>
                    </div>
                </div>
            </div>
        );
    };

    const renderQuitService = () => {
        return (
            <div className="fade-in w-full text-center">
                <div className="withdraw-container">
                    <div className="withdraw-header">
                        <div className="withdraw-icon-box">
                            <UserX size={48} />
                        </div>
                        <h4 className="withdraw-title">정말 마인드웰을 떠나시나요?</h4>
                        <p className="withdraw-subtitle">탈퇴하시면 지금까지 쌓아온 소중한 기록들이 사라집니다.</p>
                    </div>

                    <div className="withdraw-notice-box">
                        <div className="withdraw-notice-item">
                            <span className="notice-number">1</span>
                            <p className="notice-text">
                                보유 중인 모든 상담권({ticketCount}회)과 포인트가 즉시 소멸되며 환불이 불가능합니다.
                            </p>
                        </div>
                        <div className="withdraw-notice-item">
                            <span className="notice-number">2</span>
                            <p className="notice-text">
                                지금까지 작성된 모든 마음 리포트와 상담 히스토리(기록지)가 영구 삭제됩니다.
                            </p>
                        </div>
                        <div className="withdraw-notice-item">
                            <span className="notice-number">3</span>
                            <p className="notice-text">탈퇴 후 30일간은 동일한 정보로 재가입이 불가능합니다.</p>
                        </div>
                    </div>

                    <label className="withdraw-agree-label group">
                        <input type="checkbox" className="withdraw-checkbox" />
                        <span className="withdraw-agree-text">위 유의사항을 모두 확인하였으며, 이에 동의합니다.</span>
                    </label>

                    <button className="withdraw-submit-btn">마인드웰 계정 영구 삭제</button>
                </div>
            </div>
        );
    };

    const renderProfileDetail = () => {
        const details = {
            personal: {
                title: '개인정보 수정 및 보안',
                desc: '회원님의 소중한 정보와 비밀번호를 안전하게 관리하세요.',
            },
            notification: { title: '알림 설정', desc: '상담 일정 및 서비스 소식을 전해드릴게요.' },
            quit: { title: '서비스 탈퇴', desc: '탈퇴 시 소중한 기록들이 모두 삭제됩니다.' },
        };

        const current = details[activeSubMenu];

        return (
            <div className="fade-in w-full">
                <div className="submenu-container">
                    <div className="submenu-header-section">
                        <button onClick={() => setActiveSubMenu(null)} className="submenu-back-btn">
                            <ArrowLeft size={16} /> 계정 설정으로 돌아가기
                        </button>
                        <h3 className="submenu-main-title">{current.title}</h3>
                        <p className="submenu-description">{current.desc}</p>
                    </div>

                    <div className="submenu-content-area">
                        {activeSubMenu === 'personal' && renderPersonalEdit()}
                        {activeSubMenu === 'notification' && renderNotificationEdit()}
                        {activeSubMenu === 'quit' && renderQuitService()}
                    </div>
                </div>
            </div>
        );
    };

    const renderContent = () => {
        if (activeMenu === 'profile' && activeSubMenu) {
            return renderProfileDetail();
        }

        switch (activeMenu) {
            case 'history':
                return renderHistoryDetail();
            case 'tickets':
                return renderTicketsDetail();
            case 'diary':
                return renderDiaryDetail();
            case 'profile':
                return (
                    <div className="fade-in">
                        <button onClick={() => handleMenuClick('dashboard')} className="account-main-back-btn">
                            <ArrowLeft size={16} /> 돌아가기
                        </button>
                        <h3 className="account-main-title">계정 설정</h3>

                        <div className="setting-items-list">
                            {[
                                { key: 'personal', label: '개인정보 수정 및 보안', icon: User, type: 'personal' },
                                { key: 'notification', label: '알림 설정', icon: Bell, type: 'notification' },
                                { key: 'quit', label: '서비스 탈퇴', icon: UserX, type: 'quit' },
                            ].map((item) => (
                                <div
                                    key={item.key}
                                    className="setting-item-card group"
                                    onClick={() => setActiveSubMenu(item.key)}
                                >
                                    <div className="setting-item-left">
                                        <div className={`setting-item-icon-box is-${item.type}`}>
                                            <item.icon size={20} />
                                        </div>
                                        <span className="setting-item-label">{item.label}</span>
                                    </div>
                                    <ChevronRight size={20} className="setting-item-arrow" />
                                </div>
                            ))}
                        </div>

                        <div className="account-logout-section">
                            <button className="account-logout-btn" onClick={handleLogout}>
                                <LogOut size={20} />
                                로그아웃
                            </button>
                        </div>
                    </div>
                );
            default:
                return (
                    <div className="fade-in">
                        {/* 상단 상태 그리드 */}
                        <div className="dash-status-grid">
                            <div className="dash-status-item" onClick={() => handleMenuClick('tickets')}>
                                <div className="status-icon-box bg-amber">
                                    <Wallet size={18} />
                                </div>
                                <p className="status-label">잔여 상담권</p>
                                <p className="status-value">
                                    {ticketCount}
                                    <span className="unit">회</span>
                                </p>
                            </div>
                            <div className="dash-status-item">
                                <div className="status-icon-box bg-blue">
                                    <CalendarHeart size={18} />
                                </div>
                                <p className="status-label">대기 중인 예약</p>
                                <p className="status-value">
                                    1<span className="unit">건</span>
                                </p>
                            </div>
                            <div className="dash-status-item" onClick={() => handleMenuClick('history')}>
                                <div className="status-icon-box bg-rose">
                                    <History size={18} />
                                </div>
                                <p className="status-label">완료한 상담</p>
                                <p className="status-value">
                                    12<span className="unit">회</span>
                                </p>
                            </div>
                        </div>
                        {/* 다음 상담 예약 히어로 카드 */}
                        <div className="dash-hero-card">
                            <div className="hero-content">
                                <div className="hero-icon-wrapper">
                                    <MessagesSquare size={28} />
                                </div>
                                <div className="hero-text-group">
                                    <div className="hero-badge-row">
                                        <span className="hero-d-badge">D-2</span>
                                        <p className="hero-subtitle">Next Session</p>
                                    </div>
                                    <h3 className="hero-main-title">5월 20일(수) 오후 2:00</h3>
                                    <p className="hero-desc">이은지 상담사와 1:1 상담 예정</p>
                                </div>
                            </div>
                            <button className="hero-action-btn">
                                상담 상세 보기
                                <ChevronRight size={18} />
                            </button>
                        </div>
                        {/* 최근 상담 기록 리스트 */}
                        <div className="dash-section-header">
                            <h3 className="section-title">
                                <History size={20} className="text-[#8BA888]" /> 최근 상담 기록
                            </h3>
                            <button onClick={() => handleMenuClick('history')} className="section-more-btn">
                                전체보기
                            </button>
                        </div>

                        <div className="dash-history-list">
                            {[
                                {
                                    counselor: '이은지 상담사',
                                    date: '2024.05.13',
                                    type: '대면 상담',
                                    status: '상담 완료',
                                },
                                {
                                    counselor: '박민우 상담사',
                                    date: '2024.05.06',
                                    type: '대면 상담',
                                    status: '상담 완료',
                                },
                            ].map((item, idx) => (
                                <div key={idx} className="dash-history-card" onClick={() => handleMenuClick('history')}>
                                    <div className="history-info-group">
                                        <div className="history-icon-box">
                                            <MessageSquareHeart size={20} />
                                        </div>
                                        <div>
                                            <div className="history-title-row">
                                                <p className="counselor-name">{item.counselor}</p>
                                                <span className="status-tag">{item.status}</span>
                                            </div>
                                            <p className="history-meta">
                                                {item.date} • {item.type}
                                            </p>
                                        </div>
                                    </div>
                                    <button className="history-arrow-btn">
                                        <ChevronRight size={18} />
                                    </button>
                                </div>
                            ))}
                        </div>
                        {/* 상담권 구매 배너 */}
                        <div className="dash-purchase-banner group" onClick={() => handleMenuClick('tickets')}>
                            <div className="purchase-info">
                                <div className="purchase-icon-box">
                                    <Ticket size={18} />
                                </div>
                                <div className="purchase-text">
                                    <p className="title">더 많은 위로가 필요하신가요?</p>
                                    <p className="desc">상담권을 충전하고 마음 케어를 이어가세요.</p>
                                </div>
                            </div>
                            <div className="purchase-action-btn">
                                {ticketCount > 0 ? '상담권 추가 충전하기' : '상담권 충전하기'}
                                <ChevronRight size={14} />
                            </div>
                        </div>
                        {/* 모바일 전용 하단 메뉴 */}
                        <section className="mobile-only-menu">
                            <h4 className="mobile-menu-label">전체 메뉴</h4>
                            <div className="mobile-menu-group">
                                <div onClick={() => handleMenuClick('history')} className="mobile-menu-item border-b">
                                    <span>상담 히스토리</span>
                                    <ChevronRight size={16} />
                                </div>
                                <div onClick={() => handleMenuClick('tickets')} className="mobile-menu-item border-b">
                                    <span>상담권/결제</span>
                                    <ChevronRight size={16} />
                                </div>
                                <div onClick={() => handleMenuClick('diary')} className="mobile-menu-item">
                                    <span>마음 리포트</span>
                                    <ChevronRight size={16} />
                                </div>
                            </div>
                            <div className="mobile-menu-group mt-4">
                                <div onClick={() => handleMenuClick('profile')} className="mobile-menu-item border-b">
                                    <span>계정 설정</span>
                                    <ChevronRight size={16} />
                                </div>
                                <div
                                    className="mobile-menu-item text-rose"
                                    onClick={handleLogout}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <span>로그아웃</span>
                                </div>
                            </div>
                        </section>
                    </div>
                );
        }
    };

    return (
        <div className="mypage-layout-root">
            {/* 사이드바 영역 */}
            <aside className="mypage-sidebar">
                <div className="sidebar-logo-section" style={{ cursor: 'pointer' }} onClick={() => navigate('/')}>
                    <h1 className="sidebar-brand-logo">MINDWELL</h1>
                    <p className="sidebar-brand-sub">Mental Health Care</p>
                </div>

                <nav className="sidebar-nav-list">
                    <div
                        onClick={() => handleMenuClick('dashboard')}
                        className={`sidebar-nav-item ${activeMenu === 'dashboard' ? 'is-active' : ''}`}
                    >
                        <LayoutDashboard size={20} />
                        <span>대시보드</span>
                    </div>
                    {menuItems.map((item) => (
                        <div
                            key={item.id}
                            onClick={() => handleMenuClick(item.id)}
                            className={`sidebar-nav-item ${activeMenu === item.id ? 'is-active' : ''}`}
                        >
                            <item.icon size={20} />
                            <span>{item.label}</span>
                        </div>
                    ))}
                </nav>

                <div className="sidebar-footer-nav">
                    <div className="sidebar-nav-item is-cs-link">
                        <Headset size={20} className="icon-stone" />
                        <span>고객센터</span>
                    </div>
                    <div
                        className="sidebar-nav-item is-logout-link"
                        onClick={handleLogout}
                        style={{ cursor: 'pointer' }}
                    >
                        <LogOut size={20} />
                        <span>로그아웃</span>
                    </div>
                </div>
            </aside>

            {/* 메인 콘텐츠 영역 */}
            <main className="mypage-content-area">
                {/* <Header/> */}

                <div className="user-welcome-header">
                    <div className="user-profile-summary" onClick={() => handleMenuClick('dashboard')}>
                        <div className="user-avatar-box">
                            <img src="https://api.dicebear.com/7.x/notionists/svg?seed=Sohyun" alt="User" />
                        </div>
                        <div className="user-info-text">
                            <h2 className="user-name-title">
                                안녕하세요, {userInfo.name ? userInfo.name + '님' : ''}!
                            </h2>
                            <p className="user-status-msg">마음 근육을 키운 지 42일째 되는 날이에요. 🌿</p>
                        </div>
                    </div>

                    <button className="user-notif-check-btn">
                        <Bell size={18} className="icon-green" />
                        알림 확인
                    </button>
                </div>

                <div className="dynamic-render-content">{renderContent()}</div>

                {/* <Footer/> */}
            </main>
        </div>
    );
}
