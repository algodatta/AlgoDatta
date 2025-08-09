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

# --- Safe router includes (auto-patched) ---
def _include_optional():
    import importlib
    mods = [
        ("routes.broker", "router", "/api/broker", "broker"),
        ("routes.strategies", "router", "/api/strategies", "strategies"),
        ("routes.executions", "router", "/api/executions", "executions"),
        ("routes.reports", "router", "/api/reports", "reports"),
        ("routes.admin", "router", "/api/admin", "admin"),
        ("routes.auth", "router", "/api/auth", "auth"),
        ("routes.webhooks", "router", "/api/webhook", "webhook"),
        ("routes.alerts", "router", "/api/alerts", "alerts"),
    ]
    for mod, attr, prefix, tag in mods:
        try:
            m = importlib.import_module(f".{mod}", __package__ or __name__)
            r = getattr(m, attr, None)
            if r:
                app.include_router(r, prefix=prefix, tags=[tag])
        except Exception as e:
            # Silently skip missing modules
            pass

try:
    _include_optional()
except Exception:
    pass
# --- end patched block ---
