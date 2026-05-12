
from fastapi import APIRouter, Depends, HTTPException, Security, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.core.deps import get_current_user
from app.schemas.counselor import *
from app.crud import counselor as crud
from app.models.user import User
from app.schemas.notification import NotificationCreate
from app.crud.notification import create_notification
from app.models.counselor import CounselorProfile, CounselorSpecialty, CounselorCertificate, CounselorEducation, CounselorExperience, CounselorSchedule

router = APIRouter()

# 관리자: 상담사 승인
from fastapi import Body
@router.patch("/admin/counselors/{user_id}/approve")
def approve_counselor(user_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    if current_user.role != 'admin':
        raise HTTPException(status_code=403, detail="관리자만 승인할 수 있습니다.")
    profile = db.query(CounselorProfile).filter(CounselorProfile.user_id == user_id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="상담사 프로필을 찾을 수 없습니다.")
    if profile.status == '수락':
        raise HTTPException(status_code=409, detail="이미 승인된 상담사입니다.")
    profile.status = '수락'
    db.commit()
    # 알림 생성
    user = db.query(User).filter(User.id == user_id).first()
    if user:
        notif = NotificationCreate(
            user_id=user_id,
            type="counselor_approved",
            title="상담사 등록이 승인되었습니다.",
            desc="관리자에 의해 상담사 등록이 승인되었습니다. 이제 서비스를 이용하실 수 있습니다."
        )
        create_notification(db, notif)
    return {"message": "상담사 승인 및 알림 전송 완료"}

# 관리자: 상담사 반려
@router.patch("/admin/counselors/{user_id}/reject")
def reject_counselor(user_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    if current_user.role != 'admin':
        raise HTTPException(status_code=403, detail="관리자만 반려할 수 있습니다.")
    profile = db.query(CounselorProfile).filter(CounselorProfile.user_id == user_id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="상담사 프로필을 찾을 수 없습니다.")
    if profile.status == '반려':
        raise HTTPException(status_code=409, detail="이미 반려된 상담사입니다.")
    profile.status = '반려'
    db.commit()
    # 알림 생성
    user = db.query(User).filter(User.id == user_id).first()
    if user:
        notif = NotificationCreate(
            user_id=user_id,
            type="counselor_rejected",
            title="상담사 등록이 반려되었습니다.",
            desc="관리자에 의해 상담사 등록이 반려되었습니다."
        )
        create_notification(db, notif)
    return {"message": "상담사 반려 및 알림 전송 완료"}

# 관리자: 심사중 상담사 전체 신청 내역 조회
@router.get("/admin/counselors/pending")
def get_pending_counselors(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    if current_user.role != 'admin':
        raise HTTPException(status_code=403, detail="관리자만 접근 가능합니다.")
    # status='심사중'인 프로필 전체
    profiles = db.query(CounselorProfile).filter(CounselorProfile.status == '심사중').all()
    result = []
    for profile in profiles:
        user = db.query(User).filter(User.id == profile.user_id).first()
        specialties = db.query(CounselorSpecialty).filter(CounselorSpecialty.user_id == profile.user_id).all()
        certificates = db.query(CounselorCertificate).filter(CounselorCertificate.user_id == profile.user_id).all()
        educations = db.query(CounselorEducation).filter(CounselorEducation.user_id == profile.user_id).all()
        experiences = db.query(CounselorExperience).filter(CounselorExperience.user_id == profile.user_id).all()
        schedules = db.query(CounselorSchedule).filter(CounselorSchedule.user_id == profile.user_id).all()
        result.append({
            "user": {
                "id": user.id,
                "full_name": user.full_name,
                "username": user.username,
                "email": user.email,
                "phone_number": user.phone_number,
                "birth_date": user.birth_date,
                "gender": user.gender,
            } if user else None,
            "profile": profile,
            "specialties": specialties,
            "certificates": certificates,
            "educations": educations,
            "experiences": experiences,
            "schedules": schedules,
        })
    return result

# 1. 프로필
@router.post("/counselor/profile")
def create_profile(data: CounselorProfileCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    if current_user.role != 'counselor':
        raise HTTPException(status_code=403, detail="상담사만 프로필 등록이 가능합니다.")
    # 이미 존재하는지 체크
    exist = crud.get_counselor_profile(db, user_id=current_user.id)
    if exist:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="이미 등록된 프로필이 있습니다.")
    return crud.create_counselor_profile(db, user_id=current_user.id, data=data)

@router.get("/counselor/profile")
def get_profile(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return crud.get_counselor_profile(db, user_id=current_user.id)

@router.put("/counselor/profile")
def update_profile(data: CounselorProfileCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return crud.update_counselor_profile(db, user_id=current_user.id, data=data)


from typing import List

# 2. 전문분야 (여러 개 등록)
@router.post("/counselor/specialty")
def add_specialties(
    data: List[CounselorSpecialtyCreate],
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    result = []
    for item in data:
        result.append(crud.add_specialty(db, user_id=current_user.id, data=item))
    return result

# 3. 자격증 (여러 개 등록)
@router.post("/counselor/certificate")
def add_certificates(
    data: List[CounselorCertificateCreate],
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    result = []
    for item in data:
        result.append(crud.add_certificate(db, user_id=current_user.id, data=item))
    return result

# 4. 학력 (여러 개 등록)
@router.post("/counselor/education")
def add_educations(
    data: List[CounselorEducationCreate],
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    result = []
    for item in data:
        result.append(crud.add_education(db, user_id=current_user.id, data=item))
    return result

# 5. 경력 (여러 개 등록)
@router.post("/counselor/experience")
def add_experiences(
    data: List[CounselorExperienceCreate],
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    result = []
    for item in data:
        result.append(crud.add_experience(db, user_id=current_user.id, data=item))
    return result

# 6. 주간 상담 일정 (여러 개 등록)
@router.post("/counselor/schedule")
def add_schedules(
    data: List[CounselorScheduleCreate],
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    result = []
    for item in data:
        result.append(crud.add_schedule(db, user_id=current_user.id, data=item))
    return result

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

# 승인된 상담사 전체 목록 조회 (status='수락')
@router.get("/counselors/approved")
def get_approved_counselors(db: Session = Depends(get_db)):
    profiles = db.query(CounselorProfile).filter(CounselorProfile.status == '수락').all()
    result = []
    for profile in profiles:
        user = db.query(User).filter(User.id == profile.user_id).first()
        specialties = db.query(CounselorSpecialty).filter(CounselorSpecialty.user_id == profile.user_id).all()
        certificates = db.query(CounselorCertificate).filter(CounselorCertificate.user_id == profile.user_id).all()
        educations = db.query(CounselorEducation).filter(CounselorEducation.user_id == profile.user_id).all()
        experiences = db.query(CounselorExperience).filter(CounselorExperience.user_id == profile.user_id).all()
        schedules = db.query(CounselorSchedule).filter(CounselorSchedule.user_id == profile.user_id).all()
        result.append({
            "user": {
                "id": user.id,
                "full_name": user.full_name,
                "username": user.username,
                "email": user.email,
                "phone_number": user.phone_number,
                "birth_date": user.birth_date,
                "gender": user.gender,
            } if user else None,
            "profile": profile,
            "specialties": specialties,
            "certificates": certificates,
            "educations": educations,
            "experiences": experiences,
            "schedules": schedules,
        })
    return result

@router.get("/counselors/{user_id}")
def get_counselor_detail(user_id: int, db: Session = Depends(get_db)):
    profile = db.query(CounselorProfile).filter(CounselorProfile.user_id == user_id, CounselorProfile.status == '수락').first()
    if not profile:
        raise HTTPException(status_code=404, detail="상담사 프로필을 찾을 수 없습니다.")
    user = db.query(User).filter(User.id == user_id).first()
    specialties = db.query(CounselorSpecialty).filter(CounselorSpecialty.user_id == user_id).all()
    certificates = db.query(CounselorCertificate).filter(CounselorCertificate.user_id == user_id).all()
    educations = db.query(CounselorEducation).filter(CounselorEducation.user_id == user_id).all()
    experiences = db.query(CounselorExperience).filter(CounselorExperience.user_id == user_id).all()
    schedules = db.query(CounselorSchedule).filter(CounselorSchedule.user_id == user_id).all()
    return {
        "user": {
            "id": user.id,
            "full_name": user.full_name,
            "username": user.username,
            "email": user.email,
            "phone_number": user.phone_number,
            "birth_date": user.birth_date,
            "gender": user.gender,
        } if user else None,
        "profile": profile,
        "specialties": specialties,
        "certificates": certificates,
        "educations": educations,
        "experiences": experiences,
        "schedules": schedules,
    }