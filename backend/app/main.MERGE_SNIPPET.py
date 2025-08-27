from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="AlgoDatta API")

ALLOWED_ORIGINS = [
    "https://www.algodatta.com",
    "https://algodatta.com",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/healthz")
def healthz():
    return {"status": "ok", "version": "1.0.0"}

# Wire routers (replace with your real imports if already present)
try:
    from app.routers import broker, strategies, reports, admin, auth
    app.include_router(broker.router)
    app.include_router(strategies.router)
    app.include_router(reports.router)
    app.include_router(admin.router)
    app.include_router(auth.router)
except Exception as e:
    print("Router include warning:", e)
