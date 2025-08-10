from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.strategy import Strategy
from app.models.alert import Alert
from app.models.execution import Execution

router = APIRouter()

@router.post("/tradingview")
async def tradingview(request: Request, db: Session = Depends(get_db)):
    body = await request.json()
    secret = body.get("secret")
    strategy_id = body.get("strategy_id") or body.get("strategyId")
    side = body.get("side")
    qty = int(body.get("qty", 1))
    price = body.get("price")
    idemp = body.get("idempotency_key")
    if not all([secret, strategy_id, side, idemp]):
        raise HTTPException(400, "Missing required fields")
    s = db.query(Strategy).filter(Strategy.id == int(strategy_id)).first()
    if not s or s.webhook_secret != secret:
        raise HTTPException(401, "Invalid secret or strategy")
    exists = db.query(Alert).filter(Alert.idempotency_key == idemp).first()
    if exists:
        return {"status": "duplicate"}
    alert = Alert(strategy_id=s.id, idempotency_key=idemp, payload_json=body, status="received")
    db.add(alert); db.commit(); db.refresh(alert)
    ex = Execution(strategy_id=s.id, side=side, qty=qty, price=price, mode=s.mode, status="queued")
    db.add(ex); db.commit(); db.refresh(ex)
    return {"status": "queued", "execution_id": ex.id}
