from typing import Optional, Dict, Any
import uuid, httpx
from decimal import Decimal
from app.models import Strategy, Broker
from app.core.config import settings

DHAN_BASE = "https://api.dhan.co/v2"

class DhanClient:
    def __init__(self, access_token: str, client_id: str):
        self.access_token = access_token
        self.client_id = client_id

    def _headers(self) -> Dict[str, str]:
        return {
            "Content-Type": "application/json",
            "access-token": self.access_token,
        }

    def place_order(self, *, side: str, strategy: Strategy, qty: int, price: Optional[Decimal] = None, correlation_id: Optional[str] = None) -> Dict[str, Any]:
        if correlation_id is None:
            correlation_id = str(uuid.uuid4())
        payload = {
            "dhanClientId": self.client_id,
            "correlationId": correlation_id,
            "transactionType": side.upper(),  # BUY/SELL
            "exchangeSegment": strategy.dhan_exchange_segment,
            "productType": strategy.dhan_product_type or "INTRADAY",
            "orderType": strategy.dhan_order_type or "MARKET",
            "validity": strategy.dhan_validity or "DAY",
            "securityId": strategy.dhan_security_id,
            "quantity": int(qty),
        }
        if payload["orderType"] in ("LIMIT","STOP_LOSS") and price is not None:
            payload["price"] = float(price)
        if payload["orderType"] in ("STOP_LOSS","STOP_LOSS_MARKET") and price is not None:
            payload.setdefault("triggerPrice", float(price))

        with httpx.Client(timeout=10) as client:
            r = client.post(f"{DHAN_BASE}/orders", headers=self._headers(), json=payload)
        r.raise_for_status()
        return r.json()
