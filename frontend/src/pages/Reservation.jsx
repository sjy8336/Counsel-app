import React, { useState, useEffect } from 'react';
import { getAllBookings, cancelBooking, completeBooking } from '../api/booking';
import { useNavigate, Link } from 'react-router-dom';
import Header from '../components/header';
import Footer from '../components/footer';
import {
    Calendar,
    Clock,
    MapPin,
    Home,
    BookOpen,
    Heart,
    User,
    AlertCircle,
    ChevronRight,
    X,
    CalendarX,
} from 'lucide-react';
import '../static/Reservation.css';

// ── 상수 ────────────────────────────────────────────────────
const TABS = ['전체', '예약 대기', '예약 확정', '상담 완료', '예약 취소'];

const STATUS_MAP = {
    waiting: '예약 대기',
    confirmed: '예약 확정',
    completed: '상담 완료',
    canceled: '예약 취소',
};

const STATUS_CLASS = {
    '예약 확정': 'confirmed',
    '예약 대기': 'pending',
    '상담 완료': 'completed',
    '예약 취소': 'cancelled',
};

const getStatusText = (s) => STATUS_MAP[s] ?? '';
const getStatusClass = (s) => STATUS_CLASS[s] ?? '';

const isTooLateToCancel = (dateStr) => {
    const [y, m, d] = dateStr.split('.').map(Number);
    const diff = new Date(y, m - 1, d) - new Date(new Date().setHours(0, 0, 0, 0));
    return Math.ceil(diff / 864e5) <= 2;
};

// ── 서브 컴포넌트 ────────────────────────────────────────────
const StatusTag = ({ status }) => <span className={`res-status-tag ${getStatusClass(status)}`}>{status}</span>;

const EmptyState = ({ filter }) => (
    <div className="res-empty">
        <div className="res-empty-icon">
            <CalendarX size={32} />
        </div>
        <p className="res-empty-title">
            {filter === '전체' ? '아직 예약 내역이 없어요' : `'${filter}' 상태의 예약이 없어요`}
        </p>
        <p className="res-empty-sub">상담사를 찾아 첫 상담을 예약해 보세요.</p>
        <Link to="/counselors" className="res-empty-btn">
            상담사 찾기
        </Link>
    </div>
);

