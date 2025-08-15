import os, csv, io
from fastapi import FastAPI, Depends, HTTPException, Response
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from .config import settings
from .db import Base, engine, get_db
from . import models
from .routers import auth, broker, strategies, webhooks, executions, reports, admin

app = FastAPI(title="AlgoDatta Minimal API", openapi_url="/api/openapi.json", docs_url="/api/docs")

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

# mount routers
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(broker.router, prefix="/api", tags=["broker"])
app.include_router(strategies.router, prefix="/api", tags=["strategies"])
app.include_router(webhooks.router, prefix="/api", tags=["webhooks"])
app.include_router(executions.router, prefix="/api", tags=["executions"])
app.include_router(reports.router, prefix="/api/reports", tags=["reports"])
app.include_router(admin.router, prefix="/api/admin", tags=["admin"])
