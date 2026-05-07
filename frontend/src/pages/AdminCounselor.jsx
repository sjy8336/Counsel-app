import React, { useState } from 'react';
import '../static/AdminCounselor.css';

const AdminCounselor = () => {
  const [activeMenu, setActiveMenu] = useState('counselor'); 
  const [viewMode, setViewMode] = useState('list');
  const [selectedCounselor, setSelectedCounselor] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // 상담사 데이터 (기본정보, 일정, 미입력 안내 포함)
  const pendingCounselors = [
    { 
      id: 1, name: "김철수", email: "chulsoo@mindwell.com", center: "마음건강소", address: "미기재",
      specialties: ["개인심리", "번아웃"], education: "심리학 석사", experience: "상담 경력 5년", certificates: "1급 자격증",
      schedule: { "월": "09:00~18:00", "수": "09:00~18:00" }
    },
    { id: 2, name: "이영희", email: "young@mindwell.com", status: "대기" }
  ];

  // 회원 데이터 (가입일, 최근접속, 상담횟수 등 추가)
  const memberList = [
    { id: 1, name: "홍길동", email: "hong@gmail.com", type: "일반", joinDate: "2024-03-01", lastLogin: "2024-05-06", consultCount: 3, status: "활성" },
    { id: 2, name: "김철수", email: "chulsoo@test.com", type: "상담사", joinDate: "2024-04-15", lastLogin: "2024-05-07", consultCount: 0, status: "승인대기" },
    { id: 3, name: "이영희", email: "young@test.com", type: "상담사", joinDate: "2024-05-01", lastLogin: "2024-05-01", consultCount: 0, status: "승인대기" }
  ];

  const renderValue = (val) => val && val !== "미기재" ? val : <span style={{color: '#cbd5e1', fontStyle: 'italic'}}>미입력</span>;

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-logo" style={{fontSize:'22px', fontWeight:'800', marginBottom:'40px'}}>MindWell <span style={{fontSize:'14px', color:'#8BA888'}}>Admin</span></div>
        <nav>
          <div className={`admin-nav-item ${activeMenu === 'counselor' ? 'active' : ''}`} onClick={() => {setActiveMenu('counselor'); setViewMode('list');}}>상담사 승인 관리</div>
          <div className={`admin-nav-item ${activeMenu === 'member' ? 'active' : ''}`} onClick={() => setActiveMenu('member')}>회원 데이터 조회</div>
        </nav>
      </aside>

      <main className="admin-main-content">
        {activeMenu === 'counselor' ? (
          viewMode === 'list' ? (
            <div className="admin-content-card">
              <h2 style={{fontSize:'24px', fontWeight:'800', marginBottom:'10px'}}>상담사 승인 대기 목록</h2>
              <p style={{color:'#64748b', marginBottom:'20px'}}>새로운 전문가 프로필을 검토하고 승인 여부를 결정하세요.</p>
              <table className="admin-table">
                <thead><tr><th>성함</th><th>이메일</th><th>상태</th><th>관리</th></tr></thead>
                <tbody>
                  {pendingCounselors.map(c => (
                    <tr key={c.id}>
                      <td style={{fontWeight:'700'}}>{c.name}</td>
                      <td>{c.email}</td>
                      <td><span style={{backgroundColor:'#FAF7F2', color:'#F59E0B', padding:'4px 8px', borderRadius:'6px', fontSize:'12px', fontWeight:'bold'}}>대기</span></td>
                      <td><button className="btn-examine" onClick={() => {setSelectedCounselor(c); setViewMode('detail');}}>상세보기</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            /* 상세 보기 생략 (주간 일정 및 반려 모달 로직 포함된 이전 코드 구조 유지) */
            <div className="admin-content-card">
              <button className="btn-examine" onClick={() => setViewMode('list')} style={{marginBottom:'20px'}}>← 목록으로 돌아가기</button>
              <h2 style={{fontSize:'24px', marginBottom:'30px'}}>{selectedCounselor.name} 상담사 프로필 심사</h2>
              
              <div className="info-section-grid">
                <div className="detail-box">
                  <h4>1. 기본 정보 및 상담소</h4>
                  <p>상담소명: {renderValue(selectedCounselor.center)}</p>
                  <p>상담소 주소: {renderValue(selectedCounselor.address)}</p>
                </div>
                <div className="detail-box">
                  <h4>2. 전문 분야</h4>
                  <div style={{display:'flex', gap:'8px'}}>
                    {selectedCounselor.specialties?.map(s => <span key={s} style={{background:'#E1F5FE', padding:'5px 12px', borderRadius:'20px', fontSize:'13px'}}>{s}</span>) || "없음"}
                  </div>
                </div>
                <div className="detail-box" style={{gridColumn:'span 2'}}>
                  <h4>3. 주간 상담 일정</h4>
                  <div className="schedule-mini-grid">
                    {['월', '화', '수', '목', '금'].map(day => (
                      <div key={day} className="schedule-day-item">
                        <div style={{color:'#8BA888', fontWeight:'bold'}}>{day}</div>
                        <div>{selectedCounselor.schedule?.[day] || "휴무"}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div style={{marginTop:'40px', display:'flex', gap:'15px', justifyContent:'center'}}>
                <button className="btn-examine" style={{borderColor:'#FDA4AF', color:'#FDA4AF'}} onClick={() => setShowRejectModal(true)}>승인 반려</button>
                <button className="btn-examine" style={{backgroundColor:'#8BA888', color:'white'}} onClick={() => alert('승인 완료')}>최종 승인</button>
              </div>
            </div>
          )
        ) : (
          /* 회원 데이터 조회 UI 개선 */
          <div className="admin-content-card">
            <h2 style={{fontSize:'24px', fontWeight:'800', marginBottom:'25px'}}>회원 데이터 조회</h2>
            
            <div className="admin-filter-bar">
              <input type="text" className="admin-search-input" placeholder="이름 또는 이메일로 검색..." onChange={(e) => setSearchTerm(e.target.value)} />
              <select style={{padding:'10px', borderRadius:'10px', border:'1px solid #E2E8F0'}}>
                <option>전체 회원</option>
                <option>일반 회원</option>
                <option>상담사</option>
              </select>
            </div>

            <table className="admin-table">
              <thead>
                <tr>
                  <th>이름</th>
                  <th>이메일</th>
                  <th>구분</th>
                  <th>가입일</th>
                  <th>최근 접속</th>
                  <th>상담 횟수</th>
                  <th>상태</th>
                </tr>
              </thead>
              <tbody>
                {memberList.filter(m => m.name.includes(searchTerm) || m.email.includes(searchTerm)).map(m => (
                  <tr key={m.id}>
                    <td style={{fontWeight:'700'}}>{m.name}</td>
                    <td>{m.email}</td>
                    <td><span style={{color: m.type==='상담사'?'#8BA888':'#1E293B', fontWeight:'600'}}>{m.type}</span></td>
                    <td>{m.joinDate}</td>
                    <td>{m.lastLogin}</td>
                    <td style={{textAlign:'center'}}>{m.consultCount}회</td>
                    <td><span style={{fontSize:'12px', padding:'3px 8px', borderRadius:'4px', background:'#F1F5F9'}}>{m.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* 반려 모달 생략 (동일) */}
    </div>
  );
};

export default AdminCounselor;