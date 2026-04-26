
from pydantic import BaseModel, EmailStr
from typing import Optional

# 회원가입 시 요청받는 데이터 구조
class UserCreate(BaseModel):
    full_name: str
    username: str
    email: EmailStr
    password: str
    phone_number: str
    birth_date: str  # YYYY-MM-DD
    gender: str  # 'male' or 'female'
    role: Optional[str] = "client"

# 응답용 데이터 구조
class UserResponse(BaseModel):
    id: int
    full_name: str
    username: str
    email: EmailStr
    phone_number: str
    birth_date: str
    gender: str
    role: str

    class Config:
        from_attributes = True

class LoginRequest(BaseModel):
    username: str
    password: str

class UserUpdate(BaseModel):
    id: int
    full_name: str
    email: EmailStr
    phone_number: str


# 비밀번호 변경 요청용 스키마
class ChangePasswordRequest(BaseModel):
    user_id: int
    current_password: str
    new_password: str