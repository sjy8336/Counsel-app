# FastAPI 실행을 위한 기본 코드
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import auth

app = FastAPI()

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"], # 리액트 주소
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 회원가입 라우터 등록
app.include_router(auth.router)

@app.get("/")
def read_root():
    return {"Hello": "Jiyoung's World"}