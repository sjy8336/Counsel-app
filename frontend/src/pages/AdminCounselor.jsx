import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, ClipboardCheck, ChevronRight, ArrowLeft,
  CheckCircle, XCircle, Clock, MapPin, GraduationCap,
  Briefcase, Award, Calendar, Mail, Building2,
  ShieldCheck, LogOut, Search, Filter, BarChart3, UserCheck, AlertCircle,
  FileText, CircleDollarSign
} from 'lucide-react';
import '../static/AdminCounselor.css';

const AdminCounselor = () => {
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState('counselor');
  const [viewMode, setViewMode] = useState('list');
  const [selectedCounselor, setSelectedCounselor] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('경력 증빙 서류가 불충분합니다. 보완 후 재등록 부탁드립니다.');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const defaultRejectReason = '경력 증빙 서류가 불충분합니다. 보완 후 재등록 부탁드립니다.';

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || user.role !== 'admin') {
      alert('관리자 권한이 없습니다.');
      navigate('/');
    }
  }, [navigate]);

  // ✅ pendingList → useState로 변경 (승인/반려 시 실시간 반영)
  const [counselors, setCounselors] = useState([
    {
      id: 1, name: '김철수', email: 'chulsoo@mindwell.com', center: '마음건강 상담소', address: '서울시 강남구',
      specialties: ['개인심리', '번아웃', '우울증'], education: '심리학 석사 (서울대)', experience: '상담 경력 5년',
      certificates: '상담사 1급 자격증', appliedDate: '2024-05-01', status: '대기', fee: 80000,
      introduction: '안녕하세요. 저는 개인심리 및 번아웃 상담을 전문으로 하는 김철수 상담사입니다. 5년간의 상담 경험을 바탕으로 내담자분들이 일상에서 균형을 찾을 수 있도록 돕고 있습니다. 따뜻하고 안전한 공간에서 함께 이야기 나눠요.',
      schedule: { '월': '09:00~18:00', '화': '휴무', '수': '09:00~18:00', '목': '휴무', '금': '09:00~18:00' }
    },
    {
      id: 2, name: '이지연', email: 'jiyeon@mindwell.com', center: '햇살 심리상담소', address: '서울시 마포구',
      specialties: ['가족치료', '트라우마', '불안장애'], education: '임상심리학 박사 (연세대)', experience: '상담 경력 8년',
      certificates: '임상심리사 1급, 상담사 1급', appliedDate: '2024-05-03', status: '대기', fee: 120000,
      introduction: '가족 관계와 트라우마 회복을 중점적으로 다루는 이지연입니다. 박사 과정에서 쌓은 임상 경험과 8년간의 현장 상담을 통해 내담자 한 분 한 분의 이야기에 귀 기울이고 있습니다. 치유의 여정을 함께하겠습니다.',
      schedule: { '월': '10:00~19:00', '화': '10:00~19:00', '수': '휴무', '목': '10:00~19:00', '금': '10:00~17:00' }
    },
    {
      id: 3, name: '박민준', email: 'minjun@mindwell.com', center: '온마음 상담센터', address: '경기도 성남시',
      specialties: ['청소년 상담', 'ADHD', '학습장애'], education: '교육상담학 석사 (이화여대)', experience: '상담 경력 3년',
      certificates: '청소년상담사 1급', appliedDate: '2024-05-05', status: '대기', fee: 60000,
      introduction: '청소년 및 학습 관련 어려움을 겪는 분들을 위한 상담을 제공합니다. ADHD와 학습장애에 특화된 접근으로 아이와 부모 모두가 함께 성장할 수 있는 환경을 만들어 드립니다.',
      schedule: { '월': '휴무', '화': '09:00~18:00', '수': '09:00~18:00', '목': '09:00~18:00', '금': '09:00~18:00' }
    },
  ]);

  const memberList = [
    { id: 1, name: '홍길동', email: 'hong@gmail.com', role: '내담자', joinDate: '2024-03-01', status: '활성', sessions: 12 },
    { id: 2, name: '김철수', email: 'chulsoo@test.com', role: '상담사', joinDate: '2024-04-15', status: '승인대기', sessions: 0 },
    { id: 3, name: '박영희', email: 'younghee@naver.com', role: '내담자', joinDate: '2024-04-20', status: '활성', sessions: 5 },
    { id: 4, name: '최민수', email: 'minsu@kakao.com', role: '내담자', joinDate: '2024-04-28', status: '비활성', sessions: 2 },
    { id: 5, name: '이지연', email: 'jiyeon@mindwell.com', role: '상담사', joinDate: '2024-05-03', status: '승인대기', sessions: 0 },
  ];

  // ✅ 대기 중인 수만 실시간 계산
  const pendingCount = counselors.filter(c => c.status === '대기').length;

  const stats = [
    { label: '승인 대기', value: pendingCount, icon: <Clock size={20} />, color: '#F59E0B' },
    { label: '전체 회원', value: memberList.length, icon: <Users size={20} />, color: '#8BA888' },
    { label: '활성 내담자', value: memberList.filter(m => m.status === '활성').length, icon: <UserCheck size={20} />, color: '#60A5FA' },
    { label: '이번 달 신규', value: 3, icon: <BarChart3 size={20} />, color: '#A78BFA' },
  ];

  // ✅ 승인 처리 — API 호출 후 state 업데이트
  const handleApprove = async (counselor) => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(`/api/admin/counselors/${counselor.id}/approve`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!res.ok) throw new Error('승인 처리 실패');

      setCounselors(prev =>
        prev.map(c => c.id === counselor.id ? { ...c, status: '승인됨' } : c)
      );
      // ✅ 상세 페이지에서 보고 있는 상담사도 같이 업데이트
      setSelectedCounselor(prev => ({ ...prev, status: '승인됨' }));
      alert(`${counselor.name} 상담사님께 승인 완료 알림이 발송되었습니다.`);
    } catch (err) {
      alert('승인 처리 중 오류가 발생했습니다. 다시 시도해 주세요.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ 반려 처리 — API 호출 후 state 업데이트
  const handleReject = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(`/api/admin/counselors/${selectedCounselor.id}/reject`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason: rejectReason }),
      });
      if (!res.ok) throw new Error('반려 처리 실패');

      setCounselors(prev =>
        prev.map(c => c.id === selectedCounselor.id ? { ...c, status: '반려' } : c)
      );
      setSelectedCounselor(prev => ({ ...prev, status: '반려' }));
      alert('반려 메일이 발송되었습니다.');
      setShowRejectModal(false);
    } catch (err) {
      alert('반려 처리 중 오류가 발생했습니다. 다시 시도해 주세요.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredMembers = memberList.filter(m =>
    m.name.includes(searchQuery) || m.email.includes(searchQuery)
  );

  const filteredCounselors = counselors.filter(c =>
    c.name.includes(searchQuery) || c.email.includes(searchQuery)
  );

  // ✅ 상태 뱃지 컴포넌트
  const StatusBadge = ({ status }) => {
    const map = {
      '대기':   { cls: 'pending',  icon: <Clock size={12} />,       label: '대기중' },
      '승인됨': { cls: 'active',   icon: <CheckCircle size={12} />, label: '승인됨' },
      '반려':   { cls: 'inactive', icon: <XCircle size={12} />,     label: '반려'   },
    };
    const s = map[status] || map['대기'];
    return <span className={`ac-status-badge ${s.cls}`}>{s.icon} {s.label}</span>;
  };

  return (
    <div className="ac-layout">
      {/* 사이드바 */}
      <aside className="ac-sidebar">
        <div className="ac-sidebar-top">
          <div className="ac-brand">
            <ShieldCheck size={22} className="ac-brand-icon" />
            <div>
              <div className="ac-brand-name">MindWell</div>
              <div className="ac-brand-sub">관리자 콘솔</div>
            </div>
          </div>

          <nav className="ac-nav">
            <div className="ac-nav-section-label">메뉴</div>
            <button
              className={`ac-nav-item ${activeMenu === 'counselor' ? 'active' : ''}`}
              onClick={() => { setActiveMenu('counselor'); setViewMode('list'); setSearchQuery(''); }}
            >
              <ClipboardCheck size={18} />
              <span>상담사 승인 관리</span>
              {pendingCount > 0 && <span className="ac-badge">{pendingCount}</span>}
            </button>
            <button
              className={`ac-nav-item ${activeMenu === 'member' ? 'active' : ''}`}
              onClick={() => { setActiveMenu('member'); setSearchQuery(''); }}
            >
              <Users size={18} />
              <span>회원 데이터 조회</span>
            </button>
          </nav>
        </div>

        <div className="ac-sidebar-bottom">
          <button className="ac-logout-btn" onClick={() => navigate('/')}>
            <LogOut size={16} />
            <span>홈으로 돌아가기</span>
          </button>
        </div>
      </aside>

      {/* 메인 콘텐츠 */}
      <main className="ac-main">

        {viewMode === 'list' && (
          <div className="ac-stats-row">
            {stats.map((s, i) => (
              <div className="ac-stat-card" key={i}>
                <div className="ac-stat-icon" style={{ background: s.color + '20', color: s.color }}>{s.icon}</div>
                <div>
                  <div className="ac-stat-value">{s.value}</div>
                  <div className="ac-stat-label">{s.label}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── 상담사 목록 ── */}
        {activeMenu === 'counselor' && viewMode === 'list' && (
          <div className="ac-card">
            <div className="ac-card-header">
              <div>
                <h2 className="ac-card-title">전문가 승인 대기 목록</h2>
                <p className="ac-card-desc">등록 신청한 상담사의 프로필을 검토하고 승인 여부를 결정합니다.</p>
              </div>
              <div className="ac-search-box">
                <Search size={16} className="ac-search-icon" />
                <input
                  className="ac-search-input"
                  placeholder="이름 또는 이메일 검색"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="ac-counselor-list">
              {filteredCounselors.length === 0 ? (
                <div className="ac-empty">
                  <AlertCircle size={40} />
                  <p>대기 중인 신청이 없습니다.</p>
                </div>
              ) : filteredCounselors.map(c => (
                <div className="ac-counselor-row" key={c.id}>
                  <div className="ac-counselor-avatar">{c.name.charAt(0)}</div>
                  <div className="ac-counselor-info">
                    <div className="ac-counselor-name">{c.name}</div>
                    <div className="ac-counselor-meta">
                      <span><Mail size={13} />{c.email}</span>
                      <span><Building2 size={13} />{c.center}</span>
                      <span><MapPin size={13} />{c.address}</span>
                    </div>
                    <div className="ac-counselor-tags">
                      {c.specialties.map(s => <span key={s} className="ac-tag">{s}</span>)}
                    </div>
                  </div>
                  <div className="ac-counselor-right">
                    <StatusBadge status={c.status} />
                    <div className="ac-counselor-date">신청일 {c.appliedDate}</div>
                    {/* ✅ 대기 중이면 '심사하기', 처리됐으면 '상세보기' */}
                    <button
                      className={c.status === '대기' ? 'ac-detail-btn' : 'ac-detail-btn-ghost'}
                      onClick={() => { setSelectedCounselor(c); setViewMode('detail'); }}
                    >
                      {c.status === '대기' ? '심사하기' : '상세보기'} <ChevronRight size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── 상담사 상세 심사 ── */}
        {activeMenu === 'counselor' && viewMode === 'detail' && selectedCounselor && (
          <div className="ac-card ac-detail-view">
            <button className="ac-back-btn" onClick={() => setViewMode('list')}>
              <ArrowLeft size={16} /> 목록으로 돌아가기
            </button>

            <div className="ac-detail-header">
              <div className="ac-detail-avatar">{selectedCounselor.name.charAt(0)}</div>
              <div>
                <h2 className="ac-detail-title">{selectedCounselor.name} 상담사</h2>
                <p className="ac-detail-subtitle">프로필 심사 · {selectedCounselor.email}</p>
              </div>
              <span style={{ marginLeft: 'auto' }}>
                <StatusBadge status={selectedCounselor.status} />
              </span>
            </div>

            {/* ✅ 자기소개 섹션 */}
            <div className="ac-info-section ac-intro-section">
              <div className="ac-section-title"><FileText size={16} /> 상담사 자기소개</div>
              <p className="ac-intro-text">
                {selectedCounselor.introduction || '자기소개가 입력되지 않았습니다.'}
              </p>
            </div>

            <div className="ac-detail-grid" style={{ marginTop: '20px' }}>
              <div className="ac-info-section">
                <div className="ac-section-title"><Building2 size={16} /> 기본 정보 및 상담소</div>
                <div className="ac-info-rows">
                  <div className="ac-info-row"><span className="ac-info-key">상담소명</span><span>{selectedCounselor.center}</span></div>
                  <div className="ac-info-row"><span className="ac-info-key">주소</span><span>{selectedCounselor.address}</span></div>
                  <div className="ac-info-row">
                    <span className="ac-info-key">전문 분야</span>
                    <div className="ac-tag-group">
                      {selectedCounselor.specialties.map(s => <span key={s} className="ac-tag">{s}</span>)}
                    </div>
                  </div>
                  <div className="ac-info-row">
                    <span className="ac-info-key"><CircleDollarSign size={13} /> 상담 금액</span>
                    <span className="ac-fee-text">
                      {selectedCounselor.fee
                        ? `${selectedCounselor.fee.toLocaleString()}원 / 50분`
                        : '미입력'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="ac-info-section">
                <div className="ac-section-title"><GraduationCap size={16} /> 학력 및 경력사항</div>
                <div className="ac-info-rows">
                  <div className="ac-info-row"><span className="ac-info-key"><GraduationCap size={13} /> 최종 학력</span><span>{selectedCounselor.education}</span></div>
                  <div className="ac-info-row"><span className="ac-info-key"><Briefcase size={13} /> 주요 경력</span><span>{selectedCounselor.experience}</span></div>
                  <div className="ac-info-row"><span className="ac-info-key"><Award size={13} /> 자격증</span><span>{selectedCounselor.certificates}</span></div>
                </div>
              </div>
            </div>

            <div className="ac-info-section" style={{ marginTop: '20px' }}>
              <div className="ac-section-title"><Calendar size={16} /> 주간 상담 가능 일정</div>
              <div className="ac-schedule-grid">
                {['월', '화', '수', '목', '금'].map(day => {
                  const time = selectedCounselor.schedule[day];
                  const isOff = !time || time === '휴무';
                  return (
                    <div className={`ac-schedule-cell ${isOff ? 'off' : 'on'}`} key={day}>
                      <div className="ac-schedule-day">{day}</div>
                      <div className="ac-schedule-time">{isOff ? '휴무' : time}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ✅ 대기 중일 때만 버튼 표시, 처리 완료 시 안내 메시지 */}
            {selectedCounselor.status === '대기' ? (
              <div className="ac-action-row">
                <button
                  className="ac-btn-reject"
                  disabled={isLoading}
                  onClick={() => { setRejectReason(defaultRejectReason); setShowRejectModal(true); }}
                >
                  <XCircle size={17} /> 승인 반려
                </button>
                <button
                  className="ac-btn-approve"
                  disabled={isLoading}
                  onClick={() => handleApprove(selectedCounselor)}
                >
                  <CheckCircle size={17} /> {isLoading ? '처리 중...' : '최종 승인 완료'}
                </button>
              </div>
            ) : (
              <div className="ac-action-done">
                {selectedCounselor.status === '승인됨'
                  ? '✅ 이미 승인 처리된 상담사입니다.'
                  : '❌ 반려 처리된 상담사입니다.'}
              </div>
            )}
          </div>
        )}

        {/* ── 회원 데이터 조회 ── */}
        {activeMenu === 'member' && (
          <div className="ac-card">
            <div className="ac-card-header">
              <div>
                <h2 className="ac-card-title">회원 데이터 조회</h2>
                <p className="ac-card-desc">전체 가입 회원의 현황을 확인합니다.</p>
              </div>
              <div className="ac-search-box">
                <Search size={16} className="ac-search-icon" />
                <input
                  className="ac-search-input"
                  placeholder="이름 또는 이메일 검색"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="ac-table-wrap">
              <table className="ac-table">
                <thead>
                  <tr>
                    <th>이름</th>
                    <th>이메일</th>
                    <th>구분</th>
                    <th>가입일</th>
                    <th>상담 횟수</th>
                    <th>상태</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMembers.map(m => (
                    <tr key={m.id}>
                      <td>
                        <div className="ac-member-name-cell">
                          <div className="ac-member-avatar">{m.name.charAt(0)}</div>
                          {m.name}
                        </div>
                      </td>
                      <td className="ac-muted">{m.email}</td>
                      <td>
                        <span className={`ac-role-badge ${m.role === '상담사' ? 'counselor' : 'client'}`}>
                          {m.role}
                        </span>
                      </td>
                      <td className="ac-muted">{m.joinDate}</td>
                      <td className="ac-center">{m.sessions}회</td>
                      <td>
                        <span className={`ac-status-badge ${
                          m.status === '활성' ? 'active' :
                          m.status === '비활성' ? 'inactive' : 'pending'
                        }`}>
                          {m.status === '활성' && <CheckCircle size={12} />}
                          {m.status === '비활성' && <XCircle size={12} />}
                          {m.status === '승인대기' && <Clock size={12} />}
                          {m.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* ── 반려 모달 ── */}
      {showRejectModal && (
        <div className="ac-modal-overlay" onClick={() => setShowRejectModal(false)}>
          <div className="ac-modal" onClick={e => e.stopPropagation()}>
            <div className="ac-modal-header">
              <XCircle size={22} className="ac-modal-icon" />
              <h3>심사 반려 사유 입력</h3>
            </div>
            <p className="ac-modal-desc">반려 시 상담사님께 이메일로 발송될 내용을 작성해 주세요.</p>
            <textarea
              className="ac-modal-textarea"
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
              rows={5}
            />
            <div className="ac-modal-actions">
              <button className="ac-modal-cancel" onClick={() => setShowRejectModal(false)}>취소</button>
              <button
                className="ac-modal-send"
                disabled={isLoading}
                onClick={handleReject}
              >
                <Mail size={15} /> {isLoading ? '처리 중...' : '반려 메일 전송'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCounselor;