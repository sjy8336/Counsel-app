import React, { useState } from 'react';
import { 
  Camera, 
  Plus, 
  Trash2, 
  ChevronRight, 
  ChevronDown,
  Save, 
  User, 
  Briefcase, 
  GraduationCap, 
  CheckCircle2,
  MapPin,
  Building2,
  Mail,
  Phone,
  Calendar,
  X,
  Menu
} from 'lucide-react';

const App = () => {
  // ---------------------------------------------------------
  // 1. 상태 관리 (State)
  // ---------------------------------------------------------
  const [activeTab, setActiveTab] = useState('basic');
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    officePhone: '',
    officeName: '',
    officeAddress: '',
    introduction: '',
    specialties: [],
    customSpecialty: '',
    weeklySchedule: {
      '월': { active: true, slots: [{ id: 1, start: '10:00', end: '11:00' }] },
      '화': { active: true, slots: [{ id: 1, start: '10:00', end: '11:00' }] },
      '수': { active: true, slots: [{ id: 1, start: '10:00', end: '11:00' }] },
      '목': { active: true, slots: [{ id: 1, start: '10:00', end: '11:00' }] },
      '금': { active: true, slots: [{ id: 1, start: '10:00', end: '11:00' }] },
      '토': { active: false, slots: [{ id: 1, start: '10:00', end: '11:00' }] },
      '일': { active: false, slots: [{ id: 1, start: '10:00', end: '11:00' }] },
    },
    experience: [{ id: 1, period: '', content: '' }],
    education: [{ id: 1, startYear: '2024', startMonth: '01', endYear: '2024', endMonth: '12', school: '', degree: '' }],
    certificates: [{ id: 1, name: '', organization: '', year: '2024', month: '01' }]
  });

  // ---------------------------------------------------------
  // 2. 상수 및 데이터 (Constants)
  // ---------------------------------------------------------
  const colors = {
    main: '#8BA888',
    background: '#FDFBF7',
    subBackground: '#FAF7F2',
    accent1: '#FDA4AF',
    accent2: '#F59E0B',
    textMain: '#1E293B'
  };

  const specialtyOptions = [
    '개인 심리 상담', '취업 컨설팅', '진로 설계', '직무 스트레스', 
    '면접 공포증', '자존감 회복', '대인관계', '번아웃 증후군', '정서 조절'
  ];

  const hours = Array.from({ length: 11 }, (_, i) => `${i + 10}:00`);
  const years = Array.from({ length: 50 }, (_, i) => String(2024 - i));
  const months = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));

  // ---------------------------------------------------------
  // 3. 핸들러 함수 (Handlers)
  // ---------------------------------------------------------

  const formatPhoneNumber = (value) => {
    const clean = value.replace(/[^0-9]/g, '');
    let formatted = clean;
    if (clean.length > 3 && clean.length <= 7) {
      formatted = `${clean.slice(0, 3)}-${clean.slice(3)}`;
    } else if (clean.length > 7) {
      formatted = `${clean.slice(0, 3)}-${clean.slice(3, 7)}-${clean.slice(7, 11)}`;
    }
    return formatted;
  };

  const handlePhoneChange = (e, field) => {
    const formatted = formatPhoneNumber(e.target.value);
    setProfile({ ...profile, [field]: formatted });
  };

  const toggleSpecialty = (item) => {
    setProfile(prev => ({
      ...prev,
      specialties: prev.specialties.includes(item)
        ? prev.specialties.filter(s => s !== item)
        : [...prev.specialties, item]
    }));
  };

  const addCustomSpecialty = () => {
    if (profile.customSpecialty && !profile.specialties.includes(profile.customSpecialty)) {
      setProfile(prev => ({
        ...prev,
        specialties: [...prev.specialties, prev.customSpecialty],
        customSpecialty: ''
      }));
    }
  };

  const toggleDay = (day) => {
    setProfile(prev => ({
      ...prev,
      weeklySchedule: {
        ...prev.weeklySchedule,
        [day]: { ...prev.weeklySchedule[day], active: !prev.weeklySchedule[day].active }
      }
    }));
  };

  const addTimeSlot = (day) => {
    setProfile(prev => ({
      ...prev,
      weeklySchedule: {
        ...prev.weeklySchedule,
        [day]: {
          ...prev.weeklySchedule[day],
          slots: [...prev.weeklySchedule[day].slots, { id: Date.now(), start: '10:00', end: '11:00' }]
        }
      }
    }));
  };

  const removeTimeSlot = (day, id) => {
    if (profile.weeklySchedule[day].slots.length <= 1) return;
    setProfile(prev => ({
      ...prev,
      weeklySchedule: {
        ...prev.weeklySchedule,
        [day]: {
          ...prev.weeklySchedule[day],
          slots: profile.weeklySchedule[day].slots.filter(slot => slot.id !== id)
        }
      }
    }));
  };

  const handleTimeChange = (day, id, field, value) => {
    setProfile(prev => ({
      ...prev,
      weeklySchedule: {
        ...prev.weeklySchedule,
        [day]: {
          ...prev.weeklySchedule[day],
          slots: prev.weeklySchedule[day].slots.map(slot => 
            slot.id === id ? { ...slot, [field]: value } : slot
          )
        }
      }
    }));
  };

  const handleEducationChange = (id, field, value) => {
    setProfile(prev => ({
      ...prev,
      education: prev.education.map(edu => edu.id === id ? { ...edu, [field]: value } : edu)
    }));
  };

  const handleCertificateChange = (id, field, value) => {
    setProfile(prev => ({
      ...prev,
      certificates: prev.certificates.map(cert => cert.id === id ? { ...cert, [field]: value } : cert)
    }));
  };

  const handleExperiencePeriodChange = (id, value) => {
    const clean = value.replace(/[^0-9]/g, '');
    let result = '';
    if (clean.length <= 2) result = clean;
    else if (clean.length <= 4) result = `${clean.slice(0, 2)}.${clean.slice(2)}`;
    else if (clean.length <= 6) result = `${clean.slice(0, 2)}.${clean.slice(2, 4)} ~ ${clean.slice(4)}`;
    else result = `${clean.slice(0, 2)}.${clean.slice(2, 4)} ~ ${clean.slice(4, 6)}.${clean.slice(6, 8)}`;

    setProfile(prev => ({
      ...prev,
      experience: prev.experience.map(exp => 
        exp.id === id ? { ...exp, period: result } : exp
      )
    }));
  };

  const addExperience = () => {
    setProfile(prev => ({
      ...prev,
      experience: [...prev.experience, { id: Date.now(), period: '', content: '' }]
    }));
  };

  const removeExperience = (id) => {
    if (profile.experience.length > 1) {
      setProfile(prev => ({
        ...prev,
        experience: prev.experience.filter(exp => exp.id !== id)
      }));
    }
  };

  const addEducation = () => {
    setProfile(prev => ({
      ...prev,
      education: [...prev.education, { id: Date.now(), startYear: '2024', startMonth: '01', endYear: '2024', endMonth: '01', school: '', degree: '' }]
    }));
  };

  const removeEducation = (id) => {
    if (profile.education.length > 1) {
      setProfile(prev => ({
        ...prev,
        education: prev.education.filter(edu => edu.id !== id)
      }));
    }
  };

  const addCertificate = () => {
    setProfile(prev => ({
      ...prev,
      certificates: [...prev.certificates, { id: Date.now(), name: '', organization: '', year: '2024', month: '01' }]
    }));
  };

  const removeCertificate = (id) => {
    if (profile.certificates.length > 1) {
      setProfile(prev => ({
        ...prev,
        certificates: prev.certificates.filter(cert => cert.id !== id)
      }));
    }
  };

  // ---------------------------------------------------------
  // 4. 컴포넌트 유틸리티 (UI Components)
  // ---------------------------------------------------------
  
  const DateSelectGroup = ({ yearValue, monthValue, onYearChange, onMonthChange, isSmall = false }) => (
    <div className={`relative ${isSmall ? 'h-[40px]' : 'h-[48px]'} flex items-center border border-[#8BA888] rounded-[12px] bg-white px-2 sm:px-3 group focus-within:ring-2 focus-within:ring-[#8BA888]/20 w-full`}>
      <Calendar size={isSmall ? 14 : 18} className="text-[#8BA888] shrink-0 hidden xs:block" />
      <div className="flex-1 flex items-center justify-between text-gray-800 w-full ml-1">
        
        {/* 년도 영역 */}
        <div className="relative flex-1 flex items-center min-w-[65px] sm:min-w-[70px]">
          <select 
            value={yearValue} 
            onChange={onYearChange} 
            className="w-full appearance-none bg-transparent focus:outline-none text-left cursor-pointer pr-7 z-10 font-semibold text-[12px] sm:text-[13px] relative"
          >
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <span className="absolute right-4 text-[10px] sm:text-[11px] font-medium text-gray-400 pointer-events-none">년</span>
          <ChevronDown size={14} className="absolute right-0 text-gray-400 pointer-events-none" />
        </div>
        
        <span className="mx-0.5 sm:mx-1 text-gray-200 shrink-0">|</span>
        
        {/* 월 영역 */}
        <div className="relative flex-1 flex items-center min-w-[50px] sm:min-w-[55px]">
          <select 
            value={monthValue} 
            onChange={onMonthChange} 
            className="w-full appearance-none bg-transparent focus:outline-none text-left cursor-pointer pr-7 z-10 font-semibold text-[12px] sm:text-[13px] relative"
          >
            {months.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
          <span className="absolute right-4 text-[10px] sm:text-[11px] font-medium text-gray-400 pointer-events-none">월</span>
          <ChevronDown size={14} className="absolute right-0 text-gray-400 pointer-events-none" />
        </div>
      </div>
    </div>
  );

  // ---------------------------------------------------------
  // 5. 렌더링 (View)
  // ---------------------------------------------------------
  return (
    <div className="min-h-screen font-sans" style={{ backgroundColor: colors.background, color: colors.textMain }}>
      {/* GNB */}
      <header className="bg-white border-b border-gray-100 px-4 sm:px-8 py-4 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-6 lg:gap-12">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight" style={{ color: colors.main }}>MINDWELL</h1>
          <nav className="hidden lg:flex gap-8 text-sm font-medium text-gray-500">
            <a href="#" className="hover:text-gray-900 transition-colors text-slate-800">전문가 찾기</a>
            <a href="#" className="hover:text-gray-900 transition-colors">예약 관리</a>
            <a href="#" className="hover:text-gray-900 transition-colors">AI 일기</a>
            <a href="#" className="hover:text-gray-900 transition-colors">힐링 라운지</a>
          </nav>
        </div>
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gray-200 overflow-hidden ring-2 ring-white">
               <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=counselor" alt="Profile" />
            </div>
            <span className="text-xs sm:text-sm font-semibold hidden sm:inline">이은지 코치님</span>
          </div>
          <button className="lg:hidden p-1 text-gray-500">
            <Menu size={20} />
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto py-8 sm:py-12 px-4 sm:px-6">
        <header className="mb-8 sm:mb-10 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-2">전문가 프로필 등록</h2>
          <p className="text-sm sm:text-base text-gray-500">상담사님의 전문성을 마음웰 회원들에게 소개해 주세요.</p>
        </header>

        {/* 네비게이션 (반응형 최적화) */}
        <div className="flex justify-between mb-8 sm:mb-12 relative max-w-2xl mx-auto px-2">
          <div className="absolute top-[28px] sm:top-1/2 left-0 w-full h-px bg-gray-200 -z-10 transform -translate-y-1/2"></div>
          {[
            { id: 'basic', label: '기본 정보', icon: <User size={18} className="sm:w-5 sm:h-5" /> },
            { id: 'professional', label: '전문 분야', icon: <Briefcase size={18} className="sm:w-5 sm:h-5" /> },
            { id: 'history', label: '경력 및 학력', icon: <GraduationCap size={18} className="sm:w-5 sm:h-5" /> }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex flex-col items-center gap-2 sm:gap-3 group transition-all"
            >
              <div 
                className={`w-10 h-10 sm:w-14 sm:h-14 rounded-full flex items-center justify-center transition-all border-2 ${
                  activeTab === tab.id ? 'shadow-lg scale-110' : 'bg-white border-gray-100 text-gray-400'
                }`}
                style={{ 
                  backgroundColor: activeTab === tab.id ? colors.main : 'white',
                  borderColor: activeTab === tab.id ? colors.main : '#F3F4F6',
                  color: activeTab === tab.id ? 'white' : ''
                }}
              >
                {tab.icon}
              </div>
              <span className={`text-[10px] sm:text-sm font-bold ${activeTab === tab.id ? 'text-gray-800' : 'text-gray-400'}`}>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* 컨텐츠 카드 (모바일 패딩 축소) */}
        <section className="bg-white rounded-[24px] sm:rounded-[40px] shadow-sm border border-gray-100 p-6 sm:p-12 mb-8">
          
          {/* 1. 기본 정보 */}
          {activeTab === 'basic' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex flex-col md:flex-row gap-6 md:gap-10 items-center md:items-start text-center md:text-left">
                <div className="relative shrink-0">
                  <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-[30px] sm:rounded-[40px] bg-gray-50 border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400 overflow-hidden">
                    <Camera size={28} className="mb-2" />
                    <span className="text-[10px] sm:text-xs">사진 업로드</span>
                  </div>
                  <button className="absolute -bottom-1 -right-1 p-1.5 sm:p-2 rounded-xl text-white shadow-lg" style={{ backgroundColor: colors.accent2 }}>
                    <Plus size={14} className="sm:w-4 sm:h-4" />
                  </button>
                </div>
                <div className="flex-1 w-full space-y-5 sm:space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5 text-left">
                      <label className="text-[11px] font-bold text-gray-500 ml-1">이름</label>
                      <input type="text" placeholder="성함" className="w-full px-4 py-3 sm:py-4 rounded-xl sm:rounded-2xl border border-gray-100 bg-gray-50 focus:outline-none focus:ring-2" style={{ '--tw-ring-color': colors.main }} />
                    </div>
                    <div className="space-y-1.5 text-left">
                      <label className="text-[11px] font-bold text-gray-500 ml-1 flex items-center justify-between px-1">
                        <span className="flex items-center gap-1"><Phone size={10}/> 연락처</span>
                        <span className="text-[9px] text-rose-500 font-bold px-2 py-0.5 bg-rose-50 rounded-full">필수</span>
                      </label>
                      <input 
                        type="text" 
                        value={profile.phone}
                        onChange={(e) => handlePhoneChange(e, 'phone')}
                        placeholder="010-0000-0000" 
                        className="w-full px-4 py-3 sm:py-4 rounded-xl sm:rounded-2xl border border-gray-100 bg-gray-50 focus:outline-none focus:ring-2" 
                        style={{ '--tw-ring-color': colors.main }} 
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-1.5 text-left">
                    <label className="text-[11px] font-bold text-gray-500 ml-1 flex items-center gap-1"><Mail size={10}/> 이메일</label>
                    <input type="email" placeholder="example@mindwell.com" className="w-full px-4 py-3 sm:py-4 rounded-xl sm:rounded-2xl border border-gray-100 bg-gray-50 focus:outline-none focus:ring-2" style={{ '--tw-ring-color': colors.main }} />
                  </div>

                  <div className="space-y-4 pt-4 border-t border-gray-50">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5 text-left">
                        <label className="text-[11px] font-bold text-gray-500 ml-1 flex items-center gap-1"><Building2 size={10} /> 상담소명</label>
                        <input type="text" placeholder="소속 상담소" className="w-full px-4 py-3 sm:py-4 rounded-xl sm:rounded-2xl border border-gray-100 bg-gray-50 focus:outline-none focus:ring-2" style={{ '--tw-ring-color': colors.main }} />
                      </div>
                      <div className="space-y-1.5 text-left">
                        <label className="text-[11px] font-bold text-gray-500 ml-1 flex items-center justify-between px-1">
                          <span className="flex items-center gap-1"><Phone size={10}/> 상담소 번호</span>
                          <span className="text-[9px] text-gray-400 font-normal px-2 py-0.5 bg-gray-100 rounded-full">선택</span>
                        </label>
                        <input 
                          type="text" 
                          value={profile.officePhone}
                          onChange={(e) => handlePhoneChange(e, 'officePhone')}
                          placeholder="02-000-0000" 
                          className="w-full px-4 py-3 sm:py-4 rounded-xl sm:rounded-2xl border border-gray-100 bg-gray-50 focus:outline-none focus:ring-2" 
                          style={{ '--tw-ring-color': colors.main }} 
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5 text-left">
                      <label className="text-[11px] font-bold text-gray-500 ml-1 flex items-center gap-1"><MapPin size={10} /> 상담소 주소</label>
                      <input type="text" placeholder="상담 진행 주소" className="w-full px-4 py-3 sm:py-4 rounded-xl sm:rounded-2xl border border-gray-100 bg-gray-50 focus:outline-none focus:ring-2" style={{ '--tw-ring-color': colors.main }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 2. 전문 분야 및 상담 시간 */}
          {activeTab === 'professional' && (
            <div className="space-y-10 sm:space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div>
                <h3 className="text-base sm:text-lg font-bold mb-4 flex items-center gap-2">
                  <div className="w-1.5 h-5 sm:h-6 rounded-full" style={{ backgroundColor: colors.main }}></div>
                  전문 상담 분야
                </h3>
                <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 gap-2.5 sm:gap-3 mb-6">
                  {specialtyOptions.map(item => {
                    const isSelected = profile.specialties.includes(item);
                    return (
                      <button 
                        key={item}
                        onClick={() => toggleSpecialty(item)}
                        className="px-4 py-3 sm:px-5 sm:py-4 rounded-[16px] sm:rounded-[20px] border text-xs sm:text-sm font-semibold transition-all flex items-center justify-between"
                        style={{ 
                          borderColor: isSelected ? colors.main : '#F3F4F6', 
                          backgroundColor: isSelected ? `${colors.main}10` : '#F9FAFB',
                          color: isSelected ? colors.main : colors.textMain
                        }}
                      >
                        {item}
                        <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center ${isSelected ? 'bg-green-500 text-white' : 'border-2 border-gray-200'}`}>
                          {isSelected && <CheckCircle2 size={12} strokeWidth={3} />}
                        </div>
                      </button>
                    );
                  })}
                </div>
                
                <div className="bg-slate-50 p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-100">
                  <label className="text-[10px] sm:text-xs font-bold text-slate-400 mb-2 block ml-1">직접 입력해 주세요.</label>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input 
                      type="text" 
                      value={profile.customSpecialty}
                      onChange={(e) => setProfile({...profile, customSpecialty: e.target.value})}
                      placeholder="예: 다문화 상담, 예술 치료 등" 
                      className="flex-1 px-4 py-3 rounded-xl sm:rounded-2xl border border-gray-100 bg-white focus:outline-none focus:ring-2 text-xs sm:text-sm" 
                      style={{ '--tw-ring-color': colors.main }} 
                    />
                    <button 
                      onClick={addCustomSpecialty}
                      className="px-6 py-3 sm:py-4 rounded-xl sm:rounded-2xl text-white font-bold transition-transform active:scale-95 text-xs sm:text-sm" 
                      style={{ backgroundColor: colors.main }}
                    >추가</button>
                  </div>
                </div>
              </div>

              <div className="pt-8 border-t border-gray-100">
                <h3 className="text-base sm:text-lg font-bold mb-6 flex items-center gap-2">
                  <div className="w-1.5 h-5 sm:h-6 rounded-full" style={{ backgroundColor: colors.accent2 }}></div>
                  주간 상담 일정
                </h3>
                <div className="space-y-3 sm:space-y-4">
                  {Object.keys(profile.weeklySchedule).map((day) => {
                    const dayData = profile.weeklySchedule[day];
                    return (
                      <div key={day} className={`p-4 sm:p-5 rounded-2xl sm:rounded-3xl border transition-all ${dayData.active ? 'bg-white border-gray-200' : 'bg-gray-50 border-gray-100 opacity-60'}`}>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                          <div className="flex items-center gap-3 min-w-[90px]">
                            <button 
                              onClick={() => toggleDay(day)}
                              className={`w-5 h-5 sm:w-6 sm:h-6 rounded-lg border-2 flex items-center justify-center transition-colors ${dayData.active ? 'bg-green-500 border-green-500 text-white' : 'bg-white border-gray-300'}`}
                            >
                              {dayData.active && <CheckCircle2 size={12} strokeWidth={3} />}
                            </button>
                            <span className={`text-sm sm:text-base font-bold ${dayData.active ? 'text-slate-800' : 'text-slate-400'}`}>{day}요일</span>
                          </div>
                          <div className="flex-1 space-y-3">
                            {dayData.active && dayData.slots.map((slot, index) => (
                              <div key={slot.id} className="flex flex-wrap items-center gap-2">
                                <div className="flex items-center gap-1.5 sm:gap-2 bg-gray-50 p-1.5 rounded-xl border border-gray-100">
                                  <select value={slot.start} onChange={(e) => handleTimeChange(day, slot.id, 'start', e.target.value)} className="bg-transparent text-[11px] sm:text-sm font-semibold focus:outline-none px-1 cursor-pointer">
                                    {hours.map(h => <option key={h} value={h}>{h}</option>)}
                                  </select>
                                  <span className="text-gray-300 text-xs">~</span>
                                  <select value={slot.end} onChange={(e) => handleTimeChange(day, slot.id, 'end', e.target.value)} className="bg-transparent text-[11px] sm:text-sm font-semibold focus:outline-none px-1 cursor-pointer">
                                    {hours.map(h => <option key={h} value={h}>{h}</option>)}
                                  </select>
                                </div>
                                {index === dayData.slots.length - 1 && (
                                  <button onClick={() => addTimeSlot(day)} className="text-[10px] sm:text-xs font-bold px-2.5 py-1.5 rounded-lg flex items-center gap-1" style={{ color: colors.main, backgroundColor: `${colors.main}10` }}>
                                    <Plus size={12} /> 추가
                                  </button>
                                )}
                                {dayData.slots.length > 1 && (
                                  <button onClick={() => removeTimeSlot(day, slot.id)} className="p-1 text-gray-300 hover:text-red-400">
                                    <X size={14} />
                                  </button>
                                )}
                              </div>
                            ))}
                            {!dayData.active && <p className="text-xs text-gray-400 italic">상담 일정이 없습니다.</p>}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* 3. 경력 및 학력 및 자격증 */}
          {activeTab === 'history' && (
            <div className="space-y-10 sm:space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* 자격증 섹션 */}
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-base sm:text-lg font-bold flex items-center gap-2">자격증</h3>
                  <button 
                    onClick={addCertificate} 
                    className="text-[11px] sm:text-[13px] font-semibold flex items-center gap-1 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl border border-[#C2D1BC] text-[#8BA888] bg-white transition-all hover:bg-gray-50"
                  >
                    <Plus size={14} strokeWidth={2.5} /> 추가
                  </button>
                </div>
                <div className="space-y-4">
                  {profile.certificates.map((cert) => (
                    <div key={cert.id} className="p-4 sm:p-6 rounded-[20px] border border-gray-100 bg-[#FCFCFC] flex flex-col md:flex-row items-end gap-4 shadow-sm relative">
                      <div className="w-full flex flex-col sm:flex-row gap-4">
                        <div className="flex-1">
                          <label className="text-[11px] font-semibold text-gray-500 mb-1.5 block ml-1">자격증명</label>
                          <input 
                            type="text" 
                            value={cert.name}
                            onChange={(e) => handleCertificateChange(cert.id, 'name', e.target.value)}
                            className="w-full h-[44px] sm:h-[48px] px-3 rounded-xl border border-gray-100 bg-[#F9FAFB] text-xs sm:text-sm" 
                          />
                        </div>
                        <div className="flex-1">
                          <label className="text-[11px] font-semibold text-gray-500 mb-1.5 block ml-1">발급 기관</label>
                          <input 
                            type="text" 
                            value={cert.organization}
                            onChange={(e) => handleCertificateChange(cert.id, 'organization', e.target.value)}
                            className="w-full h-[44px] sm:h-[48px] px-3 rounded-xl border border-gray-100 bg-[#F9FAFB] text-xs sm:text-sm" 
                          />
                        </div>
                      </div>
                      <div className="w-full md:w-[220px] shrink-0">
                        <label className="text-[11px] font-semibold text-gray-500 mb-1.5 block ml-1">취득일</label>
                        <DateSelectGroup 
                          yearValue={cert.year}
                          monthValue={cert.month}
                          onYearChange={(e) => handleCertificateChange(cert.id, 'year', e.target.value)}
                          onMonthChange={(e) => handleCertificateChange(cert.id, 'month', e.target.value)}
                        />
                      </div>
                      <button 
                        onClick={() => removeCertificate(cert.id)} 
                        className="absolute sm:relative top-4 right-4 sm:top-0 sm:right-0 w-[40px] h-[40px] sm:w-[48px] sm:h-[48px] flex items-center justify-center rounded-xl bg-[#FFF0F0] text-[#FF8A8A] transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* 학력 사항 섹션 */}
              <div className="pt-8 border-t border-gray-100">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-base sm:text-lg font-bold flex items-center gap-2">학력 사항</h3>
                  <button onClick={addEducation} className="text-[11px] sm:text-[13px] font-semibold flex items-center gap-1 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl border border-[#C2D1BC] text-[#8BA888] bg-white transition-all hover:bg-gray-50">
                    <Plus size={14} /> 추가
                  </button>
                </div>
                <div className="space-y-4">
                  {profile.education.map((edu) => (
                    <div key={edu.id} className="p-4 sm:p-6 rounded-[20px] border border-gray-100 bg-[#FCFCFC] flex flex-col md:flex-row items-end gap-4 shadow-sm relative">
                      <div className="w-full flex flex-col xs:flex-row gap-3">
                        <div className="flex-1">
                          <label className="text-[11px] font-semibold text-gray-500 mb-1.5 block ml-1">입학일</label>
                          <DateSelectGroup isSmall yearValue={edu.startYear} monthValue={edu.startMonth} onYearChange={(e) => handleEducationChange(edu.id, 'startYear', e.target.value)} onMonthChange={(e) => handleEducationChange(edu.id, 'startMonth', e.target.value)} />
                        </div>
                        <div className="flex-1">
                          <label className="text-[11px] font-semibold text-gray-500 mb-1.5 block ml-1">졸업일</label>
                          <DateSelectGroup isSmall yearValue={edu.endYear} monthValue={edu.endMonth} onYearChange={(e) => handleEducationChange(edu.id, 'endYear', e.target.value)} onMonthChange={(e) => handleEducationChange(edu.id, 'endMonth', e.target.value)} />
                        </div>
                      </div>
                      <div className="w-full flex flex-col xs:flex-row gap-3">
                        <div className="flex-[2]">
                          <label className="text-[11px] font-semibold text-gray-500 mb-1.5 block ml-1">학교 / 전공</label>
                          <input type="text" value={edu.school} onChange={(e) => handleEducationChange(edu.id, 'school', e.target.value)} className="w-full h-[44px] px-3 rounded-xl border border-gray-100 bg-[#F9FAFB] text-[12px] sm:text-sm" />
                        </div>
                        <div className="flex-1">
                          <label className="text-[11px] font-semibold text-gray-500 mb-1.5 block ml-1">학위</label>
                          <input type="text" value={edu.degree} onChange={(e) => handleEducationChange(edu.id, 'degree', e.target.value)} className="w-full h-[44px] px-3 rounded-xl border border-gray-100 bg-[#F9FAFB] text-[12px] sm:text-sm" />
                        </div>
                      </div>
                      <button onClick={() => removeEducation(edu.id)} className="absolute sm:relative top-4 right-4 sm:top-0 sm:right-0 w-[40px] h-[40px] flex items-center justify-center rounded-xl bg-[#FFF0F0] text-[#FF8A8A] shrink-0">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* 상담 경력 섹션 */}
              <div className="pt-8 border-t border-gray-100">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-base sm:text-lg font-bold flex items-center gap-2">상담 및 관련 경력</h3>
                  <button onClick={addExperience} className="text-[11px] sm:text-sm font-bold flex items-center gap-1 px-3 py-1.5 rounded-xl transition-all" style={{ color: colors.main, backgroundColor: `${colors.main}15` }}>
                    <Plus size={14} /> 추가
                  </button>
                </div>
                <div className="space-y-4">
                  {profile.experience.map((exp) => (
                    <div key={exp.id} className="flex flex-col xs:flex-row gap-3 items-start p-4 bg-gray-50/50 rounded-2xl relative">
                      <div className="w-full xs:w-40 shrink-0 space-y-1">
                        <label className="text-[10px] font-bold text-gray-400 ml-1">기간</label>
                        <input 
                          type="text" 
                          value={exp.period}
                          onChange={(e) => handleExperiencePeriodChange(exp.id, e.target.value)}
                          placeholder="24.01 ~ 25.12" 
                          className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-white text-xs sm:text-sm" 
                        />
                      </div>
                      <div className="flex-1 w-full space-y-1">
                        <label className="text-[10px] font-bold text-gray-400 ml-1">활동 상세</label>
                        <input type="text" placeholder="내용 입력" className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-white text-xs sm:text-sm" />
                      </div>
                      <button onClick={() => removeExperience(exp.id)} className="absolute right-2 top-2 xs:relative xs:top-0 xs:right-0 xs:mt-7 p-2 text-gray-300 hover:text-red-500 transition-colors">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </section>

        {/* 푸터 버튼 (모바일에서 수직 또는 간격 조정) */}
        <div className="flex flex-col xs:flex-row justify-between items-center gap-4">
          <button className="order-2 xs:order-1 px-6 py-2 rounded-xl font-bold text-gray-400 transition-colors hover:text-gray-600 text-sm">나중에 하기</button>
          <div className="order-1 xs:order-2 flex gap-3 w-full xs:w-auto">
            {activeTab !== 'history' ? (
              <button 
                onClick={() => setActiveTab(activeTab === 'basic' ? 'professional' : 'history')} 
                className="flex-1 xs:flex-none flex items-center justify-center gap-2 px-8 py-4 sm:py-5 rounded-2xl sm:rounded-[24px] text-white font-bold shadow-lg transition-transform active:scale-95 text-sm sm:text-base" 
                style={{ backgroundColor: colors.main }}
              >
                다음 단계로 <ChevronRight size={18} />
              </button>
            ) : (
              <button className="flex-1 xs:flex-none flex items-center justify-center gap-2 px-10 py-4 sm:py-5 rounded-2xl sm:rounded-[24px] text-white font-bold shadow-xl shadow-green-100 transition-transform active:scale-95 text-sm sm:text-base" style={{ backgroundColor: colors.main }}>
                <Save size={18} /> 등록 완료
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;