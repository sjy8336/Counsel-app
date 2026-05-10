
from sqlalchemy.orm import Session
from app.models.counselor import (
    CounselorProfile, CounselorSpecialty, CounselorCertificate, CounselorEducation, CounselorExperience, CounselorSchedule
)
from app.schemas.counselor import (
    CounselorProfileCreate, CounselorSpecialtyCreate, CounselorCertificateCreate, CounselorEducationCreate, CounselorExperienceCreate, CounselorScheduleCreate
)

# 1. 프로필 생성/수정/조회
def create_counselor_profile(db: Session, user_id: int, data: CounselorProfileCreate):
    profile = CounselorProfile(user_id=user_id, **data.dict())
    db.add(profile)
    db.commit()
    db.refresh(profile)
    return profile

def get_counselor_profile(db: Session, user_id: int):
    return db.query(CounselorProfile).filter(CounselorProfile.user_id == user_id).first()

def update_counselor_profile(db: Session, user_id: int, data: CounselorProfileCreate):
    profile = db.query(CounselorProfile).filter(CounselorProfile.user_id == user_id).first()
    if not profile:
        return None
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
    sch = CounselorSchedule(user_id=user_id, **data.dict())
    db.add(sch)
    db.commit()
    db.refresh(sch)
    return sch

def get_schedules(db: Session, user_id: int):
    return db.query(CounselorSchedule).filter(CounselorSchedule.user_id == user_id).all()
