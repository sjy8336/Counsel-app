import React, { useState } from 'react';
import './App3.css';
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

  const MAX_LENGTH = 500;

  const emotions = [
    { id: 'happy', icon: Smile,     label: '행복해요', accent: '#f59e0b' },
    { id: 'calm',  icon: Heart,     label: '평온해요', accent: '#10b981' },
    { id: 'tired', icon: Meh,       label: '지쳤어요', accent: '#64748b' },
    { id: 'sad',   icon: CloudRain, label: '우울해요', accent: '#3b82f6' },
    { id: 'angry', icon: Frown,     label: '화가나요', accent: '#ef4444' },
  ];

  const selectedEmotionData = emotions.find(
    e => e.id === (showResult ? reportData.emotionId : selectedEmotion)
  );

  const isSubmitDisabled =
    isAnalyzing ||
    !diaryText.trim() ||
    !selectedEmotion ||
    emotionIntensity === 0 ||
    stressLevel === 0;

  const getDynamicAnalysisText = () => {
    const { stress, intensity, emotionId, text } = reportData;
    const emoLabel = emotions.find(e => e.id === emotionId)?.label || '';
    let analysis = '';
    let stressAdvice = '';
    const empathy = `기록해주신 소중한 문장들 속에서 당신의 진심이 온전히 전해집니다. 오늘 하루도 정말 고생 많으셨습니다.`;

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

    return `${analysis} ${stressAdvice} ${empathy}`;
  };

  const handleEmotionSelect = (id) => {
    setSelectedEmotion(id);
    setEmotionIntensity(0);
    setStressLevel(0);
  };

  const handleDiaryChange = (e) => {
    const text = e.target.value;
    if (text.length <= MAX_LENGTH) setDiaryText(text);
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

  return (
    <div className="mw3-root">

      {/* Header */}
      <header className="mw3-header">
        <div className="mw3-header-left">
          <div className="mw3-header-menu">
            <Menu size={24} />
          </div>
          <h1 className="mw3-logo">MINDWELL</h1>
          <nav className="mw3-nav">
            <a href="#">전문가 찾기</a>
            <a href="#">예약 관리</a>
            <a href="#" className="mw3-nav-active">AI 일기</a>
            <a href="#">힐링 라운지</a>
          </nav>
        </div>
        <div className="mw3-header-right">
          <button className="mw3-bell-btn">
            <Bell size={20} />
            <span className="mw3-bell-dot" />
          </button>
          <div className="mw3-profile">
            <div className="mw3-avatar">
              <img src="https://api.dicebear.com/7.x/notionists/svg?seed=Felix" alt="Profile" />
            </div>
            <span className="mw3-username">먹보 님</span>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="mw3-main">

        {/* Left Section */}
        <div className="mw3-left">
          <div className="mw3-diary-card">
            <div className="mw3-diary-header">
              <span className="mw3-diary-badge">DIARY</span>
              <h2 className="mw3-diary-title">오늘의 마음을 기록해보세요</h2>
              <p className="mw3-diary-date">2026년 4월 21일의 기록</p>
            </div>

            {!showResult ? (
              <div className="mw3-form">

                {/* 감정 선택 */}
                <div>
                  <p className="mw3-section-label">
                    <Sparkles size={16} className="mw3-label-icon" />
                    지금 가장 크게 느껴지는 감정은 무엇인가요?
                  </p>
                  <div className="mw3-emotion-list">
                    {emotions.map((emo) => {
                      const Icon = emo.icon;
                      const isSelected = selectedEmotion === emo.id;
                      return (
                        <button
                          key={emo.id}
                          onClick={() => handleEmotionSelect(emo.id)}
                          className={`mw3-emotion-btn${isSelected ? ` mw3-emotion-btn--selected mw3-emotion-btn--${emo.id}` : ''}`}
                        >
                          <Icon size={18} className={isSelected ? `mw3-emotion-icon--${emo.id}` : 'mw3-emotion-icon--default'} />
                          <span>{emo.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 감정 강도 슬라이더 */}
                {selectedEmotion && (
                  <div className="mw3-slider-box">
                    <div className="mw3-slider-header">
                      <label className="mw3-slider-label">감정의 크기를 드래그해서 표현해주세요</label>
                      <span className="mw3-slider-value" style={{ color: selectedEmotionData?.accent }}>
                        {emotionIntensity}%
                      </span>
                    </div>
                    <div className="mw3-slider-track">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={emotionIntensity}
                        onChange={(e) => setEmotionIntensity(e.target.value)}
                        className="mw3-slider-input"
                        style={{
                          background: `linear-gradient(to right, ${selectedEmotionData?.accent} ${emotionIntensity}%, transparent 0%)`
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* 스트레스 슬라이더 */}
                <div className="mw3-slider-box">
                  <div className="mw3-slider-header">
                    <label className="mw3-slider-label">현재 스트레스 지수를 드래그해서 표현해주세요</label>
                    <span className="mw3-slider-value mw3-slider-value--stress">{stressLevel}%</span>
                  </div>
                  <div className="mw3-slider-track">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={stressLevel}
                      onChange={(e) => setStressLevel(e.target.value)}
                      className="mw3-slider-input"
                      style={{
                        background: `linear-gradient(to right, #8FAD88 ${stressLevel}%, transparent 0%)`
                      }}
                    />
                  </div>
                </div>

                {/* 텍스트에어리어 */}
                <div className="mw3-textarea-wrap">
                  <textarea
                    value={diaryText}
                    onChange={handleDiaryChange}
                    placeholder="오늘 하루 어떤 일이 있었나요? 솔직한 마음을 편안하게 적어주세요."
                    className="mw3-textarea"
                  />
                  <div className="mw3-char-count">
                    <span className={diaryText.length >= MAX_LENGTH ? 'mw3-char-count--over' : ''}>
                      {diaryText.length}
                    </span>{' '}/ {MAX_LENGTH}자
                  </div>
                </div>

                {/* 제출 버튼 */}
                <div className="mw3-submit-row">
                  <button
                    onClick={handleAnalyze}
                    disabled={isSubmitDisabled}
                    className="mw3-submit-btn"
                  >
                    {isAnalyzing
                      ? <Loader2 size={20} className="mw3-spin" />
                      : <Sparkles size={20} />
                    }
                    {isAnalyzing ? '마음 분석 중...' : 'AI 분석받기'}
                  </button>
                </div>
              </div>

            ) : (
              /* 결과 뷰 */
              <div className="mw3-result">
                <div className="mw3-result-icon">
                  <Sparkles size={30} />
                </div>
                <h3 className="mw3-result-title">분석이 완료되었습니다</h3>

                <div className="mw3-result-stats">
                  <div className="mw3-result-stat-row">
                    <div className="mw3-result-stat-box">
                      <span className="mw3-result-stat-label">스트레스</span>
                      <span className="mw3-result-stat-value--stress">{reportData.stress}%</span>
                    </div>
                    <div className="mw3-result-stat-box">
                      <span className="mw3-result-stat-label">감정 강도</span>
                      <span className="mw3-result-stat-value--emotion" style={{ color: selectedEmotionData?.accent }}>
                        {reportData.intensity}%
                      </span>
                    </div>
                  </div>

                  <div className="mw3-result-quote">
                    <p>"{reportData.text}"</p>
                  </div>
                </div>

                <div className="mw3-result-actions">
                  <button onClick={handleReset} className="mw3-result-reset-btn">
                    새 일기 작성하기
                  </button>
                  <div className="mw3-result-divider" />
                  <button className="mw3-result-view-btn">
                    작성한 일기 보기
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Section */}
        <div className="mw3-right">
          {showResult ? (
            <div className="mw3-result-panel">

              {/* 감정 분석 리포트 */}
              <div className="mw3-report-card">
                <h3 className="mw3-report-title">
                  <Sparkles size={20} className="mw3-report-title-icon" />
                  감정 분석 리포트
                </h3>

                <div className="mw3-report-bars">
                  <div>
                    <div className="mw3-bar-header">
                      <span className="mw3-bar-label">스트레스/피로</span>
                      <span className="mw3-bar-value--stress">{reportData.stress}%</span>
                    </div>
                    <div className="mw3-bar-track">
                      <div className="mw3-bar-fill--stress" style={{ width: `${reportData.stress}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="mw3-bar-header">
                      <span className="mw3-bar-label">감정 선명도({selectedEmotionData?.label})</span>
                      <span className="mw3-bar-value--emotion" style={{ color: selectedEmotionData?.accent }}>
                        {reportData.intensity}%
                      </span>
                    </div>
                    <div className="mw3-bar-track">
                      <div
                        className="mw3-bar-fill--emotion"
                        style={{
                          width: `${reportData.intensity}%`,
                          backgroundColor: selectedEmotionData?.accent
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div className="mw3-analysis-box">
                  <p className="mw3-analysis-text">{getDynamicAnalysisText()}</p>
                </div>
              </div>

              {/* 힐링 처방 */}
              <div className="mw3-healing-card">
                <h3 className="mw3-healing-title">
                  <Coffee size={14} /> 오늘의 힐링 처방
                </h3>
                <div className="mw3-healing-body">
                  <div className="mw3-healing-icon">
                    <Coffee size={24} />
                  </div>
                  <div>
                    <h4 className="mw3-healing-name">따뜻한 캐모마일 차</h4>
                    <p className="mw3-healing-desc">긴장을 완화하고 마음을 차분하게 해줄 거예요.</p>
                  </div>
                </div>
              </div>
            </div>

          ) : (
            <div className="mw3-default-panel">

              {/* 최근 기록 */}
              <div className="mw3-recent-card">
                <div className="mw3-recent-header">
                  <h3 className="mw3-recent-title">
                    <Clock size={18} className="mw3-recent-title-icon" /> 최근 기록
                  </h3>
                  <button className="mw3-recent-all-btn">전체보기</button>
                </div>

                <div className="mw3-recent-list">
                  {/* 첫 번째 카드 (초록 배경) */}
                  <div className="mw3-recent-item--primary">
                    <div className="mw3-recent-primary-icon">
                      <Smile size={20} />
                    </div>
                    <span className="mw3-recent-badge">D-1</span>
                    <h4 className="mw3-recent-primary-title">오랜만에 친구를 만났다</h4>
                    <p className="mw3-recent-primary-desc">즐거운 저녁 식사 시간이었다.</p>
                    <div className="mw3-recent-primary-date">
                      <Calendar size={12} /> 5월 20일 (수)
                    </div>
                  </div>

                  {/* 두 번째 카드 (흰 배경) */}
                  <div className="mw3-recent-item--secondary">
                    <div className="mw3-recent-secondary-body">
                      <p className="mw3-recent-ago">2 days ago</p>
                      <h4 className="mw3-recent-secondary-title">업무 스트레스가 심한 날</h4>
                      <p className="mw3-recent-secondary-desc">회의가 너무 많아서 지쳤다.</p>
                      <div className="mw3-recent-secondary-date">
                        <Calendar size={12} /> 5월 19일 (화)
                      </div>
                    </div>
                    <ChevronRight size={18} className="mw3-recent-chevron" />
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