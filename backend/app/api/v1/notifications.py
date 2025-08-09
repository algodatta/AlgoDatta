from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from uuid import UUID, uuid4
from app.db import get_db
from app.core.deps import get_current_user
from app.models.notification import Notification, NotificationMethod
from app.schemas.notification import NotificationCreate, NotificationRead

router = APIRouter(dependencies=[Depends(get_current_user)])

@router.get("/notifications", response_model=list[NotificationRead])
def list_notifications(db: Session = Depends(get_db), user=Depends(get_current_user)):
    return db.query(Notification).filter(Notification.user_id == user.id).order_by(Notification.created_at.desc()).all()

@router.post("/notifications", response_model=NotificationRead)
def add_notification(payload: NotificationCreate, db: Session = Depends(get_db), user=Depends(get_current_user)):
    item = Notification(id=uuid4(), user_id=user.id, method=payload.method, endpoint=payload.endpoint, enabled=payload.enabled)
    db.add(item); db.commit(); db.refresh(item)
    return item

@router.delete("/notifications/{notification_id}")
def delete_notification(notification_id: UUID, db: Session = Depends(get_db), user=Depends(get_current_user)):
    item = db.query(Notification).filter(Notification.id == notification_id, Notification.user_id == user.id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Notification not found")
    db.delete(item); db.commit()
    return {"status": "deleted"}
