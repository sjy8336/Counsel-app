from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.user import User
from app.core.jwt import SECRET_KEY, ALGORITHM

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    print("[AUTH] 받은 토큰:", token)
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        print("[AUTH] payload:", payload)
        user_id: str = payload.get("sub")
        print("[AUTH] 추출된 user_id:", user_id)
        if user_id is None:
            print("[AUTH] user_id가 None입니다.")
            raise credentials_exception
    except JWTError as e:
        print("[AUTH] JWTError 발생:", str(e))
        raise credentials_exception
    user = db.query(User).filter(User.id == int(user_id)).first()
    if user is None:
        print(f"[AUTH] user_id {user_id}에 해당하는 유저가 없습니다.")
        raise credentials_exception
    print(f"[AUTH] 인증된 유저: {user.id}, {user.username}")
    return user
