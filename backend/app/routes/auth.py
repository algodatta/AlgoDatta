from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.schemas.auth import LoginRequest, RegisterRequest, Token
from app.core.security import get_password_hash, verify_password, create_access_token, get_current_user
from app.db.session import get_db
from app.models.user import User

router = APIRouter()
from app.services.mailer import send_verification_email

MIN_PASSWORD_LEN = 8
def _validate_password(pw: str):
    import re
    if len(pw) < MIN_PASSWORD_LEN: return f"Password must be at least {MIN_PASSWORD_LEN} characters"
    if not re.search(r"[A-Z]", pw): return "Password must include an uppercase letter"
    if not re.search(r"[a-z]", pw): return "Password must include a lowercase letter"
    if not re.search(r"[0-9]", pw): return "Password must include a digit"
    if not re.search(r"[^A-Za-z0-9]", pw): return "Password must include a special character"
    return None

def send_verification_email(email: str, token: str):
    print(f"[DEV] Verification email to {email}: http://localhost:3000/verify?token={token}")

@router.post("/register")
def register(body: RegisterRequest, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == body.email).first()
    if existing: raise HTTPException(status_code=400, detail="Email already registered")
    err = _validate_password(body.password)
    if err: raise HTTPException(status_code=400, detail=err)
    from datetime import datetime, timezone
    import secrets
    verify_token = secrets.token_hex(16)
    user = User(email=body.email, password_hash=get_password_hash(body.password), email_verified=False, email_verify_token=verify_token, email_verify_sent_at=datetime.now(timezone.utc))
    db.add(user); db.commit(); db.refresh(user)
    send_verification_email(user.email, verify_token)
    return {"message": "Registered. Please verify your email.", "dev_verify_token": verify_token}

@router.post("/login", response_model=Token)
def login(body: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == body.email).first()
    if not user or not verify_password(body.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    if not user.email_verified:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Email not verified")
    token = create_access_token(subject=user.email)
    return Token(access_token=token)

@router.get("/verify")
def verify_email(token: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email_verify_token == token).first()
    if not user: raise HTTPException(status_code=400, detail="Invalid token")
    user.email_verified = True
    user.email_verify_token = None
    db.commit()
    return {"message": "Email verified"}

@router.post("/send_verification")
def send_verification(body: RegisterRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == body.email).first()
    if not user: raise HTTPException(status_code=404, detail="User not found")
    if user.email_verified: return {"message": "Already verified"}
    import secrets
    from datetime import datetime, timezone
    user.email_verify_token = secrets.token_hex(16)
    user.email_verify_sent_at = datetime.now(timezone.utc)
    db.commit()
    send_verification_email(user.email, user.email_verify_token)
    return {"message": "Verification email sent"}
