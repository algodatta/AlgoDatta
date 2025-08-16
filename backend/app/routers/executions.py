from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..db import get_db
from .. import models
from ..deps import get_current_user
from ..schemas import ExecutionOut

router = APIRouter()

@router.get("/executions", response_model=list[ExecutionOut])
def list_execs(db: Session = Depends(get_db), user: models.User = Depends(get_current_user)):
    qs = db.query(models.Execution).filter(models.Execution.user_id == user.id).order_by(models.Execution.created_at.desc()).all()
    return [ExecutionOut(id=e.id, strategy_id=e.strategy_id, symbol=e.symbol, side=e.side, price=e.price) for e in qs]
