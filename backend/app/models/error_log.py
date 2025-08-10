from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func
from app.db.session import Base
class ErrorLog(Base):
    __tablename__ = "error_logs"
    id = Column(Integer, primary_key=True, index=True)
    context = Column(String, nullable=False)
    message = Column(String, nullable=False)
    stack = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
