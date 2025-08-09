import os
from typing import Dict, Any

MODE = os.getenv("TRADE_MODE", "paper")

def place_order(symbol: str, side: str, qty: int, price: float) -> Dict[str, Any]:
    """Minimal stub to unblock flow. Returns ok True and echoes args in paper mode.
    In future, wire to Dhan adapter on live mode."""
    if MODE == "live":
        # TODO: integrate with broker adapter; for now, simulate accepted
        return {"ok": True, "mode": "live-sim", "order": {"symbol": symbol, "side": side, "qty": qty, "price": price}}
    return {"ok": True, "mode": "paper", "order": {"symbol": symbol, "side": side, "qty": qty, "price": price}}
