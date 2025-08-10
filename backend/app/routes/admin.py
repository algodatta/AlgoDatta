from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.core.security import get_current_user
from app.models.user import User

router = APIRouter()

@router.get("/users")
def list_users(db: Session = Depends(get_db), user=Depends(get_current_user)):
    # In a real app, restrict to admin role
    rows = db.query(User).all()
    return [{"id": u.id, "email": u.email, "role": u.role, "status": u.status} for u in rows]
