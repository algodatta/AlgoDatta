from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import select
from uuid import UUID
from typing import List
from app.api.deps import get_db, get_current_user
from app.schemas.notifications import NotificationCreate, NotificationRead, NotificationVerify
from app.models import Notification, NotificationType

router = APIRouter(prefix="/notifications", tags=["notifications"])

@router.get("", response_model=List[NotificationRead])
def list_my_notifications(db: Session = Depends(get_db), user=Depends(get_current_user)):
    rows = db.execute(select(Notification).where(Notification.user_id == user.id)).scalars().all()
    return [{"id": r.id, "type": r.type.value, "destination": r.destination, "verified": r.verified} for r in rows]

@router.post("", response_model=NotificationRead)
def add_notification(body: NotificationCreate, db: Session = Depends(get_db), user=Depends(get_current_user)):
    n = Notification(user_id=user.id, type=NotificationType(body.type), destination=body.destination, verified=False)
    db.add(n); db.commit(); db.refresh(n)
    return {"id": n.id, "type": n.type.value, "destination": n.destination, "verified": n.verified}

@router.patch("/{notif_id}/verify", response_model=NotificationRead)
def verify_notification(notif_id: UUID, body: NotificationVerify, db: Session = Depends(get_db), user=Depends(get_current_user)):
    n = db.get(Notification, notif_id)
    if not n or n.user_id != user.id:
        raise HTTPException(status_code=404, detail="Not found")
    n.verified = bool(body.verified)
    db.add(n); db.commit(); db.refresh(n)
    return {"id": n.id, "type": n.type.value, "destination": n.destination, "verified": n.verified}

@router.delete("/{notif_id}")
def delete_notification(notif_id: UUID, db: Session = Depends(get_db), user=Depends(get_current_user)):
    n = db.get(Notification, notif_id)
    if not n or n.user_id != user.id:
        raise HTTPException(status_code=404, detail="Not found")
    db.delete(n); db.commit()
    return {"ok": True}
