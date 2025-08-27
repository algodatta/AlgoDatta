from typing import List, Optional, Dict, Any, Callable
from fastapi import Depends, HTTPException, status, Request
from pydantic import BaseModel
from .jwt_auth import decode_jwt, extract_roles, get_token_from_request

class AuthUser(BaseModel):
    sub: Optional[str] = None
    roles: List[str] = []
    claims: Dict[str, Any] = {}

def get_current_user(request: Request) -> AuthUser:
    token = get_token_from_request(request)
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing token")
    claims = decode_jwt(token)
    if not claims:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    sub = (claims.get("sub") or claims.get("user_id") or claims.get("uid"))
    roles = extract_roles(claims)
    return AuthUser(sub=str(sub) if sub else None, roles=roles, claims=claims)

def require_roles(*allowed: str) -> Callable[[AuthUser], AuthUser]:
    allowed_set = {r.lower() for r in allowed if isinstance(r, str)}
    def _dep(user: AuthUser = Depends(get_current_user)) -> AuthUser:
        if not allowed_set:
            return user
        user_set = {r.lower() for r in user.roles}
        if user_set.intersection(allowed_set):
            return user
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient role")
    return _dep
