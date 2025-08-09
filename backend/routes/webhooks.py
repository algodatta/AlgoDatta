from fastapi import APIRouter, Request, Depends, HTTPException
from sqlalchemy.orm import Session
from ..db import get_db
from ..models import Strategy, Execution
from ..trade_service import place_order
from ..notifier import send_telegram, send_email
from .alerts import get_user_prefs
import os

router = APIRouter()

FALLBACK_SECRET = os.getenv("WEBHOOK_FALLBACK_SECRET")  # used if Strategy.secret column doesn't exist

@router.post("/{strategy_id}")
async def webhook(strategy_id: int, request: Request, db: Session = Depends(get_db)):
    # Strategy must exist and be enabled
    s = db.query(Strategy).filter(Strategy.id == strategy_id).first()
    if not s:
        raise HTTPException(404, "Strategy not found")
    if hasattr(s, "enabled") and not s.enabled:
        return {"ok": False, "error": "Strategy disabled"}

    # Check signature: prefer per-strategy secret if column exists, else fallback env secret
    provided = request.query_params.get("k", "")
    expected = getattr(s, "secret", None) if hasattr(s, "secret") else (FALLBACK_SECRET or None)

    if not expected or provided != str(expected):
        raise HTTPException(401, "Invalid webhook signature")

    # Parse JSON body
    try:
        data = await request.json()
    except Exception:
        data = {}

    symbol = data.get("symbol", "NATGAS")
    side = str(data.get("side", "BUY")).upper()
    qty = int(data.get("qty", 1))
    price = float(data.get("price", 0))

    # Place the order via paper/live engine
    engine_resp = place_order(symbol, side, qty, price)
    status = "FILLED" if engine_resp.get("ok") else "REJECTED"

    # Persist execution if model available
    try:
        exe = Execution(strategy_id=s.id, symbol=symbol, side=side, qty=qty, price=price, status=status)
        db.add(exe); db.commit()
    except Exception:
        # If the model schema differs in your project, skip persistence silently
        db.rollback()

    # Alerts
    try:
        prefs = get_user_prefs(s.user_id)
        msg = f"[AlgoDatta] {symbol} {side} {qty} @ {price} [{status}]"
        if prefs.get("enable_telegram") and prefs.get("telegram_chat_id"):
            send_telegram(prefs.get("telegram_chat_id"), msg)
        if prefs.get("enable_email") and prefs.get("email"):
            send_email(prefs.get("email"), "Trade Execution", msg)
    except Exception:
        pass

    return {"ok": True, "status": status, "engine": engine_resp}
