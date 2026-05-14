
from sqlalchemy import Column, Integer, String, Text, ForeignKey, Enum, Time, Boolean, Date, TIMESTAMP, UniqueConstraint
from app.db.session import Base

class CounselorProfile(Base):
    __tablename__ = 'counselor_profiles'
    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey('users.id', ondelete='CASCADE'), unique=True, nullable=False, comment='users 테이블의 id 참조')
    profile_img_url = Column(Text, comment='프로필 이미지 (Base64 또는 URL)')
    intro_line = Column(String(100), comment='한줄 소개 (최대 40자)')
    center_name = Column(String(100), nullable=False, comment='상담소명')
    center_phone = Column(String(20), comment='상담소 전화번호')
    center_address = Column(String(255), nullable=False, comment='상담소 주소')
    consultation_price = Column(Integer, default=0, comment='상담 가격 (1회 기준)')
    status = Column(Enum('심사중', '수락', '반려', name='profile_status'), nullable=False, default='심사중', comment='프로필 심사 상태')
    from sqlalchemy import text
    created_at = Column(TIMESTAMP, server_default=text("CURRENT_TIMESTAMP"))
    updated_at = Column(TIMESTAMP, server_default=text("CURRENT_TIMESTAMP"), onupdate=text("CURRENT_TIMESTAMP"))

class CounselorSpecialty(Base):
    __tablename__ = 'counselor_specialties'
    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    specialty_name = Column(String(50), nullable=False, comment='분야명 (개인심리, 취업상담 등)')
    custom_description = Column(Text, comment='기타 전문분야 직접 입력 내용')

class CounselorCertificate(Base):
    __tablename__ = 'counselor_certificates'
    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    acquisition_date = Column(String(10), comment='취득일 (YYYY-MM)')
    certificate_name = Column(String(100), nullable=False, comment='자격증명')
    issuer = Column(String(100), comment='발급기관')

class CounselorEducation(Base):
    __tablename__ = 'counselor_educations'
    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    start_date = Column(String(10), comment='입학일 (YYYY-MM)')
    end_date = Column(String(10), comment='졸업일 (YYYY-MM)')
    school_name = Column(String(100), nullable=False, comment='학교명')
    major = Column(String(100), nullable=False, comment='전공 및 학위')

class CounselorExperience(Base):
    __tablename__ = 'counselor_experiences'
    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    start_date = Column(String(10), nullable=False, comment='시작일 (YYYY-MM)')
    end_date = Column(String(10), comment='종료일 (현재진행중이면 NULL)')
    is_current = Column(Boolean, default=False, comment='현재 진행중 여부 (1이면 진행중)')
    content = Column(Text, nullable=False, comment='활동 내용 (소속 및 직책)')

class CounselorSchedule(Base):
    __tablename__ = 'counselor_schedules'
    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    day_of_week = Column(Enum('월요일', '화요일', '수요일', '목요일', '금요일', '토요일', '일요일'), nullable=False)
    start_time = Column(Time, nullable=False, comment='상담 시작 시간')
    end_time = Column(Time, nullable=False, comment='상담 종료 시간')