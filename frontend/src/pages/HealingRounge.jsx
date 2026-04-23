import React, { useState, useEffect } from 'react';
import {
  Bell,
  Heart,
  Menu,
  Gift,
  Coffee,
  Sparkles,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import '../static/HealingRounge.css';

export default function HealingLounge() {
  const [currentBanner, setCurrentBanner] = useState(0);

  // 이벤트 배너 데이터
  const banners = [
    {
      id: 1,
      tag: '가정의 달 EVENT',
      title: '심리 검사 & 전문가 코칭 50% 할인',
      desc: '바쁘게 달려온 나에게 다정한 위로를 건네보세요.',
      gradClass: 'mw-banner-grad-1',
      date: '~ 5월 31일까지',
    },
    {
      id: 2,
      tag: '신규 회원 혜택',
      title: '첫 명상 가이드 무료 체험권 증정',
      desc: '지금 가입하고 1,000여 개의 힐링 콘텐츠를 만나보세요.',
      gradClass: 'mw-banner-grad-2',
      date: '상시 진행',
    },
    {
      id: 3,
      tag: '커뮤니티 이벤트',
      title: '마음 일기 챌린지 7일 성공 시 선물',
      desc: '매일 한 문장, 나를 기록하고 친환경 굿즈를 받으세요.',
      gradClass: 'mw-banner-grad-3',
      date: '~ 6월 15일까지',
    },
  ];

  // 배너 자동 슬라이드 (3초)
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % banners.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [banners.length]);

  // 차와 향 추천 데이터
  const teaAndScentContents = [
    {
      id: 1,
      mood: '숙면이 필요할 때',
      tea: '캐모마일 릴렉스 티',
      scent: '라벤더 인센스 스틱',
      description: '긴장된 근육을 이완시키고 깊은 잠으로 안내합니다.',
      glowClass: 'mw-glow-pink',
      badgeClass: 'mw-badge-pink',
    },
    {
      id: 2,
      mood: '기분 전환이 필요할 때',
      tea: '상큼한 히비스커스 티',
      scent: '시트러스 블렌딩 오일',
      description: '우울한 기분을 환기시키고 산뜻한 에너지를 채워줍니다.',
      glowClass: 'mw-glow-amber',
      badgeClass: 'mw-badge-amber',
    },
    {
      id: 3,
      mood: '깊은 명상을 할 때',
      tea: '따뜻한 우롱차',
      scent: '샌달우드(백단향)',
      description: '복잡한 생각을 비우고 내면에 집중하도록 돕습니다.',
      glowClass: 'mw-glow-green',
      badgeClass: 'mw-badge-green',
    },
  ];

  // 책 추천 데이터
  const bookContents = [
    {
      id: 1,
      title: '당신이 옳다',
      author: '정혜신',
      theme: '공감과 위로',
      coverClass: 'mw-cover-warm',
      image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=800&auto=format&fit=crop',
    },
    {
      id: 2,
      title: '만일 내가 인생을 다시 산다면',
      author: '김혜남',
      theme: '삶의 태도',
      coverClass: 'mw-cover-green',
      image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=800&auto=format&fit=crop',
    },
    {
      id: 3,
      title: '기분이 태도가 되지 않게',
      author: '레몬심리',
      theme: '감정 조절',
      coverClass: 'mw-cover-pink',
      image: 'https://images.unsplash.com/photo-1491841573634-28140fc7ced7?q=80&w=800&auto=format&fit=crop',
    },
    {
      id: 4,
      title: '마흔에 읽는 쇼펜하우어',
      author: '강용수',
      theme: '철학과 치유',
      coverClass: 'mw-cover-amber',
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
      overlayClass: 'mw-overlay-green',
      image: 'https://images.unsplash.com/photo-1515037893149-de7f840978e2?q=80&w=800&auto=format&fit=crop',
    },
    {
      id: 2,
      type: 'OBJECT',
      name: '무음 모래시계 15분',
      desc: '스마트폰을 내려두고 오직 나에게 집중하는 15분을 만들어보세요.',
      overlayClass: 'mw-overlay-amber',
      image: 'https://cdn.pixabay.com/photo/2015/02/01/22/37/new-year-background-620397_640.jpg',
    },
    {
      id: 3,
      type: 'OBJECT',
      name: '마인드풀니스 린넨 일기장',
      desc: '오늘의 감정을 기록하기 좋은 프리미엄 무선 노트입니다.',
      overlayClass: 'mw-overlay-pink',
      image: 'https://images.unsplash.com/photo-1531346878377-a5be20888e57?q=80&w=800&auto=format&fit=crop',
    },
    {
      id: 4,
      type: 'FOOD',
      name: '유기농 제주 무농약 귤피차',
      desc: '비타민C가 풍부하여 지친 오후 기운을 북돋아줍니다.',
      overlayClass: 'mw-overlay-green',
      image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?q=80&w=800&auto=format&fit=crop',
    },
  ];

  return (
    <div className="mw-root">

      {/* ── 헤더 ── */}
      <header className="mw-header">
        <div className="mw-header-inner">
          <div className="mw-header-left">
            <button className="mw-menu-btn">
              <Menu size={20} />
            </button>
            <div className="mw-logo">MINDWELL</div>
            <nav className="mw-nav">
              <a href="#" className="mw-nav-link">전문가 찾기</a>
              <a href="#" className="mw-nav-link">예약 관리</a>
              <a href="#" className="mw-nav-link">AI 일기</a>
              <a href="#" className="mw-nav-link-active">힐링 라운지</a>
            </nav>
          </div>
          <div className="mw-header-right">
            <button className="mw-bell-btn">
              <Bell size={18} />
              <span className="mw-bell-dot" />
            </button>
            <div className="mw-profile-btn">
              <div className="mw-profile-icon">
                <Heart size={12} fill="#8BA888" style={{ color: '#8BA888' }} />
              </div>
              <span className="mw-profile-name">내담자 님</span>
            </div>
          </div>
        </div>
      </header>

      {/* ── 메인 ── */}
      <main className="mw-main">

        {/* 타이틀 */}
        <div className="mw-page-title-wrap">
          <h1 className="mw-page-title">힐링 라운지</h1>
          <p className="mw-page-subtitle">"당신의 몸과 마음을 채우는 건강한 추천"</p>
        </div>

        {/* 1. 이벤트 배너 */}
        <section className="mw-banner-section">
          <div
            className="mw-banner-track"
            style={{ transform: `translateX(-${currentBanner * 100}%)` }}
          >
            {banners.map((banner) => (
              <div key={banner.id} className="mw-banner-slide">
                <div className={`mw-banner-card ${banner.gradClass}`}>
                  <div className="mw-banner-content">
                    <div className="mw-banner-tag-row">
                      <span className="mw-banner-tag">{banner.tag}</span>
                      <span className="mw-banner-date">{banner.date}</span>
                    </div>
                    <h2 className="mw-banner-title">{banner.title}</h2>
                    <p className="mw-banner-desc">{banner.desc}</p>
                    <button className="mw-banner-btn">
                      <Gift size={16} style={{ color: '#8BA888' }} />
                      <span>혜택 확인하기</span>
                    </button>
                  </div>
                  <div className="mw-banner-icon-wrap">
                    <div className="mw-banner-icon-circle">
                      <Heart size={36} fill="white" style={{ color: '#fff' }} />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mw-banner-dots">
            {banners.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentBanner(idx)}
                className={`mw-banner-dot ${currentBanner === idx ? 'mw-banner-dot-active' : ''}`}
              />
            ))}
          </div>
        </section>

        {/* 2. 오늘의 차와 향기 */}
        <section className="mw-section">
          <div className="mw-tea-header">
            <div className="mw-tea-header-text">
              <h3 className="mw-section-title">
                오늘의 차와 향기 <span style={{ display: 'inline-block', animation: 'bounce 1s infinite' }}>🍵</span>
              </h3>
              <p className="mw-section-subtitle">지금 당신에게 가장 필요한 감각의 휴식을 제안합니다.</p>
            </div>
          </div>

          <div className="mw-tea-grid">
            {teaAndScentContents.map((item) => (
              <div key={item.id} className="mw-tea-card">
                <div className={`mw-tea-card-glow ${item.glowClass}`} />
                <span className={`mw-tea-mood-badge ${item.badgeClass}`}>{item.mood}</span>
                <div className="mw-tea-items">
                  <div className="mw-tea-item-row">
                    <div className="mw-tea-icon-box mw-tea-icon-tea">
                      <Coffee size={18} />
                    </div>
                    <div>
                      <p className="mw-tea-label">Tea</p>
                      <span className="mw-tea-name">{item.tea}</span>
                    </div>
                  </div>
                  <div className="mw-tea-item-row">
                    <div className="mw-tea-icon-box mw-tea-icon-scent">
                      <Sparkles size={18} />
                    </div>
                    <div>
                      <p className="mw-tea-label">Scent</p>
                      <span className="mw-tea-name">{item.scent}</span>
                    </div>
                  </div>
                  <div className="mw-tea-desc-box">
                    <p className="mw-tea-desc">{item.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 3. 마음을 어루만지는 책 */}
        <section className="mw-section">
          <div className="mw-section-header">
            <h3 className="mw-section-title mw-section-title-left">마음을 어루만지는 책 📚</h3>
            <div className="mw-section-header-actions">
              <span className="mw-scroll-hint">Scroll →</span>
              <button className="mw-view-all-btn">
                전체보기 <ChevronRight size={14} />
              </button>
            </div>
          </div>
          <div className="mw-hscroll-outer">
            <div className="mw-hscroll-inner mw-hscroll-inner-book mw-scrollbar-hide mw-scroll-area">
              {bookContents.map((book) => (
                <div key={book.id} className="mw-book-card">
                  <div className={`mw-book-cover ${book.coverClass}`}>
                    <img
                      src={book.image}
                      alt={book.title}
                      className="mw-book-img mw-no-drag-img"
                      loading="lazy"
                    />
                    <div className="mw-book-spine" />
                  </div>
                  <div className="mw-book-info">
                    <span className="mw-book-theme">{book.theme}</span>
                    <h4 className="mw-book-title">{book.title}</h4>
                    <p className="mw-book-author">{book.author}</p>
                  </div>
                </div>
              ))}
              <div className="mw-hscroll-spacer" />
            </div>
          </div>
        </section>

        {/* 4. 일상의 평온을 돕는 큐레이션 */}
        <section className="mw-section">
          <div className="mw-section-header">
            <div className="mw-section-header-left">
              <h3 className="mw-section-title mw-section-title-left">일상의 평온을 돕는 큐레이션 ✨</h3>
              <p className="mw-section-subtitle-sm">당신의 공간과 시간을 더 안온하게</p>
            </div>
            <div className="mw-section-header-actions">
              <span className="mw-scroll-hint">Scroll →</span>
              <button className="mw-view-all-btn">
                전체보기 <ChevronRight size={14} />
              </button>
            </div>
          </div>

          <div className="mw-hscroll-outer">
            <div className="mw-hscroll-inner mw-hscroll-inner-product mw-scrollbar-hide mw-scroll-area">
              {productContents.map((product) => (
                <div key={product.id} className="mw-product-card">
                  <div className="mw-product-img-wrap">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="mw-product-img mw-no-drag-img"
                      loading="lazy"
                    />
                    <div className={`mw-product-overlay ${product.overlayClass}`} />
                  </div>
                  <div>
                    <span className="mw-product-type">{product.type}</span>
                    <h4 className="mw-product-name">{product.name}</h4>
                    <p className="mw-product-desc">{product.desc}</p>
                    <div className="mw-product-footer">
                      <span className="mw-product-label">추천 아이템</span>
                      <button className="mw-product-link-btn">
                        <ExternalLink size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              <div className="mw-hscroll-spacer" />
            </div>
          </div>
        </section>

      </main>

      {/* ── 푸터 ── */}
      <footer className="mw-footer">
        <div className="mw-footer-inner">
          <div className="mw-footer-brand">
            <h4 className="mw-footer-logo">MINDWELL</h4>
            <p className="mw-footer-copy">© 2026 MINDWELL LAB. All rights reserved.</p>
          </div>
          <div className="mw-footer-links">
            <a href="#" className="mw-footer-link">이용약관</a>
            <a href="#" className="mw-footer-link">개인정보처리방침</a>
            <a href="#" className="mw-footer-link">고객센터</a>
          </div>
        </div>
      </footer>

    </div>
  );
}