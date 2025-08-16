from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..db import get_db
from .. import models
from ..schemas import BrokerIn
from ..deps import get_current_user

router = APIRouter()

@router.post("/broker")
def link_broker(body: BrokerIn, db: Session = Depends(get_db), user: models.User = Depends(get_current_user)):
    broker = db.query(models.Broker).filter(models.Broker.user_id == user.id).first()
    if not broker:
        broker = models.Broker(user_id=user.id, dhan_token=body.auth_token)
        db.add(broker)
    else:
        broker.dhan_token = body.auth_token
    db.commit()
    return {"status": "ok"}
