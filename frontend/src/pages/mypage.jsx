import React, { useState } from 'react';
import { 
  Settings, 
  Bell, 
  LogOut, 
  ChevronRight, 
  CalendarHeart,
  MessageSquareHeart,
  FileText,
  Clock,
  LayoutDashboard,
  Heart,
  History,
  Wallet,
  PlusCircle,
  Calendar,
  Headset,
  Ticket,
  Video,
  MessagesSquare,
  ArrowLeft,
  User,
  ShieldCheck,
  UserX,
  CreditCard,
  Mail,
  Phone,
  Camera,
  CheckCircle2,
  Lock,
  KeyRound,
  AlertCircle,
  ToggleRight,
  ToggleLeft,
  CalendarDays,
  CreditCard as PaymentIcon,
  Smile,
  Frown,
  Meh,
  ClipboardList,
  Stethoscope,
  Target
} from 'lucide-react';

const myPageStyles = `
  @import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css');

  .mypage-container {
    display: flex;
    min-height: 100vh;
    background-color: #FDFBF7;
    font-family: 'Pretendard', sans-serif;
    color: #334155;
    overflow-x: hidden;
  }

  @media (min-width: 1024px) {
    .mypage-container {
      padding-left: 280px;
    }
  }

  .sidebar::-webkit-scrollbar {
    display: none;
  }
  .sidebar {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }

  @media (max-width: 1024px) {
    .mypage-container, body {
      -ms-overflow-style: none;
      scrollbar-width: none;
    }
    .mypage-container::-webkit-scrollbar, body::-webkit-scrollbar {
      display: none;
    }
  }

  .sidebar {
    width: 280px;
    background: white;
    border-right: 1px solid #F1F5F9;
    padding: 2.5rem 1.5rem;
    position: fixed;
    left: 0;
    top: 0;
    height: 100vh;
    display: flex;
    flex-direction: column;
    z-index: 50;
    overflow-y: auto;
  }

  @media (max-width: 1024px) {
    .sidebar { display: none; }
  }

  .nav-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 1rem 1.25rem;
    border-radius: 1.25rem;
    color: #64748B;
    font-weight: 600;
    margin-bottom: 0.25rem;
    transition: all 0.2s ease;
    cursor: pointer;
  }

  .nav-item:hover {
    background-color: #F8FAFC;
    color: #8BA888;
  }

  .nav-item.active {
    background-color: #E8F0E7;
    color: #8BA888;
  }

  .content-area {
    flex: 1;
    padding: 1.5rem;
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
  }

  @media (min-width: 1024px) {
    .content-area { padding: 3rem 5rem; }
  }

  .status-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0.75rem;
    margin-bottom: 2rem;
  }

  @media (min-width: 640px) {
    .status-grid { gap: 1.25rem; margin-bottom: 2.5rem; }
  }

  .status-item {
    background: white;
    padding: 1rem;
    border-radius: 1.25rem;
    border: 1px solid #F1F5F9;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 0.25rem;
    transition: transform 0.2s;
  }

  @media (min-width: 640px) {
    .status-item { padding: 1.5rem; border-radius: 1.5rem; gap: 0.5rem; }
  }

  .status-item:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 15px -3px rgba(0,0,0,0.05);
  }

  .hero-card {
    background: linear-gradient(135deg, #8BA888 0%, #6B8469 100%);
    color: white;
    padding: 1.5rem;
    border-radius: 2rem;
    margin-bottom: 2rem;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    box-shadow: 0 15px 20px -5px rgba(139, 168, 136, 0.2);
  }

  @media (min-width: 768px) {
    .hero-card {
      padding: 2.25rem;
      border-radius: 2.5rem;
      margin-bottom: 3rem;
      flex-direction: row;
      justify-content: space-between;
      align-items: center;
    }
  }

  .d-badge {
    background-color: rgba(255, 255, 255, 0.2);
    backdrop-filter: blur(4px);
    padding: 2px 10px;
    border-radius: 8px;
    font-weight: 800;
    font-size: 11px;
    margin-right: 8px;
    display: inline-flex;
    align-items: center;
    border: 1px solid rgba(255, 255, 255, 0.1);
    vertical-align: middle;
  }

  .history-card {
    background: white;
    padding: 1.25rem;
    border-radius: 1.5rem;
    border: 1px solid #F1F5F9;
    margin-bottom: 0.75rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    transition: all 0.2s;
    cursor: pointer;
  }

  .history-card:hover {
    border-color: #8BA888;
    background-color: #F8FAFC;
  }

  .mobile-menu-section {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin-top: 4rem;
    padding-top: 2rem;
    border-top: 1px solid #E2E8F0;
  }

  @media (min-width: 1024px) {
    .mobile-menu-section { display: none; }
  }

  .purchase-bar {
    background-color: #FAF7F2;
    border: 1px solid #E8E2D6;
    border-radius: 1.25rem;
    padding: 1rem 1.25rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin-top: 2rem;
    cursor: pointer;
  }

  @media (min-width: 640px) {
    .purchase-bar {
       flex-direction: row;
       align-items: center;
       justify-content: space-between;
       padding: 1rem 1.5rem;
    }
  }

  .fade-in {
    animation: fadeIn 0.3s ease-in;
  }
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .sub-menu-card {
    background: white;
    padding: 1.25rem 1.5rem;
    border-radius: 1.25rem;
    border: 1px solid #F1F5F9;
    display: flex;
    align-items: center;
    justify-content: space-between;
    cursor: pointer;
    transition: all 0.2s;
    margin-bottom: 0.75rem;
  }
  .sub-menu-card:hover {
    background-color: #F8FAFC;
    border-color: #E2E8F0;
  }

  .input-label {
    display: block;
    font-size: 13px;
    font-weight: 700;
    color: #64748B;
    margin-bottom: 0.5rem;
    margin-left: 0.25rem;
  }

  .custom-input {
    width: 100%;
    padding: 1rem 1.25rem 1rem 3.5rem; 
    background-color: #F8FAFC;
    border: 1px solid #F1F5F9;
    border-radius: 1rem;
    font-size: 15px;
    font-weight: 500;
    color: #334155;
    transition: all 0.2s;
  }

  .custom-input:focus {
    outline: none;
    border-color: #8BA888;
    background-color: white;
    box-shadow: 0 0 0 4px rgba(139, 168, 136, 0.1);
  }

  .save-btn {
    background-color: #8BA888;
    color: white;
    font-weight: 800;
    padding: 1.25rem;
    border-radius: 1.25rem;
    width: 100%;
    margin-top: 2rem;
    transition: all 0.2s;
  }

  .save-btn:hover {
    background-color: #6B8469;
    transform: translateY(-2px);
    box-shadow: 0 10px 15px -3px rgba(139, 168, 136, 0.2);
  }

  .toggle-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1.25rem 1rem;
    border-bottom: 1px solid #F1F5F9;
  }
  .toggle-item:last-child { border-bottom: none; }

  .progress-bar {
    height: 8px;
    background: #F1F5F9;
    border-radius: 4px;
    overflow: hidden;
  }
  .progress-fill {
    height: 100%;
    background: #8BA888;
    border-radius: 4px;
  }
`;

