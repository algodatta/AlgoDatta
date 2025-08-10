
# AlgoDatta — Spec-1 Gap Analysis & Implementation Plan
*Date:* 2025-08-10

## 1) Context
- **Project Zip:** `AlgoDatta.zip`
- **Spec:** `Spec-1-auto Trading Platform (1).pdf`
- **Goal:** Identify all gaps vs spec and outline a practical, phased implementation plan that turns the current codebase into a working DhanHQ + TradingView automated trading platform (paper & live).

---

## 2) Executive Summary of Missing / Incomplete Items
**Frontend (Next.js)**
- [ ] Login/auth UI & session handling
- [ ] Strategy Editor (incl. Pine message preview), Deploy-to-Webhook UX
- [ ] Realtime Execution Status view (stream/log console)
- [ ] Reports dashboard with filters & CSV export
- [ ] Admin Panel (user list, disable user, broker reset)
- [ ] Page routing hygiene (App Router only; remove `pages/*` conflicts; Tailwind configured)

**Backend (FastAPI)**
- [ ] Auth service (JWT, register/login/me, password hashing)
- [ ] Strategy Manager (CRUD, toggle, deploy, webhook secret issuance)
- [ ] TradingView Webhook listener (shared secret, schema validation, idempotency key)
- [ ] Trade Executor service (route to Paper or Dhan live broker adapter)
- [ ] Paper Trade engine (fills, positions, PnL, fees/slippage model)
- [ ] Broker adapter (DhanHQ: connect, profile, holdings, positions, place/cancel, order status)
- [ ] Alerts/Notifications (Telegram + Email), message templates
- [ ] Logging & Retry (dead-letter/retry queue for webhook/executions)
- [ ] Reports service (summary metrics + CSV streaming endpoint)

**Database / Models**
- [ ] `users`, `strategies`, `alerts`, `executions`, `paper_trades` tables
- [ ] `notifications` fully used end-to-end; `brokers` relations finalized
- [ ] Alembic migrations & seeds (admin user, sample strategy)

**DevOps / Tooling**
- [ ] Docker Compose (frontend + backend + Postgres + pgAdmin)
- [ ] Jenkins/CI pipeline (build/test/migrate/deploy)
- [ ] Pytest suite, Postman collection
- [ ] `.env` management for backend & frontend

---

## 3) Detailed Gap List (By Layer)
### 3.1 Frontend (Next.js App Router)
- **Authentication**
  - Missing login/register pages, token storage/refresh, protected routes guard.
- **Strategy Manager UI**
  - Create strategy (name, symbol, timeframe, qty, mode: paper/live)
  - Edit/clone/delete; toggle enable/disable
  - “Deploy” shows the webhook URL + secret, and a copyable TradingView alert JSON
- **Executions View**
  - Live stream (server-sent events or polling) of alerts → orders → fills
  - Per-execution detail drawer with request/response JSON and logs
- **Reports**
  - Filters: date range, strategy, symbol, mode
  - KPIs: Win%, Avg PnL, Sharpe (simple), Max DD, Total Trades
  - Export CSV button (front-end calls `/api/reports/export?…`)
- **Admin Panel**
  - User list, role badges, enable/disable, reset broker token
- **Hygiene**
  - Remove legacy `pages/*`; use only `app/*`
  - Tailwind configured and loaded once
  - Centralized API base via `NEXT_PUBLIC_API_BASE`

### 3.2 Backend (FastAPI)
- **Auth Service**
  - `/api/auth/register`, `/login`, `/me`, refresh/rotate tokens; password hashing (bcrypt), JWT (HS256), RBAC (admin, user)
- **Strategy Manager**
  - `/api/strategies` CRUD, `/toggle`, `/deploy` (issues `webhook_secret`)
- **TradingView Webhook**
  - `/api/webhook/tradingview` (POST): validates shared secret, schema, idempotency key; persists an `alert` row; enqueues execution
- **Execution Pipeline**
  - `TradeExecutor`: normalizes order request, routes to `PaperEngine` or `DhanBroker`
  - Idempotent submission, retry policy (exponential backoff), DLQ table for failed actions
- **Broker Adapter: DhanHQ**
  - Connect (OAuth/token flow), profile/holdings/positions, place/cancel order, order status polling
- **Paper Engine**
  - Naive matching engine (market/limit), positions & PnL, fees/slippage model, timestamps in IST
- **Notifications**
  - Telegram bot & SendGrid email; opt-in per user/strategy; message templates (alert received, order placed, order filled, error)
- **Reports**
  - Summary aggregates; time-bucketed stats; CSV streaming endpoint
- **Logging**
  - Structured logs (JSON), correlation IDs per alert/execution, audit trail

### 3.3 Database / Entities (proposed minimal schema)
- **users**: id, email, password_hash, role, status, created_at
- **brokers**: id, user_id FK, name, access_token, refresh_token, status, connected_at, updated_at
- **strategies**: id, user_id FK, name, symbol, timeframe, qty, mode(paper|live), status, webhook_secret, created_at, updated_at
- **alerts**: id, strategy_id FK, idempotency_key, payload_json, received_at, processed_at, status, error_text
- **executions**: id, strategy_id FK, side, qty, price, mode, broker_order_id, status, pnl, created_at, updated_at
- **paper_trades**: id, strategy_id FK, side, qty, price, fill_ts, position_qty, avg_price
- **notifications**: id, user_id FK, type(telegram|email), destination, verified, created_at
- **error_logs**: id, user_id FK (nullable), context, message, stack, created_at

