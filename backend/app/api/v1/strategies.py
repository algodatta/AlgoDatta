from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from uuid import uuid4, UUID
from app.schemas.strategy import StrategyCreate, StrategyRead, StrategyStatus
from app.models.strategy import Strategy
from app.db import get_db
from app.core.deps import get_current_user

router = APIRouter(dependencies=[Depends(get_current_user)])

@router.get("/strategies", response_model=list[StrategyRead])
def list_strategies(db: Session = Depends(get_db), user=Depends(get_current_user)):
    return db.query(Strategy).filter(Strategy.user_id == user.id).order_by(Strategy.created_at.desc()).all()

@router.post("/strategies", response_model=StrategyRead)
def create_strategy(payload: StrategyCreate, db: Session = Depends(get_db), user=Depends(get_current_user)):
    webhook_path = f"webhook-{uuid4()}"
    strategy = Strategy(
        id=uuid4(),
        user_id=user.id,
        name=payload.name,
        script=payload.script,
        broker_id=payload.broker_id,
        paper_trading=payload.paper_trading,
        webhook_path=webhook_path,
    )
    db.add(strategy)
    db.commit()
    db.refresh(strategy)
    return strategy

@router.patch("/strategies/{strategy_id}", response_model=StrategyRead)
def update_strategy(strategy_id: UUID, updates: dict, db: Session = Depends(get_db), user=Depends(get_current_user)):
    s = db.query(Strategy).filter(Strategy.id == strategy_id, Strategy.user_id == user.id).first()
    if not s:
        raise HTTPException(status_code=404, detail="Strategy not found")
    # Allow updates for: name, script, paper_trading, status
    for key in ["name", "script", "paper_trading", "status"]:
        if key in updates:
            setattr(s, key, updates[key])
    db.commit(); db.refresh(s)
    return s

@router.delete("/strategies/{strategy_id}")
def delete_strategy(strategy_id: UUID, db: Session = Depends(get_db), user=Depends(get_current_user)):
    s = db.query(Strategy).filter(Strategy.id == strategy_id, Strategy.user_id == user.id).first()
    if not s:
        raise HTTPException(status_code=404, detail="Strategy not found")
    db.delete(s); db.commit()
    return {"status": "deleted"}
