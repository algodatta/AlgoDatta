from fastapi import APIRouter
router = APIRouter(prefix="/api/broker", tags=["broker"])

@router.get("/profile")
def profile():
    return {
        "client_id": "DHAN12345",
        "name": "AlgoDatta User",
        "email": "user@example.com",
        "phone": "+91-90000-00000",
        "segment": ["EQ", "FO", "MCX"],
        "balance": 100000.0,
        "broker": "DhanHQ"
    }

@router.get("/holdings")
def holdings():
    return [
        {"symbol": "RELIANCE", "qty": 10, "avg_price": 2500.0, "ltp": 2555.5, "pnl": 555.0},
        {"symbol": "INFY", "qty": 5, "avg_price": 1400.0, "ltp": 1390.0, "pnl": -50.0},
    ]

@router.get("/positions")
def positions():
    return [
        {"symbol": "NATURALGAS", "side": "LONG", "qty": 1, "avg_price": 222.5, "ltp": 224.0, "pnl": 150.0},
        {"symbol": "CRUDEOIL", "side": "SHORT", "qty": 1, "avg_price": 6900.0, "ltp": 6950.0, "pnl": -500.0},
    ]

@router.post("/connect")
def connect():
    return {"message": "Broker connected (stub). Replace with real DhanHQ auth flow."}
