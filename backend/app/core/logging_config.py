import json, logging, os, sys
from typing import Any, Dict

class JsonFormatter(logging.Formatter):
    def format(self, record: logging.LogRecord) -> str:
        data: Dict[str, Any] = {
            "ts": self.formatTime(record, "%Y-%m-%dT%H:%M:%S%z"),
            "level": record.levelname,
            "logger": record.name,
            "msg": record.getMessage(),
        }
        if record.exc_info:
            data["exc_info"] = self.formatException(record.exc_info)
        # Include extra fields
        for k, v in record.__dict__.items():
            if k not in ("msg","args","levelname","levelno","pathname","filename","module","exc_info","exc_text","stack_info","lineno","funcName","created","msecs","relativeCreated","thread","threadName","processName","process"):
                data[k] = v
        return json.dumps(data, ensure_ascii=False)

def configure_logging(level: str | None = None) -> None:
    lvl = getattr(logging, (level or os.getenv("LOG_LEVEL","INFO")).upper(), logging.INFO)
    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(JsonFormatter())
    root = logging.getLogger()
    root.setLevel(lvl)
    root.handlers = [handler]
