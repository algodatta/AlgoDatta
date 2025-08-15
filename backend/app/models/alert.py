import uuid
from sqlalchemy import Column, String, DateTime, ForeignKey, Numeric
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.sql import func
from app.db.base import Base

class Alert(Base):
    __tablename__ = "alerts"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    strategy_id = Column(UUID(as_uuid=True), ForeignKey("strategies.id", ondelete="CASCADE"), nullable=False, index=True)
    symbol = Column(String, nullable=True)
    signal = Column(String, nullable=True)
    price = Column(Numeric, nullable=True)
    received_at = Column(DateTime(timezone=True), server_default=func.now())
    raw_payload = Column(JSONB, nullable=True)
