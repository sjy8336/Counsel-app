import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar as CalendarIcon, Clock, Video, Mic, Users, ChevronRight, ChevronLeft, BookOpen } from 'lucide-react';
import '../static/Reservation.css'; // 새로 만들 스타일 파일

export default function ReservationPage() {
    const navigate = useNavigate();
    const [step, setStep] = useState(1); // 1: 정보입력, 2: 최종확인
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedTime, setSelectedTime] = useState('');
    const [consultType, setConsultType] = useState('video'); // video, voice, face
    const [memo, setMemo] = useState('');

    // 상담사 정보 (예시 데이터)
    const counselor = {
        name: "이은지 상담사",
        category: "성인 우울, 불안 장애",
        price: "60,000원 (50분)"
    };

    const handleNext = () => {
        if (!selectedDate || !selectedTime) return alert('날짜와 시간을 선택해주세요.');
        setStep(2);
    };

    const handleSubmit = () => {
        alert('예약이 성공적으로 완료되었습니다!');
        navigate('/mypage'); // 마이페이지의 상담 히스토리로 이동
    };

    return (
        <div className="res-container">
            <div className="res-card">
                {/* 상단 헤더 */}
                <div className="res-header">
                    <button onClick={() => step === 1 ? navigate(-1) : setStep(1)} className="res-back-btn">
                        <ChevronLeft size={20} />
                    </button>
                    <h2 className="res-title">{counselor.name} 예약하기</h2>
                </div>

                {step === 1 ? (
                    <div className="res-content">
                        {/* 1. 상담사 정보 요약 */}
                        <section className="res-section counselor-info">
                            <div className="counselor-profile-img">👩‍💼</div>
                            <div className="counselor-text">
                                <span className="tag">{counselor.category}</span>
                                <h3>{ counselor.name }</h3>
                                <p className="price">{counselor.price}</p>
                            </div>
                        </section>

                        {/* 2. 날짜 및 시간 선택 */}
                        <section className="res-section">
                            <h4 className="section-title"><CalendarIcon size={18} /> 상담 일자 선택</h4>
                            <input 
                                type="date" 
                                className="res-date-input" 
                                onChange={(e) => setSelectedDate(e.target.value)} 
                            />
                            
                            <h4 className="section-title"><Clock size={18} /> 시간 선택</h4>
                            <div className="time-grid">
                                {['10:00', '11:00', '14:00', '15:00', '16:00', '17:00'].map(time => (
                                    <button 
                                        key={time} 
                                        className={`time-btn ${selectedTime === time ? 'active' : ''}`}
                                        onClick={() => setSelectedTime(time)}
                                    >
                                        {time}
                                    </button>
                                ))}
                            </div>
                        </section>

                        {/* 3. 상담 방식 선택 */}
                        <section className="res-section">
                            <h4 className="section-title"><BookOpen size={18} /> 상담 방식</h4>
                            <div className="type-group">
                                <button className={`type-btn ${consultType === 'video' ? 'active' : ''}`} onClick={() => setConsultType('video')}>
                                    <Video size={20} /> <span>화상</span>
                                </button>
                                <button className={`type-btn ${consultType === 'voice' ? 'active' : ''}`} onClick={() => setConsultType('voice')}>
                                    <Mic size={20} /> <span>음성</span>
                                </button>
                                <button className={`type-btn ${consultType === 'face' ? 'active' : ''}`} onClick={() => setConsultType('face')}>
                                    <Users size={20} /> <span>대면</span>
                                </button>
                            </div>
                        </section>

                        {/* 4. 사전 질문지 */}
                        <section className="res-section">
                            <h4 className="section-title">상담사에게 전하고 싶은 말</h4>
                            <textarea 
                                className="res-textarea"
                                placeholder="현재 고민이나 상태를 자유롭게 적어주세요."
                                value={memo}
                                onChange={(e) => setMemo(e.target.value)}
                            />
                        </section>

                        <button className="res-submit-btn" onClick={handleNext}>
                            <span>다음 단계로</span> <ChevronRight size={18} />
                        </button>
                    </div>
                ) : (
                    /* 예약 확인 (최종 확인 단계) */
                    <div className="res-confirm-content">
                        <div className="confirm-box">
                            <h4>예약 정보를 확인해주세요</h4>
                            <div className="confirm-item"><span>일시</span> <strong>{selectedDate} {selectedTime}</strong></div>
                            <div className="confirm-item"><span>방식</span> <strong>{consultType === 'video' ? '화상 상담' : consultType === 'voice' ? '음성 상담' : '대면 상담'}</strong></div>
                            <div className="confirm-item"><span>상담사</span> <strong>{counselor.name}</strong></div>
                            <div className="confirm-item"><span>결제 금액</span> <strong className="highlight">{counselor.price}</strong></div>
                        </div>
                        <button className="res-submit-btn confirm" onClick={handleSubmit}>
                            결제 및 예약 확정
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}