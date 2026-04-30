import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../static/Survey.css';

const Survey = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // CounselorDetail에서 넘어온 예약 정보
  const { counselorName, selectedDate, selectedTime } = location.state || {};

  const [formData, setFormData] = useState({
    reason: '',
    otherReason: '', // 기타 입력 내용을 저장할 필드 추가
    experience: '',
    wants: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // 최종 제출 데이터 정리 (기타 선택 시 직접 입력한 값으로 대체)
    const finalData = {
      ...formData,
      reason: formData.reason === '기타' ? formData.otherReason : formData.reason
    };
    
    console.log("제출 데이터:", finalData);
    
    // 알림창 확인 후 결제 페이지(/payment)로 이동하며 상태(state) 전달
    alert("예약금 20,000원 결제 페이지로 이동합니다.");
    navigate('/payment', { 
      state: { 
        counselorName, 
        selectedDate, 
        selectedTime, 
        survey: finalData 
      } 
    });
  };

  if (!counselorName) return <div>잘못된 접근입니다.</div>;

  return (
    <div className="survey-container">
      <div className="survey-header">
        <h2>사전 상담 설문지</h2>
        <p><strong>{counselorName}</strong> 상담사님과의 원활한 상담을 위해 작성해 주세요.</p>
        <div className="selected-info">
          <span>날짜: {selectedDate}</span>
          <span>시간: {selectedTime}</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="survey-form">
        <div className="form-group">
          <label>1. 이번 상담을 신청하게 된 주된 이유는 무엇인가요?</label>
          <select name="reason" value={formData.reason} onChange={handleChange} required>
            <option value="">선택해주세요</option>
            <option value="우울/불안">우울 또는 불안</option>
            <option value="대인관계">대인관계 갈등</option>
            <option value="직장/학업">직장 또는 학업 스트레스</option>
            <option value="자기이해">자기이해 및 성장</option>
            <option value="기타">기타(직접 입력)</option>
          </select>

          {/* '기타' 선택 시 나타나는 조건부 렌더링 입력창 */}
          {formData.reason === '기타' && (
            <input
              type="text"
              name="otherReason"
              placeholder="상담 이유를 직접 입력해주세요."
              value={formData.otherReason}
              onChange={handleChange}
              required
              style={{
                marginTop: '10px',
                width: '100%',
                padding: '10px',
                borderRadius: '8px',
                border: '1px solid #2e4b3f', // 프로젝트 메인 컬러 계열
                boxSizing: 'border-box'
              }}
            />
          )}
        </div>

        <div className="form-group">
          <label>2. 이전에 상담을 받아보신 적이 있나요?</label>
          <div className="radio-group">
            <label><input type="radio" name="experience" value="yes" onChange={handleChange} required /> 예</label>
            <label><input type="radio" name="experience" value="no" onChange={handleChange} required /> 아니오</label>
          </div>
        </div>

        <div className="form-group">
          <label>3. 상담을 통해 얻고 싶은 구체적인 목표가 있다면 적어주세요.</label>
          <textarea 
            name="wants" 
            value={formData.wants} 
            onChange={handleChange} 
            placeholder="예: 나만의 거절 시나리오를 만들고 싶어요."
            required
            style={{ 
              width: '100%', 
              minHeight: '120px', 
              maxHeight: '300px', 
              resize: 'none',
              padding: '12px',
              boxSizing: 'border-box'
            }}
          />
        </div>

        <div className="payment-notice">
          <h3>💰 예약금 안내</h3>
          <p>노쇼 방지를 위해 <strong>선입금 예약금 20,000원</strong>이 발생합니다.</p>
          <p className="sub-text">* 나머지 상담료는 상담 종료 후 현장에서 결제됩니다.</p>
        </div>

        <button type="submit" className="submit-btn">설문 완료 및 결제하기</button>
      </form>
    </div>
  );
};

export default Survey;