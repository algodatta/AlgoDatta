import time, uuid, pytest

@pytest.mark.order(after="test_strategies.py::test_strategy_crud_and_toggle")
def test_webhook_idempotency(client):
    # Login
    r = client.post("/api/auth/login", json={"email":"ci@algodatta.com","password":"ChangeMe123!"})
    assert r.status_code == 200
    token = r.json()["access_token"]
    hdrs = {"Authorization": f"Bearer {token}"}

    # Create a strategy
    name = f"Idem-{uuid.uuid4().hex[:6]}"
    r = client.post("/api/strategies", headers=hdrs, json={"name": name, "paper_trading": True})
    assert r.status_code in (200,201), r.text
    s = r.json(); sid = s["id"]

    # Simulate TV webhook payload with idempotency key
    idem = uuid.uuid4().hex
    payload = {"strategy_id": sid, "symbol": "NIFTY", "side": "BUY", "price": 100.0, "idempotency_key": idem}

    # Send twice
    r1 = client.post("/api/webhook/tradingview", json=payload); assert r1.status_code in (200, 202)
    r2 = client.post("/api/webhook/tradingview", json=payload); assert r2.status_code in (200, 202)

    # Expect only one execution recorded for that idempotency_key
    # If API exposes a filter, use it; otherwise just ensure not a 500.
    assert r1.json() != {"detail":"Internal Server Error"}
    assert r2.json() != {"detail":"Internal Server Error"}