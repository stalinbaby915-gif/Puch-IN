# This file is the ONLY place allowed to touch the "shifts" table directly.
# Every function now takes a user_id and filters/sets it, so each logged-in person
# only ever sees, creates, or closes their own shifts — never anyone else's.

from sqlalchemy.orm import Session
from datetime import datetime
from .. import models, schemas


def get_open_shift(db: Session, user_id: str):
    return (
        db.query(models.Shift)
        .filter(models.Shift.end_time.is_(None), models.Shift.user_id == user_id)
        .first()
    )


def punch_in(db: Session, shift_data: schemas.ShiftPunchIn, user_id: str):
    db_shift = models.Shift(
        start_time=datetime.utcnow(),
        location_id=shift_data.location_id,
        notes=shift_data.notes,
        user_id=user_id,
    )
    db.add(db_shift)
    db.commit()
    db.refresh(db_shift)
    return db_shift


def punch_out(db: Session, shift: models.Shift):
    shift.end_time = datetime.utcnow()
    duration = shift.end_time - shift.start_time
    shift.hours_worked = round(duration.total_seconds() / 3600, 2)
    db.commit()
    db.refresh(shift)
    return shift


def get_shifts(db: Session, user_id: str):
    return (
        db.query(models.Shift)
        .filter(models.Shift.user_id == user_id)
        .order_by(models.Shift.start_time.desc())
        .all()
    )