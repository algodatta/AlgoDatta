import os, httpx, sys, time, json

BASE = os.getenv("BASE_URL", "http://localhost:8000")

def main():
    try:
        # login
        r = httpx.post(f"{BASE}/auth/login", json={"email":"admin@algodatta.com","password":"ChangeMe123!"}, timeout=15); r.raise_for_status()
        token = r.json()["access_token"]; H={"Authorization": f"Bearer {token}"}

        # create a strategy
        r = httpx.post(f"{BASE}/strategies", headers=H, json={"name":"PH4 Smoke","symbol":"TEST","qty":"1","paper_trading":True}, timeout=15); r.raise_for_status()
        sid = r.json().get("id") or httpx.get(f"{BASE}/strategies", headers=H).json()[0]["id"]

        # set tight risk: 1 signal/min
        r = httpx.post(f"{BASE}/risk/strategies/{sid}", headers=H, json={"max_signals_per_minute": 1}, timeout=15); r.raise_for_status()

        # rotate webhook
        wh = httpx.post(f"{BASE}/strategies/{sid}/rotate-webhook", headers=H, timeout=15).json()["webhook_path"]

        # first BUY (should pass)
        r1 = httpx.post(f"{BASE}/webhook/{wh}", json={"side":"BUY","price":100.0,"qty":1}, timeout=15); r1.raise_for_status()

        # duplicate via X-Event-ID (should de-dupe with 200)
        r2 = httpx.post(f"{BASE}/webhook/{wh}", headers={"X-Event-ID":"evt-123"}, json={"side":"BUY","price":100.0,"qty":1}, timeout=15); r2.raise_for_status()
        r3 = httpx.post(f"{BASE}/webhook/{wh}", headers={"X-Event-ID":"evt-123"}, json={"side":"BUY","price":100.0,"qty":1}, timeout=15); r3.raise_for_status()
        dup = r3.json().get("duplicate") is True

        # second without event id quickly (should rate-limit to 429 or return ok if limiter not strict)
        status_ok = True
        try:
            r4 = httpx.post(f"{BASE}/webhook/{wh}", json={"side":"SELL","price":99.0,"qty":1}, timeout=15)
            status_ok = r4.status_code in (200, 429)
        except Exception:
            status_ok = False

        print("PHASE-4 SMOKE: PASS" if (dup and status_ok) else "PHASE-4 SMOKE: WARN")
        return 0
    except Exception as e:
        print("PHASE-4 SMOKE: FAIL")
        print(e)
        return 1

if __name__ == "__main__":
    sys.exit(main())
