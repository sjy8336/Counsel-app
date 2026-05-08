from sqlalchemy import Column, Integer, String, Enum, TIMESTAMP, Date, JSON, ForeignKey, text
from app.db.session import Base

class Booking(Base):
    __tablename__ = "bookings"

    id = Column(Integer, primary_key=True, autoincrement=True)
    
    # 외래키 설정: users 테이블의 id를 참조
    client_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    counselor_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)

    # 예약 정보
    booking_date = Column(Date, nullable=False)  # 년, 월, 일
    booking_time = Column(String(20), nullable=False)  # 시간 (예: "14:00")
    
    # 사전설문 (dict 형태로 저장 및 조회 가능)
    survey_content = Column(JSON, nullable=True)

    # 결제 정보
    payment_status = Column(
        Enum('pending', 'completed', 'canceled', name='payment_status_enum'),
        server_default='pending'
    )
    # 상담 상태
    booking_status = Column(
        Enum('waiting', 'confirmed', 'completed', 'canceled', name='booking_status_enum'),
        server_default='waiting'
    )
    amount = Column(Integer, default=20000)
    order_id = Column(String(100), unique=True, nullable=True)
    payment_key = Column(String(255), nullable=True)

    created_at = Column(TIMESTAMP, server_default=text('CURRENT_TIMESTAMP'))
    updated_at = Column(TIMESTAMP, server_default=text('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'))