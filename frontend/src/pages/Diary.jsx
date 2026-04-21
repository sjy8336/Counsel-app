import React, { useState, useMemo } from 'react';
import { 
  BookOpen, 
  Search, 
  Calendar, 
  Smile, 
  Cloud, 
  Frown, 
  ChevronRight, 
  ArrowLeft,
  Bell,
  User,
  Heart,
  CalendarDays,
  ChevronLeft,
  Plus
} from 'lucide-react';

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
      color: 'bg-[#8BA888]/10',
      textColor: 'text-[#8BA888]'
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
      color: 'bg-blue-100',
      textColor: 'text-blue-700'
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
      color: 'bg-[#F59E0B]/10',
      textColor: 'text-[#F59E0B]'
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
      color: 'bg-[#FDA4AF]/10',
      textColor: 'text-[#FDA4AF]'
    }
  ];

  /* ============================================================
     3. Logic & Handlers (비즈니스 로직 및 핸들러)
     ============================================================ */
  // 필터링 로직
  const filteredDiaries = useMemo(() => {
    if (activeFilter === '전체') return allDiaries;
    return allDiaries.filter(d => d.sentiment === activeFilter);
  }, [activeFilter, allDiaries]);

  // 페이지네이션 로직
  const totalPages = Math.ceil(filteredDiaries.length / itemsPerPage);
  const currentDiaries = filteredDiaries.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // 이벤트 핸들러
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
    <div className="min-h-screen bg-[#FDFBF7] font-sans text-[#1E293B] pb-20">
      {/* Hide Scrollbar Style */}
      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {/* Navigation Header */}
      <nav className="bg-white border-b border-[#FAF7F2] sticky top-0 z-50 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-6 md:space-x-12">
            <h1 className="text-[#8BA888] font-bold text-lg md:text-xl tracking-tight">MINDWELL</h1>
            <div className="hidden lg:flex space-x-8 text-sm font-medium text-slate-500">
              <a href="#" className="hover:text-[#1E293B]">전문가 찾기</a>
              <a href="#" className="hover:text-[#1E293B]">예약 관리</a>
              <a href="#" className="text-[#8BA888] font-semibold border-b-2 border-[#8BA888] pb-5 translate-y-[2px]">AI 일기</a>
              <a href="#" className="hover:text-[#1E293B]">힐링 라운지</a>
            </div>
          </div>
          <div className="flex items-center space-x-2 md:space-x-4">
            <button className="p-2 text-slate-400 hover:bg-[#FDFBF7] rounded-full">
              <Bell size={18} />
            </button>
            <div className="flex items-center space-x-2 bg-[#FAF7F2] px-2 md:px-3 py-1.5 rounded-full cursor-pointer hover:bg-[#f3eee5]">
              <div className="w-5 h-5 md:w-6 md:h-6 bg-[#8BA888]/20 rounded-full flex items-center justify-center">
                <User size={12} className="text-[#8BA888]" />
              </div>
              <span className="text-xs md:text-sm font-medium">먹보 님</span>
            </div>
          </div>
        </div>
      </nav>

      <main className={`mx-auto px-4 md:px-6 pt-6 md:pt-10 transition-all duration-500 ${view === 'list' ? 'max-w-4xl' : 'max-w-5xl'}`}>
        {view === 'list' ? (
          <>
            {/* Page Header - Horizontal on Mobile */}
            <header className="mb-8 md:mb-10 flex items-center justify-between gap-4">
              <div className="min-w-0">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-1 text-[#1E293B] truncate">나의 마음 기록장</h2>
                <p className="text-slate-500 text-[10px] sm:text-xs md:text-sm truncate">소중한 당신의 감정 기록들을 확인해보세요.</p>
              </div>
              <button className="bg-[#8BA888] text-white py-2 px-3 sm:py-2.5 sm:px-6 rounded-full shadow-sm hover:bg-[#7a9377] transition-colors flex items-center justify-center space-x-1.5 sm:space-x-2 text-[10px] sm:text-sm font-bold flex-shrink-0">
                <Plus size={14} className="sm:w-4 sm:h-4" />
                <span>기록하기</span>
              </button>
            </header>

            {/* Stats Summary - Horizontal Grid on Mobile */}
            <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-10">
              <div className="bg-white p-3 sm:p-6 rounded-[16px] sm:rounded-[24px] border border-[#FAF7F2] shadow-sm flex flex-col items-center justify-center text-center">
                <div className="w-7 h-7 sm:w-10 sm:h-10 bg-[#8BA888]/10 rounded-full flex items-center justify-center mb-1.5 sm:mb-3">
                  <BookOpen className="text-[#8BA888] w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div className="text-sm sm:text-2xl font-bold text-[#1E293B]">{allDiaries.length}</div>
                <div className="text-[8px] sm:text-xs text-slate-400 font-bold uppercase tracking-tight">기록</div>
              </div>
              <div className="bg-white p-3 sm:p-6 rounded-[16px] sm:rounded-[24px] border border-[#FAF7F2] shadow-sm flex flex-col items-center justify-center text-center">
                <div className="w-7 h-7 sm:w-10 sm:h-10 bg-[#F59E0B]/10 rounded-full flex items-center justify-center mb-1.5 sm:mb-3">
                  <Smile className="text-[#F59E0B] w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div className="text-sm sm:text-2xl font-bold text-[#1E293B]">85%</div>
                <div className="text-[8px] sm:text-xs text-slate-400 font-bold uppercase tracking-tight">긍정</div>
              </div>
              <div className="bg-white p-3 sm:p-6 rounded-[16px] sm:rounded-[24px] border border-[#FAF7F2] shadow-sm flex flex-col items-center justify-center text-center">
                <div className="w-7 h-7 sm:w-10 sm:h-10 bg-[#FDA4AF]/10 rounded-full flex items-center justify-center mb-1.5 sm:mb-3">
                  <CalendarDays className="text-[#FDA4AF] w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div className="text-sm sm:text-2xl font-bold text-[#1E293B]">4일</div>
                <div className="text-[8px] sm:text-xs text-slate-400 font-bold uppercase tracking-tight">연속</div>
              </div>
            </div>

            {/* Filter and Search */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mb-6">
              <div className="relative flex-1 md:max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input 
                  type="text" 
                  placeholder="제목으로 검색" 
                  className="w-full pl-9 pr-4 py-2.5 bg-white border border-[#FAF7F2] rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#8BA888] transition-all"
                />
              </div>
              <div className="flex items-center space-x-2 overflow-x-auto pb-1 md:pb-0 hide-scrollbar">
                {['전체', '행복', '평온', '우울', '불안', '화남'].map((filter) => (
                  <button 
                    key={filter}
                    onClick={() => handleFilterClick(filter)}
                    className={`px-5 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all ${activeFilter === filter ? 'bg-[#8BA888] text-white shadow-md shadow-[#8BA888]/20' : 'bg-white text-slate-400 border border-[#FAF7F2] hover:bg-slate-200'}`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>

            {/* Diary List */}
            <div className="space-y-4 min-h-[300px]">
              {currentDiaries.length > 0 ? (
                currentDiaries.map((diary) => (
                  <div 
                    key={diary.id}
                    onClick={() => handleDiaryClick(diary)}
                    className="group bg-white p-5 md:p-6 rounded-[24px] border border-[#FAF7F2] shadow-sm hover:shadow-md transition-all cursor-pointer flex items-center justify-between"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-tighter">{diary.date}</span>
                        <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${diary.color} ${diary.textColor}`}>
                          {diary.sentiment}
                        </span>
                      </div>
                      <h3 className="text-lg md:text-xl font-bold mb-1.5 group-hover:text-[#8BA888] transition-colors text-[#1E293B] truncate">{diary.title}</h3>
                      <p className="text-slate-500 text-[11px] line-clamp-1 pr-4 md:pr-12">{diary.content}</p>
                    </div>
                    <div className="flex items-center space-x-3 md:space-x-5 flex-shrink-0">
                      <div className="text-right hidden sm:block">
                        <div className="text-lg md:text-xl font-extrabold text-[#1E293B]">{diary.score}%</div>
                        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Score</div>
                      </div>
                      <ChevronRight size={20} className="text-slate-300 group-hover:text-[#8BA888]" />
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-white rounded-[24px] p-20 md:p-24 text-center border border-dashed border-[#FAF7F2]">
                   <p className="text-slate-400 text-sm font-medium">해당 감정으로 기록된 일기가 없습니다.</p>
                </div>
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center space-x-2 mt-12">
                <button 
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  className="p-2 text-slate-300 hover:text-[#8BA888] disabled:opacity-20"
                  disabled={currentPage === 1}
                >
                  <ChevronLeft size={20} />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
                  <button 
                    key={num}
                    onClick={() => setCurrentPage(num)}
                    className={`w-9 h-9 md:w-10 md:h-10 rounded-full text-sm font-bold transition-all ${currentPage === num ? 'bg-[#8BA888] text-white shadow-lg shadow-[#8BA888]/30 scale-105' : 'bg-white text-slate-400 border border-[#FAF7F2] hover:bg-slate-200'}`}
                  >
                    {num}
                  </button>
                ))}
                <button 
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  className="p-2 text-slate-300 hover:text-[#8BA888] disabled:opacity-20"
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            )}
          </>
        ) : (
          /* Detail View */
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-400">
            <div className="flex items-center justify-between mb-6 md:mb-8">
              <button 
                onClick={goBack}
                className="flex items-center space-x-2 text-slate-400 hover:text-[#1E293B] transition-colors"
              >
                <ArrowLeft size={18} />
                <span className="text-xs md:text-sm font-bold">목록으로 돌아가기</span>
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 md:gap-8 items-start">
              {/* Main Content Area */}
              <article className="lg:col-span-3 bg-white rounded-[24px] md:rounded-[32px] border border-[#FAF7F2] shadow-xl overflow-hidden">
                <div className={`h-2 ${selectedDiary.color.replace('/10', '')}`}></div>
                <div className="p-6 md:p-12">
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-6 mb-8 md:mb-10">
                    <div className="flex-1 min-w-0">
                      <div className="text-slate-400 font-bold text-[10px] md:text-xs mb-2 flex items-center space-x-2 uppercase tracking-wide">
                         <Calendar size={14} />
                         <span>{selectedDiary.date} ({selectedDiary.day})</span>
                      </div>
                      <h2 className="text-2xl md:text-3xl font-extrabold text-[#1E293B] leading-tight mb-4">{selectedDiary.title}</h2>
                      <span className={`px-4 py-1.5 rounded-full text-[10px] md:text-xs font-bold ${selectedDiary.color} ${selectedDiary.textColor}`}>
                        {selectedDiary.sentiment}
                      </span>
                    </div>
                    <div className={`p-4 md:p-5 rounded-[24px] md:rounded-[28px] ${selectedDiary.color} flex flex-col items-center justify-center w-20 h-20 md:w-24 md:h-24 shadow-inner border border-white/20 flex-shrink-0 mx-auto sm:mx-0`}>
                      <div className="text-xl md:text-2xl font-black mb-0.5 text-[#1E293B]">{selectedDiary.score}%</div>
                      <div className="text-[8px] md:text-[10px] font-bold opacity-60 uppercase tracking-tighter text-[#1E293B]">Mind Score</div>
                    </div>
                  </div>

                  <div className="mb-10 md:mb-12">
                    <div className="text-[#1E293B] leading-relaxed text-sm whitespace-pre-wrap italic bg-[#FAF7F2] p-6 md:p-8 rounded-[24px] md:rounded-[28px] border border-[#FAF7F2] relative">
                      <div className="absolute top-2 left-3 text-3xl md:text-4xl text-[#8BA888]/20 font-serif leading-none">“</div>
                      <span className="relative z-10 px-1 md:px-2 inline-block font-medium">{selectedDiary.content}</span>
                      <div className="absolute bottom-2 right-3 text-3xl md:text-4xl text-[#8BA888]/20 font-serif leading-none">”</div>
                    </div>
                  </div>

                  {/* AI Analysis Section */}
                  <div className="bg-[#FAF7F2]/50 p-6 md:p-8 rounded-[28px] md:rounded-[36px] relative overflow-hidden border border-[#8BA888]/10">
                    <div className="absolute top-0 right-0 p-6 md:p-10 opacity-5">
                        <Heart size={80} className="text-[#8BA888]" />
                    </div>
                    <div className="relative z-10">
                      <div className="flex items-center space-x-3 mb-4 md:mb-5">
                          <div className="w-8 h-8 md:w-10 md:h-10 bg-[#8BA888] rounded-full flex items-center justify-center shadow-lg">
                            <Smile size={16} className="text-white" />
                          </div>
                          <h4 className="text-base md:text-lg font-bold text-[#8BA888]">AI의 따뜻한 처방전</h4>
                      </div>
                      <p className="text-slate-600 text-sm md:text-base leading-relaxed mb-6 md:mb-8 font-medium">
                        {selectedDiary.aiFeedback}
                      </p>
                      <div className="flex flex-wrap gap-2">
                          {['#마음성장', '#회복탄력성', '#자기돌봄'].map((tag) => (
                            <span key={tag} className="text-[10px] md:text-[11px] bg-white px-3 md:px-4 py-1.5 md:py-2 rounded-full text-[#8BA888] font-bold shadow-sm border border-[#8BA888]/10">
                              {tag}
                            </span>
                          ))}
                      </div>
                    </div>
                  </div>
                </div>
              </article>

              {/* Side Recommendation Area */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-6 w-full">
                <div className="bg-white p-6 md:p-7 rounded-[24px] md:rounded-[32px] border border-[#FAF7F2] shadow-sm hover:shadow-md transition-all">
                  <div className="flex items-center space-x-3 mb-4 md:mb-5">
                    <div className="w-9 h-9 md:w-10 md:h-10 bg-[#F59E0B]/10 rounded-xl md:rounded-2xl flex items-center justify-center">
                      <Smile className="text-[#F59E0B] w-4 h-4 md:w-5 md:h-5" />
                    </div>
                    <span className="font-bold text-xs md:text-sm text-[#1E293B] tracking-tight">오늘의 힐링</span>
                  </div>
                  <h5 className="text-sm md:text-base font-bold mb-2 text-[#1E293B]">라벤더 향초</h5>
                  <p className="text-[11px] md:text-xs text-slate-500 leading-normal font-medium">안정을 돕는 은은한 향으로 하루의 긴장을 풀어보세요.</p>
                </div>

                <div className="bg-white p-6 md:p-7 rounded-[24px] md:rounded-[32px] border border-[#FAF7F2] shadow-sm hover:shadow-md transition-all">
                   <div className="flex items-center space-x-3 mb-4 md:mb-5">
                    <div className="w-9 h-9 md:w-10 md:h-10 bg-[#8BA888]/10 rounded-xl md:rounded-2xl flex items-center justify-center">
                      <Heart className="text-[#8BA888] w-4 h-4 md:w-5 md:h-5" />
                    </div>
                    <span className="font-bold text-xs md:text-sm text-[#1E293B] tracking-tight">추천 전문가</span>
                  </div>
                  <h5 className="text-sm md:text-base font-bold mb-2 text-[#1E293B]">이은지 코치</h5>
                  <p className="text-[11px] md:text-xs text-slate-500 leading-normal mb-5 font-medium">당신의 감정에 깊은 공감을 전해줄 전문가입니다.</p>
                  
                  <div className="flex items-center justify-between p-3.5 bg-[#FAF7F2] rounded-xl md:rounded-2xl border border-[#FAF7F2] cursor-pointer hover:bg-white hover:border-[#8BA888]/30 transition-all group">
                    <span className="text-[10px] md:text-[11px] font-bold text-[#8BA888] whitespace-nowrap leading-none flex-1 pr-2">예약 가능한 시간대 확인</span>
                    <ChevronRight size={14} className="text-[#8BA888] flex-shrink-0 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-20 md:mt-24 bg-[#FAF7F2] border-t border-[#8BA888]/10 pt-12 md:pt-16 pb-16 md:pb-20 px-4 md:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10 mb-12 md:mb-16">
            <div className="sm:col-span-2 md:col-span-1">
              <h3 className="font-bold text-[#8BA888] text-base mb-4 tracking-tight">MINDWELL</h3>
              <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
                당신의 마음 건강을 위한 지능형 멘탈 웰니스 플랫폼. 전문가와 AI가 함께 당신의 일상을 케어합니다.
              </p>
            </div>
            <div className="grid grid-cols-2 sm:col-span-2 md:col-span-3 gap-8">
              <div>
                <h4 className="text-[10px] font-bold text-[#1E293B] mb-4 uppercase tracking-wider">서비스</h4>
                <ul className="text-[11px] text-slate-400 space-y-2 font-medium">
                  <li className="hover:text-[#8BA888] cursor-pointer transition-colors">전문가 매칭</li>
                  <li className="hover:text-[#8BA888] cursor-pointer transition-colors">AI 감정 일기</li>
                  <li className="hover:text-[#8BA888] cursor-pointer transition-colors">심리 테스트</li>
                </ul>
              </div>
              <div>
                <h4 className="text-[10px] font-bold text-[#1E293B] mb-4 uppercase tracking-wider">고객지원</h4>
                <ul className="text-[11px] text-slate-400 space-y-2 font-medium">
                  <li className="hover:text-[#8BA888] cursor-pointer transition-colors">공지사항</li>
                  <li className="hover:text-[#8BA888] cursor-pointer transition-colors">자주 묻는 질문</li>
                  <li className="hover:text-[#8BA888] cursor-pointer transition-colors">1:1 문의</li>
                </ul>
              </div>
            </div>
          </div>
          <div className="text-[10px] text-slate-300 font-medium border-t border-slate-200 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-center">
            <span>© 2026 MINDWELL LAB. All rights reserved.</span>
            <div className="flex space-x-4">
              <span className="hover:text-[#8BA888] cursor-pointer">개인정보처리방침</span>
              <span className="hover:text-[#8BA888] cursor-pointer">이용약관</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;