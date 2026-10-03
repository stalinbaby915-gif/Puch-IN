# This file turns our shift crud functions into actual callable API endpoints.
# Every endpoint now requires a valid logged-in user (via get_current_user) and scopes
# every lookup/creation to that user_id, so punching in/out only ever affects your own data.

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from .. import schemas, crud
from ..database import get_db
from ..auth import get_current_user

router = APIRouter(prefix="/shifts", tags=["shifts"])


@router.post("/punch-in", response_model=schemas.ShiftResponse)
def punch_in(
    shift_data: schemas.ShiftPunchIn,
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user),
):
    existing_open_shift = crud.shifts.get_open_shift(db, user_id)
    if existing_open_shift is not None:
        raise HTTPException(status_code=400, detail="A shift is already in progress")
    return crud.shifts.punch_in(db, shift_data, user_id)


@router.post("/punch-out", response_model=schemas.ShiftResponse)
def punch_out(
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user),
):
    open_shift = crud.shifts.get_open_shift(db, user_id)
    if open_shift is None:
        raise HTTPException(status_code=400, detail="No shift is currently in progress")
    return crud.shifts.punch_out(db, open_shift)


@router.get("/", response_model=List[schemas.ShiftResponse])
def list_shifts(
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user),
):
    return crud.shifts.get_shifts(db, user_id)