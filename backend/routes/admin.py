from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..db import get_db
from ..models import User, Strategy
from ..security import admin_required

router = APIRouter()

@router.get("/users")
def list_users(db: Session = Depends(get_db), admin = Depends(admin_required)):
    return [{"id": u.id, "email": u.email, "is_admin": getattr(u, "is_admin", False)} for u in db.query(User).order_by(User.id)]

@router.put("/users/{uid}/role")
def set_role(uid: int, is_admin: bool, db: Session = Depends(get_db), admin = Depends(admin_required)):
    u = db.query(User).filter(User.id == uid).first()
    if not u: raise HTTPException(404, "User not found")
    setattr(u, "is_admin", bool(is_admin))
    db.commit(); db.refresh(u)
    return {"id": u.id, "email": u.email, "is_admin": getattr(u, "is_admin", False)}

@router.get("/strategies")
def list_strategies(db: Session = Depends(get_db), admin = Depends(admin_required)):
    return [{"id": s.id, "name": s.name, "user_id": s.user_id, "enabled": getattr(s, "enabled", False)} for s in db.query(Strategy).order_by(Strategy.id)]
