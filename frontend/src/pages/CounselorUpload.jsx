import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Camera,
    Plus,
    Trash2,
    ChevronRight,
    Save,
    User,
    Briefcase,
    GraduationCap,
    CheckCircle2,
    MapPin,
    Building2,
    Mail,
    Phone,
    X,
} from 'lucide-react';
import '../static/CounselorUpload.css';

/* ── 상수 ──────────────────────────────────────────── */
const DAYS = ['월', '화', '수', '목', '금', '토', '일'];
const HOURS = Array.from({ length: 13 }, (_, i) => `${(i + 8).toString().padStart(2, '0')}:00`);
const SPECIALTIES = [
    '개인 심리 상담',
    '취업 컨설팅',
    '진로 설계',
    '직무 스트레스',
    '면접 공포증',
    '자존감 회복',
    '대인관계',
    '번아웃 증후군',
    '정서 조절',
];

const YEARS = Array.from({ length: 20 }, (_, i) => String(2025 - i));
const MONTHS = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];

const TABS = [
    { id: 'basic', label: '기본 정보', icon: <User size={20} /> },
    { id: 'professional', label: '전문 분야', icon: <Briefcase size={20} /> },
    { id: 'history', label: '경력 및 학력', icon: <GraduationCap size={20} /> },
];
const NEXT = { basic: 'professional', professional: 'history' };

const mkSlot = () => ({ id: Date.now(), start: '09:00', end: '10:00' });
const mkSchedule = () =>
    Object.fromEntries(DAYS.map((d, i) => [d, { active: i < 5, slots: [{ id: 1, start: '09:00', end: '10:00' }] }]));
const mkExp = () => ({
    id: Date.now(),
    fromY: '2024',
    fromM: '01',
    toY: '2025',
    toM: '12',
    present: false,
    content: '',
});
const mkEdu = () => ({ id: Date.now(), school: '', major: '' });

