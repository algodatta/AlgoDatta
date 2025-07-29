from fastapi import FastAPI
from routes.broker import router as broker_router

app = FastAPI()
app.include_router(broker_router, prefix="/api")
