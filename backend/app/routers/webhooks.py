from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..db import get_db
from .. import models
from ..schemas import WebhookPayload
from ..deps import get_current_user

router = APIRouter()

@router.post("/webhooks/{webhook_path}")
def trigger(webhook_path: str, body: WebhookPayload, db: Session = Depends(get_db), user: models.User = Depends(get_current_user)):
    s = db.query(models.Strategy).filter(models.Strategy.webhook_path == webhook_path, models.Strategy.user_id == user.id).first()
    if not s:
        raise HTTPException(status_code=404, detail="Strategy not found")
    ex = models.Execution(user_id=user.id, strategy_id=s.id, symbol=body.symbol, side=body.signal, price=body.price)
    db.add(ex)
    db.commit()
    return {"status": "queued", "execution_id": ex.id}
