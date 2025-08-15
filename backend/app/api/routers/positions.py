from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import select
from typing import List
from uuid import UUID
from app.api.deps import get_db, get_current_user, require_owner_or_admin
from app.models import Strategy, User
from app.services.positions import position_for_strategy

router = APIRouter(prefix="/positions", tags=["positions"])

@router.get("")
def my_positions(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    q = select(Strategy)
    if user.role.value != "admin":
        q = q.where(Strategy.user_id == user.id)
    rows = db.execute(q).scalars().all()
    return [position_for_strategy(db, s) for s in rows]

@router.get("/{strategy_id}")
def position_one(strategy_id: UUID, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    s = db.get(Strategy, strategy_id)
    require_owner_or_admin(s, user)
    return position_for_strategy(db, s)
