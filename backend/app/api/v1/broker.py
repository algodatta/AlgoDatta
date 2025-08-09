from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from uuid import uuid4
from datetime import datetime
from app.db import get_db
from app.models.broker import Broker, BrokerType
from app.core.deps import get_current_user

router = APIRouter(dependencies=[Depends(get_current_user)])

@router.post("/broker")
def link_broker(payload: dict, db: Session = Depends(get_db), user = Depends(get_current_user)):
    # Ensure DB has client_id column (runtime safeguard)
    try:
        db.execute("ALTER TABLE brokers ADD COLUMN IF NOT EXISTS client_id TEXT")
        db.commit()
    except Exception:
        db.rollback()
        broker_type = payload.get("broker_type") or "dhanhq"
    client_id = payload.get("client_id")
    access_token = payload.get("access_token") or payload.get("auth_token")
    auth_token = access_token

    if not client_id or not auth_token:
        return {"error": "client_id and access_token (auth_token) required"}

    broker = db.query(Broker).filter(Broker.user_id == user.id).first()
    if broker:
        broker.type = broker_type
        broker.client_id = client_id
        broker.auth_token = auth_token
        broker.connected_at = datetime.utcnow()
    else:
        broker = Broker(
            id=uuid4(),
            user_id=user.id,
            type=broker_type,
            client_id=client_id,
            auth_token=auth_token,
            connected_at=datetime.utcnow()
        )
        db.add(broker)
    db.commit()
    return {"status": "Broker linked"}
