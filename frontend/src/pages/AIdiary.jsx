import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/header.jsx';
import Footer from '../components/footer.jsx';
import MobileTap from '../components/mobileTap.jsx';
import '../static/AIdiary.css';
import { analyzeDiary, getRecentDiaries } from '../api/aiDiary';
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
    Menu,
    Headphones,
    Footprints,
} from 'lucide-react';
// AI 힐링 처방 아이콘 매핑
const healingIcons = {
    tea: Coffee,
    music: Headphones,
    walk: Footprints,
    scent: Sparkles,
    home: Heart,
};

export default function AIDiary({ userName, setUserName, isLoggedIn, setIsLoggedIn }) {
    const [recentDiaries, setRecentDiaries] = useState([]);
    // 뒤로가기 버튼 및 모바일 관련 코드 제거
    const [diaryText, setDiaryText] = useState('');
    const [selectedEmotion, setSelectedEmotion] = useState(null);
    const [emotionIntensity, setEmotionIntensity] = useState(0);
    const [stressLevel, setStressLevel] = useState(0);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [showResult, setShowResult] = useState(false);
    const [viewDiary, setViewDiary] = useState(false);
    const [activeTab, setActiveTab] = useState('AIdiary');

    const [reportData, setReportData] = useState({
        intensity: 0,
        stress: 0,
        text: '',
        emotionId: null,
        aiAnalysis: '',
        healingTitle: '',
        healingDesc: '',
        healingIcon: 'tea',
    });

    const navigate = useNavigate();

    useEffect(() => {
        const fetchRecent = async () => {
            try {
                const data = await getRecentDiaries(3);
                setRecentDiaries(data);
            } catch (e) {
                setRecentDiaries([]);
            }
        };
        fetchRecent();
    }, []);

    const MAX_LENGTH = 500;

    const emotions = [
        { id: 'happy', icon: Smile, label: '행복해요', accent: '#f59e0b' },
        { id: 'calm', icon: Heart, label: '평온해요', accent: '#10b981' },
        { id: 'tired', icon: Meh, label: '지쳤어요', accent: '#64748b' },
        { id: 'sad', icon: CloudRain, label: '우울해요', accent: '#3b82f6' },
        { id: 'angry', icon: Frown, label: '화가나요', accent: '#ef4444' },
    ];

    const selectedEmotionData = emotions.find((e) => e.id === (showResult ? reportData.emotionId : selectedEmotion));

    const isSubmitDisabled = isAnalyzing || !diaryText.trim() || !selectedEmotion || emotionIntensity === 0;

    const getDynamicAnalysisText = () => {
        const { stress, intensity, emotionId, text } = reportData;
        const emoLabel = emotions.find((e) => e.id === emotionId)?.label || '';
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
        // setStressLevel(0); // 감정 선택 시 스트레스 지수는 리셋하지 않음
    };

    const handleDiaryChange = (e) => {
        const text = e.target.value;
        if (text.length <= MAX_LENGTH) setDiaryText(text);
    };

    const handleAnalyze = async () => {
        if (!diaryText.trim() || !selectedEmotion || emotionIntensity <= 0) return;

        try {
            setIsAnalyzing(true);
            const data = await analyzeDiary({
                diary_text: diaryText,
                selected_emotion: selectedEmotion,
                emotion_intensity: emotionIntensity,
                stress_level: stressLevel,
            });
            setReportData({
                intensity: data.emotion_intensity,
                stress: data.stress_level,
                text: data.diary_text,
                emotionId: data.selected_emotion,
                aiAnalysis: data.ai_analysis,
                healingTitle: data.healing_title,
                healingDesc: data.healing_desc,
                healingIcon: data.healing_icon || 'tea',
            });
            setShowResult(true);
        } catch (err) {
            console.error('AI 분석 실패:', err);
            alert('분석 중 오류가 발생했습니다.');
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleReset = async () => {
        setDiaryText('');
        setSelectedEmotion(null);
        setEmotionIntensity(0);
        setStressLevel(0);
        setShowResult(false);
        setViewDiary(false);
        // 새 일기 작성 시 최근 일기 목록 즉시 갱신
        try {
            const data = await getRecentDiaries(3);
            setRecentDiaries(data);
        } catch (e) {
            setRecentDiaries([]);
        }
    };

    // 탭 클릭 시 라우팅 함수
    const handleTabChange = (tab) => {
        setActiveTab(tab);
        if (tab === 'home') navigate('/');
        else if (tab === 'CounselorList') navigate('/CounselorList');
        else if (tab === 'Reservation') navigate('/Reservation');
        else if (tab === 'AIdiary') navigate('/AIdiary');
        else if (tab === 'HealingLounge') navigate('/healing');
        else if (tab === 'CounselorClient') navigate('/CounselorClient');
        else if (tab === 'CounselorPlanner') navigate('/CounselorPlanner');
        else if (tab === 'mypage') navigate('/mypage');
    };

    return (
        <div className="mw3-root">
            <Header
                activeTab={activeTab}
                setActiveTab={handleTabChange}
                userName={userName}
                setUserName={setUserName}
                isLoggedIn={isLoggedIn}
                setIsLoggedIn={setIsLoggedIn}
            />

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
                                                    <Icon
                                                        size={18}
                                                        className={
                                                            isSelected
                                                                ? `mw3-emotion-icon--${emo.id}`
                                                                : 'mw3-emotion-icon--default'
                                                        }
                                                    />
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
                                            <label className="mw3-slider-label">
                                                감정의 크기를 드래그해서 표현해주세요
                                            </label>
                                            <span
                                                className="mw3-slider-value"
                                                style={{ color: selectedEmotionData?.accent }}
                                            >
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
                                                    background: `linear-gradient(to right, ${selectedEmotionData?.accent} ${emotionIntensity}%, transparent 0%)`,
                                                }}
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* 스트레스 슬라이더 */}
                                <div className="mw3-slider-box">
                                    <div className="mw3-slider-header">
                                        <label className="mw3-slider-label">
                                            현재 스트레스 지수를 드래그해서 표현해주세요
                                        </label>
                                        <span className="mw3-slider-value mw3-slider-value--stress">
                                            {stressLevel}%
                                        </span>
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
                                                background: `linear-gradient(to right, #8FAD88 ${stressLevel}%, transparent 0%)`,
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
                                        </span>{' '}
                                        / {MAX_LENGTH}자
                                    </div>
                                </div>

                                {/* 제출 버튼 */}
                                <div className="mw3-submit-row">
                                    <button
                                        onClick={handleAnalyze}
                                        disabled={isSubmitDisabled}
                                        className="mw3-submit-btn"
                                    >
                                        {isAnalyzing ? (
                                            <Loader2 size={20} className="mw3-spin" />
                                        ) : (
                                            <Sparkles size={20} />
                                        )}
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
                                            <span
                                                className="mw3-result-stat-value--emotion"
                                                style={{ color: selectedEmotionData?.accent }}
                                            >
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
                                    <button className="mw3-result-view-btn">작성한 일기 보기</button>
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
                                            <div
                                                className="mw3-bar-fill--stress"
                                                style={{ width: `${reportData.stress}%` }}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <div className="mw3-bar-header">
                                            <span className="mw3-bar-label">
                                                감정 선명도({selectedEmotionData?.label})
                                            </span>
                                            <span
                                                className="mw3-bar-value--emotion"
                                                style={{ color: selectedEmotionData?.accent }}
                                            >
                                                {reportData.intensity}%
                                            </span>
                                        </div>
                                        <div className="mw3-bar-track">
                                            <div
                                                className="mw3-bar-fill--emotion"
                                                style={{
                                                    width: `${reportData.intensity}%`,
                                                    backgroundColor: selectedEmotionData?.accent,
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="mw3-analysis-box">
                                    <p className="mw3-analysis-text">{reportData.aiAnalysis}</p>
                                </div>
                            </div>

                            {/* 힐링 처방 */}
                            <div className="mw3-healing-card">
                                <h3 className="mw3-healing-title">
                                    <Coffee size={14} /> 오늘의 힐링 처방
                                </h3>
                                <div className="mw3-healing-body">
                                    <div className="mw3-healing-icon">
                                        {(() => {
                                            const Icon = healingIcons[reportData.healingIcon] || Coffee;
                                            return <Icon size={24} />;
                                        })()}
                                    </div>
                                    <div>
                                        <h4 className="mw3-healing-name">
                                            {reportData.healingTitle || 'AI 힐링 처방'}
                                        </h4>
                                        <p className="mw3-healing-desc">
                                            {reportData.healingDesc || 'AI가 추천하는 힐링 요소가 여기에 표시됩니다.'}
                                        </p>
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
                                    <button
                                        className="mw3-recent-all-btn"
                                        onClick={() => navigate('/Diary', { state: { viewMode: 'list' } })}
                                    >
                                        전체보기
                                    </button>
                                </div>

                                <div className="mw3-recent-list">
                                    {recentDiaries.length === 0 && (
                                        <div className="mw3-recent-item--secondary">
                                            <div className="mw3-recent-secondary-body">
                                                <p className="mw3-recent-ago">최근 작성된 일기가 없습니다.</p>
                                            </div>
                                        </div>
                                    )}
                                    {recentDiaries.map((diary, idx) => {
                                        const emo = emotions.find((e) => e.id === diary.selected_emotion);
                                        const dateObj = new Date(diary.created_at);
                                        const dateStr = `${dateObj.getMonth() + 1}월 ${dateObj.getDate()}일 (${['일', '월', '화', '수', '목', '금', '토'][dateObj.getDay()]})`;
                                        if (idx === 0) {
                                            return (
                                                <div key={diary.id} className="mw3-recent-item--primary">
                                                    <div className="mw3-recent-primary-icon">
                                                        {emo ? <emo.icon size={20} /> : <Smile size={20} />}
                                                    </div>
                                                    <span className="mw3-recent-badge">D-1</span>
                                                    <h4 className="mw3-recent-primary-title">
                                                        {diary.healing_title ||
                                                            diary.diary_text.slice(0, 15) +
                                                                (diary.diary_text.length > 15 ? '...' : '')}
                                                    </h4>
                                                    <p className="mw3-recent-primary-desc">
                                                        {diary.diary_text.slice(0, 30) +
                                                            (diary.diary_text.length > 30 ? '...' : '')}
                                                    </p>
                                                    <div className="mw3-recent-primary-date">
                                                        <Calendar size={12} /> {dateStr}
                                                    </div>
                                                </div>
                                            );
                                        } else {
                                            return (
                                                <div key={diary.id} className="mw3-recent-item--secondary">
                                                    <div className="mw3-recent-secondary-body">
                                                        <h4 className="mw3-recent-secondary-title">
                                                            {diary.healing_title ||
                                                                diary.diary_text.slice(0, 15) +
                                                                    (diary.diary_text.length > 15 ? '...' : '')}
                                                        </h4>
                                                        <p className="mw3-recent-secondary-desc">
                                                            {diary.diary_text.slice(0, 30) +
                                                                (diary.diary_text.length > 30 ? '...' : '')}
                                                        </p>
                                                        <div className="mw3-recent-secondary-date">
                                                            <Calendar size={12} /> {dateStr}
                                                        </div>
                                                        <ChevronRight size={18} className="mw3-recent-chevron" />
                                                    </div>
                                                </div>
                                            );
                                        }
                                    })}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>
            <MobileTap activeTab={activeTab} setActiveTab={handleTabChange} />
            <Footer />
        </div>
    );
}
