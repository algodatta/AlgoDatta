from sqlalchemy import Column, String, DateTime, Index, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from app.db.base import Base

class IdempotencyKey(Base):
    __tablename__ = "idempotency_keys"
    key = Column(String, primary_key=True)
    strategy_id = Column(UUID(as_uuid=True), ForeignKey("strategies.id", ondelete="CASCADE"), index=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

Index("ix_idem_strategy_created", IdempotencyKey.strategy_id, IdempotencyKey.created_at.desc())
