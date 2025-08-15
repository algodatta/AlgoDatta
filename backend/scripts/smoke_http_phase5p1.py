import os, sys, httpx

BASE = os.getenv("BASE_URL", "http://localhost:8000")
def main():
    try:
        r = httpx.post(f"{BASE}/auth/login", json={"email":"admin@algodatta.com","password":"ChangeMe123!"}, timeout=15); r.raise_for_status()
        tok = r.json()["access_token"]; H={"Authorization": f"Bearer {tok}"}
        # Users search (empty ok)
        r = httpx.get(f"{BASE}/admin/users/search", headers=H, params={"q":"admin","limit":10,"offset":0}, timeout=15); r.raise_for_status()
        # Orders page (empty ok)
        r = httpx.get(f"{BASE}/orders/page", headers=H, params={"limit":10,"offset":0}, timeout=15); r.raise_for_status()
        # Admin executions page
        r = httpx.get(f"{BASE}/admin/executions", headers=H, params={"limit":10,"offset":0}, timeout=15); r.raise_for_status()
        print("PHASE-5p1 SMOKE: PASS")
        return 0
    except Exception as e:
        print("PHASE-5p1 SMOKE: FAIL")
        print(e)
        return 1

if __name__ == "__main__":
    sys.exit(main())
