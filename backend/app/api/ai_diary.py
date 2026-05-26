from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.schemas.ai_diary import DiaryAnalysisRequest, DiaryAnalysisResponse
from app.models.ai_diary import AIDiaryModel
from app.utils.ai_advisor import generate_ai_report
from app.core.deps import get_current_user

router = APIRouter(prefix="/ai-diary", tags=["AI Diary"])

@router.post("/analyze", response_model=DiaryAnalysisResponse)
def analyze_and_save_diary(
    data: DiaryAnalysisRequest,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    # 1. AI 분석 및 키워드 추출 진행
    analysis, healing_title, healing_desc, healing_icon, keywords = generate_ai_report(
        diary_text=data.diary_text,
        emotion=data.selected_emotion,
        intensity=data.emotion_intensity,
        stress=data.stress_level,
        nickname=current_user.full_name
    )

    # 2. DB 객체 생성 및 저장
    db_diary = AIDiaryModel(
        user_id=current_user.id,
        diary_text=data.diary_text,
        selected_emotion=data.selected_emotion,
        emotion_intensity=data.emotion_intensity,
        stress_level=data.stress_level,
        ai_analysis=analysis,
        healing_title=healing_title,
        healing_desc=healing_desc,
        healing_icon=healing_icon
    )
    db_diary.keywords = keywords # 세터 함수를 통해 json 문자열로 변환되어 들어감
    
    db.add(db_diary)
    db.commit()
    db.refresh(db_diary)
    
    # 3. 응답 객체 조립 후 반환
    return DiaryAnalysisResponse(
        id=db_diary.id,
        user_id=db_diary.user_id,
        diary_text=db_diary.diary_text,
        selected_emotion=db_diary.selected_emotion,
        emotion_intensity=db_diary.emotion_intensity,
        stress_level=db_diary.stress_level,
        ai_analysis=db_diary.ai_analysis,
        healing_title=db_diary.healing_title,
        healing_desc=db_diary.healing_desc,
        healing_icon=db_diary.healing_icon,
        keywords=db_diary.keywords,
        created_at=db_diary.created_at
    )