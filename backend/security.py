from fastapi import Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from .auth_utils import decode_token
from .db import get_db
from .models import User

def get_current_user(req: Request, db: Session = Depends(get_db)) -> User:
    auth = req.headers.get("Authorization", "")
    if not auth.startswith("Bearer "):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Missing token")
    token = auth.split(" ", 1)[1].strip()
    payload = decode_token(token)
    if not payload:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid/expired token")
    uid = int(payload.get("sub", "0"))
    user = db.query(User).filter(User.id == uid).first()
    if not user:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "User not found")
    return user

def admin_required(user: User = Depends(get_current_user)) -> User:
    if not user.is_admin:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Admin only")
    return user
