from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from enum import Enum
from typing import Any, Dict, Optional

class ErrorType(str, Enum):
    webhook = "webhook"
    execution = "execution"
    other = "other"

class ErrorLogRead(BaseModel):
    id: UUID
    user_id: Optional[UUID]
    error_type: ErrorType
    message: str
    details: Optional[Dict[str, Any]]
    created_at: datetime
    class Config:
        orm_mode = True
