import React, { useState, useMemo, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '../components/header.jsx';
import Footer from '../components/footer.jsx';
import MobileTap from '../components/mobileTap.jsx';
import '../static/CounselorClient.css';

const INIT_CLIENTS = [
    {
        id: 1,
        name: '이은지',
        birth: '1995.06.12',
        gender: '여',
        phone: '010-1234-5678',
        status: '진행 중',
        keywords: ['거절연습', '자아경계', '대인관계'],
        survey: { reason: '대인관계', prev: '있음', goal: '거절하는 법을 연습하고 자아 경계를 확립하고 싶습니다.' },
        logs: [
            { id: 101, date: '2026.05.10', title: '1회차 상담 일지', content: '거절 연습 및 자아 경계 설정 주제로 진행. 직장 내 대인관계 어려움 호소.' },
            { id: 102, date: '2026.05.17', title: '2회차 상담 일지', content: '지난 주 실천 과제 점검. 거절 상황 역할극 진행, 불안 반응 관찰.' },
        ],
    },
    { id: 2, name: '최민수', birth: '1988.11.20', gender: '남', phone: '010-9876-5432', status: '대기 중', keywords: ['번아웃', '직장스트레스', '수면장애'], survey: { reason: '직장/학업 스트레스', prev: '없음', goal: '무기력 해소와 일상 회복이 목표입니다.' }, logs: [] },
    { id: 3, name: '박지연', birth: '2001.03.05', gender: '여', phone: '010-5555-4444', status: '진행 중', keywords: ['학업스트레스', '시험불안', '집중력'], survey: { reason: '직장/학업 스트레스', prev: '있음', goal: '시험 불안을 줄이고 집중력을 높이고 싶습니다.' }, logs: [{ id: 301, date: '2026.05.08', title: '1회차 상담 일지', content: '시험 불안과 완벽주의 성향 탐색. 인지왜곡 패턴 확인.' }] },
    { id: 4, name: '김지아', birth: '1992.08.14', gender: '여', phone: '010-1111-2222', status: '종료', keywords: ['자존감', '대인관계', '자기이해'], survey: { reason: '자기이해 및 성장', prev: '없음', goal: '자존감 회복과 나다운 삶을 찾고 싶습니다.' }, logs: [{ id: 401, date: '2026.03.01', title: '1회차 상담 일지', content: '자존감 관련 핵심 신념 탐색. 어린 시절 경험과의 연결.' }, { id: 402, date: '2026.04.20', title: '최종(10회차) 상담 일지', content: '10회기 프로그램 마무리. 변화 점검 및 종결 작업 진행.' }] },
    { id: 5, name: '이하늘', birth: '1998.02.25', gender: '남', phone: '010-3333-7777', status: '대기 중', keywords: ['공황장애', '불안', '일상복귀'], survey: { reason: '우울/불안', prev: '있음', goal: '공황 증상을 조절하고 일상으로 복귀하고 싶습니다.' }, logs: [] },
    { id: 6, name: '정민우', birth: '1985.12.01', gender: '남', phone: '010-8888-9999', status: '진행 중', keywords: ['가족갈등', '부부관계', '대화법'], survey: { reason: '갈등', prev: '없음', goal: '배우자와의 소통 방식을 개선하고 관계 회복을 원합니다.' }, logs: [{ id: 601, date: '2026.05.05', title: '1회차 상담 일지', content: '부부 갈등 패턴 파악. 비난-방어 사이클 교육 및 공감 대화법 소개.' }, { id: 602, date: '2026.05.12', title: '2회차 상담 일지', content: '감정 표현 연습. 배우자 입장 취해보기 역할극 진행.' }] },
];

const STATUS_CLASS = { '진행 중': 'status-ing', '대기 중': 'status-wait', '종료': 'status-end' };

const CounselorClient = ({ userName, setUserName, isLoggedIn, setIsLoggedIn }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [activeTab, setActiveTab] = useState('client');
    const [search, setSearch] = useState('');
    const [selectedId, setSelectedId] = useState(1);
    const [clients, setClients] = useState(INIT_CLIENTS);
    const [isMobileListOpen, setIsMobileListOpen] = useState(false);

    const [logModal, setLogModal] = useState({ open: false, editId: null, content: '' });
    const [surveyModal, setSurveyModal] = useState(false);
    const [deleteModal, setDeleteModal] = useState({ open: false, logId: null });
    const [openLogId, setOpenLogId] = useState(null);

    useEffect(() => {
        if (location.state?.selectedClientName) {
            const target = clients.find(c => c.name === location.state.selectedClientName);
            if (target) setSelectedId(target.id);
        }
    }, [location.state, clients]);

    const filtered = clients.filter((c) => c.name.includes(search));
    const client = clients.find((c) => c.id === selectedId) || clients[0];

    const handleTabClick = (tabId) => {
        setActiveTab(tabId);
        if (tabId === 'home') navigate('/home');
        else if (tabId === 'reservation') navigate('/reservation');
        else if (tabId === 'client') navigate('/client');
        else if (tabId === 'inquiry') navigate('/inquiry');
        else if (tabId === 'mypage') navigate('/mypage');
    };

    const handleSaveLog = () => {
        const content = logModal.content.trim();
        if (!content) return alert('내용을 입력해주세요.');
        setClients(prev => prev.map(c => {
            if (c.id !== selectedId) return c;
            if (logModal.editId) {
                return { ...c, logs: c.logs.map(l => l.id === logModal.editId ? { ...l, content } : l) };
            }
            const newLog = { id: Date.now(), date: new Date().toLocaleDateString('ko-KR').slice(0, -1), title: `${c.logs.length + 1}회차 상담 일지`, content };
            return { ...c, logs: [newLog, ...c.logs] };
        }));
        setLogModal({ open: false, editId: null, content: '' });
    };

    const handleDeleteLog = () => {
        setClients(prev => prev.map(c => c.id === selectedId ? { ...c, logs: c.logs.filter(l => l.id !== deleteModal.logId) } : c));
        setDeleteModal({ open: false, logId: null });
        setOpenLogId(null);
    };

    return (
        <div className="cc-wrapper">
            <Header activeTab={activeTab} setActiveTab={setActiveTab} userName={userName} setUserName={setUserName} isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />

            <div className="cc-container">
                <aside className={`cc-sidebar ${isMobileListOpen ? 'is-open' : 'is-closed'}`}>
                    <div className="cc-sidebar__header" onClick={() => setIsMobileListOpen(!isMobileListOpen)}>
                        <h3 className="cc-sidebar__title">내담자 관리</h3>
                        <span className="cc-mobile-toggle">{isMobileListOpen ? '접기 ▲' : '목록 보기 ▼'}</span>
                    </div>
                    <div className="cc-sidebar-content">
                        <input className="cc-search" placeholder="이름 검색..." value={search} onChange={(e) => setSearch(e.target.value)} />
                        <ul className="cc-client-list">
                            {filtered.map((c) => (
                                <li key={c.id} className={`cc-client-item${selectedId === c.id ? ' is-active' : ''}`} onClick={() => { setSelectedId(c.id); setOpenLogId(null); setIsMobileListOpen(false); }}>
                                    <span className={`cc-dot ${STATUS_CLASS[c.status]}`} />
                                    <div className="cc-client-info">
                                        <strong>{c.name}</strong>
                                        <span>{c.birth} · {c.gender}</span>
                                    </div>
                                    <span className={`cc-status-badge ${STATUS_CLASS[c.status]}`}>{c.status}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </aside>

                <main className="cc-main">
                    <div className="cc-profile-card">
                        <div className="cc-profile-info">
                            <span className={`cc-status-badge-lg ${STATUS_CLASS[client.status]}`}>{client.status}</span>
                            <h2>{client.name} <small>{client.gender} · {client.birth}</small></h2>
                            <p>{client.phone}</p>
                        </div>
                        <div className="cc-profile-actions">
                            <button className="cc-btn cc-btn--outline" onClick={() => setSurveyModal(true)}>사전 설문지 확인</button>
                            <button className="cc-btn cc-btn--primary" onClick={() => setLogModal({ open: true, editId: null, content: '' })}>+ 새 일지 작성</button>
                        </div>
                    </div>

                    <section className="cc-history">
                        <div className="cc-section-header">
                            <h3>전체 상담 히스토리 <span className="cc-count">{client.logs.length}건</span></h3>
                        </div>
                        {client.logs.length === 0 ? (
                            <div className="cc-empty">상담 기록이 없습니다.</div>
                        ) : (
                            <div className="cc-log-list">
                                {client.logs.map((log) => (
                                    <div key={log.id} className={`cc-accordion-item${openLogId === log.id ? ' is-open' : ''}`}>
                                        <div className="cc-accordion-header" onClick={() => setOpenLogId(openLogId === log.id ? null : log.id)}>
                                            <div className="cc-accordion-left">
                                                <span className="cc-accordion-arrow">{openLogId === log.id ? '▾' : '▸'}</span>
                                                <span className="cc-accordion-title">{log.title}</span>
                                                <span className="cc-log-date">{log.date}</span>
                                            </div>
                                            <div className="cc-log-card-actions" onClick={e => e.stopPropagation()}>
                                                <button onClick={() => setLogModal({ open: true, editId: log.id, content: log.content })}>수정</button>
                                                <button onClick={() => setDeleteModal({ open: true, logId: log.id })}>삭제</button>
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

                <aside className="cc-utility">
                    <div className="cc-util-box">
                        <h4>주요 키워드</h4>
                        <div className="cc-keywords">
                            {client.keywords.map((k, i) => <span key={i} className="cc-keyword">#{k}</span>)}
                        </div>
                    </div>
                    <div className="cc-util-box">
                        <h4>Quick Memo</h4>
                        <textarea placeholder="다음 상담 시 확인할 내용..." className="cc-memo-area" />
                    </div>
                </aside>
            </div>

            {/* 일지 작성/수정 모달 (입력창 디자인 원상복구) */}
            {logModal.open && (
                <div className="cc-overlay" onClick={() => setLogModal({ open: false, editId: null, content: '' })}>
                    <div className="cc-modal" onClick={e => e.stopPropagation()}>
                        <h3 className="cc-modal-title">{client.name} 님 일지 {logModal.editId ? '수정' : '작성'}</h3>
                        <textarea 
                            className="cc-log-editor" 
                            value={logModal.content} 
                            onChange={(e) => setLogModal({...logModal, content: e.target.value})} 
                            placeholder="상담 내용을 입력하세요..." 
                        />
                        <div className="cc-modal__actions center">
                            <button className="cc-btn cc-btn--ghost" onClick={() => setLogModal({ open: false, editId: null, content: '' })}>취소</button>
                            <button className="cc-btn cc-btn--primary" onClick={handleSaveLog}>{logModal.editId ? '수정 완료' : '작성 완료'}</button>
                        </div>
                    </div>
                </div>
            )}

            {/* 사전 설문지 모달 */}
            {surveyModal && (
                <div className="cc-overlay" onClick={() => setSurveyModal(false)}>
                    <div className="cc-modal cc-survey-modal" onClick={e => e.stopPropagation()}>
                        <div className="cc-survey-header">
                            <span className="cc-survey-tag">Initial Survey</span>
                            <h3 className="cc-modal-title">사전 상담 질문지</h3>
                            <p className="cc-survey-user">{client.name} 내담자님</p>
                        </div>
                        <div className="cc-survey-body">
                            <div className="cc-survey-group"><label>Q1. 상담을 신청하게 된 구체적인 계기는 무엇인가요?</label><div className="cc-survey-ans">{client.survey.reason}</div></div>
                            <div className="cc-survey-group"><label>Q2. 이전에 상담을 받아보신 경험이 있으신가요?</label><div className="cc-survey-ans">{client.survey.prev}</div></div>
                            <div className="cc-survey-group"><label>Q3. 이번 상담을 통해 이루고 싶은 최종 목표는?</label><div className="cc-survey-ans">{client.survey.goal}</div></div>
                        </div>
                        <button className="cc-btn cc-btn--primary full" onClick={() => setSurveyModal(false)}>확인했습니다</button>
                    </div>
                </div>
            )}

            {/* 삭제 확인 모달 */}
            {deleteModal.open && (
                <div className="cc-overlay">
                    <div className="cc-modal cc-delete-modal">
                        <div className="cc-delete-header"><div className="cc-warn-circle">!</div><h3>일지 삭제</h3></div>
                        <p className="cc-delete-msg">정말 이 상담 일지를 삭제하시겠습니까?<br/>삭제된 데이터는 다시 복구할 수 없습니다.</p>
                        <div className="cc-modal__actions stretch">
                            <button className="cc-btn cc-btn--ghost" onClick={() => setDeleteModal({ open: false, logId: null })}>취소</button>
                            <button className="cc-btn cc-btn--danger" onClick={handleDeleteLog}>삭제하기</button>
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