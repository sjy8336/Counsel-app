from pydantic import BaseModel, EmailStr
from typing import Optional

# 회원가입 시 요청받는 데이터 구조
class UserCreate(BaseModel):
    full_name: str
    username: str
    email: EmailStr
    password: str  # DB 저장 전 날것의 비밀번호
    phone_number: str
    role: Optional[str] = "client"

# 응답용 데이터 구조
class UserResponse(BaseModel):
    id: int
    full_name: str
    username: str
    email: EmailStr
    role: str

    class Config:
        from_attributes = True

class LoginRequest(BaseModel):
    username: str
    password: str