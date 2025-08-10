from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from app.schemas.auth import LoginRequest, RegisterRequest, Token, PasswordResetRequest, PasswordResetConfirm
from app.core.security import get_password_hash, verify_password, create_access_token, get_current_user
from app.db.session import get_db
from app.models.user import User
from app.core.config import settings
from app.services.mailer import send_verification_email, send_password_reset_email
from app.services.rate_limiter import check_limit
from app.services.audit import log_event

router = APIRouter()

MIN_PASSWORD_LEN = 8
def _validate_password(pw: str):
    import re
    if len(pw) < MIN_PASSWORD_LEN: return f"Password must be at least {MIN_PASSWORD_LEN} characters"
    if not re.search(r"[A-Z]", pw): return "Password must include an uppercase letter"
    if not re.search(r"[a-z]", pw): return "Password must include a lowercase letter"
    if not re.search(r"[0-9]", pw): return "Password must include a digit"
    if not re.search(r"[^A-Za-z0-9]", pw): return "Password must include a special character"
    return None

from datetime import datetime, timezone, timedelta
import secrets

@router.post("/register")
def register(body: RegisterRequest, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == body.email).first()
    if existing: raise HTTPException(status_code=400, detail="Email already registered")
    err = _validate_password(body.password)
    if err: raise HTTPException(status_code=400, detail=err)
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
    user.email_verify_token = secrets.token_hex(16)
    user.email_verify_sent_at = datetime.now(timezone.utc)
    db.commit()
    send_verification_email(user.email, user.email_verify_token)
    return {"message": "Verification email sent"}

@router.post("/request_password_reset")
def request_password_reset(body: PasswordResetRequest, db: Session = Depends(get_db), request: Request = None):
    # Avoid account enumeration; always return ok
    # Rate limits: global per-minute and per-email per-hour
    try:
        if not check_limit("pwreset:global:min", settings.PASSWORD_RESET_GLOBAL_PER_MINUTE, 60):
            return {"ok": True}
        email_key = f"pwreset:to:{body.email.lower().strip()}:hour"
        if not check_limit(email_key, settings.PASSWORD_RESET_REQUESTS_PER_HOUR, 3600):
            return {"ok": True}
    except Exception:
        pass
    user = db.query(User).filter(User.email == body.email).first()
    if user:
        token = secrets.token_hex(16)
        user.password_reset_token = token
        user.password_reset_sent_at = datetime.now(timezone.utc)
        db.commit()
        try:
            send_password_reset_email(user.email, token)
        except Exception:
            pass
        try:
            ip = (request.client.host if request and request.client else None)
            ua = request.headers.get('user-agent') if request else None
            log_event(db, user_id=user.id, email=user.email, event='password_reset_requested', ip=ip, user_agent=ua)
        except Exception:
            pass
        return {"ok": True, "dev_reset_token": token}
    else:
        try:
            ip = (request.client.host if request and request.client else None)
            ua = request.headers.get('user-agent') if request else None
            log_event(db, email=body.email, event='password_reset_requested', ip=ip, user_agent=ua)
        except Exception:
            pass
        return {"ok": True}

@router.post("/reset_password")
def reset_password(body: PasswordResetConfirm, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.password_reset_token == body.token).first()
    if not user or not user.password_reset_sent_at:
        raise HTTPException(status_code=400, detail="Invalid or expired token")
    ttl = timedelta(minutes=settings.PASSWORD_RESET_TOKEN_TTL_MINUTES)
    if user.password_reset_sent_at + ttl < datetime.now(timezone.utc):
        raise HTTPException(status_code=400, detail="Invalid or expired token")
    err = _validate_password(body.password)
    if err: raise HTTPException(status_code=400, detail=err)
    user.password_hash = get_password_hash(body.password)
    user.password_reset_token = None
    user.password_reset_sent_at = None
    db.commit()
    try:
        log_event(db, user_id=user.id, email=user.email, event='password_reset_succeeded')
    except Exception:
        pass
    return {"message": "Password updated. You can sign in now."}
