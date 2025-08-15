from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import select
from app.api.deps import get_db, get_current_user
from app.schemas.auth import LoginRequest, Token
from app.schemas.common import Message
from app.core.security import verify_password, create_access_token
from app.models import User

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/login", response_model=Token, responses={401: {"model": Message}})
def login(data: LoginRequest, db: Session = Depends(get_db)):
    user = db.execute(select(User).where(User.email == data.email)).scalar_one_or_none()
    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")
    token = create_access_token(str(user.id), user.role.value)
    return Token(access_token=token)

@router.get("/me")
def me(current_user: User = Depends(get_current_user)):
    return {
        "id": str(current_user.id),
        "email": current_user.email,
        "role": current_user.role.value,
        "status": current_user.status.value,
    }
