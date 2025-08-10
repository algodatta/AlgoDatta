from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import auth, strategies, webhook, executions, reports, admin, broker, ops, notifications

app = FastAPI(title="AlgoDatta API", version="0.3.0")
app.add_middleware(CORSMiddleware,allow_origins=["http://localhost:3000"],allow_credentials=False,allow_methods=["*"],allow_headers=["*"])
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(broker.router, prefix="/api/broker", tags=["broker"])
app.include_router(strategies.router, prefix="/api/strategies", tags=["strategies"])
app.include_router(webhook.router, prefix="/api/webhook", tags=["webhook"])
app.include_router(executions.router, prefix="/api/executions", tags=["executions"])
app.include_router(reports.router, prefix="/api/reports", tags=["reports"])
app.include_router(admin.router, prefix="/api/admin", tags=["admin"])
app.include_router(ops.router, prefix="/api/ops", tags=["ops"])
app.include_router(notifications.router, prefix="/api/notifications", tags=["notifications"])
@app.get("/api/health")
def health(): return {"status":"ok"}
