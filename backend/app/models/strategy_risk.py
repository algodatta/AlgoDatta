import uuid
from sqlalchemy import Column, String, Boolean, Integer, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, NUMERIC
from app.db.base import Base

class StrategyRisk(Base):
    __tablename__ = "strategy_risks"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    strategy_id = Column(UUID(as_uuid=True), ForeignKey("strategies.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    max_position_qty = Column(Integer, nullable=True)   # absolute max open position size
    max_daily_loss = Column(NUMERIC, nullable=True)     # realized loss threshold to stop trading
    trading_start = Column(String, nullable=True)       # "09:15"
    trading_end = Column(String, nullable=True)         # "15:30"
    allow_weekends = Column(Boolean, default=False, nullable=False)
    max_signals_per_minute = Column(Integer, nullable=True)  # rate limit per webhook
    kill_switch = Column(Boolean, default=False, nullable=False)
