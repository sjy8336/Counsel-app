import React, { useState, useEffect } from 'react';
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

// --- Mock Data ---
const diaryData = [
    {
        id: 1,
        year: 2026,
        month: 3,
        day: 20,
        date: '2026. 04. 20 (월)',
        mood: 'happy',
        stress: 15,
        title: '오랜만에 느껴보는 여유',
        content:
            '주말에 비가 와서 꼼짝 못 하다가, 오늘 드디어 날씨가 개었다. 점심시간에 잠깐 회사 근처 공원을 산책했는데, 햇살이 너무 따뜻하고 바람도 선선해서 기분이 한결 나아졌다.',
        aiFeedback:
            '따뜻한 햇살과 산책으로 에너지를 충전하셨군요! 작은 일상에서 긍정적인 변화를 찾아내는 먹보님의 모습이 멋집니다.',
        tags: ['#산책', '#햇살', '#여유'],
    },
    {
        id: 2,
        year: 2026,
        month: 3,
        day: 18,
        date: '2026. 04. 18 (토)',
        mood: 'sad',
        stress: 65,
        title: '조금 지치는 하루',
        content: '하루 종일 왠지 모르게 무기력하고 우울했다. 계획했던 일들도 하나도 하지 못하고 침대에만 누워 있었다.',
        aiFeedback:
            '무기력함이 밀려오는 날이었군요. 계획을 지키지 못했다고 자책하기보다는, 몸과 마음이 쉬어가는 시간이라고 생각해주세요.',
        tags: ['#무기력', '#휴식필요'],
    },
    {
        id: 3,
        year: 2026,
        month: 3,
        day: 22,
        date: '2026. 04. 22 (수)',
        mood: 'anxious',
        stress: 80,
        title: '발표를 앞둔 긴장감',
        content:
            '내일 있을 프로젝트 발표 때문에 하루 종일 마음이 조마조마하다. 준비는 다 했지만 자꾸만 실수할 것 같은 기분이 든다.',
        aiFeedback:
            '중요한 일을 앞두고 느끼는 불안은 당연한 에너지가 될 수 있어요. 지금까지 준비한 과정을 믿고 심호흡을 크게 한 번 해보세요.',
        tags: ['#불안', '#발표준비'],
    },
    {
        id: 4,
        year: 2026,
        month: 3,
        day: 25,
        date: '2026. 04. 25 (토)',
        mood: 'angry',
        stress: 92,
        title: '이해가 안 가는 상황',
        content: '오늘 정말 화가 나는 일이 있었다. 상대방의 무례한 태도 때문에 감정 조절이 힘들었다.',
        aiFeedback:
            '분노는 당신의 경계가 침범당했을 때 나타나는 정당한 신호입니다. 다만, 그 화가 당신을 삼키지 않도록 차가운 물을 마시며 열을 식혀보세요.',
        tags: ['#분노', '#감정조절'],
    },
    {
        id: 5,
        year: 2026,
        month: 3,
        day: 28,
        date: '2026. 04. 28 (화)',
        mood: 'calm',
        stress: 10,
        title: '잔잔한 저녁 식사',
        content:
            '좋아하는 음악을 들으며 요리를 하고 천천히 식사를 했다. 큰 이벤트는 없었지만 마음이 참 평온한 하루였다.',
        aiFeedback:
            '잔잔한 일상 속에서 평온함을 유지하는 것은 매우 건강한 상태입니다. 오늘의 이 평온함이 내일의 에너지가 되길 바랍니다.',
        tags: ['#평온', '#홈쿠킹'],
    },
];

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
export default function App() {
    const navigate = useNavigate();
    const location = useLocation();
    const [selectedDiary, setSelectedDiary] = useState(null);
    // 모달이 열릴 때 body 스크롤 방지
    useEffect(() => {
        if (selectedDiary) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [selectedDiary]);
    const [viewMode, setViewMode] = useState(location.state?.viewMode || 'calendar');
    const [currentDate, setCurrentDate] = useState(new Date(2026, 3, 1));
    const [activeTab, setActiveTab] = useState('diary');

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const goToPrevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
    const goToNextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const startDayOfWeek = new Date(year, month, 1).getDay();
    const calendarDays = [];

    for (let i = 0; i < startDayOfWeek; i++) calendarDays.push(null);
    for (let i = 1; i <= daysInMonth; i++) calendarDays.push(i);

    return (
        <div className="mw-diary-root">
            <Header activeTab={activeTab} setActiveTab={setActiveTab} />
            <main className="mw-main">
                {/* Page Header Area */}
                <div className="mw-page-header">
                    <div className="mw-page-header-left">
                        <div className="mw-badge-mind">
                            <Heart fill="currentColor" />
                            MIND RECORD
                        </div>
                        <h1 className="mw-page-title">먹보님의 마음 기록장</h1>
                        <p className="mw-page-subtitle">
                            지금까지 <strong>12번</strong>의 마음을 기록했어요.
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
                    <div className="mw-calendar-card mw-no-scrollbar">
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
                                    ? diaryData.find((d) => d.year === year && d.month === month && d.day === day)
                                    : null;
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
                                                    <div className="mw-cal-mood-icon">
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
                    <div className="mw-list-grid mw-no-scrollbar">
                        {diaryData.map((diary) => (
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

                                <div className="mw-ai-feedback-footer">
                                    <div className="mw-ai-recommendation">
                                        <div className="mw-ai-rec-icon">
                                            <Coffee />
                                        </div>
                                        <div>
                                            <div className="mw-ai-rec-label">Recommendation</div>
                                            <div className="mw-ai-rec-value">따뜻한 차 한 잔</div>
                                        </div>
                                    </div>
                                    <button className="mw-ai-more-btn">더 보기</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
