from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from datetime import datetime
from app.schemas import admin as S
from app.services import health as H
from app.services import users as U
from app.services import alerts as A

router = APIRouter(prefix="/api/admin", tags=["admin"])

@router.get("/health", response_model=S.HealthPayload)
def get_health():
    # TODO: read real version/uptime from your app state
    return H.compute_health(version="1.0.0", uptime_sec=86400)

@router.get("/users", response_model=List[S.AdminUser])
def list_users():
    users = U.list_users()
    return [S.AdminUser(
        id=u.id, name=u.name, email=u.email, role=u.role, is_enabled=u.is_enabled,
        created_at=u.created_at.isoformat() if getattr(u, "created_at", None) else None,
        last_login_at=u.last_login_at.isoformat() if getattr(u, "last_login_at", None) else None
    ) for u in users]

@router.patch("/users/{user_id}", response_model=S.AdminUser)
def patch_user(user_id: str, payload: S.AdminUserPatch):
    u = U.patch_user(user_id, role=payload.role, is_enabled=payload.is_enabled)
    if not u:
        raise HTTPException(404, "User not found")
    return S.AdminUser(
        id=u.id, name=u.name, email=u.email, role=u.role, is_enabled=u.is_enabled,
        created_at=u.created_at.isoformat() if getattr(u, "created_at", None) else None,
        last_login_at=u.last_login_at.isoformat() if getattr(u, "last_login_at", None) else None
    )

@router.get("/alerts", response_model=List[S.AdminAlert])
def list_alerts(limit: int = Query(100, ge=1, le=1000)):
    items = A.list_alerts(limit=limit)
    return [S.AdminAlert(
        id=a.id, level=a.level.value, source=a.source, message=a.message, timestamp=a.timestamp.isoformat()
    ) for a in items]
