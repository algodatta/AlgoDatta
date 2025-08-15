import uuid
from datetime import datetime
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Float
from sqlalchemy.orm import relationship
from .db import Base

def gen_uuid():
    return str(uuid.uuid4())

class User(Base):
    __tablename__ = "users"
    id = Column(String, primary_key=True, default=gen_uuid)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    is_admin = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    broker = relationship("Broker", uselist=False, back_populates="user")

class Broker(Base):
    __tablename__ = "brokers"
    id = Column(String, primary_key=True, default=gen_uuid)
    user_id = Column(String, ForeignKey("users.id"))
    dhan_token = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="broker")

class Strategy(Base):
    __tablename__ = "strategies"
    id = Column(String, primary_key=True, default=gen_uuid)
    user_id = Column(String, ForeignKey("users.id"))
    name = Column(String, nullable=False)
    script = Column(String, nullable=True)
    webhook_path = Column(String, unique=True, index=True)
    is_active = Column(Boolean, default=False)
    paper_trading = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class Execution(Base):
    __tablename__ = "executions"
    id = Column(String, primary_key=True, default=gen_uuid)
    user_id = Column(String, ForeignKey("users.id"))
    strategy_id = Column(String, ForeignKey("strategies.id"))
    symbol = Column(String)
    side = Column(String)
    price = Column(Float)
    created_at = Column(DateTime, default=datetime.utcnow)
