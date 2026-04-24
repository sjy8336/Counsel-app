import React, { useState } from 'react';
import Header from '../components/header.jsx'; // 헤더 컴포넌트 호출
import Footer from '../components/footer.jsx';
import '../static/CounselorClient.css';

const CounselorClient = () => {
  // 내담자별 데이터 (검색 및 선택 연동용)
  const [allClients] = useState([
    { id: 1, name: "이은지", birth: "1995.06.12", gender: "여", status: "진행 중", logs: [
      { id: 101, date: '2026.05.10', title: '5회차 상담 일지', content: '거절 연습을 통한 자아 경계 설정...', details: '직장 내 대인관계 스트레스를 호소함.' },
      { id: 102, date: '2026.05.08', title: '4회차 상담 일지', content: '가족 간의 대화법 개선 및 감정 조절...', details: '어머니와의 대화에서 발생하는 분노 조절 기제 확인.' }
    ]},
    { id: 2, name: "최민수", birth: "1988.11.20", gender: "남", status: "진행 중", logs: [
      { id: 201, date: '2026.05.12', title: '1회차 초기 면접', content: '전반적인 불안 증세 확인', details: '내담자의 초기 래포 형성 및 목표 설정.' }
    ]},
    { id: 3, name: "박지연", birth: "2001.03.05", gender: "여", status: "대기 중", logs: [] }
  ]);

  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);

  // [기능] 검색 필터
  const filteredClients = allClients.filter(c => c.name.includes(search));
  const currentClient = allClients.find(c => c.id === selectedId);

  // [기능] 저장 완료 알림 팝업 핸들러
  const handleSave = () => {
    alert("작성 완료되었습니다.");
    setIsModalOpen(false);
  };

  return (
    <div className="manage-wrapper">
      <Header activeTab="manage" />
      
      <div className="manage-container">
        {/* 왼쪽: 내담자 관리 리스트 */}
        <aside className="client-list-side">
          <div className="side-header">
            <h3>내담자 관리</h3>
          </div>
          <input 
            className="search-input" 
            placeholder="내담자 이름 검색..." 
            onChange={(e) => setSearch(e.target.value)} 
          />
          <div className="list-items">
            {filteredClients.map(c => (
              <div 
                key={c.id} 
                className={`client-item ${selectedId === c.id ? 'active' : ''}`} 
                onClick={() => {setSelectedId(c.id); setSelectedLog(null);}}
              >
                <strong>{c.name}</strong>
                <span>{c.birth}</span>
              </div>
            ))}
          </div>
        </aside>

        {/* 중앙: 선택된 내담자 상담 히스토리 */}
        <main className="history-center">
          <div className="profile-summary-card">
            <div className="profile-info">
              {/* 진행 중/대기 중 상태별 클래스 동적 부여 */}
              <span className={`status-tag ${currentClient.status === '진행 중' ? 'status-ing' : 'status-wait'}`}>
                {currentClient.status}
              </span>
              <h2>{currentClient.name} 님 <small>{currentClient.birth} ({currentClient.gender})</small></h2>
            </div>
            <button className="btn-primary" onClick={() => setIsModalOpen(true)}>+ 새 일지 작성</button>
          </div>

          <div className="log-list-section">
            <h3>전체 상담 히스토리</h3>
            {currentClient.logs.length > 0 ? currentClient.logs.map(log => (
              <div 
                key={log.id} 
                className={`log-item-card ${selectedLog?.id === log.id ? 'selected' : ''}`}
                onClick={() => setSelectedLog(log)}
              >
                <div className="log-dot" />
                <div className="log-txt">
                  <span className="log-date">{log.date}</span>
                  <h4>{log.title}</h4>
                  <p>{log.content}</p>
                </div>
                {/* 상세보기 버튼 디자인 반영 */}
                <button className="btn-detail-view" onClick={(e) => { e.stopPropagation(); setSelectedLog(log); }}>
                  상세보기
                </button>
              </div>
            )) : (
              <div className="empty-msg-area">
                <p className="empty-msg">기록된 상담 내역이 없습니다.</p>
              </div>
            )}
            
            {/* 안내 문구를 히스토리 하단으로 이동 */}
            {!selectedLog && (
              <div className="info-guide-box">
                <p>히스토리에서 상담을 선택하면 상세 내용이 표시됩니다.</p>
              </div>
            )}
          </div>
        </main>

        {/* 오른쪽: 상세 정보 보기 */}
        <aside className="detail-view-side">
          {selectedLog ? (
            <div className="detail-panel fade-in">
              <h3>{selectedLog.title} 상세</h3>
              <div className="info-group">
                <label>상담 일자</label>
                <p>{selectedLog.date}</p>
              </div>
              <div className="info-group">
                <label>상세 상담 기록</label>
                <div className="memo-box">{selectedLog.details}</div>
              </div>
              {/* 상세 닫기 버튼 디자인 반영 */}
              <button className="btn-close-detail" onClick={() => setSelectedLog(null)}>상세 닫기</button>
            </div>
          ) : null}
        </aside>
      </div>

      {/* 새 일지 작성 모달 */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-inner slide-up">
            <h3>{currentClient.name} 님 상담 일지 작성</h3>
            <textarea placeholder="오늘 상담의 주요 내용과 변화를 기록하세요..." />
            <div className="modal-actions">
              {/* 모달 내 취소 및 저장 버튼 디자인 반영 */}
              <button className="btn-modal-cancel" onClick={() => setIsModalOpen(false)}>취소</button>
              <button className="btn-modal-save" onClick={handleSave}>작성 완료</button>
            </div>
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
};

export default CounselorClient;