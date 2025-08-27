import asyncio, logging
from typing import Dict, Any, Optional
from app.services.notifier import send_slack, send_discord, send_telegram, build_slack_trade_blocks

log = logging.getLogger("trade_executor")

async def notify_order_event(event: str, detail: Dict[str, Any]):
    text = f"[AlgoDatta] {event}: {detail.get('symbol','?')} qty={detail.get('qty','?')} status={detail.get('status','?')}"
    await asyncio.gather(
        send_slack(text, blocks=blocks),
        send_discord(text),
        send_telegram(text),
    )

async def execute_order(symbol: str, qty: int, side: str) -> Dict[str, Any]:
    # Dummy execution flow; integrate with DhanHQ or Paper engine
    detail = {"symbol": symbol, "qty": qty, "side": side, "status": "PLACED"}
    await notify_order_event("ORDER_PLACED", detail)
    # ... place real order here ...
    detail["status"] = "FILLED"
    await notify_order_event("ORDER_FILLED", detail)
    log.info("order_complete", **detail)
    return detail
