import io, csv, datetime as dt
from fastapi import APIRouter, Depends, Response, Query
from sqlalchemy.orm import Session
from sqlalchemy import select, func
from typing import Optional
from uuid import UUID
from app.api.deps import get_db, get_current_user
from app.models import Execution, Strategy
from decimal import Decimal

router = APIRouter(prefix="/reports", tags=["reports"])

def _date(d: Optional[str]) -> Optional[dt.datetime]:
    if not d: return None
    try:
        return dt.datetime.fromisoformat(d)
    except Exception:
        return None

@router.get("/executions.csv")
def executions_csv(
    db: Session = Depends(get_db),
    user = Depends(get_current_user),
    strategy_id: Optional[UUID] = Query(None),
    from_date: Optional[str] = Query(None),
    to_date: Optional[str] = Query(None),
):
    q = select(Execution)
    if user.role.value != "admin":
        # limit to user's strategies
        q = q.join(Strategy, Strategy.id == Execution.strategy_id).where(Strategy.user_id == user.id)
    if strategy_id:
        q = q.where(Execution.strategy_id == strategy_id)
    fromd = _date(from_date); tod = _date(to_date)
    if fromd: q = q.where(Execution.created_at >= fromd)
    if tod: q = q.where(Execution.created_at <= tod)

    rows = db.execute(q.order_by(Execution.created_at.asc())).scalars().all()

    buf = io.StringIO()
    w = csv.writer(buf)
    w.writerow(["id","strategy_id","side","qty","price","mode","status","pnl","created_at"])
    for e in rows:
        w.writerow([
            str(e.id), str(e.strategy_id) if e.strategy_id else "", e.side,
            str(e.qty) if e.qty is not None else "", str(e.price) if e.price is not None else "",
            e.mode, e.status.value if e.status else "", str(e.pnl) if e.pnl is not None else "",
            e.created_at.isoformat() if e.created_at else ""
        ])
    return Response(content=buf.getvalue(), media_type="text/csv", headers={
        "Content-Disposition": "attachment; filename=executions.csv"
    })

@router.get("/pnl/summary")
def pnl_summary(
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
    fromd = _date(from_date); tod = _date(to_date)
    if fromd: q = q.where(Execution.created_at >= fromd)
    if tod: q = q.where(Execution.created_at <= tod)

    rows = db.execute(q).scalars().all()

    # aggregate per day and per strategy
    by_day = {}
    by_strategy = {}
    total = Decimal(0)
    for e in rows:
        d = e.created_at.date().isoformat() if e.created_at else "unknown"
        by_day[d] = by_day.get(d, Decimal(0)) + (e.pnl or 0)
        sid = str(e.strategy_id) if e.strategy_id else "unknown"
        by_strategy[sid] = by_strategy.get(sid, Decimal(0)) + (e.pnl or 0)
        total += e.pnl or 0

    def _ser(m): return [{ "key": k, "pnl": str(v) } for k, v in sorted(m.items())]
    return {
        "total_pnl": str(total),
        "by_day": _ser(by_day),
        "by_strategy": _ser(by_strategy),
        "count": len(rows),
    }
