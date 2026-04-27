import React, { useState } from 'react';
import Header from '../components/header.jsx';
import Footer from '../components/footer.jsx';
import MobileTap from '../components/mobileTap.jsx';
import '../static/CounselorClient.css';

const CounselorClient = () => {
    // 1. 상태 관리
    const [search, setSearch] = useState('');
    const [selectedId, setSelectedId] = useState(1);
    const [isLogModalOpen, setIsLogModalOpen] = useState(false);
    const [isSurveyModalOpen, setIsSurveyModalOpen] = useState(false);
    const [openLogId, setOpenLogId] = useState(null);
    const [activeTab, setActiveTab] = useState('client');
    const [quickMemo, setQuickMemo] = useState("");

    // 일지 작성을 위한 임시 텍스트 상태
    const [newLogContent, setNewLogContent] = useState("");
    const [editingLogId, setEditingLogId] = useState(null);

    // 2. 데이터 (상담 유무 간소화 및 일지 연동)
    const [allClients, setAllClients] = useState([
        {
            id: 1,
            name: '이은지',
            birth: '1995.06.12',
            gender: '여',
            phone: '010-1234-5678',
            status: '진행 중',
            keywords: ['#거절연습', '#자아경계', '#대인관계'],
            survey: {
                q1: "우울 / 대인관계",
                q2: "있음", // '몇 개월 전' 정보 삭제
                q3: "사람들과 대화할 때 느끼는 불안감을 낮추고, 거절하는 연습을 하고 싶어요."
            },
            logs: [
                { id: 101, date: '2026.05.10', title: '5회차 상담 일지', content: '거절 연습을 통한 자아 경계 설정...', details: '직장 내 대인관계 스트레스를 호소함. 실제 거절 시나리오를 통해 감정 분리 연습.' },
                { id: 102, date: '2026.05.08', title: '4회차 상담 일지', content: '가족 간의 대화법 개선...', details: '어머니와의 대화에서 발생하는 감정 기제 확인 및 중립적 대화 시도.' }
            ]
        }
    ]);

    const filteredClients = allClients.filter(c => c.name.includes(search));
    const currentClient = allClients.find(c => c.id === selectedId);

    // 3. 기능: 일지 저장 (추가 및 수정 통합)
    const handleSaveLog = () => {
        if (!newLogContent.trim()) return alert("내용을 입력해주세요.");

        const updatedClients = allClients.map(client => {
            if (client.id === selectedId) {
                if (editingLogId) {
                    // [수정 모드]
                    return {
                        ...client,
                        logs: client.logs.map(log => 
                            log.id === editingLogId ? { ...log, details: newLogContent, content: newLogContent.substring(0, 20) + "..." } : log
                        )
                    };
                } else {
                    // [신규 작성 모드]
                    const newLog = {
                        id: Date.now(),
                        date: new Date().toLocaleDateString(),
                        title: `${client.logs.length + 1}회차 상담 일지`,
                        content: newLogContent.substring(0, 20) + "...",
                        details: newLogContent
                    };
                    return { ...client, logs: [newLog, ...client.logs] };
                }
            }
            return client;
        });

        setAllClients(updatedClients);
        setIsLogModalOpen(false);
        setNewLogContent("");
        setEditingLogId(null);
        alert(editingLogId ? '수정되었습니다.' : '저장되었습니다.');
    };

    // 4. 기능: 수정 모달 열기
    const openEditModal = (log) => {
        setEditingLogId(log.id);
        setNewLogContent(log.details);
        setIsLogModalOpen(true);
    };

    return (
        <div className="manage-wrapper">
            <Header activeTab={activeTab} setActiveTab={setActiveTab} />
            <div className="manage-container">
                
                {/* 왼쪽: 내담자 리스트 (생략 - 기존 유지) */}
                <aside className="client-list-side">
                    <div className="side-header"><h3>내담자 관리</h3></div>
                    <input className="search-input" placeholder="이름 검색..." onChange={(e) => setSearch(e.target.value)} />
                    <div className="list-items">
                        {filteredClients.map(c => (
                            <div key={c.id} className={`client-item ${selectedId === c.id ? 'active' : ''}`} onClick={() => {setSelectedId(c.id); setOpenLogId(null);}}>
                                <strong>{c.name}</strong>
                                <span>{c.birth}</span>
                            </div>
                        ))}
                    </div>
                </aside>

                {/* 중앙: 차트 영역 */}
                <main className="history-center">
                    <div className="profile-summary-card">
                        <div className="profile-info">
                            <span className={`status-tag status-ing`}>{currentClient.status}</span>
                            <h2>{currentClient.name} 님 <small>{currentClient.birth} ({currentClient.gender}) | {currentClient.phone}</small></h2>
                            <button className="survey-view-btn" onClick={() => setIsSurveyModalOpen(true)}>📝 사전 설문지 확인</button>
                        </div>
                        <button className="btn-primary" onClick={() => {setEditingLogId(null); setNewLogContent(""); setIsLogModalOpen(true);}}>+ 새 일지 작성</button>
                    </div>

                    <div className="log-list-section">
                        <h3>전체 상담 히스토리</h3>
                        {currentClient.logs.map(log => (
                            <div key={log.id} className="log-accordion-group">
                                <div className={`log-item-card ${openLogId === log.id ? 'selected' : ''}`} onClick={() => setOpenLogId(openLogId === log.id ? null : log.id)}>
                                    <div className="log-dot" />
                                    <div className="log-txt">
                                        <span className="log-date">{log.date}</span>
                                        <h4>{log.title}</h4>
                                        <p>{log.content}</p>
                                    </div>
                                    <button className="btn-detail-view">{openLogId === log.id ? '닫기' : '상세보기'}</button>
                                </div>
                                {openLogId === log.id && (
                                    <div className="log-detail-expanded fade-in">
                                        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                                            <strong>상세 기록</strong>
                                            <button className="btn-edit-small" onClick={() => openEditModal(log)}> 수정하기</button>
                                        </div>
                                        <p style={{marginTop: '12px'}}>{log.details}</p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </main>

                {/* 우측 사이드바 (기존 유지) */}
                <aside className="right-utility-side">
                    <div className="utility-box">
                        <h3>주요 키워드</h3>
                        {currentClient.keywords.map((kw, i) => <span key={i} className="keyword-tag">{kw}</span>)}
                    </div>
                    <div className="utility-box">
                        <h3>Quick Memo</h3>
                        <textarea className="quick-memo-input" placeholder="간단한 메모..." value={quickMemo} onChange={(e) => setQuickMemo(e.target.value)} />
                    </div>
                </aside>
            </div>

            {/* 모달: 일지 작성/수정 (통합) */}
            {isLogModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-inner slide-up">
                        <h3>{currentClient.name} 님 상담 일지 {editingLogId ? '수정' : '작성'}</h3>
                        <textarea 
                            value={newLogContent} 
                            onChange={(e) => setNewLogContent(e.target.value)} 
                            placeholder="상담 내용을 상세히 기록하세요..." 
                        />
                        <div className="modal-actions">
                            <button className="btn-modal-cancel" onClick={() => setIsLogModalOpen(false)}>취소</button>
                            <button className="btn-modal-save" onClick={handleSaveLog}>
                                {editingLogId ? '수정 완료' : '작성 완료'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* 모달: 설문지 (기존 유지) */}
            {isSurveyModalOpen && (
                <div className="modal-overlay" onClick={() => setIsSurveyModalOpen(false)}>
                    <div className="modal-inner slide-up" onClick={e => e.stopPropagation()}>
                        <h3>사전 설문지 상세</h3>
                        <div className="info-group">
                            <label>1. 상담 이유</label>
                            <div className="memo-box">{currentClient.survey.q1}</div>
                        </div>
                        <div className="info-group">
                            <label>2. 상담 경험 유무</label>
                            <div className="memo-box">{currentClient.survey.q2}</div>
                        </div>
                        <div className="info-group">
                            <label>3. 구체적 목표</label>
                            <div className="memo-box">{currentClient.survey.q3}</div>
                        </div>
                        <button className="btn-close-detail" onClick={() => setIsSurveyModalOpen(false)}>닫기</button>
                    </div>
                </div>
            )}

            <MobileTap activeTab={activeTab} setActiveTab={setActiveTab} />
            <Footer />
        </div>
    );
};

export default CounselorClient;