import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { confirmPayment } from '../api/payment';
import { createBooking } from '../api/booking';
import '../static/Success.css';

const Success = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState('pending');
    const [message, setMessage] = useState('결제 승인 중입니다...');
    // 중복 승인 방지용 ref
    const hasConfirmed = useRef(false);

    // URL 파라미터에서 값 가져오기 (예약 정보 포함)
    const amount = searchParams.get('amount') || '20000';
    const orderId = searchParams.get('orderId');
    const paymentKey = searchParams.get('paymentKey');
    // 예약 정보는 localStorage에서 꺼내옴
    let counselorName = '';
    let selectedDate = '';
    let selectedTime = '';
    let survey = {};
    try {
        const pendingBooking = JSON.parse(localStorage.getItem('pendingBooking'));
        counselorName = pendingBooking?.counselorName || '';
        selectedDate = pendingBooking?.selectedDate || '';
        selectedTime = pendingBooking?.selectedTime || '';
        survey = pendingBooking?.survey || {};
    } catch (e) {
        counselorName = '';
        selectedDate = '';
        selectedTime = '';
        survey = {};
    }

    useEffect(() => {
        // 예약 생성 → 결제 승인 순서로 변경
        if (!paymentKey || !orderId || !amount) {
            setStatus('success');
            setMessage('결제가 정상적으로 완료되었습니다!');
            return;
        }
        if (hasConfirmed.current) return;
        hasConfirmed.current = true;
        setStatus('pending');
        setMessage('예약 정보를 저장 중입니다...');

        // 1. 예약 먼저 생성
        createBooking({
            counselorName,
            selectedDate,
            selectedTime,
            survey,
            amount,
            paymentStatus: 'pending',
            paymentKey,
            orderId,
        })
            .then(() => {
                setMessage('결제 승인 중입니다...');
                // 2. 결제 승인
                return confirmPayment({ paymentKey, orderId, amount: Number(amount) });
            })
            .then(() => {
                setStatus('success');
                setMessage('결제 및 예약이 정상적으로 완료되었습니다!');
                // 예약 성공 시 localStorage 정리
                localStorage.removeItem('pendingBooking');
            })
            .catch(async (err) => {
                setStatus('fail');
                setMessage(err.message || '예약 생성 또는 결제 승인에 실패했습니다.');
                localStorage.removeItem('pendingBooking');
            });
    }, [paymentKey, orderId, amount, counselorName, selectedDate, selectedTime, survey]);

    return (
        <div className="success-container">
            <div className="success-content-card">
                <div className="success-icon-circle">
                    {status === 'success' && '✓'}
                    {status === 'fail' && '✗'}
                    {status === 'pending' && <span className="pending-spinner">...</span>}
                </div>
                <h2 className="success-main-text">
                    {status === 'success' && '예약 및 결제 완료!'}
                    {status === 'fail' && '결제 실패'}
                    {status === 'pending' && '결제 대기중'}
                </h2>
                <p className="success-sub-text">{message}</p>
                <div className="success-info-section">
                    <div className="info-row">
                        <span>결제 금액</span>
                        <span className="info-value">{Number(amount).toLocaleString()}원</span>
                    </div>
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
