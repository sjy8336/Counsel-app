# FastAPI 실행을 위한 기본 코드
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import auth, counselor, upload, payment, booking, notification, counseling_log, holiday, schedule, blocked_slot

from fastapi.staticfiles import StaticFiles
import os

app = FastAPI()

app.include_router(payment.router, prefix="/api/payment", tags=["payment"])
app.include_router(booking.router, prefix="/api/booking", tags=["booking"])

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"], # 리액트 주소
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# 회원가입/로그인 라우터 등록
app.include_router(auth.router, prefix="/api")
app.include_router(counselor.router, prefix="/api")
app.include_router(notification.router, prefix="/api")
app.include_router(upload.router)

# 정적 파일 서빙 (profile_images 등)
STATIC_DIR = os.path.join(os.path.dirname(__file__), "static")
app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")

@app.get("/")
def read_root():
    return {"Hello": "Jiyoung's World"}

app.include_router(auth.router)
app.include_router(booking.router)
app.include_router(counselor.router)
app.include_router(counseling_log.router, prefix="/api/counseling-logs")
app.include_router(holiday.router)
app.include_router(schedule.router)
app.include_router(blocked_slot.router)