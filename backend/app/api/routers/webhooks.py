from decimal import Decimal, InvalidOperation
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from sqlalchemy import select
from typing import Any
from app.api.deps import get_db
from app.models import Strategy, StrategyStatus, Alert, StrategyRisk
from app.services.risk import within_trading_window, exceeded_daily_loss, current_position_qty, rate_limit_exceeded
from app.services.idempotency import compute_key, seen_recently, remember
from app.metrics import webhook_requests, webhook_deduped, executions_total, execution_latency
from app.services.notifier import send_telegram, send_email
from app.services.execution_engine import paper_fill, live_execute_dhan

router = APIRouter(prefix="/webhook", tags=["webhook"])

def _to_decimal(x, default=None):
    if x is None or x == "":
        return default
    try:
        return Decimal(str(x))
    except (InvalidOperation, ValueError, TypeError):
        return default

def _to_int(x, default=None):
    try:
        d = Decimal(str(x))
        return int(d)
    except Exception:
        try:
            return int(x)
        except Exception:
            return default

@router.post("/{token}")
async def receive_signal(token: str, request: Request, db: Session = Depends(get_db)) -> Any:
    s = db.execute(select(Strategy).where(Strategy.webhook_path == token)).scalar_one_or_none()
    sid_label = str(s.id) if s else 'unknown'
    webhook_requests.labels(strategy_id=sid_label).inc()
    if not s or s.status != StrategyStatus.active:
        raise HTTPException(status_code=404, detail="Strategy not active or not found")

    # Idempotency check
    header_event = request.headers.get("X-Event-ID")
    raw_body = await request.body()
    try:
        body_json = await request.json()
    except Exception:
        body_json = {}
    idem_key = compute_key(s.id, body_json, header_event_id=header_event)
    if seen_recently(db, idem_key):
        return {"ok": True, "duplicate": True}

    # Risk config
    cfg = db.execute(select(StrategyRisk).where(StrategyRisk.strategy_id == s.id)).scalar_one_or_none()
    if cfg:
        if cfg.kill_switch:
            raise HTTPException(status_code=403, detail="Kill switch enabled")
        if not within_trading_window(cfg):
            raise HTTPException(status_code=403, detail="Outside trading window")
        if rate_limit_exceeded(db, s.id, cfg.max_signals_per_minute):
            raise HTTPException(status_code=429, detail="Rate limit exceeded")

        raise HTTPException(status_code=404, detail="Strategy not active or not found")

    # Extract payload (JSON or form)
    try:
        if "application/json" in (request.headers.get("content-type") or ""):
            payload = await request.json()
        else:
            form = await request.form()
            payload = dict(form)
    except Exception:
        payload = {}

    side = str(payload.get("side") or payload.get("action") or payload.get("signal") or "").upper()
    price = _to_decimal(payload.get("price") or payload.get("close") or payload.get("p"))
    qty = _to_int(payload.get("qty") or payload.get("quantity") or s.qty or 1)
    symbol = payload.get("symbol") or s.symbol

    if side not in ("BUY","SELL"):
        raise HTTPException(status_code=400, detail="Missing/invalid side (BUY/SELL)")
    if price is None:
        raise HTTPException(status_code=400, detail="Missing/invalid price")
    if qty is None or qty <= 0:
        raise HTTPException(status_code=400, detail="Missing/invalid qty (>0 required)")

    # Record alert
    a = Alert(strategy_id=s.id, symbol=str(symbol) if symbol else None, signal=side, price=price, raw_payload=payload)
    db.add(a); db.flush()

    # Execute
    from contextlib import nullcontext
    ctx = execution_latency.time()
    with ctx:
        if s.paper_trading:
            exe, snap = paper_fill(db, s, side, qty, price)
        else:
            exe = live_execute_dhan(db, s, side, qty, price)
            snap = None
    executions_total.labels(status=exe.status.value if exe.status else 'unknown').inc()

    remember(db, idem_key)
    db.commit()

    # Notify (best-effort)
    try:
        note = f"Exec {exe.status.value} {side} {qty} @ {price} for strategy {s.name}"
        from app.models import Notification, NotificationType
        from sqlalchemy import select as _select
        recips = db.execute(_select(Notification).where(Notification.user_id == s.user_id, Notification.verified == True)).scalars().all()
        for n in recips:
            if n.type.value == 'telegram':
                send_telegram(n.destination, note)
            elif n.type.value == 'email':
                send_email(n.destination, f"AlgoDatta Execution {exe.status.value}", note)
    except Exception:
        pass

    out = {
        "ok": True,
        "strategy_id": str(s.id),
        "execution": {
            "id": str(exe.id), "side": exe.side, "qty": str(exe.qty) if exe.qty is not None else None,
            "price": str(exe.price) if exe.price is not None else None, "status": exe.status.value
        },
    }
    if snap:
        out["position"] = {"position_qty": snap.position_qty, "avg_price": str(snap.avg_price) if snap.avg_price is not None else None}
        out["trade_pnl"] = str(exe.pnl) if exe.pnl is not None else None

    return out
