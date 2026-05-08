# app/core/config.py
import os
from dotenv import load_dotenv
from pydantic_settings import BaseSettings

load_dotenv()


class Settings(BaseSettings):
    # 1. DB 설정 (기존 로직 유지하면서 Pydantic 방식으로 통합)
    DATABASE_URL: str = os.getenv("DATABASE_URL")
    db_host: str = None
    db_user: str = None
    db_password: str = None
    db_name: str = None

    # 2. 토스 결제 설정 (.env의 변수명과 일치해야 함)
    TOSS_SECRET_KEY: str
    TOSS_CLIENT_KEY: str

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

settings = Settings()