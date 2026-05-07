from fastapi import APIRouter, Depends, HTTPException
import requests
import base64
from app.core.config import settings # settings에 TOSS_SECRET_KEY 설정 필요

router = APIRouter()

@router.post("/confirm")
async def confirm_payment(payment_data: dict):
    # 토스 측에 보낼 비밀키 인코딩
    secret_key = "YOUR_TOSS_SECRET_KEY" # 실제 시크릿 키 입력
    encoded_key = base64.b64encode(f"{secret_key}:".encode()).decode()
    
    headers = {
        "Authorization": f"Basic {encoded_key}",
        "Content-Type": "application/json"
    }
    
    # 토스 결제 승인 API 호출
    response = requests.post(
        "https://api.tosspayments.com/v1/payments/confirm",
        json=payment_data,
        headers=headers
    )
    
    if response.status_code == 200:
        # 성공 시 DB에 예약 정보 저장 로직(CRUD 호출) 필요
        return response.json()
    else:
        raise HTTPException(status_code=response.status_code, detail=response.json())