from pydantic import BaseModel, EmailStr
from uuid import UUID
from datetime import datetime
from enum import Enum

class NotificationMethod(str, Enum):
    email = "email"
    telegram = "telegram"

class NotificationBase(BaseModel):
    method: NotificationMethod
    endpoint: str
    enabled: bool = True

class NotificationCreate(NotificationBase):
    pass

class NotificationRead(NotificationBase):
    id: UUID
    user_id: UUID
    created_at: datetime
    class Config:
        orm_mode = True
