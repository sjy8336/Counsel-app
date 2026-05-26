import React, { useState, useEffect } from 'react';
import { getRecentDiaries } from '../api/aiDiary';
import { useNavigate, useLocation } from 'react-router-dom';
import Header from '../components/header.jsx';
import Footer from '../components/footer.jsx';
import MobileTap from '../components/mobileTap.jsx';
import {
    Bell,
    Calendar,
    X,
    Sparkles,
    Heart,
    Coffee,
    Smile,
    Frown,
    Meh,
    Annoyed,
    Angry,
    List,
    ChevronLeft,
    ChevronRight,
    PenLine,
    Activity,
} from 'lucide-react';
import '../static/Diary.css';

// AI 처방/효능 박스 컴포넌트 및 아이콘 매핑
const healingIconMap = {
    tea: <Coffee />, // healing_icon 값이 tea일 때 등
    coffee: <Coffee />, // 예시
    // 필요시 추가: music: <MusicIcon />, walk: <WalkIcon /> 등
};

function AIHealingBox({ diary }) {
    const [showDesc, setShowDesc] = useState(false);
    if (!diary) return null;
    const { healing_title, healing_desc, healing_icon } = diary;
    return (
        <div className="mw-ai-feedback-footer">
            <div className="mw-ai-healing-row">
                <div className="mw-ai-recommendation">
                    <div className="mw-ai-rec-icon">{healingIconMap[healing_icon] || <Coffee />}</div>
                    <div>
                        <div className="mw-ai-rec-label">Recommendation</div>
                        <div className="mw-ai-rec-value">{healing_title || '힐링 처방'}</div>
                    </div>
                </div>
                <button className="mw-ai-more-btn" onClick={() => setShowDesc((v) => !v)}>
                    {showDesc ? '닫기' : '더 보기'}
                </button>
            </div>
            {showDesc && healing_desc && <div className="mw-ai-healing-desc">{healing_desc}</div>}
        </div>
    );
}

// --- Helper Components ---
const MoodIcon = ({ mood, className = '' }) => {
    const moodClass = `mw-icon-${mood || 'calm'}`;
    switch (mood) {
        case 'happy':
            return <Smile className={`${moodClass} ${className}`} />;
        case 'anxious':
            return <Annoyed className={`${moodClass} ${className}`} />;
        case 'sad':
            return <Frown className={`${moodClass} ${className}`} />;
        case 'angry':
            return <Angry className={`${moodClass} ${className}`} />;
        case 'calm':
        default:
            return <Meh className={`mw-icon-calm ${className}`} />;
    }
};

const MoodBadge = ({ mood }) => {
    const labels = {
        happy: '행복/기쁨',
        anxious: '불안/긴장',
        sad: '우울/슬픔',
        angry: '화남/분노',
        calm: '평온/안정',
    };
    return <span className={`mw-mood-badge mw-mood-badge-${mood || 'calm'}`}>{labels[mood] || labels.calm}</span>;
};

