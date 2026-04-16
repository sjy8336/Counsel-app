import React from 'react';
import { Bell, Search } from 'lucide-react';
import '../static/common.css'

/**
 * Header 컴포넌트
 * @param {string} activeTab - 현재 활성화된 탭 ID
 * @param {function} setActiveTab - 탭 변경 함수
 * @param {Array} pcGnbItems - PC 네비게이션 메뉴 리스트 (방어 코드를 위해 기본값 [] 설정)
 */
export default function Header({ activeTab, setActiveTab, pcGnbItems = [] }) {
    return (
        <>
        <header className="header-container">
            <div className="header-inner">
                <h1 className="logo" onClick={() => setActiveTab('home')}>
                    MINDWELL
                </h1>
            
                <nav className="pc-nav">
                    {/* pcGnbItems가 undefined일 경우를 대비해 기본값 [] 처리 및 옵셔널 체이닝 적용 */}
                    {pcGnbItems && pcGnbItems.length > 0 ? (
                    pcGnbItems.map((item) => (
                        <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
                        >
                        <span>{item.label}</span>
                        </button>
                    ))
                    ) : (
                    // 데이터가 없을 때 표시될 기본 메뉴 (선택 사항)
                    <span className="text-xs text-stone-300">메뉴를 불러오는 중...</span>
                    )}
                </nav>
                
                <div className="header-actions">
                    <button className="icon-button notification">
                    <Bell size={22} />
                        <span className="badge"></span>
                    </button>
                    <div className="user-profile">
                        <div className="avatar">
                            <img src="https://api.dicebear.com/7.x/notionists/svg?seed=Sohyun" alt="User" />
                        </div>
                        <span className="username">소현님</span>
                    </div>
                </div>
            </div>
        </header>

        {/* 모바일 검색바 */}
        <section className="mobile-search-bar">
            <div className="search-input-wrapper">
            <Search className="search-icon" size={20} />
            <input type="text" placeholder="전문가 찾기" />
            </div>
        </section>
        </>
    );
}