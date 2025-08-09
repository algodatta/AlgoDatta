from fastapi import APIRouter, Response, Depends, Query
from sqlalchemy.orm import Session
from io import StringIO
from datetime import datetime
import csv
from typing import Optional
from ..db import get_db
from ..models import Execution, Strategy, User
from ..security import get_current_user

router = APIRouter()

def _apply_filters(q, db: Session, user: User, since: Optional[str], until: Optional[str], strategy_id: Optional[int], status: Optional[str]):
    # Restrict to user's strategies unless admin
    if not getattr(user, "is_admin", False):
        user_sids = [sid for (sid,) in db.query(Strategy.id).filter(Strategy.user_id == user.id).all()]
        if not user_sids:
            return q.filter(False)  # empty result
        q = q.filter(Execution.strategy_id.in_(user_sids))

    # Date filters
    if since:
        try:
            dt = datetime.fromisoformat(since)
            q = q.filter(Execution.created_at >= dt)
        except Exception:
            pass
    if until:
        try:
            dt = datetime.fromisoformat(until)
            q = q.filter(Execution.created_at <= dt)
        except Exception:
            pass

    # Strategy filter
    if strategy_id is not None:
        q = q.filter(Execution.strategy_id == strategy_id)

    # Status filter
    if status:
        q = q.filter(Execution.status == status)

    return q

@router.get("")
def list_report_rows(
    since: Optional[str] = Query(None, description="ISO date/time: e.g. 2025-08-01 or 2025-08-01T00:00:00"),
    until: Optional[str] = Query(None, description="ISO date/time"),
    strategy_id: Optional[int] = Query(None),
    status: Optional[str] = Query(None, description="e.g. FILLED or REJECTED"),
    limit: int = Query(200, ge=1, le=5000),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    q = db.query(Execution)
    q = _apply_filters(q, db, user, since, until, strategy_id, status)
    rows = q.order_by(Execution.id.desc()).limit(limit).all()
    return [{
        "id": e.id, "strategy_id": e.strategy_id, "symbol": getattr(e, "symbol", None),
        "side": getattr(e, "side", None), "qty": getattr(e, "qty", None), "price": getattr(e, "price", None),
        "status": getattr(e, "status", None),
        "created_at": e.created_at.isoformat() if hasattr(e, "created_at") and e.created_at else None
    } for e in rows]

@router.get("/csv")
def csv_download(
    since: Optional[str] = Query(None, description="ISO date/time"),
    until: Optional[str] = Query(None, description="ISO date/time"),
    strategy_id: Optional[int] = Query(None),
    status: Optional[str] = Query(None, description="e.g. FILLED or REJECTED"),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    si = StringIO()
    writer = csv.writer(si)
    writer.writerow(["id","strategy_id","symbol","side","qty","price","status","created_at"])
    q = db.query(Execution)
    q = _apply_filters(q, db, user, since, until, strategy_id, status)
    for e in q.order_by(Execution.id):
        writer.writerow([
            e.id, e.strategy_id, getattr(e, "symbol", ""), getattr(e, "side", ""),
            getattr(e, "qty", ""), getattr(e, "price", ""), getattr(e, "status", ""),
            e.created_at.isoformat() if hasattr(e, "created_at") and e.created_at else ""
        ])
    return Response(content=si.getvalue(), media_type="text/csv",
                    headers={"Content-Disposition":"attachment; filename=executions.csv"})
