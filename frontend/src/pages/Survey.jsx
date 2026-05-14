import React, { useState } from 'react';
import { createBooking } from '../api/booking';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    MessageCircle,
    Leaf,
    Target,
    CreditCard,
    ChevronRight,
    ChevronLeft,
    Check,
    Calendar,
    Clock,
} from 'lucide-react';
import '../static/Survey.css';

const STEPS = [
    { id: 1, label: '상담 이유', Icon: MessageCircle },
    { id: 2, label: '상담 경험', Icon: Leaf },
    { id: 3, label: '목표', Icon: Target },
    { id: 4, label: '예약금', Icon: CreditCard },
];

const REASONS = ['우울/불안', '대인관계', '직장/학업 스트레스', '자기이해 및 성장', '기타(직접 입력)'];

/* ── 서브 컴포넌트 ─────────────────────────────────────── */
const StepTitle = ({ text, num }) => (
    <div className="sv-q">
        <span className="sv-q-num">{num}</span>
        <p className="sv-q-text">{text}</p>
    </div>
);

const RadioCard = ({ name, value, checked, onChange, label, sub, danger }) => (
    <label className={`sv-radio-card ${checked ? 'selected' : ''} ${danger && checked ? 'danger' : ''}`}>
        <input type="radio" name={name} value={value} checked={checked} onChange={onChange} />
        <div className="sv-radio-inner">
            <div className={`sv-radio-dot ${checked ? 'on' : ''}`}>
                {checked && <Check size={10} strokeWidth={3} color="#fff" />}
            </div>
            <div className="sv-radio-texts">
                <span className="sv-radio-label">{label}</span>
                {sub && <span className="sv-radio-sub">{sub}</span>}
            </div>
        </div>
    </label>
);

const SummaryRow = ({ label, value, multiline }) => (
    <div className={`sv-summary-row${multiline ? ' multiline' : ''}`}>
        <span className="sv-sum-key">{label}</span>
        <span className="sv-sum-val">{value}</span>
    </div>
);

