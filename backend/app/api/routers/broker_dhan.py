import hmac, hashlib
from fastapi import APIRouter, Depends, HTTPException, Header, Request, Query
from sqlalchemy.orm import Session
from sqlalchemy import select
from typing import Optional
from app.api.deps import get_db
from app.core.config import settings
from app.models import Execution, ExecutionStatus

router = APIRouter(prefix="/broker/dhan", tags=["broker:dhan"])

def _verify_signature(raw_body: bytes, signature: Optional[str]) -> bool:
    secret = settings.dhan_postback_secret
    if not secret:
        return True  # no verification configured
    if not signature:
        return False
    mac = hmac.new(secret.encode("utf-8"), msg=raw_body, digestmod=hashlib.sha256).hexdigest()
    return hmac.compare_digest(mac, signature)

def _map_status(s: Optional[str]) -> ExecutionStatus:
    s = (s or "").upper()
    if s in ("PENDING","TRANSIT","PLACED","TRADED","PART_TRADED","MODIFIED"):
        return ExecutionStatus.success
    if s in ("REJECTED","CANCELLED","FAILED","ERROR"):
        return ExecutionStatus.fail
    return ExecutionStatus.pending

@router.post("/postback")
async def dhan_postback(request: Request, x_dhan_signature: Optional[str] = Header(None), secret: Optional[str] = Query(None), db: Session = Depends(get_db)):
    raw = await request.body()
    if settings.dhan_postback_secret:
        if not _verify_signature(raw, x_dhan_signature):
            raise HTTPException(status_code=401, detail="Invalid signature")
    elif secret and secret == settings.dhan_postback_secret:
        pass
    try:
        payload = await request.json()
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid JSON")

    order_id = str(payload.get("orderId") or payload.get("order_id") or "")
    status = payload.get("orderStatus") or payload.get("status")
    avg_price = payload.get("averageTradedPrice") or payload.get("avgPrice")
    if not order_id:
        raise HTTPException(status_code=400, detail="Missing orderId")

    row = db.execute(select(Execution).where(Execution.broker_order_id == order_id).order_by(Execution.created_at.desc()).limit(1)).scalar_one_or_none()
    if not row:
        return {"ok": True, "updated": 0}

    row.status = _map_status(status)
    resp = dict(row.response or {}); resp["postback"] = payload
    if avg_price is not None:
        resp["averageTradedPrice"] = avg_price
    row.response = resp
    db.add(row); db.commit(); db.refresh(row)

    return {"ok": True, "updated": 1, "execution_id": str(row.id), "status": row.status.value}
