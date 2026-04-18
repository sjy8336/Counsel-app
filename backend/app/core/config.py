# app/core/config.py
import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    # .env 파일에서 DATABASE_URL이라는 글자를 찾아옵니다.
    DATABASE_URL: str = os.getenv("DATABASE_URL")

settings = Settings()