// ── 메인 ────────────────────────────────────────────────────
export default function ReservationHistoryPage({ userName, setUserName, isLoggedIn, setIsLoggedIn }) {
    const navigate = useNavigate();

    const [filter, setFilter] = useState('전체');
    const [historyData, setHistoryData] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedId, setSelectedId] = useState(null);
    const [blockedMsg, setBlockedMsg] = useState('');

    // 상담사 역할이면 리다이렉트
    useEffect(() => {
        try {
            const u = JSON.parse(localStorage.getItem('user'));
            if (u?.role === 'counselor') navigate('/CounselorPlanner', { replace: true });
        } catch {}
    }, []);

    // 예약 목록 불러오기 + 자동 완료 처리
    useEffect(() => {
        const fetchAndUpdate = async () => {
            let data = await getAllBookings();
            const now = new Date();
            let changed = false;

            for (const item of data) {
                if (item.booking_status !== 'confirmed') continue;
                const base = item.date.replace(/\./g, '-');
                let endTime = item.time;
                if (item.time.includes('~')) {
                    endTime = item.time.split('~')[1].trim();
                } else if (/^\d{2}:\d{2}$/.test(item.time)) {
                    const end = new Date(`${base}T${item.time}:00`);
                    end.setMinutes(end.getMinutes() + 59);
                    endTime = `${String(end.getHours()).padStart(2, '0')}:${String(end.getMinutes()).padStart(2, '0')}`;
                }
                if (new Date(`${base}T${endTime}:00`) < now) {
                    await completeBooking(item.order_id);
                    changed = true;
                }
            }

            setHistoryData(changed ? await getAllBookings() : data);
        };
        fetchAndUpdate();
    }, []);

    const filteredData = historyData.filter(
        (item) => filter === '전체' || getStatusText(item.booking_status) === filter
    );

    // 취소 버튼 클릭
    const handleCancelClick = (id) => {
        const item = historyData.find((i) => i.id === id);
        if (!item) return;
        if (isTooLateToCancel(item.date)) {
            setBlockedMsg('예약일 2일 전에는 취소가 불가합니다.\n변경이 필요하시면 고객센터로 문의해 주세요.');
            setSelectedId(null);
        } else {
            setBlockedMsg('');
            setSelectedId(id);
        }
        setIsModalOpen(true);
    };

    // 취소 확정
    const confirmCancel = async () => {
        const item = historyData.find((i) => i.id === selectedId);
        if (!item || isTooLateToCancel(item.date)) {
            closeModal();
            return;
        }
        await cancelBooking(item.order_id);
        setHistoryData((prev) => prev.map((it) => (it.id === selectedId ? { ...it, booking_status: 'canceled' } : it)));
        closeModal();
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedId(null);
        setBlockedMsg('');
    };

    const NAV_ITEMS = [
        { to: '/', Icon: Home, label: '홈' },
        { to: '/reservation', Icon: Calendar, label: '예약 관리', active: true },
        { to: '/ai-diary', Icon: BookOpen, label: 'AI 일기' },
        { to: '/healing', Icon: Heart, label: '힐링 라운지' },
        { to: '/mypage', Icon: User, label: '마이페이지' },
    ];

    return (
        <div className="res-root">
            <Header
                activeTab="reservation"
                setActiveTab={() => {}}
                userName={userName}
                setUserName={setUserName}
                isLoggedIn={isLoggedIn}
                setIsLoggedIn={setIsLoggedIn}
            />

            <main className="res-container">
                {/* 헤더 */}
                <div className="res-top">
                    <div className="res-badge">예약 관리</div>
                    <h2 className="res-title">
                        <span className="res-username">{userName}님</span>의 상담 일정
                    </h2>
                    <p className="res-sub">상담사와 함께하는 일정을 한눈에 확인하세요.</p>
                </div>

                {/* 탭 필터 */}
                <nav className="res-tabs">
                    {TABS.map((tab) => (
                        <button
                            key={tab}
                            className={`res-tab${filter === tab ? ' active' : ''}`}
                            onClick={() => setFilter(tab)}
                        >
                            {tab}
                        </button>
                    ))}
                </nav>

                {/* 리스트 / 빈 상태 */}
                {filteredData.length === 0 ? (
                    <EmptyState filter={filter} />
                ) : (
                    <div className="res-list">
                        {filteredData.map((item) => {
                            const status = getStatusText(item.booking_status);
                            const cancelable = status === '예약 대기' || status === '예약 확정';
                            return (
                                <div key={item.id} className="res-item">
                                    <div className="res-item-left">
                                        <span className="res-date">{item.date}</span>
                                        <StatusTag status={status} />
                                    </div>
                                    <div className="res-item-body">
                                        <h3 className="res-counselor">{item.name} 상담사</h3>
                                        <div className="res-details">
                                            <span>
                                                <Clock size={14} />
                                                {item.time}
                                            </span>
                                            <span className="res-divider">|</span>
                                            <span>
                                                <MapPin size={14} />
                                                {item.location ||
                                                    item.centerName ||
                                                    item.center_name ||
                                                    item.center ||
                                                    '센터'}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="res-item-right">
                                        {cancelable && (
                                            <button
                                                className="res-cancel-btn"
                                                onClick={() => handleCancelClick(item.id)}
                                            >
                                                취소하기
                                            </button>
                                        )}
                                        <ChevronRight size={20} className="res-chevron" />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>

            {/* 모달 */}
            {isModalOpen && (
                <div className="res-overlay" onClick={closeModal}>
                    <div className="res-modal" onClick={(e) => e.stopPropagation()}>
                        <button className="res-modal-close" onClick={closeModal}>
                            <X size={18} />
                        </button>
                        {blockedMsg ? (
                            <>
                                <div className="res-modal-icon warn">
                                    <AlertCircle size={36} />
                                </div>
                                <h3 className="res-modal-title">취소가 불가합니다</h3>
                                <p className="res-modal-desc">{blockedMsg}</p>
                                <button className="res-modal-btn single" onClick={closeModal}>
                                    확인
                                </button>
                            </>
                        ) : (
                            <>
                                <div className="res-modal-icon">
                                    <AlertCircle size={36} />
                                </div>
                                <h3 className="res-modal-title">예약을 취소하시겠습니까?</h3>
                                <p className="res-modal-desc">취소하시면 해당 시간의 상담은 자동으로 사라집니다.</p>
                                <div className="res-modal-btns">
                                    <button className="res-modal-btn confirm" onClick={confirmCancel}>
                                        네, 취소합니다
                                    </button>
                                    <button className="res-modal-btn back" onClick={closeModal}>
                                        아니오
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* 모바일 하단 네비 */}
            <nav className="res-bottom-nav">
                {NAV_ITEMS.map(({ to, Icon, label, active }) => (
                    <Link key={to} to={to} className={`res-nav-item${active ? ' active' : ''}`}>
                        <Icon size={22} />
                        <span>{label}</span>
                    </Link>
                ))}
            </nav>

            <Footer />
        </div>
    );
}
