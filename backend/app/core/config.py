from pydantic import BaseModel
import os

class Settings(BaseModel):
    SECRET_KEY: str = os.getenv("SECRET_KEY", "changeme")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./algodatta.db")

settings = Settings()
