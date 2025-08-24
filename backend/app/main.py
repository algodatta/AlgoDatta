from app.api.routers import health
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Use the canonical API stack (app.api.*)
from app.core.config import settings
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
    metrics,
    admin_dhan,
    dashboards,
    risk,
)

app = FastAPI(title="AlgoDatta API", openapi_url="/api/openapi.json", docs_url="/api/docs")

# CORS
from fastapi.middleware.cors import CORSMiddleware

origins = ["https://www.algodatta.com", "https://algodatta.com"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Mount routers under /api (except /metrics which is conventional root)
app.include_router(admin_health.router, prefix="/api")
app.include_router(executions_stream.router, prefix="/api")
app.include_router(auth.router, prefix="/api")
app.include_router(strategies.router, prefix="/api")
app.include_router(webhooks.router, prefix="/api")
app.include_router(reports.router, prefix="/api")
app.include_router(admin.router, prefix="/api")
app.include_router(notifications.router, prefix="/api")
app.include_router(broker_dhan.router, prefix="/api")
app.include_router(orders.router, prefix="/api")
app.include_router(positions.router, prefix="/api")
app.include_router(instruments.router, prefix="/api")
app.include_router(admin_dhan.router, prefix="/api")
app.include_router(dashboards.router, prefix="/api")
app.include_router(risk.router, prefix="/api")

# Prometheus /metrics
app.include_router(metrics.router)



# --- healthz (added for liveness checks) ---

try:

    app

except NameError:

    from fastapi import FastAPI

    app = FastAPI()



@app.get("/healthz", tags=["health"])

def healthz():

    return {"status": "ok"}

# --- end healthz ---


from fastapi import Response



@app.head("/healthz", tags=["health"])

def healthz_head():

    return Response(status_code=200)

