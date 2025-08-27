from app.api.routes.trades import router as trades_router

# Configure JSON logging
try:
    from app.core.logging_config import configure_logging
    configure_logging()
except Exception:
    pass
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

# Auto-injected env validation
try:
    from app.core.secrets import validate_required
    validate_required()
except Exception as e:
    # Fail fast if critical envs are missing
    raise

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



# Auto-injected secret format validation
try:
    from app.core.secrets import validate_formats
    validate_formats()
except Exception:
    raise



from fastapi import FastAPI
try:
    app  # type: ignore # noqa
except NameError:
    app = FastAPI()

@app.get("/healthz")
async def healthz():
    return {"status": "ok"}



from fastapi import Request
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
import traceback, asyncio

try:
    from app.services.notifier import notify_error
except Exception:
    notify_error = None

@app.exception_handler(RequestValidationError)
async def request_validation_exception_handler(request: Request, exc: RequestValidationError):
    if notify_error:
        detail = {"path": str(request.url), "method": request.method, "errors": exc.errors()}
        await notify_error("RequestValidationError", detail, err=str(exc))
    return JSONResponse(status_code=422, content={"detail": exc.errors()})

@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    if notify_error:
        tb = ''.join(traceback.format_exception(type(exc), exc, exc.__traceback__))
        detail = {"path": str(request.url), "method": request.method}
        await notify_error("UnhandledException", detail, err=tb[:2000])
    return JSONResponse(status_code=500, content={"detail": "Internal Server Error"})



try:
    app.include_router(trades_router)
except Exception:
    pass
