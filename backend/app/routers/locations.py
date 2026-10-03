# This file turns our locations crud functions into actual callable API endpoints.
# Every endpoint now requires a valid logged-in user (via get_current_user) and passes
# their user_id through to crud, so each person only ever touches their own data.

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from .. import schemas, crud
from ..database import get_db
from ..auth import get_current_user

router = APIRouter(prefix="/locations", tags=["locations"])


@router.post("/", response_model=schemas.LocationResponse)
def add_location(
    location: schemas.LocationCreate,
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user),
):
    return crud.locations.create_location(db, location, user_id)


@router.get("/", response_model=List[schemas.LocationResponse])
def list_locations(
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user),
):
    return crud.locations.get_locations(db, user_id)


@router.get("/{location_id}", response_model=schemas.LocationResponse)
def get_location(
    location_id: int,
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user),
):
    location = crud.locations.get_location(db, location_id, user_id)
    if location is None:
        raise HTTPException(status_code=404, detail="Location not found")
    return location