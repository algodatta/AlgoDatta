from fastapi import APIRouter
from typing import Dict

router = APIRouter(prefix="/api/strategies", tags=["strategies"])

# In-memory store for demo
_STRATS: Dict[str, Dict] = {
    "strat-1": {"id":"strat-1","name":"NG QuickScalp","status":"running","metrics":{"win_rate":0.62,"pnl":15500.5,"trades":128}},
    "strat-2": {"id":"strat-2","name":"Mean Revert","status":"stopped","metrics":{"win_rate":0.48,"pnl":-2200.0,"trades":60}},
}

@router.get("")
def list_strategies():
    return list(_STRATS.values())

@router.post("/{strategy_id}/toggle")
def toggle_strategy(strategy_id: str):
    s = _STRATS.get(strategy_id)
    if not s:
        return {"id": strategy_id, "status": "error", "message": "Strategy not found"}
    s["status"] = "stopped" if s["status"] == "running" else "running"
    return {"id": strategy_id, "status": s["status"], "message": f"Strategy {s['status']}"}
