from sqlalchemy.orm import Session
from datetime import datetime
from app.models.inquiry import CounselorInquiry
from app.schemas.inquiry import InquiryCreate

def get_inquiries_for_counselor(db: Session, counselor_id: int):
    # join으로 내담자 이름까지 포함해서 반환
    inquiries = db.query(CounselorInquiry).filter(CounselorInquiry.counselor_id == counselor_id).order_by(CounselorInquiry.created_at.desc()).all()
    result = []
    for inquiry in inquiries:
        client_name = None
        if hasattr(inquiry, "client") and inquiry.client:
            client_name = inquiry.client.full_name
        # answer 필드가 answer 또는 myReply로 매핑될 수 있음
        result.append({
            "id": inquiry.id,
            "client_id": inquiry.client_id,
            "counselor_id": inquiry.counselor_id,
            "type": inquiry.type,
            "title": inquiry.title,
            "content": inquiry.content,
            "status": inquiry.status,
            "answer": inquiry.answer,
            "created_at": inquiry.created_at,
            "client_name": client_name,
        })
    return result

def get_my_inquiries(db: Session, client_id: int):
    return db.query(CounselorInquiry).filter(CounselorInquiry.client_id == client_id).order_by(CounselorInquiry.created_at.desc()).all()

def create_inquiry(db: Session, data: InquiryCreate, client_id: int):
    db_inquiry = CounselorInquiry(
        client_id=client_id,  # 로그인한 세션 토큰에서 꺼낸 내담자 id
        counselor_id=data.counselor_id,
        type=data.type,
        title=data.title,
        content=data.content
    )
    db.add(db_inquiry)
    db.commit()
    db.refresh(db_inquiry)
    return db_inquiry

def reply_to_inquiry(db: Session, inquiry_id: int, answer_text: str, counselor_id: int):
    # 본인에게 온 문의만 수정할 수 있도록 counselor_id 필터링을 걸어 보안을 강화합니다.
    db_inquiry = db.query(CounselorInquiry).filter(
        CounselorInquiry.id == inquiry_id,
        CounselorInquiry.counselor_id == counselor_id
    ).first()
    
    if db_inquiry:
        db_inquiry.answer = answer_text
        db_inquiry.status = "completed"
        db_inquiry.answered_at = datetime.now()
        db.commit()
        db.refresh(db_inquiry)
    return db_inquiry