# AlgoDatta — Phase 3 (Fixed, All-in-One)

✅ Strategy CRUD + Webhook + Paper Execution + Reports — **debugged** with stricter parsing & complete schemas.

## Docker quick start
```bash
cd backend
cp .env.example .env
docker compose up -d --build
python scripts/smoke_http.py
# -> PHASE-3 FIXED HTTP SMOKE: PASS
```

## Local quick start
```bash
cd backend
cp .env.example .env
# Set DATABASE_URL=postgresql+psycopg://postgres:postgres@localhost:5432/algodatta
pip install -r requirements.txt
python scripts/init_db.py   # alembic + seed
./run.sh
```

## Endpoints
- Auth: `POST /auth/login`, `GET /auth/me`
- Strategies: `GET/POST /strategies`, `GET/PATCH/DELETE /strategies/{id}`, `POST /strategies/{id}/toggle`, `POST /strategies/{id}/rotate-webhook`
- Webhook: `POST /webhook/{token}` (JSON or form payload)
- Reports: `GET /reports/pnl/summary`, `GET /reports/executions.csv`

Changes vs previous drop:
- Added missing `app/schemas/user.py` (fixes Admin imports).
- Webhook validates & coerces `qty` and `price` safely.
- Execution engine uses robust Decimal math; fixes qty/avg_price handling.
- Smoke test now exercises BUY + SELL and CSV export.


## DhanHQ Live Trading (new)
To enable live trading via DhanHQ:
1. Create a **DhanHQ broker** for the user (admin-only):
```bash
curl -X POST http://localhost:8000/admin/brokers/upsert \  -H "Authorization: Bearer $ADMIN_TOKEN" -H "Content-Type: application/json" \  -d '{ "user_id": "<USER_UUID>", "type":"dhanhq", "client_id":"1100003626", "access_token":"<ACCESS_TOKEN>" }'
```
2. Update the **strategy** to set Dhan fields and disable paper trading:
```bash
curl -X PATCH http://localhost:8000/strategies/<STRATEGY_ID> \  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \  -d '{ 
        "paper_trading": false,
        "broker_id": "<BROKER_UUID>",
        "status": "active",
        "mode": "live",
        "symbol": "RELIANCE",
        "qty": "1",
        "timeframe": "5m"
      }'
```
Then set Dhan-specific fields:
```bash
curl -X PATCH http://localhost:8000/strategies/<STRATEGY_ID> \  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \  -d '{ 
        "status": "active",
        "mode": "live",
        "symbol": "RELIANCE",
        "qty": "1",
        "timeframe": "5m"
      }'
```
Use the Admin or DB to set:
- `dhan_security_id` (e.g., `"11536"`)
- `dhan_exchange_segment` (`"NSE_EQ"`, `"MCX_COMM"`, etc.)
- `dhan_product_type` (`"INTRADAY"`, `"CNC"`, `"MARGIN"`, `"MTF"`)
- `dhan_order_type` (`"MARKET"`, `"LIMIT"`, `"STOP_LOSS"`, `"STOP_LOSS_MARKET"`)
- `dhan_validity` (`"DAY"`, `"IOC"`)

On webhook signal, the API will place a live order at Dhan if the strategy is `paper_trading=false`.

## New: Dhan Admin, Postback & Instruments
- Upload instrument list (CSV): `POST /admin/dhan/instruments/upload`
- Search instruments: `GET /instruments/search?q=RELI&exchange_segment=NSE_EQ`
- Patch strategy Dhan config: `POST /admin/dhan/strategies/{strategy_id}/config`
- Dhan postback webhook: `POST /broker/dhan/postback` (protect with `DHAN_POSTBACK_SECRET` -> SHA256 HMAC of raw body in `X-DHAN-SIGNATURE`).


### Dhan test-mode smoke
```bash
cd backend
cp .env.example .env
# Ensure DHAN_TEST_MODE=true (default in .env.example)
docker compose up -d --build
python scripts/smoke_http_dhan.py
# -> PHASE-3.6 (Dhan) SMOKE: PASS
```
When ready for real trading, set `DHAN_TEST_MODE=false` and configure valid Dhan credentials + strategy fields.


## Phase-4: Notifications + Risk + Idempotency + RateLimit
New endpoints:
- `GET/POST /risk/strategies/{strategy_id}` — Get/Set risk config
- `GET/POST/PATCH/DELETE /notifications` — Manage destinations (Telegram chat_id or Email)
- Admin: `GET /admin/executions` — quick view for latest executions

Webhook protections:
- **Idempotency** via `X-Event-ID` header or payload hash (window: `IDEMPOTENCY_WINDOW_SEC`).
- **Rate limit** per strategy via `StrategyRisk.max_signals_per_minute` (fallback env default).
- **Risk checks**: trading window, weekends, daily loss stop, position guard, kill switch.

Notifications:
- On each execution (success/fail), sends Telegram or Email to verified recipients (test-mode by default).

Env:
- `NOTIFY_TEST_MODE=true` to dry-run notifications.


## Phase-5: Orders, Positions, Dashboards, Metrics, and UI stubs
- **Orders API**: `GET /orders?strategy_id=&status=&limit=` and `GET /orders/{id}` (uses `Execution` records).
- **Positions API**: `GET /positions` (mine or all for admin), `GET /positions/{strategy_id}`. Paper uses snapshot; live derives from executions.
- **Dashboards**: `GET /dashboards/pnl/equity` (equity curve), `GET /dashboards/overview` (total pnl, win rate, top strategies).
- **Prometheus**: `GET /metrics` + counters/histograms for webhook activity & execution latency.
- **UI stub**: Static UI at `/ui` with role-based tab visibility; quick view for equity/orders/positions and admin summary.