export default function App() {
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [activeSubMenu, setActiveSubMenu] = useState(null);
  const [ticketCount, setTicketCount] = useState(2);
  
  const [selectedConsultation, setSelectedConsultation] = useState(null);

  const [notifSettings, setNotifSettings] = useState({
    session: true,
    marketing: false,
    report: true,
    service: true
  });

  const [userInfo, setUserInfo] = useState({
    name: '김소현',
    email: 'sohyun.kim@example.com',
    phone: '010-1234-5678',
    birth: '1996-05-20'
  });

  const menuItems = [
    { id: 'history', label: '상담 히스토리', icon: History },
    { id: 'tickets', label: '상담권/결제', icon: Wallet },
    { id: 'diary', label: '마음 리포트', icon: FileText },
    { id: 'profile', label: '계정 설정', icon: Settings },
  ];

  const handleMenuClick = (id) => {
    setActiveMenu(id);
    setActiveSubMenu(null);
    setSelectedConsultation(null);
  };

  const toggleNotif = (key) => {
    setNotifSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const renderHistoryDetail = () => {
    const historyList = [
      { 
        id: 1, counselor: '이은지 상담사', date: '2024.05.13', time: '14:00', type: '대면 상담', status: '상담 완료', topic: '대인관계 스트레스',
        summary: '주변인들의 부탁을 거절하지 못해 발생하는 번아웃과 스트레스에 대해 논의함. 자신의 욕구를 먼저 파악하는 연습이 필요함.',
        feedback: '소현님은 타인에 대한 배려가 깊지만, 그만큼 자신을 돌보는 데 소홀해져 있었습니다. 오늘은 "나의 경계선 설정하기"를 주제로 구체적인 거절의 기술을 연습해 보았습니다.',
        nextStep: '하루에 한 번, 내키지 않는 제안에 대해 정중히 거절해 보기'
      },
      { 
        id: 2, counselor: '박민우 상담사', date: '2024.05.06', time: '11:00', type: '대면 상담', status: '상담 완료', topic: '직장 내 갈등 관리',
        summary: '상사의 일방적인 업무 지시 방식으로 인한 무력감과 갈등 상황을 공유함.',
        feedback: '감정적인 대응보다는 업무 효율성과 연계된 소통 방식을 제안했습니다. 본인의 감정이 "무시당함"에 집중되어 있음을 인지하고 이를 객관적으로 분리하는 훈련을 진행했습니다.',
        nextStep: '갈등 상황 발생 시 즉시 반응하지 않고 10초간 호흡하기'
      },
      { 
        id: 3, counselor: '이은지 상담사', date: '2024.04.29', time: '14:00', type: '대면 상담', status: '상담 완료', topic: '자존감 회복 훈련',
        summary: '과거의 실패 경험이 현재의 의사 결정에 미치는 부정적 영향 분석.',
        feedback: '성취 경험을 기록하는 "칭찬 일기"를 통해 자신감을 회복하는 단계입니다. 오늘은 본인이 가진 강점 5가지를 찾아내는 시간을 가졌습니다.',
        nextStep: '매일 잠들기 전 나를 위한 칭찬 한 문장 적기'
      },
      { 
        id: 4, counselor: '김하나 상담사', date: '2024.04.15', time: '16:30', type: '대면 상담', status: '상담 완료', topic: '불안 장애 상담',
        summary: '원인 모를 급격한 심박수 증가와 신체적 불안 증상에 대한 대처법.',
        feedback: '공황 증상과 유사한 불안 발작 시 사용할 수 있는 접지법(Grounding)과 복식 호흡법을 숙달했습니다. 심리적 안전 기지를 설정하는 명상을 함께 진행했습니다.',
        nextStep: '불안 신호 포착 시 5-4-3-2-1 접지법 시행하기'
      }
    ];

    if (selectedConsultation) {
      return (
        <div className="fade-in max-w-4xl mx-auto">
          <button onClick={() => setSelectedConsultation(null)} className="flex items-center gap-1 text-stone-400 font-bold text-sm mb-6">
            <ArrowLeft size={16} /> 전체 목록으로
          </button>
          
          <div className="bg-white rounded-[2.5rem] border border-stone-100 overflow-hidden shadow-sm">
            <div className="p-8 border-b border-stone-50 bg-stone-50/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="text-[11px] font-black text-[#8BA888] bg-[#E8F0E7] px-3 py-1 rounded-full mb-2 inline-block uppercase">Consultation Report</span>
                <h3 className="text-2xl font-black text-slate-800">{selectedConsultation.topic}</h3>
                <p className="text-sm text-stone-400 font-bold mt-1">{selectedConsultation.counselor} • {selectedConsultation.date} {selectedConsultation.time}</p>
              </div>
              <div className="flex items-center gap-3">
                 <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-[#8BA888] shadow-sm border border-stone-100">
                    <ClipboardList size={24} />
                 </div>
              </div>
            </div>
            
            <div className="p-8 space-y-10">
              <section>
                <h4 className="flex items-center gap-2 text-slate-800 font-black mb-4">
                  <div className="w-1.5 h-4 bg-[#8BA888] rounded-full"></div>
                  상담 요약
                </h4>
                <div className="bg-[#FDFBF7] p-6 rounded-2xl border border-stone-100/50">
                  <p className="text-slate-600 text-sm leading-relaxed font-medium">
                    {selectedConsultation.summary}
                  </p>
                </div>
              </section>

              <section>
                <h4 className="flex items-center gap-2 text-slate-800 font-black mb-4">
                  <div className="w-1.5 h-4 bg-[#8BA888] rounded-full"></div>
                  전문가 소견
                </h4>
                <div className="p-2">
                  <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line font-medium">
                    {selectedConsultation.feedback}
                  </p>
                </div>
              </section>

              <section className="bg-[#E8F0E7]/30 p-8 rounded-[2rem] border border-[#8BA888]/10">
                <h4 className="flex items-center gap-2 text-[#6B8469] font-black mb-4">
                  <Target size={20} />
                  다음 상담까지의 실천 과제
                </h4>
                <p className="text-slate-700 text-base font-extrabold leading-relaxed">
                  "{selectedConsultation.nextStep}"
                </p>
              </section>
            </div>
            
            <div className="px-8 py-6 bg-stone-50/50 border-t border-stone-100 text-center">
              <p className="text-[11px] text-stone-300 font-bold uppercase tracking-widest">이 기록은 오직 소현님과 담당 상담사만 확인할 수 있습니다.</p>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="fade-in">
        <button onClick={() => handleMenuClick('dashboard')} className="flex items-center gap-1 text-stone-400 font-bold text-sm mb-4">
          <ArrowLeft size={16} /> 대시보드
        </button>
        <div className="flex justify-between items-end mb-8">
          <div>
            <h3 className="text-2xl font-black text-slate-800">상담 히스토리</h3>
            <p className="text-slate-400 text-sm mt-1">소현님이 걸어온 마음의 발자취입니다.</p>
          </div>
          <div className="hidden sm:block">
             <span className="text-xs font-bold text-[#8BA888] bg-[#E8F0E7] px-3 py-1.5 rounded-full">총 12회 상담 완료</span>
          </div>
        </div>

        <div className="space-y-4">
          {historyList.map((item) => (
            <div 
              key={item.id} 
              onClick={() => setSelectedConsultation(item)} 
              className="bg-white p-5 sm:p-6 rounded-[1.5rem] border border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-[#8BA888] transition-colors cursor-pointer group shadow-sm"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-stone-50 rounded-2xl flex items-center justify-center text-[#8BA888] group-hover:bg-[#E8F0E7] transition-colors">
                  <CalendarDays size={24} />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold text-stone-400">{item.date} {item.time}</span>
                    <span className="text-[10px] px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded-md font-bold">{item.type}</span>
                  </div>
                  <h4 className="font-bold text-slate-800 text-base">{item.counselor}</h4>
                  <p className="text-sm text-stone-500 mt-0.5">상담 주제: {item.topic}</p>
                </div>
              </div>
              <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-4 sm:pt-0">
                <div className="text-right">
                   <p className="text-xs font-bold text-[#8BA888]">상담 기록지 보기</p>
                </div>
                <ChevronRight size={20} className="text-stone-300 group-hover:text-[#8BA888] transition-colors" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderTicketsDetail = () => {
    const paymentHistory = [
      { id: 1, title: '마음 돌봄 5회권 패키지', date: '2024.04.10', amount: '250,000원', status: '결제완료' },
      { id: 2, title: '1:1 집중 상담 1회권', date: '2024.03.15', amount: '60,000원', status: '결제완료' }
    ];

    return (
      <div className="fade-in">
        <button onClick={() => handleMenuClick('dashboard')} className="flex items-center gap-1 text-stone-400 font-bold text-sm mb-4">
          <ArrowLeft size={16} /> 대시보드
        </button>
        <h3 className="text-2xl font-black text-slate-800 mb-6">상담권/결제 상세</h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 bg-white p-8 rounded-[2rem] border border-stone-100 shadow-sm">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-8 bg-amber-50 rounded-[1.5rem] mb-4 gap-4">
              <div>
                <p className="text-amber-600 font-bold text-sm uppercase tracking-wider mb-1">현재 사용 가능한 상담권</p>
                <p className="text-5xl font-black text-slate-800">{ticketCount}회</p>
              </div>
              <div className="p-5 bg-white rounded-2xl shadow-sm">
                  <Wallet size={40} className="text-amber-300" />
              </div>
            </div>
            
            <button className="w-full flex items-center justify-center gap-2 p-4 bg-[#8BA888] text-white rounded-2xl font-bold transition-all hover:bg-[#6B8469] shadow-sm mb-8">
              <PlusCircle size={20} />
              추가 결제하기
            </button>
            
            <h4 className="font-bold text-slate-800 px-1 mb-4 flex items-center gap-2">
              <PlusCircle size={18} className="text-[#8BA888]" /> 상담권 구매하기
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button className="p-6 border-2 border-stone-100 rounded-2xl text-left hover:border-[#8BA888] transition-all bg-white group">
                <p className="text-xs font-bold text-stone-400 mb-1">가장 인기있는</p>
                <p className="text-lg font-bold text-slate-800">5회 패키지</p>
                <p className="text-[#8BA888] font-black mt-2">250,000원</p>
              </button>
              <button className="p-6 border-2 border-stone-100 rounded-2xl text-left hover:border-[#8BA888] transition-all bg-white">
                <p className="text-xs font-bold text-stone-400 mb-1">부담 없이 시작하는</p>
                <p className="text-lg font-bold text-slate-800">1회 체험권</p>
                <p className="text-[#8BA888] font-black mt-2">60,000원</p>
              </button>
            </div>
          </div>

          <div className="bg-white p-6 rounded-[2rem] border border-stone-100 shadow-sm flex flex-col">
            <h4 className="font-bold text-slate-800 px-1 mb-4 flex items-center gap-2">
              <PaymentIcon size={18} className="text-[#8BA888]" /> 최근 결제 내역
            </h4>
            <div className="flex-1 space-y-4">
              {paymentHistory.map((item) => (
                <div key={item.id} className="pb-4 border-b border-stone-50 last:border-0">
                  <p className="text-xs font-bold text-stone-400 mb-1">{item.date}</p>
                  <p className="text-sm font-bold text-slate-700">{item.title}</p>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-xs font-medium text-slate-400">{item.status}</span>
                    <span className="text-sm font-black text-slate-800">{item.amount}</span>
                  </div>
                </div>
              ))}
            </div>
            <button className="mt-6 w-full py-3 bg-stone-50 text-stone-400 text-xs font-bold rounded-xl hover:bg-stone-100 transition-colors">
              전체 결제 내역 보기
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderDiaryDetail = () => {
    return (
      <div className="fade-in">
        <button onClick={() => handleMenuClick('dashboard')} className="flex items-center gap-1 text-stone-400 font-bold text-sm mb-4">
          <ArrowLeft size={16} /> 대시보드
        </button>
        <h3 className="text-2xl font-black text-slate-800 mb-6">마음 리포트 상세</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white p-8 rounded-[2rem] border border-stone-100 shadow-sm">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h4 className="font-bold text-slate-800 text-lg">주간 감정 흐름 분석</h4>
                  <p className="text-stone-400 text-sm">최근 7일간 소현님의 마음 날씨입니다.</p>
                </div>
                <div className="flex items-center gap-2 bg-stone-50 px-3 py-1.5 rounded-full">
                   <Smile size={16} className="text-[#8BA888]" />
                   <span className="text-xs font-bold text-[#8BA888]">평온함</span>
                </div>
              </div>
              
              <div className="h-48 flex items-end justify-between px-4 pb-2 border-b border-stone-100 relative">
                <div className="w-8 bg-stone-100 rounded-t-lg h-[40%]"></div>
                <div className="w-8 bg-stone-100 rounded-t-lg h-[60%]"></div>
                <div className="w-8 bg-[#8BA888]/30 rounded-t-lg h-[30%]"></div>
                <div className="w-8 bg-[#8BA888] rounded-t-lg h-[85%]"></div>
                <div className="w-8 bg-[#8BA888] rounded-t-lg h-[70%]"></div>
                <div className="w-8 bg-stone-100 rounded-t-lg h-[50%]"></div>
                <div className="w-8 bg-[#8BA888] rounded-t-lg h-[90%]"></div>
              </div>
              <div className="flex justify-between px-4 mt-3">
                 {['월','화','수','목','금','토','일'].map(d => <span key={d} className="text-[10px] font-bold text-stone-300">{d}</span>)}
              </div>
            </div>

            <div className="bg-white p-8 rounded-[2rem] border border-stone-100 shadow-sm">
              <h4 className="font-bold text-slate-800 text-lg mb-4 flex items-center gap-2">
                <MessagesSquare size={20} className="text-[#8BA888]" /> AI 마음 코멘트
              </h4>
              <div className="bg-stone-50 p-6 rounded-2xl relative">
                <p className="text-slate-600 leading-relaxed text-sm font-medium italic">
                  "소현님, 이번 주에는 평소보다 직장에서의 인간관계에 대한 고민이 많으셨네요. 하지만 상담을 통해 감정을 객관화하려는 노력이 엿보여요. 목요일 이후로 감정 상태가 눈에 띄게 회복된 것은 아주 긍정적인 신호입니다. 자신을 다독이는 시간을 조금 더 가져보세요."
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white p-6 rounded-[2rem] border border-stone-100 shadow-sm">
              <h4 className="font-bold text-slate-800 mb-4">현재 마음 에너지</h4>
              <div className="space-y-5">
                <div>
                  <div className="flex justify-between text-xs font-bold mb-2">
                    <span className="text-slate-500">회복 탄력성</span>
                    <span className="text-[#8BA888]">72%</span>
                  </div>
                  <div className="progress-bar"><div className="progress-fill" style={{width: '72%'}}></div></div>
                </div>
                <div>
                  <div className="flex justify-between text-xs font-bold mb-2">
                    <span className="text-slate-500">스트레스 조절</span>
                    <span className="text-slate-400">48%</span>
                  </div>
                  <div className="progress-bar"><div className="progress-fill bg-amber-300" style={{width: '48%'}}></div></div>
                </div>
                <div>
                  <div className="flex justify-between text-xs font-bold mb-2">
                    <span className="text-slate-500">자아 긍정</span>
                    <span className="text-[#8BA888]">65%</span>
                  </div>
                  <div className="progress-bar"><div className="progress-fill" style={{width: '65%'}}></div></div>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-[2rem] border border-stone-100 shadow-sm">
              <h4 className="font-bold text-slate-800 mb-3 text-sm">추천 테라피</h4>
              <div className="p-4 bg-emerald-50 rounded-2xl flex items-center gap-3">
                 <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-emerald-500">
                    <Clock size={20} />
                 </div>
                 <div>
                    <p className="text-[11px] font-bold text-emerald-700">명상 10분</p>
                    <p className="text-[10px] text-emerald-600/70">호흡에 집중해 보세요</p>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderPersonalEdit = () => {
    return (
      <div className="fade-in w-full">
        <div className="bg-white p-10 sm:p-14 rounded-[2.5rem] border border-stone-100 shadow-sm mb-8">
          <div className="flex flex-col items-center mb-12">
            <div className="relative">
              <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-[3rem] bg-stone-50 border-8 border-white shadow-lg overflow-hidden">
                <img src="https://api.dicebear.com/7.x/notionists/svg?seed=Sohyun" alt="User Profile" />
              </div>
              <button className="absolute -right-2 -bottom-2 w-12 h-12 bg-white border border-stone-100 rounded-2xl flex items-center justify-center text-slate-400 shadow-md hover:text-[#8BA888] transition-all hover:scale-105">
                <Camera size={24} />
              </button>
            </div>
            <p className="mt-5 font-black text-slate-800 text-lg">프로필 사진 변경</p>
            <p className="text-stone-300 text-xs mt-1">나를 잘 나타내는 사진을 등록해 주세요.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="md:col-span-1">
              <label className="input-label">이름</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300" size={20} />
                <input type="text" className="custom-input" value={userInfo.name} onChange={(e) => setUserInfo({...userInfo, name: e.target.value})}/>
              </div>
            </div>
            <div className="md:col-span-1">
              <label className="input-label">휴대폰 번호</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300" size={20} />
                <input type="tel" className="custom-input" value={userInfo.phone} onChange={(e) => setUserInfo({...userInfo, phone: e.target.value})}/>
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="input-label">이메일 주소</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300" size={20} />
                <input type="email" className="custom-input bg-stone-50 text-stone-400" value={userInfo.email} readOnly />
              </div>
              <p className="text-[11px] text-stone-400 mt-2 ml-1">* 이메일은 가입 시 고유 정보로 변경할 수 없습니다.</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-10 sm:p-14 rounded-[2.5rem] border border-stone-100 shadow-sm mb-8">
          <h4 className="font-bold text-slate-800 px-1 mb-8 flex items-center gap-3 text-lg">
            <div className="w-10 h-10 bg-[#E8F0E7] text-[#8BA888] rounded-xl flex items-center justify-center">
               <ShieldCheck size={24} />
            </div>
            로그인 보안 설정
          </h4>
          <div className="space-y-8">
            <div>
              <label className="input-label">현재 비밀번호</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300" size={20} />
                <input type="password" placeholder="현재 비밀번호를 입력해 주세요" className="custom-input" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div>
                  <label className="input-label">새 비밀번호</label>
                  <div className="relative">
                    <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300" size={20} />
                    <input type="password" placeholder="8자 이상 영문+숫자" className="custom-input" />
                  </div>
               </div>
               <div>
                  <label className="input-label">새 비밀번호 확인</label>
                  <div className="relative">
                    <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300" size={20} />
                    <input type="password" placeholder="다시 한번 입력해 주세요" className="custom-input" />
                  </div>
               </div>
            </div>
          </div>
        </div>

        <button className="save-btn flex items-center justify-center gap-2 mb-14 text-lg py-5">
          <CheckCircle2 size={24} />
          변경 사항 안전하게 저장하기
        </button>
      </div>
    );
  };

  const renderNotificationEdit = () => {
    const settings = [
      { key: 'session', title: '상담 일정 알림', desc: '예약된 상담 시간 및 변동 사항을 알려드려요.' },
      { key: 'report', title: '마음 리포트 알림', desc: '분석이 완료된 나만의 리포트 도착 소식을 알려드려요.' },
      { key: 'service', title: '서비스 공지사항', desc: '점검 안내 등 서비스 이용에 필요한 정보를 알려드려요.' },
      { key: 'marketing', title: '이벤트 및 혜택 알림', desc: '새로운 프로그램과 할인 쿠폰 정보를 받아보세요.' },
    ];

    return (
      <div className="fade-in w-full">
        <div className="bg-white p-8 sm:p-12 rounded-[2.5rem] border border-stone-100 shadow-sm">
          <div className="space-y-4">
            {settings.map((item) => (
              <div key={item.key} className="toggle-item group hover:bg-stone-50/50 rounded-2xl transition-colors px-4">
                <div>
                  <p className="font-bold text-slate-800 text-base sm:text-lg">{item.title}</p>
                  <p className="text-stone-400 text-sm mt-0.5">{item.desc}</p>
                </div>
                <button onClick={() => toggleNotif(item.key)} className={`transition-all hover:scale-105 ${notifSettings[item.key] ? 'text-[#8BA888]' : 'text-stone-200'}`}>
                  {notifSettings[item.key] ? <ToggleRight size={56} strokeWidth={1.2} /> : <ToggleLeft size={56} strokeWidth={1.2} />}
                </button>
              </div>
            ))}
          </div>
          <div className="mt-10 p-6 bg-stone-50 rounded-3xl flex gap-4 border border-stone-100/50">
             <AlertCircle size={24} className="text-[#8BA888] shrink-0 mt-0.5" />
             <p className="text-xs sm:text-sm text-stone-500 leading-relaxed font-medium">기기 전체 알림이 꺼져있을 경우 앱 설정을 켜도 알림이 전송되지 않을 수 있습니다. 휴대폰의 <span className="font-bold text-slate-700">설정 {' > '} 알림</span> 메뉴에서 마인드웰의 '알림 허용' 상태를 확인해 주세요.</p>
          </div>
        </div>
      </div>
    );
  };

  const renderQuitService = () => {
    return (
      <div className="fade-in text-center w-full">
        <div className="bg-white p-10 sm:p-14 rounded-[2.5rem] border border-stone-100 shadow-sm border-t-rose-200 border-t-8">
          <div className="text-center mb-12">
            <div className="w-24 h-24 bg-rose-50 rounded-[2.5rem] flex items-center justify-center text-rose-400 mx-auto mb-6 shadow-inner">
               <UserX size={48} />
            </div>
            <h4 className="text-2xl font-black text-slate-800 mb-3">정말 마인드웰을 떠나시나요?</h4>
            <p className="text-stone-400 font-medium">탈퇴하시면 지금까지 쌓아온 소중한 기록들이 사라집니다.</p>
          </div>

          <div className="bg-stone-50 p-8 rounded-[2rem] space-y-6 mb-12 text-left border border-stone-100/50">
             <div className="flex gap-4">
                <span className="shrink-0 w-6 h-6 bg-rose-100 text-rose-500 rounded-full flex items-center justify-center text-xs font-black mt-1">1</span>
                <p className="text-sm text-slate-600 font-bold leading-relaxed">보유 중인 모든 상담권({ticketCount}회)과 포인트가 즉시 소멸되며 환불이 불가능합니다.</p>
             </div>
             <div className="flex gap-4">
                <span className="shrink-0 w-6 h-6 bg-rose-100 text-rose-500 rounded-full flex items-center justify-center text-xs font-black mt-1">2</span>
                <p className="text-sm text-slate-600 font-bold leading-relaxed">지금까지 작성된 모든 마음 리포트와 상담 히스토리(기록지)가 영구 삭제됩니다.</p>
             </div>
             <div className="flex gap-4">
                <span className="shrink-0 w-6 h-6 bg-rose-100 text-rose-500 rounded-full flex items-center justify-center text-xs font-black mt-1">3</span>
                <p className="text-sm text-slate-600 font-bold leading-relaxed">탈퇴 후 30일간은 동일한 정보로 재가입이 불가능합니다.</p>
             </div>
          </div>

          <label className="flex items-center justify-center gap-4 p-6 border-2 border-stone-100 rounded-2xl cursor-pointer hover:bg-rose-50 transition-all mb-10 group">
             <input type="checkbox" className="w-6 h-6 accent-rose-400 cursor-pointer" />
             <span className="text-base font-bold text-slate-700 group-hover:text-rose-600">위 유의사항을 모두 확인하였으며, 이에 동의합니다.</span>
          </label>

          <button className="w-full p-6 bg-stone-100 text-stone-400 font-black rounded-2xl text-lg hover:bg-rose-500 hover:text-white transition-all shadow-sm">
            마인드웰 계정 영구 삭제
          </button>
        </div>
      </div>
    );
  };

  const renderProfileDetail = () => {
    const details = {
      'personal': { title: '개인정보 수정 및 보안', desc: '회원님의 소중한 정보와 비밀번호를 안전하게 관리하세요.' },
      'notification': { title: '알림 설정', desc: '상담 일정 및 서비스 소식을 전해드릴게요.' },
      'quit': { title: '서비스 탈퇴', desc: '탈퇴 시 소중한 기록들이 모두 삭제됩니다.' },
    };

    const current = details[activeSubMenu];

    return (
      <div className="fade-in w-full">
        <div className="mb-8">
            <button onClick={() => setActiveSubMenu(null)} className="flex items-center gap-1 text-stone-400 font-bold text-sm mb-4 hover:text-slate-600 transition-colors">
              <ArrowLeft size={16} /> 계정 설정으로 돌아가기
            </button>
            <h3 className="text-3xl font-black text-slate-800 mb-2">{current.title}</h3>
            <p className="text-slate-400 text-base font-medium">{current.desc}</p>
        </div>
        
        {activeSubMenu === 'personal' && renderPersonalEdit()}
        {activeSubMenu === 'notification' && renderNotificationEdit()}
        {activeSubMenu === 'quit' && renderQuitService()}
      </div>
    );
  };

  const renderContent = () => {
    if (activeMenu === 'profile' && activeSubMenu) {
      return renderProfileDetail();
    }

    switch (activeMenu) {
      case 'history':
        return renderHistoryDetail();
      case 'tickets':
        return renderTicketsDetail();
      case 'diary':
        return renderDiaryDetail();
      case 'profile':
        return (
          <div className="fade-in">
            <button onClick={() => handleMenuClick('dashboard')} className="flex items-center gap-1 text-stone-400 font-bold text-sm mb-4">
              <ArrowLeft size={16} /> 돌아가기
            </button>
            <h3 className="text-2xl font-black text-slate-800 mb-6">계정 설정</h3>
            <div className="space-y-3">
              {[
                { key: 'personal', label: '개인정보 수정 및 보안', icon: User, color: 'text-blue-500', bg: 'bg-blue-50' },
                { key: 'notification', label: '알림 설정', icon: Bell, color: 'text-amber-500', bg: 'bg-amber-50' },
                { key: 'quit', label: '서비스 탈퇴', icon: UserX, color: 'text-rose-400', bg: 'bg-rose-50' },
              ].map((item) => (
                <div 
                  key={item.key} 
                  className="sub-menu-card group"
                  onClick={() => setActiveSubMenu(item.key)}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 ${item.bg} ${item.color} rounded-xl flex items-center justify-center transition-transform group-hover:scale-110`}>
                      <item.icon size={20} />
                    </div>
                    <span className="font-bold text-slate-700">{item.label}</span>
                  </div>
                  <ChevronRight size={20} className="text-stone-300 group-hover:text-slate-400" />
                </div>
              ))}
            </div>
            
            <div className="mt-8 pt-6 border-t border-slate-100">
              <button className="flex items-center gap-3 px-6 py-4 w-full bg-white border border-rose-100 text-rose-400 rounded-2xl font-bold hover:bg-rose-50 transition-all">
                <LogOut size={20} />
                로그아웃
              </button>
            </div>
          </div>
        );
      default:
        return (
          <div className="fade-in">
            <div className="status-grid">
              <div className="status-item" onClick={() => handleMenuClick('tickets')}>
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-amber-50 text-amber-500 rounded-lg sm:rounded-xl flex items-center justify-center mb-1"><Wallet size={18}/></div>
                <p className="text-[9px] sm:text-[11px] font-bold text-stone-400 uppercase tracking-tighter">잔여 상담권</p>
                <p className="text-lg sm:text-xl font-black text-slate-800">{ticketCount}<span className="text-[10px] sm:text-xs font-medium ml-0.5">회</span></p>
              </div>
              <div className="status-item">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-50 text-blue-500 rounded-lg sm:rounded-xl flex items-center justify-center mb-1"><CalendarHeart size={18}/></div>
                <p className="text-[9px] sm:text-[11px] font-bold text-stone-400 uppercase tracking-tighter">대기 중인 예약</p>
                <p className="text-lg sm:text-xl font-black text-slate-800">1<span className="text-[10px] sm:text-xs font-medium ml-0.5">건</span></p>
              </div>
              <div className="status-item" onClick={() => handleMenuClick('history')}>
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-rose-50 text-rose-500 rounded-lg sm:rounded-xl flex items-center justify-center mb-1"><History size={18}/></div>
                <p className="text-[9px] sm:text-[11px] font-bold text-stone-400 uppercase tracking-tighter">완료한 상담</p>
                <p className="text-lg sm:text-xl font-black text-slate-800">12<span className="text-[10px] sm:text-xs font-medium ml-0.5">회</span></p>
              </div>
            </div>

            <div className="hero-card">
              <div className="flex items-center gap-4 sm:gap-6">
                <div className="shrink-0 w-12 h-12 sm:w-16 sm:h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30 shadow-inner text-white">
                  <MessagesSquare size={28} />
                </div>
                <div>
                  <div className="flex items-center mb-1">
                    <span className="d-badge">D-2</span>
                    <p className="text-white/80 text-[10px] font-bold uppercase tracking-widest">Next Session</p>
                  </div>
                  <h3 className="text-lg md:text-2xl font-bold">5월 20일(수) 오후 2:00</h3>
                  <p className="text-white/80 text-xs sm:text-sm font-medium">이은지 상담사와 1:1 상담 예정</p>
                </div>
              </div>
              <button className="w-full md:w-auto flex px-6 py-3.5 bg-white text-[#6B8469] rounded-xl sm:rounded-2xl font-bold text-sm shadow-xl hover:bg-stone-50 transition-all active:scale-95 items-center justify-center gap-2">
                상담 상세 보기
                <ChevronRight size={18} />
              </button>
            </div>

            <div className="flex justify-between items-center mb-4 sm:mb-6">
              <h3 className="text-base sm:text-lg font-bold text-slate-800 flex items-center gap-2">
                <History size={20} className="text-[#8BA888]" /> 최근 상담 기록
              </h3>
              <button onClick={() => handleMenuClick('history')} className="text-xs font-bold text-stone-400 hover:text-[#8BA888]">전체보기</button>
            </div>
            
            <div className="space-y-3">
              {[
                { counselor: '이은지 상담사', date: '2024.05.13', type: '대면 상담', status: '상담 완료' },
                { counselor: '박민우 상담사', date: '2024.05.06', type: '대면 상담', status: '상담 완료' },
              ].map((item, idx) => (
                <div key={idx} className="history-card" onClick={() => handleMenuClick('history')}>
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-stone-50 rounded-xl sm:rounded-2xl flex items-center justify-center text-[#8BA888]">
                      <MessageSquareHeart size={20} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm sm:text-base font-bold text-slate-800">{item.counselor}</p>
                        <span className="text-[9px] px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded-md font-bold">{item.status}</span>
                      </div>
                      <p className="text-[10px] sm:text-xs text-stone-400 font-medium mt-0.5">{item.date} • {item.type}</p>
                    </div>
                  </div>
                  <button className="p-2 text-stone-300">
                    <ChevronRight size={18} />
                  </button>
                </div>
              ))}
            </div>

            <div className="purchase-bar group" onClick={() => handleMenuClick('tickets')}>
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-[#8BA888] shadow-sm">
                  <Ticket size={18} />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-700">더 많은 위로가 필요하신가요?</p>
                  <p className="hidden sm:block text-[10px] text-stone-400 font-medium mt-0.5">상담권을 충전하고 마음 케어를 이어가세요.</p>
                </div>
              </div>
              <div className="flex items-center justify-center gap-2 text-[#8BA888] font-bold text-xs bg-white px-5 py-2.5 rounded-xl shadow-sm group-hover:bg-[#8BA888] group-hover:text-white transition-all">
                {ticketCount > 0 ? '상담권 추가 충전하기' : '상담권 충전하기'}
                <ChevronRight size={14} />
              </div>
            </div>

            <section className="mobile-menu-section">
              <h4 className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-3 ml-1">전체 메뉴</h4>
              <div className="bg-white border border-stone-100 rounded-[1.5rem] shadow-sm mb-4 overflow-hidden">
                {[
                  { id: 'history', label: '상담 히스토리' },
                  { id: 'tickets', label: '상담권/결제' },
                  { id: 'diary', label: '마음 리포트' }
                ].map((item, index) => (
                  <div key={item.id} onClick={() => handleMenuClick(item.id)} className={`py-4 px-5 bg-white active:bg-stone-50 cursor-pointer transition-colors ${index !== 2 ? 'border-b border-stone-100' : ''}`}>
                    <div className="flex justify-between items-center">
                      <span className="text-[16px] font-medium text-slate-800">{item.label}</span>
                      <ChevronRight size={16} className="text-stone-300" />
                    </div>
                  </div>
                ))}
              </div>
              <div className="bg-white border border-stone-100 rounded-[1.5rem] shadow-sm overflow-hidden">
                <div onClick={() => handleMenuClick('profile')} className="py-4 px-5 bg-white border-b border-stone-100 active:bg-stone-50 cursor-pointer transition-colors">
                  <div className="flex justify-between items-center">
                    <span className="text-[16px] font-medium text-slate-800">계정 설정</span>
                    <ChevronRight size={16} className="text-stone-300" />
                  </div>
                </div>
                <div className="py-4 px-5 bg-white text-rose-400 active:bg-rose-50 cursor-pointer transition-colors font-bold">
                  <span>로그아웃</span>
                </div>
              </div>
            </section>
          </div>
        );
    }
  };

  return (
    <div className="mypage-container">
      <style>{myPageStyles}</style>

      <aside className="sidebar">
        <div className="px-4 mb-10 cursor-pointer" onClick={() => handleMenuClick('dashboard')}>
          <h1 className="text-2xl font-black text-[#8BA888] tracking-tight">MINDWELL</h1>
          <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest mt-1">Mental Health Care</p>
        </div>

        <nav className="flex-1">
          <div onClick={() => handleMenuClick('dashboard')} className={`nav-item ${activeMenu === 'dashboard' ? 'active' : ''}`}>
            <LayoutDashboard size={20} />
            <span>대시보드</span>
          </div>
          {menuItems.map((item) => (
            <div key={item.id} onClick={() => handleMenuClick(item.id)} className={`nav-item ${activeMenu === item.id ? 'active' : ''}`}>
              <item.icon size={20} />
              <span>{item.label}</span>
            </div>
          ))}
        </nav>

        <div className="pt-6 border-t border-slate-100 space-y-1">
          <div className="nav-item hover:bg-stone-50">
            <Headset size={20} className="text-stone-400" />
            <span>고객센터</span>
          </div>
          <div className="nav-item text-rose-400 hover:bg-rose-50">
            <LogOut size={20} />
            <span>로그아웃</span>
          </div>
        </div>
      </aside>

      <main className="content-area">
        <header className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 sm:mb-10 gap-4">
          <div className="flex items-center gap-4 cursor-pointer" onClick={() => handleMenuClick('dashboard')}>
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white border border-stone-100 p-1 shadow-sm overflow-hidden">
              <img src="https://api.dicebear.com/7.x/notionists/svg?seed=Sohyun" alt="User" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">안녕하세요, 소현님!</h2>
              <p className="text-slate-400 text-xs sm:text-sm font-medium">마음 근육을 키운 지 42일째 되는 날이에요. 🌿</p>
            </div>
          </div>
          <button className="flex items-center justify-center gap-2 px-5 py-3 bg-white border border-stone-200 text-slate-600 rounded-xl font-bold shadow-sm hover:bg-stone-50 transition-all text-sm sm:text-base">
            <Bell size={18} className="text-[#8BA888]" />
            알림 확인
          </button>
        </header>

        {renderContent()}

        <footer className="mt-12 mb-8 text-center">
            <p className="text-[10px] font-bold text-stone-300 uppercase tracking-[0.2em]">© 2024 MINDWELL CARE</p>
        </footer>
      </main>
    </div>
  );
}