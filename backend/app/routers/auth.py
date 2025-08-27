from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, EmailStr
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
import secrets, hashlib

# NOTE: Replace imports below with your real modules.
# from app.db import get_db, User
# from app.security import hash_password, verify_password, create_jwt
# from app.mailer import send_mail

def get_db():
    # placeholder for dependency in case you paste this before wiring
    return None

def hash_password(pw: str) -> str:
    # replace with real password hashing (e.g., passlib/bcrypt)
    return "hashed:" + pw

def send_mail(to: str, subject: str, body: str):
    # replace with SES/SendGrid implementation
    print(f"[MAIL] to={to} subject={subject} body={body}")

# Replace this with your SQLAlchemy User model and real DB logic.
class UserObj:
    def __init__(self, name, email, password_hash, role='user'):
        self.name = name
        self.email = email
        self.password_hash = password_hash
        self.role = role
        self.reset_token_hash = None
        self.reset_token_expires_at = None

FAKE_DB = {}

router = APIRouter(prefix="/api/auth", tags=["auth"])

class RegisterIn(BaseModel):
    name: str
    email: EmailStr
    password: str

@router.post("/register")
def register(data: RegisterIn):
    if data.email in FAKE_DB:
        raise HTTPException(400, "Email already registered")
    user = UserObj(name=data.name, email=data.email, password_hash=hash_password(data.password))
    FAKE_DB[data.email] = user
    send_mail(to=data.email, subject="Welcome to AlgoDatta", body="Your account is ready.")
    return {"message": "Registered successfully"}

class ForgotIn(BaseModel):
    email: EmailStr

@router.post("/forgot-password")
def forgot_password(data: ForgotIn):
    user = FAKE_DB.get(data.email)
    if user:
        raw = secrets.token_urlsafe(32)
        digest = hashlib.sha256(raw.encode()).hexdigest()
        user.reset_token_hash = digest
        user.reset_token_expires_at = datetime.utcnow() + timedelta(hours=2)
        link = f"https://www.algodatta.com/reset-password?token={raw}"
        send_mail(to=user.email, subject="Reset your password", body=f"Click to reset: {link}")
    return {"message": "If the email exists, a reset link has been sent."}

class ResetIn(BaseModel):
    token: str
    password: str

@router.post("/reset-password")
def reset_password(data: ResetIn):
    digest = hashlib.sha256(data.token.encode()).hexdigest()
    # scan fake DB
    for user in FAKE_DB.values():
        if user.reset_token_hash == digest and user.reset_token_expires_at and user.reset_token_expires_at > datetime.utcnow():
            user.password_hash = hash_password(data.password)
            user.reset_token_hash = None
            user.reset_token_expires_at = None
            return {"message": "Password updated"}
    raise HTTPException(400, "Invalid or expired token")
