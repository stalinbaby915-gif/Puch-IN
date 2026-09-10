# This file turns our shift crud functions into actual callable API endpoints.
# It also holds the ONE piece of decision-making that belongs at this layer: refusing a
# punch-in if a shift is already open, and refusing a punch-out if nothing is open.

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from .. import schemas, crud
from ..database import get_db

router = APIRouter(prefix="/shifts", tags=["shifts"])


@router.post("/punch-in", response_model=schemas.ShiftResponse)
def punch_in(shift_data: schemas.ShiftPunchIn, db: Session = Depends(get_db)):
    existing_open_shift = crud.shifts.get_open_shift(db)
    if existing_open_shift is not None:
        raise HTTPException(status_code=400, detail="A shift is already in progress")
    return crud.shifts.punch_in(db, shift_data)


@router.post("/punch-out", response_model=schemas.ShiftResponse)
def punch_out(db: Session = Depends(get_db)):
    open_shift = crud.shifts.get_open_shift(db)
    if open_shift is None:
        raise HTTPException(status_code=400, detail="No shift is currently in progress")
    return crud.shifts.punch_out(db, open_shift)


@router.get("/", response_model=List[schemas.ShiftResponse])
def list_shifts(db: Session = Depends(get_db)):
    return crud.shifts.get_shifts(db)