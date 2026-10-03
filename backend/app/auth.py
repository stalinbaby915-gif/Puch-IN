# This file checks that incoming requests include a valid, logged-in user's token.
# Instead of manually verifying the token's cryptographic signature ourselves (complex,
# and brittle if Supabase rotates its signing keys), we ask Supabase's own API to verify
# it for us and tell us who the token belongs to.

import os
from fastapi import Header, HTTPException
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY")

supabase = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)


def get_current_user(authorization: str = Header(...)) -> str:
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid authorization header")

    token = authorization.replace("Bearer ", "")

    try:
        response = supabase.auth.get_user(token)
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    if not response or not response.user:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    return response.user.id