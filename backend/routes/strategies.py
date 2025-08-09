from fastapi import APIRouter, Depends, HTTPException
from typing import List, Optional
from sqlalchemy.orm import Session
from ..db import get_db
from ..models import Strategy, User
from ..security import get_current_user
from uuid import uuid4

router = APIRouter()

def as_dict(s: Strategy) -> dict:
    secret = getattr(s, "secret", None)
    signed = f"/api/webhook/{s.id}" + (f"?k={secret}" if secret else "")
    return {
        "id": s.id,
        "name": s.name,
        "enabled": getattr(s, "enabled", False),
        "paper_trading": getattr(s, "paper_trading", False),
        "webhook_url": f"/api/webhook/{s.id}",
        "webhook_signed_url": signed
    }

@router.get("", response_model=list[dict])
def list_strategies(db: Session = Depends(get_db), user: User = Depends(get_current_user)) -> List[dict]:
    q = db.query(Strategy)
    if not getattr(user, "is_admin", False):
        q = q.filter(Strategy.user_id == user.id)
    return [as_dict(s) for s in q.order_by(Strategy.id.desc()).all()]

@router.post("", response_model=dict)
def create_strategy(
    name: str,
    script: Optional[str] = None,
    paper_trading: bool = False,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> dict:
    s = Strategy(
        user_id=user.id,
        name=name,
        enabled=False,
        webhook_path="/api/webhook",
    )
    # Set optional fields
    if hasattr(s, "paper_trading"):
        s.paper_trading = paper_trading
    if hasattr(s, "script"):
        s.script = script or ""
    # Generate a per-strategy secret if the column exists
    if hasattr(s, "secret"):
        setattr(s, "secret", uuid4().hex)
    db.add(s)
    db.commit()
    db.refresh(s)
    return as_dict(s)

@router.put("/{sid}", response_model=dict)
def update_strategy(
    sid: int,
    name: Optional[str] = None,
    enabled: Optional[bool] = None,
    script: Optional[str] = None,
    paper_trading: Optional[bool] = None,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> dict:
    q = db.query(Strategy).filter(Strategy.id == sid)
    if not getattr(user, "is_admin", False):
        q = q.filter(Strategy.user_id == user.id)
    s = q.first()
    if not s:
        raise HTTPException(404, "Strategy not found")
    if name is not None: s.name = name
    if enabled is not None and hasattr(s, "enabled"): s.enabled = bool(enabled)
    if script is not None and hasattr(s, "script"): s.script = script
    if paper_trading is not None and hasattr(s, "paper_trading"): s.paper_trading = bool(paper_trading)
    db.commit(); db.refresh(s)
    return as_dict(s)

@router.delete("/{sid}", response_model=dict)
def delete_strategy(
    sid: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> dict:
    q = db.query(Strategy).filter(Strategy.id == sid)
    if not getattr(user, "is_admin", False):
        q = q.filter(Strategy.user_id == user.id)
    s = q.first()
    if not s:
        raise HTTPException(404, "Strategy not found")
    db.delete(s); db.commit()
    return {"ok": True, "deleted_id": sid}
