from __future__ import annotations
import time, random
from loguru import logger
from app.core.config import settings
from jinja2 import Environment, FileSystemLoader, select_autoescape
from datetime import datetime
from app.db.session import SessionLocal
from app.services.suppression import is_suppressed

# Optional Redis for distributed rate limits (re-use counters)
_redis = None
try:
    if settings.REDIS_URL:
        import redis  # type: ignore
        _redis = redis.Redis.from_url(settings.REDIS_URL, decode_responses=True)
except Exception as e:
    logger.warning(f"Redis unavailable: {e}")
    _redis = None

_counters: dict[str, tuple[int, float]] = {}

def _now() -> float:
    import time as _t; return _t.time()

def _bucket_key(base: str, window_seconds: int) -> str:
    now = int(_now()); bucket = now - (now % window_seconds)
    return f"{base}:{bucket}"

def _incr_with_ttl(key: str, window_seconds: int) -> int:
    if _redis:
        try:
            pipe = _redis.pipeline()
            pipe.incr(key, amount=1)
            pipe.expire(key, window_seconds + 1)
            count, _ = pipe.execute()
            return int(count)
        except Exception as e:
            logger.warning(f"Redis error, falling back to memory: {e}")
    count, expiry = _counters.get(key, (0, _now() + window_seconds))
    if _now() > expiry:
        count = 0; expiry = _now() + window_seconds
    count += 1
    _counters[key] = (count, expiry)
    return count

def _check_limit(base_key: str, limit: int, window_seconds: int) -> bool:
    key = _bucket_key(base_key, window_seconds)
    count = _incr_with_ttl(key, window_seconds)
    return count <= limit

def _within_limits(to_email: str) -> bool:
    if not _check_limit("email:global:min", settings.EMAIL_RATE_LIMIT_PER_MINUTE, 60):
        logger.error("Global per-minute email rate limit exceeded"); return False
    if not _check_limit("email:global:hour", settings.EMAIL_RATE_LIMIT_PER_HOUR, 3600):
        logger.error("Global per-hour email rate limit exceeded"); return False
    safe_to = to_email.lower().strip()
    if not _check_limit(f"email:to:{safe_to}:hour", settings.EMAIL_RECIPIENT_LIMIT_PER_HOUR, 3600):
        logger.error(f"Per-recipient hourly limit exceeded for {to_email}"); return False
    if not _check_limit(f"email:to:{safe_to}:day", settings.EMAIL_RECIPIENT_LIMIT_PER_DAY, 86400):
        logger.error(f"Per-recipient daily limit exceeded for {to_email}"); return False
    return True

def _retry_sleep(attempt: int) -> None:
    base = float(settings.EMAIL_BACKOFF_BASE_SECONDS); max_s = float(settings.EMAIL_BACKOFF_MAX_SECONDS)
    delay = min(max_s, base * (2 ** attempt) + random.random() * base)
    time.sleep(delay)

def _get_ses_client():
    import boto3
    if settings.AWS_PROFILE:
        session = boto3.Session(profile_name=settings.AWS_PROFILE, region_name=settings.AWS_REGION)
    else:
        session = boto3.Session(region_name=settings.AWS_REGION)
    return session.client('ses')

env = Environment(loader=FileSystemLoader('app/email_templates'), autoescape=select_autoescape(['html','xml']))

def _render_verify_html(verify_link: str) -> str:
    tmpl = env.get_template('verify.html')
    html = tmpl.render(subject=f'Verify your {settings.BRAND_NAME} account', brand=settings.BRAND_NAME, logo_url=settings.BRAND_LOGO_URL, primary=settings.BRAND_PRIMARY, theme=settings.EMAIL_THEME, year=datetime.utcnow().year, verify_link=verify_link)
    return html

def _render_reset_html(reset_link: str) -> str:
    tmpl = env.get_template('reset.html')
    html = tmpl.render(subject=f'Reset your {settings.BRAND_NAME} password', brand=settings.BRAND_NAME, logo_url=settings.BRAND_LOGO_URL, primary=settings.BRAND_PRIMARY, theme=settings.EMAIL_THEME, year=datetime.utcnow().year, reset_link=reset_link)
    return html

def send_email(to_email: str, subject: str, html: str, *, category: str | None = None) -> bool:
    # suppression check
    try:
        db = SessionLocal()
        if is_suppressed(db, to_email):
            logger.warning(f"Email to {to_email} blocked (suppressed)")
            return False
    finally:
        try: db.close()
        except Exception: pass
    if not _within_limits(to_email): return False
    if not settings.SES_FROM_EMAIL:
        logger.warning("SES_FROM_EMAIL not configured; skipping email send."); return False
    client = _get_ses_client()
    attempts = int(settings.EMAIL_MAX_RETRIES)
    for attempt in range(attempts):
        try:
            params = {'Source': settings.SES_FROM_EMAIL,'Destination': {'ToAddresses': [to_email]},'Message': {'Subject': {'Data': subject, 'Charset': 'UTF-8'},'Body': {'Html': {'Data': html, 'Charset': 'UTF-8'}}}}
            if settings.SES_CONFIG_SET_NAME: params['ConfigurationSetName'] = settings.SES_CONFIG_SET_NAME
            if category: params['Tags'] = [{'Name': 'category', 'Value': category}]
            resp = client.send_email(**params)
            code = int(resp.get('ResponseMetadata', {}).get('HTTPStatusCode', 200))
            if code == 429 or 500 <= code < 600:
                if attempt < attempts - 1: _retry_sleep(attempt); continue
                else: return False
            return 200 <= code < 300
        except Exception as e:
            msg = str(e); is_throttle = any(k in msg for k in ["Throttling","ThrottlingException","Rate exceeded"])
            if attempt < attempts - 1 and is_throttle: _retry_sleep(attempt); continue
            try:
                from botocore.exceptions import ClientError  # type: ignore
                if isinstance(e, ClientError):
                    code = e.response.get("ResponseMetadata", {}).get("HTTPStatusCode", 500)
                    if attempt < attempts - 1 and int(code) >= 500: _retry_sleep(attempt); continue
            except Exception: pass
            return False

def send_verification_email(to_email: str, token: str) -> bool:
    verify_link = f"{settings.FRONTEND_BASE_URL}/verify?token={token}"
    subject = "Verify your %s account" % settings.BRAND_NAME
    html = _render_verify_html(verify_link)
    ok = send_email(to_email, subject, html, category='verify')
    if not ok: logger.warning(f"Email not sent (rate limited, transient failure, or suppressed). Link: {verify_link}")
    return ok

def send_password_reset_email(to_email: str, token: str) -> bool:
    reset_link = f"{settings.FRONTEND_BASE_URL}/reset?token={token}"
    subject = "Reset your %s password" % settings.BRAND_NAME
    html = _render_reset_html(reset_link)
    return send_email(to_email, subject, html, category='password_reset')
