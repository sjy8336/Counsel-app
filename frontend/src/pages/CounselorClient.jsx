import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '../components/header.jsx';
import Footer from '../components/footer.jsx';
import MobileTap from '../components/mobileTap.jsx';
import '../static/CounselorClient.css';

import { getCounselorClients, addCounselingLog, putCounselingLog, deleteCounselingLog } from '../api/counselorClients';

const STATUS_CLASS = { '진행 중': 'status-ing', '대기 중': 'status-wait', 종료: 'status-end' };

// 확정 예약 중 일지 없는 가장 가까운 예약 찾기
const findTargetBooking = (clientObj) => {
    if (!Array.isArray(clientObj?.bookings) || clientObj.bookings.length === 0) return null;
    const usedIds = (clientObj.logs || []).map((l) => l.booking_id);
    const available = clientObj.bookings.filter((b) => !usedIds.includes(b.id) && b.status?.includes('확정'));
    if (!available.length) return null;
    const now = new Date();
    const future = available.filter((b) => new Date(`${b.date}T${b.time}`) >= now);
    return [...(future.length ? future : available)].sort(
        (a, b) => new Date(`${a.date}T${a.time}`) - new Date(`${b.date}T${b.time}`)
    )[0];
};

const formatBookingDate = (booking) => {
    if (!booking) return '';
    const [y, m, d] = booking.date.split('-');
    return `${y}년 ${Number(m)}월 ${Number(d)}일 ${booking.time}`;
};

