import hashlib, json
from datetime import datetime, timedelta
from uuid import UUID
from sqlalchemy.orm import Session
from sqlalchemy import select
from app.models import IdempotencyKey
from app.core.config import settings

def compute_key(strategy_id, payload: dict, header_event_id: str = None) -> str:
    sid = str(strategy_id)
    if header_event_id:
        return f"{sid}:{header_event_id}"
    data = json.dumps(payload or {}, sort_keys=True, separators=(',',':')).encode('utf-8')
    h = hashlib.sha256(data).hexdigest()
    return f"{sid}:{h}"

def seen_recently(db: Session, key: str) -> bool:
    try:
        sid, _ = key.split(":", 1)
    except ValueError:
        return False
    window_start = datetime.utcnow() - timedelta(seconds=settings.idempotency_window_sec)
    row = db.execute(
        select(IdempotencyKey).where(IdempotencyKey.key == key, IdempotencyKey.created_at >= window_start)
    ).scalar_one_or_none()
    return bool(row)

def remember(db: Session, key: str):
    sid, _ = key.split(":", 1)
    try:
        sid_uuid = UUID(sid)
    except Exception:
        sid_uuid = None
    db.add(IdempotencyKey(key=key, strategy_id=sid_uuid))
    db.flush()

def cleanup_old(db: Session):
    # Optional: rely on DB vacuum/TTL; left as noop.
    pass
