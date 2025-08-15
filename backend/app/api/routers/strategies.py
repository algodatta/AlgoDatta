import uuid
from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import select
from app.api.deps import get_db, get_current_user, require_owner_or_admin
from app.schemas.strategy import StrategyCreate, StrategyUpdate
from app.models import Strategy, StrategyStatus, User, Broker

router = APIRouter(prefix="/strategies", tags=["strategies"])

@router.get("")
def list_strategies(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    stmt = select(Strategy)
    if user.role.value != "admin":
        stmt = stmt.where(Strategy.user_id == user.id)
    rows = db.execute(stmt.order_by(Strategy.created_at.desc())).scalars().all()
    return [{
        "id": str(s.id), "user_id": str(s.user_id), "name": s.name, "symbol": s.symbol,
        "timeframe": s.timeframe, "qty": s.qty, "mode": s.mode, "paper_trading": s.paper_trading,
        "status": s.status.value, "webhook_path": s.webhook_path
    } for s in rows]

@router.post("")
def create_strategy(payload: StrategyCreate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    s = Strategy(
        user_id=user.id, name=payload.name, symbol=payload.symbol, timeframe=payload.timeframe,
        qty=payload.qty, mode=payload.mode, broker_id=payload.broker_id, paper_trading=payload.paper_trading,
        status=StrategyStatus.active, webhook_path=f"wh_{uuid.uuid4()}"
    )
    db.add(s); db.commit(); db.refresh(s)
    return {"id": str(s.id), "webhook_path": s.webhook_path}

@router.get("/{strategy_id}")
def get_strategy(strategy_id: str, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    s = db.get(Strategy, strategy_id)
    if not s: raise HTTPException(status_code=404, detail="Strategy not found")
    require_owner_or_admin(s, user)
    return {
        "id": str(s.id), "user_id": str(s.user_id), "name": s.name, "symbol": s.symbol,
        "timeframe": s.timeframe, "qty": s.qty, "mode": s.mode, "paper_trading": s.paper_trading,
        "status": s.status.value, "webhook_path": s.webhook_path
    }

@router.patch("/{strategy_id}")
def update_strategy(strategy_id: str, body: StrategyUpdate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    s = db.get(Strategy, strategy_id)
    if not s: raise HTTPException(status_code=404, detail="Strategy not found")
    require_owner_or_admin(s, user)
    for field, value in body.model_dump(exclude_unset=True).items():
        if field == "status" and value is not None:
            s.status = StrategyStatus(value)
        else:
            setattr(s, field, value)
    db.add(s); db.commit(); db.refresh(s)
    return {"ok": True}

@router.delete("/{strategy_id}")
def delete_strategy(strategy_id: str, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    s = db.get(Strategy, strategy_id)
    if not s: raise HTTPException(status_code=404, detail="Strategy not found")
    require_owner_or_admin(s, user)
    db.delete(s); db.commit()
    return {"ok": True}

@router.post("/{strategy_id}/toggle")
def toggle_strategy(strategy_id: str, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    s = db.get(Strategy, strategy_id)
    if not s: raise HTTPException(status_code=404, detail="Strategy not found")
    require_owner_or_admin(s, user)
    s.status = StrategyStatus.active if s.status != StrategyStatus.active else StrategyStatus.paused
    db.add(s); db.commit(); db.refresh(s)
    return {"id": str(s.id), "status": s.status.value}

@router.post("/{strategy_id}/rotate-webhook")
def rotate_webhook(strategy_id: str, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    s = db.get(Strategy, strategy_id)
    if not s: raise HTTPException(status_code=404, detail="Strategy not found")
    require_owner_or_admin(s, user)
    s.webhook_path = f"wh_{uuid.uuid4()}"
    db.add(s); db.commit(); db.refresh(s)
    return {"id": str(s.id), "webhook_path": s.webhook_path}
