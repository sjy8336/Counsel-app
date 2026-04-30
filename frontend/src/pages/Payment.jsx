import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { loadTossPayments } from '@tosspayments/payment-sdk';
import '../static/Payment.css';

const Payment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { counselorName, selectedDate, selectedTime, survey } = location.state || {};
  const [paymentMethod, setPaymentMethod] = useState('CARD');

  const handlePayment = async () => {
    // 실제 결제 연동 유지, 결제 성공 시 Success.jsx로 이동
    const clientKey = 'test_ck_D5bZopLDRvo94W0M9q688Pn5D9On'; 
    const tossPayments = await loadTossPayments(clientKey);

    try {
      await tossPayments.requestPayment(paymentMethod, {
        amount: 20000,
        orderId: `MW-${Math.random().toString(36).slice(2, 11)}`,
        orderName: `${counselorName} 상담 예약금`,
        customerName: '왕감자', 
        successUrl: `${window.location.origin}/payment/success`,
        failUrl: `${window.location.origin}/payment/fail`,
      });
    } catch (error) {
      if (error.code !== 'USER_CANCEL') alert(`오류 발생: ${error.message}`);
    }
    // 결제 버튼 클릭 시 바로 Success.jsx로 이동 (테스트용)
    navigate('/payment/fail')
  };

  if (!counselorName) return <div className="error-view">정보를 불러올 수 없습니다.</div>;

  return (
    <div className="pay-wrapper">
      <div className="pay-card">
        <h2 className="pay-main-title">결제하기</h2>
        
        {/* 예약 정보 확인 */}
        <div className="pay-info-box">
          <div className="pay-label">🗓️ 예약 확인</div>
          <div className="pay-details">
            <p><strong>상담사</strong> <span>{counselorName}</span></p>
            <p><strong>일시</strong> <span>{selectedDate} {selectedTime}</span></p>
            <p><strong>상담 이유</strong> <span>{survey?.reason}</span></p>
          </div>
        </div>

        {/* 금액 및 안내 문구 추가 */}
        <div className="pay-price-box">
          <div className="pay-label">💵 결제 금액</div>
          <div className="pay-price-row">
            <span className="pay-amount-label">예약금</span>
            <span className="pay-amount-value">20,000원</span>
          </div>
          <p className="pay-notice-text">
            노쇼 방지를 위해 <span>선입금 예약금</span>이 발생합니다.<br/>
            * 나머지 상담료는 상담 종료 후 현장에서 결제됩니다.
          </p>
        </div>

        {/* 결제 수단 */}
        <div className="pay-method-box">
          <div className="pay-label">💳 결제 수단</div>
          <div className="method-grid">
            {['CARD', 'TRANSFER', 'TOSSPAY'].map((m) => (
              <button 
                key={m}
                className={`method-btn ${paymentMethod === m ? 'active' : ''}`}
                onClick={() => setPaymentMethod(m)}
              >
                {m === 'CARD' ? '신용카드' : m === 'TRANSFER' ? '계좌이체' : '토스페이'}
              </button>
            ))}
          </div>
        </div>

        <button onClick={handlePayment} className="pay-final-btn">
          20,000원 결제하기
        </button>
      </div>
    </div>
  );
};

export default Payment;