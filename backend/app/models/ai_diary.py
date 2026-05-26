from sqlalchemy import Column, Integer, String, Text, ForeignKey, TIMESTAMP, text
import json
from app.db.session import Base

class AIDiaryModel(Base):
    __tablename__ = "ai_diaries"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    diary_text = Column(Text, nullable=False)
    selected_emotion = Column(String(20), nullable=False)
    emotion_intensity = Column(Integer, nullable=False)
    stress_level = Column(Integer, nullable=False)
    
    ai_analysis = Column(Text, nullable=True)
    healing_title = Column(String(100), nullable=True)
    healing_desc = Column(String(255), nullable=True)
    healing_icon = Column(String(20), nullable=True)  # AI 추천 아이콘
    _keywords = Column("keywords", String(255), nullable=True) # JSON 문자열 저장용

    created_at = Column(TIMESTAMP, server_default=text('CURRENT_TIMESTAMP'))

    @property
    def safe_ai_analysis(self):
        return self.ai_analysis if self.ai_analysis is not None else ""

    # 키워드 리스트를 DB에 문자열로 넣고 뺄 때 자동 변환해주는 프로퍼티
    @property
    def keywords(self) -> list:
        try:
            return json.loads(self._keywords) if self._keywords else []
        except Exception:
            return []

    @keywords.setter
    def keywords(self, value: list):
        self._keywords = json.dumps(value, ensure_ascii=False)