import time
from typing import Dict, Any, List
from app.schemas.admin import HealthService, HealthPayload

# Replace with your real checks
def check_db_latency() -> Dict[str, Any]:
    # Example: do a SELECT 1 and measure round-trip time
    start = time.time()
    ok = True  # replace with actual DB call
    latency_ms = int((time.time() - start) * 1000)
    return {"status": "up" if ok else "down", "latency_ms": latency_ms}

def check_service(name: str, fn) -> HealthService:
    start = time.time()
    try:
        fn()
        latency = int((time.time() - start) * 1000)
        return HealthService(name=name, status='up', latency_ms=latency, details={})
    except Exception as e:
        latency = int((time.time() - start) * 1000)
        return HealthService(name=name, status='down', latency_ms=latency, details={"error": str(e)})

def compute_health(version: str = None, uptime_sec: int = None) -> HealthPayload:
    db = check_db_latency()
    services: List[HealthService] = [
        check_service("broker", lambda: True),
        check_service("webhooks", lambda: True),
        check_service("mailer", lambda: True),
    ]
    overall = 'ok'
    if db.get('status') != 'up' or any(s.status != 'up' for s in services):
        overall = 'degraded'
    if db.get('status') == 'down':
        overall = 'down'
    return HealthPayload(status=overall, version=version, uptime_sec=uptime_sec, db=db, services=services)
