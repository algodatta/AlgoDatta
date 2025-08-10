from fastapi import APIRouter, Depends, Response
from sqlalchemy.orm import Session
from io import StringIO
import csv
from app.db.session import get_db
from app.core.security import get_current_user
from app.models.execution import Execution

router = APIRouter()

@router.get("/export")
def export_csv(db: Session = Depends(get_db), user=Depends(get_current_user)):
    rows = db.query(Execution).order_by(Execution.id.desc()).limit(1000).all()
    f = StringIO()
    writer = csv.writer(f)
    writer.writerow(["id","strategy_id","side","qty","price","status","created_at"])
    for r in rows:
        writer.writerow([r.id, r.strategy_id, r.side, r.qty, r.price, r.status, (r.created_at.isoformat() if r.created_at else '')])
    return Response(content=f.getvalue(), media_type="text/csv")
