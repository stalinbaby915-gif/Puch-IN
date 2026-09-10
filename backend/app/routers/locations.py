# This file turns our locations crud functions into actual callable API endpoints (URLs).
# It handles the HTTP layer only — validating requests via schemas.py and delegating all
# actual database work to crud/locations.py. No direct SQL/database queries belong here.

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from .. import schemas, crud
from ..database import get_db

router = APIRouter(prefix="/locations", tags=["locations"])


@router.post("/", response_model=schemas.LocationResponse)
def add_location(location: schemas.LocationCreate, db: Session = Depends(get_db)):
    return crud.locations.create_location(db, location)


@router.get("/", response_model=List[schemas.LocationResponse])
def list_locations(db: Session = Depends(get_db)):
    return crud.locations.get_locations(db)


@router.get("/{location_id}", response_model=schemas.LocationResponse)
def get_location(location_id: int, db: Session = Depends(get_db)):
    location = crud.locations.get_location(db, location_id)
    if location is None:
        raise HTTPException(status_code=404, detail="Location not found")
    return location