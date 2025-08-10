from pydantic import BaseModel
from typing import Optional
from pydantic import ConfigDict

class ExecutionOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    strategy_id: int
    side: str
    qty: int
    price: Optional[float]
    status: str
    created_at: str
    class Config: from_attributes = True
