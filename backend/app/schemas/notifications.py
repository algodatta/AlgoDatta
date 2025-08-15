from pydantic import BaseModel, EmailStr
from typing import Optional, Literal
from uuid import UUID

class NotificationCreate(BaseModel):
    type: Literal["telegram","email"]
    destination: str

class NotificationRead(BaseModel):
    id: UUID
    type: str
    destination: str
    verified: bool

class NotificationVerify(BaseModel):
    verified: bool
