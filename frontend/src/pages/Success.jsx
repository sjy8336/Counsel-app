import React from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import '../static/Success.css';

const Success = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // URL 파라미터에서 값 가져오기
  const amount = searchParams.get('amount') || "20000"; // 값이 없으면 기본 20000 표시
  const orderId = searchParams.get('orderId');

  return (
    <div className="success-container">
      <div className="success-content-card">
        <div className="success-icon-circle">✓</div>
        <h2 className="success-main-text">예약 및 결제 완료!</h2>
        
        <p className="success-sub-text">
          상담 예약이 성공적으로 완료되었습니다.<br />
          정해진 시간에 맞춰 방문해 주세요.
        </p>

        <div className="success-info-section">
          <div className="info-row">
            <span>결제 금액</span>
            {/* 숫자에 콤마를 찍어서 예약금 20,000원 표시 */}
            <span className="info-value">{Number(amount).toLocaleString()}원</span>
          </div>
          
          {/* 주문 번호를 보여주고 싶지 않다면 이 div 전체를 지우세요 */}
          <div className="info-row">
            <span>주문 번호</span>
            <span className="info-value-small">{orderId}</span>
          </div>
        </div>

        <div className="success-action-buttons">
          <button className="btn-home" onClick={() => navigate('/')}>
            홈으로 돌아가기
          </button>
        </div>
      </div>
    </div>
  );
};

export default Success;