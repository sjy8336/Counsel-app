import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiUrl } from '../api/axiosInstance';
import {
    User,
    Award,
    BookOpen,
    CheckCircle2,
    Trash2,
    ChevronDown,
    Plus,
    X,
    MapPin,
    Save,
    AlertCircle,
} from 'lucide-react';
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
import { getMyInfo, updateUserInfo } from '../api/user.js';

const DAYS = ['월요일', '화요일', '수요일', '목요일', '금요일', '토요일', '일요일'];
const TIME_OPTIONS = Array.from({ length: 16 }, (_, i) => `${8 + i}:00`);
const EXPERTISE_LIST = [
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

const EMPTY_CERT = () => ({ id: Date.now(), yearMonth: '', name: '', issuer: '' });
const EMPTY_EDU = () => ({ id: Date.now(), startYearMonth: '', endYearMonth: '', school: '', major: '' });
const EMPTY_EXP = () => ({ id: Date.now(), startYearMonth: '', endYearMonth: '', content: '', isCurrent: false });
const initSchedule = () =>
    DAYS.reduce(
        (acc, day) => ({
            ...acc,
            [day]: { active: !['토요일', '일요일'].includes(day), slots: [{ start: '10:00', end: '19:00' }] },
        }),
        {}
    );

const DRAFT_KEY = (id) => `counselor_upload_draft_${id}`;

const App = () => {
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    const toastTimer = useRef(null);

    const [userId, setUserId] = useState(null);
    const [activeTab, setActiveTab] = useState('basic');
    const [toastMsg, setToastMsg] = useState('');
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [confirmChecked, setConfirmChecked] = useState(false);
    const [profileImage, setProfileImage] = useState(null);

    // 기본 정보
    const [basicName, setBasicName] = useState('');
    const [basicId, setBasicId] = useState('');
    const [basicEmail, setBasicEmail] = useState('');
    const [basicPhone, setBasicPhone] = useState('');
    const [basicCenterPhone, setBasicCenterPhone] = useState('');
    const [basicCenter, setBasicCenter] = useState('');
    const [basicAddress, setBasicAddress] = useState('');
    const [basicPrice, setBasicPrice] = useState('');
    const [basicIntro, setBasicIntro] = useState('');
    const [showWarn, setShowWarn] = useState({ name: false, phone: false, center: false, address: false });

    // 전문 분야 / 일정
    const [expertType, setExpertType] = useState([]);
    const [customExpertise, setCustomExpertise] = useState('');
    const [weeklySchedule, setWeeklySchedule] = useState(initSchedule);

    // 이력
    const [certificates, setCertificates] = useState([{ id: 1, yearMonth: '', name: '', issuer: '' }]);
    const [educations, setEducations] = useState([
        { id: 1, startYearMonth: '', endYearMonth: '', school: '', major: '' },
    ]);
    const [experiences, setExperiences] = useState([
        { id: 1, startYearMonth: '', endYearMonth: '', content: '', isCurrent: false },
    ]);

    // ── activeTab 바뀔 때마다 스크롤 최상단 ─────────────────────────────────
    useEffect(() => {
        window.scrollTo(0, 0);
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
    }, [activeTab]);

    // ── 유저 정보 로드 + draft 복원 ──────────────────────────────────────────
    useEffect(() => {
        const token = localStorage.getItem('access_token');
        if (!token) return;
        (async () => {
            try {
                const user = await getMyInfo(token);
                if (!user) return;
                const uid = user.id;
                setUserId(uid);
                const prevUid = localStorage.getItem('counselor_upload_prev_userid');
                if (prevUid && prevUid !== String(uid)) {
                    localStorage.removeItem(DRAFT_KEY(prevUid));
                }
                localStorage.setItem('counselor_upload_prev_userid', String(uid));
            } catch {
                fetchAndApplyUser(userId);
            }
        })();
    }, []);

    useEffect(() => {
        if (!userId) return;
        const draftKey = DRAFT_KEY(userId);
        const saved = localStorage.getItem(draftKey);
        if (saved) {
            try {
                const d = JSON.parse(saved);
                setBasicName(d.basicName ?? '');
                setBasicId(d.basicId ?? '');
                setBasicEmail(d.basicEmail ?? '');
                setBasicPhone(d.basicPhone ?? '');
                setBasicCenterPhone(d.basicCenterPhone ?? '');
                setBasicCenter(d.basicCenter ?? '');
                setBasicAddress(d.basicAddress ?? '');
                setBasicPrice(d.basicPrice ?? '');
                setBasicIntro(d.basicIntro ?? '');
                setExpertType(d.expertType ?? []);
                setCustomExpertise(d.customExpertise ?? '');
                setCertificates(d.certificates ?? [{ id: 1, yearMonth: '', name: '', issuer: '' }]);
                setEducations(d.educations ?? [{ id: 1, startYearMonth: '', endYearMonth: '', school: '', major: '' }]);
                setExperiences(
                    d.experiences ?? [{ id: 1, startYearMonth: '', endYearMonth: '', content: '', isCurrent: false }]
                );
                setWeeklySchedule(d.weeklySchedule ?? initSchedule());
                setProfileImage(d.profileImage ?? null);
            } catch {
                fetchAndApplyUser(userId);
            }
        } else {
            fetchAndApplyUser(userId);
        }
    }, [userId]);

    const fetchAndApplyUser = async (uid) => {
        const token = localStorage.getItem('access_token');
        if (!token) return;
        try {
            const user = await getMyInfo(token);
            if (user && user.id === uid) {
                setBasicName(user.full_name || '');
                setBasicId(user.username || user.id || '');
                setBasicEmail(user.email || '');
                setBasicPhone(user.phone_number || '');
            }
        } catch {
            return;
        }
    };

    const prevUserId = useRef(null);
    useEffect(() => {
        if (prevUserId.current === null) {
            prevUserId.current = userId;
            return;
        }
        if (!userId && prevUserId.current) {
            Object.keys(localStorage)
                .filter((k) => k.startsWith('counselor_upload_draft_') || k === 'counselor_upload_draft')
                .forEach((k) => localStorage.removeItem(k));
            localStorage.removeItem('counselor_upload_prev_userid');
        }
        prevUserId.current = userId;
    }, [userId]);

    // ── 임시저장 ─────────────────────────────────────────────────────────────
    const handleSaveDraft = () => {
        if (!userId) {
            showToast('로그인 후 임시저장이 가능합니다.');
            return;
        }
        const draftKey = DRAFT_KEY(userId);
        const draftValue = JSON.stringify({
            basicName,
            basicId,
            basicEmail,
            basicPhone,
            basicCenterPhone,
            basicCenter,
            basicAddress,
            basicPrice,
            basicIntro,
            expertType,
            customExpertise,
            certificates,
            educations,
            experiences,
            weeklySchedule,
            profileImage,
        });
        localStorage.setItem(draftKey, draftValue);
        showToast('임시 저장되었습니다.');
    };

    // ── 토스트 ───────────────────────────────────────────────────────────────
    const showToast = (msg) => {
        setToastMsg(msg);
        if (toastTimer.current) clearTimeout(toastTimer.current);
        toastTimer.current = setTimeout(() => setToastMsg(''), 2500);
    };

    // ── 유효성 검사 ──────────────────────────────────────────────────────────
    const validateBasic = () => {
        const w = {
            name: !basicName.trim(),
            phone: !basicPhone.trim(),
            center: !basicCenter.trim(),
            address: !basicAddress.trim(),
        };
        setShowWarn(w);
        return !Object.values(w).some(Boolean);
    };

    // ── 스케줄 헬퍼 ──────────────────────────────────────────────────────────
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

    // ── 자격증 헬퍼 ──────────────────────────────────────────────────────────
    const addCertificate = () => setCertificates((p) => [...p, EMPTY_CERT()]);
    const removeCertificate = (id) => setCertificates((p) => p.filter((c) => c.id !== id));
    const updateCertificate = (id, field, value) =>
        setCertificates((p) => p.map((c) => (c.id === id ? { ...c, [field]: value } : c)));

    // ── 학력 헬퍼 ────────────────────────────────────────────────────────────
    const addEducation = () => setEducations((p) => [...p, EMPTY_EDU()]);
    const removeEducation = (id) => setEducations((p) => p.filter((e) => e.id !== id));
    const updateEducation = (id, field, value) =>
        setEducations((p) => p.map((e) => (e.id === id ? { ...e, [field]: value } : e)));

    // ── 경력 헬퍼 ────────────────────────────────────────────────────────────
    const addExperience = () => setExperiences((p) => [...p, EMPTY_EXP()]);
    const removeExperience = (id) => setExperiences((p) => p.filter((e) => e.id !== id));
    const updateExperience = (id, field, value) =>
        setExperiences((p) => p.map((e) => (e.id === id ? { ...e, [field]: value } : e)));

    // ── 최종 제출 ────────────────────────────────────────────────────────────
    const handleFinalSubmit = async () => {
        const token = localStorage.getItem('access_token');
        if (!token) {
            alert('로그인이 필요합니다.');
            return;
        }
        try {
            if (userId && basicName) {
                await updateUserInfo(
                    { id: userId, full_name: basicName, email: basicEmail, phone_number: basicPhone },
                    token
                );
                const user = JSON.parse(localStorage.getItem('user') || '{}');
                user.full_name = basicName;
                localStorage.setItem('user', JSON.stringify(user));
                if (typeof window.setUserName === 'function') window.setUserName(basicName);
            }
            await registerCounselorProfile(
                {
                    center_name: basicCenter,
                    center_phone: basicCenterPhone,
                    center_address: basicAddress,
                    consultation_price: Number(basicPrice.replace(/,/g, '')) || 0,
                    intro_line: basicIntro,
                    profile_img_url: profileImage,
                },
                token
            );
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            user.profile_img_url = profileImage;
            localStorage.setItem('user', JSON.stringify(user));
            await registerSpecialty(
                expertType.map((name) => ({ specialty_name: name, custom_description: customExpertise || undefined })),
                token
            );
            await registerCertificate(
                certificates.map((c) => ({
                    acquisition_date: c.yearMonth,
                    certificate_name: c.name,
                    issuer: c.issuer,
                })),
                token
            );
            await registerEducation(
                educations.map((e) => ({
                    start_date: e.startYearMonth,
                    end_date: e.endYearMonth,
                    school_name: e.school,
                    major: e.major,
                })),
                token
            );
            await registerExperience(
                experiences.map((e) => ({
                    start_date: e.startYearMonth,
                    end_date: e.endYearMonth,
                    is_current: e.isCurrent,
                    content: e.content,
                })),
                token
            );
            const schedulePayload = Object.entries(weeklySchedule)
                .filter(([, val]) => val.active)
                .flatMap(([day, val]) =>
                    val.slots.map((slot) => ({
                        day_of_week: day,
                        start_time: slot.start + ':00',
                        end_time: slot.end + ':00',
                    }))
                );
            const scheduleResult = await registerSchedule(schedulePayload, token);
            if (Array.isArray(scheduleResult) && scheduleResult.some((item) => item.success === false)) {
                throw new Error('상담 일정 저장에 실패했습니다.');
            }
            if (userId) localStorage.removeItem(DRAFT_KEY(userId));
            setShowConfirmModal(false);
            setSubmitSuccess(true);
            showToast('등록 신청이 완료되었습니다.');
            setTimeout(() => navigate('/CounselorMyPage', { state: { profileStatus: '심사중' } }), 1200);
        } catch {
            alert('등록 중 오류가 발생했습니다.');
        }
    };

    // ── 탭 이동 ──────────────────────────────────────────────────────────────
    const handleTabChange = (tabId) => {
        if ((tabId === 'expertise' || tabId === 'history') && activeTab === 'basic' && !validateBasic()) return;
        setActiveTab(tabId);
    };

    const handleNext = () => {
        if (activeTab === 'basic') {
            if (!validateBasic()) return;
            setActiveTab('expertise');
        } else if (activeTab === 'expertise') {
            setActiveTab('history');
        } else {
            setConfirmChecked(false);
            setShowConfirmModal(true);
        }
    };

    // ── 확인 모달 ────────────────────────────────────────────────────────────
    const renderConfirmModal = () => {
        const fmt = (ym) => ym || '—';
        const fmtPeriod = (s, e, isCurrent) => `${fmt(s)} ~ ${isCurrent ? '현재 진행중' : fmt(e)}`;
        const activeSchedule = Object.entries(weeklySchedule).filter(([, v]) => v.active);
        return (
            <div
                className="cu-modal-backdrop"
                onClick={(e) => e.target === e.currentTarget && setShowConfirmModal(false)}
            >
                <div className="cu-modal">
                    <div className="cu-modal-header">
                        <div>
                            <h3 className="cu-modal-title">등록 신청 전 최종 확인</h3>
                            <p className="cu-modal-sub">
                                입력하신 내용을 검토해 주세요. 승인 후 수정은 고객센터를 통해 요청하셔야 합니다.
                            </p>
                        </div>
                        <button className="cu-modal-close" onClick={() => setShowConfirmModal(false)}>
                            <X className="cu-modal-close-icon" />
                        </button>
                    </div>

                    <p className="cu-modal-section-label">기본 정보</p>
                    <div className="cu-modal-info-card">
                        {[
                            ['이름', basicName],
                            ['연락처', basicPhone],
                            ['상담소명', basicCenter],
                            ['상담 가격', basicPrice ? `${basicPrice}원` : ''],
                        ].map(([k, v]) => (
                            <div key={k} className="cu-modal-info-row">
                                <span className="cu-modal-info-key">{k}</span>
                                <span className="cu-modal-info-val">{v || '—'}</span>
                            </div>
                        ))}
                        <div className="cu-modal-info-row cu-modal-span2">
                            <span className="cu-modal-info-key">주소</span>
                            <span className="cu-modal-info-val">{basicAddress || '—'}</span>
                        </div>
                        {basicIntro && (
                            <div className="cu-modal-info-row cu-modal-span2">
                                <span className="cu-modal-info-key">한줄 소개</span>
                                <span className="cu-modal-info-val">{basicIntro}</span>
                            </div>
                        )}
                    </div>

                    {expertType.length > 0 && (
                        <>
                            <p className="cu-modal-section-label">전문 분야</p>
                            <div className="cu-modal-chips">
                                {expertType.map((t) => (
                                    <span key={t} className="cu-modal-chip">
                                        {t}
                                    </span>
                                ))}
                            </div>
                        </>
                    )}

                    <hr className="cu-modal-divider" />

                    <p className="cu-modal-section-label">자격증</p>
                    {certificates.some((c) => c.name) ? (
                        <div className="cu-modal-list">
                            {certificates
                                .filter((c) => c.name)
                                .map((c) => (
                                    <div key={c.id} className="cu-modal-list-item">
                                        <span className="cu-modal-list-dot" />
                                        <div>
                                            <p className="cu-modal-list-main">{c.name}</p>
                                            <p className="cu-modal-list-sub">
                                                {c.issuer || '—'} · {fmt(c.yearMonth)}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                        </div>
                    ) : (
                        <p className="cu-modal-empty">입력된 자격증이 없습니다.</p>
                    )}

                    <p className="cu-modal-section-label">학력 사항</p>
                    {educations.some((e) => e.school) ? (
                        <div className="cu-modal-list">
                            {educations
                                .filter((e) => e.school)
                                .map((e) => (
                                    <div key={e.id} className="cu-modal-list-item">
                                        <span className="cu-modal-list-dot cu-modal-list-dot--edu" />
                                        <div>
                                            <p className="cu-modal-list-main">
                                                {e.school}
                                                {e.major ? ` — ${e.major}` : ''}
                                            </p>
                                            <p className="cu-modal-list-sub">
                                                {fmtPeriod(e.startYearMonth, e.endYearMonth, false)}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                        </div>
                    ) : (
                        <p className="cu-modal-empty">입력된 학력 정보가 없습니다.</p>
                    )}

                    <p className="cu-modal-section-label">경력 사항</p>
                    {experiences.some((e) => e.content) ? (
                        <div className="cu-modal-list">
                            {experiences
                                .filter((e) => e.content)
                                .map((e) => (
                                    <div key={e.id} className="cu-modal-list-item">
                                        <span className="cu-modal-list-dot cu-modal-list-dot--exp" />
                                        <div>
                                            <p className="cu-modal-list-main">{e.content}</p>
                                            <p className="cu-modal-list-sub">
                                                {fmtPeriod(e.startYearMonth, e.endYearMonth, e.isCurrent)}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                        </div>
                    ) : (
                        <p className="cu-modal-empty">입력된 경력 정보가 없습니다.</p>
                    )}

                    <p className="cu-modal-section-label">상담 운영 시간</p>
                    {activeSchedule.length > 0 ? (
                        <div className="cu-modal-list">
                            {activeSchedule.map(([day, val]) => (
                                <div key={day} className="cu-modal-list-item">
                                    <span className="cu-modal-list-dot cu-modal-list-dot--sch" />
                                    <div>
                                        <p className="cu-modal-list-main">{day}</p>
                                        <p className="cu-modal-list-sub">
                                            {val.slots.map((s) => `${s.start} ~ ${s.end}`).join(' / ')}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="cu-modal-empty">설정된 운영 시간이 없습니다.</p>
                    )}

                    <hr className="cu-modal-divider" />

                    <div className="cu-modal-notice">
                        <AlertCircle className="cu-modal-notice-icon" />
                        <p className="cu-modal-notice-text">
                            등록 신청 후 관리자 검토까지 <strong>영업일 기준 2~3일</strong>이 소요됩니다. 심사 결과는
                            등록하신 이메일로 안내드립니다.
                        </p>
                    </div>

                    <label className="cu-modal-check-row">
                        <div
                            className={`cu-modal-checkbox${confirmChecked ? ' cu-modal-checkbox-on' : ''}`}
                            onClick={() => setConfirmChecked((v) => !v)}
                        >
                            {confirmChecked && (
                                <CheckCircle2 className="cu-modal-check-icon" />
                            )}
                        </div>
                        <input
                            type="checkbox"
                            checked={confirmChecked}
                            onChange={(e) => setConfirmChecked(e.target.checked)}
                            className="cu-hidden-input"
                        />
                        <span className="cu-modal-check-label">
                            위 내용을 모두 확인하였으며, 사실과 다름이 없습니다.
                        </span>
                    </label>

                    <div className="cu-modal-btn-row">
                        <button className="cu-modal-btn-cancel" onClick={() => setShowConfirmModal(false)}>
                            다시 수정하기
                        </button>
                        <button
                            className={`cu-modal-btn-submit${confirmChecked ? ' cu-modal-btn-submit-on' : ''}`}
                            onClick={handleFinalSubmit}
                            disabled={!confirmChecked}
                        >
                            등록 신청하기
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    // ── 탭 렌더: 기본 정보 ───────────────────────────────────────────────────
    const renderBasicInfo = () => (
        <div className="cu-ep-basic cu-ep-animate">
            <div className="cu-ep-photo-section">
                <div className="cu-ep-photo-box" onClick={() => fileInputRef.current?.click()}>
                    {profileImage ? (
                        <img src={profileImage} alt="프로필" className="cu-ep-photo-img" />
                    ) : (
                        <User className="cu-ep-photo-icon" />
                    )}
                    <div className="cu-ep-photo-overlay">
                        <Plus className="cu-ep-photo-plus-icon" />
                    </div>
                </div>
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={async (e) => {
                        const file = e.target.files[0];
                        if (file) {
                            const formData = new FormData();
                            formData.append('file', file);
                            try {
                                const token = localStorage.getItem('access_token');
                                const res = await fetch(apiUrl('/upload/profile-image'), {
                                    method: 'POST',
                                    headers: {
                                        Authorization: `Bearer ${token}`,
                                    },
                                    body: formData,
                                });
                                const data = await res.json();
                                if (data.profile_img_url) {
                                    setProfileImage(data.profile_img_url);
                                } else {
                                    alert('이미지 업로드에 실패했습니다.');
                                }
                            } catch {
                                alert('이미지 업로드에 실패했습니다.');
                            }
                        }
                    }}
                    accept="image/*"
                    className="cu-hidden-input"
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
                        autoComplete="off"
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
                        autoComplete="off"
                    />
                    {showWarn.phone && <span className="cu-ep-required-msg">필수 입력 항목입니다.</span>}
                </div>
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
                            <MapPin className="cu-ep-section-icon" /> 상담소 정보
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
                    <input
                        type="tel"
                        placeholder="02-000-0000"
                        className="cu-ep-input"
                        value={basicCenterPhone}
                        onChange={(e) => {
                            let v = e.target.value.replace(/[^0-9]/g, '');
                            if (v.startsWith('02')) {
                                if (v.length > 2 && v.length <= 5) v = v.replace(/(02)(\d{0,3})/, '$1-$2');
                                else if (v.length <= 9) v = v.replace(/(02)(\d{3,4})(\d{0,4})/, '$1-$2-$3');
                                else v = v.replace(/(02)(\d{4})(\d{4}).*/, '$1-$2-$3');
                            } else {
                                if (v.length > 3 && v.length <= 7) v = v.replace(/(\d{3})(\d{0,4})/, '$1-$2');
                                else if (v.length > 7) v = v.replace(/(\d{3})(\d{3,4})(\d{0,4})/, '$1-$2-$3');
                            }
                            setBasicCenterPhone(v);
                        }}
                        maxLength={13}
                    />
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
                <div className="cu-ep-field">
                    <label className="cu-ep-label">상담 가격 (원)</label>
                    <input
                        type="text"
                        placeholder="상담 1회 가격을 입력하세요"
                        className="cu-ep-input"
                        value={basicPrice}
                        onChange={(e) => {
                            const raw = e.target.value.replace(/[^0-9]/g, '');
                            setBasicPrice(raw.replace(/\B(?=(\d{3})+(?!\d))/g, ','));
                        }}
                        inputMode="numeric"
                        pattern="[0-9,]*"
                    />
                    <div className="cu-ep-note">
                        ※ 대면 상담 기준 시간당 평균가를 입력해 주세요.
                    </div>
                </div>
            </div>
        </div>
    );

    // ── 탭 렌더: 전문 분야 ───────────────────────────────────────────────────
    const renderExpertise = () => (
        <div className="cu-ep-expertise cu-ep-animate">
            <section>
                <h3 className="cu-ep-section-title">
                    <CheckCircle2 className="cu-ep-section-icon" />
                    전문 상담분야 <span className="cu-ep-section-hint">(중복 선택 가능)</span>
                </h3>
                <div className="cu-ep-chips">
                    {EXPERTISE_LIST.map(
                        (item) => (
                            <button
                                key={item}
                                onClick={() =>
                                    setExpertType((p) =>
                                        p.includes(item) ? p.filter((t) => t !== item) : [...p, item]
                                    )
                                }
                                className={`cu-ep-chip${expertType.includes(item) ? ' cu-ep-chip-on' : ''}`}
                            >
                                {item}
                            </button>
                        )
                    )}
                </div>
            </section>
            <section>
                <h3 className="cu-ep-section-title">
                    <span className="cu-ep-schedule-bar" /> 주간 상담 일정
                </h3>
                <div className="cu-ep-schedule-list">
                    {DAYS.map((day) => {
                        const d = weeklySchedule[day];
                        return (
                            <div key={day} className={`cu-ep-schedule-row${d.active ? ' cu-ep-day-on' : ''}`}>
                                <div className="cu-ep-day-toggle">
                                    <button
                                        onClick={() => toggleDayActive(day)}
                                        className={`cu-ep-toggle-btn${d.active ? ' cu-ep-toggle-on' : ''}`}
                                    >
                                        <CheckCircle2 className="cu-ep-section-icon" />
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
                                                            {TIME_OPTIONS.map((t) => (
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
                                                            {TIME_OPTIONS.filter(
                                                                (t) => !slot.start || parseInt(t) > parseInt(slot.start)
                                                            ).map((t) => (
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
                                                            <X className="cu-ep-add-icon" />
                                                        </button>
                                                    )}
                                                </div>
                                            ))}
                                            <button
                                                onClick={() => addTimeSlot(day)}
                                                className="cu-ep-slot-add"
                                                title="시간 추가"
                                            >
                                                <Plus className="cu-ep-add-icon" />
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

    // ── 탭 렌더: 학력/경력 ───────────────────────────────────────────────────
    const renderHistory = () => (
        <div className="cu-ep-history cu-ep-animate">

            {/* ── 자격증 ── */}
            <section>
                <div className="cu-ep-section-header">
                    <h3 className="cu-ep-section-title">
                        <Award className="cu-ep-section-icon" /> 자격증
                    </h3>
                    <button onClick={addCertificate} className="cu-ep-add-btn">
                        <Plus className="cu-ep-add-icon" /> 추가
                    </button>
                </div>
                <div className="cu-ep-items">
                    {certificates.map((cert) => (
                        <div key={cert.id} className="cu-ep-cert-item">
                            <div className="cu-ep-cert-date">
                                <YearMonthPicker
                                    value={cert.yearMonth}
                                    onChange={(v) => updateCertificate(cert.id, 'yearMonth', v)}
                                />
                            </div>
                            <div className="cu-ep-item-field">
                                <label className="cu-ep-item-label">자격증명</label>
                                <input
                                    type="text"
                                    placeholder="자격증 이름을 입력하세요"
                                    className="cu-ep-item-input"
                                    value={cert.name}
                                    onChange={(e) => updateCertificate(cert.id, 'name', e.target.value)}
                                />
                            </div>
                            <div className="cu-ep-item-field">
                                <label className="cu-ep-item-label">발급 기관</label>
                                <input
                                    type="text"
                                    placeholder="기관명"
                                    className="cu-ep-item-input"
                                    value={cert.issuer}
                                    onChange={(e) => updateCertificate(cert.id, 'issuer', e.target.value)}
                                />
                            </div>
                            <div className="cu-ep-edu-rm-row">
                                <button onClick={() => removeCertificate(cert.id)} className="cu-ep-rm-btn">
                                    <Trash2 className="cu-ep-remove-icon" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── 학력 사항 ── */}
            <section>
                <div className="cu-ep-section-header">
                    <h3 className="cu-ep-section-title">
                        <BookOpen className="cu-ep-section-icon" /> 학력 사항
                    </h3>
                    <button onClick={addEducation} className="cu-ep-add-btn">
                        <Plus className="cu-ep-add-icon" /> 추가
                    </button>
                </div>
                <div className="cu-ep-edu-items">
                    {educations.map((edu) => (
                        <div key={edu.id} className="cu-ep-edu-item">
                            {/* 날짜 행 */}
                            <div className="cu-ep-edu-dates-row">
                                <div className="cu-ep-edu-date-col">
                                    <label className="cu-ep-item-label">입학일</label>
                                    <YearMonthPicker
                                        value={edu.startYearMonth}
                                        onChange={(v) => updateEducation(edu.id, 'startYearMonth', v)}
                                    />
                                </div>
                                <div className="cu-ep-edu-date-col">
                                    <label className="cu-ep-item-label">졸업일</label>
                                    <YearMonthPicker
                                        value={edu.endYearMonth}
                                        onChange={(v) => updateEducation(edu.id, 'endYearMonth', v)}
                                    />
                                </div>
                            </div>
                            {/* 학교 / 전공 행 */}
                            <div className="cu-ep-edu-fields-row">
                                <div className="cu-ep-item-field">
                                    <label className="cu-ep-item-label">학교명</label>
                                    <input
                                        type="text"
                                        placeholder="학교명을 입력하세요"
                                        className="cu-ep-item-input"
                                        value={edu.school}
                                        onChange={(e) => updateEducation(edu.id, 'school', e.target.value)}
                                    />
                                </div>
                                <div className="cu-ep-item-field">
                                    <label className="cu-ep-item-label">전공 및 학위</label>
                                    <input
                                        type="text"
                                        placeholder="전공 및 학위"
                                        className="cu-ep-item-input"
                                        value={edu.major}
                                        onChange={(e) => updateEducation(edu.id, 'major', e.target.value)}
                                    />
                                </div>
                            </div>
                            {/* 삭제 버튼 */}
                            <div className="cu-ep-edu-rm-row">
                                <button
                                    onClick={() => removeEducation(edu.id)}
                                    className="cu-ep-rm-btn"
                                >
                                    <Trash2 className="cu-ep-remove-icon" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── 경력 사항 ── */}
            <section>
                <div className="cu-ep-section-header">
                    <h3 className="cu-ep-section-title">
                        <User className="cu-ep-section-icon" /> 경력 사항
                    </h3>
                    <button onClick={addExperience} className="cu-ep-add-btn">
                        <Plus className="cu-ep-add-icon" /> 추가
                    </button>
                </div>
                <div className="cu-ep-items">
                    {experiences.map((exp) => (
                        <div key={exp.id} className="cu-ep-exp-item">
                            {/* 날짜 행 */}
                            <div className="cu-ep-exp-dates-row">
                                <div className="cu-ep-edu-date-col">
                                    <label className="cu-ep-item-label">시작일</label>
                                    <YearMonthPicker
                                        value={exp.startYearMonth}
                                        onChange={(v) => updateExperience(exp.id, 'startYearMonth', v)}
                                    />
                                </div>
                                <div className="cu-ep-edu-date-col">
                                    <label className="cu-ep-item-label">종료일</label>
                                    {exp.isCurrent ? (
                                        <input
                                            type="text"
                                            value="현재 진행중"
                                            readOnly
                                            className="cu-ep-item-input cu-ep-input-current"
                                        />
                                    ) : (
                                        <YearMonthPicker
                                            value={exp.endYearMonth}
                                            onChange={(v) => updateExperience(exp.id, 'endYearMonth', v)}
                                        />
                                    )}
                                </div>
                            </div>
                            {/* 내용 + 현재진행중 체크 행 */}
                            <div className="cu-ep-exp-content-row">
                                <div className="cu-ep-item-field cu-ep-exp-content-field">
                                    <label className="cu-ep-item-label">활동 내용</label>
                                    <input
                                        type="text"
                                        placeholder="소속 및 직책 등을 입력하세요"
                                        className="cu-ep-item-input"
                                        value={exp.content}
                                        onChange={(e) => updateExperience(exp.id, 'content', e.target.value)}
                                    />
                                </div>
                                <label className="cu-ep-current-check">
                                    <input
                                        type="checkbox"
                                        id={`current-${exp.id}`}
                                        checked={exp.isCurrent}
                                        onChange={(e) => updateExperience(exp.id, 'isCurrent', e.target.checked)}
                                        className="cu-ep-current-checkbox"
                                    />
                                    <span className="cu-ep-current-label">현재 진행중</span>
                                </label>
                            </div>
                            {/* 삭제 버튼 */}
                            <div className="cu-ep-edu-rm-row">
                                <button
                                    onClick={() => removeExperience(exp.id)}
                                    className="cu-ep-rm-btn"
                                >
                                    <Trash2 className="cu-ep-remove-icon" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );

    // ── 메인 렌더 ────────────────────────────────────────────────────────────
    return (
        <div className="cu-ep-page">
            {showConfirmModal && renderConfirmModal()}
            {toastMsg && <div className="cu-toast-popup cu-toast-popup--show">{toastMsg}</div>}
            {submitSuccess && (
                <div className="cu-toast-popup cu-toast-popup--show cu-toast-popup--success">
                    등록이 완료되었습니다. 마이페이지로 이동합니다.
                </div>
            )}

            <button className="cu-ep-float-btn" onClick={handleSaveDraft}>
                <Save className="cu-ep-save-icon" />
                <span className="cu-ep-float-label">임시저장</span>
            </button>

            <Header
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                isLoggedIn={!!localStorage.getItem('access_token')}
                userName={basicName}
                setUserName={setBasicName}
                setIsLoggedIn={() => {}}
            />

            <main className="cu-ep-main">
                <div className="cu-ep-page-title">
                    <h2>전문가 프로필 등록</h2>
                    <p>상담사님의 전문성을 보여줄 수 있도록 상세하게 작성 부탁드립니다.</p>
                </div>

                <div className="cu-ep-tabs">
                    {[
                        { id: 'basic', label: '기본 정보' },
                        { id: 'expertise', label: '전문 분야' },
                        { id: 'history', label: '학력/경력' },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => handleTabChange(tab.id)}
                            className={`cu-ep-tab-btn${activeTab === tab.id ? ' cu-ep-tab-active' : ''}`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                <div className="cu-ep-content">
                    {activeTab === 'basic' && renderBasicInfo()}
                    {activeTab === 'expertise' && renderExpertise()}
                    {activeTab === 'history' && renderHistory()}

                    <div className="cu-ep-nav">
                        <div className="cu-ep-nav-hint cu-ep-nav-hint--primary">
                            <CheckCircle2 className="cu-ep-nav-hint-icon" />
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
                            <button onClick={handleNext} className="cu-ep-btn-next">
                                {activeTab === 'history' ? '등록 신청하기' : '다음 단계'}
                            </button>
                        </div>
                    </div>
                </div>
            </main>

            <MobileTap />
            <Footer />
        </div>
    );
};

export default App;
