from sqlalchemy import Column, Integer, String, Text, ForeignKey, TIMESTAMP, text
from app.db.session import Base

from sqlalchemy.orm import relationship

class CounselorInquiry(Base):
    __tablename__ = "counselor_inquiries"

    id = Column(Integer, primary_key=True, autoincrement=True)
    client_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    counselor_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)

    type = Column(String(50), nullable=False)
    title = Column(String(255), nullable=False)
    content = Column(Text, nullable=False)
    status = Column(String(20), default="pending")
    answer = Column(Text, nullable=True)

    answered_at = Column(TIMESTAMP, nullable=True)
    created_at = Column(TIMESTAMP, server_default=text('CURRENT_TIMESTAMP'))

    # 내담자(User) 객체와 관계 설정
    client = relationship("User", foreign_keys=[client_id], lazy="joined")