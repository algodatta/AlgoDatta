from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Float
from sqlalchemy.sql import func
from app.db.session import Base
class Execution(Base):
    __tablename__ = "executions"
    id = Column(Integer, primary_key=True, index=True)
    strategy_id = Column(Integer, ForeignKey("strategies.id"), nullable=False)
    side = Column(String, nullable=False)
    qty = Column(Integer, default=1)
    price = Column(Float, nullable=True)
    mode = Column(String, default="paper")
    broker_order_id = Column(String, nullable=True)
    status = Column(String, default="queued")
    pnl = Column(Float, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
