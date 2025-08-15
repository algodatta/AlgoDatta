import os, json, sys
import httpx

BASE = os.getenv("BASE_URL", "http://localhost:8000")
ADMIN_EMAIL = os.getenv("ADMIN_EMAIL", "admin@algodatta.com")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "ChangeMe123!")

def main():
    try:
        r = httpx.get(f"{BASE}/healthz", timeout=10); r.raise_for_status()
        r = httpx.post(f"{BASE}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}, timeout=10); r.raise_for_status()
        token = r.json()["access_token"]
        H = {"Authorization": f"Bearer {token}"}

        # create strategy
        r = httpx.post(f"{BASE}/strategies", json={"name":"PH3 Smoke","symbol":"TEST","qty":"2","paper_trading":True}, headers=H, timeout=10); r.raise_for_status()

        # find latest
        r = httpx.get(f"{BASE}/strategies", headers=H, timeout=10); r.raise_for_status()
        sid = r.json()[0]["id"]
        # rotate webhook
        r = httpx.post(f"{BASE}/strategies/{sid}/rotate-webhook", headers=H, timeout=10); r.raise_for_status()
        wh = r.json()["webhook_path"]

        # webhook BUY/SELL
        r = httpx.post(f"{BASE}/webhook/{wh}", json={"side":"BUY","price":100.5,"qty":1,"symbol":"TEST"}, timeout=10); r.raise_for_status()
        r = httpx.post(f"{BASE}/webhook/{wh}", json={"side":"SELL","price":101.5,"qty":1,"symbol":"TEST"}, timeout=10); r.raise_for_status()

        # pnl summary
        r = httpx.get(f"{BASE}/reports/pnl/summary", headers=H, timeout=10); r.raise_for_status()
        # csv
        r = httpx.get(f"{BASE}/reports/executions.csv", headers=H, timeout=10); r.raise_for_status()

        print("PHASE-3 FIXED HTTP SMOKE: PASS")
        print(json.dumps(r.headers, indent=2))
        return 0
    except Exception as e:
        print("PHASE-3 FIXED HTTP SMOKE: FAIL")
        print(e)
        return 1

if __name__ == "__main__":
    sys.exit(main())
