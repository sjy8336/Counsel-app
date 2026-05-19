from app.crud.notification import create_notification
from app.schemas.notification import NotificationCreate
from app.models.user import User
from fastapi import Depends
from sqlalchemy.orm import Session
from app.db.session import get_db

def send_booking_request_notification(db: Session, counselor_id: int, client_name: str, booking_date: str, booking_time: str):
    title = f"새 예약 신청이 도착했습니다"
    desc = f"{client_name}님이 {booking_date} {booking_time}에 예약을 신청했습니다."
    notif = NotificationCreate(
        user_id=counselor_id,
        type="booking_request",
        title=title,
        desc=desc
    )
    return create_notification(db, notif)
