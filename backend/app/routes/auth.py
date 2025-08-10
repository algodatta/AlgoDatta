from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.schemas.auth import LoginRequest, RegisterRequest, Token
from app.core.security import get_password_hash, verify_password, create_access_token, get_current_user
from app.db.session import get_db
from app.models.user import User

router = APIRouter()

@router.post("/register", response_model=Token)
def register(body: RegisterRequest, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == body.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    user = User(email=body.email, password_hash=get_password_hash(body.password))
    db.add(user); db.commit(); db.refresh(user)
    token = create_access_token(subject=user.email)
    return Token(access_token=token)

@router.post("/login", response_model=Token)
def login(body: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == body.email).first()
    if not user or not verify_password(body.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    token = create_access_token(subject=user.email)
    return Token(access_token=token)

@router.get("/me")
def me(user: User = Depends(get_current_user)):
    return {"id": user.id, "email": user.email, "role": user.role, "status": user.status}
