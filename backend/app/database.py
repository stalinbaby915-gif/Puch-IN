# This file sets up the connection to our Supabase (Postgres) database.
# It reads the database address/password from .env, creates a single "engine" that
# knows how to talk to that database, and provides SessionLocal + get_db() so that
# each API request can borrow its own temporary connection and safely close it when done.

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv
import os

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

engine = create_engine(DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()