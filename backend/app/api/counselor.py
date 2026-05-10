
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.core.deps import get_current_user
from app.schemas.counselor import *
from app.crud import counselor as crud

router = APIRouter()

# 1. 프로필
@router.post("/counselor/profile")
def create_profile(data: CounselorProfileCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    if current_user.role != 'counselor':
        raise HTTPException(status_code=403, detail="상담사만 프로필 등록이 가능합니다.")
    return crud.create_counselor_profile(db, user_id=current_user.id, data=data)

@router.get("/counselor/profile")
def get_profile(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return crud.get_counselor_profile(db, user_id=current_user.id)

@router.put("/counselor/profile")
def update_profile(data: CounselorProfileCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return crud.update_counselor_profile(db, user_id=current_user.id, data=data)

# 2. 전문분야
@router.post("/counselor/specialty")
def add_specialty(data: CounselorSpecialtyCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return crud.add_specialty(db, user_id=current_user.id, data=data)

@router.get("/counselor/specialty")
def get_specialties(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return crud.get_specialties(db, user_id=current_user.id)

# 3. 자격증
@router.post("/counselor/certificate")
def add_certificate(data: CounselorCertificateCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return crud.add_certificate(db, user_id=current_user.id, data=data)

@router.get("/counselor/certificate")
def get_certificates(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return crud.get_certificates(db, user_id=current_user.id)

# 4. 학력
@router.post("/counselor/education")
def add_education(data: CounselorEducationCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return crud.add_education(db, user_id=current_user.id, data=data)

@router.get("/counselor/education")
def get_educations(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return crud.get_educations(db, user_id=current_user.id)

# 5. 경력
@router.post("/counselor/experience")
def add_experience(data: CounselorExperienceCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return crud.add_experience(db, user_id=current_user.id, data=data)

@router.get("/counselor/experience")
def get_experiences(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return crud.get_experiences(db, user_id=current_user.id)

# 6. 주간 상담 일정
@router.post("/counselor/schedule")
def add_schedule(data: CounselorScheduleCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return crud.add_schedule(db, user_id=current_user.id, data=data)

@router.get("/counselor/schedule")
def get_schedules(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return crud.get_schedules(db, user_id=current_user.id)

# 프로필 존재 여부
@router.get("/counselor/profile/exists")
def check_counselor_profile_exists(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    user_id = current_user.id
    from app.models.counselor import CounselorProfile, CounselorSpecialty, CounselorCertificate, CounselorEducation, CounselorExperience, CounselorSchedule
    has_profile = db.query(CounselorProfile).filter_by(user_id=user_id).first() is not None
    has_specialty = db.query(CounselorSpecialty).filter_by(user_id=user_id).first() is not None
    has_certificate = db.query(CounselorCertificate).filter_by(user_id=user_id).first() is not None
    has_education = db.query(CounselorEducation).filter_by(user_id=user_id).first() is not None
    has_experience = db.query(CounselorExperience).filter_by(user_id=user_id).first() is not None
    has_schedule = db.query(CounselorSchedule).filter_by(user_id=user_id).first() is not None
    exists = has_profile or has_specialty or has_certificate or has_education or has_experience or has_schedule
    return {"exists": exists}