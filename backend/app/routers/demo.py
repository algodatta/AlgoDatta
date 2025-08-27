from fastapi import APIRouter, Depends
from ..security.deps import get_current_user, require_roles, AuthUser

router = APIRouter(prefix="", tags=["auth-demo"])

@router.get("/me")
def who_am_i(user: AuthUser = Depends(get_current_user)):
    return {"sub": user.sub, "roles": user.roles, "claims": user.claims}

@router.get("/admin/ping")
def admin_ping(user: AuthUser = Depends(require_roles("admin"))):
    return {"ok": True, "area": "admin", "user_roles": user.roles}

@router.get("/executions/private")
def executions_private(user: AuthUser = Depends(require_roles("admin", "trader"))):
    return {"ok": True, "area": "executions", "user_roles": user.roles}

@router.get("/reports/private")
def reports_private(user: AuthUser = Depends(require_roles("admin", "analyst"))):
    return {"ok": True, "area": "reports", "user_roles": user.roles}
