import os, uuid, pytest

@pytest.mark.skipif(os.getenv("SKIP_AUTH_TESTS")=="1", reason="auth tests skipped by env")
def test_register_and_login_flow(client):
    email = f"ci+{uuid.uuid4().hex[:8]}@algodatta.com"
    settings.GENERIC_PASSWORD"
    r = client.post("/api/auth/register", json={"email": email, "password": password})
    assert r.status_code in (200, 201, 409)  # 409 if already exists in reused DB
    r = client.post("/api/auth/login", json={"email": email, "password": password})
    assert r.status_code == 200
    token = r.json().get("access_token")
    assert token and isinstance(token, str)