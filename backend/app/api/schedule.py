
from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.holiday import Holiday
from app.models.counselor import CounselorSchedule
from typing import List
from datetime import date
from app.schemas.counselor import CounselorScheduleCreate
from app.core.deps import get_current_user
from app.models.user import User

router = APIRouter(prefix="/api/schedule", tags=["schedule"])
# 근무일(스케줄) 추가
@router.post("")
def add_schedule(
    user_id: int = Body(...),
    day_of_week: str = Body(...),
    start_time: str = Body(...),
    end_time: str = Body(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != "counselor" or current_user.id != user_id:
        raise HTTPException(status_code=403, detail="상담사 본인만 근무일을 등록할 수 있습니다.")
    # 중복 체크(동일 요일)
    exists = db.query(CounselorSchedule).filter_by(user_id=user_id, day_of_week=day_of_week).first()
    if exists:
        raise HTTPException(status_code=400, detail="이미 해당 요일에 근무일이 존재합니다.")
    schedule = CounselorSchedule(
        user_id=user_id,
        day_of_week=day_of_week,
        start_time=start_time,
        end_time=end_time
    )
    db.add(schedule)
    db.commit()
    db.refresh(schedule)
    return {"ok": True, "id": schedule.id}


# 쿼리 파라미터로 user_id를 받음 (기본값 1)
@router.get("/calendar", response_model=dict)
def get_schedule_and_holidays(user_id: int = 1, db: Session = Depends(get_db)):
    holidays = db.query(Holiday).filter(Holiday.user_id == user_id).all()
    holiday_dates = [h.date for h in holidays]
    schedules = db.query(CounselorSchedule).filter(CounselorSchedule.user_id == user_id).all()
    schedule_list = [
        {
            "day_of_week": s.day_of_week,
            "start_time": s.start_time.strftime("%H:%M"),
            "end_time": s.end_time.strftime("%H:%M")
        }
        for s in schedules
    ]
    # 전체 요일(월~일)
    all_days = ['월요일', '화요일', '수요일', '목요일', '금요일', '토요일', '일요일']
    working_days = [s.day_of_week for s in schedules]
    off_weekdays = [d for d in all_days if d not in working_days]
    return {
        "holidays": holiday_dates,
        "schedules": schedule_list,
        "off_weekdays": off_weekdays
    }
