import React, { useState, useRef, useEffect } from 'react';

import {
    User,
    Award,
    BookOpen,
    CheckCircle2,
    Trash2,
    Calendar,
    ChevronDown,
    Plus,
    X,
    Camera,
    MapPin,
    Save,
    AlertCircle,
} from 'lucide-react';
import DatePicker from '../components/DatePicker.jsx';
import YearMonthPicker from '../components/YearMonthPicker.jsx';

import '../static/CounselorUpload.css';
import Header from '../components/header.jsx';
import Footer from '../components/footer.jsx';
import MobileTap from '../components/mobileTap.jsx';
import {
    registerCounselorProfile,
    registerSpecialty,
    registerCertificate,
    registerEducation,
    registerExperience,
    registerSchedule,
} from '../api/counselor.js';
import { getMyInfo } from '../api/user.js';

const App = () => {
    // ── State ──
    const [activeTab, setActiveTab] = useState('basic');
    const [profileImage, setProfileImage] = useState(null);
    const fileInputRef = useRef(null);
    const [expertType, setExpertType] = useState([]);
    const [customExpertise, setCustomExpertise] = useState('');
    const [certificates, setCertificates] = useState([{ id: 1, year: '', month: '', name: '', issuer: '' }]);
    const [educations, setEducations] = useState([
        { id: 1, startYear: '', startMonth: '', endYear: '', endMonth: '', school: '', major: '' },
    ]);
    const [experiences, setExperiences] = useState([
        { id: 1, startYearMonth: '', endYearMonth: '', content: '', isCurrent: false },
    ]);

    // 기본정보 입력값 상태
    const [basicName, setBasicName] = useState('');
    const [basicId, setBasicId] = useState('');
    const [basicEmail, setBasicEmail] = useState('');
    const [basicPhone, setBasicPhone] = useState('');
    const [basicCenter, setBasicCenter] = useState('');
    const [basicAddress, setBasicAddress] = useState('');
    const [basicPrice, setBasicPrice] = useState(''); // 상담 가격
    const [basicIntro, setBasicIntro] = useState(''); // 한줄 소개
    const [basicWarn, setBasicWarn] = useState('');
    const [showWarn, setShowWarn] = useState({
        name: false,
        phone: false,
        center: false,
        address: false,
    });

    // 회원정보 자동 입력
    useEffect(() => {
        const fetchUser = async () => {
            const token = localStorage.getItem('accessToken');
            if (!token) return;
            try {
                const user = await getMyInfo(token);
                // user: { name, username/user_id, email, phone }
                if (user) {
                    setBasicName(user.name || '');
                    setBasicId(user.username || user.user_id || '');
                    setBasicEmail(user.email || '');
                    setBasicPhone(user.phone || '');
                }
            } catch (e) {
                // ignore
            }
        };
        fetchUser();
    }, []);

    const days = ['월요일', '화요일', '수요일', '목요일', '금요일', '토요일', '일요일'];
    const [weeklySchedule, setWeeklySchedule] = useState(
        days.reduce(
            (acc, day) => ({
                ...acc,
                [day]: { active: day !== '토요일' && day !== '일요일', slots: [{ start: '10:00', end: '19:00' }] },
            }),
            {}
        )
    );

    // ── Constants ──
    const currentYear = new Date().getFullYear();
    const yearOptions = Array.from({ length: 40 }, (_, i) => currentYear - i);
    const monthOptions = Array.from({ length: 12 }, (_, i) => i + 1);
    const timeOptions = Array.from({ length: 11 }, (_, i) => `${10 + i}:00`);
    const expertiseList = [
        '개인심리',
        '취업상담',
        '진로상담',
        '대인관계',
        '가족상담',
        '우울/불안',
        '연애/결혼',
        '공황/장애',
        '트라우마',
        '중독상담',
        '번아웃',
        '스트레스',
        '자존감향상',
        '성격상담',
        '학업/시험',
    ];

    // ── Handlers ──
    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const r = new FileReader();
            r.onloadend = () => setProfileImage(r.result);
            r.readAsDataURL(file);
        }
    };

    const toggleDayActive = (day) => setWeeklySchedule((p) => ({ ...p, [day]: { ...p[day], active: !p[day].active } }));
    const updateTime = (day, idx, type, value) => {
        const newSlots = [...weeklySchedule[day].slots];
        newSlots[idx][type] = value;
        setWeeklySchedule((p) => ({ ...p, [day]: { ...p[day], slots: newSlots } }));
    };
    const addTimeSlot = (day) =>
        setWeeklySchedule((p) => ({
            ...p,
            [day]: { ...p[day], slots: [...p[day].slots, { start: '10:00', end: '19:00' }] },
        }));
    const removeTimeSlot = (day, idx) =>
        setWeeklySchedule((p) => ({ ...p, [day]: { ...p[day], slots: p[day].slots.filter((_, i) => i !== idx) } }));

    const addCertificate = () =>
        setCertificates((p) => [...p, { id: Date.now(), year: '', month: '', name: '', issuer: '' }]);
    const removeCertificate = (id) => setCertificates((p) => p.filter((c) => c.id !== id));
    const addEducation = () =>
        setEducations((p) => [
            ...p,
            { id: Date.now(), startYear: '', startMonth: '', endYear: '', endMonth: '', school: '', major: '' },
        ]);
    const removeEducation = (id) => setEducations((p) => p.filter((e) => e.id !== id));
    const addExperience = () =>
        setExperiences((p) => [
            ...p,
            { id: Date.now(), startYearMonth: '', endYearMonth: '', content: '', isCurrent: false },
        ]);
    const removeExperience = (id) => setExperiences((p) => p.filter((e) => e.id !== id));
    const handleExperienceChange = (id, field, value) => {
        setExperiences((p) => p.map((e) => (e.id === id ? { ...e, [field]: value } : e)));
    };

    // ── DatePicker ──
    // 프로필 사진 클릭 시 파일 선택창 열기
    const handlePhotoClick = () => {
        if (fileInputRef.current) fileInputRef.current.click();
    };
    const renderBasicInfo = () => (
        <div className="cu-ep-basic cu-ep-animate">
            <div className="cu-ep-photo-section">
                <div className="cu-ep-photo-box" onClick={handlePhotoClick}>
                    {profileImage ? (
                        <img src={profileImage} alt="프로필" className="cu-ep-photo-img" />
                    ) : (
                        <User style={{ color: '#8BA888', width: '3.5rem', height: '3.5rem' }} />
                    )}
                    <div className="cu-ep-photo-overlay">
                        <Plus style={{ color: '#fff', width: '1.5rem', height: '1.5rem' }} />
                    </div>
                </div>
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    accept="image/*"
                    style={{ display: 'none' }}
                />
                <p className="cu-ep-photo-hint">
                    JPG, PNG 지원
                    <br />
                    권장 사이즈: 500x500px
                </p>
            </div>

            <div className="cu-ep-fields">
                <div className="cu-ep-field">
                    <label className="cu-ep-label">
                        이름 <span className="cu-ep-required">*</span>
                    </label>
                    <input
                        type="text"
                        placeholder="이름을 입력하세요"
                        className="cu-ep-input"
                        value={basicName}
                        onChange={(e) => {
                            setBasicName(e.target.value);
                            setShowWarn((w) => ({ ...w, name: false }));
                        }}
                        readOnly
                    />
                    {showWarn.name && <span className="cu-ep-required-msg">필수 입력 항목입니다.</span>}
                </div>
                <div className="cu-ep-field">
                    <label className="cu-ep-label">
                        아이디 <span className="cu-ep-label-badge">수정 불가</span>
                    </label>
                    <input type="text" value={basicId} readOnly className="cu-ep-input-ro" />
                </div>
                <div className="cu-ep-field">
                    <label className="cu-ep-label">이메일</label>
                    <input
                        type="email"
                        value={basicEmail}
                        onChange={(e) => setBasicEmail(e.target.value)}
                        className="cu-ep-input"
                    />
                </div>
                <div className="cu-ep-field">
                    <label className="cu-ep-label">
                        개인 연락처 <span className="cu-ep-required">*</span>
                    </label>
                    <input
                        type="tel"
                        placeholder="010-0000-0000"
                        className="cu-ep-input"
                        value={basicPhone}
                        onChange={(e) => {
                            setBasicPhone(e.target.value);
                            setShowWarn((w) => ({ ...w, phone: false }));
                        }}
                        readOnly
                    />
                    {showWarn.phone && <span className="cu-ep-required-msg">필수 입력 항목입니다.</span>}
                </div>
                {/* 한줄 소개 입력란 (상담소 주소와 동일한 너비) */}
                <div className="cu-ep-field cu-ep-span2">
                    <label className="cu-ep-label">한줄 소개</label>
                    <input
                        type="text"
                        placeholder="상담사님을 한 문장으로 소개해 주세요 (예: 따뜻하게 공감하는 상담사입니다)"
                        className="cu-ep-input"
                        value={basicIntro}
                        onChange={(e) => setBasicIntro(e.target.value)}
                        maxLength={40}
                    />
                </div>
                <div className="cu-ep-divider">
                    <div className="cu-ep-field-group">
                        <label className="cu-ep-group-label">
                            <MapPin style={{ width: '1rem', height: '1rem', color: '#8BA888' }} /> 상담소 정보
                        </label>
                    </div>
                </div>
                <div className="cu-ep-field">
                    <label className="cu-ep-label">
                        상담소명 <span className="cu-ep-required">*</span>
                    </label>
                    <input
                        type="text"
                        placeholder="소속 상담소 이름을 입력하세요"
                        className="cu-ep-input"
                        value={basicCenter}
                        onChange={(e) => {
                            setBasicCenter(e.target.value);
                            setShowWarn((w) => ({ ...w, center: false }));
                        }}
                    />
                    {showWarn.center && <span className="cu-ep-required-msg">필수 입력 항목입니다.</span>}
                </div>
                <div className="cu-ep-field">
                    <label className="cu-ep-label">상담소 전화번호</label>
                    <input type="tel" placeholder="02-000-0000" className="cu-ep-input" />
                </div>
                <div className="cu-ep-field cu-ep-span2">
                    <label className="cu-ep-label">
                        상담소 주소 <span className="cu-ep-required">*</span>
                    </label>
                    <input
                        type="text"
                        placeholder="상담소가 위치한 상세 주소를 입력하세요"
                        className="cu-ep-input"
                        value={basicAddress}
                        onChange={(e) => {
                            setBasicAddress(e.target.value);
                            setShowWarn((w) => ({ ...w, address: false }));
                        }}
                    />
                    {showWarn.address && <span className="cu-ep-required-msg">필수 입력 항목입니다.</span>}
                </div>
                {/* 상담 가격 입력란 및 안내문을 주소 밑으로 이동 */}
                <div className="cu-ep-field">
                    <label className="cu-ep-label">상담 가격 (원)</label>
                    <input
                        type="text"
                        placeholder="상담 1회 가격을 입력하세요"
                        className="cu-ep-input"
                        value={basicPrice}
                        onChange={(e) => {
                            // 숫자만 입력받고 천 단위 콤마 추가
                            const raw = e.target.value.replace(/[^0-9]/g, '');
                            const formatted = raw.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
                            setBasicPrice(formatted);
                        }}
                        min="0"
                        inputMode="numeric"
                        pattern="[0-9,]*"
                    />
                    <div style={{ fontSize: '0.85rem', color: '#888', marginTop: '0.1rem', whiteSpace: 'nowrap' }}>
                        ※ 대면 상담 기준 시간당 평균가를 입력해 주세요.
                    </div>
                </div>
            </div>
        </div>
    );
    // ...existing code...

    const renderExpertise = () => (
        <div className="cu-ep-expertise cu-ep-animate">
            <section>
                <h3 className="cu-ep-section-title">
                    <CheckCircle2 style={{ width: '1.25rem', height: '1.25rem', color: '#8BA888' }} />
                    전문 상담분야 <span className="cu-ep-section-hint">(중복 선택 가능)</span>
                </h3>
                <div className="cu-ep-chips">
                    {expertiseList.map((item) => (
                        <button
                            key={item}
                            onClick={() =>
                                setExpertType((p) => (p.includes(item) ? p.filter((t) => t !== item) : [...p, item]))
                            }
                            className={`cu-ep-chip${expertType.includes(item) ? ' cu-ep-chip-on' : ''}`}
                        >
                            {item}
                        </button>
                    ))}
                </div>
                <div className="cu-ep-field">
                    <label className="cu-ep-custom-label">기타 전문분야 직접 입력</label>
                    <textarea
                        value={customExpertise}
                        onChange={(e) => setCustomExpertise(e.target.value)}
                        placeholder="제시된 항목 외의 구체적인 상담 전문 분야가 있다면 입력해주세요."
                        className="cu-ep-textarea"
                    />
                </div>
            </section>

            <section>
                <h3 className="cu-ep-section-title">
                    <span className="cu-ep-schedule-bar" />
                    주간 상담 일정
                </h3>
                <div className="cu-ep-schedule-list">
                    {days.map((day) => {
                        const d = weeklySchedule[day];
                        return (
                            <div key={day} className={`cu-ep-schedule-row${d.active ? ' cu-ep-day-on' : ''}`}>
                                <div className="cu-ep-day-toggle">
                                    <button
                                        onClick={() => toggleDayActive(day)}
                                        className={`cu-ep-toggle-btn${d.active ? ' cu-ep-toggle-on' : ''}`}
                                    >
                                        <CheckCircle2 style={{ width: '1rem', height: '1rem' }} />
                                    </button>
                                    <span className={`cu-ep-day-label${d.active ? ' cu-ep-day-label-on' : ''}`}>
                                        {day}
                                    </span>
                                </div>
                                <div className="cu-ep-slots">
                                    {d.active ? (
                                        <div className="cu-ep-slots-row">
                                            {d.slots.map((slot, idx) => (
                                                <div key={idx} className="cu-ep-slot">
                                                    <div className="cu-ep-time-select">
                                                        <select
                                                            value={slot.start}
                                                            onChange={(e) =>
                                                                updateTime(day, idx, 'start', e.target.value)
                                                            }
                                                        >
                                                            {timeOptions.map((t) => (
                                                                <option key={t} value={t}>
                                                                    {t}
                                                                </option>
                                                            ))}
                                                        </select>
                                                        <ChevronDown className="cu-ep-dp-chevron" />
                                                    </div>
                                                    <span className="cu-ep-time-sep">~</span>
                                                    <div className="cu-ep-time-select">
                                                        <select
                                                            value={slot.end}
                                                            onChange={(e) =>
                                                                updateTime(day, idx, 'end', e.target.value)
                                                            }
                                                        >
                                                            {timeOptions
                                                                .filter((t) => {
                                                                    // 시작시간이 선택되어 있으면, 끝나는 시간은 시작시간보다 1시간 이후부터만 표시
                                                                    if (!slot.start) return true;
                                                                    const startHour = parseInt(
                                                                        slot.start.split(':')[0],
                                                                        10
                                                                    );
                                                                    const tHour = parseInt(t.split(':')[0], 10);
                                                                    return tHour > startHour;
                                                                })
                                                                .map((t) => (
                                                                    <option key={t} value={t}>
                                                                        {t}
                                                                    </option>
                                                                ))}
                                                        </select>
                                                        <ChevronDown className="cu-ep-dp-chevron" />
                                                    </div>
                                                    {d.slots.length > 1 && (
                                                        <button
                                                            onClick={() => removeTimeSlot(day, idx)}
                                                            className="cu-ep-slot-rm"
                                                        >
                                                            <X style={{ width: '0.875rem', height: '0.875rem' }} />
                                                        </button>
                                                    )}
                                                </div>
                                            ))}
                                            <button
                                                onClick={() => addTimeSlot(day)}
                                                className="cu-ep-slot-add"
                                                title="시간 추가"
                                            >
                                                <Plus style={{ width: '1rem', height: '1rem' }} />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="cu-ep-day-off-msg">휴무일입니다.</div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>
        </div>
    );

    const renderHistory = () => (
        <div className="cu-ep-history cu-ep-animate">
            {/* 자격증 */}
            <section>
                <div className="cu-ep-section-header">
                    <h3 className="cu-ep-section-title">
                        <Award style={{ width: '1.25rem', height: '1.25rem', color: '#8BA888' }} /> 자격증
                    </h3>
                    <button onClick={addCertificate} className="cu-ep-add-btn">
                        <Plus style={{ width: '0.875rem', height: '0.875rem' }} /> 추가
                    </button>
                </div>
                <div className="cu-ep-items">
                    {certificates.map((cert) => (
                        <div key={cert.id} className="cu-ep-cert-item">
                            <div className="cu-ep-cert-date">
                                <YearMonthPicker
                                    value={cert.yearMonth}
                                    onChange={(v) =>
                                        setCertificates((p) =>
                                            p.map((c) => (c.id === cert.id ? { ...c, yearMonth: v } : c))
                                        )
                                    }
                                />
                            </div>
                            <div className="cu-ep-item-field">
                                <label className="cu-ep-item-label">자격증명</label>
                                <input
                                    type="text"
                                    placeholder="자격증 이름을 입력하세요"
                                    className="cu-ep-item-input"
                                />
                            </div>
                            <div className="cu-ep-item-field">
                                <label className="cu-ep-item-label">발급 기관</label>
                                <input type="text" placeholder="기관명" className="cu-ep-item-input" />
                            </div>
                            <button onClick={() => removeCertificate(cert.id)} className="cu-ep-rm-btn">
                                <Trash2 style={{ width: '1rem', height: '1rem' }} />
                            </button>
                        </div>
                    ))}
                </div>
            </section>

            {/* 학력 */}
            <section>
                <div className="cu-ep-section-header">
                    <h3 className="cu-ep-section-title">
                        <BookOpen style={{ width: '1.25rem', height: '1.25rem', color: '#8BA888' }} /> 학력 사항
                    </h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <button onClick={addEducation} className="cu-ep-add-btn">
                            <Plus style={{ width: '0.875rem', height: '0.875rem' }} /> 추가
                        </button>
                        {educations.length > 1 && (
                            <button
                                onClick={() => removeEducation(educations[educations.length - 1].id)}
                                className="cu-ep-rm-btn"
                                title="마지막 학력 삭제"
                            >
                                <Trash2 style={{ width: '1rem', height: '1rem' }} />
                            </button>
                        )}
                    </div>
                </div>
                <div className="cu-ep-edu-items">
                    {educations.map((edu) => (
                        <div key={edu.id} className="cu-ep-edu-item">
                            <div
                                className="cu-ep-edu-grid-2x2"
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns: '1fr 1fr',
                                    gridTemplateRows: '1fr 1fr',
                                    gap: '1rem',
                                    alignItems: 'start',
                                    width: '100%',
                                }}
                            >
                                {/* 입학일 */}
                                <div
                                    className="cu-ep-edu-field-group"
                                    style={{ display: 'flex', flexDirection: 'column' }}
                                >
                                    <div className="cu-ep-edu-label">입학일</div>
                                    <YearMonthPicker
                                        value={edu.startYearMonth}
                                        onChange={(v) =>
                                            setEducations((p) =>
                                                p.map((e) => (e.id === edu.id ? { ...e, startYearMonth: v } : e))
                                            )
                                        }
                                    />
                                </div>
                                {/* 졸업일 */}
                                <div
                                    className="cu-ep-edu-field-group"
                                    style={{ display: 'flex', flexDirection: 'column' }}
                                >
                                    <div className="cu-ep-edu-label">졸업일</div>
                                    <YearMonthPicker
                                        value={edu.endYearMonth}
                                        onChange={(v) =>
                                            setEducations((p) =>
                                                p.map((e) => (e.id === edu.id ? { ...e, endYearMonth: v } : e))
                                            )
                                        }
                                    />
                                </div>
                                {/* 학교명 */}
                                <div className="cu-ep-item-field" style={{ display: 'flex', flexDirection: 'column' }}>
                                    <label className="cu-ep-item-label">학교명</label>
                                    <input type="text" placeholder="학교명을 입력하세요" className="cu-ep-item-input" />
                                </div>
                                {/* 전공 및 학위 */}
                                <div className="cu-ep-item-field" style={{ display: 'flex', flexDirection: 'column' }}>
                                    <label className="cu-ep-item-label">전공 및 학위</label>
                                    <input type="text" placeholder="전공 및 학위" className="cu-ep-item-input" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* 경력 */}
            <section>
                <div className="cu-ep-section-header">
                    <h3 className="cu-ep-section-title">
                        <User style={{ width: '1.25rem', height: '1.25rem', color: '#8BA888' }} /> 경력 사항
                    </h3>
                    <button onClick={addExperience} className="cu-ep-add-btn">
                        <Plus style={{ width: '0.875rem', height: '0.875rem' }} /> 추가
                    </button>
                </div>
                <div className="cu-ep-items">
                    {experiences.map((exp) => (
                        <div
                            key={exp.id}
                            className="cu-ep-exp-item"
                            style={{
                                display: 'grid',
                                gridTemplateColumns: '1fr 1fr',
                                gridTemplateRows: '1fr 1fr',
                                gap: '1rem',
                                alignItems: 'start',
                                width: '100%',
                                position: 'relative',
                                background: '#fff',
                                borderRadius: '0.5rem',
                                padding: '1rem',
                                marginBottom: '1rem',
                                boxShadow: '0 1px 4px 0 rgba(0,0,0,0.04)',
                            }}
                        >
                            {/* 시작일 */}
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <label className="cu-ep-item-label">시작일</label>
                                <YearMonthPicker
                                    value={exp.startYearMonth}
                                    onChange={(v) => handleExperienceChange(exp.id, 'startYearMonth', v)}
                                />
                            </div>
                            {/* 종료일 */}
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <label className="cu-ep-item-label">종료일</label>
                                {exp.isCurrent ? (
                                    <input
                                        type="text"
                                        value="현재 진행중"
                                        readOnly
                                        className="cu-ep-item-input"
                                        style={{
                                            width: '7.5rem',
                                            background: '#f3f4f6',
                                            color: '#8BA888',
                                            border: 'none',
                                            textAlign: 'center',
                                        }}
                                    />
                                ) : (
                                    <YearMonthPicker
                                        value={exp.endYearMonth}
                                        onChange={(v) => handleExperienceChange(exp.id, 'endYearMonth', v)}
                                    />
                                )}
                            </div>
                            {/* 활동 내용 */}
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <label className="cu-ep-item-label">활동 내용</label>
                                <input
                                    type="text"
                                    placeholder="소속 및 직책 등을 입력하세요"
                                    className="cu-ep-item-input"
                                    value={exp.content}
                                    onChange={(e) => handleExperienceChange(exp.id, 'content', e.target.value)}
                                />
                            </div>
                            {/* 현재진행중 체크박스 */}
                            <div style={{ display: 'flex', alignItems: 'center', marginTop: '1.2rem' }}>
                                <input
                                    type="checkbox"
                                    id={`current-${exp.id}`}
                                    checked={exp.isCurrent}
                                    onChange={(e) => handleExperienceChange(exp.id, 'isCurrent', e.target.checked)}
                                    style={{ marginRight: '0.5rem' }}
                                />
                                <label htmlFor={`current-${exp.id}`} style={{ fontSize: '0.95rem', color: '#666' }}>
                                    현재 진행중
                                </label>
                            </div>
                            {/* 삭제 버튼 (우하단) */}
                            <button
                                onClick={() => removeExperience(exp.id)}
                                className="cu-ep-rm-btn"
                                style={{ position: 'absolute', bottom: '0.5rem', right: '0.5rem', top: 'auto' }}
                            >
                                <Trash2 style={{ width: '1rem', height: '1rem' }} />
                            </button>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );

    // ── Render ──
    return (
        <div className="cu-ep-page">
            {/* 임시저장 플로팅 버튼 */}
            <button className="cu-ep-float-btn" onClick={() => alert('임시 저장되었습니다.')}>
                <Save style={{ width: '1rem', height: '1rem', color: '#8BA888' }} />
                <span className="cu-ep-float-label">임시저장</span>
            </button>

            {/* 헤더 교체: activeTab, setActiveTab 전달 */}
            {/* 상담사 헤더가 보이도록 명시적으로 props 전달 */}
            <Header
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                isLoggedIn={true}
                userName={'상담사'}
                setUserName={() => {}}
                setIsLoggedIn={() => {}}
            />

            {/* 메인 */}
            <main className="cu-ep-main">
                <div className="cu-ep-page-title">
                    <h2>전문가 프로필 등록</h2>
                    <p>상담사님의 전문성을 보여줄 수 있도록 상세하게 작성 부탁드립니다.</p>
                </div>

                {/* 탭 */}
                <div className="cu-ep-tabs">
                    {[
                        { id: 'basic', label: '기본 정보' },
                        { id: 'expertise', label: '전문 분야' },
                        { id: 'history', label: '학력/경력' },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => {
                                // Prevent moving to '전문 분야' or '학력/경력' if basic info is not valid
                                if ((tab.id === 'expertise' || tab.id === 'history') && activeTab === 'basic') {
                                    const warnObj = {
                                        name: !basicName.trim(),
                                        phone: !basicPhone.trim(),
                                        center: !basicCenter.trim(),
                                        address: !basicAddress.trim(),
                                    };
                                    setShowWarn(warnObj);
                                    if (warnObj.name || warnObj.phone || warnObj.center || warnObj.address) return;
                                }
                                setActiveTab(tab.id);
                            }}
                            className={`cu-ep-tab-btn${activeTab === tab.id ? ' cu-ep-tab-active' : ''}`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* 컨텐츠 */}
                <div className="cu-ep-content">
                    {activeTab === 'basic' && renderBasicInfo()}
                    {activeTab === 'expertise' && renderExpertise()}
                    {activeTab === 'history' && renderHistory()}

                    <div className="cu-ep-nav">
                        <div className="cu-ep-nav-hint" style={{ color: '#8BA888', fontSize: '0.97rem' }}>
                            <CheckCircle2
                                style={{
                                    width: '1rem',
                                    height: '1rem',
                                    color: '#8BA888',
                                    flexShrink: 0,
                                    marginRight: '0.3rem',
                                }}
                            />
                            관리자 승인까지는 최대 2~3일 소요될 수 있습니다.
                        </div>
                        <div className="cu-ep-nav-btns">
                            {activeTab !== 'basic' && (
                                <button
                                    onClick={() => setActiveTab(activeTab === 'history' ? 'expertise' : 'basic')}
                                    className="cu-ep-btn-prev"
                                >
                                    이전
                                </button>
                            )}
                            <button
                                onClick={async () => {
                                    if (activeTab === 'basic') {
                                        const warnObj = {
                                            name: !basicName.trim(),
                                            phone: !basicPhone.trim(),
                                            center: !basicCenter.trim(),
                                            address: !basicAddress.trim(),
                                        };
                                        setShowWarn(warnObj);
                                        if (warnObj.name || warnObj.phone || warnObj.center || warnObj.address) return;
                                        setActiveTab('expertise');
                                    } else if (activeTab === 'expertise') setActiveTab('history');
                                    else {
                                        // 등록 신청하기 클릭 시
                                        const token = localStorage.getItem('accessToken');
                                        if (!token) {
                                            alert('로그인이 필요합니다.');
                                            return;
                                        }
                                        try {
                                            // 1. 프로필 등록
                                            await registerCounselorProfile(
                                                {
                                                    name: basicName,
                                                    phone: basicPhone,
                                                    center: basicCenter,
                                                    address: basicAddress,
                                                    price: basicPrice.replace(/,/g, ''),
                                                    intro: basicIntro,
                                                    profile_image: profileImage,
                                                },
                                                token
                                            );

                                            // 2. 전문분야 등록
                                            await registerSpecialty(
                                                {
                                                    specialties: expertType,
                                                    custom_specialty: customExpertise,
                                                },
                                                token
                                            );

                                            // 3. 자격증 등록
                                            await registerCertificate(
                                                {
                                                    certificates: certificates.map((c) => ({
                                                        year: c.year,
                                                        month: c.month,
                                                        name: c.name,
                                                        issuer: c.issuer,
                                                    })),
                                                },
                                                token
                                            );

                                            // 4. 학력 등록
                                            await registerEducation(
                                                {
                                                    educations: educations.map((e) => ({
                                                        start_year: e.startYear,
                                                        start_month: e.startMonth,
                                                        end_year: e.endYear,
                                                        end_month: e.endMonth,
                                                        school: e.school,
                                                        major: e.major,
                                                    })),
                                                },
                                                token
                                            );

                                            // 5. 경력 등록
                                            await registerExperience(
                                                {
                                                    experiences: experiences.map((e) => ({
                                                        start_year_month: e.startYearMonth,
                                                        end_year_month: e.endYearMonth,
                                                        content: e.content,
                                                        is_current: e.isCurrent,
                                                    })),
                                                },
                                                token
                                            );

                                            // 6. 스케줄 등록
                                            await registerSchedule(
                                                {
                                                    schedule: Object.entries(weeklySchedule).map(([day, val]) => ({
                                                        day,
                                                        active: val.active,
                                                        slots: val.slots,
                                                    })),
                                                },
                                                token
                                            );

                                            alert('등록 신청이 완료되었습니다.');
                                        } catch (err) {
                                            alert('등록 중 오류가 발생했습니다.');
                                            console.error(err);
                                        }
                                    }
                                }}
                                className="cu-ep-btn-next"
                            >
                                {activeTab === 'history' ? '등록 신청하기' : '다음 단계'}
                            </button>
                        </div>
                    </div>
                </div>
            </main>

            {/* 모바일탭 교체 */}
            <MobileTap />

            {/* 푸터 교체 */}
            <Footer />
        </div>
    );
};

export default App;
