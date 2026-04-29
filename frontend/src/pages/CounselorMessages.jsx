import React, { useState, useEffect, useRef } from 'react';
import Header from '../components/header';
import Footer from '../components/footer';
import MobileTap from '../components/mobileTap';
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

const App = () => {
    /* ── 1. 초기 데이터 ── */
    const initialInquiries = [
        {
            id: 1,
            sender: '김하늘님',
            title: '비대면 화상 상담도 가능한가요?',
            content:
                '안녕하세요 코치님. 제가 지방에 거주하고 있어서 대면 상담은 조금 어려울 것 같은데, 혹시 구글 미트나 줌을 이용한 비대면 화상 상담도 진행하시는지 궁금해서 문의 남깁니다. 가능하다면 비용 차이가 있는지도 알려주세요!',
            date: '2024.05.21',
            status: 'pending',
            tag: '상담문의',
        },
        {
            id: 2,
            sender: '박민우님',
            title: '상담 시간 변경 요청드립니다 (5/23)',
            content:
                '코치님 안녕하세요. 이번 주 목요일(23일) 오후 3시 예약자 박민우입니다. 갑작스러운 회사 업무로 인해 시간을 조정해야 할 것 같은데, 혹시 당일 저녁 7시나 아니면 금요일 오전으로 변경이 가능할까요? 확인 부탁드립니다.',
            date: '2024.05.21',
            status: 'pending',
            tag: '일정변경',
        },
        {
            id: 3,
            sender: '이정희님',
            title: '공황 증상 관련해서도 상담하시나요?',
            content:
                '최근 지하철에서 갑자기 숨이 가빠지는 경험을 했습니다. 전문적인 치료와 병행하면서 마음 관리 상담을 받고 싶은데, 이런 증상에 대해서도 상담을 진행하시는지 궁금합니다.',
            date: '2024.05.20',
            status: 'completed',
            tag: '상담문의',
            myReply:
                '안녕하세요 이정희님, 마음의 어려움을 겪고 계시는군요. 네, 공황 증상은 신체적인 반응과 심리적인 불안이 결합된 경우가 많아 상담을 통해 큰 도움을 받으실 수 있습니다. 병원 치료와 병행하신다면 더욱 효과적일 거예요. 편하신 시간에 예약해 주시면 자세히 이야기 나누어 보겠습니다.',
        },
    ];

    /* ── 2. 상태 관리 ── */
    const [inquiries, setInquiries] = useState(initialInquiries);
    const [selectedInquiryId, setSelectedInquiryId] = useState(null);
    const [replyText, setReplyText] = useState('');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    const filterRef = useRef(null);

    /* ── 3. 필터링 ── */
    const filteredInquiries = inquiries.filter((inquiry) => {
        const matchesSearch = inquiry.sender
            .toLowerCase()
            .includes(searchTerm.toLowerCase());
        const matchesStatus =
            statusFilter === 'all' ? true : inquiry.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const selectedInquiry = inquiries.find((i) => i.id === selectedInquiryId);

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
    const handleSendReply = () => {
        if (!replyText.trim() || !selectedInquiryId) return;
        setInquiries((prev) =>
            prev.map((inquiry) =>
                inquiry.id === selectedInquiryId
                    ? { ...inquiry, status: 'completed', myReply: replyText }
                    : inquiry
            )
        );
        setReplyText('');
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
            <Header activeTab={activeTab} setActiveTab={setActiveTab} />
            {/* ── 메인 바디 ── */}
            <main className="mwci-main">
                {/* 왼쪽: 문의 목록 */}
                <section
                    className={`mwci-list-section ${
                        selectedInquiryId ? 'mwci-list-section--hidden' : ''
                    }`}
                >
                    <div className="mwci-list-toolbar">
                        <div className="mwci-list-title-row">
                            <h2 className="mwci-list-title">
                                받은 문의
                                <span className="mwci-list-count-badge">
                                    {filteredInquiries.length}
                                </span>
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
                                    <button
                                        onClick={() => setSearchTerm('')}
                                        className="mwci-search-clear-btn"
                                    >
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
                                        <button
                                            onClick={() => changeFilter('all')}
                                            className="mwci-filter-option"
                                        >
                                            전체보기
                                            {statusFilter === 'all' && (
                                                <Check
                                                    size={14}
                                                    className="mwci-filter-check-green"
                                                />
                                            )}
                                        </button>
                                        <button
                                            onClick={() => changeFilter('pending')}
                                            className="mwci-filter-option mwci-filter-option--rose"
                                        >
                                            안 읽은 거 (미답변)
                                            {statusFilter === 'pending' && (
                                                <Check
                                                    size={14}
                                                    className="mwci-filter-check-rose"
                                                />
                                            )}
                                        </button>
                                        <button
                                            onClick={() => changeFilter('completed')}
                                            className="mwci-filter-option mwci-filter-option--green"
                                        >
                                            읽은 거 (답변완료)
                                            {statusFilter === 'completed' && (
                                                <Check
                                                    size={14}
                                                    className="mwci-filter-check-green"
                                                />
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
                                        selectedInquiryId === inquiry.id
                                            ? 'mwci-inquiry-card--selected'
                                            : ''
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
                                    {inquiry.status === 'pending' && (
                                        <div className="mwci-card-pending-bar" />
                                    )}
                                </div>
                            ))
                        ) : (
                            <div className="mwci-empty-state">
                                <div className="mwci-empty-icon-box">
                                    <Search size={24} />
                                </div>
                                <p className="mwci-empty-title">문의 내역이 없습니다</p>
                                <p className="mwci-empty-desc">
                                    필터 설정을 변경하거나 다른 검색어로 시도해 보세요.
                                </p>
                            </div>
                        )}
                    </div>
                </section>

                {/* 오른쪽: 상세 / 답변 */}
                <section
                    className={`mwci-detail-section ${
                        selectedInquiryId
                            ? ''
                            : 'mwci-detail-section--hidden mwci-detail-section--empty'
                    }`}
                >
                    {!selectedInquiry ? (
                        <div className="mwci-detail-placeholder">
                            <div className="mwci-detail-placeholder-icon">
                                <MessageSquare size={32} />
                            </div>
                            <p className="mwci-detail-placeholder-text">
                                상담 문의를 선택하여 내용을 확인하세요.
                            </p>
                        </div>
                    ) : (
                        <div className="mwci-detail-panel">
                            {/* 모바일 상단 바 */}
                            <div className="mwci-detail-mobile-topbar">
                                <button
                                    onClick={() => setSelectedInquiryId(null)}
                                    className="mwci-back-btn"
                                >
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
                                            <div className="mwci-sender-avatar">
                                                {selectedInquiry.sender[0]}
                                            </div>
                                            <div>
                                                <div className="mwci-sender-name-row">
                                                    <h4 className="mwci-sender-name">
                                                        {selectedInquiry.sender}님
                                                    </h4>
                                                    <span className="mwci-sender-tag-badge">
                                                        #{selectedInquiry.tag}
                                                    </span>
                                                </div>
                                                <p className="mwci-sender-date">
                                                    {selectedInquiry.date} 수신
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* 문의 내용 */}
                                <div className="mwci-inquiry-content-box">
                                    <div className="mwci-inquiry-deco-icon">
                                        <MessageSquare size={20} />
                                    </div>
                                    <h5 className="mwci-inquiry-content-title">
                                        {selectedInquiry.title}
                                    </h5>
                                    <p className="mwci-inquiry-content-text">
                                        {selectedInquiry.content}
                                    </p>
                                </div>

                                {/* 답변 완료 */}
                                {selectedInquiry.status === 'completed' &&
                                    selectedInquiry.myReply && (
                                        <div className="mwci-reply-completed-wrap">
                                            <div className="mwci-reply-divider">
                                                <div className="mwci-divider-line"></div>
                                                <div className="mwci-divider-label">
                                                    <CheckCircle size={14} />
                                                    <span className="mwci-divider-text">
                                                        나의 답변
                                                    </span>
                                                </div>
                                                <div className="mwci-divider-line"></div>
                                            </div>

                                            <div className="mwci-reply-bubble-row">
                                                <div className="mwci-reply-coach-avatar">코</div>
                                                <div className="mwci-reply-bubble">
                                                    <p className="mwci-reply-bubble-text">
                                                        {selectedInquiry.myReply}
                                                    </p>
                                                    <div className="mwci-reply-bubble-tail"></div>
                                                </div>
                                            </div>
                                            <p className="mwci-reply-sent-label">
                                                상담사 답변 완료
                                            </p>
                                        </div>
                                    )}

                                {/* 미답변 안내 */}
                                {selectedInquiry.status === 'pending' && (
                                    <div className="mwci-pending-hint">
                                        <AlertCircle
                                            size={18}
                                            className="mwci-pending-hint-icon"
                                        />
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
                                            <span className="mwci-char-count">
                                                {replyText.length} 자
                                            </span>
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