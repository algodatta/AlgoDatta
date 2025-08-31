from fastapi import FastAPI
from routes.broker import router as broker_router
from app.api.routers import root_home
app.include_router(root_home.router)
from fastapi.middleware.cors import CORSMiddleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://www.algodatta.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app = FastAPI()
app.include_router(broker_router, prefix="/api")

import logging
from fastapi import Request
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.exceptions import HTTPException as StarletteHTTPException

# Configure root logger
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    handlers=[
        logging.FileHandler("backend.log"),
        logging.StreamHandler()
    ]
)

logger = logging.getLogger("AutoTradingBackend")

# Middleware to log each request
class LoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        logger.info(f"Incoming request: {request.method} {request.url}")
        try:
            response = await call_next(request)
        except Exception as e:
            logger.exception("Unhandled exception")
            raise
        return response

app.add_middleware(LoggingMiddleware)

@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request, exc):
    logger.warning(f"HTTP error occurred: {exc.detail}")
    return JSONResponse(
        status_code=exc.status_code,
        content={"message": exc.detail},
    )

@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    logger.exception("Unexpected server error")
    return JSONResponse(
        status_code=500,
        content={"message": "Internal server error"},
    )

from .routes import webhooks
app.include_router(webhooks.router, prefix='/api/webhook', tags=['webhook'])

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
