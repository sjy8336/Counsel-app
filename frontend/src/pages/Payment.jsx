import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { loadTossPayments } from '@tosspayments/payment-sdk';
import { createBooking } from '../api/booking';
import '../static/Payment.css';

const Payment = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { counselorName, selectedDate, selectedTime, survey } = location.state || {};
    const [paymentMethod, setPaymentMethod] = useState('CARD');

    const clientKey = import.meta.env.VITE_TOSS_CLIENT_KEY;

    const handlePayment = async () => {
        try {
            // 예약 정보 localStorage에 저장
            localStorage.setItem('pendingBooking', JSON.stringify({
                counselorName,
                selectedDate,
                selectedTime,
                survey
            }));
            // 1. 결제창 호출 (토스 서버로 이동)
            const tossPayments = await loadTossPayments(clientKey);
            await tossPayments.requestPayment(paymentMethod, {
                amount: 20000,
                orderId: `ORDER-${Date.now()}`,
                orderName: `${counselorName} 상담 예약금`,
                customerName: '왕감자', // 실제로는 유저 이름 변수 사용
                successUrl: `${window.location.origin}/payment/success`,
                failUrl: `${window.location.origin}/payment/fail`,
            });
            // 결제 성공/실패 여부에 따라 토스가 알아서 위에서 설정한 URL로 보내줍니다.
        } catch (error) {
            if (error.code === 'USER_CANCEL') {
                alert('결제가 취소되었습니다.');
            } else {
                navigate(`/payment/fail?code=${error.code}&message=${encodeURIComponent(error.message)}`);
            }
        }
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
                        <p>
                            <strong>상담사</strong> <span>{counselorName}</span>
                        </p>
                        <p>
                            <strong>일시</strong>{' '}
                            <span>
                                {selectedDate} {selectedTime}
                            </span>
                        </p>
                        <p>
                            <strong>상담 이유</strong> <span>{survey?.reason}</span>
                        </p>
                    </div>
                </div>

                {/* 금액 및 안내 문구 */}
                <div className="pay-price-box">
                    <div className="pay-label">💵 결제 금액</div>
                    <div className="pay-price-row">
                        <span className="pay-amount-label">예약금</span>
                        <span className="pay-amount-value">20,000원</span>
                    </div>
                    <p className="pay-notice-text">
                        노쇼 방지를 위해 <span>선입금 예약금</span>이 발생합니다.
                        <br />* 나머지 상담료는 상담 종료 후 현장에서 결제됩니다.
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