/* ── 경력 기간 피커 ────────────────────────────────── */
function PeriodPicker({ exp, onChange }) {
    const setField = (f, v) => onChange({ ...exp, [f]: v });
    const togglePresent = () => onChange({ ...exp, present: !exp.present });

    return (
        <div className="period-picker">
            <div className="period-row">
                <span className="period-label">시작</span>
                <div className="period-select-box">
                    <select
                        className="period-select"
                        value={exp.fromY}
                        onChange={(e) => setField('fromY', e.target.value)}
                    >
                        {YEARS.map((y) => (
                            <option key={y}>{y}</option>
                        ))}
                    </select>
                    <span className="period-unit">년</span>
                    <select
                        className="period-select"
                        value={exp.fromM}
                        onChange={(e) => setField('fromM', e.target.value)}
                    >
                        {MONTHS.map((m) => (
                            <option key={m}>{m}</option>
                        ))}
                    </select>
                    <span className="period-unit">월</span>
                </div>

                <span className="period-sep-text">~</span>

                {exp.present ? (
                    <button className="period-present-btn on" onClick={togglePresent}>
                        현재
                    </button>
                ) : (
                    <>
                        <div className="period-select-box">
                            <select
                                className="period-select"
                                value={exp.toY}
                                onChange={(e) => setField('toY', e.target.value)}
                            >
                                {YEARS.map((y) => (
                                    <option key={y}>{y}</option>
                                ))}
                            </select>
                            <span className="period-unit">년</span>
                            <select
                                className="period-select"
                                value={exp.toM}
                                onChange={(e) => setField('toM', e.target.value)}
                            >
                                {MONTHS.map((m) => (
                                    <option key={m}>{m}</option>
                                ))}
                            </select>
                            <span className="period-unit">월</span>
                        </div>
                        <button className="period-present-btn" onClick={togglePresent}>
                            현재
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}

/* ── 메인 컴포넌트 ──────────────────────────────────── */
export default function App() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('basic');
    const [errors, setErrors] = useState({});

    const [basic, setBasic] = useState({ name: '', phone: '', email: '', officeName: '', officeAddress: '' });
    const [profile, setProfile] = useState({
        specialties: [],
        customSpecialty: '',
        weeklySchedule: mkSchedule(),
        experience: [mkExp()],
        education: [mkEdu()],
    });

    const setP = (patch) => setProfile((p) => ({ ...p, ...patch }));

    /* ── 유효성 검사 ──────────────────────────────────── */
    const validateBasic = () => {
        const e = {};
        if (!basic.name.trim()) e.name = '이름을 입력해 주세요.';
        if (!basic.phone.trim()) e.phone = '연락처를 입력해 주세요.';
        if (!basic.email.trim()) e.email = '이메일을 입력해 주세요.';
        if (!basic.officeName.trim()) e.officeName = '상담소명을 입력해 주세요.';
        if (!basic.officeAddress.trim()) e.officeAddress = '상담소 주소를 입력해 주세요.';
        setErrors(e);
        return Object.keys(e).length === 0;
    };
    const validateProfessional = () => {
        const e = {};
        if (profile.specialties.length === 0) e.specialties = '전문 분야를 한 개 이상 선택해 주세요.';
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleNext = () => {
        if (activeTab === 'basic' && !validateBasic()) return;
        if (activeTab === 'professional' && !validateProfessional()) return;
        setErrors({});
        setActiveTab(NEXT[activeTab]);
    };

    /* ── 전화번호 포맷 ────────────────────────────────── */
    const handlePhone = (e) => {
        const v = e.target.value.replace(/\D/g, '');
        const f =
            v.length > 7
                ? `${v.slice(0, 3)}-${v.slice(3, 7)}-${v.slice(7, 11)}`
                : v.length > 3
                  ? `${v.slice(0, 3)}-${v.slice(3)}`
                  : v;
        setBasic((b) => ({ ...b, phone: f }));
        if (errors.phone) setErrors((e) => ({ ...e, phone: undefined }));
    };

    /* ── 전문 분야 ────────────────────────────────────── */
    const toggleSpecialty = (s) => {
        const next = profile.specialties.includes(s)
            ? profile.specialties.filter((x) => x !== s)
            : [...profile.specialties, s];
        setP({ specialties: next });
        if (errors.specialties && next.length > 0) setErrors((e) => ({ ...e, specialties: undefined }));
    };
    const addCustom = () => {
        const s = profile.customSpecialty.trim();
        if (s && !profile.specialties.includes(s))
            setP({ specialties: [...profile.specialties, s], customSpecialty: '' });
    };

    /* ── 일정 ─────────────────────────────────────────── */
    const setDay = (day, patch) =>
        setP({ weeklySchedule: { ...profile.weeklySchedule, [day]: { ...profile.weeklySchedule[day], ...patch } } });
    const toggleDay = (day) => setDay(day, { active: !profile.weeklySchedule[day].active });
    const addSlot = (day) => setDay(day, { slots: [...profile.weeklySchedule[day].slots, mkSlot()] });
    const removeSlot = (day, id) => {
        if (profile.weeklySchedule[day].slots.length > 1)
            setDay(day, { slots: profile.weeklySchedule[day].slots.filter((s) => s.id !== id) });
    };
    const changeTime = (day, id, f, v) =>
        setDay(day, { slots: profile.weeklySchedule[day].slots.map((s) => (s.id === id ? { ...s, [f]: v } : s)) });

    /* ── 경력 ─────────────────────────────────────────── */
    const addExp = () => setP({ experience: [...profile.experience, mkExp()] });
    const removeExp = (id) => {
        if (profile.experience.length > 1) setP({ experience: profile.experience.filter((e) => e.id !== id) });
    };
    const updateExp = (id, patch) =>
        setP({ experience: profile.experience.map((e) => (e.id === id ? { ...e, ...patch } : e)) });

    /* ── 학력 ─────────────────────────────────────────── */
    const addEdu = () => setP({ education: [...profile.education, mkEdu()] });
    const removeEdu = (id) => {
        if (profile.education.length > 1) setP({ education: profile.education.filter((e) => e.id !== id) });
    };

    /* ── 기본 입력 헬퍼 ───────────────────────────────── */
    const basicInput = (field, label, icon, type = 'text', ph = '') => (
        <div className="input-group">
            <label className="input-label">
                {icon}
                {label}
            </label>
            <input
                className={`input${errors[field] ? ' error' : ''}`}
                type={type}
                placeholder={ph}
                value={basic[field]}
                onChange={(e) => {
                    setBasic((b) => ({ ...b, [field]: e.target.value }));
                    if (errors[field]) setErrors((er) => ({ ...er, [field]: undefined }));
                }}
            />
            {errors[field] && <span className="field-error">{errors[field]}</span>}
        </div>
    );

    /* ── 렌더 ─────────────────────────────────────────── */
    return (
        <div className="app">
            {/* GNB */}
            <header className="gnb">
                <div className="gnb-left">
                    <h1 className="logo">MINDWELL</h1>
                    <nav className="gnb-nav">
                        <a href="#">전문가 찾기</a>
                        <a href="#">예약 관리</a>
                        <a href="#">AI 일기</a>
                        <a href="#">힐링 라운지</a>
                    </nav>
                </div>
                <div className="gnb-user">
                    <div className="gnb-avatar">
                        <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=counselor" alt="프로필" />
                    </div>
                    <span className="gnb-name">이은지 코치님</span>
                </div>
            </header>

            <main>
                <div className="page-header">
                    <h2>전문가 프로필 등록</h2>
                    <p>상담사님의 전문성을 마음웰 회원들에게 소개해 주세요.</p>
                </div>

                {/* Step Nav */}
                <div className="step-nav">
                    {TABS.map((tab) => (
                        <button key={tab.id} className="step-btn" onClick={() => setActiveTab(tab.id)}>
                            <div className={`step-icon ${activeTab === tab.id ? 'active' : ''}`}>{tab.icon}</div>
                            <span className={`step-label ${activeTab === tab.id ? 'active' : ''}`}>{tab.label}</span>
                        </button>
                    ))}
                </div>

                <section className="card">
                    {/* ── Tab 1 : 기본 정보 ───────────────────── */}
                    {activeTab === 'basic' && (
                        <div className="tab-content basic-layout">
                            <div className="photo-wrapper">
                                <div className="photo-box">
                                    <Camera size={28} />
                                    <span>사진 업로드</span>
                                </div>
                                <button className="photo-add-btn">
                                    <Plus size={14} />
                                </button>
                            </div>

                            <div className="form-fields">
                                <div className="grid-2">
                                    {basicInput('name', '이름', null, 'text', '성함을 입력해 주세요')}
                                    <div className="input-group">
                                        <label className="input-label">
                                            <Phone size={11} /> 연락처
                                        </label>
                                        <input
                                            className={`input${errors.phone ? ' error' : ''}`}
                                            type="text"
                                            placeholder="010-0000-0000"
                                            value={basic.phone}
                                            onChange={handlePhone}
                                        />
                                        {errors.phone && <span className="field-error">{errors.phone}</span>}
                                    </div>
                                </div>
                                {basicInput('email', '이메일', <Mail size={11} />, 'email', 'example@mindwell.com')}
                                <div className="section-divider">
                                    {basicInput(
                                        'officeName',
                                        '상담소명',
                                        <Building2 size={11} />,
                                        'text',
                                        '소속 상담소 또는 센터명'
                                    )}
                                    {basicInput(
                                        'officeAddress',
                                        '상담소 주소',
                                        <MapPin size={11} />,
                                        'text',
                                        '상담 진행 주소'
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── Tab 2 : 전문 분야 ───────────────────── */}
                    {activeTab === 'professional' && (
                        <div className="tab-content professional-wrap">
                            <div>
                                <h3 className="section-title">
                                    <span className="bar bar-main" />
                                    전문 상담 분야{' '}
                                    <span style={{ fontWeight: 500, color: '#94A3B8', fontSize: '0.85rem' }}>
                                        (중복 선택 가능)
                                    </span>
                                </h3>
                                <div className="specialty-grid">
                                    {SPECIALTIES.map((item) => {
                                        const on = profile.specialties.includes(item);
                                        return (
                                            <button
                                                key={item}
                                                className={`chip ${on ? 'selected' : ''}`}
                                                onClick={() => toggleSpecialty(item)}
                                            >
                                                <span>{item}</span>
                                                <span className={`chip-check ${on ? 'on' : ''}`}>
                                                    {on && <CheckCircle2 size={13} strokeWidth={2.5} />}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                                {errors.specialties && (
                                    <p className="field-error" style={{ marginBottom: '0.75rem' }}>
                                        {errors.specialties}
                                    </p>
                                )}

                                <div className="custom-box">
                                    <label className="custom-box-label">
                                        목록에 없는 분야가 있으신가요? 직접 입력해 주세요.
                                    </label>
                                    <div className="custom-row">
                                        <input
                                            className="input"
                                            type="text"
                                            value={profile.customSpecialty}
                                            onChange={(e) => setP({ customSpecialty: e.target.value })}
                                            onKeyDown={(e) => e.key === 'Enter' && addCustom()}
                                            placeholder="예: 다문화 상담, 예술 치료 등"
                                        />
                                        <button className="add-btn" onClick={addCustom}>
                                            <Plus size={14} />
                                            추가
                                        </button>
                                    </div>
                                    {profile.specialties.filter((s) => !SPECIALTIES.includes(s)).length > 0 && (
                                        <div className="tag-list">
                                            {profile.specialties
                                                .filter((s) => !SPECIALTIES.includes(s))
                                                .map((s) => (
                                                    <span key={s} className="tag">
                                                        {s}
                                                        <span className="tag-del" onClick={() => toggleSpecialty(s)}>
                                                            <X size={11} />
                                                        </span>
                                                    </span>
                                                ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* 주간 일정 */}
                            <div className="schedule-section">
                                <h3 className="section-title">
                                    <span className="bar bar-accent2" />
                                    주간 상담 일정
                                </h3>
                                <div className="schedule-list">
                                    {DAYS.map((day) => {
                                        const { active, slots } = profile.weeklySchedule[day];
                                        return (
                                            <div key={day} className={`schedule-row ${active ? '' : 'inactive'}`}>
                                                <div className="day-col">
                                                    <button
                                                        className={`day-check ${active ? 'on' : ''}`}
                                                        onClick={() => toggleDay(day)}
                                                    >
                                                        {active && <CheckCircle2 size={12} strokeWidth={2.5} />}
                                                    </button>
                                                    <span className={`day-label ${active ? '' : 'off'}`}>
                                                        {day}요일
                                                    </span>
                                                    {!active && <span className="rest-badge">휴무</span>}
                                                </div>

                                                <div className="slots-col">
                                                    {active ? (
                                                        slots.map((slot, i) => (
                                                            <div key={slot.id} className="time-row">
                                                                <div className="time-select-box">
                                                                    <select
                                                                        className="time-select"
                                                                        value={slot.start}
                                                                        onChange={(e) =>
                                                                            changeTime(
                                                                                day,
                                                                                slot.id,
                                                                                'start',
                                                                                e.target.value
                                                                            )
                                                                        }
                                                                    >
                                                                        {HOURS.map((h) => (
                                                                            <option key={h}>{h}</option>
                                                                        ))}
                                                                    </select>
                                                                    <span className="time-sep">~</span>
                                                                    <select
                                                                        className="time-select"
                                                                        value={slot.end}
                                                                        onChange={(e) =>
                                                                            changeTime(
                                                                                day,
                                                                                slot.id,
                                                                                'end',
                                                                                e.target.value
                                                                            )
                                                                        }
                                                                    >
                                                                        {HOURS.map((h) => (
                                                                            <option key={h}>{h}</option>
                                                                        ))}
                                                                    </select>
                                                                </div>
                                                                {slots.length > 1 && (
                                                                    <button
                                                                        className="time-del"
                                                                        onClick={() => removeSlot(day, slot.id)}
                                                                    >
                                                                        <X size={14} />
                                                                    </button>
                                                                )}
                                                                {i === slots.length - 1 && (
                                                                    <button
                                                                        className="time-add"
                                                                        onClick={() => addSlot(day)}
                                                                    >
                                                                        <Plus size={12} />
                                                                        시간 추가
                                                                    </button>
                                                                )}
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <span className="no-slots">상담 일정이 없습니다.</span>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── Tab 3 : 경력 및 학력 ─────────────────── */}
                    {activeTab === 'history' && (
                        <div className="tab-content history-wrap">
                            {/* 경력 */}
                            <div>
                                <div className="add-row">
                                    <h3 className="section-title">
                                        <span className="bar bar-main" />
                                        상담 및 관련 경력
                                    </h3>
                                    <button className="add-link add-link-main" onClick={addExp}>
                                        <Plus size={14} />
                                        추가하기
                                    </button>
                                </div>
                                <div className="section-block">
                                    {profile.experience.map((exp) => (
                                        <div key={exp.id} className="exp-row">
                                            <div
                                                style={{
                                                    flex: 1,
                                                    minWidth: 0,
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    gap: '0.625rem',
                                                }}
                                            >
                                                <PeriodPicker
                                                    exp={exp}
                                                    onChange={(patch) => updateExp(exp.id, patch)}
                                                />
                                                <div className="exp-content">
                                                    <label className="input-label-sm">활동 내용</label>
                                                    <input
                                                        className="input"
                                                        type="text"
                                                        placeholder="활동 내용을 입력해 주세요"
                                                        value={exp.content}
                                                        onChange={(e) => updateExp(exp.id, { content: e.target.value })}
                                                    />
                                                </div>
                                            </div>
                                            <button
                                                className="del-btn"
                                                onClick={() => removeExp(exp.id)}
                                                disabled={profile.experience.length <= 1}
                                            >
                                                <Trash2 size={17} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* 학력 */}
                            <div className="edu-section">
                                <div className="add-row">
                                    <h3 className="section-title">
                                        <span className="bar bar-accent2" />
                                        학력
                                    </h3>
                                    <button className="add-link add-link-accent2" onClick={addEdu}>
                                        <Plus size={14} />
                                        추가하기
                                    </button>
                                </div>
                                <div className="section-block">
                                    {profile.education.map((edu) => (
                                        <div key={edu.id} className="edu-row">
                                            <div className="edu-fields">
                                                <div className="input-group">
                                                    <label className="input-label-sm">학교명</label>
                                                    <input
                                                        className="input"
                                                        type="text"
                                                        placeholder="학교명을 입력해 주세요"
                                                    />
                                                </div>
                                                <div className="input-group">
                                                    <label className="input-label-sm">전공 및 학위</label>
                                                    <input
                                                        className="input"
                                                        type="text"
                                                        placeholder="전공 / 학위를 입력해 주세요"
                                                    />
                                                </div>
                                            </div>
                                            <button
                                                className="del-btn"
                                                onClick={() => removeEdu(edu.id)}
                                                disabled={profile.education.length <= 1}
                                            >
                                                <Trash2 size={17} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </section>

                {/* 하단 버튼 */}
                <div className="footer-btns">
                    <button className="skip-btn">나중에 하기</button>
                    {activeTab !== 'history' ? (
                        <button className="cta-btn" onClick={handleNext}>
                            다음 단계로 <ChevronRight size={18} />
                        </button>
                    ) : (
                        <button
                            className="cta-btn"
                            onClick={() => {
                                localStorage.setItem('counselor_registered', 'true');
                                navigate('/counselormypage');
                            }}
                        >
                            <Save size={17} /> 프로필 등록 완료
                        </button>
                    )}
                </div>
            </main>

            <footer className="site-footer">
                <div className="footer-grid">
                    <div className="footer-brand">
                        <h4>MINDWELL</h4>
                        <p>AI 멘탈 웰니스 플랫폼 마음웰입니다.</p>
                    </div>
                    {['서비스', '고객지원', '법적 고지'].map((t) => (
                        <div key={t} className="footer-col">
                            <h5>{t}</h5>
                            <ul>
                                <li>링크 1</li>
                                <li>링크 2</li>
                            </ul>
                        </div>
                    ))}
                </div>
            </footer>
        </div>
    );
}
