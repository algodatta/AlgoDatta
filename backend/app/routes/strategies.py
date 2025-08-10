from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from secrets import token_hex
from app.db.session import get_db
from app.core.security import get_current_user
from app.models.strategy import Strategy
from app.schemas.strategy import StrategyCreate, StrategyOut

router = APIRouter()

@router.get("", response_model=list[StrategyOut])
def list_strategies(db: Session = Depends(get_db), user=Depends(get_current_user)):
    rows = db.query(Strategy).filter(Strategy.user_id == user.id).all()
    return rows

@router.post("", response_model=StrategyOut)
def create_strategy(body: StrategyCreate, db: Session = Depends(get_db), user=Depends(get_current_user)):
    s = Strategy(user_id=user.id, name=body.name, symbol=body.symbol, timeframe=body.timeframe, qty=body.qty, mode=body.mode, status="disabled")
    db.add(s); db.commit(); db.refresh(s)
    return s

@router.post("/{strategy_id}/toggle", response_model=StrategyOut)
def toggle_strategy(strategy_id: int, db: Session = Depends(get_db), user=Depends(get_current_user)):
    s = db.query(Strategy).filter(Strategy.id == strategy_id, Strategy.user_id == user.id).first()
    if not s: raise HTTPException(404, "Not found")
    s.status = "enabled" if s.status != "enabled" else "disabled"
    db.commit(); db.refresh(s)
    return s

@router.post("/{strategy_id}/deploy")
def deploy_strategy(strategy_id: int, db: Session = Depends(get_db), user=Depends(get_current_user)):
    s = db.query(Strategy).filter(Strategy.id == strategy_id, Strategy.user_id == user.id).first()
    if not s: raise HTTPException(404, "Not found")
    if not s.webhook_secret:
        s.webhook_secret = token_hex(16)
        db.commit(); db.refresh(s)
    return {"webhook_secret": s.webhook_secret}
