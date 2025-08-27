from fastapi import APIRouter
from pydantic import BaseModel, Field
from typing import Optional
import asyncio
try:
    from app.services.trade_executor import execute_order
except Exception:
    async def execute_order(symbol: str, qty: int, side: str):
        await asyncio.sleep(0.01)
        return {"symbol": symbol, "qty": qty, "side": side, "status": "SIMULATED"}

router = APIRouter(prefix="/api/trades", tags=["trades"])

class TradeIn(BaseModel):
    symbol: str = Field(..., examples=["NATURALGAS"])
    qty: int = Field(..., ge=1, examples=[1])
    side: str = Field(..., pattern="^(BUY|SELL)$")

@router.post("/execute")
async def execute(trade: TradeIn):
    detail = await execute_order(trade.symbol, trade.qty, trade.side)
    return {"ok": True, "detail": detail}
