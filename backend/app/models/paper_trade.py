from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Float
from sqlalchemy.sql import func
from app.db.session import Base

class PaperTrade(Base):
    __tablename__ = "paper_trades"
    id = Column(Integer, primary_key=True, index=True)
    strategy_id = Column(Integer, ForeignKey("strategies.id"), nullable=False)
    side = Column(String, nullable=False)
    qty = Column(Integer, default=1)
    price = Column(Float, nullable=False)
    fill_ts = Column(DateTime(timezone=True), server_default=func.now())
    position_qty = Column(Integer, default=0)
    avg_price = Column(Float, default=0.0)
