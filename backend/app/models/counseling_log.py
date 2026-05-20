from sqlalchemy import Column, Integer, String, Text, ForeignKey, TIMESTAMP, text, JSON
from app.db.session import Base

class CounselingLog(Base):
    __tablename__ = "counseling_logs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    booking_id = Column(Integer, ForeignKey("bookings.id", ondelete="CASCADE"), nullable=False, unique=True)
    client_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    counselor_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    
    title = Column(String(255), nullable=False)
    session_number = Column(Integer, default=1)
    content = Column(Text, nullable=False)
    quick_memo = Column(Text, nullable=True) # 우측 사이드바 메모용

    keywords = Column(JSON, nullable=True)

    created_at = Column(TIMESTAMP, server_default=text('CURRENT_TIMESTAMP'))
    updated_at = Column(TIMESTAMP, server_default=text('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'))