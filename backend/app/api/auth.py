from app.schemas.user import UserUpdate, ChangePasswordRequest
from app.core.jwt import create_access_token
from passlib.context import CryptContext
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.user import User
from app.models.favorite import Favorite
from app.core.deps import get_current_user
from app.schemas.user import UserCreate, LoginRequest
from app.crud import crud
from pydantic import BaseModel

router = APIRouter()

# 계정 영구 삭제용 pydantic 모델
class DeleteAccountRequest(BaseModel):
    user_id: int

@router.post("/delete-account")
def delete_account(req: DeleteAccountRequest, db: Session = Depends(get_db)):
    """유저 계정 영구 삭제(soft delete)"""
    result = crud.remove_user(db, req.user_id)
    if result:
        return {"message": "계정이 삭제(비활성화)되었습니다."}
    else:
        raise HTTPException(status_code=404, detail="유저를 찾을 수 없습니다.")

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

@router.post("/signup")
def signup(user_in: UserCreate, db: Session = Depends(get_db)):
    # 1. 중복 확인 (username 기준)
    existing_user = db.query(User).filter(User.username == user_in.username).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="이미 존재하는 아이디입니다.")

    # 2. 비밀번호 길이 체크 및 디버깅 출력
    print(f"[DEBUG] password: {user_in.password} (len={len(user_in.password)})")
    if len(user_in.password) > 13:
        raise HTTPException(status_code=400, detail="비밀번호는 최대 13자까지 입력 가능합니다.")

    # 3. 비밀번호 암호화 로직
    hashed_pw = pwd_context.hash(user_in.password)

    # 4. DB 객체 생성
    new_user = User(
        full_name=user_in.full_name,
        username=user_in.username,
        email=user_in.email,
        hashed_password=hashed_pw,
        phone_number=user_in.phone_number,
        birth_date=user_in.birth_date,
        gender=user_in.gender,
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

    # 2. 유저가 없거나 비밀번호가 틀렸거나, 비활성화된 계정일 때 (보안상 메시지는 동일하게!)
    if not user or not pwd_context.verify(login_data.password, user.hashed_password) or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="아이디 또는 비밀번호가 일치하지 않습니다."
        )

    # 3. JWT 토큰 발급
    access_token = create_access_token({"sub": str(user.id)})

    # 4. 로그인 성공 응답 (토큰 포함)
    return {
        "message": "로그인 성공!",
        "user": {
            "id": user.id,  # PK 추가
            "username": user.username,
            "full_name": user.full_name,
            "role": user.role
        },
        "access_token": access_token,
        "token_type": "bearer"
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

# --- 유저 정보 조회 ---
@router.get("/user/{user_id}")
def get_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="유저를 찾을 수 없습니다.")
    return {
        "id": user.id,
        "full_name": user.full_name,
        "username": user.username,
        "email": user.email,
        "phone_number": user.phone_number
    }

# --- 유저 정보 수정 ---
@router.post("/user/update")
def update_user(user_update: UserUpdate, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_update.id).first()
    if not user:
        raise HTTPException(status_code=404, detail="유저를 찾을 수 없습니다.")
    print("[DEBUG] 수정 전:", user.id, user.full_name, user.email, user.phone_number)
    user.full_name = user_update.full_name
    user.email = user_update.email
    user.phone_number = user_update.phone_number
    print("[DEBUG] 수정 후:", user.id, user.full_name, user.email, user.phone_number)
    db.commit()
    print("[DEBUG] commit 완료")
    db.refresh(user)
    print("[DEBUG] DB에서 다시 읽은 값:", user.id, user.full_name, user.email, user.phone_number)
    return {
        "message": "정보가 수정되었습니다.",
        "updated_at": user.updated_at
    }

