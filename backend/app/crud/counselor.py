def delete_all_counselor_related_data(db: Session, user_id: int):
    db.query(CounselorCertificate).filter(CounselorCertificate.user_id == user_id).delete()
    db.query(CounselorEducation).filter(CounselorEducation.user_id == user_id).delete()
    db.query(CounselorExperience).filter(CounselorExperience.user_id == user_id).delete()
    db.query(CounselorSpecialty).filter(CounselorSpecialty.user_id == user_id).delete()
    db.query(CounselorSchedule).filter(CounselorSchedule.user_id == user_id).delete()
    db.commit()
from datetime import time

from sqlalchemy.orm import Session
from app.models.counselor import (
    CounselorProfile, CounselorSpecialty, CounselorCertificate, CounselorEducation, CounselorExperience, CounselorSchedule
)
from app.schemas.counselor import (
    CounselorProfileCreate, CounselorSpecialtyCreate, CounselorCertificateCreate, CounselorEducationCreate, CounselorExperienceCreate, CounselorScheduleCreate
)

def safe_time_fromisoformat(value):
    # '8:00:00' -> '08:00:00' 보정
    parts = value.split(":")
    if parts and len(parts[0]) == 1:
        value = f"0{value}"
    return time.fromisoformat(value)

# 1. 프로필 생성/수정/조회
def create_counselor_profile(db: Session, user_id: int, data: CounselorProfileCreate):
    profile = CounselorProfile(user_id=user_id, **data.dict(exclude={"status"}), status='심사중')
    db.add(profile)
    db.commit()
    db.refresh(profile)
    return profile

def get_counselor_profile(db: Session, user_id: int):
    profile = db.query(CounselorProfile).filter(CounselorProfile.user_id == user_id).first()
    if not profile:
        return None
    # User 테이블에서 username, email, full_name, phone_number 가져오기
    from app.models.user import User
    user = db.query(User).filter(User.id == user_id).first()
    profile_dict = profile.__dict__.copy()
    if user:
        profile_dict['username'] = user.username
        profile_dict['user_email'] = user.email
        profile_dict['user_name'] = user.full_name
        profile_dict['user_phone'] = user.phone_number
    else:
        profile_dict['username'] = None
        profile_dict['user_email'] = None
        profile_dict['user_name'] = None
        profile_dict['user_phone'] = None
    profile_dict.pop('_sa_instance_state', None)
    return profile_dict

def update_counselor_profile(db: Session, user_id: int, data: CounselorProfileCreate):
    profile = db.query(CounselorProfile).filter(CounselorProfile.user_id == user_id).first()
    if not profile:
        return None
    # 반려 상태에서 등록 요청이 오면 심사중으로 변경 + 기존 이력 삭제
    if profile.status == '반려':
        profile.status = '심사중'
        delete_all_counselor_related_data(db, user_id)
    for k, v in data.dict(exclude_unset=True).items():
        setattr(profile, k, v)
    db.commit()
    db.refresh(profile)
    return profile

# 2. 전문분야
def add_specialty(db: Session, user_id: int, data: CounselorSpecialtyCreate):
    specialty = CounselorSpecialty(user_id=user_id, **data.dict())
    db.add(specialty)
    db.commit()
    db.refresh(specialty)
    return specialty

def get_specialties(db: Session, user_id: int):
    return db.query(CounselorSpecialty).filter(CounselorSpecialty.user_id == user_id).all()

# 3. 자격증
def add_certificate(db: Session, user_id: int, data: CounselorCertificateCreate):
    cert = CounselorCertificate(user_id=user_id, **data.dict())
    db.add(cert)
    db.commit()
    db.refresh(cert)
    return cert

def get_certificates(db: Session, user_id: int):
    return db.query(CounselorCertificate).filter(CounselorCertificate.user_id == user_id).all()

# 4. 학력
def add_education(db: Session, user_id: int, data: CounselorEducationCreate):
    edu = CounselorEducation(user_id=user_id, **data.dict())
    db.add(edu)
    db.commit()
    db.refresh(edu)
    return edu

def get_educations(db: Session, user_id: int):
    return db.query(CounselorEducation).filter(CounselorEducation.user_id == user_id).all()

# 5. 경력
def add_experience(db: Session, user_id: int, data: CounselorExperienceCreate):
    exp = CounselorExperience(user_id=user_id, **data.dict())
    db.add(exp)
    db.commit()
    db.refresh(exp)
    return exp

def get_experiences(db: Session, user_id: int):
    return db.query(CounselorExperience).filter(CounselorExperience.user_id == user_id).all()

# 6. 주간 상담 일정
def add_schedule(db: Session, user_id: int, data: CounselorScheduleCreate):
    payload = data.dict()
    for key in ("start_time", "end_time"):
        value = payload.get(key)
        if isinstance(value, str):
            payload[key] = safe_time_fromisoformat(value)
    sch = CounselorSchedule(user_id=user_id, **payload)
    db.add(sch)
    db.commit()
    db.refresh(sch)
    return sch

def get_schedules(db: Session, user_id: int):
    return db.query(CounselorSchedule).filter(CounselorSchedule.user_id == user_id).all()
