from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from typing import List
from app.db.session import get_db

from app.models.blocked_slot import BlockedSlot
from app.schemas.blocked_slot import BlockedSlot as BlockedSlotSchema, BlockedSlotCreate
from app.core.deps import get_current_user
from app.models.user import User


router = APIRouter(prefix="/api/blocked-slot", tags=["blocked_slot"])


@router.post("", response_model=BlockedSlotSchema)
def create_blocked_slot(
    blocked_slot: BlockedSlotCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != "counselor" or current_user.id != blocked_slot.user_id:
        raise HTTPException(status_code=403, detail="상담사 본인만 예약 불가 시간을 등록할 수 있습니다.")
    db_block = BlockedSlot(**blocked_slot.dict())
    db.add(db_block)
    db.commit()
    db.refresh(db_block)
    return db_block

@router.get("", response_model=List[BlockedSlotSchema])
def get_blocked_slots(user_id: int, db: Session = Depends(get_db)):
    return db.query(BlockedSlot).filter(BlockedSlot.user_id == user_id).all()

@router.delete("/{block_id}")
def delete_blocked_slot(
    block_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    block = db.query(BlockedSlot).filter(BlockedSlot.id == block_id).first()
    if not block:
        raise HTTPException(status_code=404, detail="Blocked slot not found")
    if current_user.role != "counselor" or block.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="상담사 본인만 삭제할 수 있습니다.")
    db.delete(block)
    db.commit()
    return {"ok": True}