const StressBadge = ({ level }) => {
    const colorClass =
        level > 70 ? 'mw-stress-badge-high' : level > 40 ? 'mw-stress-badge-medium' : 'mw-stress-badge-low';
    return (
        <span className={`mw-stress-badge ${colorClass}`}>
            <Activity />
            스트레스 {level}%
        </span>
    );
};
export default function App({ userName, setUserName, isLoggedIn, setIsLoggedIn }) {
    // DB에서 불러온 일기 데이터
    const [diaryData, setDiaryData] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const location = useLocation();
    const [selectedDiary, setSelectedDiary] = useState(null);
    // 모달이 열릴 때 body 스크롤 방지
    useEffect(() => {
        if (selectedDiary) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [selectedDiary]);

    // 일기 데이터 불러오기
    useEffect(() => {
        async function fetchDiaries() {
            setLoading(true);
            try {
                // limit을 충분히 크게 설정해 전체 목록을 불러옴
                const diaries = await getRecentDiaries(100);
                setDiaryData(diaries);
            } catch (e) {
                setDiaryData([]);
            }
            setLoading(false);
        }
        fetchDiaries();
    }, []);
    const handleWheel = (e) => {
        window.scrollBy(0, e.deltaY);
    };
    const [viewMode, setViewMode] = useState(location.state?.viewMode || 'calendar');
    // 최신 일기 기준으로 달력 월 자동 이동
    const getLatestDate = () => {
        if (diaryData.length === 0) return new Date();
        const latest = diaryData.reduce((latest, cur) => {
            if (!latest) return cur;
            return new Date(cur.created_at) > new Date(latest.created_at) ? cur : latest;
        }, null);
        if (!latest) return new Date();
        const d = new Date(latest.created_at);
        return new Date(d.getFullYear(), d.getMonth(), 1);
    };
    const [currentDate, setCurrentDate] = useState(getLatestDate());

    // diaryData가 바뀌면 최신 일기 월로 이동
    useEffect(() => {
        if (diaryData.length > 0) {
            setCurrentDate(getLatestDate());
        }
    }, [diaryData]);
    const [activeTab, setActiveTab] = useState('diary');

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const goToPrevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
    const goToNextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

    if (loading) {
        return (
            <div className="mw-diary-root">
                <div className="mw-main">로딩 중...</div>
            </div>
        );
    }

    // 날짜 파싱 함수 (DB 데이터 → year/month/day)
    function parseDate(diary) {
        // created_at: "2026-04-20T12:34:56.000Z" 등
        const dateObj = new Date(diary.created_at);
        return {
            year: dateObj.getFullYear(),
            month: dateObj.getMonth(), // 0-indexed
            day: dateObj.getDate(),
            dateStr: `${dateObj.getFullYear()}. ${(dateObj.getMonth() + 1).toString().padStart(2, '0')}. ${dateObj.getDate().toString().padStart(2, '0')}`,
        };
    }

    // calendar/list에서 사용할 diaryData 변환
    const mappedDiaryData = diaryData.map((diary) => {
        const { year, month, day, dateStr } = parseDate(diary);
        return {
            ...diary,
            year,
            month,
            day,
            date: dateStr,
            mood: diary.selected_emotion,
            stress: diary.stress_level,
            title: diary.diary_text.slice(0, 20) + (diary.diary_text.length > 20 ? '...' : ''), // 제목이 없으므로 일부만
            content: diary.diary_text,
            aiFeedback: diary.ai_analysis,
            tags: diary.keywords || [],
        };
    });

    // 가장 최근 일기(최신 created_at) 찾기
    const latestDiary = mappedDiaryData.reduce((latest, cur) => {
        if (!latest) return cur;
        return new Date(cur.created_at) > new Date(latest.created_at) ? cur : latest;
    }, null);

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const startDayOfWeek = new Date(year, month, 1).getDay();
    const calendarDays = [];

    for (let i = 0; i < startDayOfWeek; i++) calendarDays.push(null);
    for (let i = 1; i <= daysInMonth; i++) calendarDays.push(i);

    return (
        <div className="mw-diary-root" onWheel={handleWheel}>
            <Header
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                userName={userName}
                setUserName={setUserName}
                isLoggedIn={isLoggedIn}
                setIsLoggedIn={setIsLoggedIn}
            />
            <main className="mw-main">
                {/* Page Header Area */}
                <div className="mw-page-header">
                    <div className="mw-page-header-left">
                        <div className="mw-badge-mind">
                            <Heart fill="currentColor" />
                            MIND RECORD
                        </div>
                        <h1 className="mw-page-title">{userName || '사용자'}님의 마음 기록장</h1>
                        <p className="mw-page-subtitle">
                            지금까지 <strong>{diaryData.length}번</strong>의 마음을 기록했어요.
                        </p>
                    </div>

                    <div className="mw-controls-row">
                        <div className="mw-view-toggle">
                            <button
                                onClick={() => setViewMode('calendar')}
                                className={`mw-toggle-btn ${viewMode === 'calendar' ? 'mw-toggle-btn-active' : ''}`}
                            >
                                <Calendar />
                                <span>달력</span>
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`mw-toggle-btn ${viewMode === 'list' ? 'mw-toggle-btn-active' : ''}`}
                            >
                                <List />
                                <span>리스트</span>
                            </button>
                        </div>

                        <button className="mw-write-btn" onClick={() => navigate('/AIdiary')}>
                            <PenLine />
                            일기 쓰기
                        </button>
                    </div>
                </div>

                {/* Content Section */}
                {viewMode === 'calendar' ? (
                    <div className="mw-calendar-card">
                        <div className="mw-calendar-header">
                            <h2 className="mw-calendar-month-nav">
                                <button onClick={goToPrevMonth} className="mw-month-nav-btn">
                                    <ChevronLeft />
                                </button>
                                {year}년 {month + 1}월
                                <button onClick={goToNextMonth} className="mw-month-nav-btn">
                                    <ChevronRight />
                                </button>
                            </h2>
                            <div className="mw-calendar-legend">
                                <div className="mw-legend-item">
                                    <div className="mw-legend-dot mw-legend-dot-happy"></div>행복
                                </div>
                                <div className="mw-legend-item">
                                    <div className="mw-legend-dot mw-legend-dot-anxious"></div>불안
                                </div>
                                <div className="mw-legend-item">
                                    <div className="mw-legend-dot mw-legend-dot-angry"></div>화남
                                </div>
                                <div className="mw-legend-item">
                                    <div className="mw-legend-dot mw-legend-dot-sad"></div>우울
                                </div>
                                <div className="mw-legend-item">
                                    <div className="mw-legend-dot mw-legend-dot-calm"></div>평온
                                </div>
                            </div>
                        </div>

                        <div className="mw-weekday-row">
                            {['일', '월', '화', '수', '목', '금', '토'].map((d, i) => (
                                <div
                                    key={d}
                                    className={`mw-weekday-cell ${i === 0 ? 'mw-weekday-cell-sun' : i === 6 ? 'mw-weekday-cell-sat' : ''}`}
                                >
                                    {d}
                                </div>
                            ))}
                        </div>

                        <div className="mw-calendar-grid">
                            {calendarDays.map((day, idx) => {
                                const diaryEntry = day
                                    ? mappedDiaryData.find((d) => d.year === year && d.month === month && d.day === day)
                                    : null;
                                // 최신 일기 여부 판별
                                const isLatest = diaryEntry && latestDiary && diaryEntry.id === latestDiary.id;
                                const colIndex = idx % 7;
                                return (
                                    <div
                                        key={idx}
                                        onClick={() => diaryEntry && setSelectedDiary(diaryEntry)}
                                        className={`mw-cal-day ${!day ? 'mw-cal-day-empty' : 'mw-cal-day-filled'} ${diaryEntry ? 'mw-cal-day-has-entry' : ''}`}
                                    >
                                        {day && (
                                            <>
                                                <span
                                                    className={`mw-cal-day-num ${colIndex === 0 ? 'mw-cal-day-num-sun' : colIndex === 6 ? 'mw-cal-day-num-sat' : ''}`}
                                                >
                                                    {day}
                                                </span>
                                                {diaryEntry && (
                                                    <div
                                                        className={`mw-cal-mood-icon${isLatest ? ' mw-cal-mood-icon-latest' : ''}`}
                                                    >
                                                        <MoodIcon mood={diaryEntry.mood} />
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ) : (
                    <div className="mw-list-grid">
                        {mappedDiaryData.map((diary) => (
                            <div key={diary.id} onClick={() => setSelectedDiary(diary)} className="mw-diary-card">
                                <div className="mw-diary-card-top">
                                    <div>
                                        <span className="mw-diary-card-date">{diary.date}</span>
                                        <MoodBadge mood={diary.mood} />
                                    </div>
                                    <div className="mw-diary-card-avatar">
                                        <MoodIcon mood={diary.mood} />
                                    </div>
                                </div>

                                <h3 className="mw-diary-card-title">{diary.title}</h3>
                                <p className="mw-diary-card-content">{diary.content}</p>

                                <div className="mw-diary-card-footer">
                                    <div className="mw-stress-label-row">
                                        <span className="mw-stress-label">Stress Level</span>
                                        <span className="mw-stress-value">{diary.stress}%</span>
                                    </div>
                                    <div className="mw-stress-bar-track">
                                        <div
                                            className={`mw-stress-bar-fill ${diary.stress > 70 ? 'mw-stress-bar-high' : diary.stress > 40 ? 'mw-stress-bar-medium' : 'mw-stress-bar-low'}`}
                                            style={{ width: `${diary.stress}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            <MobileTap activeTab={activeTab} setActiveTab={setActiveTab} />
            <Footer />

            {/* Diary Detail Modal */}
            {selectedDiary && (
                <div className="mw-modal-overlay">
                    <div className="mw-modal-backdrop" onClick={() => setSelectedDiary(null)}></div>

                    <div className="mw-modal-panel">
                        <div className="mw-modal-header">
                            <div className="mw-modal-header-left">
                                <span className="mw-modal-date">{selectedDiary.date}</span>
                                <MoodBadge mood={selectedDiary.mood} />
                                <StressBadge level={selectedDiary.stress} />
                            </div>
                            <button onClick={() => setSelectedDiary(null)} className="mw-modal-close-btn">
                                <X />
                            </button>
                        </div>

                        <div className="mw-modal-body mw-no-scrollbar">
                            <div className="mw-modal-title-row">
                                <div className="mw-modal-mood-circle">
                                    <MoodIcon mood={selectedDiary.mood} />
                                </div>
                                <h2 className="mw-modal-title">{selectedDiary.title}</h2>
                            </div>

                            <div className="mw-modal-content-box">{selectedDiary.content}</div>

                            <div className="mw-modal-tags">
                                {selectedDiary.tags.map((tag) => (
                                    <span key={tag} className="mw-modal-tag">
                                        {tag}
                                    </span>
                                ))}
                            </div>

                            <div className="mw-ai-feedback-box">
                                <div className="mw-ai-feedback-badge">
                                    <Sparkles />
                                    AI 마음 코칭
                                </div>
                                <p className="mw-ai-feedback-text">{selectedDiary.aiFeedback}</p>
                                <AIHealingBox diary={selectedDiary} />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