# --- 비밀번호 변경 ---
@router.post("/user/change-password")
def change_password(req: ChangePasswordRequest, db: Session = Depends(get_db)):
    print("[DEBUG] change-password req:", req)
    user = db.query(User).filter(User.id == req.user_id).first()
    print("[DEBUG] user:", user)
    if not user:
        print("[DEBUG] 유저 없음")
        raise HTTPException(status_code=404, detail="유저를 찾을 수 없습니다.")
    # 현재 비밀번호 검증
    try:
        pw_check = pwd_context.verify(req.current_password, user.hashed_password)
    except Exception as e:
        print("[DEBUG] pwd_context.verify 예외:", e)
        raise HTTPException(status_code=500, detail="비밀번호 검증 중 오류 발생")
    print("[DEBUG] pw_check:", pw_check)
    if not pw_check:
        print("[DEBUG] 현재 비밀번호 불일치")
        raise HTTPException(status_code=400, detail="현재 비밀번호가 일치하지 않습니다.")
    # 새 비밀번호 해시 후 저장
    try:
        user.hashed_password = pwd_context.hash(req.new_password)
        db.commit()
        db.refresh(user)
        print("[DEBUG] 비밀번호 변경 성공")
        return {"message": "비밀번호가 성공적으로 변경되었습니다.", "updated_at": user.updated_at}
    except Exception as e:
        print("[DEBUG] 비밀번호 변경/DB commit 예외:", e)
        raise HTTPException(status_code=500, detail="비밀번호 변경 중 오류 발생")

@router.get("/me")
def get_me(current_user=Depends(get_current_user)):
    # JWT 인증된 유저 정보 반환
    user = current_user
    if not user:
        raise HTTPException(status_code=404, detail="유저를 찾을 수 없습니다.")
    return {
        "id": user.id,
        "full_name": user.full_name,
        "email": user.email,
        "phone_number": user.phone_number,
        "role": user.role,  # 'counselor', 'client', 'admin'
        "profile_image": "default.png"
    }

@router.post("/favorites/{counselor_id}")
def toggle_favorite(counselor_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    print(f"[DEBUG] toggle_favorite 진입: current_user={getattr(current_user, 'id', None)}, counselor_id={counselor_id}")
    try:
        favorite = db.query(Favorite).filter(
            Favorite.client_id == current_user.id,
            Favorite.counselor_id == counselor_id
        ).first()
        print(f"[DEBUG] 기존 favorite: {favorite}")
        if favorite:
            db.delete(favorite)
            db.commit()
            print("[DEBUG] 찜 삭제 완료")
            return {"message": "찜하기 취소됨", "is_favorite": False}
        else:
            new_fav = Favorite(client_id=current_user.id, counselor_id=counselor_id)
            db.add(new_fav)
            db.commit()
            print("[DEBUG] 찜 추가 완료")
            return {"message": "찜하기 성공", "is_favorite": True}
    except Exception as e:
        print(f"[ERROR] toggle_favorite 예외: {e}")
        raise HTTPException(status_code=500, detail=f"찜 처리 중 오류: {e}")

# 찜 목록 조회
@router.get("/favorites")
def get_favorites(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    print(f"[DEBUG] get_favorites 호출: user_id={current_user.id}") # 로그 추가
    favorites = db.query(Favorite).filter(Favorite.client_id == current_user.id).all()
    print(f"[DEBUG] DB에서 찾은 찜 개수: {len(favorites)}") # 로그 추가
    result = []
    for fav in favorites:
        # 상담사 정보 가져오기
        counselor = db.query(User).filter(User.id == fav.counselor_id).first()
        # counselor가 DB에 없더라도 일단 리스트에 담아서 프론트에 보내줘야 하트가 유지됩니다!
        result.append({
            "id": fav.id,
            "counselor_id": fav.counselor_id,
            "counselor_name": counselor.full_name if counselor else "알 수 없는 상담사"
        })
    print(f"[DEBUG] 최종 리턴 데이터: {result}") # 로그 추가
    return {"favorites": result}