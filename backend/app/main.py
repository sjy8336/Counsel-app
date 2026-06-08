import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import auth, counselor, upload, payment, booking, notification, counseling_log, holiday, schedule, blocked_slot, inquiry, ai_diary, ai_diary_recent
from app.core.config import settings

from fastapi.staticfiles import StaticFiles

app = FastAPI()

app.include_router(payment.router, prefix="/api/payment", tags=["payment"])
app.include_router(booking.router, prefix="/api/booking", tags=["booking"])

# CORS 설정
cors_origins_raw = getattr(settings, "CORS_ORIGINS", "") or "http://localhost:5173,http://localhost:3000"
allowed_origins = [origin.strip() for origin in cors_origins_raw.split(",") if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins, 
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
STATIC_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "static"))
app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")

@app.get("/")
def read_root():
    return {"Hello": "Jiyoung's World"}


app.include_router(counseling_log.router, prefix="/api/counseling-logs")
app.include_router(holiday.router)
app.include_router(schedule.router)
app.include_router(blocked_slot.router)
app.include_router(inquiry.router, prefix="/api")
app.include_router(ai_diary.router, prefix="/api")
app.include_router(ai_diary_recent.router, prefix="/api/ai-diary")
