from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.holiday import Holiday
from app.schemas.holiday import HolidayCreate, HolidayDelete, HolidayOut
from typing import List
from datetime import date

router = APIRouter(prefix="/api/holiday", tags=["holiday"])



@router.get("", response_model=List[date])
def get_holidays(user_id: int, db: Session = Depends(get_db)):
    holidays = db.query(Holiday).filter(Holiday.user_id == user_id).all()
    return [h.date for h in holidays]

@router.post("", response_model=HolidayOut)
def add_holiday(data: HolidayCreate, user_id: int, db: Session = Depends(get_db)):
    exists = db.query(Holiday).filter(Holiday.user_id == user_id, Holiday.date == data.date).first()
    if exists:
        raise HTTPException(status_code=400, detail="이미 등록된 휴무일입니다.")
    holiday = Holiday(date=data.date, user_id=user_id)
    db.add(holiday)
    db.commit()
    db.refresh(holiday)
    return holiday

@router.delete("", response_model=dict)
def remove_holiday(data: HolidayDelete, user_id: int, db: Session = Depends(get_db)):
    holiday = db.query(Holiday).filter(Holiday.user_id == user_id, Holiday.date == data.date).first()
    if not holiday:
        raise HTTPException(status_code=404, detail="휴무일이 존재하지 않습니다.")
    db.delete(holiday)
    db.commit()
    return {"ok": True}
