import datetime as dt
from decimal import Decimal
from collections import defaultdict
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import select
from typing import Optional
from uuid import UUID
from app.api.deps import get_db, get_current_user
from app.models import Execution, Strategy

router = APIRouter(prefix="/dashboards", tags=["dashboards"])

def _date(d: Optional[str]):
    if not d: return None
    try: return dt.datetime.fromisoformat(d)
    except Exception: return None

@router.get("/pnl/equity")
def equity_curve(
    db: Session = Depends(get_db),
    user = Depends(get_current_user),
    strategy_id: Optional[UUID] = Query(None),
    from_date: Optional[str] = Query(None),
    to_date: Optional[str] = Query(None),
):
    q = select(Execution).where(Execution.pnl != None)  # noqa: E711
    if user.role.value != "admin":
        q = q.join(Strategy, Strategy.id == Execution.strategy_id).where(Strategy.user_id == user.id)
    if strategy_id:
        q = q.where(Execution.strategy_id == strategy_id)
    fd, td = _date(from_date), _date(to_date)
    if fd: q = q.where(Execution.created_at >= fd)
    if td: q = q.where(Execution.created_at <= td)

    rows = db.execute(q).scalars().all()
    by_day = defaultdict(Decimal)
    for e in rows:
        d = e.created_at.date().isoformat() if e.created_at else "unknown"
        by_day[d] += e.pnl or 0
    # Build cumulative curve
    days = sorted(by_day.keys())
    cumulative = []
    total = Decimal(0)
    for d in days:
        total += by_day[d]
        cumulative.append({"date": d, "pnl": str(by_day[d]), "equity": str(total)})
    return {"points": cumulative, "from": days[0] if days else None, "to": days[-1] if days else None}

@router.get("/overview")
def overview(db: Session = Depends(get_db), user = Depends(get_current_user)):
    q = select(Execution).where(Execution.pnl != None)  # noqa: E711
    if user.role.value != "admin":
        q = q.join(Strategy, Strategy.id == Execution.strategy_id).where(Strategy.user_id == user.id)
    rows = db.execute(q).scalars().all()

    total = Decimal(0); wins = 0; count = 0
    by_strategy = defaultdict(Decimal)
    for e in rows:
        pnl = e.pnl or 0
        total += pnl
        count += 1
        if pnl > 0: wins += 1
        sid = str(e.strategy_id) if e.strategy_id else "unknown"
        by_strategy[sid] += pnl
    top = sorted(([k, v] for k, v in by_strategy.items()), key=lambda x: x[1], reverse=True)[:10]
    return {
        "total_pnl": str(total),
        "trades": count,
        "win_rate": (wins / count) if count else None,
        "top_strategies": [{"strategy_id": k, "pnl": str(v)} for k, v in top],
    }
