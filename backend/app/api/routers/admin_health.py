from datetime import datetime, timezone
from fastapi import APIRouter

router = APIRouter(prefix="/api/admin", tags=["admin"])

@router.get("/health")
def health() -> dict:
    return {
        "status": "ok",
        "time": datetime.now(timezone.utc).isoformat(),
    }