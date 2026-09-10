# This file is the ONLY place allowed to touch the "locations" table directly.
# Each function here takes a database session (db) and does one specific job — create,
# fetch one, or fetch all locations. Routers call these functions instead of writing SQL themselves.

from sqlalchemy.orm import Session
from .. import models, schemas


def create_location(db: Session, location: schemas.LocationCreate):
    db_location = models.Location(
        name=location.name,
        color=location.color,
        hourly_rate=location.hourly_rate,
    )
    db.add(db_location)        # stage the new row
    db.commit()                 # actually save it to Postgres
    db.refresh(db_location)     # reload it from the DB so it has its new auto-generated id
    return db_location


def get_locations(db: Session):
    return db.query(models.Location).all()


def get_location(db: Session, location_id: int):
    return db.query(models.Location).filter(models.Location.id == location_id).first()