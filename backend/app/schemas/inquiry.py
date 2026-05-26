from pydantic import BaseModel
from typing import Optional
from datetime import datetime

# 프론트엔드에서 보낼 때 검증할 객체
class InquiryCreate(BaseModel):
    counselor_id: int
    type: str
    title: str
    content: str

# 프론트엔드로 다시 던져줄 응답 객체

class InquiryResponse(BaseModel):
    id: int
    client_id: int
    counselor_id: int
    type: str
    title: str
    content: str
    status: str
    answer: Optional[str] = None
    created_at: datetime
    client_name: Optional[str] = None  # 내담자 이름 추가

    class Config:
        from_attributes = True

# 답변 등록 요청을 위한 스키마
class InquiryReply(BaseModel):
    answer: str