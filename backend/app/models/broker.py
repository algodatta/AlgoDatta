from sqlalchemy import Column, String, DateTime, Enum, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
import enum, uuid
from ..db import Base

class BrokerType(str, enum.Enum):
    dhanhq = "dhanhq"
    paper = "paper"

class Broker(Base):
    __tablename__ = "brokers"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    type = Column(Enum(BrokerType), default=BrokerType.dhanhq)
    client_id = Column(String)
    auth_token = Column(String)
    token_expiry = Column(DateTime(timezone=True), nullable=True)
    connected_at = Column(DateTime(timezone=True), server_default=func.now())
