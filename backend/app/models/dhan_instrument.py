from sqlalchemy import Column, String, Index
from app.db.base import Base

class DhanInstrument(Base):
    __tablename__ = "dhan_instruments"
    security_id = Column(String, primary_key=True)   # e.g., "11536"
    trading_symbol = Column(String, index=True)      # e.g., "RELIANCE"
    exchange_segment = Column(String, index=True)    # e.g., "NSE_EQ", "MCX_COMM"
    name = Column(String, nullable=True)             # optional descriptive name

Index("ix_dhan_instruments_symbol_exch", DhanInstrument.trading_symbol, DhanInstrument.exchange_segment)
