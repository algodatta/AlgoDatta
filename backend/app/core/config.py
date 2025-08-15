import os
from dotenv import load_dotenv
from pydantic import BaseModel
from typing import List

load_dotenv()

class Settings(BaseModel):
    database_url: str = os.getenv("DATABASE_URL", "")
    jwt_secret: str = os.getenv("JWT_SECRET", "change-me")
    jwt_algorithm: str = os.getenv("JWT_ALGORITHM", "HS256")
    access_token_expire_minutes: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "120"))
    cors_origins: List[str] = [o.strip() for o in os.getenv("CORS_ORIGINS", "").split(",") if o.strip()]
    auto_db_init: bool = os.getenv("AUTO_DB_INIT", "false").lower() == "true"
    admin_email: str = os.getenv("ADMIN_EMAIL", "admin@algodatta.com")
    admin_password: str = os.getenv("ADMIN_PASSWORD", "ChangeMe123!")
    admin_role: str = os.getenv("ADMIN_ROLE", "admin")

settings = Settings()


    # Optional shared secret required by /broker/dhan/postback to validate webhook origin
    dhan_postback_secret: str = os.getenv("DHAN_POSTBACK_SECRET", "")

    dhan_test_mode: bool = os.getenv("DHAN_TEST_MODE", "true").lower() == "true"

    notify_test_mode: bool = os.getenv("NOTIFY_TEST_MODE", "true").lower() == "true"
    telegram_bot_token: str = os.getenv("TELEGRAM_BOT_TOKEN", "")
    smtp_host: str = os.getenv("SMTP_HOST", "")
    smtp_port: int = int(os.getenv("SMTP_PORT", "587"))
    smtp_user: str = os.getenv("SMTP_USER", "")
    smtp_password: str = os.getenv("SMTP_PASSWORD", "")
    smtp_from: str = os.getenv("SMTP_FROM", "noreply@algodatta.com")
    default_max_signals_per_minute: int = int(os.getenv("DEFAULT_MAX_SIGNALS_PER_MINUTE", "30"))
    idempotency_window_sec: int = int(os.getenv("IDEMPOTENCY_WINDOW_SEC", "120"))
