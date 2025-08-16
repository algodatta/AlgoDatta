<<<<<<< HEAD
import os
from fastapi import FastAPI
from app.api.routers import admin_health
from app.api.routers import executions_stream
=======
import os, csv, io
from fastapi import FastAPI, Depends, HTTPException, Response
>>>>>>> 4d0fc9a2464fb0e7af8e4db8841f28a9cb0301df
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from .config import settings
from .db import Base, engine, get_db
from . import models
from .routers import auth, broker, strategies, webhooks, executions, reports, admin

app = FastAPI(title="AlgoDatta Minimal API", openapi_url="/api/openapi.json", docs_url="/api/docs")

<<<<<<< HEAD


app.include_router(admin_health.router)
app.include_router(executions_stream.router)
origins = settings.cors_origins or ["*"]
=======
>>>>>>> 4d0fc9a2464fb0e7af8e4db8841f28a9cb0301df
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ALLOW_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    Base.metadata.create_all(bind=engine)

<<<<<<< HEAD
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
=======
# mount routers
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(broker.router, prefix="/api", tags=["broker"])
app.include_router(strategies.router, prefix="/api", tags=["strategies"])
app.include_router(webhooks.router, prefix="/api", tags=["webhooks"])
app.include_router(executions.router, prefix="/api", tags=["executions"])
app.include_router(reports.router, prefix="/api/reports", tags=["reports"])
app.include_router(admin.router, prefix="/api/admin", tags=["admin"])
>>>>>>> 4d0fc9a2464fb0e7af8e4db8841f28a9cb0301df
