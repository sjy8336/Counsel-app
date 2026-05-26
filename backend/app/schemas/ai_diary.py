from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

# 프론트엔드가 일기 저장+분석 요청할 때 보내는 데이터
class DiaryAnalysisRequest(BaseModel):
    diary_text: str
    selected_emotion: str
    emotion_intensity: int
    stress_level: int

# 프론트엔드로 보내줄 최종 AI 리포트 결과
class DiaryAnalysisResponse(BaseModel):
    id: int
    user_id: int
    diary_text: str
    selected_emotion: str
    emotion_intensity: int
    stress_level: int
    ai_analysis: str
    healing_title: str
    healing_desc: str
    healing_icon: str
    keywords: List[str]
    created_at: datetime

    class Config:
        from_attributes = True