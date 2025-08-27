from sqlalchemy import Column, String, Text, DateTime, Enum
from sqlalchemy.ext.declarative import declarative_base
import enum

Base = declarative_base()

class AlertLevel(str, enum.Enum):
    INFO = 'INFO'
    WARN = 'WARN'
    ERROR = 'ERROR'

class Alert(Base):
    __tablename__ = 'alerts'
    id = Column(String, primary_key=True)  # e.g. UUID
    level = Column(Enum(AlertLevel), nullable=False)
    source = Column(String, nullable=False)  # e.g. 'broker', 'webhooks', 'engine'
    message = Column(Text, nullable=False)
    timestamp = Column(DateTime, nullable=False)
