from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.ai_diary import AIDiaryModel
from app.schemas.ai_diary import DiaryAnalysisResponse
from app.core.deps import get_current_user
from typing import List

router = APIRouter()

@router.get("/recent", response_model=List[DiaryAnalysisResponse])
def get_recent_diaries(db: Session = Depends(get_db), current_user=Depends(get_current_user), limit: int = 3):
    from datetime import datetime
    diaries = (
        db.query(AIDiaryModel)
        .filter(AIDiaryModel.user_id == current_user.id)
        .order_by(AIDiaryModel.created_at.desc())
        .limit(limit)
        .all()
    )
    # created_at, ai_analysis 등 None 방지
    result = []
    for d in diaries:
        if not d.created_at:
            d.created_at = datetime.now()
        # ai_analysis가 None이면 빈 문자열로 대체
        d_dict = d.__dict__.copy()
        d_dict["ai_analysis"] = d.safe_ai_analysis
        # keywords property는 그대로 사용
        d_dict["keywords"] = d.keywords
        result.append(DiaryAnalysisResponse(**d_dict))
    return result
