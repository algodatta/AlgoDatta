from typing import Optional, Any, Dict
from sqlalchemy.orm import Session
from app.models.audit_log import AuditLog
def log_event(db: Session, *, user_id: Optional[int] = None, email: Optional[str] = None, event: str, ip: Optional[str] = None, user_agent: Optional[str] = None, meta: Optional[Dict[str, Any]] = None) -> None:
    row = AuditLog(user_id=user_id, email=(email.lower().strip() if email else None), event=event, ip=ip, user_agent=user_agent, meta=meta or {})
    db.add(row); db.commit()
def list_recent(db: Session, limit: int = 200) -> list[dict]:
    rows = db.query(AuditLog).order_by(AuditLog.id.desc()).limit(limit).all()
    return [{"id": r.id, "user_id": r.user_id, "email": r.email, "event": r.event, "ip": r.ip, "user_agent": r.user_agent, "meta": r.meta, "created_at": r.created_at.isoformat() if getattr(r, "created_at", None) else None} for r in rows]
