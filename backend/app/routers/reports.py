import csv, io
from fastapi import APIRouter, Depends, Response
from sqlalchemy.orm import Session
from ..db import get_db
from .. import models
from ..deps import get_current_user

router = APIRouter()

@router.get("/csv")
def export_csv(db: Session = Depends(get_db), user: models.User = Depends(get_current_user)):
    rows = db.query(models.Execution).filter(models.Execution.user_id == user.id).order_by(models.Execution.created_at.desc()).all()
    buf = io.StringIO()
    w = csv.writer(buf)
    w.writerow(["id","strategy_id","symbol","side","price","created_at"])
    for r in rows:
        w.writerow([r.id, r.strategy_id, r.symbol, r.side, r.price, r.created_at.isoformat()])
    data = buf.getvalue().encode("utf-8")
    return Response(content=data, media_type="text/csv", headers={"Content-Disposition":"attachment; filename=executions.csv"})
