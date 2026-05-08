from sqlalchemy.orm import Session
from app.models.booking import Booking

# 1. order_id로 예약 정보 찾기
def get_booking_by_order_id(db: Session, order_id: str):
    return db.query(Booking).filter(Booking.order_id == order_id).first()

# 2. 결제 성공 후 상태 업데이트하기
def update_booking_status(db: Session, order_id: str, payment_key: str, status: str = "completed"):
    db_booking = get_booking_by_order_id(db, order_id)
    if db_booking:
        db_booking.payment_status = status
        db_booking.payment_key = payment_key
        db.commit()
        db.refresh(db_booking)
    return db_booking