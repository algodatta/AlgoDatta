from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import select
from uuid import UUID
from app.api.deps import get_db, get_current_user, require_owner_or_admin
from app.schemas.risk import RiskConfig
from app.models import Strategy, StrategyRisk

router = APIRouter(prefix="/risk", tags=["risk"])

@router.get("/strategies/{strategy_id}")
def get_risk(strategy_id: UUID, db: Session = Depends(get_db), user=Depends(get_current_user)):
    s = db.get(Strategy, strategy_id)
    if not s:
        raise HTTPException(status_code=404, detail="Strategy not found")
    require_owner_or_admin(s, user)
    r = db.execute(select(StrategyRisk).where(StrategyRisk.strategy_id == s.id)).scalar_one_or_none()
    if not r:
        return {}
    return {
        "max_position_qty": r.max_position_qty,
        "max_daily_loss": str(r.max_daily_loss) if r.max_daily_loss is not None else None,
        "trading_start": r.trading_start, "trading_end": r.trading_end,
        "allow_weekends": r.allow_weekends,
        "max_signals_per_minute": r.max_signals_per_minute,
        "kill_switch": r.kill_switch,
    }

@router.post("/strategies/{strategy_id}")
def set_risk(strategy_id: UUID, body: RiskConfig, db: Session = Depends(get_db), user=Depends(get_current_user)):
    s = db.get(Strategy, strategy_id)
    if not s:
        raise HTTPException(status_code=404, detail="Strategy not found")
    require_owner_or_admin(s, user)
    r = db.execute(select(StrategyRisk).where(StrategyRisk.strategy_id == s.id)).scalar_one_or_none()
    if not r:
        r = StrategyRisk(strategy_id=s.id)
    for k, v in body.model_dump(exclude_unset=True).items():
        setattr(r, k, v)
    db.add(r); db.commit(); db.refresh(r)
    return {"ok": True}
