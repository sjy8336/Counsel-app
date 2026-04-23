import React, { useState, useMemo } from 'react';
import { 
  BookOpen, 
  Search, 
  Calendar, 
  Smile, 
  ChevronRight, 
  ArrowLeft,
  Bell,
  User,
  Heart,
  CalendarDays,
  ChevronLeft,
  Plus
} from 'lucide-react';
import '../static/Diary.css';

const App = () => {
  /* ============================================================
     1. State & Constants (상태 관리 및 상수)
     ============================================================ */
  const [view, setView] = useState('list'); // 'list' or 'detail'
  const [selectedDiary, setSelectedDiary] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeFilter, setActiveFilter] = useState('전체');
  const itemsPerPage = 3;

  /* ============================================================
     2. Mock Data (데이터 섹션)
     ============================================================ */
  const allDiaries = [
    {
      id: 1,
      date: '2026. 04. 21',
      day: '화요일',
      title: '조금은 차분해진 오후',
      content: '오늘 아침에는 마음이 조금 무거웠는데, 추천해주신 카모마일 차를 마시며 명상을 하니 한결 나아졌다. 업무 중에도 심호흡을 잊지 않으려고 노력했다.',
      sentiment: '행복',
      score: 85,
      aiFeedback: '마음의 안정감을 찾으려는 노력이 멋져요. 작은 휴식이 큰 변화를 만들었네요.',
      accentBg: 'rgba(139,168,136,0.1)',
      accentColor: '#8BA888',
      accentClass: 'bg-green',
    },
    {
      id: 2,
      date: '2026. 04. 19',
      day: '일요일',
      title: '비 오는 날의 생각들',
      content: '비가 와서 그런지 조금 울적한 기분이 들었다. 예전 같았으면 계속 깊게 빠졌을 텐데 이번에는 일기를 쓰면서 내 감정을 객관적으로 바라보려 했다.',
      sentiment: '우울',
      score: 42,
      aiFeedback: '감정을 객관적으로 관찰하는 것은 아주 좋은 습관입니다. 비 오는 날은 누구나 조금 가라앉을 수 있어요.',
      accentBg: '#dbeafe',
      accentColor: '#1d4ed8',
      accentClass: 'bg-blue',
    },
    {
      id: 3,
      date: '2026. 04. 17',
      day: '금요일',
      title: '프로젝트 마무리 후의 해방감',
      content: '드디어 큰 산을 하나 넘었다! 팀원들과 함께 고생한 보람이 느껴져서 뿌듯하다. 주말에는 나에게 충분한 보상을 주기로 했다.',
      sentiment: '평온',
      score: 92,
      aiFeedback: '성취감을 충분히 만끽하세요! 스스로에게 주는 보상은 다음 도약을 위한 에너지가 됩니다.',
      accentBg: 'rgba(245,158,11,0.1)',
      accentColor: '#F59E0B',
      accentClass: 'bg-yellow',
    },
    {
      id: 4,
      date: '2026. 04. 15',
      day: '수요일',
      title: '예상치 못한 마찰',
      content: '회의 중에 의견 충돌이 있었다. 내 의견이 무시당하는 기분이 들어서 순간적으로 화가 많이 났다. 감정을 조절하기가 쉽지 않았던 하루였다.',
      sentiment: '화남',
      score: 28,
      aiFeedback: '화가 나는 것은 자연스러운 방어 기제입니다. 하지만 그 감정에 휘둘리기보다 잠시 거리를 두고 호흡해보는 건 어떨까요?',
      accentBg: 'rgba(253,164,175,0.1)',
      accentColor: '#FDA4AF',
      accentClass: 'bg-pink',
    },
  ];

  /* ============================================================
     3. Logic & Handlers (비즈니스 로직 및 핸들러)
     ============================================================ */
  const filteredDiaries = useMemo(() => {
    if (activeFilter === '전체') return allDiaries;
    return allDiaries.filter(d => d.sentiment === activeFilter);
  }, [activeFilter]);

  const totalPages = Math.ceil(filteredDiaries.length / itemsPerPage);
  const currentDiaries = filteredDiaries.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleDiaryClick = (diary) => {
    setSelectedDiary(diary);
    setView('detail');
  };

  const goBack = () => {
    setView('list');
    setSelectedDiary(null);
  };

  const handleFilterClick = (filter) => {
    setActiveFilter(filter);
    setCurrentPage(1);
  };

  /* ============================================================
     4. Render (UI 렌더링)
     ============================================================ */
  return (
    <div className="mw-diary__page">

      {/* Navigation Header */}
      <nav className="mw-diary__nav">
        <div className="mw-diary__nav-inner">
          <div className="mw-diary__nav-left">
            <h1 className="mw-diary__logo">MINDWELL</h1>
            <div className="mw-diary__nav-links">
              <a href="#" className="mw-diary__nav-link">전문가 찾기</a>
              <a href="#" className="mw-diary__nav-link">예약 관리</a>
              <a href="#" className="mw-diary__nav-link mw-diary__nav-link--active">AI 일기</a>
              <a href="#" className="mw-diary__nav-link">힐링 라운지</a>
            </div>
          </div>
          <div className="mw-diary__nav-right">
            <button className="mw-diary__nav-bell-btn">
              <Bell size={18} />
            </button>
            <div className="mw-diary__nav-user">
              <div className="mw-diary__nav-avatar">
                <User size={12} />
              </div>
              <span className="mw-diary__nav-username">먹보 님</span>
            </div>
          </div>
        </div>
      </nav>

      <main className={`mw-diary__main ${view === 'list' ? 'mw-diary__main--list' : 'mw-diary__main--detail'}`}>
        {view === 'list' ? (
          <>
            {/* Page Header */}
            <header className="mw-diary__list-header">
              <div className="mw-diary__list-header-text">
                <h2 className="mw-diary__list-title">나의 마음 기록장</h2>
                <p className="mw-diary__list-subtitle">소중한 당신의 감정 기록들을 확인해보세요.</p>
              </div>
              <button className="mw-diary__write-btn">
                <Plus size={14} />
                <span>기록하기</span>
              </button>
            </header>

            {/* Stats Summary */}
            <div className="mw-diary__stats-grid">
              <div className="mw-diary__stat-card">
                <div className="mw-diary__stat-icon-wrap mw-diary__stat-icon-wrap--green">
                  <BookOpen size={16} />
                </div>
                <div className="mw-diary__stat-value">{allDiaries.length}</div>
                <div className="mw-diary__stat-label">기록</div>
              </div>
              <div className="mw-diary__stat-card">
                <div className="mw-diary__stat-icon-wrap mw-diary__stat-icon-wrap--yellow">
                  <Smile size={16} />
                </div>
                <div className="mw-diary__stat-value">85%</div>
                <div className="mw-diary__stat-label">긍정</div>
              </div>
              <div className="mw-diary__stat-card">
                <div className="mw-diary__stat-icon-wrap mw-diary__stat-icon-wrap--pink">
                  <CalendarDays size={16} />
                </div>
                <div className="mw-diary__stat-value">4일</div>
                <div className="mw-diary__stat-label">연속</div>
              </div>
            </div>

            {/* Filter and Search */}
            <div className="mw-diary__toolbar">
              <div className="mw-diary__search-wrap">
                <Search className="mw-diary__search-icon" size={16} />
                <input
                  type="text"
                  placeholder="제목으로 검색"
                  className="mw-diary__search-input"
                />
              </div>
              <div className="mw-diary__filter-list mw-diary__hide-scrollbar">
                {['전체', '행복', '평온', '우울', '불안', '화남'].map((filter) => (
                  <button
                    key={filter}
                    onClick={() => handleFilterClick(filter)}
                    className={`mw-diary__filter-btn ${activeFilter === filter ? 'mw-diary__filter-btn--active' : 'mw-diary__filter-btn--inactive'}`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>

            {/* Diary List */}
            <div className="mw-diary__list">
              {currentDiaries.length > 0 ? (
                currentDiaries.map((diary) => (
                  <div
                    key={diary.id}
                    onClick={() => handleDiaryClick(diary)}
                    className="mw-diary__list-item"
                  >
                    <div className="mw-diary__list-item-body">
                      <div className="mw-diary__list-item-meta">
                        <span className="mw-diary__list-item-date">{diary.date}</span>
                        <span
                          className="mw-diary__sentiment-badge"
                          style={{ backgroundColor: diary.accentBg, color: diary.accentColor }}
                        >
                          {diary.sentiment}
                        </span>
                      </div>
                      <h3 className="mw-diary__list-item-title">{diary.title}</h3>
                      <p className="mw-diary__list-item-preview">{diary.content}</p>
                    </div>
                    <div className="mw-diary__list-item-right">
                      <div className="mw-diary__list-item-score">
                        <div className="mw-diary__list-item-score-value">{diary.score}%</div>
                        <div className="mw-diary__list-item-score-label">Score</div>
                      </div>
                      <ChevronRight size={20} className="mw-diary__list-item-chevron" />
                    </div>
                  </div>
                ))
              ) : (
                <div className="mw-diary__list-empty">
                  <p>해당 감정으로 기록된 일기가 없습니다.</p>
                </div>
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mw-diary__pagination">
                <button
                  className="mw-diary__pagination-arrow"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft size={20} />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
                  <button
                    key={num}
                    onClick={() => setCurrentPage(num)}
                    className={`mw-diary__pagination-num ${currentPage === num ? 'mw-diary__pagination-num--active' : 'mw-diary__pagination-num--inactive'}`}
                  >
                    {num}
                  </button>
                ))}
                <button
                  className="mw-diary__pagination-arrow"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            )}
          </>
        ) : (
          /* Detail View */
          <div className="mw-diary__detail-wrapper">
            <div className="mw-diary__detail-topbar">
              <button onClick={goBack} className="mw-diary__back-btn">
                <ArrowLeft size={18} />
                <span>목록으로 돌아가기</span>
              </button>
            </div>

            <div className="mw-diary__detail-grid">
              {/* Main Content Area */}
              <article className="mw-diary__article">
                <div
                  className="mw-diary__article-accent"
                  style={{ backgroundColor: selectedDiary.accentColor }}
                />
                <div className="mw-diary__article-body">
                  <div className="mw-diary__article-head">
                    <div className="mw-diary__article-head-left">
                      <div className="mw-diary__article-date-row">
                        <Calendar size={14} />
                        <span>{selectedDiary.date} ({selectedDiary.day})</span>
                      </div>
                      <h2 className="mw-diary__article-title">{selectedDiary.title}</h2>
                      <span
                        className="mw-diary__article-sentiment-badge"
                        style={{ backgroundColor: selectedDiary.accentBg, color: selectedDiary.accentColor }}
                      >
                        {selectedDiary.sentiment}
                      </span>
                    </div>
                    <div
                      className="mw-diary__article-score-box"
                      style={{ backgroundColor: selectedDiary.accentBg }}
                    >
                      <div className="mw-diary__article-score-value">{selectedDiary.score}%</div>
                      <div className="mw-diary__article-score-label">Mind Score</div>
                    </div>
                  </div>

                  <div className="mw-diary__article-content-wrap">
                    <div className="mw-diary__article-quote">
                      <div className="mw-diary__article-quote-open">"</div>
                      <span className="mw-diary__article-quote-text">{selectedDiary.content}</span>
                      <div className="mw-diary__article-quote-close">"</div>
                    </div>
                  </div>

                  {/* AI Analysis Section */}
                  <div className="mw-diary__ai-section">
                    <div className="mw-diary__ai-section-deco">
                      <Heart size={80} />
                    </div>
                    <div className="mw-diary__ai-section-body">
                      <div className="mw-diary__ai-header">
                        <div className="mw-diary__ai-avatar">
                          <Smile size={16} />
                        </div>
                        <h4 className="mw-diary__ai-title">AI의 따뜻한 처방전</h4>
                      </div>
                      <p className="mw-diary__ai-feedback">{selectedDiary.aiFeedback}</p>
                      <div className="mw-diary__ai-tags">
                        {['#마음성장', '#회복탄력성', '#자기돌봄'].map((tag) => (
                          <span key={tag} className="mw-diary__ai-tag">{tag}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </article>

              {/* Side Recommendation Area */}
              <div className="mw-diary__side-cards">
                <div className="mw-diary__side-card">
                  <div className="mw-diary__side-card-header">
                    <div className="mw-diary__side-card-icon mw-diary__side-card-icon--yellow">
                      <Smile size={16} />
                    </div>
                    <span className="mw-diary__side-card-label">오늘의 힐링</span>
                  </div>
                  <h5 className="mw-diary__side-card-title">라벤더 향초</h5>
                  <p className="mw-diary__side-card-desc">안정을 돕는 은은한 향으로 하루의 긴장을 풀어보세요.</p>
                </div>

                <div className="mw-diary__side-card">
                  <div className="mw-diary__side-card-header">
                    <div className="mw-diary__side-card-icon mw-diary__side-card-icon--green">
                      <Heart size={16} />
                    </div>
                    <span className="mw-diary__side-card-label">추천 전문가</span>
                  </div>
                  <h5 className="mw-diary__side-card-title">이은지 코치</h5>
                  <p className="mw-diary__side-card-desc mw-diary__side-card-desc--mb">당신의 감정에 깊은 공감을 전해줄 전문가입니다.</p>
                  <div className="mw-diary__side-card-cta">
                    <span className="mw-diary__side-card-cta-text">예약 가능한 시간대 확인</span>
                    <ChevronRight size={14} className="mw-diary__side-card-cta-icon" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mw-diary__footer">
        <div className="mw-diary__footer-inner">
          <div className="mw-diary__footer-grid">
            <div className="mw-diary__footer-brand">
              <span className="mw-diary__footer-logo">MINDWELL</span>
              <p className="mw-diary__footer-tagline">
                당신의 마음 건강을 위한 지능형 멘탈 웰니스 플랫폼. 전문가와 AI가 함께 당신의 일상을 케어합니다.
              </p>
            </div>
            <div className="mw-diary__footer-links-grid">
              <div>
                <h4 className="mw-diary__footer-col-title">서비스</h4>
                <ul className="mw-diary__footer-link-list">
                  <li>전문가 매칭</li>
                  <li>AI 감정 일기</li>
                  <li>심리 테스트</li>
                </ul>
              </div>
              <div>
                <h4 className="mw-diary__footer-col-title">고객지원</h4>
                <ul className="mw-diary__footer-link-list">
                  <li>공지사항</li>
                  <li>자주 묻는 질문</li>
                  <li>1:1 문의</li>
                </ul>
              </div>
            </div>
          </div>
          <div className="mw-diary__footer-bottom">
            <span>© 2026 MINDWELL LAB. All rights reserved.</span>
            <div className="mw-diary__footer-bottom-links">
              <span>개인정보처리방침</span>
              <span>이용약관</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;