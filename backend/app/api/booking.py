from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.booking import Booking
from datetime import datetime
import uuid

router = APIRouter()

@router.post("/confirm")
def confirm_booking(data: dict, db: Session = Depends(get_db)):
    """
    상담사가 예약을 승인할 때 호출 (order_id로 예약 상태를 'confirmed'로 변경)
    """
    order_id = data.get("order_id")
    if not order_id:
        raise HTTPException(status_code=400, detail="order_id가 필요합니다.")
    booking = db.query(Booking).filter(Booking.order_id == order_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="예약을 찾을 수 없습니다.")
    booking.booking_status = 'confirmed'
    db.commit()
    db.refresh(booking)
    return {"message": "예약이 승인(확정)되었습니다.", "order_id": order_id, "booking_status": booking.booking_status}

@router.post("/create")
def create_booking(booking: dict, db: Session = Depends(get_db)):
    """
    예약 생성 API (orderId는 서버에서 고유하게 생성)
    """
    counselor_name = booking.get("counselorName")
    booking_date = booking.get("selectedDate")
    booking_time = booking.get("selectedTime")
    survey = booking.get("survey") or {}
    # 더미데이터용: counselorName, centerName을 survey_content에 항상 저장
    if booking.get("counselorName"):
        survey["counselorName"] = booking["counselorName"]
    if booking.get("centerName"):
        survey["centerName"] = booking["centerName"]
    amount = booking.get("amount", 20000)
    payment_status = booking.get("paymentStatus", "pending")
    booking_status = 'waiting'
    # client_id, counselor_id 등은 실제 서비스에서는 인증 정보에서 추출 필요

    if not all([counselor_name, booking_date, booking_time]):
        raise HTTPException(status_code=400, detail="필수 예약 정보가 누락되었습니다.")

    # 날짜 파싱
    try:
        booking_date_obj = datetime.strptime(booking_date, "%Y-%m-%d").date()
    except Exception:
        raise HTTPException(status_code=400, detail="날짜 형식이 올바르지 않습니다.")

    # 프론트에서 orderId를 전달하면 그 값을 사용, 없으면 기존대로 생성
    order_id = booking.get("orderId")
    if not order_id:
        order_id = f"ORDER-{uuid.uuid4().hex[:12].upper()}"

    # 임시: client_id, counselor_id는 1로 고정 (실제 서비스에서는 유저 인증 후 값 사용)
    new_booking = Booking(
        client_id=1,
        counselor_id=1,
        booking_date=booking_date_obj,
        booking_time=booking_time,
        survey_content=survey,
        payment_status=payment_status,
        booking_status=booking_status,
        amount=amount,
        order_id=order_id
    )
    db.add(new_booking)
    db.commit()
    db.refresh(new_booking)
    return {"message": "예약이 생성되었습니다.", "orderId": order_id}

@router.get("/list")
def get_all_bookings(db: Session = Depends(get_db)):
    """
    모든 예약(취소 제외)을 반환하며, 상태/상담사/센터명도 포함
    """
    bookings = db.query(Booking).filter(Booking.payment_status != 'canceled').all()
    results = []
    for b in bookings:
        # 더미데이터(프론트에서 예약 생성 시 전달된 counselorName) 우선
        dummy_counselor_name = None
        dummy_center_name = None
        if hasattr(b, 'survey_content') and b.survey_content:
            # survey_content에 counselorName, centerName이 들어있을 수 있음
            if isinstance(b.survey_content, dict):
                dummy_counselor_name = b.survey_content.get('counselorName')
                dummy_center_name = b.survey_content.get('centerName')
        # DB에서 상담사 이름/센터명 조회
        counselor_name = dummy_counselor_name or ""
        center_name = dummy_center_name or ""
        if not counselor_name and b.counselor_id:
            from app.models.user import User
            from app.models.counselor import CounselorProfile
            user = db.query(User).filter(User.id == b.counselor_id).first()
            counselor_name = user.full_name if user else "상담사"
            profile = db.query(CounselorProfile).filter(CounselorProfile.user_id == b.counselor_id).first()
            center_name = profile.center_name if profile else "센터"
        # 상담 상태 매핑 (booking_status 기준)
        if b.booking_status == 'waiting':
            status = '예약 대기'
        elif b.booking_status == 'confirmed':
            status = '예약 확정'
        elif b.booking_status == 'completed':
            status = '상담 완료'
        else:
            status = '예약 취소'
        results.append({
            "id": b.id,
            "order_id": b.order_id,
            "name": counselor_name,
            "date": b.booking_date.strftime('%Y.%m.%d'),
            "time": b.booking_time,
            "status": status,
            "booking_status": b.booking_status,
            "payment_status": b.payment_status,
            "location": center_name or "센터"
        })
    return results

# 예약 취소(삭제) API
@router.delete("/cancel/{order_id}")
def cancel_booking(order_id: str, db: Session = Depends(get_db)):
    booking = db.query(Booking).filter(Booking.order_id == order_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="예약을 찾을 수 없습니다.")
    db.delete(booking)
    db.commit()
    return {"message": "예약이 취소(삭제)되었습니다."}

# 상담 완료 처리 API (예약 날짜+시간이 지난 경우 자동 처리용)
@router.post("/complete/{order_id}")
def complete_booking(order_id: str, db: Session = Depends(get_db)):
    booking = db.query(Booking).filter(Booking.order_id == order_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="예약을 찾을 수 없습니다.")
    booking.booking_status = 'completed'
    db.commit()
    db.refresh(booking)
    return {"message": "상담이 완료 처리되었습니다.", "order_id": order_id, "booking_status": booking.booking_status}