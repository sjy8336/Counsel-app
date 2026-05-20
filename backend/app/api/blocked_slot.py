from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from typing import List
from app.db.session import get_db

from app.models.blocked_slot import BlockedSlot
from app.schemas.blocked_slot import BlockedSlot as BlockedSlotSchema, BlockedSlotCreate


router = APIRouter(prefix="/api/blocked-slot", tags=["blocked_slot"])


@router.post("", response_model=BlockedSlotSchema)
def create_blocked_slot(blocked_slot: BlockedSlotCreate, db: Session = Depends(get_db)):
    db_block = BlockedSlot(**blocked_slot.dict())
    db.add(db_block)
    db.commit()
    db.refresh(db_block)
    return db_block

@router.get("", response_model=List[BlockedSlotSchema])
def get_blocked_slots(user_id: int, db: Session = Depends(get_db)):
    return db.query(BlockedSlot).filter(BlockedSlot.user_id == user_id).all()

@router.delete("/{block_id}")
def delete_blocked_slot(block_id: int, db: Session = Depends(get_db)):
    block = db.query(BlockedSlot).filter(BlockedSlot.id == block_id).first()
    if not block:
        raise HTTPException(status_code=404, detail="Blocked slot not found")
    db.delete(block)
    db.commit()
    return {"ok": True}
