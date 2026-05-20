from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.db.session import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.crud import counseling_log as crud_log
from app.schemas.counseling_log import CounselingLogCreate, CounselingLogResponse

router = APIRouter(tags=["Counseling Logs"])

# 1. 특정 내담자 히스토리 전체 조회 (화면 왼쪽 리스트 클릭 시)
@router.get("/client/{client_id}", response_model=List[CounselingLogResponse])
def read_client_logs(client_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role != "counselor":
        raise HTTPException(status_code=403, detail="상담사만 접근 가능합니다.")
    return crud_log.get_client_logs(db, client_id=client_id, counselor_id=current_user.id)

# 2. 새 일지 저장 (+ 새 일지 작성 모달 완료 버튼)
@router.post("/create", response_model=CounselingLogResponse)
def add_counseling_log(data: CounselingLogCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role != "counselor":
        raise HTTPException(status_code=403, detail="상담사만 일지를 작성할 수 있습니다.")
    try:
        return crud_log.create_log(db, data=data, counselor_id=current_user.id)
    except Exception as e:
        from sqlalchemy.exc import IntegrityError
        if isinstance(e, IntegrityError):
            raise HTTPException(status_code=409, detail="이미 해당 예약에 대한 상담일지가 존재합니다.")
        raise

# 3. 일지 수정 (수정 완료 버튼)
@router.put("/{log_id}", response_model=CounselingLogResponse)
def modify_counseling_log(log_id: int, content: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role != "counselor":
        raise HTTPException(status_code=403, detail="권한이 없습니다.")
    updated = crud_log.update_log(db, log_id=log_id, content=content, counselor_id=current_user.id)
    if not updated:
        raise HTTPException(status_code=404, detail="일지를 찾을 수 없거나 수정 권한이 없습니다.")
    return updated

# 4. 일지 삭제 (삭제 모달 삭제하기 버튼)
@router.delete("/{log_id}")
def remove_counseling_log(log_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role != "counselor":
        raise HTTPException(status_code=403, detail="권한이 없습니다.")
    success = crud_log.delete_log(db, log_id=log_id, counselor_id=current_user.id)
    if not success:
        raise HTTPException(status_code=404, detail="삭제 실패")
    return {"message": "성공적으로 삭제되었습니다."}