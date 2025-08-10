from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.services.suppression import list_suppressions, unsuppress
from app.services.audit import list_recent
router = APIRouter()
@router.get("/users")
def list_users(db: Session = Depends(get_db), user=Depends(get_current_user)):
    rows = db.query(User).all()
    return [{"id": u.id, "email": u.email, "role": u.role, "status": u.status} for u in rows]
@router.get("/suppressions")
def get_suppressions(db: Session = Depends(get_db), user=Depends(get_current_user)):
    if user.role != "admin": raise HTTPException(status_code=403, detail="Admin only")
    return list_suppressions(db)
@router.post("/suppressions/unsuppress")
def post_unsuppress(email: str, db: Session = Depends(get_db), user=Depends(get_current_user)):
    if user.role != "admin": raise HTTPException(status_code=403, detail="Admin only")
    ok = unsuppress(db, email)
    if not ok: raise HTTPException(status_code=404, detail="Not found")
    return {"ok": True}
@router.get("/audit")
def get_audit(db: Session = Depends(get_db), user=Depends(get_current_user)):
    if user.role != "admin": raise HTTPException(status_code=403, detail="Admin only")
    return list_recent(db)
