# This file is the ONLY place allowed to touch the "shifts" table directly.
# It handles punching in (creating a new open shift), punching out (closing it and
# calculating hours), and fetching shift history. Routers call these instead of writing SQL.

from sqlalchemy.orm import Session
from datetime import datetime
from .. import models, schemas


def get_open_shift(db: Session):
    # An "open" shift is one that's been punched in but not yet punched out (end_time is NULL)
    return db.query(models.Shift).filter(models.Shift.end_time.is_(None)).first()


def punch_in(db: Session, shift_data: schemas.ShiftPunchIn):
    db_shift = models.Shift(
        start_time=datetime.utcnow(),
        location_id=shift_data.location_id,
        notes=shift_data.notes,
    )
    db.add(db_shift)
    db.commit()
    db.refresh(db_shift)
    return db_shift


def punch_out(db: Session, shift: models.Shift):
    shift.end_time = datetime.utcnow()

    duration = shift.end_time - shift.start_time
    shift.hours_worked = round(duration.total_seconds() / 3600, 2)  # convert seconds -> hours

    db.commit()
    db.refresh(shift)
    return shift


def get_shifts(db: Session):
    return db.query(models.Shift).order_by(models.Shift.start_time.desc()).all()