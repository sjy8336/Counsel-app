import React from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import '../static/Fail.css';

const Fail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const errorCode = searchParams.get('code');
  const errorMessage = searchParams.get('message');

  return (
    <div className="fail-container">
      <div className="fail-content-card">
        <div className="fail-icon-circle">!</div>
        <h2 className="fail-main-text">결제에 실패하였습니다</h2>
        
        <div className="fail-info-section">
          <p className="fail-info-title">실패 사유</p>
          <p className="fail-info-msg">{errorMessage || '알 수 없는 오류가 발생했습니다.'}</p>
          <p className="fail-info-code">에러 코드: {errorCode || 'N/A'}</p>
        </div>

        <div className="fail-action-buttons">
          <button className="btn-retry" onClick={() => navigate(-1)}>
            다시 시도하기
          </button>
          <button className="btn-go-home" onClick={() => navigate('/')}>
            홈으로 이동
          </button>
        </div>
      </div>
    </div>
  );
};

export default Fail;