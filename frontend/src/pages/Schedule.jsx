import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, User, MapPin } from 'lucide-react'; // Video 제거
import Header from '../components/header';
import Footer from '../components/footer';
import '../static/Schedule.css'; 

const Schedule = () => {
  // 1. 상태 관리: 예약 데이터 및 중복 방지 로딩 상태
  const [reservations, setReservations] = useState([
    { id: 1, name: '이소현', status: 'pending', time: '2026.05.20 14:00', issue: '대인관계 스트레스', count: 1, isRegular: false, memo: '첫 상담이라 긴장을 많이 하심.' },
    { id: 2, name: '김태현', status: 'confirmed', time: '2026.05.25 11:00', issue: '진로 고민', count: 5, isRegular: true, memo: '매주 목요일 고정 상담.' },
  ]);
  const [loadingId, setLoadingId] = useState(null);

  // 2. 중복 예약 방지 트랜잭션 로직
  const handleApprove = async (id) => {
    if (loadingId) return; // 이미 처리 중이면 중단
    setLoadingId(id); // 즉시 버튼 비활성화 (Lock)

    try {
      // 서버 트랜잭션 시뮬레이션
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setReservations(prev => 
        prev.map(res => res.id === id ? { ...res, status: 'confirmed' } : res)
      );
      alert("예약이 확정되었습니다. 중복 예약 검증 완료.");
    } catch (error) {
      alert("이미 다른 예약이 확정된 시간대입니다.");
    } finally {
      setLoadingId(null); // Lock 해제
    }
  };

  return (
    /* header 어쩌구 하는 기존 코드는 이 아래나 위에 유지될 수 있도록 감싸는 root class를 사용하세요 */
    <div className="schedule-page-root">
      <div className="schedule-container">
        
        {/* 상단 현황 섹션 */}
        <header className="schedule-header-section">
          <h2>일정 관리 <span className="counselor-badge">전문가용</span></h2>
          <div className="summary-cards">
            <div className="summary-item">오늘 상담 <strong>3건</strong></div>
            <div className="summary-item pending">미승인 예약 <strong>{reservations.filter(r => r.status === 'pending').length}건</strong></div>
          </div>
        </header>

        {/* 필터 탭 (기존 컬러 팔레트 적용 예정) */}
        <div className="filter-group">
          <button className="active">전체</button>
          <button>예약 대기</button>
          <button>예약 확정</button>
          <button>상담 완료</button>
        </div>

        {/* 내담자 리스트 (리스트 형태 유지) */}
        <div className="schedule-list">
          {reservations.map((item) => (
            <div key={item.id} className={`schedule-item ${item.status}`}>
              <div className="item-info">
                <div className="client-header">
                  <span className="client-name">{item.name} 내담자</span>
                  {item.isRegular && <span className="tag-regular">단골</span>}
                  <span className="session-count">{item.count}회기</span>
                </div>
                <div className="issue-text">주요 호소: {item.issue}</div>
                <div className="schedule-time">{item.time}</div>
                <div className="secret-memo">📌 메모: {item.memo}</div>
              </div>

              <div className="item-actions">
                {item.status === 'pending' ? (
                  <div className="btn-row">
                    <button 
                      className="approve-btn" 
                      disabled={loadingId === item.id}
                      onClick={() => handleApprove(item.id)}
                    >
                      {loadingId === item.id ? '확인 중...' : '예약 승인'}
                    </button>
                    <button className="reject-btn">거절</button>
                  </div>
                ) : (
                  <span className="status-confirmed-text">예약 확정됨</span>
                )}
                <button className="write-note-btn">상담 노트 작성</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Schedule;