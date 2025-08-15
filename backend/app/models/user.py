import enum
import uuid
from sqlalchemy import Column, String, Enum, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from app.db.base import Base

class UserRole(str, enum.Enum):
    user = "user"
    admin = "admin"

class UserStatus(str, enum.Enum):
    active = "active"
    disabled = "disabled"

class User(Base):
    __tablename__ = "users"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String, unique=True, nullable=False, index=True)
    password_hash = Column(String, nullable=False)
    role = Column(Enum(UserRole, name="user_role"), default=UserRole.user, nullable=False)
    status = Column(Enum(UserStatus, name="user_status"), default=UserStatus.active, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
