import React, { useState } from 'react';
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
  Clock,
  Calendar,
  X
} from 'lucide-react';

const App = () => {
  // 상태 관리
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    officeName: '',
    officeAddress: '',
    introduction: '',
    specialties: [],
    customSpecialty: '',
    // 요일별 상담 시간 설정 데이터 구조 변경
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
    education: [{ id: 1, degree: '', school: '' }]
  });

  const [activeTab, setActiveTab] = useState('basic');

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

  // 요일 활성화 토글
  const toggleDay = (day) => {
    setProfile(prev => ({
      ...prev,
      weeklySchedule: {
        ...prev.weeklySchedule,
        [day]: { ...prev.weeklySchedule[day], active: !prev.weeklySchedule[day].active }
      }
    }));
  };

  // 특정 요일에 시간대 추가
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

  // 특정 요일의 시간대 삭제
  const removeTimeSlot = (day, id) => {
    if (profile.weeklySchedule[day].slots.length <= 1) return;
    setProfile(prev => ({
      ...prev,
      weeklySchedule: {
        ...prev.weeklySchedule,
        [day]: {
          ...prev.weeklySchedule[day],
          slots: prev.weeklySchedule[day].slots.filter(slot => slot.id !== id)
        }
      }
    }));
  };

  // 시간 값 변경
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

  // 연락처 자동 하이픈 (010-0000-0000)
  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    let formatted = value;
    if (value.length > 3 && value.length <= 7) {
      formatted = `${value.slice(0, 3)}-${value.slice(3)}`;
    } else if (value.length > 7) {
      formatted = `${value.slice(0, 3)}-${value.slice(3, 7)}-${value.slice(7, 11)}`;
    }
    setProfile({ ...profile, phone: formatted });
  };

  // 경력 날짜 포맷팅
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
      education: [...prev.education, { id: Date.now(), degree: '', school: '' }]
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

  return (
    <div className="min-h-screen font-sans" style={{ backgroundColor: colors.background, color: colors.textMain }}>
      {/* GNB */}
      <header className="bg-white border-b border-gray-100 px-8 py-4 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-12">
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: colors.main }}>MINDWELL</h1>
          <nav className="hidden md:flex gap-8 text-sm font-medium text-gray-500">
            <a href="#" className="hover:text-gray-900 transition-colors text-slate-800">전문가 찾기</a>
            <a href="#" className="hover:text-gray-900 transition-colors">예약 관리</a>
            <a href="#" className="hover:text-gray-900 transition-colors">AI 일기</a>
            <a href="#" className="hover:text-gray-900 transition-colors">힐링 라운지</a>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden ring-2 ring-white">
               <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=counselor" alt="Profile" />
            </div>
            <span className="text-sm font-semibold">이은지 코치님</span>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto py-12 px-6">
        <header className="mb-10 text-center">
          <h2 className="text-3xl font-bold mb-2">전문가 프로필 등록</h2>
          <p className="text-gray-500">상담사님의 전문성을 마음웰 회원들에게 소개해 주세요.</p>
        </header>

        {/* 네비게이션 */}
        <div className="flex justify-between mb-12 relative max-w-2xl mx-auto">
          <div className="absolute top-1/2 left-0 w-full h-px bg-gray-200 -z-10 transform -translate-y-1/2"></div>
          {[
            { id: 'basic', label: '기본 정보', icon: <User size={20} /> },
            { id: 'professional', label: '전문 분야', icon: <Briefcase size={20} /> },
            { id: 'history', label: '경력 및 학력', icon: <GraduationCap size={20} /> }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex flex-col items-center gap-3 group transition-all"
            >
              <div 
                className={`w-14 h-14 rounded-full flex items-center justify-center transition-all border-2 ${
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
              <span className={`text-sm font-bold ${activeTab === tab.id ? 'text-gray-800' : 'text-gray-400'}`}>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* 컨텐츠 카드 */}
        <section className="bg-white rounded-[40px] shadow-sm border border-gray-100 p-8 md:p-12 mb-8">
          
          {/* 1. 기본 정보 */}
          {activeTab === 'basic' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex flex-col md:flex-row gap-10 items-center md:items-start">
                <div className="relative">
                  <div className="w-40 h-40 rounded-[40px] bg-gray-50 border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400 overflow-hidden">
                    <Camera size={32} className="mb-2" />
                    <span className="text-xs">사진 업로드</span>
                  </div>
                  <button className="absolute -bottom-2 -right-2 p-2 rounded-2xl text-white shadow-lg" style={{ backgroundColor: colors.accent2 }}>
                    <Plus size={16} />
                  </button>
                </div>
                <div className="flex-1 w-full space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-500 ml-1">이름</label>
                      <input type="text" placeholder="성함" className="w-full px-5 py-4 rounded-2xl border border-gray-100 bg-gray-50 focus:outline-none focus:ring-2" style={{ '--tw-ring-color': colors.main }} />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-500 ml-1 flex items-center gap-1"><Phone size={12}/> 연락처</label>
                      <input 
                        type="text" 
                        value={profile.phone}
                        onChange={handlePhoneChange}
                        placeholder="010-0000-0000" 
                        className="w-full px-5 py-4 rounded-2xl border border-gray-100 bg-gray-50 focus:outline-none focus:ring-2" 
                        style={{ '--tw-ring-color': colors.main }} 
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500 ml-1 flex items-center gap-1"><Mail size={12}/> 이메일</label>
                    <input type="email" placeholder="example@mindwell.com" className="w-full px-5 py-4 rounded-2xl border border-gray-100 bg-gray-50 focus:outline-none focus:ring-2" style={{ '--tw-ring-color': colors.main }} />
                  </div>

                  <div className="space-y-4 pt-4 border-t border-gray-50">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-500 ml-1 flex items-center gap-1"><Building2 size={12} /> 상담소명</label>
                      <input type="text" placeholder="소속 상담소 또는 센터명" className="w-full px-5 py-4 rounded-2xl border border-gray-100 bg-gray-50 focus:outline-none focus:ring-2" style={{ '--tw-ring-color': colors.main }} />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-500 ml-1 flex items-center gap-1"><MapPin size={12} /> 상담소 주소</label>
                      <input type="text" placeholder="상담 진행 주소" className="w-full px-5 py-4 rounded-2xl border border-gray-100 bg-gray-50 focus:outline-none focus:ring-2" style={{ '--tw-ring-color': colors.main }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 2. 전문 분야 및 상담 시간 */}
          {activeTab === 'professional' && (
            <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* 전문 상담 분야 */}
              <div>
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <div className="w-1.5 h-6 rounded-full" style={{ backgroundColor: colors.main }}></div>
                  전문 상담 분야 (중복 선택 가능)
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mb-6">
                  {specialtyOptions.map(item => {
                    const isSelected = profile.specialties.includes(item);
                    return (
                      <button 
                        key={item}
                        onClick={() => toggleSpecialty(item)}
                        className="px-5 py-4 rounded-[20px] border text-sm font-semibold transition-all flex items-center justify-between"
                        style={{ 
                          borderColor: isSelected ? colors.main : '#F3F4F6', 
                          backgroundColor: isSelected ? `${colors.main}10` : '#F9FAFB',
                          color: isSelected ? colors.main : colors.textMain
                        }}
                      >
                        {item}
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center ${isSelected ? 'bg-green-500 text-white' : 'border-2 border-gray-200'}`}>
                          {isSelected && <CheckCircle2 size={14} strokeWidth={3} />}
                        </div>
                      </button>
                    );
                  })}
                </div>
                
                {/* 직접 입력 칸 */}
                <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 mb-8">
                  <label className="text-xs font-bold text-slate-400 mb-2 block ml-1">찾으시는 항목이 없나요? 직접 입력해 주세요.</label>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      value={profile.customSpecialty}
                      onChange={(e) => setProfile({...profile, customSpecialty: e.target.value})}
                      placeholder="예: 다문화 상담, 예술 치료 등" 
                      className="flex-1 px-5 py-4 rounded-2xl border border-gray-100 bg-white focus:outline-none focus:ring-2 text-sm" 
                      style={{ '--tw-ring-color': colors.main }} 
                    />
                    <button 
                      onClick={addCustomSpecialty}
                      className="px-6 py-4 rounded-2xl text-white font-bold transition-transform active:scale-95" 
                      style={{ backgroundColor: colors.main }}
                    >추가</button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-4">
                    {profile.specialties.filter(s => !specialtyOptions.includes(s)).map(s => (
                      <span key={s} className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-600 text-xs font-bold flex items-center gap-2">
                        {s} <Trash2 size={12} className="text-slate-400 cursor-pointer hover:text-red-500" onClick={() => toggleSpecialty(s)} />
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* 주간 상담 시간 설정 (수정됨) */}
              <div className="pt-8 border-t border-gray-100">
                <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                  <div className="w-1.5 h-6 rounded-full" style={{ backgroundColor: colors.accent2 }}></div>
                  주간 상담 일정 설정
                </h3>
                
                <div className="space-y-4">
                  {Object.keys(profile.weeklySchedule).map((day) => {
                    const dayData = profile.weeklySchedule[day];
                    return (
                      <div key={day} className={`p-5 rounded-3xl border transition-all ${dayData.active ? 'bg-white border-gray-200' : 'bg-gray-50 border-gray-100 opacity-60'}`}>
                        <div className="flex flex-col md:flex-row md:items-center gap-4">
                          {/* 요일 체크박스 */}
                          <div className="flex items-center gap-3 min-w-[100px]">
                            <button 
                              onClick={() => toggleDay(day)}
                              className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-colors ${dayData.active ? 'bg-green-500 border-green-500 text-white' : 'bg-white border-gray-300'}`}
                            >
                              {dayData.active && <CheckCircle2 size={14} strokeWidth={3} />}
                            </button>
                            <span className={`font-bold ${dayData.active ? 'text-slate-800' : 'text-slate-400'}`}>{day}요일</span>
                            {!dayData.active && <span className="text-xs font-medium text-slate-400 bg-slate-200 px-2 py-0.5 rounded-full ml-1">휴무</span>}
                          </div>

                          {/* 시간 설정 구역 */}
                          <div className="flex-1 space-y-3">
                            {dayData.active ? (
                              dayData.slots.map((slot, index) => (
                                <div key={slot.id} className="flex items-center gap-2 animate-in slide-in-from-left-2 duration-200">
                                  <div className="flex items-center gap-2 bg-gray-50 p-1.5 rounded-2xl border border-gray-100">
                                    <select 
                                      value={slot.start}
                                      onChange={(e) => handleTimeChange(day, slot.id, 'start', e.target.value)}
                                      className="bg-transparent text-sm font-semibold focus:outline-none px-2 cursor-pointer"
                                    >
                                      {hours.map(h => <option key={h} value={h}>{h}</option>)}
                                    </select>
                                    <span className="text-gray-300">~</span>
                                    <select 
                                      value={slot.end}
                                      onChange={(e) => handleTimeChange(day, slot.id, 'end', e.target.value)}
                                      className="bg-transparent text-sm font-semibold focus:outline-none px-2 cursor-pointer"
                                    >
                                      {hours.map(h => <option key={h} value={h}>{h}</option>)}
                                    </select>
                                  </div>
                                  {dayData.slots.length > 1 && (
                                    <button 
                                      onClick={() => removeTimeSlot(day, slot.id)}
                                      className="p-2 text-gray-300 hover:text-red-500 transition-colors"
                                    >
                                      <X size={16} />
                                    </button>
                                  )}
                                  {index === dayData.slots.length - 1 && (
                                    <button 
                                      onClick={() => addTimeSlot(day)}
                                      className="flex items-center gap-1 text-xs font-bold px-3 py-2 rounded-xl transition-colors ml-2"
                                      style={{ color: colors.main, backgroundColor: `${colors.main}10` }}
                                    >
                                      <Plus size={14} /> 시간 추가
                                    </button>
                                  )}
                                </div>
                              ))
                            ) : (
                              <div className="h-10 flex items-center">
                                <span className="text-sm text-gray-300 italic">상담 일정이 없습니다.</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* 3. 경력 및 학력 */}
          {activeTab === 'history' && (
            <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold flex items-center gap-2">
                    <div className="w-1.5 h-6 rounded-full" style={{ backgroundColor: colors.main }}></div>
                    상담 및 관련 경력
                  </h3>
                  <button onClick={addExperience} className="text-sm font-bold flex items-center gap-1.5 px-4 py-2 rounded-xl transition-all" style={{ color: colors.main, backgroundColor: `${colors.main}15` }}>
                    <Plus size={16} /> 추가하기
                  </button>
                </div>
                <div className="space-y-4">
                  {profile.experience.map((exp) => (
                    <div key={exp.id} className="flex gap-3 items-start animate-in slide-in-from-top-2">
                      <div className="w-48 space-y-1">
                        <label className="text-[10px] font-bold text-gray-400 ml-1">기간 (예: 24012512)</label>
                        <input 
                          type="text" 
                          value={exp.period}
                          onChange={(e) => handleExperiencePeriodChange(exp.id, e.target.value)}
                          placeholder="24.01 ~ 25.12" 
                          className="w-full px-5 py-4 rounded-2xl border border-gray-100 bg-gray-50 focus:outline-none focus:ring-2 text-sm" 
                          style={{ '--tw-ring-color': colors.main }}
                        />
                      </div>
                      <div className="flex-1 space-y-1">
                        <label className="text-[10px] font-bold text-gray-400 ml-1">활동 상세</label>
                        <input type="text" placeholder="내용 입력" className="w-full px-5 py-4 rounded-2xl border border-gray-100 bg-gray-50 focus:outline-none focus:ring-2 text-sm" style={{ '--tw-ring-color': colors.main }} />
                      </div>
                      <button 
                        onClick={() => removeExperience(exp.id)} 
                        className={`mt-7 p-4 transition-colors ${profile.experience.length <= 1 ? 'text-gray-100 cursor-not-allowed' : 'text-gray-300 hover:text-red-500'}`}
                        disabled={profile.experience.length <= 1}
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-8 border-t border-gray-100">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold flex items-center gap-2">
                    <div className="w-1.5 h-6 rounded-full" style={{ backgroundColor: colors.accent2 }}></div>
                    학력
                  </h3>
                  <button onClick={addEducation} className="text-sm font-bold flex items-center gap-1.5 px-4 py-2 rounded-xl transition-all" style={{ color: colors.accent2, backgroundColor: `${colors.accent2}15` }}>
                    <Plus size={16} /> 추가하기
                  </button>
                </div>
                <div className="space-y-4">
                  {profile.education.map((edu) => (
                    <div key={edu.id} className="flex gap-4 items-start animate-in slide-in-from-top-2">
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-gray-400 ml-1">학교명</label>
                          <input type="text" placeholder="학교명" className="w-full px-5 py-4 rounded-2xl border border-gray-100 bg-gray-50 focus:outline-none focus:ring-2 text-sm" style={{ '--tw-ring-color': colors.main }} />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-gray-400 ml-1">전공 및 학위</label>
                          <input type="text" placeholder="전공/학위" className="w-full px-5 py-4 rounded-2xl border border-gray-100 bg-gray-50 focus:outline-none focus:ring-2 text-sm" style={{ '--tw-ring-color': colors.main }} />
                        </div>
                      </div>
                      <button 
                        onClick={() => removeEducation(edu.id)} 
                        className={`mt-7 p-4 transition-colors ${profile.education.length <= 1 ? 'text-gray-100 cursor-not-allowed' : 'text-gray-300 hover:text-red-500'}`}
                        disabled={profile.education.length <= 1}
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </section>

        {/* 푸터 버튼 */}
        <div className="flex justify-between items-center">
          <button className="px-8 py-3 rounded-2xl font-bold text-gray-400 transition-colors hover:text-gray-600">나중에 하기</button>
          <div className="flex gap-3">
            {activeTab !== 'history' ? (
              <button onClick={() => setActiveTab(activeTab === 'basic' ? 'professional' : 'history')} className="flex items-center gap-3 px-10 py-5 rounded-[24px] text-white font-bold shadow-lg transition-transform active:scale-95 hover:brightness-95" style={{ backgroundColor: colors.main }}>
                다음 단계로 <ChevronRight size={20} />
              </button>
            ) : (
              <button className="flex items-center gap-3 px-12 py-5 rounded-[24px] text-white font-bold shadow-xl shadow-green-100 transition-transform active:scale-95 hover:brightness-95" style={{ backgroundColor: colors.main }}>
                <Save size={20} /> 프로필 등록 완료
              </button>
            )}
          </div>
        </div>
      </main>

      <footer className="mt-20 border-t border-gray-100 py-16 px-8 bg-white">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 text-gray-400">
          <div className="space-y-4">
            <h4 className="font-bold text-lg" style={{ color: colors.main }}>MINDWELL</h4>
            <p className="text-xs leading-relaxed">AI 멘탈 웰니스 플랫폼 마음웰입니다.</p>
          </div>
          {['서비스', '고객지원', '법적 고지'].map(title => (
            <div key={title} className="space-y-4 text-xs">
              <h5 className="font-bold text-sm text-slate-800">{title}</h5>
              <ul className="space-y-2"><li>링크 1</li><li>링크 2</li></ul>
            </div>
          ))}
        </div>
      </footer>
    </div>
  );
};

export default App;