from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routers import health, auth

app = FastAPI(title="AlgoDatta API", openapi_url="/api/openapi.json", docs_url="/api/docs")

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

@app.get("/", tags=["meta"])
def root():
    return {"service": "algodatta-api", "status": "ok"}

app.include_router(health.router, prefix="/api")
app.include_router(auth.router, prefix="/api")
