from pydantic import BaseModel, EmailStr
from typing import Optional, List, Dict, Any, Literal

Role = Literal['admin','user']

class AdminUser(BaseModel):
    id: str
    name: Optional[str] = None
    email: EmailStr
    role: Role
    is_enabled: bool
    created_at: Optional[str] = None
    last_login_at: Optional[str] = None

class AdminUserPatch(BaseModel):
    role: Optional[Role] = None
    is_enabled: Optional[bool] = None

class HealthService(BaseModel):
    name: str
    status: Literal['up','down','degraded']
    latency_ms: Optional[int] = None
    details: Optional[Dict[str, Any]] = None

class HealthPayload(BaseModel):
    status: Literal['ok','degraded','down']
    version: Optional[str] = None
    uptime_sec: Optional[int] = None
    db: Optional[Dict[str, Any]] = None
    services: Optional[List[HealthService]] = None

class AdminAlert(BaseModel):
    id: str
    level: Literal['INFO','WARN','ERROR']
    source: str
    message: str
    timestamp: str
