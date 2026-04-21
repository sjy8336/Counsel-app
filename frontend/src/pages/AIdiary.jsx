import React, { useState } from 'react';
import { 
  Bell, 
  Smile, 
  Meh, 
  Frown, 
  Heart, 
  CloudRain,
  ChevronRight,
  Calendar,
  Sparkles,
  Loader2,
  Coffee,
  Clock,
  Menu
} from 'lucide-react';

export default function App() {
  // 1. State 정의
  const [diaryText, setDiaryText] = useState('');
  const [selectedEmotion, setSelectedEmotion] = useState(null);
  const [emotionIntensity, setEmotionIntensity] = useState(0); 
  const [stressLevel, setStressLevel] = useState(0); 
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [viewDiary, setViewDiary] = useState(false);

  const [reportData, setReportData] = useState({
    intensity: 0,
    stress: 0,
    text: '',
    emotionId: null
  });

  // 글자수 제한 설정
  const MAX_LENGTH = 500;

  // 2. 데이터 상수
  const emotions = [
    { id: 'happy', icon: Smile, label: '행복해요', color: 'text-amber-500', bg: 'bg-amber-100', accent: '#f59e0b' },
    { id: 'calm', icon: Heart, label: '평온해요', color: 'text-emerald-500', bg: 'bg-emerald-100', accent: '#10b981' },
    { id: 'tired', icon: Meh, label: '지쳤어요', color: 'text-slate-500', bg: 'bg-slate-100', accent: '#64748b' },
    { id: 'sad', icon: CloudRain, label: '우울해요', color: 'text-blue-500', bg: 'bg-blue-100', accent: '#3b82f6' },
    { id: 'angry', icon: Frown, label: '화가나요', color: 'text-red-500', bg: 'bg-red-100', accent: '#ef4444' },
  ];

  // 3. 헬퍼 변수 및 함수
  const selectedEmotionData = emotions.find(e => e.id === (showResult ? reportData.emotionId : selectedEmotion));

  const isSubmitDisabled = 
    isAnalyzing || 
    !diaryText.trim() || 
    !selectedEmotion || 
    emotionIntensity === 0 || 
    stressLevel === 0;

  const getDynamicAnalysisText = () => {
    const { stress, intensity, emotionId, text } = reportData;
    const emoLabel = emotions.find(e => e.id === emotionId)?.label || "";
    
    let analysis = "";
    let stressAdvice = "";
    let empathy = "";

    if (intensity > 80) {
      analysis = `오늘 느끼신 '${emoLabel}'의 감정은 당신의 마음을 가득 채울 만큼 아주 강렬한 상태입니다. 이 에너지가 당신에게 어떤 의미인지 깊이 들여다보는 시간이 필요해 보여요.`;
    } else if (intensity > 40) {
      analysis = `현재 '${emoLabel}'의 기분을 적절히 느끼고 계시네요. 감정을 억누르지 않고 솔직하게 마주하는 것만으로도 마음의 건강을 지키는 좋은 습관입니다.`;
    } else {
      analysis = `지금의 '${emoLabel}' 감정은 잔잔하게 흐르는 물결 같습니다. 은은하게 느껴지는 이 마음이 일상의 작은 변화를 만들어낼 수도 있어요.`;
    }

    if (stress > 80) {
      stressAdvice = `특히 스트레스 지수가 ${stress}%로 위험 수준에 도달해 있습니다. 기록하신 "${text.substring(0, 10)}..."의 상황이 당신을 많이 짓누르고 있진 않나요? 지금은 정답을 찾기보다 모든 일을 잠시 멈추고 심호흡을 하며 자신을 돌봐야 할 때입니다.`;
    } else if (stress > 50) {
      stressAdvice = `스트레스 지수 ${stress}%는 마음의 경고등이 노란색으로 켜진 상태입니다. 긴장이 몸과 마음을 굳게 만들고 있을 수 있으니, 좋아하는 음악을 듣거나 가벼운 산책으로 환기를 시켜보세요.`;
    } else {
      stressAdvice = `스트레스 지수가 ${stress}%로 매우 건강한 상태입니다. 기록하신 일기 내용처럼 긍정적인 마음의 흐름이 잘 유지되고 있네요.`;
    }

    empathy = `기록해주신 소중한 문장들 속에서 당신의 진심이 온전히 전해집니다. 오늘 하루도 정말 고생 많으셨습니다.`;

    return `${analysis} ${stressAdvice} ${empathy}`;
  };

  // 4. 이벤트 핸들러
  const handleEmotionSelect = (id) => {
    setSelectedEmotion(id);
    setEmotionIntensity(0);
    setStressLevel(0);
  };

  const handleDiaryChange = (e) => {
    const text = e.target.value;
    if (text.length <= MAX_LENGTH) {
      setDiaryText(text);
    }
  };

  const handleAnalyze = () => {
    if (!diaryText.trim() || !selectedEmotion || emotionIntensity <= 0 || stressLevel <= 0) return;
    
    setIsAnalyzing(true);
    setReportData({
      intensity: Number(emotionIntensity),
      stress: Number(stressLevel),
      text: diaryText,
      emotionId: selectedEmotion
    });

    setTimeout(() => {
      setIsAnalyzing(false);
      setShowResult(true);
    }, 1500);
  };

  const handleReset = () => {
    setDiaryText('');
    setSelectedEmotion(null);
    setEmotionIntensity(0);
    setStressLevel(0);
    setShowResult(false);
    setViewDiary(false);
  };

  // 5. 렌더링
  return (
    <div className="min-h-screen bg-[#F8FAFB] font-sans text-slate-800">
      {/* 글로벌 스타일 (상단에 위치) */}
      <style dangerouslySetInnerHTML={{ __html: `
        input[type=range]::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: white;
          cursor: pointer;
          border: 2px solid #E2E8F0;
          box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
          margin-top: -6px;
        }
        @media (min-width: 768px) {
          input[type=range]::-webkit-slider-thumb {
            height: 24px;
            width: 24px;
            margin-top: -8px;
          }
        }
        input[type=range]::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: white;
          cursor: pointer;
          border: 2px solid #E2E8F0;
          box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
        }
        input[type=range] {
          border-radius: 9999px;
        }
      `}} />

      {/* Header */}
      <header className="bg-white px-4 md:px-6 lg:px-12 py-4 flex items-center justify-between border-b border-slate-100 sticky top-0 z-20">
        <div className="flex items-center gap-4 lg:gap-16">
          <div className="md:hidden">
             <Menu size={24} className="text-slate-600" />
          </div>
          <h1 className="text-xl md:text-2xl font-extrabold text-[#8FAD88] tracking-tighter">MINDWELL</h1>
          <nav className="hidden md:flex items-center gap-8 text-[15px] font-medium text-slate-500">
            <a href="#" className="hover:text-slate-900 transition-colors">전문가 찾기</a>
            <a href="#" className="hover:text-slate-900 transition-colors">예약 관리</a>
            <a href="#" className="text-[#8FAD88] font-bold border-b-2 border-[#8FAD88] pb-1">AI 일기</a>
            <a href="#" className="hover:text-slate-900 transition-colors">힐링 라운지</a>
          </nav>
        </div>
        <div className="flex items-center gap-3 md:gap-6">
          <button className="text-slate-400 hover:text-slate-600 relative">
            <Bell size={20} />
            <span className="absolute top-0 right-0 w-2 h-2 bg-red-400 rounded-full border border-white"></span>
          </button>
          <div className="flex items-center gap-2 md:gap-3">
            <div className="w-8 h-8 md:w-9 md:h-9 bg-slate-200 rounded-full overflow-hidden border border-slate-100 shadow-sm">
              <img src="https://api.dicebear.com/7.x/notionists/svg?seed=Felix" alt="Profile" className="w-full h-full" />
            </div>
            <span className="hidden sm:inline text-sm font-semibold">먹보 님</span>
          </div>
        </div>
      </header>

      <main className="max-w-[1280px] mx-auto px-0 md:px-0 lg:px-12 py-0 md:py-6 lg:py-12 flex flex-col lg:flex-row gap-0 md:gap-8">
        {/* Left Section */}
        <div className="w-full lg:flex-[1.8] flex flex-col gap-0 md:gap-6">
          <div className="bg-white rounded-none md:rounded-[32px] p-6 md:p-8 lg:p-10 shadow-none md:shadow-sm border-b md:border border-slate-100/50 min-h-[500px] md:min-h-[600px]">
            <div className="mb-6 md:mb-8">
              <span className="text-[10px] md:text-xs font-bold text-[#8FAD88] bg-[#8FAD88]/10 px-3 py-1 rounded-full mb-3 inline-block">DIARY</span>
              <h2 className="text-xl md:text-2xl lg:text-3xl font-bold mt-1">오늘의 마음을 기록해보세요</h2>
              <p className="text-slate-500 text-xs md:text-sm mt-2">2026년 4월 21일의 기록</p>
            </div>

            {!showResult ? (
              <div className="flex flex-col gap-6 md:gap-8">
                <div>
                  <p className="text-xs md:text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
                    <Sparkles size={16} className="text-[#8FAD88]" />
                    지금 가장 크게 느껴지는 감정은 무엇인가요?
                  </p>
                  <div className="flex flex-wrap gap-2 md:gap-3 -mx-6 md:-mx-8 lg:mx-0 px-6 md:px-8 lg:px-0">
                    {emotions.map((emo) => {
                      const Icon = emo.icon;
                      const isSelected = selectedEmotion === emo.id;
                      return (
                        <button
                          key={emo.id}
                          onClick={() => handleEmotionSelect(emo.id)}
                          className={`flex items-center gap-2 px-4 py-2.5 md:px-5 md:py-3 rounded-xl md:rounded-2xl transition-all ${
                            isSelected ? `${emo.bg} border-2 border-white shadow-md scale-105` : 'bg-slate-50 border-2 border-transparent hover:bg-slate-100'
                          }`}
                        >
                          <Icon className={isSelected ? emo.color : 'text-slate-400'} size={18} />
                          <span className={`font-semibold text-xs md:text-sm ${isSelected ? 'text-slate-800' : 'text-slate-500'}`}>{emo.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {selectedEmotion && (
                  <div className="bg-slate-50 p-4 md:p-6 rounded-2xl md:rounded-3xl border border-slate-100">
                    <div className="flex justify-between items-center mb-4 md:mb-5">
                      <label className="text-[11px] md:text-sm font-bold text-slate-600">감정의 크기를 드래그해서 표현해주세요</label>
                      <span className="text-lg md:text-xl font-black" style={{ color: selectedEmotionData?.accent }}>{emotionIntensity}%</span>
                    </div>
                    <div className="relative h-2 w-full bg-slate-200 rounded-full">
                      <input
                        type="range" min="0" max="100" value={emotionIntensity}
                        onChange={(e) => setEmotionIntensity(e.target.value)}
                        className="absolute top-0 left-0 w-full h-2 appearance-none bg-transparent cursor-pointer z-10"
                        style={{ 
                          background: `linear-gradient(to right, ${selectedEmotionData?.accent} ${emotionIntensity}%, transparent 0%)`,
                          borderRadius: '9999px'
                        }}
                      />
                    </div>
                  </div>
                )}

                <div className="bg-slate-50 p-4 md:p-6 rounded-2xl md:rounded-3xl border border-slate-100">
                  <div className="flex justify-between items-center mb-4 md:mb-5">
                    <label className="text-[11px] md:text-sm font-bold text-slate-600">현재 스트레스 지수를 드래그해서 표현해주세요</label>
                    <span className="text-lg md:text-xl font-black text-[#8FAD88]">{stressLevel}%</span>
                  </div>
                  <div className="relative h-2 w-full bg-slate-200 rounded-full">
                    <input
                      type="range" min="0" max="100" value={stressLevel}
                      onChange={(e) => setStressLevel(e.target.value)}
                      className="absolute top-0 left-0 w-full h-2 appearance-none bg-transparent cursor-pointer z-10"
                      style={{ 
                        background: `linear-gradient(to right, #8FAD88 ${stressLevel}%, transparent 0%)`,
                        borderRadius: '9999px'
                      }}
                    />
                  </div>
                </div>

                <div className="relative">
                  <textarea
                    value={diaryText}
                    onChange={handleDiaryChange}
                    placeholder="오늘 하루 어떤 일이 있었나요? 솔직한 마음을 편안하게 적어주세요."
                    className="w-full bg-slate-50 rounded-2xl md:rounded-3xl p-4 md:p-6 h-40 md:h-48 text-sm md:text-base text-slate-700 resize-none border border-transparent focus:ring-2 focus:ring-[#8FAD88]/30 focus:outline-none transition-all"
                  />
                  <div className="absolute bottom-4 right-6 text-[11px] md:text-xs font-medium text-slate-400">
                    <span className={diaryText.length >= MAX_LENGTH ? 'text-red-400 font-bold' : ''}>{diaryText.length}</span> / {MAX_LENGTH}자
                  </div>
                </div>

                <div className="flex justify-center md:justify-end">
                  <button
                    onClick={handleAnalyze}
                    disabled={isSubmitDisabled}
                    className="w-full md:w-auto bg-[#8FAD88] hover:bg-[#7a9673] disabled:bg-slate-300 text-white font-bold py-3 md:py-4 px-10 rounded-xl md:rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-95"
                  >
                    {isAnalyzing ? <Loader2 size={20} className="animate-spin" /> : <Sparkles size={20} />}
                    {isAnalyzing ? "마음 분석 중..." : "AI 분석받기"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center py-6 md:py-10 animate-in fade-in zoom-in duration-500 text-center">
                <div className="w-16 h-16 md:w-20 md:h-20 bg-[#8FAD88]/10 rounded-full flex items-center justify-center mb-6">
                  <Sparkles className="text-[#8FAD88]" size={30} />
                </div>
                <h3 className="text-xl md:text-2xl font-bold mb-6 md:mb-8">분석이 완료되었습니다</h3>
                
                <div className="w-full max-w-lg space-y-4 px-4 md:px-0">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1 bg-slate-50 p-4 md:p-5 rounded-2xl border border-slate-100 flex justify-between items-center">
                      <span className="text-xs md:text-sm font-bold text-slate-500">스트레스</span>
                      <span className="text-base md:text-lg font-black text-[#8FAD88]">{reportData.stress}%</span>
                    </div>
                    <div className="flex-1 bg-slate-50 p-4 md:p-5 rounded-2xl border border-slate-100 flex justify-between items-center">
                      <span className="text-xs md:text-sm font-bold text-slate-500">감정 강도</span>
                      <span className="text-base md:text-lg font-black" style={{ color: selectedEmotionData?.accent }}>{reportData.intensity}%</span>
                    </div>
                  </div>
                  
                  {/* 일기 본문 노출 영역 (스트레스/감정 강도 밑에 위치) */}
                  <div className="bg-slate-50 p-5 md:p-6 rounded-2xl border border-slate-100 text-left">
                    <p className="text-sm md:text-base text-slate-700 leading-relaxed italic">"{reportData.text}"</p>
                  </div>
                </div>
                
                <div className="mt-8 md:mt-10 flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
                  <button onClick={handleReset} className="text-sm md:text-base text-[#8FAD88] font-bold hover:underline">
                    새 일기 작성하기
                  </button>
                  <div className="hidden sm:block w-[1px] h-4 bg-slate-200"></div>
                  <button className="text-sm md:text-base text-slate-500 font-bold hover:text-slate-800 transition-colors">
                    작성한 일기 보기
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Section */}
        <div className="w-full lg:flex-1 flex flex-col gap-0 md:gap-6">
          {showResult ? (
            <div className="flex flex-col gap-0 md:gap-6 lg:sticky lg:top-28 animate-in slide-in-from-right duration-500">
              <div className="bg-white rounded-none md:rounded-[28px] p-6 md:p-8 shadow-none md:shadow-sm border-b md:border border-slate-100">
                <h3 className="font-bold text-lg md:text-xl mb-6 md:mb-8 flex items-center gap-3">
                  <Sparkles className="text-[#8FAD88]" size={20} />
                  감정 분석 리포트
                </h3>
                
                <div className="space-y-6 mb-8">
                  <div>
                    <div className="flex justify-between text-[11px] md:text-sm mb-2">
                      <span className="text-slate-600 font-semibold">스트레스/피로</span>
                      <span className="font-bold text-amber-500">{reportData.stress}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 md:h-3 overflow-hidden">
                      <div className="bg-amber-400 h-full rounded-full" style={{ width: `${reportData.stress}%` }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] md:text-sm mb-2">
                      <span className="text-slate-600 font-semibold">감정 선명도({selectedEmotionData?.label})</span>
                      <span className="font-bold" style={{ color: selectedEmotionData?.accent }}>{reportData.intensity}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 md:h-3 overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${reportData.intensity}%`, backgroundColor: selectedEmotionData?.accent }}></div>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 p-4 md:p-6 rounded-2xl border-l-4 border-[#8FAD88]">
                  <p className="text-[13px] md:text-sm leading-relaxed text-slate-700 font-medium whitespace-pre-line">{getDynamicAnalysisText()}</p>
                </div>
              </div>

              <div className="bg-white rounded-none md:rounded-[28px] p-6 md:p-8 shadow-none md:shadow-sm border-b md:border border-slate-100">
                <h3 className="font-bold text-[10px] md:text-sm text-slate-400 uppercase tracking-widest mb-4 md:mb-6 flex items-center gap-2">
                  <Coffee size={14} /> 오늘의 힐링 처방
                </h3>
                <div className="flex items-center gap-4 md:gap-5">
                  <div className="w-12 h-12 md:w-16 md:h-16 bg-amber-50 rounded-xl md:rounded-2xl flex items-center justify-center flex-shrink-0">
                    <Coffee className="text-amber-600" size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-base md:text-lg mb-1">따뜻한 캐모마일 차</h4>
                    <p className="text-[10px] md:text-xs text-slate-500">긴장을 완화하고 마음을 차분하게 해줄 거예요.</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-0 md:gap-6 lg:sticky lg:top-28">
              <div className="bg-white rounded-none md:rounded-[28px] p-6 md:p-6 shadow-none md:shadow-sm border-b md:border border-slate-100">
                <div className="flex justify-between items-center mb-6">
                   <h3 className="font-bold text-base md:text-[17px] flex items-center gap-2 text-slate-800">
                     <Clock size={18} className="text-slate-400" /> 최근 기록
                   </h3>
                   <button className="text-[12px] text-slate-400 hover:text-slate-600">전체보기</button>
                </div>

                <div className="space-y-3">
                  <div className="bg-[#8FAD88]/70 rounded-[20px] md:rounded-[22px] p-4 md:p-5 text-white relative">
                    <div className="absolute top-4 right-5 opacity-40"><Smile size={20} /></div>
                    <span className="bg-white/20 text-[9px] md:text-[10px] px-2 py-0.5 rounded-full font-bold mb-3 inline-block">D-1</span>
                    <h4 className="text-sm md:text-[15px] font-bold mb-1">오랜만에 친구를 만났다</h4>
                    <p className="text-[11px] md:text-[12px] opacity-80 mb-4">즐거운 저녁 식사 시간이었다.</p>
                    <div className="bg-white/10 w-fit px-3 py-1.5 rounded-lg flex items-center gap-2 text-[10px] md:text-[11px]">
                      <Calendar size={12} /> 5월 20일 (수)
                    </div>
                  </div>

                  <div className="border border-slate-50 rounded-[20px] md:rounded-[22px] p-4 md:p-5 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer group">
                    <div className="flex flex-col gap-1">
                      <p className="text-[9px] md:text-[10px] text-slate-400 font-bold uppercase tracking-wider">2 days ago</p>
                      <h4 className="text-sm md:text-[14px] font-bold text-slate-700">업무 스트레스가 심한 날</h4>
                      <p className="text-[10px] md:text-[11px] text-slate-400">회의가 너무 많아서 지쳤다.</p>
                      <div className="mt-3 bg-slate-50 w-fit px-3 py-1.5 rounded-lg flex items-center gap-2 text-[10px] md:text-[11px] text-slate-500">
                        <Calendar size={12} /> 5월 19일 (화)
                      </div>
                    </div>
                    <ChevronRight size={18} className="text-slate-300 group-hover:text-[#8FAD88] transition-colors" />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}