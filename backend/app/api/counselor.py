from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.core.deps import get_current_user
from app.schemas.counselor import CounselorFullProfileCreate
from app.crud.counselor import create_counselor_full_profile

router = APIRouter()

@router.post("/counselor/profile")
def create_counselor_profile(
    data: CounselorFullProfileCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    """
    상담사 프로필/전문분야/경력/학력/일정 전체 등록
    """
    if current_user.role != 'counselor':
        raise HTTPException(status_code=403, detail="상담사만 프로필 등록이 가능합니다.")
    profile = create_counselor_full_profile(db, user_id=current_user.id, data=data)
    return {"message": "프로필 등록 완료", "profile_id": profile.id}

from app.models.counselor import CounselorProfile, CounselorSpecialty, CounselorExperience, CounselorEducation, CounselorSchedule
@router.get("/counselor/profile/exists")
def check_counselor_profile_exists(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    """
    상담사 프로필/전문분야/경력/학력/일정 데이터가 하나라도 있으면 True, 없으면 False 반환
    """
    user_id = current_user.id
    has_profile = db.query(CounselorProfile).filter_by(user_id=user_id).first() is not None
    has_specialty = db.query(CounselorSpecialty).filter_by(user_id=user_id).first() is not None
    has_experience = db.query(CounselorExperience).filter_by(user_id=user_id).first() is not None
    has_education = db.query(CounselorEducation).filter_by(user_id=user_id).first() is not None
    has_schedule = db.query(CounselorSchedule).filter_by(user_id=user_id).first() is not None
    exists = has_profile or has_specialty or has_experience or has_education or has_schedule
    return {"exists": exists}