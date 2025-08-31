
import uuid
from sqlalchemy import Column, String
from sqlalchemy.dialects.postgresql import UUID
from app.db.session import Base

try:
    from sqlalchemy.dialects.postgresql import UUID as PG_UUID
    UUIDType = PG_UUID(as_uuid=True)
except Exception:
    from sqlalchemy.types import String as UUIDType

class User(Base):
    __tablename__ = "users"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String, unique=True, nullable=False)
    password_hash = Column(String, nullable=False)
    role = Column(String, default="admin")
