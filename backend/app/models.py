# This file defines our two database tables as Python classes (SQLAlchemy models).
# "Location" represents a work location (name, color, hourly rate), and "Shift" represents
# one punch in/out session, linked back to whichever location it happened at.

from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from .database import Base


class Location(Base):
    __tablename__ = "locations"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, unique=True)
    color = Column(String, nullable=False, default="#1E1E1E")
    hourly_rate = Column(Float, nullable=False, default=0.0)

    shifts = relationship("Shift", back_populates="location")


class Shift(Base):
    __tablename__ = "shifts"

    id = Column(Integer, primary_key=True, index=True)
    start_time = Column(DateTime, nullable=False)
    end_time = Column(DateTime, nullable=True)       # NULL means the shift is still open
    hours_worked = Column(Float, nullable=True)        # calculated once punched out
    notes = Column(Text, nullable=True)

    location_id = Column(Integer, ForeignKey("locations.id"), nullable=False)
    location = relationship("Location", back_populates="shifts")