---

## 4) Phased Implementation Plan
**Phase 0 — Project Hygiene (1st)**
- Remove `pages/*` conflicts; consolidate to `app/*`
- Tailwind setup; shared layout; API base via env
- Central error boundary & toast system

**Phase 1 — Data Layer**
- SQLAlchemy models + Alembic migrations
- Seed admin user; seed sample strategy

**Phase 2 — Auth & Admin**
- JWT auth, password hashing
- Admin endpoints & UI (user list, disable/enable, reset broker token)

**Phase 3 — Strategies & Webhook**
- Strategy CRUD/toggle/deploy
- TradingView webhook: validation, persistence, idempotency

**Phase 4 — Execution Pipeline**
- TradeExecutor + PaperEngine (PnL & positions)
- Dhan broker adapter (profile/positions/place/cancel/status)
- Retry & DLQ tables, correlation IDs

**Phase 5 — Reports**
- Aggregated metrics + CSV export endpoint
- Reports UI with filters + export

**Phase 6 — Notifications**
- Telegram + Email integration, templates, opt-ins

**Phase 7 — Frontend Integration**
- Broker page (connect, profile, holdings, positions)
- Strategies page (table, toggles, deploy modal)
- Executions page (live log stream, details)
- Reports page (KPIs, table, CSV)
- Admin page (users, broker reset)

**Phase 8 — CI/CD & Ops**
- Docker Compose (frontend, backend, postgres, pgadmin)
- Jenkins: build, test, migrate, deploy
- Env hardening, secrets handling

**Phase 9 — Tests & Tooling**
- Pytest unit & API tests
- Postman collection, sample envs
- Load-testing webhook endpoint (idempotency check)

---

## 5) Key Files to Add/Update (Illustrative)
```
backend/
  app/
    main.py
    core/
      config.py
      security.py
      logging.py
    models/
      user.py
      broker.py
      strategy.py
      alert.py
      execution.py
      paper_trade.py
      notification.py
      error_log.py
      __init__.py
    schemas/
      auth.py
      strategy.py
      execution.py
      broker.py
      notification.py
    routes/
      auth.py
      strategies.py
      webhook.py
      executions.py
      reports.py
      broker_dhan.py
      admin.py
      notifications.py
    services/
      trade_executor.py
      paper_engine.py
      broker_dhan.py
      notifier.py
      retry_queue.py
    db/
      session.py
      base.py
      migrations/ (alembic)
frontend/
  app/
    layout.tsx
    page.tsx
    broker/page.tsx
    strategies/page.tsx
    executions/page.tsx
    reports/page.tsx
    admin/page.tsx
  lib/api.ts
  components/
    StrategyTable.tsx
    StrategyForm.tsx
    DeployModal.tsx
    LiveLogConsole.tsx
    KpiCards.tsx
    CsvExportButton.tsx
```

---

## 6) Environment Variables (.env examples)
**Backend**
```
SECRET_KEY=changeme
ACCESS_TOKEN_EXPIRE_MINUTES=60
DATABASE_URL=postgresql+psycopg2://postgres:postgres@db:5432/algodatta
DHAN_API_KEY=your_key
DHAN_API_SECRET=your_secret
TELEGRAM_BOT_TOKEN=your_bot_token
SENDGRID_API_KEY=your_sendgrid_key
TZ=Asia/Kolkata
```

**Frontend**
```
NEXT_PUBLIC_API_BASE=http://localhost:8000
```

---

## 7) API Contracts (Samples)
**TradingView Alert → Webhook JSON**
```json
{
  "secret": "{{webhook_secret}}",
  "idempotency_key": "{{strategy_id}}-{{timestamp}}-{{bar}}",
  "symbol": "NATURALGAS",
  "side": "BUY",
  "qty": 1,
  "order_type": "MARKET",
  "price": null,
  "timeframe": "5m",
  "extras": {
    "source": "TradingView",
    "note": "Breakout entry"
  }
}
```

**CSV Export**
- `GET /api/reports/export?from=2025-01-01&to=2025-08-10&strategy_id=...`
  - Response: `text/csv` streamed

---

## 8) Acceptance Criteria
- Authenticated user can create & deploy a strategy; TradingView alert triggers an execution
- Paper mode produces fills and positions with PnL; live mode routes to DhanHQ and returns broker order id
- Executions and alerts auditable with logs and correlation ID
- Reports page shows KPIs and allows CSV export
- Notifications reliably sent for fill/error events
- CI pipeline builds, tests, migrates DB, and deploys containers successfully

---

## 9) Next Steps
1. Approve this plan and I’ll start with **Phase 0–2**.
2. Share your preferred Telegram/email creds for a non-production sandbox.
3. Confirm whether to keep both **paper** and **live** behind a per-strategy toggle by default.

---

*Prepared for Kotra (IST)*
