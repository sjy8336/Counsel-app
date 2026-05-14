
from typing import List, Optional
from pydantic import BaseModel, Field

# 1. 프로필
class CounselorProfileBase(BaseModel):
    profile_img_url: Optional[str] = None
    intro_line: Optional[str] = None
    center_name: str
    center_phone: Optional[str] = None
    center_address: str
    consultation_price: Optional[int] = 0
    status: Optional[str] = '심사중'  # '심사중', '수락', '반려'

class CounselorProfileCreate(CounselorProfileBase):
    pass

class CounselorProfile(CounselorProfileBase):
    id: int
    user_id: int
    status: str
    created_at: Optional[str]
    updated_at: Optional[str]
    class Config:
        orm_mode = True

# 2. 전문분야
class CounselorSpecialtyBase(BaseModel):
    specialty_name: str
    custom_description: Optional[str] = None

class CounselorSpecialtyCreate(CounselorSpecialtyBase):
    pass

class CounselorSpecialty(CounselorSpecialtyBase):
    id: int
    user_id: int
    class Config:
        orm_mode = True

# 3. 자격증
class CounselorCertificateBase(BaseModel):
    acquisition_date: Optional[str] = None  # YYYY-MM
    certificate_name: str
    issuer: Optional[str] = None

class CounselorCertificateCreate(CounselorCertificateBase):
    pass

class CounselorCertificate(CounselorCertificateBase):
    id: int
    user_id: int
    class Config:
        orm_mode = True

# 4. 학력
class CounselorEducationBase(BaseModel):
    start_date: Optional[str] = None  # YYYY-MM
    end_date: Optional[str] = None    # YYYY-MM
    school_name: str
    major: str

class CounselorEducationCreate(CounselorEducationBase):
    pass

class CounselorEducation(CounselorEducationBase):
    id: int
    user_id: int
    class Config:
        orm_mode = True

# 5. 경력
class CounselorExperienceBase(BaseModel):
    start_date: str  # YYYY-MM
    end_date: Optional[str] = None
    is_current: Optional[bool] = False
    content: str

class CounselorExperienceCreate(CounselorExperienceBase):
    pass

class CounselorExperience(CounselorExperienceBase):
    id: int
    user_id: int
    class Config:
        orm_mode = True

# 6. 주간 상담 일정
class CounselorScheduleBase(BaseModel):
    day_of_week: str  # ex) '월요일'
    start_time: str   # '09:00:00'
    end_time: str     # '18:00:00'

class CounselorScheduleCreate(CounselorScheduleBase):
    pass

class CounselorSchedule(CounselorScheduleBase):
    id: int
    user_id: int
    class Config:
        orm_mode = True
