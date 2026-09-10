# This is the entrypoint of our backend — the file that actually starts the FastAPI app.
# It creates the app instance and registers our routers, so their endpoints become live
# URLs. This is the file "uvicorn" runs to actually start the server.

from fastapi import FastAPI
from .routers import locations, shifts

app = FastAPI(title="PunchTrack API")

app.include_router(locations.router)
app.include_router(shifts.router)


@app.get("/")
def root():
    return {"message": "PunchTrack API is running"}