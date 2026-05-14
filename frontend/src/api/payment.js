import axios from 'axios';

// 백엔드 기본 주소 (설정 파일이 있다면 거기서 가져오세요)
const API_BASE_URL = 'http://localhost:8000/api';

/**
 * 토스 결제 승인 요청을 백엔드로 보냅니다.
 * @param {Object} paymentData - { paymentKey, orderId, amount }
 */
export const confirmPayment = async (paymentData) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/payment/confirm`, paymentData, {
            headers: {
                'Content-Type': 'application/json',
            },
        });
        return response.data;
    } catch (error) {
        // 백엔드에서 보낸 에러 메시지가 있다면 그걸 던지고, 없으면 기본 메시지
        const errorMsg = error.response?.data?.detail?.message || '결제 승인 중 오류가 발생했습니다.';
        throw new Error(errorMsg);
    }
};
