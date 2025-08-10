from __future__ import annotations
import time, random
from datetime import datetime, timedelta, timezone
from typing import Optional
from loguru import logger
from app.core.config import settings

# Optional Redis support for distributed rate limiting
_redis = None
try:
    if settings.REDIS_URL:
        import redis  # type: ignore
        _redis = redis.Redis.from_url(settings.REDIS_URL, decode_responses=True)
except Exception as e:
    logger.warning(f"Redis unavailable: {e}")
    _redis = None

# In-memory fallback (per-process). For multi-instance, configure REDIS_URL.
_counters: dict[str, tuple[int, float]] = {}

def _now() -> float:
    return time.time()

def _bucket_key(base: str, window_seconds: int) -> str:
    # Time-bucketed key (e.g. minute/hour windows)
    now = int(_now())
    bucket = now - (now % window_seconds)
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
    # memory fallback
    count, expiry = _counters.get(key, (0, _now() + window_seconds))
    if _now() > expiry:
        count = 0
        expiry = _now() + window_seconds
    count += 1
    _counters[key] = (count, expiry)
    return count

def _check_limit(base_key: str, limit: int, window_seconds: int) -> bool:
    key = _bucket_key(base_key, window_seconds)
    count = _incr_with_ttl(key, window_seconds)
    return count <= limit

def _within_limits(to_email: str) -> bool:
    # Global limits
    if not _check_limit("email:global:min", settings.EMAIL_RATE_LIMIT_PER_MINUTE, 60):
        logger.error("Global per-minute email rate limit exceeded")
        return False
    if not _check_limit("email:global:hour", settings.EMAIL_RATE_LIMIT_PER_HOUR, 3600):
        logger.error("Global per-hour email rate limit exceeded")
        return False
    # Per-recipient limits
    safe_to = to_email.lower().strip()
    if not _check_limit(f"email:to:{safe_to}:hour", settings.EMAIL_RECIPIENT_LIMIT_PER_HOUR, 3600):
        logger.error(f"Per-recipient hourly limit exceeded for {to_email}")
        return False
    if not _check_limit(f"email:to:{safe_to}:day", settings.EMAIL_RECIPIENT_LIMIT_PER_DAY, 86400):
        logger.error(f"Per-recipient daily limit exceeded for {to_email}")
        return False
    return True

def _retry_sleep(attempt: int) -> None:
    # Exponential backoff with jitter: base * 2^attempt + rand(0, base)
    base = float(settings.EMAIL_BACKOFF_BASE_SECONDS)
    max_s = float(settings.EMAIL_BACKOFF_MAX_SECONDS)
    delay = min(max_s, base * (2 ** attempt) + random.random() * base)
    time.sleep(delay)

def send_email(to_email: str, subject: str, html: str) -> bool:
    # Rate limit checks
    if not _within_limits(to_email):
        return False

    # Fast fail if SendGrid not configured
    if not (settings.SENDGRID_API_KEY and settings.SENDGRID_FROM_EMAIL):
        logger.warning("SENDGRID_API_KEY or SENDGRID_FROM_EMAIL not configured; skipping real email send.")
        return False

    # Lazy import so local dev without package still runs other code
    from sendgrid import SendGridAPIClient  # type: ignore
    from sendgrid.helpers.mail import Mail  # type: ignore

    message = Mail(
        from_email=settings.SENDGRID_FROM_EMAIL,
        to_emails=to_email,
        subject=subject,
        html_content=html,
    )
    # Retry for 429/5xx
    attempts = int(settings.EMAIL_MAX_RETRIES)
    for attempt in range(attempts):
        try:
            sg = SendGridAPIClient(settings.SENDGRID_API_KEY)
            resp = sg.send(message)
            code = int(resp.status_code)
            if code == 429 or 500 <= code < 600:
                logger.warning(f"SendGrid {code}; retrying (attempt {attempt+1}/{attempts})")
                if attempt < attempts - 1:
                    _retry_sleep(attempt)
                    continue
                else:
                    return False
            logger.info(f"SendGrid response: {code}")
            return 200 <= code < 300
        except Exception as e:
            logger.exception(f"SendGrid exception; retrying (attempt {attempt+1}/{attempts}): {e}")
            if attempt < attempts - 1:
                _retry_sleep(attempt)
                continue
            return False

def send_verification_email(to_email: str, token: str) -> bool:
    verify_link = f"{settings.FRONTEND_BASE_URL}/verify?token={token}"
    subject = "Verify your AlgoDatta account"
    html = f"""    <div style='font-family:system-ui,-apple-system,Segoe UI,Roboto'>
      <h2>Verify your AlgoDatta account</h2>
      <p>Click the button below to verify your email:</p>
      <p><a href='{verify_link}' style='display:inline-block;padding:10px 16px;background:#111;color:#fff;border-radius:8px;text-decoration:none'>Verify Email</a></p>
      <p>If the button doesn't work, open this URL:</p>
      <p><code>{verify_link}</code></p>
    </div>
    """
    ok = send_email(to_email, subject, html)
    if not ok:
        logger.warning(f"Email not sent (rate limited or transient failure). Link: {verify_link}")
    return ok
