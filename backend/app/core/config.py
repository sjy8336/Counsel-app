# app/core/config.py
import os
from dotenv import load_dotenv
from pydantic_settings import BaseSettings
from typing import Optional

load_dotenv()

class Settings(BaseSettings):
    # 1. DB 설정 (기존 로직 유지하면서 Pydantic 방식으로 통합)
    DATABASE_URL: str = os.getenv("DATABASE_URL")
    db_host: Optional[str] = None
    db_user: Optional[str] = None
    db_password: Optional[str] = None
    db_name: Optional[str] = None

    # 2. 토스 결제 설정 (.env의 변수명과 일치해야 함)
    TOSS_SECRET_KEY: str
    TOSS_CLIENT_KEY: str

    # 3. JWT 시크릿키 (.env의 SECRET_KEY와 일치해야 함)
    SECRET_KEY: str

    # 4. OpenAI API 키 (.env의 OPENAI_API_KEY와 일치해야 함)
    OPENAI_API_KEY: Optional[str] = None

    # 5. CORS 허용 오리진 (콤마로 여러 개 설정 가능)
    CORS_ORIGINS: str = os.getenv("CORS_ORIGINS", "http://localhost:5173")

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

settings = Settings()
