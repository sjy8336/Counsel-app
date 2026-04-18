from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.user import User
from app.schemas.user import UserCreate, LoginRequest
from pydantic import BaseModel

router = APIRouter()

@router.post("/signup")
def signup(user_in: UserCreate, db: Session = Depends(get_db)):
    # 1. 중복 확인 (username 기준)
    existing_user = db.query(User).filter(User.username == user_in.username).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="이미 존재하는 아이디입니다.")

    # 2. 비밀번호 암호화 로직 (나중에 추가)
    # hashed_pw = pwd_context.hash(user_in.password)

    # 3. DB 객체 생성
    new_user = User(
        full_name=user_in.full_name,
        username=user_in.username,
        email=user_in.email,
        hashed_password=user_in.password, # 임시로 그냥 넣기
        phone_number=user_in.phone_number,
        role=user_in.role
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return {"message": "회원가입 성공!", "user": new_user.username}

@router.post("/login")
def login(login_data: LoginRequest, db: Session = Depends(get_db)):
    # 1. 아이디로 유저 찾기
    user = db.query(User).filter(User.username == login_data.username).first()
    
    # 2. 유저가 없거나 비밀번호가 틀렸을 때 (보안상 메시지는 동일하게!)
    if not user or user.hashed_password != login_data.password:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="아이디 또는 비밀번호가 일치하지 않습니다."
        )

    # 3. 로그인 성공 응답 (나중에는 여기서 JWT 토큰을 보내줄 거예요)
    return {
        "message": "로그인 성공!",
        "user": {
            "username": user.username,
            "full_name": user.full_name,
            "role": user.role
        }
    }

@router.get("/check-id/{username}")
def check_id(username: str, db: Session = Depends(get_db)):
    # DB에서 해당 아이디가 있는지 조회
    user = db.query(User).filter(User.username == username).first()
    if user:
        # 이미 아이디가 존재함
        return {"available": False}
    # 아이디 사용 가능
    return {"available": True}