import React, { useState, useMemo, useEffect } from 'react'; // useEffect 추가
import { useLocation } from 'react-router-dom'; // useLocation 추가
import Header from '../components/header.jsx';
import Footer from '../components/footer.jsx';
import MobileTap from '../components/mobileTap.jsx';
import '../static/CounselorClient.css';

// ── 더미 데이터 ──────────────────────────────────────────────
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
            {
                id: 101,
                date: '2026.05.10',
                title: '1회차 상담 일지',
                content: '거절 연습 및 자아 경계 설정 주제로 진행. 직장 내 대인관계 어려움 호소.',
            },
            {
                id: 102,
                date: '2026.05.17',
                title: '2회차 상담 일지',
                content: '지난 주 실천 과제 점검. 거절 상황 역할극 진행, 불안 반응 관찰.',
            },
        ],
    },
    {
        id: 2,
        name: '최민수',
        birth: '1988.11.20',
        gender: '남',
        phone: '010-9876-5432',
        status: '대기 중',
        keywords: ['번아웃', '직장스트레스', '수면장애'],
        survey: { reason: '직장/학업 스트레스', prev: '없음', goal: '무기력 해소와 일상 회복이 목표입니다.' },
        logs: [],
    },
    {
        id: 3,
        name: '박지연',
        birth: '2001.03.05',
        gender: '여',
        phone: '010-5555-4444',
        status: '진행 중',
        keywords: ['학업스트레스', '시험불안', '집중력'],
        survey: { reason: '직장/학업 스트레스', prev: '있음', goal: '시험 불안을 줄이고 집중력을 높이고 싶습니다.' },
        logs: [
            {
                id: 301,
                date: '2026.05.08',
                title: '1회차 상담 일지',
                content: '시험 불안과 완벽주의 성향 탐색. 인지왜곡 패턴 확인.',
            },
        ],
    },
    {
        id: 4,
        name: '김지아',
        birth: '1992.08.14',
        gender: '여',
        phone: '010-1111-2222',
        status: '종료',
        keywords: ['자존감', '대인관계', '자기이해'],
        survey: { reason: '자기이해 및 성장', prev: '없음', goal: '자존감 회복과 나다운 삶을 찾고 싶습니다.' },
        logs: [
            {
                id: 401,
                date: '2026.03.01',
                title: '1회차 상담 일지',
                content: '자존감 관련 핵심 신념 탐색. 어린 시절 경험과의 연결.',
            },
            {
                id: 402,
                date: '2026.04.20',
                title: '최종(10회차) 상담 일지',
                content: '10회기 프로그램 마무리. 변화 점검 및 종결 작업 진행.',
            },
        ],
    },
    {
        id: 5,
        name: '이하늘',
        birth: '1998.02.25',
        gender: '남',
        phone: '010-3333-7777',
        status: '대기 중',
        keywords: ['공황장애', '불안', '일상복귀'],
        survey: { reason: '우울/불안', prev: '있음', goal: '공황 증상을 조절하고 일상으로 복귀하고 싶습니다.' },
        logs: [],
    },
    {
        id: 6,
        name: '정민우',
        birth: '1985.12.01',
        gender: '남',
        phone: '010-8888-9999',
        status: '진행 중',
        keywords: ['가족갈등', '부부관계', '대화법'],
        survey: { reason: '갈등', prev: '없음', goal: '배우자와의 소통 방식을 개선하고 관계 회복을 원합니다.' },
        logs: [
            {
                id: 601,
                date: '2026.05.05',
                title: '1회차 상담 일지',
                content: '부부 갈등 패턴 파악. 비난-방어 사이클 교육 및 공감 대화법 소개.',
            },
            {
                id: 602,
                date: '2026.05.12',
                title: '2회차 상담 일지',
                content: '감정 표현 연습. 배우자 입장 취해보기 역할극 진행.',
            },
        ],
    },
];

const STATUS_CLASS = { '진행 중': 'status-ing', '대기 중': 'status-wait', 종료: 'status-end' };

const SURVEY_REASON_OPTIONS = ['우울/불안', '대인관계', '갈등', '직장/학업 스트레스', '자기이해 및 성장'];

