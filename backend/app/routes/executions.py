from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.execution import Execution
from app.core.security import get_current_user

router = APIRouter()

@router.get("")
def list_executions(db: Session = Depends(get_db), user=Depends(get_current_user)):
    rows = db.query(Execution).order_by(Execution.id.desc()).limit(100).all()
    # Minimal serialization for scaffold
    return [{
        "id": r.id, "strategy_id": r.strategy_id, "side": r.side, "qty": r.qty,
        "price": r.price, "status": r.status, "created_at": r.created_at.isoformat() if r.created_at else ""
    } for r in rows]
