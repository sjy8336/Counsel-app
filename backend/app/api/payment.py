
from fastapi import APIRouter, HTTPException, Depends
import requests
import base64
from sqlalchemy.orm import Session
from app.core.config import settings
from app.db.session import get_db  # DB 세션을 가져오는 함수 (파일명에 맞춰 확인 필요)
from app.crud import booking as booking_crud  # CRUD 함수 모음
from pydantic import BaseModel

router = APIRouter()


# Pydantic 모델 정의
class PaymentConfirmRequest(BaseModel):
    paymentKey: str
    orderId: str
    amount: int

@router.post("/confirm")
async def confirm_payment(payment_data: PaymentConfirmRequest, db: Session = Depends(get_db)):
    """
    프론트엔드 결제 완료 후 토스 승인 API 호출 및 DB 상태 업데이트
    """
    payment_key = payment_data.paymentKey
    order_id = payment_data.orderId
    amount = payment_data.amount

    # 2. 토스 인증 헤더 생성
    secret_key = settings.TOSS_SECRET_KEY
    encoded_key = base64.b64encode(f"{secret_key}:".encode()).decode()
    
    headers = {
        "Authorization": f"Basic {encoded_key}",
        "Content-Type": "application/json"
    }
    
    payload = {
        "paymentKey": payment_key,
        "orderId": order_id,
        "amount": amount
    }
    
    try:
        # 3. 토스 결제 승인 API 호출
        response = requests.post(
            "https://api.tosspayments.com/v1/payments/confirm",
            json=payload,
            headers=headers,
            timeout=10
        )
        
        result = response.json()
        
        # 4. 결과 처리 및 DB 업데이트
        if response.status_code == 200:
            # [DB 업데이트 로직 추가]
            # order_id를 기준으로 bookings 테이블의 상태를 'completed'로 변경합니다.
            updated_booking = booking_crud.update_booking_status(
                db, 
                order_id=order_id, 
                payment_key=payment_key,
                status="completed"
            )
            
            if not updated_booking:
                # 결제는 성공했는데 우리 DB에 해당 주문 번호가 없는 경우
                raise HTTPException(status_code=404, detail="해당 주문 번호의 예약 정보를 찾을 수 없습니다.")

            return {
                "status": "success",
                "message": "결제가 완료되었고 예약 상태가 업데이트되었습니다.",
                "data": result
            }
        else:
            raise HTTPException(
                status_code=response.status_code, 
                detail={
                    "code": result.get("code"),
                    "message": result.get("message")
                }
            )
            
    except requests.exceptions.RequestException as e:
        raise HTTPException(
            status_code=500, 
            detail=f"토스 API와의 통신 중 오류가 발생했습니다: {str(e)}"
        )