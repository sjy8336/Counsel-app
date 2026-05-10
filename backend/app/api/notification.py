from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.core.deps import get_current_user
from app.schemas.notification import NotificationCreate, NotificationOut
from app.crud.notification import create_notification, get_notifications, mark_notification_read
from typing import List

router = APIRouter()

@router.get("/notifications", response_model=List[NotificationOut])
def list_notifications(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return get_notifications(db, user_id=current_user.id)

@router.post("/notifications", response_model=NotificationOut)
def send_notification(data: NotificationCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    # 관리자만 직접 발송 허용 (추후 필요시)
    if current_user.role != 'admin':
        raise HTTPException(status_code=403, detail="관리자만 알림 발송 가능")
    return create_notification(db, data)

@router.post("/notifications/{notif_id}/read", response_model=NotificationOut)
def read_notification(notif_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    notif = mark_notification_read(db, notif_id, current_user.id)
    if not notif:
        raise HTTPException(status_code=404, detail="알림을 찾을 수 없습니다.")
    return notif
