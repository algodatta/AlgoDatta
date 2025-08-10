from fastapi import APIRouter, Depends
from app.core.security import get_current_user
from app.schemas.broker import BrokerProfile

router = APIRouter()

@router.get("/profile", response_model=BrokerProfile)
def profile(user=Depends(get_current_user)):
    # Placeholder until DhanHQ adapter is wired
    return BrokerProfile(name="dhan", status="disconnected")
