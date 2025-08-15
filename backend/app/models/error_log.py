import uuid
from sqlalchemy import Column, String, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.sql import func
from app.db.base import Base

class ErrorLog(Base):
    __tablename__ = "error_logs"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    context = Column(String, nullable=True)
    message = Column(String, nullable=False)
    stack = Column(String, nullable=True)
    extra = Column(JSONB, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
