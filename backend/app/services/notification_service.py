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

# 예약 확정 알림 (내담자)
def send_booking_confirmed_notification(db: Session, client_id: int, counselor_name: str, booking_date: str, booking_time: str):
    title = f"예약이 확정되었습니다"
    desc = f"{counselor_name} 상담사가 {booking_date} {booking_time} 상담 예약을 확정했습니다."
    notif = NotificationCreate(
        user_id=client_id,
        type="booking_confirmed",
        title=title,
        desc=desc
    )
    return create_notification(db, notif)

# 예약 거절/취소 알림 (내담자)
def send_booking_rejected_notification(db: Session, client_id: int, counselor_name: str, booking_date: str, booking_time: str):
    title = f"예약이 거절/취소되었습니다"
    desc = f"{counselor_name} 상담사가 {booking_date} {booking_time} 예약을 거절/취소했습니다."
    notif = NotificationCreate(
        user_id=client_id,
        type="booking_rejected",
        title=title,
        desc=desc
    )
    return create_notification(db, notif)

# 상담일지 등록 알림 (내담자)
def send_counseling_log_registered_notification(db: Session, client_id: int, counselor_name: str, session_number: int):
    title = f"상담일지가 등록되었습니다"
    desc = f"{counselor_name} 상담사가 {session_number}회차 상담일지를 등록했습니다."
    notif = NotificationCreate(
        user_id=client_id,
        type="counseling_log_registered",
        title=title,
        desc=desc
    )
    return create_notification(db, notif)

# 문의 답변 알림 (내담자)
def send_inquiry_answered_notification(db: Session, client_id: int, counselor_name: str, inquiry_title: str):
    title = f"문의에 답변이 등록되었습니다"
    desc = f"{counselor_name} 상담사가 '{inquiry_title}' 문의에 답변을 남겼습니다."
    notif = NotificationCreate(
        user_id=client_id,
        type="inquiry_answered",
        title=title,
        desc=desc
    )
    return create_notification(db, notif)
