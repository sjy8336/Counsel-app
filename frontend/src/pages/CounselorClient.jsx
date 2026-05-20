import React, { useState, useEffect } from 'react';
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
    const [logModal, setLogModal] = useState({ open: false, editId: null, content: '', title: '', bookingDate: '' });
    const [surveyModal, setSurveyModal] = useState(false);
    const [deleteModal, setDeleteModal] = useState({ open: false, logId: null });
    const [openLogId, setOpenLogId] = useState(null);

    const fetchClients = async () => {
        try {
            const data = await getCounselorClients();
            setClients(data);
            if (!selectedId && data.length > 0) setSelectedId(data[0].id);
        } catch {
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

    const filtered = clients.filter((c) => c.name.includes(search));
    const client = clients.find((c) => c.id === selectedId) || clients[0] || {};

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
        const target = findTargetBooking(clientObj);
        const bookingDate = target
            ? formatBookingDate(target)
            : clientObj.date && clientObj.time
              ? formatBookingDate({ date: clientObj.date, time: clientObj.time })
              : '';
        setLogModal({
            open: true,
            editId: null,
            content: '',
            title: `${(clientObj.logs?.length || 0) + 1}회차 상담 일지`,
            bookingDate,
        });
    };

    const handleSaveLog = async () => {
        const content = logModal.content.trim();
        if (!content) return alert('내용을 입력해주세요.');
        const clientObj = clients.find((c) => c.id === selectedId);
        if (!clientObj) return;

        if (logModal.editId) {
            try {
                const updated = await putCounselingLog({ log_id: logModal.editId, content });
                setClients((prev) =>
                    prev.map((c) =>
                        c.id === selectedId
                            ? {
                                  ...c,
                                  logs: c.logs.map((l) =>
                                      l.id === logModal.editId ? { ...l, content: updated.content } : l
                                  ),
                              }
                            : c
                    )
                );
                setLogModal({ open: false, editId: null, content: '', title: '', bookingDate: '' });
            } catch {
                alert('상담일지 수정에 실패했습니다.');
            }
            return;
        }

        try {
            const newLog = await addCounselingLog({
                booking_id: clientObj.bookingId,
                client_id: clientObj.id,
                title: logModal.title || `${clientObj.logs.length + 1}회차 상담 일지`,
                session_number: clientObj.logs.length + 1,
                content,
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
                                      quickMemo: newLog.quick_memo,
                                  },
                                  ...c.logs,
                              ],
                          }
                        : c
                )
            );
            setLogModal({ open: false, editId: null, content: '', title: '', bookingDate: '' });
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

    const closeLogModal = () => setLogModal({ open: false, editId: null, content: '', title: '', bookingDate: '' });

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
                {/* 사이드바 */}
                <aside className={`cc-sidebar ${isMobileListOpen ? 'is-open' : 'is-closed'}`}>
                    <div className="cc-sidebar__header" onClick={() => setIsMobileListOpen(!isMobileListOpen)}>
                        <h3 className="cc-sidebar__title">내담자 목록</h3>
                        <span className="cc-mobile-toggle">{isMobileListOpen ? '접기 ▲' : '목록 보기 ▼'}</span>
                    </div>
                    <div className="cc-sidebar-content">
                        <input
                            className="cc-search"
                            placeholder="이름 검색..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
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
                                    <div className="cc-client-info">
                                        <strong>{c.name}</strong>
                                        <span>
                                            {c.birth} · {c.gender}
                                        </span>
                                    </div>
                                    <span className={`cc-status-badge ${STATUS_CLASS[c.status]}`}>{c.status}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </aside>

                {/* 메인 */}
                <main className="cc-main">
                    <div className="cc-profile-card">
                        <div className="cc-profile-info">
                            <span className={`cc-status-badge-lg ${STATUS_CLASS[client.status] || ''}`}>
                                {client.status || ''}
                            </span>
                            <h2>
                                {client.name || ''}{' '}
                                <small>{(client.gender || '') + (client.birth ? ' · ' + client.birth : '')}</small>
                            </h2>
                            <p>{client.phone || ''}</p>
                        </div>
                        <div className="cc-profile-actions">
                            <button className="cc-btn cc-btn--outline" onClick={() => setSurveyModal(true)}>
                                사전 설문지 확인
                            </button>
                            <button className="cc-btn cc-btn--primary" onClick={handleOpenNewLog}>
                                + 새 일지 작성
                            </button>
                        </div>
                    </div>

                    <section className="cc-history">
                        <div className="cc-section-header">
                            <h3>
                                전체 상담 히스토리 <span className="cc-count">{client.logs?.length ?? 0}건</span>
                            </h3>
                        </div>
                        {!client.logs?.length ? (
                            <div className="cc-empty">상담 기록이 없습니다.</div>
                        ) : (
                            <div className="cc-log-list">
                                {client.logs.map((log) => (
                                    <div
                                        key={log.id}
                                        className={`cc-accordion-item${openLogId === log.id ? ' is-open' : ''}`}
                                    >
                                        <div
                                            className="cc-accordion-header"
                                            onClick={() => setOpenLogId(openLogId === log.id ? null : log.id)}
                                        >
                                            <div className="cc-accordion-left">
                                                <span className="cc-accordion-arrow">
                                                    {openLogId === log.id ? '▾' : '▸'}
                                                </span>
                                                <span className="cc-accordion-title">{log.title}</span>
                                                <span className="cc-log-date">{log.date}</span>
                                            </div>
                                            <div className="cc-log-card-actions" onClick={(e) => e.stopPropagation()}>
                                                <button
                                                    onClick={() =>
                                                        setLogModal({
                                                            open: true,
                                                            editId: log.id,
                                                            content: log.content,
                                                            title: log.title,
                                                            bookingDate: '',
                                                        })
                                                    }
                                                >
                                                    수정
                                                </button>
                                                <button onClick={() => setDeleteModal({ open: true, logId: log.id })}>
                                                    삭제
                                                </button>
                                            </div>
                                        </div>
                                        {openLogId === log.id && (
                                            <div className="cc-accordion-body">
                                                <div className="cc-log-card-content">{log.content}</div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                </main>

                {/* 유틸리티 */}
                <aside className="cc-utility">
                    <div className="cc-util-box">
                        <h4>주요 키워드</h4>
                        <div className="cc-keywords">
                            {(client.keywords || []).map((k, i) => (
                                <span key={i} className="cc-keyword">
                                    #{k}
                                </span>
                            ))}
                        </div>
                    </div>
                    <div className="cc-util-box">
                        <h4>Quick Memo</h4>
                        <textarea placeholder="다음 상담 시 확인할 내용..." className="cc-memo-area" />
                    </div>
                </aside>
            </div>

            {/* 일지 작성/수정 모달 */}
            {logModal.open && (
                <div className="cc-overlay" onClick={closeLogModal}>
                    <div className="cc-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="cc-log-modal-header">
                            <div className="cc-log-modal-meta">
                                <span className="cc-log-modal-client">{client.name} 님</span>
                                {logModal.bookingDate && (
                                    <span className="cc-log-modal-booking-date">
                                        <span className="cc-log-modal-booking-label">상담 진행일</span>
                                        {logModal.bookingDate}
                                    </span>
                                )}
                            </div>
                            <p className="cc-log-modal-title">{logModal.title}</p>
                        </div>
                        <textarea
                            className="cc-log-editor"
                            value={logModal.content}
                            onChange={(e) => setLogModal({ ...logModal, content: e.target.value })}
                            placeholder="상담 내용을 입력하세요..."
                        />
                        <div className="cc-modal__actions center">
                            <button className="cc-btn cc-btn--ghost" onClick={closeLogModal}>
                                취소
                            </button>
                            <button className="cc-btn cc-btn--primary" onClick={handleSaveLog}>
                                {logModal.editId ? '수정 완료' : '작성 완료'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* 사전 설문지 모달 */}
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
                                    <div className="cc-survey-ans">{a || ''}</div>
                                </div>
                            ))}
                        </div>
                        <button className="cc-btn cc-btn--primary full" onClick={() => setSurveyModal(false)}>
                            확인했습니다
                        </button>
                    </div>
                </div>
            )}

            {/* 삭제 확인 모달 */}
            {deleteModal.open && (
                <div className="cc-overlay">
                    <div className="cc-modal cc-delete-modal">
                        <div className="cc-delete-header">
                            <div className="cc-warn-circle">!</div>
                            <h3>일지 삭제</h3>
                        </div>
                        <p className="cc-delete-msg">
                            정말 이 상담 일지를 삭제하시겠습니까?
                            <br />
                            삭제된 데이터는 다시 복구할 수 없습니다.
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
