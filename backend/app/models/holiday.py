from sqlalchemy import Column, Integer, String, Date, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from app.db.session import Base

class Holiday(Base):
    __tablename__ = "holiday"
    id = Column(Integer, primary_key=True, index=True)
    date = Column(Date, nullable=False)
    user_id = Column(Integer, ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    __table_args__ = (UniqueConstraint('date', 'user_id', name='uix_date_user'),)
