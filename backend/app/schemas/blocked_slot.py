from pydantic import BaseModel
from typing import Optional
from datetime import date

class BlockedSlotBase(BaseModel):
    user_id: int
    date: date
    start_time: str
    end_time: str
    reason: Optional[str] = None

class BlockedSlotCreate(BlockedSlotBase):
    pass

class BlockedSlot(BlockedSlotBase):
    id: int
    class Config:
        orm_mode = True
