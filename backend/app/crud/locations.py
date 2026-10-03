# This file is the ONLY place allowed to touch the "locations" table directly.
# Every function now takes a user_id and filters/sets it, so each logged-in person
# only ever sees or creates their own locations — never anyone else's.

from sqlalchemy.orm import Session
from .. import models, schemas


def create_location(db: Session, location: schemas.LocationCreate, user_id: str):
    db_location = models.Location(
        name=location.name,
        color=location.color,
        hourly_rate=location.hourly_rate,
        user_id=user_id,
    )
    db.add(db_location)
    db.commit()
    db.refresh(db_location)
    return db_location


def get_locations(db: Session, user_id: str):
    return db.query(models.Location).filter(models.Location.user_id == user_id).all()


def get_location(db: Session, location_id: int, user_id: str):
    return (
        db.query(models.Location)
        .filter(models.Location.id == location_id, models.Location.user_id == user_id)
        .first()
    )