from fastapi import APIRouter, HTTPException, Depends, Query, Body
from sqlalchemy import and_, or_
from sqlalchemy.orm import Session
from typing import Optional
from app.db.session import get_db
from app.models.booking import Booking
from app.core.deps import get_current_user
from app.models.user import User
from datetime import datetime
import uuid
from app.services.notification_service import (
    send_booking_request_notification,
    send_booking_confirmed_notification,
    send_booking_rejected_notification
)
from app.models.counselor import CounselorProfile

router = APIRouter()

@router.post("/reject")
def reject_booking(data: dict, db: Session = Depends(get_db)):
    """
    상담사가 예약을 거절(취소)할 때 호출 (order_id로 예약 상태를 'canceled'로 변경)
    """
    order_id = data.get("order_id")
    if not order_id:
        raise HTTPException(status_code=400, detail="order_id가 필요합니다.")
    booking = db.query(Booking).filter(Booking.order_id == order_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="예약을 찾을 수 없습니다.")
    booking.booking_status = 'canceled'
    db.commit()
    db.refresh(booking)
    # 알림: 내담자에게 예약 거절/취소 알림
    if booking.client_id:
        counselor = db.query(User).filter(User.id == booking.counselor_id).first()
        send_booking_rejected_notification(
            db,
            client_id=booking.client_id,
            counselor_name=counselor.full_name if counselor else '',
            booking_date=str(booking.booking_date),
            booking_time=booking.booking_time
        )
    return {"message": "예약이 거절(취소)되었습니다.", "order_id": order_id, "booking_status": booking.booking_status}



