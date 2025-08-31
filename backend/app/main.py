# app/main.py
import os
import logging
from fastapi import FastAPI, Response
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings  # if unused, ok to keep for env/config

# Canonical router imports (single source of truth)
from app.api.routers import (
    admin_health,
    executions_stream,
    auth,
    strategies,
    webhooks,
    reports,
    admin,
    notifications,
    broker_dhan,
    orders,
    positions,
    instruments,
    metrics,      # note: /metrics is mounted at root by convention
    admin_dhan,
    dashboards,
    risk,
)

log = logging.getLogger("uvicorn.error")

app = FastAPI(title="AlgoDatta API", openapi_url="/api/openapi.json", docs_url="/api/docs")

# Optional middleware: login_form_adapter (don’t crash if missing)
try:
    from app.middleware.login_form_adapter import install as _install_login_form_adapter
    _install_login_form_adapter(app)
except Exception as _e:
    log.warning(f"login_form_adapter not active: {_e}")

# ---- CORS ----
_default_origins = "https://www.algodatta.com,https://algodatta.com"
origins = [o.strip() for o in os.getenv("CORS_ALLOW_ORIGINS", _default_origins).split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---- Routers under /api ----
app.include_router(admin_health.router,   prefix="/api")
app.include_router(executions_stream.router, prefix="/api")
app.include_router(auth.router,          prefix="/api")
app.include_router(strategies.router,    prefix="/api")
app.include_router(webhooks.router,      prefix="/api")
app.include_router(reports.router,       prefix="/api")
app.include_router(admin.router,         prefix="/api")
app.include_router(notifications.router, prefix="/api")
app.include_router(broker_dhan.router,   prefix="/api")
app.include_router(orders.router,        prefix="/api")
app.include_router(positions.router,     prefix="/api")
app.include_router(instruments.router,   prefix="/api")
app.include_router(admin_dhan.router,    prefix="/api")
app.include_router(dashboards.router,    prefix="/api")
app.include_router(risk.router,          prefix="/api")

# Prometheus /metrics stays at root (no prefix)
app.include_router(metrics.router)

# ---- Healthz ----
@app.get("/healthz", tags=["health"])
def healthz():
    return {"status": "ok"}

@app.head("/healthz", tags=["health"])
def healthz_head():
    return Response(status_code=200)

# ---- Optional: debug router if present ----
try:
    from app.api.v1.debug_auth import router as debug_router
    app.include_router(debug_router, prefix="/api")
except Exception as _e:
    log.warning(f"debug_auth not active: {_e}")
