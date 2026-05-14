
from fastapi import APIRouter, HTTPException, Depends, Query, Body
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.booking import Booking
from app.core.deps import get_current_user
from app.models.user import User
from datetime import datetime
import uuid
router = APIRouter()

@router.get("/counselor-list")
def get_bookings_for_counselor(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    (상담사 본인만) 본인이 받은 모든 예약 목록 반환 (내담자 정보 포함)
    """
    from app.models.user import User
    from app.models.counselor import CounselorProfile
    # 상담사 본인만 조회
    bookings = db.query(Booking).filter(Booking.counselor_id == current_user.id).all()
    results = []
    for b in bookings:
        client = db.query(User).filter(User.id == b.client_id).first()
        client_name = client.full_name if client else "내담자"
        profile = db.query(CounselorProfile).filter(CounselorProfile.user_id == b.counselor_id).first()
        center_name = profile.center_name if profile else "센터"
        # 프론트 요구에 맞게 status 변환
        if b.booking_status == 'waiting':
            status = '대기 중'
        elif b.booking_status == 'confirmed':
            status = '확정됨'
        elif b.booking_status == 'completed':
            status = '상담 완료'
        else:
            status = '취소됨'
        results.append({
            "id": b.id,
            "order_id": b.order_id,
            "client_name": client_name,
            "date": b.booking_date.strftime('%Y-%m-%d'),
            "time": b.booking_time,
            "status": status,
            "location": center_name,
            "survey_content": b.survey_content,
        })
    return results

# 중복 import 및 router 선언 제거

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
def create_booking(
    booking: dict = Body(...), # Body를 명시해주는 것이 좋습니다.
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    예약 생성 API: 중복 시간 체크 및 설문 데이터 저장
    """
    # 1. 프론트엔드에서 보낸 데이터 추출
    # counselorId를 명시적으로 받도록 수정해야 합니다. (프론트에서 넘겨줘야 함)
    counselor_id = booking.get("counselorId") 
    booking_date = booking.get("selectedDate")
    booking_time = booking.get("selectedTime")
    survey = booking.get("survey") or {}
    amount = booking.get("amount", 20000)
    
    # 필수 정보 검증
    if not all([counselor_id, booking_date, booking_time]):
        raise HTTPException(status_code=400, detail="상담사 정보, 날짜, 시간은 필수입니다.")

    # 2. 날짜 파싱
    try:
        booking_date_obj = datetime.strptime(booking_date, "%Y-%m-%d").date()
    except Exception:
        raise HTTPException(status_code=400, detail="날짜 형식이 올바르지 않습니다. (YYYY-MM-DD)")

    # 3. [핵심] 중복 예약 체크 (이미 확정된 예약이 있는지)
    existing_booking = db.query(Booking).filter(
        Booking.counselor_id == counselor_id,
        Booking.booking_date == booking_date_obj,
        Booking.booking_time == booking_time,
        Booking.booking_status != 'canceled' # 취소된 예약은 제외하고 체크
    ).first()

    if existing_booking:
        raise HTTPException(status_code=400, detail="해당 시간대는 이미 예약이 완료되었습니다.")

    # 4. 설문 데이터 보강: 더미 counselorName/centerName은 저장하지 않음

    # 5. 고유 주문번호(orderId) 생성
    order_id = booking.get("orderId") or f"ORDER-{uuid.uuid4().hex[:12].upper()}"

    # 6. DB 저장
    new_booking = Booking(
        client_id=current_user.id,
        counselor_id=counselor_id, # 고정된 1 대신 실제 ID 사용
        booking_date=booking_date_obj,
        booking_time=booking_time,
        survey_content=survey, # JSON 타입 컬럼에 dict 그대로 투입
        payment_status="pending", # 초기값
        booking_status="waiting", # 관리자/상담사 승인 대기 상태
        amount=amount,
        order_id=order_id
    )

    try:
        db.add(new_booking)
        db.commit()
        db.refresh(new_booking)
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"예약 저장 중 오류 발생: {str(e)}")

    return {
        "message": "예약이 생성되었습니다.",
        "orderId": order_id,
        "bookingId": new_booking.id
    }

@router.get("/list")
def get_all_bookings(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    로그인한 사용자의 모든 예약(취소 포함) 반환
    """
    bookings = db.query(Booking).filter(
        Booking.client_id == current_user.id
    ).all()
    results = []
    from app.models.user import User
    from app.models.counselor import CounselorProfile
    for b in bookings:
        # DB에서 상담사 이름/센터명만 조회
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
            "location": center_name
        })
    return results

# 예약 취소(삭제) API
@router.delete("/cancel/{order_id}")
def cancel_booking(order_id: str, db: Session = Depends(get_db)):
    booking = db.query(Booking).filter(Booking.order_id == order_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="예약을 찾을 수 없습니다.")
    booking.booking_status = 'canceled'
    db.commit()
    db.refresh(booking)
    return {"message": "예약이 취소 처리되었습니다.", "order_id": order_id, "booking_status": booking.booking_status}

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

@router.get("/reserved-times")
def get_bookings_by_counselor_and_date(
    counselor_id: int = Query(..., description="상담사 ID"),
    date: str = Query(..., description="예약 날짜 (YYYY-MM-DD)"),
    db: Session = Depends(get_db)
):
    try:
        booking_date_obj = datetime.strptime(date, "%Y-%m-%d").date()
    except Exception:
        raise HTTPException(status_code=400, detail="날짜 형식이 올바르지 않습니다.")
    bookings = db.query(Booking).filter(
        Booking.counselor_id == counselor_id,
        Booking.booking_date == booking_date_obj,
        Booking.payment_status != 'canceled',
        Booking.booking_status != 'canceled',
    ).all()
    return [b.booking_time for b in bookings]