import uuid
from sqlalchemy import Column, String, DateTime, ForeignKey, Numeric, Integer
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from app.db.base import Base

class PaperTrade(Base):
    __tablename__ = "paper_trades"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    strategy_id = Column(UUID(as_uuid=True), ForeignKey("strategies.id", ondelete="CASCADE"), nullable=False, index=True)
    symbol = Column(String, nullable=True)
    side = Column(String, nullable=False)  # BUY/SELL
    entry_price = Column(Numeric, nullable=False)
    exit_price = Column(Numeric, nullable=True)
    qty = Column(Integer, nullable=False)
    pnl = Column(Numeric, nullable=True)
    entry_time = Column(DateTime(timezone=True), server_default=func.now())
    exit_time = Column(DateTime(timezone=True), nullable=True)
    position_qty = Column(Integer, nullable=True)
    avg_price = Column(Numeric, nullable=True)
