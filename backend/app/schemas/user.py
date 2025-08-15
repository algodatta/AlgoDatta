from pydantic import BaseModel, EmailStr
from typing import Literal
from uuid import UUID

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    role: Literal["user","admin"] = "user"

class UserRead(BaseModel):
    id: UUID
    email: EmailStr
    role: str
    status: str

class UserStatusUpdate(BaseModel):
    status: Literal["active","disabled"]
