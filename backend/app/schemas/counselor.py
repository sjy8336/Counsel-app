from typing import List, Optional
from pydantic import BaseModel, Field
from datetime import date, time

class CounselorProfileCreate(BaseModel):
    profile_img_url: Optional[str] = None
    center_name: str
    center_address: str
    bio: Optional[str] = None

class CounselorSpecialtyCreate(BaseModel):
    specialty_name: str

class CounselorExperienceCreate(BaseModel):
    company_name: str
    start_date: date
    end_date: Optional[date] = None
    is_current: bool = False
    description: Optional[str] = None

class CounselorEducationCreate(BaseModel):
    school_name: str
    major: str
    degree_type: Optional[str] = None  # 'bachelor', 'master', 'doctor'

class CounselorScheduleCreate(BaseModel):
    day_of_week: str  # 'mon', 'tue', ...
    start_time: str   # '09:00'
    end_time: str     # '10:00'
    is_holiday: bool = False

class CounselorFullProfileCreate(BaseModel):
    profile: CounselorProfileCreate
    specialties: List[CounselorSpecialtyCreate]
    experiences: List[CounselorExperienceCreate]
    educations: List[CounselorEducationCreate]
    schedules: List[CounselorScheduleCreate]
