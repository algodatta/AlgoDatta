from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import select, desc, func
from typing import Optional, List
from uuid import UUID
from app.api.deps import get_db, get_current_user, require_owner_or_admin
from app.models import Execution, Strategy, User

router = APIRouter(prefix="/orders", tags=["orders"])

@router.get("")
def list_orders(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
    strategy_id: Optional[UUID] = Query(None),
    status: Optional[str] = Query(None),
    limit: int = 100
):
    q = select(Execution)
    if strategy_id:
        q = q.where(Execution.strategy_id == strategy_id)
    if status:
        from app.models import ExecutionStatus
        try:
            st = ExecutionStatus(status)
            q = q.where(Execution.status == st)
        except Exception:
            pass
    if user.role.value != "admin":
        q = q.join(Strategy, Strategy.id == Execution.strategy_id).where(Strategy.user_id == user.id)
    rows = db.execute(q.order_by(desc(Execution.created_at)).limit(limit)).scalars().all()
    return [{
        "id": str(e.id),
        "strategy_id": str(e.strategy_id) if e.strategy_id else None,
        "side": e.side,
        "qty": str(e.qty) if e.qty is not None else None,
        "price": str(e.price) if e.price is not None else None,
        "status": e.status.value if e.status else None,
        "broker_order_id": e.broker_order_id,
        "created_at": e.created_at.isoformat() if e.created_at else None
    } for e in rows]

@router.get("/{order_id}")
def get_order(order_id: UUID, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    e = db.get(Execution, order_id)
    if not e:
        raise HTTPException(status_code=404, detail="Order not found")
    if user.role.value != "admin" and e.strategy_id:
        s = db.get(Strategy, e.strategy_id)
        require_owner_or_admin(s, user)
    return {
        "id": str(e.id),
        "strategy_id": str(e.strategy_id) if e.strategy_id else None,
        "side": e.side,
        "qty": str(e.qty) if e.qty is not None else None,
        "price": str(e.price) if e.price is not None else None,
        "status": e.status.value if e.status else None,
        "response": e.response,
        "broker_order_id": e.broker_order_id,
        "created_at": e.created_at.isoformat() if e.created_at else None
    }


@router.get("/page")
def list_orders_page(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
    strategy_id: Optional[UUID] = Query(None),
    status: Optional[str] = Query(None),
    side: Optional[str] = Query(None),
    symbol: Optional[str] = Query(None),
    limit: int = Query(50, ge=1, le=500),
    offset: int = Query(0, ge=0),
):
    from app.models import ExecutionStatus, Strategy
    q = select(Execution)
    qcount = select(func.count()).select_from(Execution)
    if strategy_id:
        q = q.where(Execution.strategy_id == strategy_id)
        qcount = qcount.where(Execution.strategy_id == strategy_id)
    if status:
        try:
            st = ExecutionStatus(status)
            q = q.where(Execution.status == st)
            qcount = qcount.where(Execution.status == st)
        except Exception:
            pass
    if side:
        q = q.where(Execution.side == side.upper())
        qcount = qcount.where(Execution.side == side.upper())
    if symbol:
        q = q.join(Strategy, Strategy.id == Execution.strategy_id).where(Strategy.symbol.ilike(f"%{symbol}%"))
        qcount = qcount.join(Strategy, Strategy.id == Execution.strategy_id).where(Strategy.symbol.ilike(f"%{symbol}%"))

    if user.role.value != "admin":
        q = q.join(Strategy, Strategy.id == Execution.strategy_id).where(Strategy.user_id == user.id)
        qcount = qcount.join(Strategy, Strategy.id == Execution.strategy_id).where(Strategy.user_id == user.id)

    total = db.execute(qcount).scalar_one()
    rows = db.execute(q.order_by(desc(Execution.created_at)).offset(offset).limit(limit)).scalars().all()
    items = [{
        "id": str(e.id),
        "strategy_id": str(e.strategy_id) if e.strategy_id else None,
        "side": e.side,
        "qty": str(e.qty) if e.qty is not None else None,
        "price": str(e.price) if e.price is not None else None,
        "status": e.status.value if e.status else None,
        "broker_order_id": e.broker_order_id,
        "created_at": e.created_at.isoformat() if e.created_at else None
    } for e in rows]
    return {"items": items, "total": total}
