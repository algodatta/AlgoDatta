from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.models.alert import Alert
from app.models.strategy import Strategy
from app.models.broker import Broker
from typing import Optional
from app.db import get_db
from app.models.execution import Execution, ExecutionStatus, ExecutionType
from app.core.deps import get_current_user

router = APIRouter(dependencies=[Depends(get_current_user)])

@router.get("/executions")
def list_executions(
    status: Optional[ExecutionStatus] = Query(None),
    type: Optional[ExecutionType] = Query(None),
    client_id: Optional[str] = Query(None),
    limit: int = Query(50, ge=1, le=500),
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
): = Query(None),
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
    rows = q.join(Alert, Execution.alert_id == Alert.id)\
        .join(Strategy, Alert.strategy_id == Strategy.id)\
        .join(Broker, Strategy.broker_id == Broker.id)\
        .add_columns(Broker.client_id)\
        .limit(limit).all()
    out = []
    for r in rows:
        exec_obj, broker_client_id = r[0], r[1]
        out.append({
            'id': str(exec_obj.id),
            'alert_id': str(exec_obj.alert_id),
            'type': exec_obj.type.value if hasattr(exec_obj.type, 'value') else str(exec_obj.type),
            'status': exec_obj.status.value if hasattr(exec_obj.status, 'value') else str(exec_obj.status),
            'response': exec_obj.response,
            'executed_at': exec_obj.executed_at.isoformat() if exec_obj.executed_at else None,
            'retry_count': getattr(exec_obj, 'retry_count', 0),
            'broker_client_id': broker_client_id
        })
    return out
