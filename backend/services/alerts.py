from typing import List
from datetime import datetime, timedelta
from app.models.alert import AlertLevel

class AlertObj:
    def __init__(self, id: str, level: AlertLevel, source: str, message: str, timestamp: datetime):
        self.id = id
        self.level = level
        self.source = source
        self.message = message
        self.timestamp = timestamp

# Demo data
_NOW = datetime.utcnow()
_FAKE_ALERTS = [
    AlertObj("a1", AlertLevel.INFO, "engine", "Engine started", _NOW - timedelta(minutes=30)),
    AlertObj("a2", AlertLevel.WARN, "webhooks", "Webhook latency high", _NOW - timedelta(minutes=10)),
    AlertObj("a3", AlertLevel.ERROR, "broker", "Broker auth failed", _NOW - timedelta(minutes=2)),
]

def list_alerts(limit: int = 100) -> List[AlertObj]:
    return sorted(_FAKE_ALERTS, key=lambda a: a.timestamp, reverse=True)[:limit]
