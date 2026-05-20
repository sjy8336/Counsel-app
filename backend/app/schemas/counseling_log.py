from pydantic import BaseModel
from datetime import datetime
from typing import Optional

# 일지 생성/수정 시 프론트에서 보내주는 데이터
class CounselingLogCreate(BaseModel):
    booking_id: int
    client_id: int
    title: str
    session_number: int
    content: str
    quick_memo: Optional[str] = None

# 일지 조회 시 프론트로 던져줄 데이터
class CounselingLogResponse(BaseModel):
    id: int
    booking_id: int
    client_id: int
    counselor_id: int
    title: str
    session_number: int
    content: str
    quick_memo: Optional[str] = None
    created_at: datetime
    keywords: Optional[list[str]] = []

    class Config:
        from_attributes = True