// ── 컴포넌트 ─────────────────────────────────────────────────
const CounselorClient = ({ userName, setUserName, isLoggedIn, setIsLoggedIn }) => {
    const [activeTab, setActiveTab] = useState('client');
    const [search, setSearch] = useState('');
    const [selectedId, setSelectedId] = useState(1);
    const [clients, setClients] = useState(INIT_CLIENTS);

    // 페이지 이동 시 넘어온 데이터 확인용[cite: 4]
    const location = useLocation();

    // 모달 상태
    const [logModal, setLogModal] = useState({ open: false, editId: null, content: '' });
    const [surveyModal, setSurveyModal] = useState(false);
    const [deleteModal, setDeleteModal] = useState({ open: false, logId: null });

    const [openLogId, setOpenLogId] = useState(null);
    const [quickMemo, setQuickMemo] = useState('');

    // 추가된 로직: 데이터가 넘어왔을 때 자동으로 해당 내담자 선택[cite: 4]
    useEffect(() => {
        if (location.state && location.state.selectedClientName) {
            const targetName = location.state.selectedClientName;
            // 이름이 일치하는 내담자 찾기
            const targetClient = clients.find((c) => c.name === targetName);
            
            if (targetClient) {
                setSelectedId(targetClient.id);
                setSearch(targetName); // 검색창에도 해당 이름을 넣어 필터링되게 함
            }
        }
    }, [location.state, clients]); // location.state나 clients 정보가 바뀔 때마다 실행[cite: 4]

    const filtered = clients.filter((c) => c.name.includes(search));
    const client = clients.find((c) => c.id === selectedId);

    // 자동 키워드 추출 (설문 + 일지 합산)
    const autoKeywords = useMemo(() => {
        if (!client) return [];
        const text = [client.survey.reason, client.survey.goal, ...client.logs.map((l) => l.content)].join(' ');
        return client.keywords.slice(0, 5); // 더미에서는 미리 지정된 키워드 사용
    }, [client]);

    // 일지 저장
    const handleSaveLog = () => {
        const content = logModal.content.trim();
        if (!content) return alert('내용을 입력해주세요.');
        setClients((prev) =>
            prev.map((c) => {
                if (c.id !== selectedId) return c;
                if (logModal.editId) {
                    return { ...c, logs: c.logs.map((l) => (l.id === logModal.editId ? { ...l, content } : l)) };
                }
                const newLog = {
                    id: Date.now(),
                    date: new Date()
                        .toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' })
                        .replace(/\. /g, '.')
                        .replace('.', ''),
                    title: `${c.logs.length + 1}회차 상담 일지`,
                    content,
                };
                return { ...c, logs: [newLog, ...c.logs] };
            })
        );
        setLogModal({ open: false, editId: null, content: '' });
    };

    const handleDeleteLog = () => {
        setClients((prev) =>
            prev.map((c) =>
                c.id === selectedId ? { ...c, logs: c.logs.filter((l) => l.id !== deleteModal.logId) } : c
            )
        );
        setDeleteModal({ open: false, logId: null });
        setOpenLogId(null);
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
                {/* ── 좌측 내담자 목록 ── */}
                <aside className="cc-sidebar">
                    <h3 className="cc-sidebar__title">내담자 관리</h3>
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
                                }}
                            >
                                <span className={`cc-dot ${STATUS_CLASS[c.status]}`} />
                                <div>
                                    <strong>{c.name}</strong>
                                    <span>
                                        {c.birth} · {c.gender}
                                    </span>
                                </div>
                                <span className={`cc-status-badge ${STATUS_CLASS[c.status]}`}>{c.status}</span>
                            </li>
                        ))}
                    </ul>
                </aside>

                {/* ── 중앙 히스토리 ── */}
                <main className="cc-main">
                    {/* 프로필 카드 */}
                    <div className="cc-profile-card">
                        <div className="cc-profile-info">
                            <span className={`cc-status-badge large ${STATUS_CLASS[client.status]}`}>
                                {client.status}
                            </span>
                            <h2>
                                {client.name}{' '}
                                <small>
                                    {client.gender} · {client.birth} | {client.phone}
                                </small>
                            </h2>
                            <button className="cc-btn cc-btn--outline" onClick={() => setSurveyModal(true)}>
                                📋 사전 설문지 확인
                            </button>
                        </div>
                        <button
                            className="cc-btn cc-btn--primary"
                            onClick={() => setLogModal({ open: true, editId: null, content: '' })}
                        >
                            + 새 일지 작성
                        </button>
                    </div>

                    {/* 히스토리 목록 */}
                    <section className="cc-history">
                        <h3>
                            전체 상담 히스토리 <span className="cc-count">{client.logs.length}건</span>
                        </h3>
                        {client.logs.length === 0 ? (
                            <div className="cc-empty">
                                <p>아직 상담 기록이 없습니다.</p>
                                <span>새 일지 작성 버튼으로 첫 기록을 남겨보세요.</span>
                            </div>
                        ) : (
                            client.logs.map((log) => (
                                <div key={log.id} className="cc-log-group">
                                    <div
                                        className={`cc-log-card${openLogId === log.id ? ' is-open' : ''}`}
                                        onClick={() => setOpenLogId(openLogId === log.id ? null : log.id)}
                                    >
                                        <span className="cc-log-dot" />
                                        <div className="cc-log-text">
                                            <span className="cc-log-date">{log.date}</span>
                                            <h4>{log.title}</h4>
                                            <p>
                                                {log.content.substring(0, 40)}
                                                {log.content.length > 40 && '…'}
                                            </p>
                                        </div>
                                        <span className="cc-chevron">{openLogId === log.id ? '▲' : '▼'}</span>
                                    </div>

                                    {openLogId === log.id && (
                                        <div className="cc-log-detail fade-in">
                                            <div className="cc-log-detail__actions">
                                                <button
                                                    className="cc-btn-sm cc-btn-sm--edit"
                                                    onClick={() =>
                                                        setLogModal({
                                                            open: true,
                                                            editId: log.id,
                                                            content: log.content,
                                                        })
                                                    }
                                                >
                                                    수정
                                                </button>
                                                <button
                                                    className="cc-btn-sm cc-btn-sm--delete"
                                                    onClick={() => setDeleteModal({ open: true, logId: log.id })}
                                                >
                                                    삭제
                                                </button>
                                            </div>
                                            <div className="cc-log-detail__body">{log.content}</div>
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </section>
                </main>

                {/* ── 우측 유틸리티 ── */}
                <aside className="cc-utility">
                    <div className="cc-utility-box">
                        <h4>주요 키워드</h4>
                        <div className="cc-keywords">
                            {autoKeywords.map((kw, i) => (
                                <span key={i} className="cc-keyword">
                                    #{kw}
                                </span>
                            ))}
                        </div>
                    </div>
                    <div className="cc-utility-box">
                        <h4>Quick Memo</h4>
                        <textarea
                            className="cc-memo"
                            value={quickMemo}
                            onChange={(e) => setQuickMemo(e.target.value)}
                            placeholder="다음 상담 시 꼭 확인할 내용..."
                        />
                    </div>
                </aside>
            </div>

            {/* ── 사전 설문지 모달 ── */}
            {surveyModal && (
                <div className="cc-overlay" onClick={() => setSurveyModal(false)}>
                    <div className="cc-modal survey-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="cc-modal__header">
                            <h3>사전 설문지</h3>
                            <span className="cc-modal__client">{client.name} 내담자</span>
                        </div>
                        <div className="cc-survey-list">
                            <div className="cc-survey-item">
                                <label>1. 상담을 신청하게 된 주요 이유</label>
                                <div className="cc-answer-box">{client.survey.reason}</div>
                            </div>
                            <div className="cc-survey-item">
                                <label>2. 이전 상담 경험 유무</label>
                                <div className="cc-answer-box">{client.survey.prev}</div>
                            </div>
                            <div className="cc-survey-item">
                                <label>3. 상담을 통해 얻고 싶은 구체적인 목표</label>
                                <div className="cc-answer-box">{client.survey.goal}</div>
                            </div>
                        </div>
                        <button className="cc-btn cc-btn--primary full" onClick={() => setSurveyModal(false)}>
                            확인
                        </button>
                    </div>
                </div>
            )}

            {/* ── 일지 작성/수정 모달 ── */}
            {logModal.open && (
                <div className="cc-overlay">
                    <div className="cc-modal log-modal slide-up">
                        <h3>
                            {client.name} 님 일지 {logModal.editId ? '수정' : '작성'}
                        </h3>
                        <textarea
                            className="cc-log-editor"
                            value={logModal.content}
                            onChange={(e) => setLogModal((m) => ({ ...m, content: e.target.value }))}
                            placeholder="상담 내용을 상세히 기록하세요..."
                        />
                        <div className="cc-modal__actions">
                            <button
                                className="cc-btn cc-btn--ghost"
                                onClick={() => setLogModal({ open: false, editId: null, content: '' })}
                            >
                                취소
                            </button>
                            <button className="cc-btn cc-btn--primary" onClick={handleSaveLog}>
                                {logModal.editId ? '수정 완료' : '작성 완료'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── 삭제 확인 모달 ── */}
            {deleteModal.open && (
                <div className="cc-overlay">
                    <div className="cc-modal delete-modal">
                        <div className="cc-delete-icon">🗑️</div>
                        <h3>상담 일지를 삭제하시겠습니까?</h3>
                        <p>
                            삭제된 기록은 복구할 수 없습니다.
                            <br />
                            신중하게 결정해 주세요.
                        </p>
                        <div className="cc-modal__actions column">
                            <button className="cc-btn cc-btn--danger" onClick={handleDeleteLog}>
                                삭제하기
                            </button>
                            <button
                                className="cc-btn cc-btn--ghost"
                                onClick={() => setDeleteModal({ open: false, logId: null })}
                            >
                                취소
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <MobileTap activeTab={activeTab} setActiveTab={setActiveTab} />
            <Footer />
        </div>
    );
};

export default CounselorClient;