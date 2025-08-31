
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routers import health, auth

app = FastAPI(title="AlgoDatta API", openapi_url="/api/openapi.json", docs_url="/api/docs")

origins = [o for o in os.getenv("CORS_ORIGINS","https://www.algodatta.com,https://algodatta.com").split(",") if o]
app.add_middleware(CORSMiddleware, allow_origins=origins, allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

app.include_router(health.router, prefix="/api")
app.include_router(auth.router, prefix="/api")
