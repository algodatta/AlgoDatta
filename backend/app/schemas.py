from pydantic import BaseModel, EmailStr
from typing import Optional, List

class RegisterIn(BaseModel):
    email: EmailStr
    password: str

class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"

class BrokerIn(BaseModel):
    auth_token: str

class StrategyIn(BaseModel):
    name: str
    script: Optional[str] = None
    paper_trading: bool = True

class StrategyOut(BaseModel):
    id: str
    name: str
    webhook_path: str
    is_active: bool
    paper_trading: bool

class WebhookPayload(BaseModel):
    signal: str
    symbol: str
    price: float

class ExecutionOut(BaseModel):
    id: str
    strategy_id: str
    symbol: str
    side: str
    price: float
