from pydantic import BaseModel, ConfigDict
from typing import Optional
class ExecutionOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int; strategy_id: int; side: str; qty: int; price: Optional[float]; status: str; created_at: str
