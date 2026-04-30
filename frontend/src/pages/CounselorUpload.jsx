import React, { useState, useEffect } from 'react';
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
import Header from '../components/header';
import MobileTap from '../components/mobileTap';
import Footer from '../components/footer';
import { registerCounselorProfile } from '../api/counselor';
import { getMyInfo } from '../api/user';

// 이미지 업로드 API 함수 (임시 구현, 실제 경로/응답에 맞게 수정 필요)
async function uploadProfileImage(file, token) {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch('/api/upload/profile-image', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`,
        },
        body: formData,
    });
    if (!res.ok) throw new Error('이미지 업로드 실패');
    const data = await res.json();
    // data.url 또는 data.profile_img_url 등 실제 응답에 맞게 수정
    return data.url || data.profile_img_url;
}

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

const CURRENT_YEAR = new Date().getFullYear();
const CURRENT_MONTH = (new Date().getMonth() + 1).toString().padStart(2, '0');
const YEARS = Array.from({ length: 20 }, (_, i) => String(CURRENT_YEAR - i));
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

    // 종료 연도/월에서 미래 선택 방지
    const toYearOptions = YEARS.filter((y) => Number(y) <= CURRENT_YEAR);
    const toMonthOptions =
        exp.toY === String(CURRENT_YEAR) ? MONTHS.filter((m) => Number(m) <= Number(CURRENT_MONTH)) : MONTHS;

    // 시작 연도/월에서 미래 선택 방지
    const fromYearOptions = YEARS.filter((y) => Number(y) <= CURRENT_YEAR);
    const fromMonthOptions =
        exp.fromY === String(CURRENT_YEAR) ? MONTHS.filter((m) => Number(m) <= Number(CURRENT_MONTH)) : MONTHS;

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
                        {fromYearOptions.map((y) => (
                            <option key={y}>{y}</option>
                        ))}
                    </select>
                    <span className="period-unit">년</span>
                    <select
                        className="period-select"
                        value={exp.fromM}
                        onChange={(e) => setField('fromM', e.target.value)}
                    >
                        {fromMonthOptions.map((m) => (
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
                                {toYearOptions.map((y) => (
                                    <option key={y}>{y}</option>
                                ))}
                            </select>
                            <span className="period-unit">년</span>
                            <select
                                className="period-select"
                                value={exp.toM}
                                onChange={(e) => setField('toM', e.target.value)}
                            >
                                {toMonthOptions.map((m) => (
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

    const [basic, setBasic] = useState({
        name: '',
        phone: '',
        email: '',
        officeName: '',
        officeAddress: '',
        introduction: '', // 상담사 자기소개
    });

    // 유저 정보 불러오기
    useEffect(() => {
        const fetchUser = async () => {
            const token = localStorage.getItem('token');
            if (!token) return;
            try {
                const user = await getMyInfo(token);
                setBasic((b) => ({
                    ...b,
                    name: user.full_name || user.name || '',
                    phone: user.phone_number || user.phone || '',
                    email: user.email || '',
                }));
            } catch (e) {
                // 실패 시 무시
            }
        };
        fetchUser();
    }, []);
    // 사진 업로드 상태
    const [photo, setPhoto] = useState(null); // File 객체
    const [photoPreview, setPhotoPreview] = useState(null); // 미리보기 URL
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
    // 모든 입력란 항상 수정 가능
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

    // 상담사 프로필 등록
    const handleRegister = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            alert('로그인이 필요합니다.');
            return;
        }
        let profileImgUrl = '';
        // 1. 사진 업로드 (있을 때만)
        if (photo) {
            try {
                profileImgUrl = await uploadProfileImage(photo, token);
            } catch (err) {
                alert('프로필 사진 업로드에 실패했습니다.');
                return;
            }
        }
        // 2. 프로필
        const profileData = {
            profile_img_url: profileImgUrl,
            center_name: basic.officeName,
            center_address: basic.officeAddress,
            bio: basic.introduction,
        };
        // 3. 전문분야
        const specialties = profile.specialties.map((s) => ({ specialty_name: s }));
        // 4. 경력
        const experiences = profile.experience.map((exp) => ({
            company_name: exp.company_name || '',
            start_date: `${exp.fromY}-${exp.fromM}-01`,
            end_date: exp.present ? null : `${exp.toY}-${exp.toM}-01`,
            is_current: exp.present,
            description: exp.content,
        }));
        // 5. 학력
        const educations = profile.education.map((edu) => ({
            school_name: edu.school || '',
            major: edu.major || '',
            degree_type: null, // UI에 학위 구분이 없으므로 null
        }));
        // 6. 일정
        const schedules = [];
        Object.entries(profile.weeklySchedule).forEach(([day, val]) => {
            if (val.active) {
                val.slots.forEach((slot) => {
                    schedules.push({
                        day_of_week: day,
                        start_time: slot.start,
                        end_time: slot.end,
                        is_holiday: false,
                    });
                });
            } else {
                schedules.push({
                    day_of_week: day,
                    start_time: '00:00',
                    end_time: '00:00',
                    is_holiday: true,
                });
            }
        });
        const req = { profile: profileData, specialties, experiences, educations, schedules };
        try {
            // 0. user 테이블 정보도 업데이트
            const user = await getMyInfo(token);
            const { updateUserInfo } = await import('../api/user');
            await updateUserInfo({
                id: user.id,
                full_name: basic.name,
                phone_number: basic.phone,
                email: basic.email,
            });
            // 1. 상담사 프로필 등록
            await registerCounselorProfile(req, token);
            alert('상담사 프로필이 성공적으로 등록되었습니다!');
            localStorage.setItem('counselor_registered', 'true');
            navigate('/counselormypage');
        } catch (e) {
            alert('프로필 등록에 실패했습니다.');
        }
    };

    /* ── 렌더 ─────────────────────────────────────────── */
    return (
        <div className="app">
            <Header />
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
                                <div className="photo-box" style={{ position: 'relative' }}>
                                    {photoPreview ? (
                                        <img
                                            src={photoPreview}
                                            alt="프로필 미리보기"
                                            style={{
                                                width: '100%',
                                                height: '100%',
                                                objectFit: 'cover',
                                                borderRadius: '50%',
                                            }}
                                        />
                                    ) : (
                                        <>
                                            <Camera size={28} />
                                            <span>사진 업로드</span>
                                        </>
                                    )}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        style={{ display: 'none' }}
                                        id="profile-photo-input"
                                        onChange={(e) => {
                                            const file = e.target.files[0];
                                            if (file) {
                                                setPhoto(file);
                                                setPhotoPreview(URL.createObjectURL(file));
                                            }
                                        }}
                                    />
                                </div>
                                <button
                                    className="photo-add-btn"
                                    onClick={() => document.getElementById('profile-photo-input').click()}
                                    type="button"
                                >
                                    <Plus size={14} />
                                </button>
                                {photoPreview && (
                                    <button
                                        className="photo-add-btn"
                                        style={{ background: '#f87171', marginLeft: 8 }}
                                        onClick={() => {
                                            setPhoto(null);
                                            setPhotoPreview(null);
                                            document.getElementById('profile-photo-input').value = '';
                                        }}
                                        type="button"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                )}
                            </div>

                            <div className="form-fields">
                                <div className="grid-2">
                                    {basicInput('name', '이름', null, 'text', '성함을 입력해 주세요')}
                                    {basicInput('phone', '연락처', <Phone size={11} />, 'text', '010-0000-0000')}
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
                                {/* 상담사 자기소개 입력란 */}
                                <div className="input-group">
                                    <label className="input-label">상담사 자기소개</label>
                                    <textarea
                                        className="input"
                                        style={{ minHeight: '80px', resize: 'none' }}
                                        value={basic.introduction}
                                        onChange={(e) => setBasic({ ...basic, introduction: e.target.value })}
                                        placeholder="상담사님의 전문 분야, 상담 철학, 주요 경력 등을 자유롭게 소개해 주세요."
                                    />
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
                        <button className="cta-btn" onClick={handleRegister}>
                            <Save size={17} /> 프로필 등록 완료
                        </button>
                    )}
                </div>
            </main>

            <MobileTap />
            <Footer />
        </div>
    );
}
