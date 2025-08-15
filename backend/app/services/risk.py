from datetime import datetime, time, timedelta
from decimal import Decimal
from typing import Optional
from sqlalchemy.orm import Session
from sqlalchemy import select, func
from app.core.config import settings
from app.models import StrategyRisk, Execution, PaperTrade
import pytz

IST = pytz.timezone("Asia/Kolkata")

def _parse_time(s: Optional[str]) -> Optional[time]:
    if not s: return None
    try:
        hh, mm = s.split(":")
        return time(int(hh), int(mm))
    except Exception:
        return None

def within_trading_window(cfg: StrategyRisk, now: Optional[datetime] = None) -> bool:
    now = now or datetime.now(IST)
    if not cfg:
        return True
    if not cfg.allow_weekends and now.weekday() >= 5:
        return False
    start = _parse_time(cfg.trading_start) or time(0,0)
    end = _parse_time(cfg.trading_end) or time(23,59,59)
    nt = now.timetz()
    return (nt >= start.replace(tzinfo=IST)) and (nt <= end.replace(tzinfo=IST))

def exceeded_daily_loss(db: Session, strategy_id, limit: Optional[Decimal]) -> bool:
    if not limit or Decimal(str(limit)) <= 0:
        return False
    now = datetime.now(IST)
    day_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    rows = db.execute(
        select(func.coalesce(func.sum(Execution.pnl), 0))
        .where(Execution.strategy_id == strategy_id)
        .where(Execution.created_at >= day_start)
    ).scalar_one()
    total = Decimal(str(rows or 0))
    return total <= (Decimal(0) - Decimal(str(limit)))  # at or beyond negative limit

def current_position_qty(db: Session, strategy_id) -> int:
    last = db.execute(
        select(PaperTrade.position_qty).where(PaperTrade.strategy_id == strategy_id).order_by(PaperTrade.entry_time.desc()).limit(1)
    ).scalar_one_or_none()
    return int(last or 0)

def rate_limit_exceeded(db: Session, strategy_id, max_per_minute: Optional[int]) -> bool:
    if not max_per_minute or max_per_minute <= 0:
        max_per_minute = settings.default_max_signals_per_minute
    now = datetime.now(IST)
    window = now - timedelta(seconds=60)
    from app.models import Alert
    count = db.execute(select(func.count()).select_from(Alert).where(Alert.strategy_id == strategy_id, Alert.received_at >= window)).scalar_one()
    return count >= max_per_minute
