import os, json
from functools import lru_cache

try:
    # boto3 is optional at runtime; only used if env vars are missing
    import boto3  # type: ignore
except Exception:  # pragma: no cover
    boto3 = None  # type: ignore

# Optional: Pydantic BaseSettings if available
try:
    from pydantic import BaseSettings  # type: ignore
except Exception:  # pragma: no cover
    class BaseSettings:  # minimal shim
        def __init__(self, **kwargs):
            for k,v in kwargs.items():
                setattr(self, k, v)

class Settings(BaseSettings):
    # Core secrets
    DHAN_API_KEY: str | None = os.getenv("DHAN_API_KEY")
    DHAN_ACCESS_TOKEN: str | None = os.getenv("DHAN_ACCESS_TOKEN")
    POSTGRES_URL: str | None = os.getenv("POSTGRES_URL")
    JWT_SECRET: str | None = os.getenv("JWT_SECRET")
    FERNET_SECRET_KEY: str | None = os.getenv("FERNET_SECRET_KEY")
    TELEGRAM_BOT_TOKEN: str | None = os.getenv("TELEGRAM_BOT_TOKEN")
    SLACK_WEBHOOK_URL: str | None = os.getenv("SLACK_WEBHOOK_URL")
    DISCORD_WEBHOOK_URL: str | None = os.getenv("DISCORD_WEBHOOK_URL")
    SENDGRID_API_KEY: str | None = os.getenv("SENDGRID_API_KEY")

    # AWS settings
    AWS_REGION: str | None = os.getenv("AWS_REGION")
    AWS_PROFILE: str | None = os.getenv("AWS_PROFILE")
    AWS_SECRET_NAME: str = os.getenv("ALGODATTA_SECRET_NAME", "algodatta/secrets")

    def _fetch_from_aws(self) -> dict:
        if not boto3:
            return {}
        try:
            session = boto3.session.Session(profile_name=self.AWS_PROFILE) if self.AWS_PROFILE else boto3.session.Session()
            client = session.client("secretsmanager", region_name=self.AWS_REGION)
            resp = client.get_secret_value(SecretId=self.AWS_SECRET_NAME)
            payload = resp.get("SecretString") or ""
            return json.loads(payload) if payload else {}
        except Exception:
            return {}

    def hydrate_from_aws(self) -> None:
        data = self._fetch_from_aws()
        for k, v in data.items():
            if getattr(self, k, None) in (None, "",):
                try:
                    setattr(self, k, v)
                except Exception:
                    pass

@lru_cache(maxsize=1)
def get_settings() -> Settings:
    s = Settings()
    s.hydrate_from_aws()
    return s

settings = get_settings()


REQUIRED_DEFAULT = [
    "POSTGRES_URL",
    "JWT_SECRET",
    "FERNET_SECRET_KEY",
    # add others as needed:
    # "DHAN_API_KEY",
    # "DHAN_ACCESS_TOKEN",
]

def validate_required(required: list[str] | None = None) -> None:
    req = required or REQUIRED_DEFAULT
    missing = [k for k in req if not getattr(settings, k, None)]
    if missing:
        raise RuntimeError(f"Missing required environment values: {', '.join(missing)}")


def _is_webhook(url: str | None, prefix: str) -> bool:
    if not url: return True
    return url.startswith(prefix)

def _is_pg(url: str | None) -> bool:
    if not url: return False
    return url.startswith("postgres://") or url.startswith("postgresql://")

def validate_formats() -> None:
    errors: list[str] = []
    if not _is_pg(settings.POSTGRES_URL):
        errors.append("POSTGRES_URL must start with postgres:// or postgresql://")
    if settings.SLACK_WEBHOOK_URL and not _is_webhook(settings.SLACK_WEBHOOK_URL, "https://hooks.slack.com/"):
        errors.append("SLACK_WEBHOOK_URL must start with https://hooks.slack.com/")
    if settings.DISCORD_WEBHOOK_URL and not _is_webhook(settings.DISCORD_WEBHOOK_URL, "https://discord.com/api/webhooks/"):
        errors.append("DISCORD_WEBHOOK_URL must start with https://discord.com/api/webhooks/")
    if settings.JWT_SECRET and len(settings.JWT_SECRET) < 16:
        errors.append("JWT_SECRET should be >=16 chars")
    if settings.FERNET_SECRET_KEY and len(settings.FERNET_SECRET_KEY) < 16:
        errors.append("FERNET_SECRET_KEY should be >=16 chars")
    if errors:
        raise RuntimeError("Invalid secret formats: " + "; ".join(errors))
