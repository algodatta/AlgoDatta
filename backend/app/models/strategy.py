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
    symbol = Column(String, nullable=True)
    timeframe = Column(String, nullable=True)
    qty = Column(String, nullable=True)
    mode = Column(String, nullable=True)
    script = Column(String, nullable=True)
    broker_id = Column(UUID(as_uuid=True), ForeignKey("brokers.id", ondelete="SET NULL"), nullable=True)
    paper_trading = Column(Boolean, default=False, nullable=False)
    webhook_path = Column(String, unique=True, nullable=True)
    status = Column(Enum(StrategyStatus, name="strategy_status"), default=StrategyStatus.active, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # DhanHQ config (needed for live orders)
    dhan_security_id = Column(String, nullable=True)       # e.g. "11536"
    dhan_exchange_segment = Column(String, nullable=True)  # e.g. "NSE_EQ", "MCX_COMM", etc.
    dhan_product_type = Column(String, nullable=True, default="INTRADAY")  # "CNC","INTRADAY","MARGIN","MTF"
    dhan_order_type = Column(String, nullable=True, default="MARKET")      # "MARKET","LIMIT","STOP_LOSS","STOP_LOSS_MARKET"
    dhan_validity = Column(String, nullable=True, default="DAY")           # "DAY","IOC"

    user = relationship("User", backref="strategies")
    broker = relationship("Broker", backref="strategies")
