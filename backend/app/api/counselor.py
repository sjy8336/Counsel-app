from fastapi import APIRouter, Depends, HTTPException, Security, status, Body
from collections import defaultdict
from sqlalchemy import or_
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
def reject_counselor(user_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user), reason: str = Body(None, embed=True)):
    if current_user.role != 'admin':
        raise HTTPException(status_code=403, detail="관리자만 반려할 수 있습니다.")
    profile = db.query(CounselorProfile).filter(CounselorProfile.user_id == user_id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="상담사 프로필을 찾을 수 없습니다.")
    if profile.status == '반려':
        raise HTTPException(status_code=409, detail="이미 반려된 상담사입니다.")
    profile.status = '반려'
    profile.reject_reason = reason
    db.commit()
    # 알림 생성
    user = db.query(User).filter(User.id == user_id).first()
    if user:
        notif = NotificationCreate(
            user_id=user_id,
            type="counselor_rejected",
            title="상담사 등록이 반려되었습니다.",
            desc=reason or "관리자에 의해 상담사 등록이 반려되었습니다."
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
                "profile_img_url": user.profile_img_url,  # 프로필 이미지 경로 추가
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
def create_or_update_profile(data: CounselorProfileCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    if current_user.role != 'counselor':
        raise HTTPException(status_code=403, detail="상담사만 프로필 등록이 가능합니다.")
    exist = db.query(CounselorProfile).filter(CounselorProfile.user_id == current_user.id).first()
    if exist:
        # 반려 상태에서 등록 요청이 오면 심사중으로 변경 + 기존 이력 삭제
        return crud.update_counselor_profile(db, user_id=current_user.id, data=data)
    return crud.create_counselor_profile(db, user_id=current_user.id, data=data)

@router.get("/counselor/profile")
def get_profile(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return crud.get_counselor_profile(db, user_id=current_user.id)

@router.put("/counselor/profile")
def update_profile(data: CounselorProfileCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return crud.update_counselor_profile(db, user_id=current_user.id, data=data)


from typing import List, Optional

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
    failures = []
    for item in data:
        try:
            saved = crud.add_schedule(db, user_id=current_user.id, data=item)
            result.append({"success": True, "schedule": saved})
        except Exception as e:
            db.rollback()
            failures.append({"error": str(e), "data": item.dict() if hasattr(item, 'dict') else item})
    if failures:
        raise HTTPException(status_code=400, detail={"message": "상담 일정 저장에 실패했습니다.", "failures": failures})
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
from fastapi import Query

def _group_rows_by_user_id(rows):
    grouped = defaultdict(list)
    for row in rows:
        grouped[row.user_id].append(row)
    return grouped

@router.get("/counselors/approved")
def get_approved_counselors(
    db: Session = Depends(get_db),
    offset: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    search: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    summary: bool = Query(False),
):
    base_query = (
        db.query(CounselorProfile)
        .join(User, User.id == CounselorProfile.user_id)
        .filter(CounselorProfile.status == '수락')
    )

    if search:
        like = f"%{search}%"
        base_query = base_query.filter(
            or_(
                User.full_name.ilike(like),
                User.username.ilike(like),
                CounselorProfile.intro_line.ilike(like),
                CounselorProfile.center_name.ilike(like),
            )
        )

    if category:
        category_ids = (
            db.query(CounselorSpecialty.user_id)
            .filter(CounselorSpecialty.specialty_name == category)
            .subquery()
        )
        base_query = base_query.filter(CounselorProfile.user_id.in_(category_ids))

    total = base_query.count()
    profiles = (
        base_query
        .order_by(CounselorProfile.id.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )

    user_ids = [profile.user_id for profile in profiles]
    if not user_ids:
        return {"total": total, "counselors": []}

    user_map = {user.id: user for user in db.query(User).filter(User.id.in_(user_ids)).all()}
    specialties_by_user_id = _group_rows_by_user_id(
        db.query(CounselorSpecialty).filter(CounselorSpecialty.user_id.in_(user_ids)).all()
    )

    certificates_by_user_id = defaultdict(list)
    educations_by_user_id = defaultdict(list)
    experiences_by_user_id = defaultdict(list)
    schedules_by_user_id = defaultdict(list)

    if not summary:
        certificates_by_user_id = _group_rows_by_user_id(
            db.query(CounselorCertificate).filter(CounselorCertificate.user_id.in_(user_ids)).all()
        )
        educations_by_user_id = _group_rows_by_user_id(
            db.query(CounselorEducation).filter(CounselorEducation.user_id.in_(user_ids)).all()
        )
        experiences_by_user_id = _group_rows_by_user_id(
            db.query(CounselorExperience).filter(CounselorExperience.user_id.in_(user_ids)).all()
        )
        schedules_by_user_id = _group_rows_by_user_id(
            db.query(CounselorSchedule).filter(CounselorSchedule.user_id.in_(user_ids)).all()
        )

    result = []
    for profile in profiles:
        user = user_map.get(profile.user_id)
        # profile dict에 users.profile_img_url을 포함시켜 반환
        profile_dict = profile.__dict__.copy()
        profile_dict["profile_img_url"] = user.profile_img_url if user else None
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
            "profile": profile_dict,
            "specialties": specialties_by_user_id.get(profile.user_id, []),
            "certificates": certificates_by_user_id.get(profile.user_id, []),
            "educations": educations_by_user_id.get(profile.user_id, []),
            "experiences": experiences_by_user_id.get(profile.user_id, []),
            "schedules": schedules_by_user_id.get(profile.user_id, []),
        })
    return {"total": total, "counselors": result}

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
    # profile dict에 users.profile_img_url을 명시적으로 포함
    profile_dict = profile.__dict__.copy() if profile else None
    if profile_dict is not None and user is not None:
        profile_dict["profile_img_url"] = user.profile_img_url
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
        "profile": profile_dict,
        "specialties": specialties,
        "certificates": certificates,
        "educations": educations,
        "experiences": experiences,
        "schedules": schedules,
    }

@router.get("/counselor/certificate")
def get_certificates(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return crud.get_certificates(db, user_id=current_user.id)

@router.put("/counselor/specialty")
def update_specialties(
    data: List[CounselorSpecialtyCreate],
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    db.query(CounselorSpecialty).filter(CounselorSpecialty.user_id == current_user.id).delete()
    db.commit()
    result = []
    for item in data:
        result.append(crud.add_specialty(db, user_id=current_user.id, data=item))
    return result

@router.get("/counselor/specialty")
def get_specialties(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return crud.get_specialties(db, user_id=current_user.id)

@router.put("/counselor/certificate")
def update_certificates(
    data: List[CounselorCertificateCreate],
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    db.query(CounselorCertificate).filter(CounselorCertificate.user_id == current_user.id).delete()
    db.commit()
    result = []
    for item in data:
        result.append(crud.add_certificate(db, user_id=current_user.id, data=item))
    return result

@router.get("/counselor/certificate")
def get_certificates(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return crud.get_certificates(db, user_id=current_user.id)

@router.put("/counselor/education")
def update_educations(
    data: List[CounselorEducationCreate],
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    db.query(CounselorEducation).filter(CounselorEducation.user_id == current_user.id).delete()
    db.commit()
    result = []
    for item in data:
        result.append(crud.add_education(db, user_id=current_user.id, data=item))
    return result

@router.get("/counselor/education")
def get_educations(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return crud.get_educations(db, user_id=current_user.id)

@router.put("/counselor/experience")
def update_experiences(
    data: List[CounselorExperienceCreate],
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    db.query(CounselorExperience).filter(CounselorExperience.user_id == current_user.id).delete()
    db.commit()
    result = []
    for item in data:
        result.append(crud.add_experience(db, user_id=current_user.id, data=item))
    return result

@router.get("/counselor/experience")
def get_experiences(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return crud.get_experiences(db, user_id=current_user.id)

@router.put("/counselor/schedule")
def update_schedules(
    data: List[CounselorScheduleCreate],
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    db.query(CounselorSchedule).filter(CounselorSchedule.user_id == current_user.id).delete()
    db.commit()
    result = []
    for item in data:
        result.append(crud.add_schedule(db, user_id=current_user.id, data=item))
    return result

@router.get("/counselor/schedule")
def get_schedules(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return crud.get_schedules(db, user_id=current_user.id)
