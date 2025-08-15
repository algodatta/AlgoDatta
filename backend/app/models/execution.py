import uuid
import enum
from sqlalchemy import Column, String, DateTime, ForeignKey, Enum, Integer, Numeric
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.sql import func
from app.db.base import Base

class ExecutionType(str, enum.Enum):
    live = "live"
    paper = "paper"

class ExecutionStatus(str, enum.Enum):
    pending = "pending"
    success = "success"
    fail = "fail"

class Execution(Base):
    __tablename__ = "executions"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    strategy_id = Column(UUID(as_uuid=True), ForeignKey("strategies.id", ondelete="SET NULL"), nullable=True, index=True)
    alert_id = Column(UUID(as_uuid=True), ForeignKey("alerts.id", ondelete="SET NULL"), nullable=True, index=True)
    side = Column(String, nullable=True)
    qty = Column(Numeric, nullable=True)
    price = Column(Numeric, nullable=True)
    mode = Column(String, nullable=True)
    broker_order_id = Column(String, nullable=True)
    type = Column(Enum(ExecutionType, name="execution_type"), nullable=True)
    status = Column(Enum(ExecutionStatus, name="execution_status"), nullable=False, default=ExecutionStatus.pending)
    response = Column(JSONB, nullable=True)
    pnl = Column(Numeric, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
