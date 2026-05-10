import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Users,
    ClipboardCheck,
    ChevronRight,
    ArrowLeft,
    CheckCircle,
    XCircle,
    Clock,
    MapPin,
    GraduationCap,
    Briefcase,
    Award,
    Calendar,
    Mail,
    Building2,
    ShieldCheck,
    LogOut,
    Search,
    Filter,
    BarChart3,
    UserCheck,
    AlertCircle,
    FileText,
    CircleDollarSign,
} from 'lucide-react';
import '../static/AdminCounselor.css';

const AdminCounselor = () => {
    const navigate = useNavigate();
    const [activeMenu, setActiveMenu] = useState('counselor');
    const [viewMode, setViewMode] = useState('list');
    const [selectedCounselor, setSelectedCounselor] = useState(null);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [rejectReason, setRejectReason] = useState('경력 증빙 서류가 불충분합니다. 보완 후 재등록 부탁드립니다.');
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const defaultRejectReason = '경력 증빙 서류가 불충분합니다. 보완 후 재등록 부탁드립니다.';

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user || user.role !== 'admin') {
            alert('관리자 권한이 없습니다.');
            navigate('/');
        }
    }, [navigate]);

    // 승인 대기 상담사 목록 (API)
    const [counselors, setCounselors] = useState([]);

    useEffect(() => {
        const fetchPendingCounselors = async () => {
            try {
                const token = localStorage.getItem('access_token');
                const res = await fetch('/api/admin/counselors/pending', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (!res.ok) throw new Error('목록 조회 실패');
                const data = await res.json();
                // 평평하게 매핑
                setCounselors(
                    data.map((item) => ({
                        id: item.user?.id,
                        name: item.user?.full_name,
                        email: item.user?.email,
                        center: item.profile?.center_name,
                        address: item.profile?.center_address,
                        specialties: item.specialties?.map((s) => s.specialty_name) || [],
                        appliedDate: item.profile?.created_at?.slice(0, 10),
                        status:
                            item.profile?.status === '심사중'
                                ? '대기'
                                : item.profile?.status === '수락'
                                  ? '승인됨'
                                  : '반려',
                        introduction: item.profile?.intro_line,
                        fee: item.profile?.consultation_price,
                        profile_img_url: item.profile?.profile_img_url,
                        educations: item.educations || [],
                        experiences: item.experiences || [],
                        certificates: item.certificates || [],
                        schedule: (() => {
                            // 요일별로 여러 시간대 지원
                            const result = { 월: [], 화: [], 수: [], 목: [], 금: [] };
                            if (item.schedules && item.schedules.length > 0) {
                                item.schedules.forEach((s) => {
                                    const day = s.day_of_week?.replace('요일', '');
                                    if (result[day] !== undefined) {
                                        result[day].push(`${s.start_time?.slice(0, 5)}~${s.end_time?.slice(0, 5)}`);
                                    }
                                });
                            }
                            // 휴무/여러 시간대 문자열로 변환
                            Object.keys(result).forEach((k) => {
                                if (result[k].length === 0) result[k] = '휴무';
                                else result[k] = result[k].join(', ');
                            });
                            return result;
                        })(),
                    }))
                );
            } catch (err) {
                alert('상담사 목록을 불러오지 못했습니다.');
                setCounselors([]);
            }
        };
        fetchPendingCounselors();
    }, []);

    // 실제 DB에서 회원 데이터 조회
    const [memberList, setMemberList] = useState([]);
    useEffect(() => {
        const fetchMembers = async () => {
            try {
                const token = localStorage.getItem('access_token');
                const res = await fetch('/api/admin/users', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (!res.ok) throw new Error('회원 목록 조회 실패');
                const data = await res.json();
                // 필요한 필드만 매핑 (role, joinDate 등은 백엔드 User 모델에 맞게 조정)
                setMemberList(
                    data.map((user) => ({
                        id: user.id,
                        name: user.full_name || user.username || user.email,
                        email: user.email,
                        // DB의 role 값 그대로 사용 (예: 'admin', 'client', 'counselor')
                        role:
                            user.role === 'admin'
                                ? '관리자'
                                : user.role === 'counselor'
                                  ? '상담사'
                                  : user.role === 'client'
                                    ? '내담자'
                                    : user.role,
                        joinDate: user.created_at ? user.created_at.slice(0, 10) : '',
                        status: user.is_active ? '활성' : '비활성',
                        sessions: user.sessions_count || 0,
                    }))
                );
            } catch (err) {
                alert('회원 목록을 불러오지 못했습니다.');
                setMemberList([]);
            }
        };
        fetchMembers();
    }, []);

    // ✅ 대기 중인 수만 실시간 계산
    const pendingCount = counselors.filter((c) => c.status === '대기').length;

    const stats = [
        { label: '승인 대기', value: pendingCount, icon: <Clock size={20} />, color: '#F59E0B' },
        { label: '전체 회원', value: memberList.length, icon: <Users size={20} />, color: '#8BA888' },
        {
            label: '활성 내담자',
            value: memberList.filter((m) => m.status === '활성').length,
            icon: <UserCheck size={20} />,
            color: '#60A5FA',
        },
        { label: '이번 달 신규', value: 3, icon: <BarChart3 size={20} />, color: '#A78BFA' },
    ];

    // ✅ 승인 처리 — API 호출 후 state 업데이트
    const handleApprove = async (counselor) => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem('access_token');
            const res = await fetch(`/api/admin/counselors/${counselor.id}/approve`, {
                method: 'PATCH',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });
            if (!res.ok) throw new Error('승인 처리 실패');

            setCounselors((prev) => prev.map((c) => (c.id === counselor.id ? { ...c, status: '승인됨' } : c)));
            // ✅ 상세 페이지에서 보고 있는 상담사도 같이 업데이트
            setSelectedCounselor((prev) => ({ ...prev, status: '승인됨' }));
            alert(`${counselor.name} 상담사님께 승인 완료 알림이 발송되었습니다.`);
        } catch (err) {
            alert('승인 처리 중 오류가 발생했습니다. 다시 시도해 주세요.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    // ✅ 반려 처리 — API 호출 후 state 업데이트
    const handleReject = async () => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem('access_token');
            const res = await fetch(`/api/admin/counselors/${selectedCounselor.id}/reject`, {
                method: 'PATCH',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ reason: rejectReason }),
            });
            if (!res.ok) throw new Error('반려 처리 실패');

            setCounselors((prev) => prev.map((c) => (c.id === selectedCounselor.id ? { ...c, status: '반려' } : c)));
            setSelectedCounselor((prev) => ({ ...prev, status: '반려' }));
            alert('반려 메일이 발송되었습니다.');
            setShowRejectModal(false);
        } catch (err) {
            alert('반려 처리 중 오류가 발생했습니다. 다시 시도해 주세요.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const filteredMembers = memberList.filter((m) => m.name.includes(searchQuery) || m.email.includes(searchQuery));

    const filteredCounselors = counselors.filter(
        (c) =>
            (typeof c.name === 'string' && c.name.includes(searchQuery)) ||
            (typeof c.email === 'string' && c.email.includes(searchQuery))
    );

    // ✅ 상태 뱃지 컴포넌트
    const StatusBadge = ({ status }) => {
        const map = {
            대기: { cls: 'pending', icon: <Clock size={12} />, label: '대기중' },
            승인됨: { cls: 'active', icon: <CheckCircle size={12} />, label: '승인됨' },
            반려: { cls: 'inactive', icon: <XCircle size={12} />, label: '반려' },
        };
        const s = map[status] || map['대기'];
        return (
            <span className={`ac-status-badge ${s.cls}`}>
                {s.icon} {s.label}
            </span>
        );
    };

    return (
        <div className="ac-layout">
            {/* 사이드바 */}
            <aside className="ac-sidebar">
                <div className="ac-sidebar-top">
                    <div className="ac-brand">
                        <ShieldCheck size={22} className="ac-brand-icon" />
                        <div>
                            <div className="ac-brand-name">MindWell</div>
                            <div className="ac-brand-sub">관리자 콘솔</div>
                        </div>
                    </div>

                    <nav className="ac-nav">
                        <div className="ac-nav-section-label">메뉴</div>
                        <button
                            className={`ac-nav-item ${activeMenu === 'counselor' ? 'active' : ''}`}
                            onClick={() => {
                                setActiveMenu('counselor');
                                setViewMode('list');
                                setSearchQuery('');
                            }}
                        >
                            <ClipboardCheck size={18} />
                            <span>상담사 승인 관리</span>
                            {pendingCount > 0 && <span className="ac-badge">{pendingCount}</span>}
                        </button>
                        <button
                            className={`ac-nav-item ${activeMenu === 'member' ? 'active' : ''}`}
                            onClick={() => {
                                setActiveMenu('member');
                                setSearchQuery('');
                            }}
                        >
                            <Users size={18} />
                            <span>회원 데이터 조회</span>
                        </button>
                    </nav>
                </div>

                <div className="ac-sidebar-bottom">
                    <button className="ac-logout-btn" onClick={() => navigate('/')}>
                        <LogOut size={16} />
                        <span>홈으로 돌아가기</span>
                    </button>
                </div>
            </aside>

            {/* 메인 콘텐츠 */}
            <main className="ac-main">
                {viewMode === 'list' && (
                    <div className="ac-stats-row">
                        {stats.map((s, i) => (
                            <div className="ac-stat-card" key={i}>
                                <div className="ac-stat-icon" style={{ background: s.color + '20', color: s.color }}>
                                    {s.icon}
                                </div>
                                <div>
                                    <div className="ac-stat-value">{s.value}</div>
                                    <div className="ac-stat-label">{s.label}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* ── 상담사 목록 ── */}
                {activeMenu === 'counselor' && viewMode === 'list' && (
                    <div className="ac-card">
                        <div className="ac-card-header">
                            <div>
                                <h2 className="ac-card-title">전문가 승인 대기 목록</h2>
                                <p className="ac-card-desc">
                                    등록 신청한 상담사의 프로필을 검토하고 승인 여부를 결정합니다.
                                </p>
                            </div>
                            <div className="ac-search-box">
                                <Search size={16} className="ac-search-icon" />
                                <input
                                    className="ac-search-input"
                                    placeholder="이름 또는 이메일 검색"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="ac-counselor-list">
                            {filteredCounselors.length === 0 ? (
                                <div className="ac-empty">
                                    <AlertCircle size={40} />
                                    <p>대기 중인 신청이 없습니다.</p>
                                </div>
                            ) : (
                                filteredCounselors.map((c) => (
                                    <div className="ac-counselor-row" key={c.id}>
                                        <div className="ac-counselor-avatar">
                                            {c.profile_img_url ? (
                                                <img
                                                    src={c.profile_img_url}
                                                    alt="프로필"
                                                    style={{
                                                        width: '100%',
                                                        height: '100%',
                                                        objectFit: 'cover',
                                                        borderRadius: '14px',
                                                    }}
                                                />
                                            ) : (
                                                c.name.charAt(0)
                                            )}
                                        </div>
                                        <div className="ac-counselor-info">
                                            <div className="ac-counselor-name">{c.name}</div>
                                            <div className="ac-counselor-meta">
                                                <span>
                                                    <Mail size={13} />
                                                    {c.email}
                                                </span>
                                                <span>
                                                    <Building2 size={13} />
                                                    {c.center}
                                                </span>
                                                <span>
                                                    <MapPin size={13} />
                                                    {c.address}
                                                </span>
                                            </div>
                                            <div className="ac-counselor-tags">
                                                {c.specialties.map((s) => (
                                                    <span key={s} className="ac-tag">
                                                        {s}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="ac-counselor-right">
                                            <StatusBadge status={c.status} />
                                            <div className="ac-counselor-date">신청일 {c.appliedDate}</div>
                                            {/* ✅ 대기 중이면 '심사하기', 처리됐으면 '상세보기' */}
                                            <button
                                                className={
                                                    c.status === '대기' ? 'ac-detail-btn' : 'ac-detail-btn-ghost'
                                                }
                                                onClick={() => {
                                                    setSelectedCounselor(c);
                                                    setViewMode('detail');
                                                }}
                                            >
                                                {c.status === '대기' ? '심사하기' : '상세보기'}{' '}
                                                <ChevronRight size={15} />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}

                {/* ── 상담사 상세 심사 ── */}
                {activeMenu === 'counselor' && viewMode === 'detail' && selectedCounselor && (
                    <div className="ac-card ac-detail-view">
                        <button className="ac-back-btn" onClick={() => setViewMode('list')}>
                            <ArrowLeft size={16} /> 목록으로 돌아가기
                        </button>

                        <div className="ac-detail-header">
                            <div className="ac-detail-avatar">
                                {selectedCounselor.profile_img_url ? (
                                    <img
                                        src={selectedCounselor.profile_img_url}
                                        alt="프로필"
                                        style={{
                                            width: '100%',
                                            height: '100%',
                                            objectFit: 'cover',
                                            borderRadius: '14px',
                                        }}
                                    />
                                ) : (
                                    selectedCounselor.name.charAt(0)
                                )}
                            </div>
                            <div>
                                <h2 className="ac-detail-title">{selectedCounselor.name} 상담사</h2>
                                <p className="ac-detail-subtitle">프로필 심사 · {selectedCounselor.email}</p>
                            </div>
                            <span style={{ marginLeft: 'auto' }}>
                                <StatusBadge status={selectedCounselor.status} />
                            </span>
                        </div>

                        {/* ✅ 자기소개 섹션 */}
                        <div className="ac-info-section ac-intro-section">
                            <div className="ac-section-title">
                                <FileText size={16} /> 상담사 자기소개
                            </div>
                            <p className="ac-intro-text">
                                {selectedCounselor.introduction || '자기소개가 입력되지 않았습니다.'}
                            </p>
                        </div>

                        <div className="ac-detail-grid" style={{ marginTop: '20px' }}>
                            <div className="ac-info-section">
                                <div className="ac-section-title">
                                    <Building2 size={16} /> 기본 정보 및 상담소
                                </div>
                                <div className="ac-info-rows">
                                    <div className="ac-info-row">
                                        <span className="ac-info-key">상담소명</span>
                                        <span>{selectedCounselor.center}</span>
                                    </div>
                                    <div className="ac-info-row">
                                        <span className="ac-info-key">주소</span>
                                        <span>{selectedCounselor.address}</span>
                                    </div>
                                    <div className="ac-info-row">
                                        <span className="ac-info-key">전문 분야</span>
                                        <div className="ac-tag-group">
                                            {selectedCounselor.specialties.map((s) => (
                                                <span key={s} className="ac-tag">
                                                    {s}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="ac-info-row">
                                        <span className="ac-info-key">
                                            <CircleDollarSign size={13} /> 상담 금액
                                        </span>
                                        <span className="ac-fee-text">
                                            {selectedCounselor.fee
                                                ? `${selectedCounselor.fee.toLocaleString()}원 / 50분`
                                                : '미입력'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="ac-info-section">
                                <div className="ac-section-title">
                                    <GraduationCap size={16} /> 학력 및 경력사항
                                </div>
                                <div className="ac-info-rows">
                                    {/* 학력 */}
                                    <div className="ac-info-row">
                                        <span className="ac-info-key">
                                            <GraduationCap size={13} /> 학력
                                        </span>
                                        <span style={{ width: '100%' }}>
                                            {Array.isArray(selectedCounselor.educations) &&
                                            selectedCounselor.educations.length > 0 ? (
                                                <ul className="ac-list">
                                                    {selectedCounselor.educations
                                                        .slice()
                                                        .sort((a, b) => (a.start_date > b.start_date ? 1 : -1))
                                                        .map((edu, idx) => (
                                                            <li key={idx} className="ac-list-item">
                                                                <span className="ac-list-date">
                                                                    {edu.start_date} ~ {edu.end_date}
                                                                </span>
                                                                <span className="ac-list-main">
                                                                    {edu.school_name} ({edu.major})
                                                                </span>
                                                            </li>
                                                        ))}
                                                </ul>
                                            ) : (
                                                <span>학력 정보 없음</span>
                                            )}
                                        </span>
                                    </div>
                                    {/* 경력 */}
                                    <div className="ac-info-row">
                                        <span className="ac-info-key">
                                            <Briefcase size={13} /> 경력
                                        </span>
                                        <span style={{ width: '100%' }}>
                                            {Array.isArray(selectedCounselor.experiences) &&
                                            selectedCounselor.experiences.length > 0 ? (
                                                <ul className="ac-list">
                                                    {selectedCounselor.experiences
                                                        .slice()
                                                        .sort((a, b) => (a.start_date > b.start_date ? 1 : -1))
                                                        .map((exp, idx) => (
                                                            <li key={idx} className="ac-list-item">
                                                                <span className="ac-list-date">
                                                                    {exp.start_date} ~ {exp.end_date || '현재'}
                                                                </span>
                                                                <span className="ac-list-main">{exp.content}</span>
                                                            </li>
                                                        ))}
                                                </ul>
                                            ) : (
                                                <span>경력 정보 없음</span>
                                            )}
                                        </span>
                                    </div>
                                    {/* 자격증 */}
                                    <div className="ac-info-row">
                                        <span className="ac-info-key">
                                            <Award size={13} /> 자격증
                                        </span>
                                        <span style={{ width: '100%' }}>
                                            {Array.isArray(selectedCounselor.certificates) &&
                                            selectedCounselor.certificates.length > 0 ? (
                                                <ul className="ac-list">
                                                    {selectedCounselor.certificates
                                                        .slice()
                                                        .sort((a, b) =>
                                                            a.acquisition_date > b.acquisition_date ? 1 : -1
                                                        )
                                                        .map((cert, idx) => (
                                                            <li key={idx} className="ac-list-item">
                                                                <span className="ac-list-date">
                                                                    {cert.acquisition_date}
                                                                </span>
                                                                <span className="ac-list-main">
                                                                    {cert.certificate_name} ({cert.issuer})
                                                                </span>
                                                            </li>
                                                        ))}
                                                </ul>
                                            ) : (
                                                <span>자격증 정보 없음</span>
                                            )}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="ac-info-section" style={{ marginTop: '20px' }}>
                            <div className="ac-section-title">
                                <Calendar size={16} /> 주간 상담 가능 일정
                            </div>
                            <div className="ac-schedule-grid">
                                {['월', '화', '수', '목', '금'].map((day) => {
                                    const time = selectedCounselor.schedule[day];
                                    const isOff = !time || time === '휴무';
                                    return (
                                        <div className={`ac-schedule-cell ${isOff ? 'off' : 'on'}`} key={day}>
                                            <div className="ac-schedule-day">{day}</div>
                                            <div className="ac-schedule-time">
                                                {isOff
                                                    ? '휴무'
                                                    : time.split(',').map((t, idx) => <div key={idx}>{t.trim()}</div>)}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* ✅ 대기 중일 때만 버튼 표시, 처리 완료 시 안내 메시지 */}
                        {selectedCounselor.status === '대기' ? (
                            <div className="ac-action-row">
                                <button
                                    className="ac-btn-reject"
                                    disabled={isLoading}
                                    onClick={() => {
                                        setRejectReason(defaultRejectReason);
                                        setShowRejectModal(true);
                                    }}
                                >
                                    <XCircle size={17} /> 승인 반려
                                </button>
                                <button
                                    className="ac-btn-approve"
                                    disabled={isLoading}
                                    onClick={() => handleApprove(selectedCounselor)}
                                >
                                    <CheckCircle size={17} /> {isLoading ? '처리 중...' : '최종 승인 완료'}
                                </button>
                            </div>
                        ) : (
                            <div className="ac-action-done">
                                {selectedCounselor.status === '승인됨'
                                    ? '✅ 이미 승인 처리된 상담사입니다.'
                                    : '❌ 반려 처리된 상담사입니다.'}
                            </div>
                        )}
                    </div>
                )}

                {/* ── 회원 데이터 조회 ── */}
                {activeMenu === 'member' && (
                    <div className="ac-card">
                        <div className="ac-card-header">
                            <div>
                                <h2 className="ac-card-title">회원 데이터 조회</h2>
                                <p className="ac-card-desc">전체 가입 회원의 현황을 확인합니다.</p>
                            </div>
                            <div className="ac-search-box">
                                <Search size={16} className="ac-search-icon" />
                                <input
                                    className="ac-search-input"
                                    placeholder="이름 또는 이메일 검색"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="ac-table-wrap">
                            <table className="ac-table">
                                <thead>
                                    <tr>
                                        <th>이름</th>
                                        <th>이메일</th>
                                        <th>구분</th>
                                        <th>가입일</th>
                                        <th>상담 횟수</th>
                                        <th>상태</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredMembers.map((m) => (
                                        <tr key={m.id}>
                                            <td>
                                                <div className="ac-member-name-cell">
                                                    <div className="ac-member-avatar">{m.name.charAt(0)}</div>
                                                    {m.name}
                                                </div>
                                            </td>
                                            <td className="ac-muted">{m.email}</td>
                                            <td>
                                                <span
                                                    className={`ac-role-badge ${m.role === '상담사' ? 'counselor' : 'client'}`}
                                                >
                                                    {m.role}
                                                </span>
                                            </td>
                                            <td className="ac-muted">{m.joinDate}</td>
                                            <td className="ac-center">{m.sessions}회</td>
                                            <td>
                                                <span
                                                    className={`ac-status-badge ${
                                                        m.status === '활성'
                                                            ? 'active'
                                                            : m.status === '비활성'
                                                              ? 'inactive'
                                                              : 'pending'
                                                    }`}
                                                >
                                                    {m.status === '활성' && <CheckCircle size={12} />}
                                                    {m.status === '비활성' && <XCircle size={12} />}
                                                    {m.status === '승인대기' && <Clock size={12} />}
                                                    {m.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </main>

            {/* ── 반려 모달 ── */}
            {showRejectModal && (
                <div className="ac-modal-overlay" onClick={() => setShowRejectModal(false)}>
                    <div className="ac-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="ac-modal-header">
                            <XCircle size={22} className="ac-modal-icon" />
                            <h3>심사 반려 사유 입력</h3>
                        </div>
                        <p className="ac-modal-desc">반려 시 상담사님께 이메일로 발송될 내용을 작성해 주세요.</p>
                        <textarea
                            className="ac-modal-textarea"
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            rows={5}
                        />
                        <div className="ac-modal-actions">
                            <button className="ac-modal-cancel" onClick={() => setShowRejectModal(false)}>
                                취소
                            </button>
                            <button className="ac-modal-send" disabled={isLoading} onClick={handleReject}>
                                <Mail size={15} /> {isLoading ? '처리 중...' : '반려 메일 전송'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminCounselor;
