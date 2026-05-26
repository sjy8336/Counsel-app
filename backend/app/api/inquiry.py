
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.schemas.inquiry import InquiryCreate, InquiryResponse, InquiryReply
from typing import List
from app.core.deps import get_current_user
from app.crud.inquiry import create_inquiry, get_my_inquiries as crud_get_my_inquiries, get_inquiries_for_counselor, reply_to_inquiry

router = APIRouter(prefix="/inquiries", tags=["Inquiries"])

@router.get("/received", response_model=List[InquiryResponse])
def get_received_inquiries(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    # 상담사만 가능하도록 role 체크 (옵션)
    # if current_user.role != 'counselor':
    #     raise HTTPException(status_code=403, detail="상담사만 접근 가능합니다.")
    return get_inquiries_for_counselor(db=db, counselor_id=current_user.id)

@router.get("/my", response_model=List[InquiryResponse])
def get_my_inquiries(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    return crud_get_my_inquiries(db=db, client_id=current_user.id)

@router.post("/create", response_model=InquiryResponse)
def add_inquiry(
    data: InquiryCreate, 
    db: Session = Depends(get_db), 
    current_user = Depends(get_current_user) # 내담자 인증 정보
):
    # 로그인한 유저가 내담자인지 확인하는 로직이 필요하다면 체크 추가
    return create_inquiry(db=db, data=data, client_id=current_user.id)

# 상담사 답변 등록 API
@router.put("/{inquiry_id}/reply", response_model=InquiryResponse)
def answer_inquiry(
    inquiry_id: int,
    data: InquiryReply,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user) # 로그인한 상담사 인증
):
    # 필요시 current_user.role == 'counselor' 검증 추가 가능
    updated_inquiry = reply_to_inquiry(
        db=db, 
        inquiry_id=inquiry_id, 
        answer_text=data.answer, 
        counselor_id=current_user.id
    )
    if not updated_inquiry:
        raise HTTPException(status_code=404, detail="문의를 찾을 수 없거나 답변 권한이 없습니다.")
    return updated_inquiry