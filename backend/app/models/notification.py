from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.sql import func
from app.db.session import Base

class Notification(Base):
    __tablename__ = "notifications"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    type = Column(String, nullable=False)  # telegram|email
    destination = Column(String, nullable=False)
    verified = Column(String, default="no")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
