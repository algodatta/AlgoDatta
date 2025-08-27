import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..db import get_db
from .. import models
from ..schemas import StrategyIn, StrategyOut
from ..deps import get_current_user

router = APIRouter()

@router.get("/strategies", response_model=list[StrategyOut])
def list_strategies(db: Session = Depends(get_db), user: models.User = Depends(get_current_user)):
    qs = db.query(models.Strategy).filter(models.Strategy.user_id == user.id).all()
    return [StrategyOut(id=s.id, name=s.name, webhook_path=s.webhook_path, is_active=s.is_active, paper_trading=s.paper_trading) for s in qs]

@router.post("/strategies", response_model=StrategyOut)
def create_strategy(body: StrategyIn, db: Session = Depends(get_db), user: models.User = Depends(get_current_user)):
    hook = str(uuid.uuid4())
    s = models.Strategy(user_id=user.id, name=body.name, script=body.script, paper_trading=body.paper_trading, webhook_path=hook)
    db.add(s)
    db.commit()
    db.refresh(s)
    return StrategyOut(id=s.id, name=s.name, webhook_path=s.webhook_path, is_active=s.is_active, paper_trading=s.paper_trading)

@router.patch("/strategies/{strategy_id}/toggle", response_model=StrategyOut)
def toggle_strategy(strategy_id: str, db: Session = Depends(get_db), user: models.User = Depends(get_current_user)):
    s = db.query(models.Strategy).filter(models.Strategy.id == strategy_id, models.Strategy.user_id == user.id).first()
    if not s:
        raise HTTPException(status_code=404, detail="Strategy not found")
    s.is_active = not s.is_active
    db.commit()
    return StrategyOut(id=s.id, name=s.name, webhook_path=s.webhook_path, is_active=s.is_active, paper_trading=s.paper_trading)
