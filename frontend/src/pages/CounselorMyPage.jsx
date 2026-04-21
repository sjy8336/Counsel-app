import React, { useState } from 'react';
import { 
    LayoutDashboard, 
    Clock, 
    Database, 
    User, 
    Settings, 
    Bell, 
    LogOut,
    MapPin,
    Check,
    X,
    ChevronRight,
    HeadphonesIcon,
    ArrowLeft,
    Calendar,
    MessageCircle,
    Search,
    ExternalLink,
    Users,
    MessageSquare,
    AlertCircle,
    ShieldCheck,
    Clock3,
    HelpCircle,
    FileText,
    Activity,
    ClipboardList,
    Send,
    MoreVertical
} from 'lucide-react';

const App = () => {
    // 1. 상태 관리 (State)
    const [activeMenu, setActiveMenu] = useState('dashboard');
    const [currentView, setCurrentView] = useState('dashboard'); 
    const [selectedClient, setSelectedClient] = useState(null);
    const [activeChat, setActiveChat] = useState(null);

    // 2. 디자인 시스템 (Theme & Styles)
    const THEME = {
        primary: '#9BB095',      
        primaryLight: '#F3F6F2', 
        bgMain: '#F8F9FA',       
        sidebarBg: '#FFFFFF',    
        cardBg: '#FFFFFF',       
        textMain: '#222222',     
        textSub: '#888888',      
        border: '#EEEEEE',       
        danger: '#E57373',
        info: '#64B5F6'
    };

    const styles = {
        container: {
        display: 'flex',
        height: '100vh',
        backgroundColor: THEME.bgMain,
        fontFamily: '"Pretendard", -apple-system, sans-serif',
        color: THEME.textMain
        },
        sidebar: {
        width: '240px',
        backgroundColor: THEME.sidebarBg,
        borderRight: `1px solid ${THEME.border}`,
        display: 'flex',
        flexDirection: 'column',
        padding: '30px 0'
        },
        logoSection: {
        padding: '0 24px',
        marginBottom: '40px',
        cursor: 'pointer'
        },
        logoTitle: {
        fontSize: '20px',
        fontWeight: '800',
        color: THEME.primary,
        marginTop: 0,
        marginRight: 0,
        marginBottom: 0,
        marginLeft: 0,
        letterSpacing: '-0.5px'
        },
        logoSub: {
        fontSize: '11px',
        color: THEME.textSub,
        marginTop: '4px',
        fontWeight: '600'
        },
        navMenu: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
        padding: '0 12px'
        },
        navItem: (isActive) => ({
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '14px 16px',
        borderRadius: '12px',
        backgroundColor: isActive ? THEME.primaryLight : 'transparent',
        color: isActive ? THEME.primary : THEME.textSub,
        fontWeight: isActive ? '700' : '500',
        cursor: 'pointer',
        transition: 'all 0.2s',
        fontSize: '15px'
        }),
        sidebarFooter: {
        padding: '0 12px',
        borderTop: `1px solid ${THEME.border}`,
        paddingTop: '20px'
        },
        footerItem: (isActive) => ({
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '14px 16px',
        color: isActive ? THEME.primary : THEME.textSub,
        fontSize: '14px',
        cursor: 'pointer',
        backgroundColor: isActive ? THEME.primaryLight : 'transparent',
        borderRadius: '12px',
        marginBottom: '4px'
        }),
        main: {
        flex: 1,
        padding: '40px 60px',
        overflowY: 'auto'
        },
        header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '40px'
        },
        profileSection: {
        display: 'flex',
        alignItems: 'center',
        gap: '16px'
        },
        profileImg: {
        width: '56px',
        height: '56px',
        borderRadius: '20px',
        backgroundColor: '#F0F0F0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '24px'
        },
        welcomeText: {
        fontSize: '22px',
        fontWeight: '800',
        marginTop: 0,
        marginRight: 0,
        marginBottom: 0,
        marginLeft: 0
        },
        welcomeSub: {
        fontSize: '14px',
        color: THEME.textSub,
        marginTop: '4px',
        marginRight: 0,
        marginBottom: 0,
        marginLeft: 0
        },
        notifBtn: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '10px 20px',
        borderRadius: '12px',
        border: `1px solid ${THEME.border}`,
        backgroundColor: THEME.sidebarBg,
        fontSize: '14px',
        fontWeight: '600',
        color: '#444',
        cursor: 'pointer'
        },
        statsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '24px',
        marginBottom: '32px'
        },
        statCard: {
        backgroundColor: THEME.cardBg,
        padding: '24px',
        borderRadius: '24px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
        border: `1px solid ${THEME.border}`,
        position: 'relative',
        cursor: 'pointer',
        transition: 'transform 0.2s'
        },
        statIcon: (color) => ({
        width: '36px',
        height: '36px',
        borderRadius: '10px',
        backgroundColor: color,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '16px',
        color: '#FFF'
        }),
        statLabel: {
        fontSize: '13px',
        color: THEME.textSub,
        fontWeight: '600',
        marginBottom: '8px'
        },
        statValue: {
        fontSize: '24px',
        fontWeight: '800'
        },
        banner: {
        backgroundColor: THEME.primary,
        borderRadius: '30px',
        padding: '36px 40px',
        color: '#FFF',
        marginBottom: '40px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 10px 30px rgba(155, 176, 149, 0.2)',
        cursor: 'pointer',
        transition: 'transform 0.2s ease'
        },
        bannerLabel: {
        fontSize: '12px',
        fontWeight: '700',
        backgroundColor: 'rgba(255,255,255,0.2)',
        padding: '4px 12px',
        borderRadius: '20px',
        width: 'fit-content',
        marginBottom: '16px'
        },
        bannerTitle: {
        fontSize: '32px',
        fontWeight: '800',
        marginTop: 0,
        marginRight: 0,
        marginBottom: '12px',
        marginLeft: 0
        },
        bannerSub: {
        fontSize: '16px',
        opacity: 0.9,
        marginTop: 0,
        marginRight: 0,
        marginBottom: 0,
        marginLeft: 0
        },
        bannerBtn: {
        backgroundColor: '#FFF',
        color: THEME.textMain,
        border: 'none',
        padding: '14px 24px',
        borderRadius: '16px',
        fontWeight: '700',
        fontSize: '14px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        cursor: 'pointer'
        },
        sectionHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px'
        },
        sectionTitle: {
        fontSize: '18px',
        fontWeight: '800',
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
        },
        listCard: {
        backgroundColor: THEME.cardBg,
        borderRadius: '24px',
        border: `1px solid ${THEME.border}`,
        padding: '8px 0'
        },
        listItem: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '20px 24px',
        borderBottom: `1px solid ${THEME.border}`,
        cursor: 'pointer',
        transition: 'background-color 0.2s ease'
        },
        itemInfo: {
        display: 'flex',
        alignItems: 'center',
        gap: '16px'
        },
        itemAvatar: {
        width: '40px',
        height: '40px',
        borderRadius: '14px',
        backgroundColor: '#F8F9FA',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: THEME.textSub
        },
        itemName: {
        fontSize: '16px',
        fontWeight: '700',
        marginTop: 0,
        marginRight: 0,
        marginBottom: 0,
        marginLeft: 0
        },
        itemSub: {
        fontSize: '13px',
        color: THEME.textSub,
        marginTop: '2px',
        marginRight: 0,
        marginBottom: 0,
        marginLeft: 0
        },
        badge: (status) => ({
        fontSize: '11px',
        fontWeight: '700',
        padding: '4px 10px',
        borderRadius: '8px',
        backgroundColor: status === '상담 완료' || status === '확인' ? '#F0F0F0' : THEME.primaryLight,
        color: status === '상담 완료' || status === '확인' ? THEME.textSub : THEME.primary
        }),
        requestGrid: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '20px',
        marginTop: '20px'
        },
        detailTitle: {
        fontSize: '28px',
        fontWeight: '800',
        color: THEME.textMain,
        marginTop: 0,
        marginRight: 0,
        marginBottom: '8px',
        marginLeft: 0
        },
        detailSub: {
        fontSize: '15px',
        color: THEME.textSub,
        marginTop: 0,
        marginRight: 0,
        marginBottom: 0,
        marginLeft: 0
        },
        detailCard: {
        backgroundColor: THEME.cardBg,
        borderRadius: '24px',
        border: `1px solid ${THEME.border}`,
        padding: '32px',
        marginBottom: '24px'
        },
        input: {
        width: '100%',
        padding: '14px 20px',
        borderRadius: '14px',
        border: `1px solid ${THEME.border}`,
        fontSize: '15px',
        marginBottom: '20px',
        boxSizing: 'border-box',
        outline: 'none',
        backgroundColor: '#F9F9F9'
        },
        btnAccept: {
        flex: 1,
        backgroundColor: THEME.primary,
        color: '#FFF',
        border: 'none',
        padding: '12px',
        borderRadius: '12px',
        fontWeight: '700',
        fontSize: '14px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '4px'
        },
        btnDecline: {
        flex: 1,
        backgroundColor: '#F8F9FA',
        color: THEME.textSub,
        border: 'none',
        padding: '12px',
        borderRadius: '12px',
        fontWeight: '700',
        fontSize: '14px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '4px'
        },
        historyItem: {
        padding: '24px',
        borderBottom: `1px solid ${THEME.border}`,
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
        },
        historyHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
        },
        chatContainer: {
        display: 'flex',
        flexDirection: 'column',
        height: 'calc(100vh - 200px)',
        backgroundColor: THEME.cardBg,
        borderRadius: '24px',
        border: `1px solid ${THEME.border}`,
        overflow: 'hidden'
        },
        chatHeader: {
        padding: '20px 24px',
        borderBottom: `1px solid ${THEME.border}`,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#FFF'
        },
        chatBody: {
        flex: 1,
        padding: '24px',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        backgroundColor: '#FBFBFB'
        },
        chatFooter: {
        padding: '16px 24px',
        borderTop: `1px solid ${THEME.border}`,
        display: 'flex',
        gap: '12px',
        alignItems: 'center'
        },
        msgBubble: (isMe) => ({
        maxWidth: '70%',
        padding: '14px 18px',
        borderRadius: isMe ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
        backgroundColor: isMe ? THEME.primary : '#FFF',
        color: isMe ? '#FFF' : THEME.textMain,
        fontSize: '15px',
        lineHeight: '1.5',
        alignSelf: isMe ? 'flex-end' : 'flex-start',
        boxShadow: isMe ? 'none' : '0 2px 8px rgba(0,0,0,0.05)',
        border: isMe ? 'none' : `1px solid ${THEME.border}`
        })
    };

    // 3. Mock 데이터 (Mock Data)
    const todaySchedules = [
        { id: 1, time: '10:00', name: '김소현', type: '대면 상담', room: '상담 1실', status: '상담 예정', note: '대인관계 갈등 심화', age: '24세', gender: '여성' },
        { id: 2, time: '14:00', name: '이민준', type: '대면 상담', room: '상담 3실', status: '상담 예정', note: '직장 스트레스', age: '31세', gender: '남성' },
        { id: 3, time: '16:30', name: '박지영', type: '대면 상담', room: '상담 2실', status: '상담 완료', note: '불안 증세 완화 중', age: '29세', gender: '여성' },
    ];

    const clientConsultationHistory = [
        { id: 501, date: '2024.05.10', session: '11회차', type: '대면', title: '자존감 향상 및 자기 수용', content: '지난 과제였던 자기 긍정 일기를 성실히 작성함. 사회적 상황에서의 회피 반응이 소폭 감소한 것으로 보임.' },
        { id: 502, date: '2024.04.26', session: '10회차', type: '화상', title: '가족 관계 내 경계 설정', content: '부모님과의 갈등 상황에서 자신의 감정을 차분하게 전달하는 연습을 진행함. 정서적 독립에 대한 욕구가 강해짐.' },
        { id: 503, date: '2024.04.12', session: '9회차', type: '대면', title: '초기 불안 증세 조절', content: '호흡 명상을 통해 신체화 증상을 완화하는 기법을 익힘. 수면의 질이 이전보다 개선되었다고 보고함.' }
    ];

    const pendingRequests = [
        { id: 101, name: '정현우', date: '2024.05.25', topic: '무기력증 및 우울감', age: '32세', gender: '남성' },
        { id: 102, name: '한수지', date: '2024.05.26', topic: '사회적 불안 장애', age: '26세', gender: '여성' }
    ];

    const unreadMessages = [
        { id: 201, name: '최유진', content: '선생님, 오늘 숙제 다 했어요!', time: '10분 전' },
        { id: 202, name: '김소현', content: '상담실 위치가 바뀐 건가요?', time: '35분 전' },
        { id: 203, name: '이민준', content: '오늘 조금 늦을 것 같습니다.', time: '1시간 전' },
    ];

    const notificationList = [
        { id: 301, title: '시스템 공지', content: '내일 오후 2시부터 서버 점검이 예정되어 있습니다.', time: '오전 09:00', type: 'notice' },
        { id: 302, title: '예약 확정', content: '한수지 님의 대면 상담이 승인되었습니다.', time: '어제', type: 'booking' },
        { id: 303, title: '메시지 도착', content: '김소현 님으로부터 새로운 메시지가 도착했습니다.', time: '2일 전', type: 'msg', sender: '김소현' }
    ];

    const clientCharts = [
        { id: 1, name: '김소현', age: '24세', lastVisit: '2024.05.20', count: 12, condition: '주의' },
        { id: 2, name: '이민준', age: '31세', lastVisit: '2024.05.21', count: 4, condition: '양호' },
        { id: 3, name: '박지영', age: '29세', lastVisit: '2024.05.15', count: 8, condition: '집중관리' },
        { id: 4, name: '정현우', age: '32세', lastVisit: '2024.05.22', count: 1, condition: '신규' }
    ];

    // 4. 핸들러 함수 (Handlers)
    const goHome = () => {
        setActiveMenu('dashboard');
        setCurrentView('dashboard');
        setSelectedClient(null);
        setActiveChat(null);
    };

    // 5. 공통 서브 컴포넌트 (Sub-components)
    const SimpleHeader = ({ title, sub }) => (
        <div style={{ animation: 'fadeIn 0.3s ease-in', marginBottom: '32px' }}>
        <h2 style={styles.detailTitle}>{title}</h2>
        <p style={styles.detailSub}>{sub}</p>
        </div>
    );

    // 6. 렌더링 함수들 (Render Functions)
    const renderChatView = () => (
    <>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', cursor: 'pointer' }} onClick={() => setCurrentView('notifications')}>
            <ArrowLeft size={20} />
            <span style={{ fontWeight: '600' }}>알림으로 돌아가기</span>
        </div>
        <div style={styles.chatContainer}>
            <div style={styles.chatHeader}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ ...styles.itemAvatar, backgroundColor: THEME.primaryLight }}>👤</div>
                <div>
                <p style={{ ...styles.itemName, fontSize: '15px' }}>{activeChat?.sender || '내담자'}</p>
                <p style={{ ...styles.itemSub, fontSize: '12px', color: THEME.primary }}>현재 온라인</p>
                </div>
            </div>
            <MoreVertical size={20} color={THEME.textSub} />
            </div>
            <div style={styles.chatBody}>
            <div style={{ alignSelf: 'center', backgroundColor: '#EEE', padding: '4px 12px', borderRadius: '12px', fontSize: '11px', color: '#888', marginTop: '10px', marginBottom: '10px' }}>2024년 5월 22일</div>
            <div style={styles.msgBubble(false)}>안녕하세요 선생님! 다름이 아니라 상담실 위치가 바뀐 건지 여쭤보려고요.</div>
            <div style={{ alignSelf: 'flex-start', fontSize: '11px', color: '#BBB', marginLeft: '4px' }}>오후 2:15</div>
            
            <div style={styles.msgBubble(true)}>네, 소현 님! 이번 주부터는 2층 1실이 아니라 3층 4실에서 진행하게 되었습니다. 안내 문자가 늦었네요.</div>
            <div style={{ alignSelf: 'flex-end', fontSize: '11px', color: '#BBB', marginRight: '4px' }}>오후 2:20</div>

            <div style={styles.msgBubble(false)}>아하 확인했습니다! 3층으로 갈게요. 감사합니다.</div>
            <div style={{ alignSelf: 'flex-start', fontSize: '11px', color: '#BBB', marginLeft: '4px' }}>오후 2:22</div>
            </div>
            <div style={styles.chatFooter}>
            <input 
                style={{ ...styles.input, marginBottom: 0, padding: '12px 20px', borderRadius: '24px', backgroundColor: '#F5F5F5' }} 
                placeholder="메시지를 입력하세요..." 
            />
            <button style={{ ...styles.btnAccept, flex: 'none', width: '44px', height: '44px', borderRadius: '50%' }}>
                <Send size={18} />
            </button>
            </div>
        </div>
        </>
    );

    const renderNotifications = () => (
        <>
        <SimpleHeader title="알림 센터" sub="최근 발생한 소식을 확인하세요." />
        <div style={styles.listCard}>
            {notificationList.map(item => (
            <div 
                key={item.id} 
                style={styles.listItem}
                onClick={() => {
                if (item.type === 'msg') {
                    setActiveChat(item);
                    setCurrentView('directChat');
                }
                }}
            >
                <div style={styles.itemInfo}>
                <div style={{...styles.itemAvatar, backgroundColor: THEME.primaryLight, color: THEME.primary}}>
                    {item.type === 'notice' ? <AlertCircle size={20} /> : item.type === 'booking' ? <Calendar size={20} /> : <MessageSquare size={20} />}
                </div>
                <div>
                    <p style={styles.itemName}>{item.title}</p>
                    <p style={styles.itemSub}>{item.content}</p>
                </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <p style={{fontSize:'12px', color:THEME.textSub}}>{item.time}</p>
                <ChevronRight size={16} color={THEME.textSub} />
                </div>
            </div>
            ))}
        </div>
        </>
    );

    const renderDashboard = () => (
    <>
        <header style={styles.header}>
            <div style={styles.profileSection}>
            <div style={styles.profileImg}>🧔‍♂️</div>
            <div>
                <h2 style={styles.welcomeText}>안녕하세요, 이은지 상담사님!</h2>
                <p style={styles.welcomeSub}>오늘 예정된 대면 상담은 3건입니다. 센터 환경을 점검해 주세요. 🌿</p>
            </div>
            </div>
            <button style={styles.notifBtn} onClick={() => setCurrentView('notifications')}>
            <Bell size={18} />
            알림 확인
            </button>
        </header>

        <div style={styles.statsGrid}>
            <div style={styles.statCard} onClick={() => { setActiveMenu('history'); setCurrentView('scheduleDetail'); }}>
            <div style={styles.statIcon('#E8F5E9')}><Calendar size={18} color="#66BB6A" /></div>
            <p style={styles.statLabel}>오늘 예정 상담</p>
            <p style={styles.statValue}>3 건</p>
            <ChevronRight size={16} style={{position:'absolute', right:'24px', bottom:'24px', color:THEME.textSub}} />
            </div>
            <div style={styles.statCard} onClick={() => { setActiveMenu('report'); setCurrentView('pendingDetail'); }}>
            <div style={styles.statIcon('#FFF5E6')}><Clock size={18} color="#FFB74D" /></div>
            <p style={styles.statLabel}>승인 대기 요청</p>
            <p style={styles.statValue}>2 건</p>
            <ChevronRight size={16} style={{position:'absolute', right:'24px', bottom:'24px', color:THEME.textSub}} />
            </div>
            <div style={styles.statCard} onClick={() => { setCurrentView('messageDetail'); }}>
            <div style={styles.statIcon('#FFEBEE')}><MessageCircle size={18} color="#EF5350" /></div>
            <p style={styles.statLabel}>읽지 않은 메시지</p>
            <p style={styles.statValue}>5 건</p>
            <ChevronRight size={16} style={{position:'absolute', right:'24px', bottom:'24px', color:THEME.textSub}} />
            </div>
        </div>

        <div style={styles.banner} onClick={() => { setActiveMenu('payment'); setCurrentView('dashboard'); }}>
            <div>
            <div style={styles.bannerLabel}>NEXT SESSION</div>
            <h3 style={styles.bannerTitle}>오후 2:00 이민준 님</h3>
            <p style={styles.bannerSub}>대면 상담 • 상담 3실 • 4회차 진행 예정</p>
            </div>
            <button style={styles.bannerBtn}>
            내담자 차트 확인 <ChevronRight size={18} />
            </button>
        </div>

        <div style={styles.sectionHeader}>
            <h3 style={styles.sectionTitle}><Clock size={22} /> 오늘의 상담 일정</h3>
        </div>
        <div style={styles.listCard}>
            {todaySchedules.map((item, idx) => (
            <div key={item.id} style={{...styles.listItem, borderBottom: idx === todaySchedules.length -1 ? 'none' : styles.listItem.borderBottom}} onClick={() => { setSelectedClient(item); setCurrentView('clientHistory'); }}>
                <div style={styles.itemInfo}>
                <div style={{...styles.itemAvatar, width: '50px', fontWeight: '800'}}>{item.time}</div>
                <div>
                    <p style={styles.itemName}>{item.name} 님 <span style={{fontSize: '12px', color: THEME.textSub, fontWeight: 'normal'}}>| {item.room}</span></p>
                    <p style={{...styles.itemSub, color: THEME.primary, fontWeight: '600'}}>{item.note}</p>
                </div>
                </div>
                <div style={{display:'flex', alignItems:'center', gap:'8px', color:THEME.textSub, fontSize:'13px'}}>
                <MapPin size={14} /> 대면 상담
                </div>
            </div>
            ))}
        </div>
        </>
    );

    const renderContent = () => {
    if (currentView === 'notifications') return renderNotifications();
    if (currentView === 'clientHistory') return (
        <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
            <div style={{ ...styles.profileImg, width: '64px', height: '64px' }}>👤</div>
            <div>
                <h2 style={{ ...styles.detailTitle, marginBottom: '4px' }}>{selectedClient?.name} 내담자 기록</h2>
                <p style={styles.detailSub}>{selectedClient?.gender} / {selectedClient?.age} • 현재 12회차 진행 중</p>
            </div>
            </div>
    
            <div style={styles.statsGrid}>
            <div style={{ ...styles.statCard, padding: '20px' }}>
                <p style={styles.statLabel}>총 상담 횟수</p>
                <p style={{ ...styles.statValue, fontSize: '20px' }}>12회</p>
            </div>
            <div style={{ ...styles.statCard, padding: '20px' }}>
                <p style={styles.statLabel}>주요 호소 문제</p>
                <p style={{ ...styles.statValue, fontSize: '15px' }}>대인관계 스트레스</p>
            </div>
            <div style={{ ...styles.statCard, padding: '20px' }}>
                <p style={styles.statLabel}>상태 분류</p>
                <span style={{ ...styles.badge('주의'), display: 'inline-block', marginTop: '4px' }}>주의 관찰</span>
            </div>
            </div>
    
            <div style={styles.sectionHeader}>
            <h3 style={styles.sectionTitle}><ClipboardList size={22} /> 상담 기록 리스트</h3>
            </div>
    
            <div style={styles.listCard}>
            {clientConsultationHistory.map((history, idx) => (
                <div key={history.id} style={{ ...styles.historyItem, borderBottom: idx === clientConsultationHistory.length - 1 ? 'none' : styles.historyItem.borderBottom }}>
                <div style={styles.historyHeader}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '15px', fontWeight: '800', color: THEME.primary }}>{history.session}</span>
                    <span style={{ fontSize: '14px', color: THEME.textSub }}>|</span>
                    <span style={{ fontSize: '15px', fontWeight: '700' }}>{history.title}</span>
                    </div>
                    <span style={{ fontSize: '13px', color: THEME.textSub }}>{history.date} ({history.type})</span>
                </div>
                <p style={{ fontSize: '14px', color: '#555', lineHeight: '1.6', marginTop: 0, marginRight: 0, marginBottom: 0, marginLeft: 0, backgroundColor: '#F9FAFB', padding: '16px', borderRadius: '12px' }}>
                    {history.content}
                </p>
                </div>
            ))}
            </div>
        </>
    );
    if (currentView === 'directChat') return renderChatView();
    if (currentView === 'messageDetail') return (
        <>
            <SimpleHeader title="메시지함" sub="내담자들과의 최근 대화 내용을 확인하세요." />
            <div style={styles.listCard}>
            {unreadMessages.map((msg) => (
                <div key={msg.id} style={styles.listItem} onClick={() => { setActiveChat({ sender: msg.name }); setCurrentView('directChat'); }}>
                <div style={styles.itemInfo}>
                    <div style={{...styles.itemAvatar, color: THEME.primary}}><MessageSquare size={20} /></div>
                    <div>
                    <p style={styles.itemName}>{msg.name} 님</p>
                    <p style={styles.itemSub}>{msg.content}</p>
                    </div>
                </div>
                <p style={{fontSize:'12px', color:THEME.textSub}}>{msg.time}</p>
                </div>
            ))}
            </div>
        </>
    );

    switch (activeMenu) {
    case 'dashboard': return renderDashboard();
    case 'history': return (
        <>
            <SimpleHeader title="오늘 예정 상담 상세" sub="상담 일정을 클릭하면 해당 내담자의 상세 기록을 볼 수 있습니다." />
            <div style={styles.listCard}>
            {todaySchedules.map((item, idx) => (
                <div 
                key={item.id} 
                onClick={() => {
                    setSelectedClient(item);
                    setCurrentView('clientHistory');
                }}
                style={{...styles.listItem, borderBottom: idx === todaySchedules.length -1 ? 'none' : styles.listItem.borderBottom}}
                >
                <div style={styles.itemInfo}>
                    <div style={{...styles.itemAvatar, width: '60px', color: THEME.primary, fontWeight: '800'}}>{item.time}</div>
                    <div>
                    <p style={styles.itemName}>{item.name} 내담자 <span style={{fontSize:'13px', color:THEME.textSub, fontWeight:'400'}}>( {item.room} )</span></p>
                    <p style={{...styles.itemSub, display: 'flex', alignItems: 'center', gap: '4px'}}><MapPin size={14} /> 대면 상담</p>
                    </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={styles.badge(item.status)}>{item.status}</span>
                    <ChevronRight size={18} color={THEME.textSub} />
                </div>
                </div>
            ))}
            </div>
        </>
    );
    case 'payment': return (
        <>
            <SimpleHeader title="내담자 차트 데이터베이스" sub="관리 중인 내담자의 상담 이력과 상태를 관리합니다." />
            <div style={{position:'relative', marginBottom:'24px'}}>
            <input style={{...styles.input, marginTop: 0, marginRight: 0, marginBottom: '0px', marginLeft: 0}} placeholder="내담자 이름 혹은 연락처로 검색하세요." />
            <Search size={20} style={{position:'absolute', right:'20px', top:'14px', color:THEME.textSub}} />
            </div>
            <div style={styles.listCard}>
            {clientCharts.map(client => (
                <div key={client.id} style={styles.listItem} onClick={() => { setSelectedClient(client); setCurrentView('clientHistory'); }}>
                <div style={styles.itemInfo}>
                    <div style={styles.itemAvatar}><User size={20} /></div>
                    <div>
                    <p style={styles.itemName}>{client.name} ({client.age})</p>
                    <p style={styles.itemSub}>최근 방문: {client.lastVisit} | 총 {client.count}회 상담</p>
                    </div>
                </div>
                <div style={{display:'flex', alignItems:'center', gap:'12px'}}>
                    <span style={{...styles.badge(client.condition), backgroundColor: client.condition === '주의' ? '#FFF9C4' : client.condition === '집중관리' ? '#FFEBEE' : '#F0F0F0'}}>{client.condition}</span>
                    <ChevronRight size={18} color={THEME.textSub} />
                </div>
                </div>
            ))}
            </div>
        </>
        );
        case 'report': return (
            <>
            <SimpleHeader title="승인 대기 요청 상세" sub="새로운 상담 신청 내역을 검토하세요." />
            <div style={styles.requestGrid}>
                {pendingRequests.map(req => (
                <div key={req.id} style={styles.detailCard}>
                    <div style={{display:'flex', justifyContent:'space-between', marginBottom:'16px'}}>
                    <h4 style={{fontSize:'18px', fontWeight:'800', marginTop: 0, marginRight: 0, marginBottom: 0, marginLeft: 0}}>{req.name} ({req.gender}, {req.age})</h4>
                    <span style={styles.badge('신청')}>대기중</span>
                    </div>
                    <p style={{fontSize:'14px', color:THEME.textSub, marginTop: 0, marginRight: 0, marginBottom: '8px', marginLeft: 0}}>신청일: {req.date}</p>
                    <p style={{fontSize:'15px', fontWeight:'700', color:THEME.primary, marginTop: 0, marginRight: 0, marginBottom: '24px', marginLeft: 0}}>"{req.topic}"</p>
                    <div style={{display:'flex', gap:'8px'}}>
                    <button style={styles.btnAccept}><Check size={16} /> 수락</button>
                    <button style={styles.btnDecline}><X size={16} /> 반려</button>
                    </div>
                </div>
                ))}
            </div>
            </>
        );
      case 'settings': return (
        <>
            <SimpleHeader title="시스템 설정" sub="관리자 프로필 및 센터 운영 환경을 설정합니다." />
            <div style={styles.detailCard}>
            <h4 style={{fontSize:'18px', fontWeight:'800', marginTop: 0, marginRight: 0, marginBottom: '20px', marginLeft: 0}}>내 프로필 설정</h4>
            <div style={{display:'flex', gap:'24px', alignItems:'center', marginBottom:'30px'}}>
                <div style={{...styles.profileImg, width:'80px', height:'80px', fontSize:'32px'}}>🧔‍♂️</div>
                <div style={{flex:1}}>
                <p style={{fontSize:'14px', fontWeight:'700', marginTop: 0, marginRight: 0, marginBottom: '8px', marginLeft: 0}}>상담사 성함</p>
                <input style={{...styles.input, marginTop: 0, marginRight: 0, marginBottom: '0px', marginLeft: 0}} defaultValue="이은지" />
                </div>
            </div>
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'20px', marginBottom:'20px'}}>
                <div>
                <p style={{fontSize:'14px', fontWeight:'700', marginTop: 0, marginRight: 0, marginBottom: '8px', marginLeft: 0}}>전문 분야</p>
                <input style={{...styles.input, marginTop: 0, marginRight: 0, marginBottom: '0px', marginLeft: 0}} defaultValue="성인 우울, 불안 장애" />
                </div>
                <div>
                <p style={{fontSize:'14px', fontWeight:'700', marginTop: 0, marginRight: 0, marginBottom: '8px', marginLeft: 0}}>소속 센터</p>
                <input style={{...styles.input, marginTop: 0, marginRight: 0, marginBottom: '0px', marginLeft: 0}} defaultValue="마인드웰 서울 강남센터" />
                </div>
            </div>
            <button style={{...styles.btnAccept, maxWidth:'120px'}}>저장하기</button>
            </div>
        </>
        );
        case 'customer': return (
            <>
            <SimpleHeader title="고객 지원" sub="이용 중 불편한 점이 있으신가요?" />
            <div style={styles.statsGrid}>
                <div style={{...styles.statCard, textAlign:'center'}}>
                <div style={{...styles.statIcon(THEME.primaryLight), marginTop: 0, marginRight: 'auto', marginBottom: '12px', marginLeft: 'auto', color:THEME.primary}}><HelpCircle size={24} /></div>
                <p style={{fontWeight:'700', marginTop: 0, marginRight: 0, marginBottom: 0, marginLeft: 0}}>자주 묻는 질문</p>
                </div>
                <div style={{...styles.statCard, textAlign:'center'}}>
                <div style={{...styles.statIcon(THEME.primaryLight), marginTop: 0, marginRight: 'auto', marginBottom: '12px', marginLeft: 'auto', color:THEME.primary}}><MessageCircle size={24} /></div>
                <p style={{fontWeight:'700', marginTop: 0, marginRight: 0, marginBottom: 0, marginLeft: 0}}>1:1 문의하기</p>
                </div>
                <div style={{...styles.statCard, textAlign:'center'}}>
                <div style={{...styles.statIcon(THEME.primaryLight), marginTop: 0, marginRight: 'auto', marginBottom: '12px', marginLeft: 'auto', color:THEME.primary}}><FileText size={24} /></div>
                <p style={{fontWeight:'700', marginTop: 0, marginRight: 0, marginBottom: 0, marginLeft: 0}}>가이드북</p>
                </div>
            </div>
            </>
        );
        default: return renderDashboard();
        }
    };

    // 7. 최종 메인 렌더링 (Main Render)
    return (
        <div style={styles.container}>
        <style>{`
            @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        `}</style>
        
        <aside style={styles.sidebar}>
            <div style={styles.logoSection} onClick={goHome}>
            <h1 style={styles.logoTitle}>MINDWELL</h1>
            <p style={styles.logoSub}>COUNSELOR ADMIN</p>
            </div>
            
            <nav style={styles.navMenu}>
            {[
                { id: 'dashboard', icon: <LayoutDashboard size={20} />, label: '대시보드' },
                { id: 'history', icon: <Clock size={20} />, label: '오늘의 일정' },
                { id: 'payment', icon: <Database size={20} />, label: '내담자 차트' },
                { id: 'report', icon: <User size={20} />, label: '신규 접수' },
                { id: 'settings', icon: <Settings size={20} />, label: '설정' }
            ].map(item => (
                <div 
                key={item.id} 
                onClick={() => { 
                    setActiveMenu(item.id); 
                    setSelectedClient(null);
                    setActiveChat(null);
                    if(item.id === 'history') setCurrentView('scheduleDetail');
                    else setCurrentView('dashboard');
                }}
                style={styles.navItem(activeMenu === item.id)}
                >
                {item.icon}
                <span>{item.label}</span>
                </div>
            ))}
            </nav>

            <div style={styles.sidebarFooter}>
            <div 
                style={styles.footerItem(activeMenu === 'customer')} 
                onClick={() => { setActiveMenu('customer'); setCurrentView('dashboard'); setSelectedClient(null); setActiveChat(null); }}
            >
                <HeadphonesIcon size={20} />
                <span>고객센터</span>
            </div>
            <div style={{...styles.footerItem(false), color: THEME.danger}}>
                <LogOut size={20} />
                <span>로그아웃</span>
            </div>
            </div>
        </aside>

        <main style={styles.main}>
            {renderContent()}
        </main>
        </div>
    );
};

export default App;