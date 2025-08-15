from pydantic import BaseModel
from typing import Optional

class RiskConfig(BaseModel):
    max_position_qty: Optional[int] = None
    max_daily_loss: Optional[float] = None
    trading_start: Optional[str] = None   # "HH:MM"
    trading_end: Optional[str] = None
    allow_weekends: Optional[bool] = None
    max_signals_per_minute: Optional[int] = None
    kill_switch: Optional[bool] = None
