from __future__ import annotations
import os, json, datetime as dt
from typing import Any, Dict, Iterable
from sqlalchemy import String, DateTime, Text, create_engine
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, sessionmaker

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./algodatta.db")

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {},
)
SessionLocal = sessionmaker(bind=engine, autoflush=False, expire_on_commit=False)

class Base(DeclarativeBase):
    pass

class Suppression(Base):
    __tablename__ = "suppressions"
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    email: Mapped[str] = mapped_column(String(320), index=True)
    kind: Mapped[str]  = mapped_column(String(32))  # "BOUNCE" | "COMPLAINT"
    details: Mapped[str] = mapped_column(Text)      # raw JSON string
    created_at: Mapped[dt.datetime] = mapped_column(DateTime, default=dt.datetime.utcnow, index=True)

def init_tables() -> None:
    Base.metadata.create_all(engine)

def record_suppressions(emails: Iterable[str], kind: str, payload: Dict[str, Any]) -> int:
    if not emails:
        return 0
    raw = json.dumps(payload, ensure_ascii=False)
    n = 0
    with SessionLocal() as s:
        for e in sorted(set(e.lower().strip() for e in emails if e)):
            s.add(Suppression(email=e, kind=kind, details=raw))
            n += 1
        s.commit()
    return n