/* ── 메인 ──────────────────────────────────────────────── */
const Survey = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { counselorName, selectedDate, selectedTime, counselorId } = location.state || {};
    // counselorId가 없으면 예약 불가
    const validCounselorId = typeof counselorId === 'number' ? counselorId : Number(counselorId);

    const [step, setStep] = useState(1);
    const [form, setForm] = useState({
        reason: '',
        otherReason: '',
        experience: '',
        wants: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));
    const onChange = (e) => set(e.target.name, e.target.value);

    const canNext = () => {
        if (step === 1) return form.reason && (form.reason !== '기타(직접 입력)' || form.otherReason.trim());
        if (step === 2) return !!form.experience;
        if (step === 3) return !!form.wants.trim();
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isSubmitting) return;
        setIsSubmitting(true);
        if (!validCounselorId || isNaN(validCounselorId) || validCounselorId <= 0) {
            alert(
                `상담사 정보가 올바르지 않습니다. (counselorId: ${counselorId}, validCounselorId: ${validCounselorId})\n상담사 상세페이지에서 다시 예약을 시도해 주세요.`
            );
            setIsSubmitting(false);
            return;
        }
        const finalData = {
            ...form,
            reason: form.reason === '기타(직접 입력)' ? form.otherReason : form.reason,
        };
        // 예약 생성 없이 결제 페이지로 예약 정보만 넘김
        alert('예약금 20,000원 결제 페이지로 이동합니다.');
        navigate('/payment', {
            state: { counselorName, counselorId: validCounselorId, selectedDate, selectedTime, survey: finalData },
        });
        setIsSubmitting(false);
    };

    if (!counselorName || !validCounselorId || isNaN(validCounselorId))
        return <div className="sv-error">잘못된 접근입니다. (상담사 정보 오류)</div>;

    const progress = ((step - 1) / (STEPS.length - 1)) * 100;

    return (
        <div className="sv-bg">
            <div className="sv-wrap">
                {/* ── 헤더 ─────────────────────────────────────────── */}
                <header className="sv-header">
                    <div className="sv-badge">사전 상담 설문지</div>
                    <h1 className="sv-title">
                        <em className="sv-counselor">{counselorName}</em> 상담사님과의
                        <br />
                        원활한 상담을 위해 작성해 주세요
                    </h1>
                    <div className="sv-meta">
                        <span className="sv-meta-item">
                            <Calendar size={15} />
                            {selectedDate}
                        </span>
                        <span className="sv-meta-dot" />
                        <span className="sv-meta-item">
                            <Clock size={15} />
                            {selectedTime}
                        </span>
                    </div>
                </header>

                {/* ── 스텝 인디케이터 ───────────────────────────────── */}
                <div className="sv-stepper">
                    <div className="sv-track">
                        <div className="sv-track-fill" style={{ width: `${progress}%` }} />
                    </div>
                    {STEPS.map(({ id, label, Icon }) => {
                        const done = step > id;
                        const active = step === id;
                        return (
                            <div key={id} className={`sv-node${active ? ' active' : ''}${done ? ' done' : ''}`}>
                                <div className="sv-circle">
                                    {done ? <Check size={14} strokeWidth={3} /> : <Icon size={15} />}
                                </div>
                                <span className="sv-node-label">{label}</span>
                            </div>
                        );
                    })}
                </div>

                {/* ── 폼 카드 ──────────────────────────────────────── */}
                <form className="sv-card" onSubmit={handleSubmit}>
                    {/* STEP 1 */}
                    {step === 1 && (
                        <div className="sv-content" key="s1">
                            <StepTitle num="Q1" text="이번 상담을 신청하게 된 주된 이유는 무엇인가요?" />
                            <div className="sv-chips">
                                {REASONS.map((opt) => (
                                    <button
                                        key={opt}
                                        type="button"
                                        className={`sv-chip${form.reason === opt ? ' on' : ''}`}
                                        onClick={() => set('reason', opt)}
                                    >
                                        {form.reason === opt && <Check size={12} strokeWidth={3} />}
                                        {opt}
                                    </button>
                                ))}
                            </div>
                            {form.reason === '기타(직접 입력)' && (
                                <input
                                    className="sv-input"
                                    type="text"
                                    name="otherReason"
                                    placeholder="상담 이유를 직접 입력해주세요."
                                    value={form.otherReason}
                                    onChange={onChange}
                                    autoFocus
                                />
                            )}
                        </div>
                    )}

                    {/* STEP 2 */}
                    {step === 2 && (
                        <div className="sv-content" key="s2">
                            <StepTitle num="Q2" text="이전에 상담을 받아보신 적이 있나요?" />
                            <div className="sv-radios">
                                <RadioCard
                                    name="experience"
                                    value="yes"
                                    checked={form.experience === 'yes'}
                                    onChange={() => set('experience', 'yes')}
                                    label="예"
                                    sub="이전에 상담 경험이 있습니다."
                                />
                                <RadioCard
                                    name="experience"
                                    value="no"
                                    checked={form.experience === 'no'}
                                    onChange={() => set('experience', 'no')}
                                    label="아니오"
                                    sub="이번이 처음입니다."
                                />
                            </div>
                        </div>
                    )}

                    {/* STEP 3 */}
                    {step === 3 && (
                        <div className="sv-content" key="s3">
                            <StepTitle num="Q3" text="상담을 통해 얻고 싶은 구체적인 목표가 있다면 적어주세요." />
                            <textarea
                                className="sv-textarea"
                                name="wants"
                                value={form.wants}
                                onChange={onChange}
                                placeholder="예: 나만의 거절 시나리오를 만들고 싶어요."
                            />
                        </div>
                    )}

                    {/* STEP 4 */}
                    {step === 4 && (
                        <div className="sv-content" key="s4">
                            <StepTitle num="✓" text="작성하신 내용을 확인하고 결제를 진행해 주세요." />
                            <div className="sv-summary">
                                <p className="sv-sum-title">작성 내용 요약</p>
                                <SummaryRow
                                    label="상담 이유"
                                    value={form.reason === '기타(직접 입력)' ? form.otherReason : form.reason}
                                />
                                <SummaryRow label="상담 경험" value={form.experience === 'yes' ? '있음' : '없음'} />
                                <SummaryRow label="상담 목표" value={form.wants} multiline />
                            </div>
                            <div className="sv-payment">
                                <CreditCard size={20} className="sv-pay-icon" />
                                <div className="sv-pay-body">
                                    <strong>예약금 20,000원</strong>
                                    <p>노쇼 방지를 위해 선입금 예약금이 발생합니다.</p>
                                    <p className="sv-pay-sub">나머지 상담료는 상담 종료 후 현장에서 결제됩니다.</p>
                                </div>
                            </div>
                            <button
                                type="submit"
                                className="sv-submit"
                                disabled={!validCounselorId || isNaN(validCounselorId) || isSubmitting}
                            >
                                {isSubmitting ? '처리 중...' : '설문 완료 및 결제하기'}
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    )}

                    {/* ── 네비게이션 ──────────────────────────────── */}
                    {step < 4 && (
                        <div className="sv-nav">
                            {step > 1 ? (
                                <button type="button" className="sv-prev" onClick={() => setStep((s) => s - 1)}>
                                    <ChevronLeft size={15} />
                                    이전
                                </button>
                            ) : (
                                <span />
                            )}
                            <button
                                type="button"
                                className={`sv-next${!canNext() ? ' off' : ''}`}
                                onClick={() => canNext() && setStep((s) => s + 1)}
                                disabled={!canNext()}
                            >
                                다음
                                <ChevronRight size={15} />
                            </button>
                        </div>
                    )}
                    {step === 4 && (
                        <button type="button" className="sv-prev" style={{ marginTop: 14 }} onClick={() => setStep(3)}>
                            <ChevronLeft size={15} />
                            이전으로
                        </button>
                    )}
                </form>
            </div>
        </div>
    );
};

export default Survey;
