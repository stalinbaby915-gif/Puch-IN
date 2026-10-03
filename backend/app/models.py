# This file defines our database tables as Python classes (SQLAlchemy models).
# Both Location and Shift now have a user_id column — this is how we separate each
# logged-in person's data so they only ever see their own locations and shifts.

from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from .database import Base


class Location(Base):
    __tablename__ = "locations"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    color = Column(String, nullable=False, default="#1E1E1E")
    hourly_rate = Column(Float, nullable=False, default=0.0)
    user_id = Column(String, nullable=False, index=True)  # Supabase auth user ID

    shifts = relationship("Shift", back_populates="location")


class Shift(Base):
    __tablename__ = "shifts"

    id = Column(Integer, primary_key=True, index=True)
    start_time = Column(DateTime, nullable=False)
    end_time = Column(DateTime, nullable=True)
    hours_worked = Column(Float, nullable=True)
    notes = Column(Text, nullable=True)
    user_id = Column(String, nullable=False, index=True)  # Supabase auth user ID

    location_id = Column(Integer, ForeignKey("locations.id"), nullable=False)
    location = relationship("Location", back_populates="shifts")