@router.get("/counselor-list")
def get_bookings_for_counselor(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    (상담사 본인만) 본인이 받은 모든 예약 목록 반환 (내담자 정보 포함)
    """
    bookings = (
        db.query(Booking, User, CounselorProfile)
        .outerjoin(User, User.id == Booking.client_id)
        .outerjoin(CounselorProfile, CounselorProfile.user_id == Booking.counselor_id)
        .filter(Booking.counselor_id == current_user.id)
        .order_by(Booking.booking_date.desc(), Booking.booking_time.desc())
        .all()
    )
    results = []
    for booking, client, profile in bookings:
        # client_name이 있으면 우선 사용, 없으면 기존 로직
        if booking.client_name:
            client_name = booking.client_name
            client_id = None
            client_birth = ""
            client_gender = ""
            client_phone = booking.client_phone
            client_profile_img_url = None
        else:
            client_name = client.full_name if client else "내담자"
            client_id = client.id if client else None
            client_birth = client.birth_date if client else ""
            client_gender = client.gender if client else ""
            client_phone = client.phone_number if client else ""
            client_profile_img_url = client.profile_img_url if client else None
        center_name = profile.center_name if profile else "센터"
        # 프론트 요구에 맞게 status 변환
        if booking.booking_status == 'waiting':
            status = '대기 중'
        elif booking.booking_status == 'confirmed':
            status = '확정됨'
        elif booking.booking_status == 'completed':
            status = '상담 완료'
        else:
            status = '취소됨'
        results.append({
            "id": booking.id,
            "order_id": booking.order_id,
            "client_id": client_id,
            "client_name": client_name,
            "client_birth": client_birth,
            "client_gender": client_gender,
            "client_phone": client_phone,
            "client_profile_img_url": client_profile_img_url,
            "date": booking.booking_date.strftime('%Y-%m-%d'),
            "time": booking.booking_time,
            "status": status,
            "location": center_name,
            "survey_content": booking.survey_content,
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
    # 알림: 내담자에게 예약 확정 알림
    if booking.client_id:
        counselor = db.query(User).filter(User.id == booking.counselor_id).first()
        send_booking_confirmed_notification(
            db,
            client_id=booking.client_id,
            counselor_name=counselor.full_name if counselor else '',
            booking_date=str(booking.booking_date),
            booking_time=booking.booking_time
        )
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
    counselor_id = booking.get("counselorId") 
    booking_date = booking.get("selectedDate")
    booking_time = booking.get("selectedTime")
    survey = booking.get("survey") or {}
    amount = booking.get("amount", 20000)
    client_name = booking.get("clientName") or booking.get("client_name")
    client_phone = booking.get("clientPhone") or booking.get("client_phone")

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

    # 5. 고유 주문번호(orderId) 생성
    order_id = booking.get("orderId") or f"ORDER-{uuid.uuid4().hex[:12].upper()}"

    # 6. DB 저장
    if client_name:
        new_booking = Booking(
            client_id=None,
            client_name=client_name,
            client_phone=client_phone,
            counselor_id=counselor_id,
            booking_date=booking_date_obj,
            booking_time=booking_time,
            survey_content=survey,
            payment_status="pending",
            booking_status="waiting",
            amount=amount,
            order_id=order_id
        )
    else:
        new_booking = Booking(
            client_id=current_user.id,
            client_name=None,
            counselor_id=counselor_id,
            booking_date=booking_date_obj,
            booking_time=booking_time,
            survey_content=survey,
            payment_status="pending",
            booking_status="waiting",
            amount=amount,
            order_id=order_id
        )


    try:
        db.add(new_booking)
        db.commit()
        db.refresh(new_booking)
        # 예약 생성 성공 시 상담사에게 예약 신청 알림 전송
        send_booking_request_notification(
            db=db,
            counselor_id=counselor_id,
            client_name=client_name or current_user.full_name,
            booking_date=booking_date,
            booking_time=booking_time
        )
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
    current_user: User = Depends(get_current_user),
    upcoming_only: bool = Query(False),
    limit: Optional[int] = Query(None, ge=1, le=50),
):
    """
    로그인한 사용자의 모든 예약(취소 포함) 반환
    """
    query = (
        db.query(Booking, User, CounselorProfile)
        .join(User, User.id == Booking.counselor_id)
        .outerjoin(CounselorProfile, CounselorProfile.user_id == Booking.counselor_id)
        .filter(Booking.client_id == current_user.id)
    )

    if upcoming_only:
        now = datetime.now()
        today = now.date()
        current_time = now.strftime("%H:%M")
        query = query.filter(
            Booking.booking_status != 'canceled',
            or_(
                Booking.booking_date > today,
                and_(Booking.booking_date == today, Booking.booking_time >= current_time),
            ),
        ).order_by(Booking.booking_date.asc(), Booking.booking_time.asc())
    else:
        query = query.order_by(Booking.booking_date.desc(), Booking.booking_time.desc())

    if limit is not None:
        query = query.limit(limit)

    bookings = query.all()
    results = []
    for booking, user, profile in bookings:
        counselor_name = user.full_name if user else "상담사"
        center_name = profile.center_name if profile else "센터"
        # 상담 상태 매핑 (booking_status 기준)
        if booking.booking_status == 'waiting':
            status = '예약 대기'
        elif booking.booking_status == 'confirmed':
            status = '예약 확정'
        elif booking.booking_status == 'completed':
            status = '상담 완료'
        else:
            status = '예약 취소'
        results.append({
            "id": booking.id,
            "order_id": booking.order_id,
            "name": counselor_name,
            "date": booking.booking_date.strftime('%Y.%m.%d'),
            "time": booking.booking_time,
            "status": status,
            "booking_status": booking.booking_status,
            "payment_status": booking.payment_status,
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


@router.delete("/remove/{order_id}")
def remove_booking_history(
    order_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    booking = db.query(Booking).filter(Booking.order_id == order_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="예약을 찾을 수 없습니다.")

    is_owner = booking.counselor_id == current_user.id or booking.client_id == current_user.id
    if not is_owner:
        raise HTTPException(status_code=403, detail="해당 예약을 삭제할 권한이 없습니다.")

    if booking.booking_status not in ('canceled', 'completed'):
        raise HTTPException(status_code=400, detail="취소/완료된 예약만 삭제할 수 있습니다.")

    db.delete(booking)
    db.commit()

    return {"message": "예약 내역이 삭제되었습니다.", "order_id": order_id}

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
