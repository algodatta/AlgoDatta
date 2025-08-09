from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional
from app.db import get_db
from app.models.execution import Execution, ExecutionStatus, ExecutionType
from app.core.deps import get_current_user

router = APIRouter(dependencies=[Depends(get_current_user)])

@router.get("/executions")
def list_executions(
    status: Optional[ExecutionStatus] = Query(None),
    type: Optional[ExecutionType] = Query(None),
    limit: int = Query(50, ge=1, le=500),
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    q = db.query(Execution).order_by(Execution.executed_at.desc())
    if status:
        q = q.filter(Execution.status == status)
    if type:
        q = q.filter(Execution.type == type)
    return q.limit(limit).all()
