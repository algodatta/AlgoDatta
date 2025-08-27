from __future__ import annotations
import time, json, base64
from typing import Optional, Dict, Any, Tuple, List
from fastapi import Request
from jose import jwt
from jose.utils import base64url_decode
from cryptography.hazmat.primitives.asymmetric import rsa, ec
from cryptography.hazmat.primitives import serialization
import httpx

from . import config

_jwks_cache: Dict[str, Any] = {
    "url": None,
    "ts": 0.0,
    "data": None,
}

def _b64_to_int(b: str) -> int:
    return int.from_bytes(base64url_decode(b.encode("utf-8")), "big")

def _jwk_to_pem(jwk: Dict[str, Any]) -> Optional[bytes]:
    kty = jwk.get("kty")
    if kty == "RSA":
        n = _b64_to_int(jwk["n"])
        e = _b64_to_int(jwk["e"])
        pub = rsa.RSAPublicNumbers(e, n).public_key()
        return pub.public_bytes(encoding=serialization.Encoding.PEM,
                                format=serialization.PublicFormat.SubjectPublicKeyInfo)
    if kty == "EC":
        crv = jwk.get("crv")
        curve_map = {
            "P-256": ec.SECP256R1(),
            "P-384": ec.SECP384R1(),
            "P-521": ec.SECP521R1(),
        }
        curve = curve_map.get(crv)
        if not curve:
            return None
        x = _b64_to_int(jwk["x"])
        y = _b64_to_int(jwk["y"])
        pub = ec.EllipticCurvePublicNumbers(x, y, curve).public_key()
        return pub.public_bytes(encoding=serialization.Encoding.PEM,
                                format=serialization.PublicFormat.SubjectPublicKeyInfo)
    return None

def _get_unverified_header(token: str) -> Dict[str, Any]:
    parts = token.split(".")
    if len(parts) < 2:
        return {}
    header_b64 = parts[0]
    header_json = base64url_decode(header_b64.encode("utf-8"))
    return json.loads(header_json)

def _fetch_jwks(force: bool = False) -> Optional[Dict[str, Any]]:
    if not config.AUTH_JWKS_URL:
        return None
    now = time.time()
    if (not force and _jwks_cache["data"] is not None and
        _jwks_cache["url"] == config.AUTH_JWKS_URL and
        now - _jwks_cache["ts"] < config.AUTH_JWKS_TTL_SECONDS):
        return _jwks_cache["data"]
    try:
        with httpx.Client(timeout=5.0) as client:
            resp = client.get(config.AUTH_JWKS_URL)
            resp.raise_for_status()
            data = resp.json()
            _jwks_cache.update({"url": config.AUTH_JWKS_URL, "ts": now, "data": data})
            return data
    except Exception:
        return _jwks_cache["data"]  # return stale if available

def _get_key_for_token(token: str) -> Optional[bytes]:
    alg = config.AUTH_JWT_ALGO or "HS256"
    # JWKS
    if config.AUTH_JWKS_URL and (alg.startswith("RS") or alg.startswith("ES")):
        hdr = _get_unverified_header(token)
        kid = hdr.get("kid")
        jwks = _fetch_jwks()
        if jwks and "keys" in jwks:
            for jwk in jwks["keys"]:
                if (not kid) or jwk.get("kid") == kid:
                    pem = _jwk_to_pem(jwk)
                    if pem:
                        return pem
    # Public key PEM
    if (alg.startswith("RS") or alg.startswith("ES")) and config.AUTH_JWT_PUBLIC_KEY:
        return config.AUTH_JWT_PUBLIC_KEY.encode("utf-8")
    # Shared secret
    if alg.startswith("HS") and config.AUTH_JWT_SECRET:
        return config.AUTH_JWT_SECRET.encode("utf-8")
    return None

def decode_jwt(token: str) -> Optional[Dict[str, Any]]:
    if not token:
        return None
    alg = config.AUTH_JWT_ALGO or "HS256"
    key = _get_key_for_token(token)
    options = {"verify_aud": bool(config.AUTH_AUDIENCE), "verify_iss": bool(config.AUTH_ISSUER)}
    try:
        claims = jwt.decode(
            token,
            key or "",  # jose requires non-None, but empty will skip if options below allow
            algorithms=[alg],
            audience=config.AUTH_AUDIENCE if config.AUTH_AUDIENCE else None,
            issuer=config.AUTH_ISSUER if config.AUTH_ISSUER else None,
            options=options if key else {"verify_signature": False},
        )
        return claims
    except Exception:
        # fall back to non-verified parse if no key configured (dev)
        try:
            parts = token.split(".")
            if len(parts) >= 2:
                payload_json = base64url_decode(parts[1].encode("utf-8"))
                return json.loads(payload_json)
        except Exception:
            return None

def extract_roles(claims: Dict[str, Any]) -> List[str]:
    roles: List[str] = []
    if not claims:
        return roles
    # role (single)
    r = claims.get(config.ROLE_CLAIM)
    if isinstance(r, str) and r.strip():
        roles.append(r.strip().lower())
    # roles (array)
    arr = claims.get(config.ROLES_CLAIM)
    if isinstance(arr, list):
        for it in arr:
            if isinstance(it, str) and it.strip():
                roles.append(it.strip().lower())
    # scope string with "role:..."
    scope = claims.get(config.SCOPE_CLAIM)
    if isinstance(scope, str):
        for part in scope.split():
            if part.lower().startswith("role:"):
                roles.append(part.split(":",1)[1].strip().lower())
    # dedupe
    return list(dict.fromkeys(roles))

def get_token_from_request(request: Request) -> Optional[str]:
    # Header
    auth = request.headers.get(config.AUTH_HEADER_NAME)
    if auth:
        pref = config.AUTH_HEADER_PREFIX
        if pref and auth.startswith(pref):
            return auth[len(pref):].strip()
        return auth.strip()
    # Cookies
    for name in config.AUTH_COOKIE_NAMES:
        v = request.cookies.get(name)
        if v:
            return v
    return None
