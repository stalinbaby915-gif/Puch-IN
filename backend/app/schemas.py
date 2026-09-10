# This file defines the "shape" of JSON data going in and out of our API — separate from
# models.py, which defines the database shape. Pydantic uses these classes to automatically
# validate incoming requests (reject bad data) and format outgoing responses as clean JSON.

from pydantic import BaseModel
from typing import Optional
from datetime import datetime


# ---------- Location schemas ----------

class LocationBase(BaseModel):
    name: str
    color: str = "#1E1E1E"
    hourly_rate: float = 0.0


class LocationCreate(LocationBase):
    pass  # same fields as LocationBase — used when creating a new location


class LocationResponse(LocationBase):
    id: int

    class Config:
        from_attributes = True  # lets Pydantic read directly from a SQLAlchemy object


# ---------- Shift schemas ----------

class ShiftPunchIn(BaseModel):
    location_id: int
    notes: Optional[str] = None


class ShiftResponse(BaseModel):
    id: int
    start_time: datetime
    end_time: Optional[datetime] = None
    hours_worked: Optional[float] = None
    notes: Optional[str] = None
    location: LocationResponse

    class Config:
        from_attributes = True