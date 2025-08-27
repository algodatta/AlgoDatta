from fastapi import APIRouter, HTTPException, Response
from pydantic import BaseModel
from datetime import datetime, timedelta
import os
from jose import jwt

from ..config import AUTH_JWT_ALGO, AUTH_JWT_SECRET, AUTH_COOKIE_NAMES

router = APIRouter(prefix="/auth", tags=["auth"])

class LoginBody(BaseModel):
    email: str
    password: str
    next: str | None = None

# Simple demo users — replace with real DB lookup
USERS = {
    "admin@algodatta.com": {"password": "admin123", "roles": ["admin"]},
    "trader@algodatta.com": {"password": "trader123", "roles": ["trader"]},
    "analyst@algodatta.com": {"password": "analyst123", "roles": ["analyst"]},
}

COOKIE_NAME = AUTH_COOKIE_NAMES[0] if AUTH_COOKIE_NAMES else "algodatta_session"

@router.post("/login")
def login(data: LoginBody, response: Response):
    user = USERS.get(data.email.strip().lower())
    if not user or data.password != user["password"]:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    if not AUTH_JWT_SECRET:
        raise HTTPException(status_code=500, detail="Server misconfigured: AUTH_JWT_SECRET missing")

    now = datetime.utcnow()
    claims = {
        "sub": data.email,
        "roles": user["roles"],
        "scope": " ".join(f"role:{r}" for r in user["roles"]),
        "iat": int(now.timestamp()),
        "exp": int((now + timedelta(hours=12)).timestamp()),
        "iss": os.getenv("AUTH_ISSUER") or "algodatta",
        "aud": os.getenv("AUTH_AUDIENCE") or "algodatta-web",
    }
    token = jwt.encode(claims, AUTH_JWT_SECRET, algorithm=AUTH_JWT_ALGO or "HS256")
    # Set HttpOnly cookie
    cookie_domain = os.getenv("AUTH_COOKIE_DOMAIN", "")
    secure = os.getenv("AUTH_COOKIE_SECURE", "true").lower() == "true"
    same_site = os.getenv("AUTH_COOKIE_SAMESITE", "Lax")
    response.set_cookie(
        key=COOKIE_NAME,
        value=token,
        httponly=True,
        secure=secure,
        samesite=same_site,  # 'Lax' or 'None' for cross-site
        max_age=12*3600,
        domain=cookie_domain if cookie_domain else None,
        path="/",
    )
    return {"ok": True}

@router.post("/logout")
def logout(response: Response):
    cookie_domain = os.getenv("AUTH_COOKIE_DOMAIN", "")
    response.delete_cookie(COOKIE_NAME, path="/", domain=cookie_domain if cookie_domain else None)
    return {"ok": True}
