from pydantic import BaseModel
from datetime import date
from typing import Optional, Dict, Any, List

# 예약 가능 시간 조회 요청/응답 스키마
class AvailableSlotsResponse(BaseModel):
    available_slots: List[str]

# 예약 생성 요청 스키마
class BookingCreate(BaseModel):
    counselor_id: int
    booking_date: date
    booking_time: str
    client_name: Optional[str] = None
    client_phone: Optional[str] = None
    survey_content: Optional[Dict[str, Any]] = None
    amount: int = 20000