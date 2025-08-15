import os, sys, httpx, json

BASE = os.getenv("BASE_URL", "http://localhost:8000")

def main():
    try:
        # login admin
        r = httpx.post(f"{BASE}/auth/login", json={"email":"admin@algodatta.com","password":"ChangeMe123!"}, timeout=15); r.raise_for_status()
        token = r.json()["access_token"]; H={"Authorization": f"Bearer {token}"}

        # Orders (should work even if empty)
        r = httpx.get(f"{BASE}/orders", headers=H, timeout=15); r.raise_for_status()

        # Positions (list)
        r = httpx.get(f"{BASE}/positions", headers=H, timeout=15); r.raise_for_status()

        # Dashboards
        r = httpx.get(f"{BASE}/dashboards/pnl/equity", headers=H, timeout=15); r.raise_for_status()
        r = httpx.get(f"{BASE}/dashboards/overview", headers=H, timeout=15); r.raise_for_status()

        # Metrics endpoint
        r = httpx.get(f"{BASE}/metrics", timeout=15); r.raise_for_status()
        assert "algodatta_webhook_requests_total" in r.text

        print("PHASE-5 SMOKE: PASS")
        return 0
    except Exception as e:
        print("PHASE-5 SMOKE: FAIL")
        print(e)
        return 1

if __name__ == "__main__":
    sys.exit(main())
