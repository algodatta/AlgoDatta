from sqlalchemy.orm import Session
from app.models.suppression import Suppression
def is_suppressed(db: Session, email: str) -> bool:
    e = email.lower().strip(); return db.query(Suppression).filter(Suppression.email == e).first() is not None
def suppress(db: Session, email: str, reason: str, detail: dict | None = None) -> None:
    e = email.lower().strip(); row = db.query(Suppression).filter(Suppression.email == e).first()
    if row: return
    row = Suppression(email=e, reason=reason, detail=detail); db.add(row); db.commit()
def unsuppress(db: Session, email: str) -> bool:
    e = email.lower().strip(); row = db.query(Suppression).filter(Suppression.email == e).first()
    if not row: return False
    db.delete(row); db.commit(); return True
def list_suppressions(db: Session) -> list[dict]:
    rows = db.query(Suppression).order_by(Suppression.created_at.desc()).all()
    return [{"email": r.email, "reason": r.reason, "created_at": r.created_at.isoformat() if r.created_at else None} for r in rows]
