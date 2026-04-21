# app/crud/user.py

from sqlalchemy.orm import Session
from app.models.user import User

def remove_user(db: Session, user_id: int):
    """DB에서 해당 유저를 찾아 삭제합니다."""
    db_user = db.query(User).filter(User.id == user_id).first()
    if not db_user:
        return False

    db_user.is_active = False
    
    db.commit()
    return True