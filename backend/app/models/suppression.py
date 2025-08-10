from sqlalchemy import Column, Integer, String, DateTime, JSON, UniqueConstraint
from sqlalchemy.sql import func
from app.db.session import Base
class Suppression(Base):
    __tablename__ = "suppressions"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, nullable=False)
    reason = Column(String, nullable=False)  # 'bounce' | 'complaint' | 'manual'
    detail = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    __table_args__ = (UniqueConstraint('email', name='uq_suppressions_email'),)
