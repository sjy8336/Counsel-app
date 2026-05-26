import React, { useState, useEffect, useRef } from 'react';
import Header from '../components/header';
import Footer from '../components/footer';
import MobileTap from '../components/mobileTap';
import { getReceivedInquiries } from '../api/inquiry';
import axios from 'axios';
import {
    Search,
    MessageSquare,
    CheckCircle,
    ChevronRight,
    Send,
    ArrowLeft,
    User,
    Filter,
    AlertCircle,
    Paperclip,
    Smile,
    Menu,
    X,
    Check,
} from 'lucide-react';
import '../static/CounselorMessages.css';

const App = ({ userName, setUserName, isLoggedIn, setIsLoggedIn }) => {
    /* ── 2. 상태 관리 ── */
    const [inquiries, setInquiries] = useState([]);
    const [selectedInquiryId, setSelectedInquiryId] = useState(null);
    const [replyText, setReplyText] = useState('');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [inquiriesLoading, setInquiriesLoading] = useState(false);

    const filterRef = useRef(null);

    /* ── 탭바 높이 동적 측정 ── */
    useEffect(() => {
        const updateTabBarHeight = () => {
            const nav = document.querySelector('.mobile-nav');
            const h = nav ? nav.getBoundingClientRect().height : 0;
            document.documentElement.style.setProperty('--mobile-tab-h', `${h}px`);
        };
        updateTabBarHeight();
        window.addEventListener('resize', updateTabBarHeight);
        return () => window.removeEventListener('resize', updateTabBarHeight);
    }, []);

    /* ── 3. 필터링 ── */
    // DB에서 온 데이터 필드 매핑 (sender, tag, date 등)
    const mappedInquiries = inquiries.map((inquiry) => {
        // 내담자 이름 우선순위: client_name → client.full_name → client.username → client_id → '내담자'
        let sender =
            inquiry.client_name ||
            inquiry.client?.full_name ||
            inquiry.client?.username ||
            (inquiry.client_id ? `내담자#${inquiry.client_id}` : '') ||
            '내담자';
        if (inquiry.sender) sender = inquiry.sender;
        // 답변 내용 매핑: answer(백엔드) → myReply(프론트)
        let myReply = inquiry.myReply || inquiry.reply || inquiry.answer || '';
        // 답변 완료 상태 자동 처리
        let status = inquiry.status || inquiry.inquiry_status || (myReply ? 'completed' : 'pending');
        return {
            ...inquiry,
            sender,
            tag: inquiry.tag || inquiry.type || '상담문의',
            date:
                inquiry.date ||
                (inquiry.created_at ? String(inquiry.created_at).slice(0, 10) : '') ||
                inquiry.created ||
                '',
            status,
            title: inquiry.title,
            content: inquiry.content,
            myReply,
            id: inquiry.id,
        };
    });

    const filteredInquiries = mappedInquiries.filter((inquiry) => {
        const matchesSearch = inquiry.sender.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' ? true : inquiry.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    // 상담사 받은 문의 DB에서 불러오기
    useEffect(() => {
        setInquiriesLoading(true);
        getReceivedInquiries()
            .then((data) => setInquiries(data))
            .catch(() => setInquiries([]))
            .finally(() => setInquiriesLoading(false));
    }, []);

    const selectedInquiry = mappedInquiries.find((i) => i.id === selectedInquiryId);

    /* ── 4. 사이드 이펙트 ── */
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (filterRef.current && !filterRef.current.contains(event.target)) {
                setIsFilterOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    /* ── 5. 핸들러 ── */
    // 답변 전송 핸들러: PATCH API 호출로 DB에 저장
    const handleSendReply = async () => {
        if (!replyText.trim() || !selectedInquiryId) return;
        try {
            // 답변 저장 API 호출 (PATCH)
            const token = localStorage.getItem('access_token');
            const headers = token ? { Authorization: `Bearer ${token}` } : {};
            await axios.put(
                `${import.meta.env.VITE_API_BASE_URL}/inquiries/${selectedInquiryId}/reply`,
                { answer: replyText },
                { headers }
            );
            // 저장 후 목록 새로고침
            const data = await getReceivedInquiries();
            setInquiries(data);
            setReplyText('');
        } catch (e) {
            alert('답변 저장에 실패했습니다.');
        }
    };

    const toggleFilter = () => setIsFilterOpen(!isFilterOpen);

    const changeFilter = (filterType) => {
        setStatusFilter(filterType);
        setIsFilterOpen(false);
    };

    /* ── 6. 렌더링 ── */
    const [activeTab, setActiveTab] = useState('inquiry');

    return (
        <div className="mwci-root">
            <Header
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                userName={userName}
                setUserName={setUserName}
                isLoggedIn={isLoggedIn}
                setIsLoggedIn={setIsLoggedIn}
            />
            {/* ── 메인 바디 ── */}
            <main className="mwci-main">
                {/* 왼쪽: 문의 목록 */}
                <section className={`mwci-list-section ${selectedInquiryId ? 'mwci-list-section--hidden' : ''}`}>
                    <div className="mwci-list-toolbar">
                        <div className="mwci-list-title-row">
                            <h2 className="mwci-list-title">
                                받은 문의
                                <span className="mwci-list-count-badge">{filteredInquiries.length}</span>
                            </h2>
                        </div>

                        <div className="mwci-search-filter-row">
                            {/* 검색창 */}
                            <div className="mwci-search-box">
                                <Search size={16} className="mwci-search-icon" />
                                <input
                                    type="text"
                                    placeholder="내담자 성함 검색"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="mwci-search-input"
                                />
                                {searchTerm && (
                                    <button onClick={() => setSearchTerm('')} className="mwci-search-clear-btn">
                                        <X size={14} />
                                    </button>
                                )}
                            </div>

                            {/* 필터 */}
                            <div className="mwci-filter-wrap" ref={filterRef}>
                                <button
                                    onClick={toggleFilter}
                                    className={`mwci-filter-btn ${
                                        statusFilter !== 'all' ? 'mwci-filter-btn--active' : ''
                                    }`}
                                >
                                    <Filter size={20} />
                                </button>

                                {isFilterOpen && (
                                    <div className="mwci-filter-dropdown">
                                        <button onClick={() => changeFilter('all')} className="mwci-filter-option">
                                            전체보기
                                            {statusFilter === 'all' && (
                                                <Check size={14} className="mwci-filter-check-green" />
                                            )}
                                        </button>
                                        <button
                                            onClick={() => changeFilter('pending')}
                                            className="mwci-filter-option mwci-filter-option--rose"
                                        >
                                            안 읽은 거 (미답변)
                                            {statusFilter === 'pending' && (
                                                <Check size={14} className="mwci-filter-check-rose" />
                                            )}
                                        </button>
                                        <button
                                            onClick={() => changeFilter('completed')}
                                            className="mwci-filter-option mwci-filter-option--green"
                                        >
                                            읽은 거 (답변완료)
                                            {statusFilter === 'completed' && (
                                                <Check size={14} className="mwci-filter-check-green" />
                                            )}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* 문의 카드 목록 */}
                    <div className="mwci-card-list">
                        {filteredInquiries.length > 0 ? (
                            filteredInquiries.map((inquiry) => (
                                <div
                                    key={inquiry.id}
                                    onClick={() => setSelectedInquiryId(inquiry.id)}
                                    className={`mwci-inquiry-card ${
                                        selectedInquiryId === inquiry.id ? 'mwci-inquiry-card--selected' : ''
                                    }`}
                                >
                                    <div className="mwci-card-top-row">
                                        <span
                                            className={`mwci-status-badge ${
                                                inquiry.status === 'pending'
                                                    ? 'mwci-status-badge--pending'
                                                    : 'mwci-status-badge--completed'
                                            }`}
                                        >
                                            {inquiry.status === 'pending' ? '미답변' : '답변완료'}
                                        </span>
                                        <span className="mwci-card-date">{inquiry.date}</span>
                                    </div>
                                    <h3 className="mwci-card-title">{inquiry.title}</h3>
                                    <div className="mwci-card-meta">
                                        <span className="mwci-card-sender">{inquiry.sender}</span>
                                        <span className="mwci-card-dot"></span>
                                        <span className="mwci-card-tag">#{inquiry.tag}</span>
                                    </div>
                                    {inquiry.status === 'pending' && <div className="mwci-card-pending-bar" />}
                                </div>
                            ))
                        ) : (
                            <div className="mwci-empty-state">
                                <div className="mwci-empty-icon-box">
                                    <Search size={24} />
                                </div>
                                <p className="mwci-empty-title">문의 내역이 없습니다</p>
                                <p className="mwci-empty-desc">필터 설정을 변경하거나 다른 검색어로 시도해 보세요.</p>
                            </div>
                        )}
                    </div>
                </section>

                {/* 오른쪽: 상세 / 답변 */}
                <section
                    className={`mwci-detail-section ${
                        selectedInquiryId ? '' : 'mwci-detail-section--hidden mwci-detail-section--empty'
                    }`}
                >
                    {!selectedInquiry ? (
                        <div className="mwci-detail-placeholder">
                            <div className="mwci-detail-placeholder-icon">
                                <MessageSquare size={32} />
                            </div>
                            <p className="mwci-detail-placeholder-text">상담 문의를 선택하여 내용을 확인하세요.</p>
                        </div>
                    ) : (
                        <div className="mwci-detail-panel">
                            {/* 모바일 상단 바 */}
                            <div className="mwci-detail-mobile-topbar">
                                <button onClick={() => setSelectedInquiryId(null)} className="mwci-back-btn">
                                    <ArrowLeft size={20} />
                                </button>
                                <span className="mwci-mobile-topbar-title">문의 상세</span>
                            </div>

                            {/* 스크롤 영역 */}
                            <div className="mwci-detail-body">
                                {/* 발신자 정보 */}
                                <div>
                                    <div className="mwci-sender-row">
                                        <div className="mwci-sender-info">
                                            <div className="mwci-sender-avatar">{selectedInquiry.sender[0]}</div>
                                            <div>
                                                <div className="mwci-sender-name-row">
                                                    <h4 className="mwci-sender-name">{selectedInquiry.sender}</h4>
                                                    <span className="mwci-sender-tag-badge">
                                                        #{selectedInquiry.tag}
                                                    </span>
                                                </div>
                                                <p className="mwci-sender-date">{selectedInquiry.date} 수신</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* 문의 내용 */}
                                <div className="mwci-inquiry-content-box">
                                    <div className="mwci-inquiry-deco-icon">
                                        <MessageSquare size={20} />
                                    </div>
                                    <h5 className="mwci-inquiry-content-title">{selectedInquiry.title}</h5>
                                    <p className="mwci-inquiry-content-text">{selectedInquiry.content}</p>
                                </div>

                                {/* 답변 완료 */}
                                {selectedInquiry.status === 'completed' && selectedInquiry.myReply && (
                                    <div className="mwci-reply-completed-wrap">
                                        <div className="mwci-reply-divider">
                                            <div className="mwci-divider-line"></div>
                                            <div className="mwci-divider-label">
                                                <CheckCircle size={14} />
                                                <span className="mwci-divider-text">나의 답변</span>
                                            </div>
                                            <div className="mwci-divider-line"></div>
                                        </div>

                                        <div className="mwci-reply-bubble-row">
                                            <div className="mwci-reply-coach-avatar">코</div>
                                            <div className="mwci-reply-bubble">
                                                <p className="mwci-reply-bubble-text">{selectedInquiry.myReply}</p>
                                                <div className="mwci-reply-bubble-tail"></div>
                                            </div>
                                        </div>
                                        <p className="mwci-reply-sent-label">상담사 답변 완료</p>
                                    </div>
                                )}

                                {/* 미답변 안내 */}
                                {selectedInquiry.status === 'pending' && (
                                    <div className="mwci-pending-hint">
                                        <AlertCircle size={18} className="mwci-pending-hint-icon" />
                                        <p className="mwci-pending-hint-text">
                                            {selectedInquiry.tag === '일정변경'
                                                ? '일정 변경 시 가능한 대체 시간대를 최소 2개 이상 구체적으로 제안해 주세요.'
                                                : '전문적인 조언과 함께 내담자의 용기를 북돋아 주는 따뜻한 인사로 답변을 시작해 보세요.'}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* 하단 입력 영역 */}
                            <div className="mwci-reply-footer">
                                {selectedInquiry.status === 'pending' ? (
                                    <>
                                        <div className="mwci-reply-header-row">
                                            <div className="mwci-reply-label-group">
                                                <span className="mwci-reply-label">답장 작성</span>
                                                <span className="mwci-reply-recipient">
                                                    | {selectedInquiry.sender}님께 전송
                                                </span>
                                            </div>
                                            <button className="mwci-spell-btn">맞춤법</button>
                                        </div>

                                        <div className="mwci-textarea-wrap">
                                            <textarea
                                                value={replyText}
                                                onChange={(e) => setReplyText(e.target.value)}
                                                placeholder={`${selectedInquiry.sender}님께 따뜻한 답변을 작성해 주세요...`}
                                                className="mwci-textarea"
                                            />
                                            <button
                                                onClick={handleSendReply}
                                                disabled={!replyText.trim()}
                                                className={`mwci-send-btn ${
                                                    replyText.trim()
                                                        ? 'mwci-send-btn--active'
                                                        : 'mwci-send-btn--disabled'
                                                }`}
                                            >
                                                <Send size={18} />
                                            </button>
                                        </div>

                                        <div className="mwci-reply-actions-row">
                                            <div className="mwci-emoji-attach-group">
                                                <button className="mwci-icon-btn">
                                                    <Smile size={20} />
                                                </button>
                                                <button className="mwci-icon-btn">
                                                    <Paperclip size={20} />
                                                </button>
                                            </div>
                                            <span className="mwci-char-count">{replyText.length} 자</span>
                                        </div>
                                    </>
                                ) : (
                                    <div className="mwci-completed-footer">
                                        <div className="mwci-completed-footer-inner">
                                            <CheckCircle size={18} />
                                            <span>내담자에게 답변이 전달되었습니다.</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </section>
            </main>
            <Footer />
            <MobileTap />
        </div>
    );
};

export default App;
