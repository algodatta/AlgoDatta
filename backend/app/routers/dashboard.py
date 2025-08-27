from fastapi import APIRouter, Depends
from ..security.deps import get_current_user, require_roles, AuthUser
import random

router = APIRouter(prefix="/dashboard", tags=["dashboard"])

@router.get("/summary")
def summary(user: AuthUser = Depends(get_current_user)):
    # TODO: replace with real DB aggregation
    return {
        "pnl": round(random.uniform(-5000, 15000), 2),
        "open_orders": random.randint(0, 12),
        "positions": random.randint(0, 8),
        "strategies": random.randint(1, 12),
        "alerts_24h": random.randint(0, 40),
    }
