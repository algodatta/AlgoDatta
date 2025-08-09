from fastapi import FastAPI
from app.api.v1 import auth, broker, strategies, webhooks, admin, reports, executions

app = FastAPI(title="Auto Trading Platform")

# Include routers
app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(broker.router, prefix="/broker", tags=["broker"])
app.include_router(strategies.router, prefix="/strategies", tags=["strategies"])
app.include_router(webhooks.router, prefix="/webhooks", tags=["webhooks"])
app.include_router(admin.router, prefix="/admin", tags=["admin"])
app.include_router(reports.router, prefix="/reports", tags=["reports"])
app.include_router(executions.router, prefix="/executions", tags=["executions"])

@app.get("/")
def read_root():
    return {"message": "Auto Trading Platform API"}

from .routes import alerts
app.include_router(alerts.router, prefix='/api/alerts', tags=['alerts'])
