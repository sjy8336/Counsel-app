from pydantic import BaseModel
from datetime import date

class HolidayBase(BaseModel):
    date: date

class HolidayCreate(HolidayBase):
    pass

class HolidayDelete(HolidayBase):
    pass

class HolidayOut(HolidayBase):
    id: int
    user_id: int
    class Config:
        orm_mode = True
