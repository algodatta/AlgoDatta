from pydantic import BaseModel, ConfigDict
from typing import Optional, Literal
class StrategyCreate(BaseModel):
    name: str
    symbol: str
    timeframe: str = "5m"
    qty: int = 1
    mode: Literal["paper","live"] = "paper"
class StrategyOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int; name: str; symbol: str; timeframe: str; qty: int; mode: str; status: str; webhook_secret: Optional[str] = None
