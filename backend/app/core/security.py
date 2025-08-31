
import os
from datetime import datetime, timedelta
from jose import jwt
from passlib.context import CryptContext

SECRET = os.getenv("JWT_SECRET", "dev-secret")
ALGO = "HS256"
EXPIRE_MIN = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "120"))
pwd = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(p: str) -> str:
    return pwd.hash(p)

def verify_password(p: str, h: str) -> bool:
    try:
        return pwd.verify(p, h)
    except Exception:
        return False

def create_access_token(sub: str, role: str = "admin") -> str:
    now = datetime.utcnow()
    payload = {"sub": sub, "role": role, "iat": now, "exp": now + timedelta(minutes=EXPIRE_MIN)}
    return jwt.encode(payload, SECRET, algorithm=ALGO)
