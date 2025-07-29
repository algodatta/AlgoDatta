from database.models import Base
from database.db import engine

Base.metadata.create_all(bind=engine)
