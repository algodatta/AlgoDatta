from pydantic import BaseModel
from typing import Optional, Literal
from uuid import UUID

class StrategyCreate(BaseModel):
    name: str
    symbol: Optional[str] = None
    timeframe: Optional[str] = None
    qty: Optional[str] = None
    mode: Optional[str] = None
    broker_id: Optional[UUID] = None
    paper_trading: bool = True

class StrategyUpdate(BaseModel):
    name: Optional[str] = None
    symbol: Optional[str] = None
    timeframe: Optional[str] = None
    qty: Optional[str] = None
    mode: Optional[str] = None
    broker_id: Optional[UUID] = None
    paper_trading: Optional[bool] = None
    status: Optional[Literal["active","paused","error"]] = None
    # Dhan fields
    dhan_security_id: Optional[str] = None
    dhan_exchange_segment: Optional[str] = None
    dhan_product_type: Optional[str] = None
    dhan_order_type: Optional[str] = None
    dhan_validity: Optional[str] = None
