from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import select, func, desc
from typing import List, Optional
from uuid import UUID
from app.api.deps import get_db, require_admin
from app.core.security import get_password_hash
from app.schemas.user import UserCreate, UserRead, UserStatusUpdate
from app.schemas.common import Message
from app.models import User, UserRole, UserStatus, Strategy, Broker, Alert, Execution, ErrorLog

router = APIRouter(prefix="/admin", tags=["admin"], dependencies=[Depends(require_admin)])

@router.get("/users", response_model=List[UserRead])
def list_users(db: Session = Depends(get_db), q: Optional[str] = Query(None)):
    stmt = select(User)
    if q:
        stmt = stmt.where(User.email.ilike(f"%{q}%"))
    rows = db.execute(stmt.order_by(User.email.asc())).scalars().all()
    return [UserRead(id=u.id, email=u.email, role=u.role.value, status=u.status.value) for u in rows]

@router.post("/users", response_model=UserRead, responses={409: {"model": Message}})
def create_user(payload: UserCreate, db: Session = Depends(get_db)):
    exists = db.execute(select(User).where(User.email == payload.email)).scalar_one_or_none()
    if exists:
        raise HTTPException(status_code=409, detail="Email already exists")
    u = User(email=payload.email, password_hash=get_password_hash(payload.password), role=UserRole(payload.role))
    db.add(u); db.commit(); db.refresh(u)
    return UserRead(id=u.id, email=u.email, role=u.role.value, status=u.status.value)

@router.patch("/users/{user_id}/status", response_model=UserRead)
def update_user_status(user_id: UUID, body: UserStatusUpdate, db: Session = Depends(get_db)):
    u = db.get(User, user_id)
    if not u:
        raise HTTPException(status_code=404, detail="User not found")
    u.status = UserStatus(body.status)
    db.add(u); db.commit(); db.refresh(u)
    return UserRead(id=u.id, email=u.email, role=u.role.value, status=u.status.value)

@router.get("/summary")
def admin_summary(db: Session = Depends(get_db)):
    counts = {
        "users": db.scalar(select(func.count()).select_from(User)),
        "brokers": db.scalar(select(func.count()).select_from(Broker)),
        "strategies": db.scalar(select(func.count()).select_from(Strategy)),
        "alerts": db.scalar(select(func.count()).select_from(Alert)),
        "executions": db.scalar(select(func.count()).select_from(Execution)),
        "errors": db.scalar(select(func.count()).select_from(ErrorLog)),
    }
    latest_exec = db.execute(select(Execution).order_by(desc(Execution.created_at)).limit(10)).scalars().all()
    return {
        "counts": counts,
        "latest_executions": [{
            "id": str(e.id), "strategy_id": str(e.strategy_id) if e.strategy_id else None,
            "side": e.side, "qty": str(e.qty) if e.qty is not None else None,
            "price": str(e.price) if e.price is not None else None, "status": e.status.value if e.status else None,
            "created_at": e.created_at.isoformat() if e.created_at else None
        } for e in latest_exec]
    }


from app.models import BrokerType, Broker
from pydantic import BaseModel

class BrokerUpsert(BaseModel):
    user_id: str
    type: str = "dhanhq"
    client_id: str
    access_token: str

@router.post("/brokers/upsert")
def upsert_broker(body: BrokerUpsert, db: Session = Depends(get_db)):
    # find existing broker for user and type
    b = db.execute(select(Broker).where(Broker.user_id == body.user_id, Broker.type == BrokerType.dhanhq)).scalar_one_or_none()
    if not b:
        b = Broker(user_id=body.user_id, type=BrokerType.dhanhq)
    b.client_id = body.client_id
    b.auth_token = body.access_token
    db.add(b); db.commit(); db.refresh(b)
    return {"id": str(b.id), "user_id": str(b.user_id), "type": b.type.value}


@router.get("/executions")
def list_executions(db: Session = Depends(get_db), limit: int = Query(50, ge=1, le=500), offset: int = Query(0, ge=0), strategy_id: Optional[str] = Query(None), side: Optional[str] = Query(None), status: Optional[str] = Query(None), symbol: Optional[str] = Query(None)):
    from app.models import ExecutionStatus, Strategy
    q = select(Execution); qc = select(func.count()).select_from(Execution)
    if strategy_id:
        q = q.where(Execution.strategy_id == strategy_id); qc = qc.where(Execution.strategy_id == strategy_id)
    if side:
        q = q.where(Execution.side == side.upper()); qc = qc.where(Execution.side == side.upper())
    if status:
        try:
            st = ExecutionStatus(status); q = q.where(Execution.status == st); qc = qc.where(Execution.status == st)
        except Exception: pass
    if symbol:
        q = q.join(Strategy, Strategy.id == Execution.strategy_id).where(Strategy.symbol.ilike(f"%{symbol}%"))
        qc = qc.join(Strategy, Strategy.id == Execution.strategy_id).where(Strategy.symbol.ilike(f"%{symbol}%"))
    total = db.execute(qc).scalar_one()
    rows = db.execute(q.order_by(Execution.created_at.desc()).offset(offset).limit(limit)).scalars().all()
    out = []
    for e in rows:
        out.append({
            "id": str(e.id), "strategy_id": str(e.strategy_id) if e.strategy_id else None,
            "side": e.side, "qty": str(e.qty) if e.qty is not None else None,
            "price": str(e.price) if e.price is not None else None,
            "status": e.status.value if e.status else None,
            "broker_order_id": e.broker_order_id,
            "created_at": e.created_at.isoformat() if e.created_at else None
        })
    return {"items": out, "total": total}


@router.get("/users/search")
def search_users(q: Optional[str] = Query(None), limit: int = Query(50, ge=1, le=500), offset: int = Query(0, ge=0), db: Session = Depends(get_db), user=Depends(require_admin)):
    from app.models import User
    s = select(User)
    sc = select(func.count()).select_from(User)
    if q:
        s = s.where(User.email.ilike(f"%{q}%"))
        sc = sc.where(User.email.ilike(f"%{q}%"))
    total = db.execute(sc).scalar_one()
    rows = db.execute(s.order_by(User.email.asc()).offset(offset).limit(limit)).scalars().all()
    return {"items": [{"id": str(u.id), "email": u.email, "role": u.role.value} for u in rows], "total": total}
