from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db import get_db
from app.core.deps import get_current_user, require_admin
from app.models.error_log import ErrorLog
from app.schemas.error_log import ErrorLogRead

router = APIRouter(dependencies=[Depends(get_current_user)])

@router.get("/error-logs", response_model=list[ErrorLogRead])
def list_error_logs(db: Session = Depends(get_db), user=Depends(get_current_user)):
    # Regular users: own + global; Admin: all
    q = db.query(ErrorLog).order_by(ErrorLog.created_at.desc()).limit(200)
    return q.all()
