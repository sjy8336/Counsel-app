import React, { useState } from 'react';
import Header from '../components/header';
import Footer from '../components/footer';
import MobileTap from '../components/mobileTap';
import { useNavigate } from 'react-router-dom';
import {
  ChevronDown,
  Paperclip,
  Send,
  Info,
  User,
  CheckCircle2
} from 'lucide-react';
import '../static/ContactCoach.css';

/**
 * 하위 컴포넌트: 네비게이션 링크
 */
const NavLinks = ({ className, onClick }) => (
  <nav className={className && className.replace(/\bmw/g, 'cont')}>
    {['전문가 찾기', '예약 관리', 'AI 일기', '힐링 라운지'].map((item) => (
      <a
        key={item}
        href="#"
        onClick={onClick}
        className="cont-nav__link"
      >
        {item}
      </a>
    ))}
  </nav>
);

/**
 * 하위 컴포넌트: 입력 필드 라벨
 */
const FieldLabel = ({ label, required }) => (
  <label className="cont-field__label">
    {label} {required && <span className="cont-field__required">*</span>}
  </label>
);

import { useLocation } from 'react-router-dom';

export default function App() {
  // --- 1. 상태 관리 (State) ---
  const location = useLocation();
  const passedCounselorName = location.state?.counselorName;
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [formData, setFormData] = useState({
    type: '예약 및 일정 변경',
    title: '',
    content: ''
  });
  // Header 메뉴 활성화 상태 관리
  const [activeTab, setActiveTab] = useState('search');
  const navigate = useNavigate();

  // --- 2. 이벤트 핸들러 (Handlers) ---
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitted(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  // --- 3. UI 렌더링 ---
  return (
    <div className="cont-page-wrapper">

      {/* Header (공통 컴포넌트) */}
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* MobileTab (공통 컴포넌트) */}
      <MobileTap />

      {/* Main Content */}
      <main className="cont-main">

        {/* Left Column: Form Section */}
        <div className="cont-form-col">
          <div className="cont-page-heading">
            <h1 className="cont-page-heading__title">상담사에게 문의하기</h1>
            <p className="cont-page-heading__desc">
              상담 전 궁금한 점이나 일정 변경 등에 대해 문의를 남겨주세요.<br />
              담당 코치님이 확인 후 답변해 드립니다.
            </p>
          </div>

          {isSubmitted ? (
            <div className="cont-success-card">
              <div className="cont-success-card__icon-wrap">
                <CheckCircle2 className="cont-success-card__icon" />
              </div>
              <h2 className="cont-success-card__title">문의가 성공적으로 접수되었습니다.</h2>
              <p className="cont-success-card__desc">
                이은지 코치님이 내용을 확인하는 대로 알림을 통해 답변을 안내해 드리겠습니다. 평균 답변 시간은 1~2일 소요될 수 있습니다.
              </p>
              <button
                onClick={() => navigate('/mypage', { state: { showInquiry: true } })}
                className="cont-success-card__btn"
              >
                나의 문의 내역 보기
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="cont-form-card">

              <div className="cont-form-card__fields">

                {/* 수신자 정보 */}
                <div className="cont-field">
                  <FieldLabel label="수신자 (담당 상담사)" />
                  <div className="cont-recipient-box">
                    <div className="cont-recipient-box__avatar">
                      <User className="cont-recipient-box__avatar-icon" />
                    </div>
                    <div>
                      <div className="cont-recipient-box__name">{(passedCounselorName || '이은지') + '님'}</div>
                    </div>
                  </div>
                </div>

                {/* 문의 유형 */}
                <div className="cont-field">
                  <FieldLabel label="문의 유형" required />
                  <div className="cont-select-wrapper">
                    <select
                      name="type"
                      required
                      value={formData.type}
                      onChange={handleInputChange}
                      className="cont-select"
                    >
                      <option>예약 및 일정 변경</option>
                      <option>상담 전 사전 질문</option>
                      <option>상담 내용 관련 문의</option>
                      <option>기타 문의</option>
                    </select>
                    <ChevronDown className="cont-select__chevron" />
                  </div>
                </div>

                {/* 문의 제목 */}
                <div className="cont-field">
                  <FieldLabel label="제목" required />
                  <input
                    name="title"
                    type="text"
                    required
                    placeholder="문의하실 제목을 입력해주세요."
                    value={formData.title}
                    onChange={handleInputChange}
                    className="cont-input"
                  />
                </div>

                {/* 문의 내용 */}
                <div className="cont-field">
                  <FieldLabel label="문의 내용" required />
                  <textarea
                    name="content"
                    required
                    rows="6"
                    placeholder="상담사에게 전달할 내용을 자세히 적어주세요. 개인정보가 포함되지 않도록 주의해 주세요."
                    value={formData.content}
                    onChange={handleInputChange}
                    className="cont-textarea"
                  ></textarea>
                </div>

                {/* 파일 첨부 */}
                <div className="cont-field">
                  <FieldLabel label="첨부 파일 (선택)" />
                  <div className="cont-dropzone">
                    <Paperclip className="cont-dropzone__icon" />
                    <p className="cont-dropzone__label">
                      클릭하여 파일을 업로드하거나 이곳으로 드래그 하세요.
                    </p>
                    <p className="cont-dropzone__hint">
                      최대 10MB (JPG, PNG, PDF 가능)
                    </p>
                  </div>
                </div>

              </div>

              {/* 하단 버튼 */}
              <div className="cont-form-actions">
                <button type="button" className="cont-btn--cancel">
                  취소
                </button>
                <button type="submit" className="cont-btn--submit">
                  <Send className="cont-btn--submit__icon" />
                  문의 보내기
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Right Column: Information/Sidebar */}
        <aside className="cont-sidebar">
          <div className="cont-notice-card">
            <h3 className="cont-notice-card__title">
              <Info className="cont-notice-card__title-icon" />
              문의 전 확인해주세요
            </h3>
            <ul className="cont-notice-card__list">
              {[
                "문의에 대한 답변은 영업일 기준 1~2일 정도 소요될 수 있습니다.",
                "긴급한 예약 취소 및 변경은 가급적 [예약 관리] 메뉴를 이용해 주시기 바랍니다.",
                "상담과 무관한 광고성, 비방성 문의는 사전 통보 없이 삭제될 수 있습니다."
              ].map((text, idx) => (
                <li key={idx} className="cont-notice-card__item">
                  <span className="cont-notice-card__bullet">•</span>
                  <span>{text}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="cont-help-banner">
            <p className="cont-help-banner__text">
              도움이 필요하신가요?
              <a href="#" className="cont-help-banner__link">고객센터로 문의하기</a>
            </p>
          </div>
        </aside>
      </main>

      {/* Footer (공통 컴포넌트) */}
      <Footer />
    </div>
  );
}