import React, { useState, useEffect } from 'react';
import { deleteAccount } from '../api/auth';
import { getUserInfo, updateUserInfo, changePassword } from '../api/user';
import { getFavorites, toggleFavorite } from '../api/favorite';
import CounselorListPage from './CounselorList';
import { isTokenExpired } from '../utils/jwt';
import {
    Settings,
    Bell,
    LogOut,
    ChevronRight,
    CalendarHeart,
    MessageSquareHeart,
    History,
    Wallet,
    Calendar,
    Ticket,
    MessagesSquare,
    ArrowLeft,
    User,
    ShieldCheck,
    UserX,
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
    Heart,
    ClipboardList,
    Target,
    Hash,
    Lightbulb,
    Check,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import '../static/MyPage.css';

const notifSettingsData = [
    { key: 'session', title: '상담 일정 알림', desc: '예약된 상담 시간 및 변동 사항 안내' },
    { key: 'service', title: '서비스 공지사항', desc: '점검 안내 및 주요 이용 정보' },
    { key: 'marketing', title: '이벤트 및 혜택 알림', desc: '새로운 프로그램 및 할인 쿠폰 정보' },
];

const NotificationSettings = ({ notifSettings, toggleNotif }) => {
    return (
        <div className="ns-card">
            <header className="ns-header">
                <div className="ns-header-icon-box">
                    <Bell size={20} />
                </div>
                <h1 className="ns-header-title">알림 설정</h1>
            </header>

            <main className="ns-list">
                {notifSettingsData.map((item) => {
                    const isActive = notifSettings[item.key];
                    return (
                        <div key={item.key} className="ns-toggle-item">
                            <div className="ns-item-text">
                                <p className="ns-item-title">{item.title}</p>
                                <p className="ns-item-desc">{item.desc}</p>
                            </div>
                            <button
                                onClick={() => toggleNotif(item.key)}
                                className={`ns-toggle-btn ${isActive ? 'is-on' : 'is-off'}`}
                            >
                                {isActive ? (
                                    <ToggleRight size={48} strokeWidth={1.2} />
                                ) : (
                                    <ToggleLeft size={48} strokeWidth={1.2} />
                                )}
                            </button>
                        </div>
                    );
                })}
            </main>

            <footer className="ns-footer-box">
                <AlertCircle size={18} className="ns-footer-icon" />
                <p className="ns-footer-text">
                    기기 전체 알림이 꺼져있을 경우 앱 설정을 켜도 알림이 전송되지 않습니다. 휴대폰의{' '}
                    <span className="ns-footer-highlight">설정 &gt; 알림</span> 메뉴에서 마인드웰의 알림 허용 상태를
                    확인해 주세요.
                </p>
            </footer>
        </div>
    );
};

export default function App() {
    // 고객센터(고객지원) 내용 렌더링 함수
    const renderSupportCenter = () => {
        return (
            <div className="fade-in">
                <h3 className="mypage-section-title">고객센터</h3>
                <div className="mwp-card support-center-card">
                    <h4 className="support-title">무엇을 도와드릴까요?</h4>
                    <div className="support-contact-block">
                        <div className="support-contact-item">
                            <span className="support-contact-label">1:1 문의</span>
                            <span className="support-contact-desc">
                                마이페이지 &gt; <b>문의내역</b>에서 상담/결제/기타 문의를 남겨주시면 신속히
                                답변드리겠습니다.
                            </span>
                        </div>
                        <div className="support-contact-item">
                            <span className="support-contact-label">전화번호</span>
                            <span className="support-contact-desc">
                                <a href="tel:0212345678" className="support-link">
                                    02-1234-5678
                                </a>{' '}
                                (평일 10:00~18:00)
                            </span>
                        </div>
                        <div className="support-contact-item">
                            <span className="support-contact-label">센터 위치</span>
                            <span className="support-contact-desc">
                                서울특별시 강남구 테헤란로 123 4F (강남역 5번 출구)
                            </span>
                        </div>
                    </div>
                    <div className="support-faq-section">
                        <h5 className="support-faq-title">자주 묻는 질문 (FAQ)</h5>
                        <ul className="support-faq-list">
                            <li>
                                <b>Q. 상담 예약은 어떻게 하나요?</b>
                                <br />
                                A. 마이페이지 &gt; 상담 히스토리 또는 상담사 상세 페이지에서 예약 가능합니다.
                            </li>
                            <li>
                                <b>Q. 결제 영수증은 어디서 확인하나요?</b>
                                <br />
                                A. 마이페이지 &gt; 이용권/결제 메뉴에서 결제 내역과 영수증을 확인할 수 있습니다.
                            </li>
                            <li>
                                <b>Q. 환불은 어떻게 진행되나요?</b>
                                <br />
                                A. 1:1 문의 또는 고객센터로 연락주시면 환불 정책에 따라 신속히 처리해드립니다.
                            </li>
                            <li>
                                <b>Q. 상담 내역과 기록은 안전하게 보관되나요?</b>
                                <br />
                                A. 모든 상담 기록은 암호화되어 안전하게 보관되며, 본인과 담당 상담사만 열람할 수
                                있습니다.
                            </li>
                            <li>
                                <b>Q. 상담사 변경이나 일정 변경은 어떻게 하나요?</b>
                                <br />
                                A. 마이페이지 &gt; 문의내역 또는 고객센터로 요청해주시면 도와드립니다.
                            </li>
                        </ul>
                    </div>
                    <div className="support-footer-msg">
                        언제든 문의해주시면 친절하게 안내해드리겠습니다.
                        <br />
                        마인드웰 고객센터를 이용해주셔서 감사합니다.
                    </div>
                </div>
            </div>
        );
    };
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
    const [withdrawAgree, setWithdrawAgree] = useState(false);
    const [withdrawLoading, setWithdrawLoading] = useState(false);
    const [userInfo, setUserInfo] = useState({
        name: '',
        id: '',
        username: '',
        email: '',
        phone: '',
        birth: '',
        gender: '',
    });
    const [openInquiryId, setOpenInquiryId] = useState(null);
    const [pwFields, setPwFields] = useState({ current: '', new1: '', new2: '' });
    const [pwLoading, setPwLoading] = useState(false);
    const [favoritesList, setFavoritesList] = useState([]);

    const completedConsultations = 12;

    useEffect(() => {
        const user = localStorage.getItem('user');
        const token = localStorage.getItem('access_token');
        if (user) {
            const userObj = JSON.parse(user);
            setUserInfo((prev) => ({ ...prev, id: userObj.id }));
            getUserInfo(userObj.id).then((data) => {
                setUserInfo((prev) => ({
                    ...prev,
                    name: data.full_name,
                    username: data.username,
                    email: data.email,
                    phone: data.phone_number,
                    birth: data.birth || '',
                    gender: data.gender || '',
                }));
            });
            // 찜내역 불러오기
            if (!token || isTokenExpired(token)) {
                alert('로그인 세션이 만료되었습니다. 다시 로그인 해주세요.');
                localStorage.removeItem('access_token');
                localStorage.removeItem('user');
                navigate('/login');
                return;
            }
            getFavorites(token)
                .then((data) => {
                    setFavoritesList(data.favorites || []);
                })
                .catch((err) => {
                    if (err?.response?.status === 401) {
                        alert('로그인 세션이 만료되었습니다. 다시 로그인 해주세요.');
                        localStorage.removeItem('access_token');
                        localStorage.removeItem('user');
                        navigate('/login');
                    } else {
                        setFavoritesList([]);
                    }
                });
        }
    }, []);

    const menuItems = [
        { id: 'history', label: '상담 히스토리', icon: History },
        { id: 'inquiry', label: '문의내역', icon: MessagesSquare },
        { id: 'favorites', label: '찜내역', icon: Heart },
        { id: 'tickets', label: '이용권/결제', icon: Wallet },
        { id: 'support', label: '고객센터', icon: Settings },
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

    const handleLogout = () => {
        localStorage.removeItem('user');
        navigate('/');
    };

    const handleDeleteAccount = async () => {
        if (!withdrawAgree) {
            alert('유의사항 동의가 필요합니다.');
            return;
        }
        if (!userInfo.id) {
            alert('로그인 정보가 없습니다.');
            return;
        }
        if (!window.confirm('정말로 계정을 영구 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
            return;
        }
        setWithdrawLoading(true);
        try {
            await deleteAccount(Number(userInfo.id));
            alert('계정이 영구 삭제되었습니다.');
            handleLogout();
        } catch (e) {
            alert('계정 삭제에 실패했습니다.');
        } finally {
            setWithdrawLoading(false);
        }
    };

    const handleSaveProfile = async () => {
        try {
            await updateUserInfo({
                id: userInfo.id,
                full_name: userInfo.name,
                email: userInfo.email,
                phone_number: userInfo.phone,
            });
            alert('개인정보가 성공적으로 수정되었습니다.');
        } catch (e) {
            alert('개인정보 수정에 실패했습니다.');
        }
    };

    const handleChangePassword = async () => {
        if (!pwFields.current || !pwFields.new1 || !pwFields.new2) {
            alert('모든 비밀번호 입력란을 채워주세요.');
            return;
        }
        if (pwFields.new1.length < 8 || !/[A-Za-z]/.test(pwFields.new1) || !/[0-9]/.test(pwFields.new1)) {
            alert('새 비밀번호는 8자 이상, 영문+숫자를 포함해야 합니다.');
            return;
        }
        if (pwFields.new1 !== pwFields.new2) {
            alert('새 비밀번호가 일치하지 않습니다.');
            return;
        }
        setPwLoading(true);
        try {
            await changePassword({
                user_id: userInfo.id,
                current_password: pwFields.current,
                new_password: pwFields.new1,
            });
            alert('비밀번호가 성공적으로 변경되었습니다.');
            setPwFields({ current: '', new1: '', new2: '' });
        } catch (e) {
            if (e?.response?.data?.detail) {
                alert(e.response.data.detail);
            } else {
                alert('비밀번호 변경에 실패했습니다.');
            }
        } finally {
            setPwLoading(false);
        }
    };

    // 찜 해제 시 실제 DB에서도 삭제, 그리고 CounselorList에 반영할 수 있도록 콜백 지원
    const handleUnfavorite = async (id, e, onUpdate) => {
        e.stopPropagation();
        // 1. 프론트에서 먼저 optimistic update로 바로 제거
        setFavoritesList((prev) => prev.filter((item) => String(item.id || item.counselor_id) !== String(id)));
        if (typeof onUpdate === 'function') onUpdate(id, false);
        // 2. 서버에 실제 찜 해제 요청
        const token = localStorage.getItem('access_token');
        if (!token) {
            alert('로그인 후 이용 가능한 기능입니다.');
            return;
        }
        try {
            await toggleFavorite(id, token); // 서버에 찜 토글 요청
        } catch (err) {
            alert('찜 해제 처리 중 오류가 발생했습니다.');
        }
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
        return (
            <div className="fade-in">
                <main className="mwp-main">
                    <div className="mwp-title-section">
                        <h2 className="mwp-page-title">멤버십 및 결제</h2>
                    </div>

                    <div className="mwp-layout mwp-section-gap">
                        <div className="mwp-left">
                            <section className="mwp-card mwp-status-card mwp-ai-glow">
                                <div className="mwp-status-top">
                                    <div className="mwp-status-title-group">
                                        <div className="mwp-status-badge-row">
                                            <span className="mwp-active-badge">Active</span>
                                            <h3 className="mwp-status-title">AI 감정 일기 이용 중</h3>
                                        </div>
                                        <p className="mwp-status-desc">
                                            매일 기록된 감정 데이터는 다음 상담 시 전문가에게 분석 리포트로 전달됩니다.
                                        </p>
                                    </div>
                                    <div className="mwp-billing-info">
                                        <p className="mwp-billing-label">Next Billing</p>
                                        <p className="mwp-billing-date">2026. 05. 27</p>
                                    </div>
                                </div>

                                <div className="mwp-stats-grid">
                                    <div className="mwp-stat-item">
                                        <div className="mwp-stat-icon">
                                            <i className="fa-solid fa-wand-magic-sparkles text-lg"></i>
                                        </div>
                                        <div className="mwp-stat-inner">
                                            <p className="mwp-stat-label">이용 플랜</p>
                                            <p className="mwp-stat-value-name">프리미엄 플러스</p>
                                        </div>
                                    </div>

                                    <div className="mwp-stat-item mwp-stat-item--highlight">
                                        <div className="mwp-stat-icon mwp-stat-icon--green">
                                            <i className="fa-solid fa-ticket text-lg"></i>
                                        </div>
                                        <div className="mwp-stat-inner">
                                            <p className="mwp-stat-label mwp-stat-label--green">잔여 이용권</p>
                                            <p className="mwp-stat-value">
                                                12 <span className="mwp-stat-value-sub">회 남음</span>
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mwp-stat-item">
                                        <div className="mwp-stat-icon mwp-stat-icon--amber">
                                            <i className="fa-solid fa-calendar-check text-lg"></i>
                                        </div>
                                        <div className="mwp-stat-inner">
                                            <p className="mwp-stat-label">이번 달 기록</p>
                                            <p className="mwp-stat-value">
                                                18 <span className="mwp-stat-value-sub">/ 30일</span>
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="mwp-status-actions">
                                    <button className="mwp-cancel-link">이용 해지</button>
                                    <button className="mwp-plan-change-btn">플랜 변경하기</button>
                                </div>
                            </section>

                            <section className="mwp-pass-section">
                                <h3 className="mwp-pass-section-title">
                                    <i className="fa-solid fa-ticket mwp-pass-section-icon"></i>
                                    AI 일기 감정 이용권 구매
                                </h3>

                                <div className="mwp-pass-list">
                                    <div className="mwp-card mwp-pass-card">
                                        <div className="mwp-pass-inner">
                                            <div className="mwp-pass-info">
                                                <div className="mwp-pass-text">
                                                    <h4 className="mwp-pass-name">AI 일기 3회 이용권</h4>
                                                    <p className="mwp-pass-desc">가벼운 마음 정리를 위한 입문용 플랜</p>
                                                </div>
                                            </div>
                                            <div className="mwp-pass-price-wrap">
                                                <span className="mwp-price-amount">15,000원</span>
                                            </div>
                                            <button className="mwp-btn-primary mwp-buy-btn">구매하기</button>
                                        </div>
                                    </div>

                                    <div className="mwp-card mwp-pass-card mwp-pass-card--best">
                                        <div className="mwp-pass-inner">
                                            <div className="mwp-pass-info">
                                                <div className="mwp-pass-text">
                                                    <div className="mwp-pass-name-row">
                                                        <h4 className="mwp-pass-name">AI 일기 5회 이용권</h4>
                                                    </div>
                                                    <p className="mwp-pass-desc">심층 분석 리포트가 포함된 인기 플랜</p>
                                                </div>
                                            </div>
                                            <div className="mwp-pass-price-wrap">
                                                <span className="mwp-price-amount">22,000원</span>
                                            </div>
                                            <button className="mwp-btn-primary mwp-buy-btn">구매하기</button>
                                        </div>
                                    </div>

                                    <div className="mwp-card mwp-pass-card">
                                        <div className="mwp-pass-inner">
                                            <div className="mwp-pass-info">
                                                <div className="mwp-pass-text">
                                                    <h4 className="mwp-pass-name">AI 일기 10회 이용권</h4>
                                                    <p className="mwp-pass-desc">
                                                        장기적인 변화를 원하는 분들을 위한 프리미엄 플랜
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="mwp-pass-price-wrap">
                                                <span className="mwp-price-amount">39,000원</span>
                                            </div>
                                            <button className="mwp-btn-primary mwp-buy-btn">구매하기</button>
                                        </div>
                                    </div>

                                    <div className="mwp-card mwp-pass-card mwp-pass-card--premium">
                                        <div className="mwp-pass-inner">
                                            <div className="mwp-pass-info">
                                                <div className="mwp-pass-text">
                                                    <div className="mwp-pass-name-row">
                                                        <h4 className="mwp-pass-name">AI 일기 30회 이용권</h4>
                                                    </div>
                                                    <p className="mwp-pass-desc">
                                                        한 달간 매일 기록하며 성장을 확인하는 마스터 플랜
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="mwp-pass-price-wrap">
                                                <span className="mwp-price-amount">99,000원</span>
                                            </div>
                                            <button className="mwp-btn-primary mwp-buy-btn">구매하기</button>
                                        </div>
                                    </div>
                                </div>
                            </section>
                        </div>

                        <aside className="mwp-sidebar">
                            <div className="mwp-card mwp-sidebar-card">
                                <h5 className="mwp-sidebar-card-title">
                                    <i className="fa-solid fa-circle-info"></i>
                                    이용권 안내 사항
                                </h5>
                                <div className="mwp-sidebar-info-list">
                                    <div className="mwp-sidebar-info-item">
                                        <div className="mwp-sidebar-icon">
                                            <i className="fa-solid fa-calendar-check"></i>
                                        </div>
                                        <div className="mwp-sidebar-item-inner">
                                            <p className="mwp-sidebar-item-title">유효 기간</p>
                                            <p className="mwp-sidebar-item-desc">
                                                구매일로부터 90일 이내에 사용 가능합니다.
                                            </p>
                                        </div>
                                    </div>
                                    <div className="mwp-sidebar-info-item">
                                        <div className="mwp-sidebar-icon">
                                            <i className="fa-solid fa-rotate"></i>
                                        </div>
                                        <div className="mwp-sidebar-item-inner">
                                            <p className="mwp-sidebar-item-title">자동 갱신 안내</p>
                                            <p className="mwp-sidebar-item-desc">
                                                횟수 차감형 이용권은 자동 갱신되지 않습니다.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mwp-card mwp-sidebar-card">
                                <h5 className="mwp-sidebar-card-title">
                                    <i className="fa-solid fa-location-arrow"></i>
                                    센터 이용 정보
                                </h5>
                                <div className="mwp-sidebar-info-list mwp-sidebar-info-list--lg">
                                    <div className="mwp-sidebar-info-item">
                                        <div className="mwp-sidebar-icon">
                                            <i className="fa-solid fa-location-dot"></i>
                                        </div>
                                        <div className="mwp-sidebar-item-inner">
                                            <p className="mwp-sidebar-item-title">마인드웰 강남 센터</p>
                                            <p className="mwp-sidebar-item-desc">
                                                서울특별시 강남구 테헤란로 123 4F (강남역 5번 출구)
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* 고객센터 배너 제거됨 */}
                        </aside>
                    </div>
                </main>
            </div>
        );
    };

    const renderPersonalEdit = () => {
        return (
            <div className="fade-in mp-w-full">
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
                            <div className="profile-info-row">
                                <div className="profile-info-half">
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
                                <div className="profile-info-half">
                                    <label className="input-label">성별</label>
                                    <div className="relative-input-box">
                                        <input
                                            type="text"
                                            className="custom-input bg-readonly"
                                            value={
                                                userInfo.gender === 'female'
                                                    ? '여성'
                                                    : userInfo.gender === 'male'
                                                      ? '남성'
                                                      : ''
                                            }
                                            readOnly
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="profile-info-row">
                                <div className="profile-info-half">
                                    <label className="input-label">생년월일</label>
                                    <div className="relative-input-box">
                                        <Calendar className="input-icon" size={20} />
                                        <input
                                            type="date"
                                            className="custom-input"
                                            value={userInfo.birth}
                                            onChange={(e) => setUserInfo({ ...userInfo, birth: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="profile-info-half">
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
                    </div>
                    <div className="profile-readonly-grid">
                        <div className="grid-col-1">
                            <label className="input-label">아이디</label>
                            <div className="relative-input-box">
                                <Hash className="input-icon" size={20} />
                                <input
                                    type="text"
                                    className="custom-input bg-readonly"
                                    value={userInfo.username}
                                    readOnly
                                />
                            </div>
                            <p className="input-helper-text">* 아이디는 변경할 수 없습니다.</p>
                        </div>
                        <div className="grid-col-1">
                            <label className="input-label">이메일 주소</label>
                            <div className="relative-input-box">
                                <Mail className="input-icon" size={20} />
                                <input
                                    type="email"
                                    className="custom-input"
                                    value={userInfo.email}
                                    onChange={(e) => setUserInfo({ ...userInfo, email: e.target.value })}
                                />
                            </div>
                            <p className="input-helper-text">* 이메일은 수정 가능합니다.</p>
                        </div>
                    </div>
                </div>
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
                                    value={pwFields.current}
                                    onChange={(e) => setPwFields((f) => ({ ...f, current: e.target.value }))}
                                    autoComplete="current-password"
                                    disabled={pwLoading}
                                />
                            </div>
                        </div>
                        <div className="security-password-grid">
                            <div>
                                <label className="input-label">새 비밀번호</label>
                                <div className="relative-input-box">
                                    <KeyRound className="input-icon" size={20} />
                                    <input
                                        type="password"
                                        placeholder="8자 이상 영문+숫자"
                                        className="custom-input"
                                        value={pwFields.new1}
                                        onChange={(e) => setPwFields((f) => ({ ...f, new1: e.target.value }))}
                                        autoComplete="new-password"
                                        disabled={pwLoading}
                                    />
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
                                        value={pwFields.new2}
                                        onChange={(e) => setPwFields((f) => ({ ...f, new2: e.target.value }))}
                                        autoComplete="new-password"
                                        disabled={pwLoading}
                                    />
                                </div>
                            </div>
                        </div>
                        <button
                            className="profile-save-full-btn mp-mt-2"
                            onClick={handleChangePassword}
                            disabled={pwLoading}
                            style={{ opacity: pwLoading ? 0.6 : 1 }}
                        >
                            <CheckCircle2 size={20} /> 비밀번호 변경
                        </button>
                    </div>
                </div>
                <div className="profile-save-btn-row">
                    <button className="profile-save-full-btn" onClick={handleSaveProfile}>
                        <CheckCircle2 size={20} />
                        변경 사항 안전하게 저장하기
                    </button>
                </div>
            </div>
        );
    };

    const renderNotificationEdit = () => {
        return <NotificationSettings notifSettings={notifSettings} toggleNotif={toggleNotif} />;
    };

    const renderQuitService = () => {
        return (
            <div className="wd-page-container">
                <div className="wd-inner-wrapper">
                    <div className="wd-header">
                        <button className="wd-back-btn" onClick={() => setActiveSubMenu(null)}>
                            <ArrowLeft size={16} /> 계정 설정으로 돌아가기
                        </button>
                        <h2 className="wd-page-title">서비스 탈퇴</h2>
                        <p className="wd-page-subtitle">탈퇴 시 소중한 기록들이 모두 삭제됩니다.</p>
                    </div>
                    <div className="wd-withdraw-wrapper wd-fade-in">
                        <div className="wd-top-grid">
                            <div className="wd-notice-card">
                                <h4 className="wd-card-title">탈퇴 시 삭제되는 항목</h4>
                                <div className="wd-notice-list">
                                    <div className="wd-notice-item">
                                        <div className="wd-notice-bullet" />
                                        <div>
                                            <p className="wd-notice-label">보유 이용권 및 포인트 즉시 소멸</p>
                                            <p className="wd-notice-sub">환불 불가 — 탈퇴 전 사용을 권장드려요.</p>
                                        </div>
                                    </div>
                                    <div className="wd-notice-item">
                                        <div className="wd-notice-bullet" />
                                        <div>
                                            <p className="wd-notice-label">상담 히스토리 전체 삭제</p>
                                            <p className="wd-notice-sub">
                                                기록은 복구되지 않으며, 영구적으로 제거됩니다.
                                            </p>
                                        </div>
                                    </div>
                                    <div className="wd-notice-item">
                                        <div className="wd-notice-bullet" />
                                        <div>
                                            <p className="wd-notice-label">동일 정보로 30일간 재가입 불가</p>
                                            <p className="wd-notice-sub">이메일과 전화번호 기준으로 제한됩니다.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="wd-stats-column">
                                <div className="wd-stat-card">
                                    <p className="wd-stat-label">잔여 이용권</p>
                                    <div>
                                        <span className="wd-stat-value">{ticketCount}</span>
                                        <span className="wd-stat-unit">회</span>
                                    </div>
                                    <p className="wd-stat-warning">탈퇴 시 환불 불가</p>
                                </div>
                                <div className="wd-stat-card">
                                    <p className="wd-stat-label">완료한 상담</p>
                                    <div>
                                        <span className="wd-stat-value">{completedConsultations}</span>
                                        <span className="wd-stat-unit">회</span>
                                    </div>
                                    <p className="wd-stat-warning">기록 전체 삭제</p>
                                </div>
                            </div>
                        </div>
                        <div className="wd-bottom-card">
                            <label className="wd-agree-box">
                                <div className="wd-checkbox-wrapper">
                                    <input
                                        type="checkbox"
                                        checked={withdrawAgree}
                                        onChange={(e) => setWithdrawAgree(e.target.checked)}
                                    />
                                    <div className="wd-check-display">
                                        {withdrawAgree && <Check size={11} strokeWidth={4} />}
                                    </div>
                                </div>
                                <span className="wd-agree-text">위 유의사항을 모두 확인하였으며 이에 동의합니다.</span>
                            </label>
                            <button
                                className="wd-delete-btn"
                                onClick={handleDeleteAccount}
                                disabled={!withdrawAgree || withdrawLoading}
                            >
                                {withdrawLoading ? '처리 중...' : '마인드웰 계정 영구 삭제'}
                            </button>
                            <div className="wd-suggestion-box">
                                <Lightbulb size={16} className="wd-suggestion-icon" />
                                <p>
                                    탈퇴 대신{' '}
                                    <span className="wd-highlight" onClick={() => setActiveSubMenu('notification')}>
                                        알림 설정
                                    </span>
                                    이나 <span className="wd-highlight">상담 일시 중지</span>를 이용해 보세요. 언제든지
                                    다시 돌아오실 수 있어요.
                                </p>
                            </div>
                        </div>
                    </div>
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

        if (activeSubMenu === 'quit') {
            return renderQuitService();
        }

        const current = details[activeSubMenu];

        return (
            <div className="fade-in mp-w-full">
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
                    </div>
                </div>
            </div>
        );
    };

    const renderInquiryList = () => {
        const inquiryList = [
            {
                id: 1,
                title: '상담 예약 관련 문의',
                content: '상담 예약이 정상적으로 되었는지 확인 부탁드립니다.',
                date: '2026.04.20',
                status: '답변 완료',
                answer: '안녕하세요. 상담 예약이 정상적으로 완료되었습니다. 예약 시간에 맞춰 방문해 주세요.',
            },
            {
                id: 2,
                title: '결제 환불 요청',
                content: '결제한 이용권 환불이 가능한가요?',
                date: '2026.04.15',
                status: '처리 중',
                answer: null,
            },
            {
                id: 3,
                title: '상담사 변경 문의',
                content: '상담사 변경을 원합니다.',
                date: '2026.04.10',
                status: '답변 완료',
                answer: '상담사 변경이 완료되었습니다. 새로운 상담사와의 일정을 확인해 주세요.',
            },
        ];

        return (
            <div className="fade-in">
                <h3 className="mypage-section-title">문의내역</h3>
                <ul className="mypage-list mypage-list-grid">
                    {inquiryList.map((item) => (
                        <li key={item.id} className="mypage-list-item">
                            <div className="mypage-list-title">{item.title}</div>
                            <div className="mypage-list-meta">
                                {item.date} <span className="mypage-list-status">{item.status}</span>
                            </div>
                            <div className="mypage-list-content">{item.content}</div>
                            {item.answer && (
                                <button
                                    className="inquiry-answer-btn"
                                    onClick={() => setOpenInquiryId(openInquiryId === item.id ? null : item.id)}
                                >
                                    {openInquiryId === item.id ? '답변 닫기' : '답변 보기'}
                                </button>
                            )}
                            {item.answer && openInquiryId === item.id && (
                                <div className="inquiry-answer-box">
                                    <div className="inquiry-answer-label">관리자 답변</div>
                                    <div className="inquiry-answer-content">{item.answer}</div>
                                </div>
                            )}
                        </li>
                    ))}
                </ul>
            </div>
        );
    };

    // 더미데이터를 상단에 선언하거나 import 필요
    const counselorData = [
        {
            id: 1,
            name: '이은지 상담사',
            category: '개인 심리',
            field: '우울, 불안, 공황',
            price: '60,000원',
            intro: '감정 일기 분석을 통해 당신의 마음을 함께 들여다봅니다.',
        },
        {
            id: 2,
            name: '김태현 상담사',
            category: '직장',
            field: '스트레스, 번아웃',
            price: '60,000원',
            intro: '직장 내 대인관계와 커리어 고민에 솔루션을 드립니다.',
        },
        {
            id: 3,
            name: '박소담 상담사',
            category: '진로',
            field: '취업불안, 진로고민',
            price: '60,000원',
            intro: '나를 사랑하는 법, 작은 기록부터 시작해봐요.',
        },
        {
            id: 4,
            name: '정다은 상담사',
            category: '개인 심리',
            field: '자존감, 강박',
            price: '60,000원',
            intro: '막막한 미래, 당신의 강점을 찾는 솔루션을 제공합니다.',
        },
        {
            id: 5,
            name: '한지우 상담사',
            category: '직장',
            field: '소통, 대인관계',
            price: '60,000원',
            intro: '오늘의 감정이 내일의 평온이 되도록 돕겠습니다.',
        },
        {
            id: 6,
            name: '최민준 상담사',
            category: '진로',
            field: '진로고민, 번아웃',
            price: '60,000원',
            intro: '지친 마음을 회복하고 다시 나아갈 힘을 드립니다.',
        },
    ];

    const renderFavoritesList = () => {
        return (
            <div className="fade-in">
                <h3 className="mypage-section-title">찜 목록</h3>
                <ul className="mypage-list mypage-list-grid">
                    {favoritesList.map((item) => {
                        const counselor = counselorData.find(
                            (c) => String(c.id) === String(item.counselor_id || item.id)
                        );
                        const counselorName = counselor ? counselor.name : item.counselor_name || '알 수 없는 상담사';
                        const field = counselor ? counselor.field : item.field;
                        const category = counselor ? counselor.category : item.category;
                        const intro = counselor ? counselor.intro : item.intro;
                        const price = counselor ? counselor.price : item.price;
                        const avatarInitial = counselorName.slice(0, 1);

                        return (
                            <li
                                key={item.id || item.counselor_id}
                                className="mypage-list-item mypage-favorite-item"
                                onClick={() => navigate('/counselor-detail/' + (item.id || item.counselor_id))}
                            >
                                {/* 하트 — 우측 상단 고정 */}
                                <div
                                    className="mypage-favorite-heart"
                                    onClick={(e) =>
                                        handleUnfavorite(item.counselor_id ? item.counselor_id : item.id, e)
                                    }
                                    title="찜 취소"
                                >
                                    <Heart size={14} color="#e74c3c" fill="#e74c3c" />
                                </div>

                                {/* 아바타 이니셜 */}
                                <div className="mypage-favorite-avatar">{avatarInitial}</div>

                                <div className="mypage-favorite-content">
                                    <div className="mypage-list-title">{counselorName}</div>
                                    <div className="mypage-list-meta">
                                        {category && <span className="mypage-list-category">{category}</span>}
                                        {field &&
                                            field.split(',').map((f, i) => (
                                                <span key={i} className="mypage-list-field">
                                                    {f.trim()}
                                                </span>
                                            ))}
                                    </div>
                                    {intro && <div className="mypage-list-intro">{intro}</div>}
                                    {price && (
                                        <div className="mypage-list-price">
                                            <span className="price-value">{price}</span>
                                            <span className="mypage-list-cta">상세보기</span>
                                        </div>
                                    )}
                                </div>
                            </li>
                        );
                    })}
                </ul>
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
            case 'inquiry':
                return renderInquiryList();
            case 'favorites':
                // 찜 해제 시 CounselorListPage의 liked 상태도 동기화
                return renderFavoritesList((id, isFav) => {
                    // CounselorListPage가 마운트되어 있다면 liked 상태를 동기화할 수 있도록
                    // (라우팅 구조에 따라 필요시 전역 상태/컨텍스트로도 가능)
                });
            case 'tickets':
                return renderTicketsDetail();
            case 'support':
                return renderSupportCenter();
            case 'profile':
                return (
                    <div className="fade-in">
                        <h3 className="account-main-title">계정 설정</h3>
                        <div className="setting-items-list">
                            {[
                                { key: 'personal', label: '개인정보 수정 및 보안', icon: User, type: 'personal' },
                                { key: 'notification', label: '알림 설정', icon: Bell, type: 'notification' },
                                { key: 'quit', label: '서비스 탈퇴', icon: UserX, type: 'quit' },
                            ].map((item) => (
                                <div
                                    key={item.key}
                                    className="setting-item-card"
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
                        <div className="dash-status-grid">
                            <div className="dash-status-item" onClick={() => handleMenuClick('tickets')}>
                                <div className="status-icon-box bg-amber">
                                    <Wallet size={18} />
                                </div>
                                <p className="status-label">잔여 이용권</p>
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
                                    <p className="mypage-hero-desc">이은지 상담사와 1:1 상담 예정</p>
                                </div>
                            </div>
                            <button className="hero-action-btn">
                                상담 상세 보기 <ChevronRight size={18} />
                            </button>
                        </div>

                        <div className="dash-section-header">
                            <h3 className="section-title">
                                <History size={20} className="mp-history-title-icon" /> 최근 상담 기록
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

                        <div className="dash-purchase-banner" onClick={() => handleMenuClick('tickets')}>
                            <div className="purchase-info">
                                <div className="purchase-icon-box">
                                    <Ticket size={18} />
                                </div>
                                <div className="purchase-text">
                                    <p className="title">더 많은 위로가 필요하신가요?</p>
                                    <p className="desc">이용권을 충전하고 마음 케어를 이어가세요.</p>
                                </div>
                            </div>
                            <div className="purchase-action-btn">
                                {ticketCount > 0 ? '이용권 추가 충전하기' : '이용권 충전하기'}
                                <ChevronRight size={14} />
                            </div>
                        </div>

                        <section className="mobile-only-menu">
                            <h4 className="mobile-menu-label">전체 메뉴</h4>
                            <div className="mobile-menu-group">
                                <div onClick={() => handleMenuClick('history')} className="mobile-menu-item border-b">
                                    <span>상담 히스토리</span>
                                    <ChevronRight size={16} />
                                </div>
                                <div onClick={() => handleMenuClick('tickets')} className="mobile-menu-item border-b">
                                    <span>이용권/결제</span>
                                    <ChevronRight size={16} />
                                </div>
                            </div>
                            <div className="mobile-menu-group mp-mt-4">
                                <div onClick={() => handleMenuClick('profile')} className="mobile-menu-item border-b">
                                    <span>계정 설정</span>
                                    <ChevronRight size={16} />
                                </div>
                                <div className="mobile-menu-item text-rose mp-cursor-pointer" onClick={handleLogout}>
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
            <aside className="mypage-sidebar">
                <div className="sidebar-logo-section mp-cursor-pointer" onClick={() => navigate('/')}>
                    <h1 className="sidebar-brand-logo">MINDWELL</h1>
                    <p className="sidebar-brand-sub">Mental Health Care</p>
                </div>
                <nav className="sidebar-nav-list">
                    <div
                        onClick={() => handleMenuClick('dashboard')}
                        className={`sidebar-nav-item ${activeMenu === 'dashboard' ? 'is-active' : ''}`}
                    >
                        <Settings size={20} />
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
                    {/* 고객센터 사이드바 제거됨 */}
                    <div className="sidebar-nav-item is-logout-link mp-cursor-pointer" onClick={handleLogout}>
                        <LogOut size={20} />
                        <span>로그아웃</span>
                    </div>
                </div>
            </aside>

            <main className="mypage-content-area">
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
            </main>
        </div>
    );
}
