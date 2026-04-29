from sqlalchemy import Column, Integer, String, Text, ForeignKey, Enum, Time, Boolean, Date, TIMESTAMP
from sqlalchemy.orm import relationship
from app.db.session import Base
import enum

class CounselorProfile(Base):
    __tablename__ = 'counselor_profiles'
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id', ondelete='CASCADE'), unique=True, nullable=False)
    profile_img_url = Column(String(255))
    center_name = Column(String(100), nullable=False)
    center_address = Column(String(255), nullable=False)
    bio = Column(Text)
    created_at = Column(TIMESTAMP, server_default="CURRENT_TIMESTAMP")
    updated_at = Column(TIMESTAMP, server_default="CURRENT_TIMESTAMP", onupdate="CURRENT_TIMESTAMP")

class CounselorSpecialty(Base):
    __tablename__ = 'counselor_specialties'
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    specialty_name = Column(String(50), nullable=False)

class CounselorExperience(Base):
    __tablename__ = 'counselor_experiences'
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    company_name = Column(String(100), nullable=False)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=True)
    is_current = Column(Boolean, default=False)
    description = Column(Text)

class DegreeTypeEnum(enum.Enum):
    bachelor = 'bachelor'
    master = 'master'
    doctor = 'doctor'

class CounselorEducation(Base):
    __tablename__ = 'counselor_educations'
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    school_name = Column(String(100), nullable=False)
    major = Column(String(100), nullable=False)
    degree_type = Column(Enum(DegreeTypeEnum))

class DayOfWeekEnum(enum.Enum):
    mon = 'mon'
    tue = 'tue'
    wed = 'wed'
    thu = 'thu'
    fri = 'fri'
    sat = 'sat'
    sun = 'sun'

class CounselorSchedule(Base):
    __tablename__ = 'counselor_schedules'
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    day_of_week = Column(Enum(DayOfWeekEnum), nullable=False)
    start_time = Column(Time, nullable=False)
    end_time = Column(Time, nullable=False)
    is_holiday = Column(Boolean, default=False)
