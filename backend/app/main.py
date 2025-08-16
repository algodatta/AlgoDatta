import os
from fastapi import FastAPI
from app.api.routers import admin_health
from app.api.routers import executions_stream
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.core.config import settings
from app.api.routers import auth, admin, strategies, webhooks, reports, admin_dhan, instruments, broker_dhan, notifications, risk, orders, positions, dashboards, metrics

app = FastAPI(title="AlgoDatta API", version="0.3.0")



app.include_router(admin_health.router)
app.include_router(executions_stream.router)
origins = settings.cors_origins or ["*"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def _auto_db_init():
    if settings.auto_db_init:
        try:
            from scripts.init_db import migrate, seed
            migrate()
            seed()
        except Exception as e:
            print("AUTO_DB_INIT failed:", e)

@app.get("/healthz")
def healthz():
    return {"status": "ok"}

app.include_router(auth.router)
app.include_router(admin.router)
app.include_router(admin_dhan.router)
app.include_router(instruments.router)
app.include_router(broker_dhan.router)
app.include_router(notifications.router)
app.include_router(risk.router)
app.include_router(orders.router)
app.include_router(positions.router)
app.include_router(dashboards.router)
app.include_router(metrics.router)
app.include_router(strategies.router)
app.include_router(webhooks.router)
app.include_router(reports.router)

app.mount('/ui', StaticFiles(directory='ui', html=True), name='ui')

from app.services.executions_publisher import start_publisher_if_enabled, stop_publisher
