import uuid
import enum
from sqlalchemy import Column, String, Enum, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.db.base import Base

class BrokerType(str, enum.Enum):
    dhanhq = "dhanhq"
    paper = "paper"

class Broker(Base):
    __tablename__ = "brokers"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    type = Column(Enum(BrokerType, name="broker_type"), nullable=False)
    auth_token = Column(String, nullable=True)  # Dhan access-token (JWT)
    client_id = Column(String, nullable=True)  # Dhan dhanClientId
    token_expiry = Column(DateTime(timezone=True), nullable=True)
    connected_at = Column(DateTime(timezone=True), nullable=True)

    user = relationship("User", backref="brokers")
