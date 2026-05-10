from sqlalchemy.orm import Session
from app.models.notification import Notification
from app.schemas.notification import NotificationCreate
from datetime import datetime
from typing import List

def create_notification(db: Session, data: NotificationCreate):
    notif = Notification(
        user_id=data.user_id,
        type=data.type,
        title=data.title,
        desc=data.desc,
        created_at=datetime.utcnow(),
        read=False
    )
    db.add(notif)
    db.commit()
    db.refresh(notif)
    return notif

def get_notifications(db: Session, user_id: int) -> List[Notification]:
    return db.query(Notification).filter(Notification.user_id == user_id).order_by(Notification.created_at.desc()).all()

def mark_notification_read(db: Session, notif_id: int, user_id: int):
    notif = db.query(Notification).filter(Notification.id == notif_id, Notification.user_id == user_id).first()
    if notif:
        notif.read = True
        db.commit()
    return notif
