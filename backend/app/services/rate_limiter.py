from __future__ import annotations
import time
from loguru import logger
from app.core.config import settings
_redis = None
try:
    if settings.REDIS_URL:
        import redis  # type: ignore
        _redis = redis.Redis.from_url(settings.REDIS_URL, decode_responses=True)
except Exception as e:
    logger.warning(f"Redis unavailable for rate limiter: {e}")
    _redis = None
_mem: dict[str, tuple[int, float]] = {}
def _now() -> float: return time.time()
def _bucket(base: str, window_seconds: int) -> str:
    now = int(_now()); bucket = now - (now % window_seconds); return f"{base}:{bucket}"
def _incr_ttl(key: str, window_seconds: int) -> int:
    if _redis:
        try:
            pipe = _redis.pipeline(); pipe.incr(key, amount=1); pipe.expire(key, window_seconds + 1); count, _ = pipe.execute(); return int(count)
        except Exception as e:
            logger.warning(f"Redis rate limiter error: {e}")
    count, expiry = _mem.get(key, (0, _now() + window_seconds))
    if _now() > expiry: count, expiry = 0, _now() + window_seconds
    count += 1; _mem[key] = (count, expiry); return count
def check_limit(base_key: str, limit: int, window_seconds: int) -> bool:
    if limit <= 0: return True
    key = _bucket(base_key, window_seconds); count = _incr_ttl(key, window_seconds); return count <= limit
