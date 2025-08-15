from pydantic import BaseModel
from typing import Optional
from uuid import UUID

class ReportFilter(BaseModel):
    strategy_id: Optional[UUID] = None
    from_date: Optional[str] = None  # ISO date
    to_date: Optional[str] = None
