from typing import List, Optional
from datetime import datetime

# Replace these with your actual ORM models/imports
# from app.db import get_db
# from app.models.user import User

class UserObj:
    def __init__(self, id: str, email: str, name: str = '', role: str = 'user', is_enabled: bool = True):
        self.id = id
        self.email = email
        self.name = name
        self.role = role
        self.is_enabled = is_enabled
        self.created_at = datetime.utcnow()
        self.last_login_at = None

# FAKE IN-MEMORY DB for demo
_FAKE_USERS = {
    "1": UserObj(id="1", email="admin@algodatta.com", name="Admin", role="admin", is_enabled=True),
    "2": UserObj(id="2", email="user@example.com", name="Trader One", role="user", is_enabled=True),
}

def list_users() -> List[UserObj]:
    return list(_FAKE_USERS.values())

def get_user(user_id: str) -> Optional[UserObj]:
    return _FAKE_USERS.get(user_id)

def patch_user(user_id: str, *, role: Optional[str] = None, is_enabled: Optional[bool] = None) -> Optional[UserObj]:
    u = _FAKE_USERS.get(user_id)
    if not u:
        return None
    if role is not None:
        u.role = role
    if is_enabled is not None:
        u.is_enabled = is_enabled
    return u
