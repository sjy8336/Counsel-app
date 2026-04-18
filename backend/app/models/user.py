from sqlalchemy import Column, Integer, String, Enum, TIMESTAMP, text
from app.db.session import Base
import datetime

class User(Base):
    __tablename__ = "users"

    # SQL의 AUTO_INCREMENT PRIMARY KEY와 매칭
    id = Column(Integer, primary_key=True, autoincrement=True)
    full_name = Column(String(100), nullable=False)
    username = Column(String(50), unique=True, nullable=False)
    email = Column(String(255), unique=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    phone_number = Column(String(20), nullable=False)
    # Enum 타입 설정
    role = Column(Enum('client', 'counselor', 'admin'), server_default='client')
    
    # 시간 관련 설정
    created_at = Column(TIMESTAMP, server_default=text('CURRENT_TIMESTAMP'))
    updated_at = Column(TIMESTAMP, server_default=text('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'))