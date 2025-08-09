from fastapi import APIRouter, Depends, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from typing import Optional
from datetime import datetime
from io import StringIO
import csv

from app.db import get_db
from app.models.execution import Execution, ExecutionStatus, ExecutionType
from app.core.deps import get_current_user

router = APIRouter(dependencies=[Depends(get_current_user)])

@router.get("/reports/csv")
def export_csv(
    status: Optional[ExecutionStatus] = Query(None),
    type: Optional[ExecutionType] = Query(None),
    start: Optional[str] = Query(None, description="YYYY-MM-DD"),
    end: Optional[str] = Query(None, description="YYYY-MM-DD"),
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    q = db.query(Execution)
    if status:
        q = q.filter(Execution.status == status)
    if type:
        q = q.filter(Execution.type == type)
    if start:
        try:
            dt = datetime.strptime(start, "%Y-%m-%d")
            q = q.filter(Execution.executed_at >= dt)
        except ValueError:
            pass
    if end:
        try:
            dt = datetime.strptime(end, "%Y-%m-%d")
            q = q.filter(Execution.executed_at < dt.replace(hour=23, minute=59, second=59))
        except ValueError:
            pass

    q = q.order_by(Execution.executed_at.desc()).limit(1000)
    rows = q.all()

    output = StringIO()
    writer = csv.writer(output)
    writer.writerow(["executed_at", "type", "status", "response"])
    for r in rows:
        writer.writerow([
            r.executed_at.isoformat() if r.executed_at else "",
            r.type.value if hasattr(r.type, "value") else str(r.type),
            r.status.value if hasattr(r.status, "value") else str(r.status),
            str(r.response)
        ])
    output.seek(0)
    return StreamingResponse(output, media_type="text/csv", headers={
        "Content-Disposition": "attachment; filename=executions.csv"
    })
