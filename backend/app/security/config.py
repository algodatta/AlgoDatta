
import os



def _get(name: str, default=None):

    val = os.environ.get(name, default)

    return val



def _require(name: str):

    val = os.environ.get(name)

    if not val:

        raise RuntimeError(f"{name} is required but not set")

    return val



# Required

SECRET_KEY = _require("SECRET_KEY")



# Common names used in JWT code; support both to be resilient

ALGORITHM = _get("ALGORITHM", _get("JWT_ALGORITHM", "HS256"))

JWT_ALGORITHM = ALGORITHM  # alias for callers that expect JWT_ALGORITHM



# Token lifetimes (minutes)

ACCESS_TOKEN_EXPIRE_MINUTES = int(_get("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))

REFRESH_TOKEN_EXPIRE_MINUTES = int(_get("REFRESH_TOKEN_EXPIRE_MINUTES", "10080"))  # 7 days

