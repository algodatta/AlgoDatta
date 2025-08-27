import uuid, pytest

def _login(client):
    # Use a deterministic test account to avoid DB bloat
    email = "ci@algodatta.com"; password = "ChangeMe123!"
    client.post("/api/auth/register", json={"email": email, "password": password})
    r = client.post("/api/auth/login", json={"email": email, "password": password})
    assert r.status_code == 200
    return r.json()["access_token"]

def test_strategy_crud_and_toggle(client):
    token = _login(client)
    hdrs = {"Authorization": f"Bearer {token}"}
    # list
    r = client.get("/api/strategies", headers=hdrs); assert r.status_code == 200
    # create
    name = f"Smoke-{uuid.uuid4().hex[:6]}"
    r = client.post("/api/strategies", headers=hdrs, json={"name": name, "paper_trading": True})
    assert r.status_code in (200, 201)
    s = r.json(); sid = s.get("id")
    assert sid
    # toggle
    r = client.patch(f"/api/strategies/{sid}/toggle", headers=hdrs)
    assert r.status_code in (200, 204)