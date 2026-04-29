# FastAPI 실행을 위한 기본 코드
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import auth
from app.api import counselor
from app.api import upload

from fastapi.staticfiles import StaticFiles
import os

app = FastAPI()

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"], # 리액트 주소
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# 회원가입/로그인 라우터 등록

# 회원가입/로그인 라우터 등록
app.include_router(auth.router)
# 상담사 프로필 등록 라우터 등록
app.include_router(counselor.router)
# 프로필 이미지 업로드 라우터 등록
app.include_router(upload.router)

# 정적 파일 서빙 (profile_images 등)
STATIC_DIR = os.path.join(os.path.dirname(__file__), "static")
app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")

@app.get("/")
def read_root():
    return {"Hello": "Jiyoung's World"}