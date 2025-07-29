from sqlalchemy import Column, Integer, String
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

class DhanCredential(Base):
    __tablename__ = "dhan_credentials"
    id = Column(Integer, primary_key=True, index=True)
    client_id = Column(String, unique=True, index=True)
    api_key = Column(String)
    api_secret = Column(String)