const CounselorClient = ({ userName, setUserName, isLoggedIn, setIsLoggedIn }) => {
    const navigate = useNavigate();
    const location = useLocation();

    const [activeTab, setActiveTab] = useState('client');
    const [search, setSearch] = useState('');
    const [selectedId, setSelectedId] = useState(null);
    const [clients, setClients] = useState([]);
    const [isMobileListOpen, setIsMobileListOpen] = useState(false);
    const [logModal, setLogModal] = useState({
        open: false,
        editId: null,
        content: '',
        summary: '',
        actionPlan: '',
        title: '',
        bookingDate: '',
        bookingId: null,
    });
    const [surveyModal, setSurveyModal] = useState(false);
    const [deleteModal, setDeleteModal] = useState({ open: false, logId: null });
    const [openLogId, setOpenLogId] = useState(null);

    // 날짜 드롭다운 상태
    const [dateDropdownOpen, setDateDropdownOpen] = useState(false);
    const [availableBookings, setAvailableBookings] = useState([]);
    const dateDropdownRef = useRef(null);

    const fetchClients = async () => {
        try {
            const data = await getCounselorClients();
            // 상태 기본값: status 없으면 '진행 중' 처리
            const normalized = data.map((c) => ({
                ...c,
                status: c.status || '진행 중',
            }));
            setClients(normalized);
            if (!selectedId && normalized.length > 0) setSelectedId(normalized[0].id);
        } catch (e) {
            console.error('내담자 목록 불러오기 실패:', e);
            setClients([]);
        }
    };

    useEffect(() => {
        fetchClients();
    }, []);

    useEffect(() => {
        if (location.state?.selectedClientName && clients.length > 0) {
            const target = clients.find((c) => c.name === location.state.selectedClientName);
            if (target) setSelectedId(target.id);
        }
    }, [location.state, clients]);

    // 드롭다운 외부 클릭 시 닫기
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dateDropdownRef.current && !dateDropdownRef.current.contains(e.target)) {
                setDateDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const filtered = clients.filter((c) => c.name.includes(search));
    const client = clients.find((c) => c.id === selectedId) || clients[0] || {};
    const clientStatus = client.status || '진행 중';
    const isManualClient = !client.id;

    const handleTabClick = (tabId) => {
        setActiveTab(tabId);
        const routes = {
            home: '/home',
            reservation: '/reservation',
            client: '/client',
            inquiry: '/inquiry',
            mypage: '/mypage',
        };
        if (routes[tabId]) navigate(routes[tabId]);
    };

    // 새 일지 작성 버튼 클릭 — 예약 날짜 자동 추출
    const handleOpenNewLog = () => {
        const clientObj = clients.find((c) => c.id === selectedId) || clients[0] || {};

        const usedIds = (clientObj.logs || []).map((l) => l.booking_id);
        const allBookings = clientObj.bookings || [];
        const available = allBookings.filter((b) => !usedIds.includes(b.id));
        setAvailableBookings(available);

        const firstAvailable = available[0] || allBookings[0];
        setLogModal({
            open: true,
            editId: null,
            content: '',
            summary: '',
            actionPlan: '',
            title: `${(clientObj.logs?.length || 0) + 1}회차 상담 일지`,
            bookingDate: firstAvailable ? formatBookingDate(firstAvailable) : '',
            bookingId: firstAvailable ? firstAvailable.id : null,
        });
        setDateDropdownOpen(false);
    };

    // 드롭다운에서 회차 선택
    const handleSelectBooking = (booking, idx) => {
        setLogModal((prev) => ({
            ...prev,
            bookingDate: formatBookingDate(booking),
            bookingId: booking.id,
            title: `${idx + 1}회차 상담 일지`,
        }));
        setDateDropdownOpen(false);
    };

    const handleSaveLog = async () => {
        const content = logModal.content.trim();
        const summary = logModal.summary.trim();
        const actionPlan = logModal.actionPlan.trim();
        if (!content) return alert('상담 내용을 입력해주세요.');
        if (!summary) return alert('상담 요약을 입력해주세요.');
        if (!actionPlan) return alert('실천과제를 입력해주세요.');
        const clientObj = clients.find((c) => c.id === selectedId);
        if (!clientObj) return;

        if (logModal.editId) {
            try {
                const updated = await putCounselingLog({ log_id: logModal.editId, content, summary, action_plan: actionPlan });
                setClients((prev) =>
                    prev.map((c) =>
                        c.id === selectedId
                            ? {
                                  ...c,
                                  logs: c.logs.map((l) =>
                                      l.id === logModal.editId
                                          ? { ...l, content: updated.content, summary: updated.summary, actionPlan: updated.action_plan }
                                          : l
                                  ),
                              }
                            : c
                    )
                );
                setLogModal({ open: false, editId: null, content: '', summary: '', actionPlan: '', title: '', bookingDate: '', bookingId: null });
            } catch {
                alert('상담일지 수정에 실패했습니다.');
            }
            return;
        }

        try {
            const newLog = await addCounselingLog({
                booking_id: logModal.bookingId,
                client_id: clientObj.id,
                title: logModal.title || `${clientObj.logs.length + 1}회차 상담 일지`,
                session_number: clientObj.logs.length + 1,
                content,
                summary,
                action_plan: actionPlan,
                quick_memo: '',
            });
            setClients((prev) =>
                prev.map((c) =>
                    c.id === selectedId
                        ? {
                              ...c,
                              logs: [
                                  {
                                      id: newLog.id,
                                      date: new Date(newLog.created_at).toLocaleDateString('ko-KR').slice(0, -1),
                                      title: newLog.title,
                                      content: newLog.content,
                                      summary: newLog.summary,
                                      actionPlan: newLog.action_plan,
                                      quickMemo: newLog.quick_memo,
                                  },
                                  ...c.logs,
                              ],
                          }
                        : c
                )
            );
            setLogModal({ open: false, editId: null, content: '', summary: '', actionPlan: '', title: '', bookingDate: '', bookingId: null });
        } catch (e) {
            alert(
                e?.response?.status === 409
                    ? '이미 해당 예약에 대한 상담일지가 존재합니다.'
                    : '상담일지 저장에 실패했습니다.'
            );
        }
    };

    const handleDeleteLog = async () => {
        try {
            await deleteCounselingLog(deleteModal.logId);
            setClients((prev) =>
                prev.map((c) =>
                    c.id === selectedId ? { ...c, logs: c.logs.filter((l) => l.id !== deleteModal.logId) } : c
                )
            );
            setDeleteModal({ open: false, logId: null });
            setOpenLogId(null);
        } catch (e) {
            alert('상담일지 삭제에 실패했습니다.');
        }
    };

    const closeLogModal = () => {
        setLogModal({ open: false, editId: null, content: '', summary: '', actionPlan: '', title: '', bookingDate: '', bookingId: null });
        setDateDropdownOpen(false);
    };

    return (
        <div className="cc-wrapper">
            <Header
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                userName={userName}
                setUserName={setUserName}
                isLoggedIn={isLoggedIn}
                setIsLoggedIn={setIsLoggedIn}
            />

            <div className="cc-container">
                {/* ── 사이드바 ── */}
                <aside className={`cc-sidebar ${isMobileListOpen ? 'is-open' : 'is-closed'}`}>
                    <div className="cc-sidebar__header" onClick={() => setIsMobileListOpen(!isMobileListOpen)}>
                        <h3 className="cc-sidebar__title">내담자 목록</h3>
                        <span className="cc-mobile-toggle">{isMobileListOpen ? '접기 ▲' : '목록 보기 ▼'}</span>
                    </div>
                    <div className="cc-sidebar-content">
                        <div className="cc-search-wrap">
                            <svg className="cc-search-icon" width="15" height="15" viewBox="0 0 20 20" fill="none">
                                <circle cx="9" cy="9" r="6" stroke="#94a3b8" strokeWidth="1.8"/>
                                <path d="M13.5 13.5L17 17" stroke="#94a3b8" strokeWidth="1.8" strokeLinecap="round"/>
                            </svg>
                            <input
                                className="cc-search"
                                placeholder="이름 검색"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <ul className="cc-client-list">
                            {filtered.map((c) => (
                                <li
                                    key={c.id}
                                    className={`cc-client-item${selectedId === c.id ? ' is-active' : ''}`}
                                    onClick={() => {
                                        setSelectedId(c.id);
                                        setOpenLogId(null);
                                        setIsMobileListOpen(false);
                                    }}
                                >
                                    <div className="cc-client-avatar">
                                        {c.name?.charAt(0) || '?'}
                                    </div>
                                    <div className="cc-client-info">
                                        <strong>{c.name}</strong>
                                        <span>{c.birth} · {c.gender}</span>
                                    </div>
                                    <span className={`cc-status-badge ${STATUS_CLASS[c.status || '진행 중']}`}>
                                        {c.status || '진행 중'}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </aside>

                {/* ── 메인 ── */}
                <main className="cc-main">
                    {/* 프로필 카드 */}
                    <div className="cc-profile-card">
                        <div className="cc-profile-left">
                            <div className="cc-profile-avatar">
                                {client.name?.charAt(0) || '?'}
                            </div>
                            <div className="cc-profile-info">
                                <div className="cc-profile-name-row">
                                    <h2 className="cc-profile-name">{client.name || ''}</h2>
                                    <span className={`cc-status-badge ${STATUS_CLASS[clientStatus]}`}>
                                        {clientStatus}
                                    </span>
                                </div>
                                <p className="cc-profile-sub">
                                    {client.gender && <span>{client.gender}</span>}
                                    {client.birth && <><span className="cc-dot-sep">·</span><span>{client.birth}</span></>}
                                    {client.phone && <><span className="cc-dot-sep">·</span><span>{client.phone}</span></>}
                                </p>
                                {isManualClient && (
                                    <p className="cc-manual-info">직접 입력된 내담자 · 일지는 소장용으로 저장됩니다</p>
                                )}
                            </div>
                        </div>
                        <div className="cc-profile-actions">
                            <button className="cc-btn cc-btn--outline" onClick={() => setSurveyModal(true)}>
                                <svg width="15" height="15" viewBox="0 0 20 20" fill="none" style={{marginRight:5,verticalAlign:'middle'}}>
                                    <rect x="4" y="3" width="12" height="14" rx="3" stroke="currentColor" strokeWidth="1.6"/>
                                    <path d="M7 7h6M7 10h6M7 13h4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                                </svg>
                                사전 설문지
                            </button>
                            <button className="cc-btn cc-btn--primary" onClick={handleOpenNewLog}>
                                <svg width="14" height="14" viewBox="0 0 20 20" fill="none" style={{marginRight:5,verticalAlign:'middle'}}>
                                    <path d="M10 4v12M4 10h12" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                                </svg>
                                새 일지 작성
                            </button>
                        </div>
                    </div>

                    {/* 상담 히스토리 */}
                    <section className="cc-history">
                        <div className="cc-section-header">
                            <h3 className="cc-section-title">
                                상담 히스토리
                                <span className="cc-count-badge">{client.logs?.length ?? 0}</span>
                            </h3>
                        </div>
                        {!client.logs?.length ? (
                            <div className="cc-empty">
                                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" style={{marginBottom:10,opacity:.35}}>
                                    <rect x="4" y="3" width="16" height="18" rx="3" stroke="#8ba888" strokeWidth="1.5"/>
                                    <path d="M8 8h8M8 12h8M8 16h5" stroke="#8ba888" strokeWidth="1.4" strokeLinecap="round"/>
                                </svg>
                                <p>아직 상담 기록이 없습니다.</p>
                            </div>
                        ) : (
                            <div className="cc-log-list">
                                {client.logs.map((log, idx) => (
                                    <div
                                        key={log.id}
                                        className={`cc-accordion-item${openLogId === log.id ? ' is-open' : ''}`}
                                    >
                                        <div
                                            className="cc-accordion-header"
                                            onClick={() => setOpenLogId(openLogId === log.id ? null : log.id)}
                                        >
                                            <div className="cc-accordion-left">
                                                <span className="cc-session-num">{client.logs.length - idx}</span>
                                                <div>
                                                    <span className="cc-accordion-title">{log.title}</span>
                                                    <span className="cc-log-date">{log.date}</span>
                                                </div>
                                            </div>
                                            <div className="cc-log-card-actions" onClick={(e) => e.stopPropagation()}>
                                                <button
                                                    className="cc-action-btn cc-action-btn--edit"
                                                    onClick={() =>
                                                        setLogModal({
                                                            open: true,
                                                            editId: log.id,
                                                            content: log.content || '',
                                                            summary: log.summary || '',
                                                            actionPlan: log.actionPlan || '',
                                                            title: log.title,
                                                            bookingDate: '',
                                                            bookingId: null,
                                                        })
                                                    }
                                                >
                                                    수정
                                                </button>
                                                <button
                                                    className="cc-action-btn cc-action-btn--delete"
                                                    onClick={() => setDeleteModal({ open: true, logId: log.id })}
                                                >
                                                    삭제
                                                </button>
                                                <span className={`cc-accordion-chevron${openLogId === log.id ? ' is-open' : ''}`}>
                                                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                                        <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                                                    </svg>
                                                </span>
                                            </div>
                                        </div>
                                        {openLogId === log.id && (
                                            <div className="cc-accordion-body">
                                                {log.content && (
                                                    <div className="cc-log-section">
                                                        <span className="cc-log-section-label">전문가 소견</span>
                                                        <p className="cc-log-card-content">{log.content}</p>
                                                    </div>
                                                )}
                                                {log.summary && (
                                                    <div className="cc-log-section">
                                                        <span className="cc-log-section-label">상담 요약</span>
                                                        <p className="cc-log-card-content">{log.summary}</p>
                                                    </div>
                                                )}
                                                {log.actionPlan && (
                                                    <div className="cc-log-section">
                                                        <span className="cc-log-section-label">실천과제</span>
                                                        <p className="cc-log-card-content">{log.actionPlan}</p>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                </main>

                {/* ── 유틸리티 ── */}
                <aside className="cc-utility">
                    <div className="cc-util-box">
                        <h4 className="cc-util-title">주요 키워드</h4>
                        <div className="cc-keywords">
                            {(client.keywords || []).length > 0 ? (
                                (client.keywords || []).map((k, i) => (
                                    <span key={i} className="cc-keyword">#{k}</span>
                                ))
                            ) : (
                                <span className="cc-empty-small">키워드 없음</span>
                            )}
                        </div>
                    </div>
                    <div className="cc-util-box">
                        <h4 className="cc-util-title">Quick Memo</h4>
                        <textarea placeholder="다음 상담 시 확인할 내용을 메모하세요..." className="cc-memo-area" />
                    </div>
                </aside>
            </div>

            {/* ── 일지 작성/수정 모달 ── */}
            {logModal.open && (
                <div className="cc-overlay" onClick={closeLogModal}>
                    <div className="cc-modal cc-log-modal" onClick={(e) => e.stopPropagation()}>
                        {/* 모달 헤더 */}
                        <div className="cc-log-modal-header">
                            <div className="cc-log-modal-top">
                                <span className="cc-log-modal-client">{client.name} 님</span>
                                {logModal.bookingDate && !logModal.editId && (
                                    <div className="cc-date-dropdown-wrap" ref={dateDropdownRef}>
                                        <button
                                            type="button"
                                            className={`cc-date-pill${dateDropdownOpen ? ' is-active' : ''}`}
                                            onClick={() => setDateDropdownOpen((v) => !v)}
                                        >
                                            <svg width="14" height="14" viewBox="0 0 20 20" fill="none" style={{marginRight:5,flexShrink:0}}>
                                                <rect x="3" y="5" width="14" height="12" rx="3.5" fill="#f0f7ef" stroke="#7bb661" strokeWidth="1.5"/>
                                                <rect x="6.5" y="2.5" width="2" height="3" rx="1" fill="#7bb661"/>
                                                <rect x="11.5" y="2.5" width="2" height="3" rx="1" fill="#7bb661"/>
                                                <rect x="6.5" y="9.5" width="7" height="1.8" rx="0.9" fill="#b8dfb8"/>
                                            </svg>
                                            <span>{logModal.bookingDate}</span>
                                            <svg
                                                className={`cc-date-chevron${dateDropdownOpen ? ' is-open' : ''}`}
                                                width="12" height="12" viewBox="0 0 14 14" fill="none"
                                                style={{marginLeft:4,flexShrink:0}}
                                            >
                                                <path d="M3 5l4 4 4-4" stroke="#6e9170" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                                            </svg>
                                        </button>
                                        {dateDropdownOpen && availableBookings.length > 0 && (
                                            <div className="cc-date-dropdown">
                                                {availableBookings.map((booking, idx) => (
                                                    <button
                                                        key={booking.id}
                                                        type="button"
                                                        className={`cc-date-dropdown-item${logModal.bookingId === booking.id ? ' is-selected' : ''}`}
                                                        onClick={() => handleSelectBooking(booking, idx)}
                                                    >
                                                        <span className="cc-date-dropdown-session">{idx + 1}회차</span>
                                                        <span className="cc-date-dropdown-date">{formatBookingDate(booking)}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                            <h3 className="cc-log-modal-title">{logModal.title || (logModal.editId ? '일지 수정' : '새 상담 일지')}</h3>
                        </div>

                        {/* 입력 필드들 */}
                        <div className="cc-log-fields">
                            <div className="cc-log-field-group">
                                <label className="cc-log-label">전문가 소견</label>
                                <textarea
                                    className="cc-log-editor"
                                    value={logModal.content}
                                    onChange={(e) => setLogModal({ ...logModal, content: e.target.value })}
                                    placeholder="상담 내용을 입력하세요..."
                                />
                            </div>
                            <div className="cc-log-field-group">
                                <label className="cc-log-label">상담 요약</label>
                                <textarea
                                    className="cc-log-editor cc-log-editor--sm"
                                    value={logModal.summary}
                                    onChange={(e) => setLogModal({ ...logModal, summary: e.target.value })}
                                    placeholder="상담 요약을 입력하세요..."
                                />
                            </div>
                            <div className="cc-log-field-group">
                                <label className="cc-log-label">다음주까지의 실천과제</label>
                                <textarea
                                    className="cc-log-editor cc-log-editor--sm"
                                    value={logModal.actionPlan}
                                    onChange={(e) => setLogModal({ ...logModal, actionPlan: e.target.value })}
                                    placeholder="다음 상담까지의 실천과제를 입력하세요..."
                                />
                            </div>
                        </div>

                        <div className="cc-modal__actions cc-modal__actions--right">
                            <button className="cc-btn cc-btn--ghost" onClick={closeLogModal}>취소</button>
                            <button className="cc-btn cc-btn--primary" onClick={handleSaveLog}>
                                {logModal.editId ? '수정 완료' : '작성 완료'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── 사전 설문지 모달 ── */}
            {surveyModal && (
                <div className="cc-overlay" onClick={() => setSurveyModal(false)}>
                    <div className="cc-modal cc-survey-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="cc-survey-header">
                            <span className="cc-survey-tag">Initial Survey</span>
                            <h3 className="cc-modal-title">사전 상담 질문지</h3>
                            <p className="cc-survey-user">{client.name || ''} 내담자님</p>
                        </div>
                        <div className="cc-survey-body">
                            {[
                                { q: 'Q1. 상담을 신청하게 된 구체적인 계기는 무엇인가요?', a: client.survey?.reason },
                                { q: 'Q2. 이전에 상담을 받아보신 경험이 있으신가요?', a: client.survey?.prev },
                                { q: 'Q3. 이번 상담을 통해 이루고 싶은 최종 목표는?', a: client.survey?.goal },
                            ].map(({ q, a }) => (
                                <div key={q} className="cc-survey-group">
                                    <label>{q}</label>
                                    <div className="cc-survey-ans">{a || <span style={{color:'#94a3b8'}}>미입력</span>}</div>
                                </div>
                            ))}
                        </div>
                        <button className="cc-btn cc-btn--primary full" onClick={() => setSurveyModal(false)}>
                            확인했습니다
                        </button>
                    </div>
                </div>
            )}

            {/* ── 삭제 확인 모달 ── */}
            {deleteModal.open && (
                <div className="cc-overlay">
                    <div className="cc-modal cc-delete-modal">
                        <div className="cc-delete-header">
                            <div className="cc-warn-circle">
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                                    <path d="M12 8v5M12 16v.5" stroke="#ef4444" strokeWidth="2.2" strokeLinecap="round"/>
                                </svg>
                            </div>
                            <h3>일지를 삭제할까요?</h3>
                        </div>
                        <p className="cc-delete-msg">
                            삭제한 상담 일지는 복구할 수 없습니다.
                        </p>
                        <div className="cc-modal__actions stretch">
                            <button
                                className="cc-btn cc-btn--ghost"
                                onClick={() => setDeleteModal({ open: false, logId: null })}
                            >
                                취소
                            </button>
                            <button className="cc-btn cc-btn--danger" onClick={handleDeleteLog}>
                                삭제하기
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <MobileTap activeTab={activeTab} setActiveTab={handleTabClick} />
            <Footer />
        </div>
    );
};

export default CounselorClient;