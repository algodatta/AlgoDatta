import uuid
import enum
from sqlalchemy import Column, String, Boolean, Enum, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base import Base

class StrategyStatus(str, enum.Enum):
    active = "active"
    paused = "paused"
    error = "error"

class Strategy(Base):
    __tablename__ = "strategies"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String, nullable=False)
    symbol = Column(String, nullable=True)  # optional shortcut field
    timeframe = Column(String, nullable=True)  # e.g., 5m, 15m
    qty = Column(String, nullable=True)  # store as string for flexibility, cast later
    mode = Column(String, nullable=True)  # 'paper'|'live' (kept for UI parity)
    script = Column(String, nullable=True)
    broker_id = Column(UUID(as_uuid=True), ForeignKey("brokers.id", ondelete="SET NULL"), nullable=True)
    paper_trading = Column(Boolean, default=False, nullable=False)
    webhook_path = Column(String, unique=True, nullable=True)
    status = Column(Enum(StrategyStatus, name="strategy_status"), default=StrategyStatus.active, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    user = relationship("User", backref="strategies")
    broker = relationship("Broker", backref="strategies")
