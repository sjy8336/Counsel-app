import React, { useState, useEffect } from 'react';
import { Coffee, Sparkles, ExternalLink, ChevronRight } from 'lucide-react';
import Header from '../components/header.jsx';
import Footer from '../components/footer.jsx';
import MobileTap from '../components/mobileTap.jsx';
import '../static/HealingRounge.css';

export default function HealingLounge() {
    // 차와 향 추천 데이터
    const teaAndScentContents = [
        {
            id: 1,
            mood: '숙면이 필요할 때',
            tea: '캐모마일 릴렉스 티',
            scent: '라벤더 인센스 스틱',
            description: '긴장된 근육을 이완시키고 깊은 잠으로 안내합니다.',
            glowClass: 'hr-glow-pink',
            badgeClass: 'hr-badge-pink',
        },
        {
            id: 2,
            mood: '기분 전환이 필요할 때',
            tea: '상큼한 히비스커스 티',
            scent: '시트러스 블렌딩 오일',
            description: '우울한 기분을 환기시키고 산뜻한 에너지를 채워줍니다.',
            glowClass: 'hr-glow-amber',
            badgeClass: 'hr-badge-amber',
        },
        {
            id: 3,
            mood: '깊은 명상을 할 때',
            tea: '따뜻한 우롱차',
            scent: '샌달우드(백단향)',
            description: '복잡한 생각을 비우고 내면에 집중하도록 돕습니다.',
            glowClass: 'hr-glow-green',
            badgeClass: 'hr-badge-green',
        },
    ];

    // 책 추천 데이터
    const bookContents = [
        {
            id: 1,
            title: '당신이 옳다',
            author: '정혜신',
            theme: '공감과 위로',
            coverClass: 'hr-cover-warm',
            image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=800&auto=format&fit=crop',
        },
        {
            id: 2,
            title: '만일 내가 인생을 다시 산다면',
            author: '김혜남',
            theme: '삶의 태도',
            coverClass: 'hr-cover-green',
            image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=800&auto=format&fit=crop',
        },
        {
            id: 3,
            title: '기분이 태도가 되지 않게',
            author: '레몬심리',
            theme: '감정 조절',
            coverClass: 'hr-cover-pink',
            image: 'https://images.unsplash.com/photo-1491841573634-28140fc7ced7?q=80&w=800&auto=format&fit=crop',
        },
        {
            id: 4,
            title: '마흔에 읽는 쇼펜하우어',
            author: '강용수',
            theme: '철학과 치유',
            coverClass: 'hr-cover-amber',
            image: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?q=80&w=800&auto=format&fit=crop',
        },
    ];

    // 상품 추천 데이터
    const productContents = [
        {
            id: 1,
            type: 'FOOD',
            name: '스트레스 릴리프 다크 초콜릿',
            desc: '테아닌 성분이 함유되어 긴장 완화에 도움을 줍니다.',
            overlayClass: 'hr-overlay-green',
            image: 'https://images.unsplash.com/photo-1515037893149-de7f840978e2?q=80&w=800&auto=format&fit=crop',
        },
        {
            id: 2,
            type: 'OBJECT',
            name: '무음 모래시계 15분',
            desc: '스마트폰을 내려두고 오직 나에게 집중하는 15분을 만들어보세요.',
            overlayClass: 'hr-overlay-amber',
            image: 'https://cdn.pixabay.com/photo/2015/02/01/22/37/new-year-background-620397_640.jpg',
        },
        {
            id: 3,
            type: 'OBJECT',
            name: '마인드풀니스 린넨 일기장',
            desc: '오늘의 감정을 기록하기 좋은 프리미엄 무선 노트입니다.',
            overlayClass: 'hr-overlay-pink',
            image: 'https://images.unsplash.com/photo-1531346878377-a5be20888e57?q=80&w=800&auto=format&fit=crop',
        },
        {
            id: 4,
            type: 'FOOD',
            name: '유기농 제주 무농약 귤피차',
            desc: '비타민C가 풍부하여 지친 오후 기운을 북돋아줍니다.',
            overlayClass: 'hr-overlay-green',
            image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?q=80&w=800&auto=format&fit=crop',
        },
    ];

    // 모바일/PC 구분
    const [isMobile, setIsMobile] = useState(false);
    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 1024);
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <div className="hr-root">
            {/* PC Header (hidden on mobile) */}
            {!isMobile && <Header activeTab="lounge" setActiveTab={() => {}} />}
            {/* MobileTap (only on mobile) */}
            {isMobile && <MobileTap activeTab="lounge" setActiveTab={() => {}} />}

            {/* ── 메인 ── */}
            <main className="hr-main">
                {/* 타이틀 */}
                {/* 힐링 라운지 문구와 "당신의 몸과 마음을 채우는 건강한 추천" 문구를 제거함 */}

                {/* 2. 오늘의 차와 향기 */}
                <section className="hr-section">
                    <div className="hr-tea-header">
                        <div className="hr-tea-header-text">
                            <h3 className="hr-section-title">
                                <span className="hr-section-title-text">오늘의 차와 향기</span>{' '}
                                <span style={{ display: 'inline-block', animation: 'bounce 1s infinite' }}>🍵</span>
                            </h3>
                            <p className="hr-section-subtitle">지금 당신에게 가장 필요한 감각의 휴식을 제안합니다.</p>
                        </div>
                    </div>

                    <div className="hr-tea-grid">
                        {teaAndScentContents.map((item) => (
                            <div key={item.id} className="hr-tea-card">
                                <div className={`hr-tea-card-glow ${item.glowClass}`} />
                                <span className={`hr-tea-mood-badge ${item.badgeClass}`}>{item.mood}</span>
                                <div className="hr-tea-items">
                                    <div className="hr-tea-item-row">
                                        <div className="hr-tea-icon-box hr-tea-icon-tea">
                                            <Coffee size={18} />
                                        </div>
                                        <div>
                                            <p className="hr-tea-label">Tea</p>
                                            <span className="hr-tea-name">{item.tea}</span>
                                        </div>
                                    </div>
                                    <div className="hr-tea-item-row">
                                        <div className="hr-tea-icon-box hr-tea-icon-scent">
                                            <Sparkles size={18} />
                                        </div>
                                        <div>
                                            <p className="hr-tea-label">Scent</p>
                                            <span className="hr-tea-name">{item.scent}</span>
                                        </div>
                                    </div>
                                    <div className="hr-tea-desc-box">
                                        <p className="hr-tea-desc">{item.description}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* 3. 마음을 어루만지는 책 */}
                <section className="hr-section">
                    <div className="hr-section-header">
                        <h3 className="hr-section-title hr-section-title-left">마음을 어루만지는 책 📚</h3>
                        <div className="hr-section-header-actions">
                            <span className="hr-scroll-hint">Scroll →</span>
                        </div>
                    </div>
                    <div className="hr-hscroll-outer">
                        <div className="hr-hscroll-inner hr-hscroll-inner-book hr-scrollbar-hide hr-scroll-area">
                            {bookContents.map((book) => (
                                <div key={book.id} className="hr-book-card">
                                    <div className={`hr-book-cover ${book.coverClass}`}>
                                        <img
                                            src={book.image}
                                            alt={book.title}
                                            className="hr-book-img hr-no-drag-img"
                                            loading="lazy"
                                        />
                                        <div className="hr-book-spine" />
                                    </div>
                                    <div className="hr-book-info">
                                        <span className="hr-book-theme">{book.theme}</span>
                                        <h4 className="hr-book-title">{book.title}</h4>
                                        <p className="hr-book-author">{book.author}</p>
                                    </div>
                                </div>
                            ))}
                            <div className="hr-hscroll-spacer" />
                        </div>
                    </div>
                </section>

                {/* 4. 일상의 평온을 돕는 큐레이션 */}
                <section className="hr-section">
                    <div className="hr-section-header">
                        <div className="hr-section-header-left">
                            <h3 className="hr-section-title hr-section-title-left">일상의 평온을 돕는 큐레이션 ✨</h3>
                            <p className="hr-section-subtitle-sm">당신의 공간과 시간을 더 안온하게</p>
                        </div>
                        <div className="hr-section-header-actions">
                            <span className="hr-scroll-hint">Scroll →</span>
                        </div>
                    </div>

                    <div className="hr-hscroll-outer">
                        <div className="hr-hscroll-inner hr-hscroll-inner-product hr-scrollbar-hide hr-scroll-area">
                            {productContents.map((product) => (
                                <div key={product.id} className="hr-product-card">
                                    <div className="hr-product-img-wrap">
                                        <img
                                            src={product.image}
                                            alt={product.name}
                                            className="hr-product-img hr-no-drag-img"
                                            loading="lazy"
                                        />
                                        <div className={`hr-product-overlay ${product.overlayClass}`} />
                                    </div>
                                    <div>
                                        <span className="hr-product-type">{product.type}</span>
                                        <h4 className="hr-product-name">{product.name}</h4>
                                        <p className="hr-product-desc">{product.desc}</p>
                                        <div className="hr-product-footer">
                                            <span className="hr-product-label">추천 아이템</span>
                                            <button className="hr-product-link-btn">
                                                <ExternalLink size={12} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <div className="hr-hscroll-spacer" />
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer (always visible) */}
            <Footer />
        </div>
    );
}
