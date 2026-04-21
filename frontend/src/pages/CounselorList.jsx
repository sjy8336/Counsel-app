import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, User, MapPin } from 'lucide-react'; // Video 제거
import Header from '../components/header';
import Footer from '../components/footer';
import '../static/Counselor.css';

const counselorData = [
    { id: 1, name: "이은지 상담사", category: "개인 심리", field: "우울, 불안, 공황", type: "대면", price: "60,000원", intro: "감정 일기 분석을 통해 당신의 마음을 함께 들여다봅니다." },
    { id: 2, name: "김태현 상담사", category: "직장", field: "스트레스, 번아웃", type: "대면", price: "60,000원", intro: "직장 내 대인관계와 커리어 고민에 솔루션을 드립니다." },
    { id: 3, name: "박소담 상담사", category: "진로", field: "취업불안, 진로고민", type: "대면", price: "60,000원", intro: "나를 사랑하는 법, 작은 기록부터 시작해봐요." },
    { id: 4, name: "정다은 상담사", category: "개인 심리", field: "자존감, 강박", type: "대면", price: "60,000원", intro: "막막한 미래, 당신의 강점을 찾는 솔루션을 제공합니다." },
    { id: 5, name: "한지우 상담사", category: "직장", field: "소통, 대인관계", type: "대면", price: "60,000원", intro: "오늘의 감정이 내일의 평온이 되도록 돕겠습니다." },
    { id: 6, name: "최민준 상담사", category: "진로", field: "진로고민, 번아웃", type: "대면", price: "60,000원", intro: "지친 마음을 회복하고 다시 나아갈 힘을 드립니다." },
];

export default function CounselorListPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('전체');
    const navigate = useNavigate();

    const filteredCounselors = counselorData.filter(c => {
        const matchesSearch = c.name.includes(searchTerm) || c.field.includes(searchTerm);
        const matchesCategory = selectedCategory === '전체' || c.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="full-page-wrapper">
            <Header activeTab="search" setActiveTab={() => {}} />
            <div className="counselor-list-container wide">
                <header className="search-header">
                    <h2 className="search-title">전문가 찾기</h2>
                    <div className="search-bar-wrapper">
                        <Search className="search-icon" size={20} />
                        <input 
                            type="text" 
                            className="search-input" 
                            placeholder="이름 혹은 고민 중인 분야를 입력하세요"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="category-tabs">
                        {['전체', '개인 심리', '직장', '진로'].map(cat => (
                            <button 
                                key={cat} 
                                className={`category-btn ${selectedCategory === cat ? 'active' : ''}`}
                                onClick={() => setSelectedCategory(cat)}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </header>

                <main className="counselor-grid pc-full">
                    {filteredCounselors.map(counselor => (
                        <div key={counselor.id} className="counselor-card" onClick={() => navigate(`/counselor/${counselor.id}`)}>
                            <div className="card-top">
                                <div className="profile-placeholder"><User size={32} /></div>
                                {/* 비대면 로직 제거, 대면 전용 뱃지 */}
                                <div className="type-badge" data-type="대면">
                                    <MapPin size={14} /> {counselor.type}
                                </div>
                            </div>
                            <div className="card-body">
                                <span className="counselor-category-label">{counselor.category}</span>
                                <h3 className="counselor-name">{counselor.name}</h3>
                                <span className="counselor-field-tags">{counselor.field}</span>
                                <p className="counselor-intro">{counselor.intro}</p>
                            </div>
                            <div className="card-footer">
                                <span className="price-info">{counselor.price} / 50분</span>
                                <button className="view-detail-btn">상세보기</button>
                            </div>
                        </div>
                    ))}
                </main>
            </div>
            <Footer/>
        </div>
    );
}