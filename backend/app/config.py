import os, json

def _env_list(name: str, default=None):
    v = os.getenv(name)
    if not v:
        return default[:] if isinstance(default, list) else (default or [])
    v = v.strip()
    if v.startswith('['):  # JSON array
        try:
            arr = json.loads(v)
            if isinstance(arr, list):
                return [str(x).strip() for x in arr if str(x).strip()]
        except Exception:
            pass
    return [x.strip() for x in v.split(',') if x.strip()]

AUTH_COOKIE_NAMES = _env_list("AUTH_COOKIE_NAMES", ["algodatta_session", "access_token", "auth_token"])
AUTH_HEADER_NAME = os.getenv("AUTH_HEADER_NAME", "Authorization")
AUTH_HEADER_PREFIX = os.getenv("AUTH_HEADER_PREFIX", "Bearer ")
AUTH_JWT_ALGO = os.getenv("AUTH_JWT_ALGO", "HS256")  # HS256 | RS256 | ES256
AUTH_JWKS_URL = os.getenv("AUTH_JWKS_URL")
AUTH_JWT_SECRET = os.getenv("AUTH_JWT_SECRET")  # used for HS*
AUTH_JWT_PUBLIC_KEY = os.getenv("AUTH_JWT_PUBLIC_KEY")  # PEM text for RS*/ES*
AUTH_AUDIENCE = os.getenv("AUTH_AUDIENCE")  # optional
AUTH_ISSUER = os.getenv("AUTH_ISSUER")  # optional
ROLE_CLAIM = os.getenv("ROLE_CLAIM", "role")
ROLES_CLAIM = os.getenv("ROLES_CLAIM", "roles")
SCOPE_CLAIM = os.getenv("SCOPE_CLAIM", "scope")
AUTH_JWKS_TTL_SECONDS = int(os.getenv("AUTH_JWKS_TTL_SECONDS", "300"))
