import os, sys, io, json, httpx, uuid

BASE = os.getenv("BASE_URL", "http://localhost:8000")

def main():
    try:
        # health
        r = httpx.get(f"{BASE}/healthz", timeout=15); r.raise_for_status()

        # login admin
        r = httpx.post(f"{BASE}/auth/login", json={"email":"admin@algodatta.com","password":"ChangeMe123!"}, timeout=15); r.raise_for_status()
        token = r.json()["access_token"]; H = {"Authorization": f"Bearer {token}"}

        # upload a tiny CSV of instruments
        csv_data = "securityId,tradingSymbol,exchangeSegment,name\n11536,RELIANCE,NSE_EQ,RELIANCE IND\n"
        files = {"file": ("mini_instruments.csv", csv_data, "text/csv")}
        r = httpx.post(f"{BASE}/admin/dhan/instruments/upload", headers=H, files=files, timeout=30); r.raise_for_status()

        # search instruments
        r = httpx.get(f"{BASE}/instruments/search", params={"q":"RELI","exchange_segment":"NSE_EQ"}, timeout=15); r.raise_for_status()
        sec = r.json()[0]["security_id"]

        # create strategy
        r = httpx.post(f"{BASE}/strategies", headers=H, json={"name":"LiveSim","symbol":"RELIANCE","qty":"1","paper_trading":False}, timeout=15); r.raise_for_status()
        sid = r.json()["id"] if "id" in r.json() else None
        if not sid:
            # fallback: list and take first
            r2 = httpx.get(f"{BASE}/strategies", headers=H, timeout=15); r2.raise_for_status()
            sid = r2.json()[0]["id"]

        # upsert a Dhan broker for this admin user
        users = httpx.get(f"{BASE}/admin/users", headers=H, timeout=15).json()
        uid = users[0]["id"]
        r = httpx.post(f"{BASE}/admin/brokers/upsert", headers=H, json={"user_id": uid, "type":"dhanhq", "client_id":"1100000000", "access_token":"TEST_TOKEN"}, timeout=15); r.raise_for_status()
        bid = r.json()["id"]

        # configure strategy with Dhan fields
        r = httpx.post(f"{BASE}/admin/dhan/strategies/{sid}/config", headers=H, json={
            "dhan_security_id": sec, "dhan_exchange_segment": "NSE_EQ",
            "dhan_product_type":"INTRADAY","dhan_order_type":"MARKET","dhan_validity":"DAY",
            "paper_trading": False, "broker_id": bid
        }, timeout=15); r.raise_for_status()

        # rotate webhook, fire a BUY (this will simulate live order and set broker_order_id)
        wh = httpx.post(f"{BASE}/strategies/{sid}/rotate-webhook", headers=H, timeout=15).json()["webhook_path"]
        r = httpx.post(f"{BASE}/webhook/{wh}", json={"side":"BUY","price":2500.0,"qty":1,"symbol":"RELIANCE"}, timeout=15); r.raise_for_status()
        resp = r.json(); assert resp["ok"] is True
        # find the order id for postback
        executions = httpx.get(f"{BASE}/admin/executions", headers=H, timeout=15).json()
        oid = None
        for e in executions:
            if e.get("broker_order_id"):
                oid = e["broker_order_id"]; break
        if not oid:
            # fallback: known simulated id
            oid = f"TEST-{sid}"

        # simulate Dhan postback -> set status TRADED
        r = httpx.post(f"{BASE}/broker/dhan/postback", json={"orderId": oid, "orderStatus":"TRADED","averageTradedPrice":2501.25}, timeout=15); r.raise_for_status()
        assert r.json().get("ok") is True

        print("PHASE-3.6 (Dhan) SMOKE: PASS")
        return 0
    except Exception as e:
        print("PHASE-3.6 (Dhan) SMOKE: FAIL")
        print(e)
        return 1

if __name__ == "__main__":
    sys.exit(main())
