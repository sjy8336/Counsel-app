import React from 'react';
import { useNavigate } from 'react-router-dom'; // 1. useNavigate 추가
import Header from '../components/header.jsx';
import Footer from '../components/footer.jsx';
import '../static/CounselorHome.css';

const CounselorHome = () => {
  const navigate = useNavigate(); // 2. 네비게이트 함수 선언

  return (
    <div className="counselor-main">
      <Header />
      <div className="counselor-container">
        {/* 상단 배너 */}
        <section className="banner-card">
          <div className="banner-text">
            <h1>두부님, 오늘 상담은 <span className="point-color">총 3건</span>입니다.</h1>
            <p>오늘도 내담자들의 마음을 따뜻하게 안아주세요.</p>
          </div>
          <div className="banner-emoji">😊</div>
        </section>

        {/* 통계 요약 */}
        <div className="stats-container">
          <div className="stat-card"><span>이번 달 상담</span> <strong>24건</strong></div>
          <div className="stat-card"><span>이번 주 예정</span> <strong>8건</strong></div>
          <div className="stat-card"><span>미답변 문의</span> <strong className="alert">3건</strong></div>
        </div>

        <div className="main-content">
          <div className="left-section">
            {/* 오늘의 상담 요약 */}
            <section className="content-box">
              <h3 className="section-title">오늘의 상담 요약</h3>
              <div className="list-wrapper">
                {[1, 2, 3].map((item) => (
                  <div className="list-item" key={item}>
                    <div className="item-info">
                      <span className="time">14:00</span>
                      <strong>이은지 내담자</strong>
                      <span className="desc">제1상담실 (대면)</span>
                    </div>
                    {/* 3. 버튼 클릭 시 내담자 관리 페이지로 이동 (경로는 App.jsx에 설정한 대로 수정) */}
                    <button 
                      className="action-btn" 
                      onClick={() => navigate('/counselor/client')}
                    >
                      일지 작성
                    </button>
                  </div>
                ))}
              </div>
            </section>

            {/* 업무 현황 */}
            <div className="work-status-grid">
              <div className="work-card highlight">
                <div className="card-header">📝 작성 대기 중인 상담 일지</div>
                <div className="card-body">
                  <strong>1<span>건</span></strong>
                  <p>최민수 님 (5.19 상담)</p>
                  <button 
                    className="go-btn primary"
                    onClick={() => navigate('/counselor/client')}
                  >
                    지금 작성하기
                  </button>
                </div>
              </div>
              <div className="work-card">
                <div className="card-header">👤 신규 매칭 내담자</div>
                <div className="card-body">
                  <strong>2<span>명</span></strong>
                  <p>사전 질문지가 도착했습니다.</p>
                  <button className="go-btn secondary">설문지 확인하기</button>
                </div>
              </div>
            </div>
          </div>

          {/* 오른쪽 사이드 */}
          <aside className="side-content">
            <div className="status-box pending">
              <p>승인 대기 예약</p>
              <strong>2건</strong>
            </div>
            <div className="status-box inquiry">
              <p>새로운 문의</p>
              <strong>1건</strong>
            </div>
          </aside>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default CounselorHome;