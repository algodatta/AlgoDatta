import os, time, json, uuid, sys
import requests

API = os.getenv("SMOKE_BASE", "http://localhost:8000")
def url(p): return API.rstrip("/") + p

def pp(resp):
    try:
        return resp.status_code, resp.json()
    except Exception:
        return resp.status_code, resp.text[:200]

def main():
    print("== AlgoDatta API Smoke Test ==")
    # 1) Register (ignore if exists), then login
    email = f"smoke_{uuid.uuid4().hex[:6]}@algodatta.io"
    settings.GENERIC_PASSWORD"
    print("Registering:", email)
    r = requests.post(url("/api/register"), json={"email": email, "password": password})
    print("REGISTER ->", pp(r))

    r = requests.post(url("/api/login"), json={"email": email, "password": password})
    if r.status_code != 200:
        print("Login failed, cannot continue.", pp(r)); sys.exit(1)
    token = r.json().get("access_token")
    headers = {"Authorization": f"Bearer {token}"}
    print("LOGIN -> 200")

    # 2) Notifications list/add/delete
    r = requests.get(url("/api/notifications"), headers=headers)
    print("GET /notifications ->", pp(r))
    r = requests.post(url("/api/notifications"), headers=headers, json={"method":"telegram","endpoint":"123456"})
    print("POST /notifications ->", pp(r))
    nid = r.json().get("id") if r.status_code==200 else None
    if nid:
        r = requests.delete(url(f"/api/notifications/{nid}"), headers=headers)
        print("DELETE /notifications/{id} ->", pp(r))

    # 3) Strategies CRUD
    # For broker id, allow empty/None if not enforced; otherwise user must link a broker
    payload = {"name":"Smoke Strat","script":"strategy.entry('Buy', strategy.long)","broker_id":str(uuid.uuid4()),"paper_trading":True}
    r = requests.post(url("/api/strategies"), headers=headers, json=payload)
    print("POST /strategies ->", pp(r))
    sid = r.json().get("id") if r.status_code==200 else None
    r = requests.get(url("/api/strategies"), headers=headers)
    print("GET /strategies ->", pp(r))
    if sid:
        r = requests.patch(url(f"/api/strategies/{sid}"), headers=headers, json={"status":"paused"})
        print("PATCH /strategies/{id} ->", pp(r))
        r = requests.delete(url(f"/api/strategies/{sid}"), headers=headers)
        print("DELETE /strategies/{id} ->", pp(r))

    # 4) Executions list (filters)
    r = requests.get(url("/api/executions"), headers=headers, params={"status":"success","limit":5})
    print("GET /executions (filters) ->", pp(r))

    # 5) Reports CSV (just ensure 200)
    r = requests.get(url("/api/reports/csv"), headers=headers, params={"status":"success"})
    print("GET /reports/csv ->", r.status_code, r.headers.get("content-type"))

    # 6) Error logs
    r = requests.get(url("/api/error-logs"), headers=headers)
    print("GET /error-logs ->", pp(r))

    print("== Smoke test completed ==")

if __name__ == "__main__":
    main()


# Extra: check notifications for broker_client_id
r = requests.get(url("/api/notifications"), headers=headers)
print("GET /notifications (with client_id) ->", pp(r))

# Extra: filtered executions by client_id (use one from notifications if present)
try:
    items = r.json()
    cid = None
    if isinstance(items, list) and items:
        for it in items:
            if isinstance(it, dict) and it.get("broker_client_id"):
                cid = it.get("broker_client_id"); break
    if cid:
        r2 = requests.get(url("/api/executions"), headers=headers, params={"client_id": cid, "limit": 5})
        print("GET /executions?client_id= ->", pp(r2))
except Exception as e:
    print("client_id filter check skipped:", e)
