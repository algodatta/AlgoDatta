#!/usr/bin/env bash
set -euo pipefail

echo "[1/5] Removing legacy auth endpoints (if present)"
rm -f backend/app/api/routers/auth.py || true
rm -f backend/app/api/routes/auth.py || true
rm -f backend/app/middleware/login_form_adapter.py || true
rm -f backend/app/api/routers/login.py || true
rm -f backend/app/api/routers/register.py || true

echo "[2/5] Removing Next.js 'pages' that conflict with 'app' (if present)"
rm -f frontend/pages/broker.tsx || true
rm -f frontend/pages/executions.tsx || true
rm -f frontend/pages/index.tsx || true
rm -f frontend/pages/reports.tsx || true
rm -f frontend/pages/strategies/index.tsx || true

echo "[3/5] Ensuring required dependencies"
# Backend
grep -q "python-jose" backend/requirements.txt 2>/dev/null || echo "python-jose[cryptography]" >> backend/requirements.txt
grep -q "^httpx" backend/requirements.txt 2>/dev/null || echo "httpx" >> backend/requirements.txt

# Frontend
if [ -f frontend/package.json ]; then
  node -e "let p=require('./frontend/package.json'); p.dependencies=p.dependencies||{}; if(!p.dependencies['jsonwebtoken']){p.dependencies['jsonwebtoken']='^9.0.2'}; require('fs').writeFileSync('./frontend/package.json', JSON.stringify(p,null,2));"
fi

echo "[4/5] Copying new files"
mkdir -p frontend/app/auth/login frontend/app/auth/callback frontend/app/api/auth/session frontend/app/api/auth/logout frontend/app/(auth)/login
cat > frontend/app/auth/login/route.ts <<'TS'
import { NextResponse } from "next/server";
import crypto from "crypto";

const b64u = (b: Buffer) => b.toString("base64").replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"");

export async function GET() {
  const state = b64u(crypto.randomBytes(16));
  const verifier = b64u(crypto.randomBytes(32));
  const challenge = b64u(crypto.createHash("sha256").update(verifier).digest());

  const url = new URL(`${process.env.COGNITO_DOMAIN}/oauth2/authorize`);
  url.searchParams.set("client_id", process.env.OIDC_CLIENT_ID!);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("redirect_uri", process.env.OIDC_REDIRECT_URI!);
  url.searchParams.set("scope", "openid email profile");
  url.searchParams.set("code_challenge_method", "S256");
  url.searchParams.set("code_challenge", challenge);
  url.searchParams.set("state", state);

  const res = NextResponse.redirect(url.toString(), { status: 302 });
  const cookie = { httpOnly:true, secure:true, sameSite:"lax" as const, path:"/", domain: process.env.SESSION_COOKIE_DOMAIN };
  res.cookies.set("pkce_verifier", verifier, { ...cookie, maxAge: 600 });
  res.cookies.set("oauth_state",   state,    { ...cookie, maxAge: 600 });
  return res;
}

TS
cat > frontend/app/auth/callback/route.ts <<'TS'
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(req: Request) {
  const sp = new URL(req.url).searchParams;
  const code = sp.get("code");
  const gotState = sp.get("state") || "";
  const jar = cookies();
  const verifier = jar.get("pkce_verifier")?.value || "";
  const savedState = jar.get("oauth_state")?.value || "";
  if (!code || !verifier || gotState !== savedState) return NextResponse.redirect("/auth/error");

  const body = new URLSearchParams({
    grant_type: "authorization_code",
    client_id: process.env.OIDC_CLIENT_ID!,
    redirect_uri: process.env.OIDC_REDIRECT_URI!,
    code_verifier: verifier,
    code
  });

  const r = await fetch(`${process.env.COGNITO_DOMAIN}/oauth2/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body
  });
  if (!r.ok) return NextResponse.redirect("/auth/error");
  const t = await r.json();

  const res = NextResponse.redirect("/", { status: 302 });
  const cookie = { httpOnly:true, secure:true, sameSite:"lax" as const, path:"/", domain: process.env.SESSION_COOKIE_DOMAIN };
  if (t.access_token) res.cookies.set("access_token", t.access_token, { ...cookie, maxAge: 60*12 });
  if (t.id_token)      res.cookies.set("id_token",      t.id_token,      { ...cookie, maxAge: 60*12 });
  if (t.refresh_token) res.cookies.set("refresh_token", t.refresh_token, { ...cookie, maxAge: 60*60*24*30 });
  res.cookies.delete("pkce_verifier"); res.cookies.delete("oauth_state");
  return res;
}

TS
cat > frontend/app/api/auth/logout/route.ts <<'TS'
import { NextResponse } from "next/server";

export async function POST() {
  const cookie = { httpOnly:true, secure:true, sameSite:"lax" as const, path:"/", domain: process.env.SESSION_COOKIE_DOMAIN };
  const res = NextResponse.redirect("/");
  ["access_token","id_token","refresh_token"].forEach(n => res.cookies.set(n,"",{...cookie, maxAge:0}));

  const u = new URL(`${process.env.COGNITO_DOMAIN}/logout`);
  u.searchParams.set("logout_uri", "https://www.algodatta.com/");
  return NextResponse.redirect(u.toString(), { status: 302 });
}

TS
cat > frontend/app/api/auth/session/route.ts <<'TS'
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  const id = cookies().get("id_token")?.value;
  if (!id) return NextResponse.json({ authenticated:false });
  try {
    const payload = JSON.parse(Buffer.from(id.split(".")[1] || "", "base64url").toString("utf8"));
    return NextResponse.json({ authenticated:true, email: payload.email, name: payload.name, sub: payload.sub });
  } catch {
    return NextResponse.json({ authenticated:false });
  }
}

TS
# Create login page only if missing
if [ ! -f frontend/app/(auth)/login/page.tsx ]; then
  mkdir -p "frontend/app/(auth)/login"
  cat > frontend/app/(auth)/login/page.tsx <<'TSX'
export default function LoginPage() {
  return (
    <main className="mx-auto max-w-md p-6">
      <h1 className="text-2xl font-semibold mb-4">Sign in</h1>
      <p className="text-sm text-gray-600 mb-6">Use passkey (recommended), Google, Microsoft, Apple, or email.</p>
      <a href="/auth/login" className="inline-flex items-center rounded-lg px-4 py-2 bg-black text-white">
        Continue
      </a>
    </main>
  );
}

TSX
fi

# Backend security bits
mkdir -p backend/app/security backend/app/db deploy/nginx/snippets
cat > backend/app/security/cognito.py <<'PY'
import httpx
from functools import lru_cache
from jose import jwt
from fastapi import HTTPException, status
from app.core.config import settings

ISSUER = settings.oidc_issuer
AUD    = settings.oidc_client_id
JWKS   = f"{ISSUER}/.well-known/jwks.json"

@lru_cache(maxsize=1)
def _jwks():
    return httpx.get(JWKS, timeout=5).json()

def verify_access_token(token: str):
    try:
        hdr = jwt.get_unverified_header(token)
        key = next((k for k in _jwks()["keys"] if k["kid"] == hdr["kid"]), None)
        if not key:
            _jwks.cache_clear()
            key = next(k for k in _jwks()["keys"] if k["kid"] == hdr["kid"])
        claims = jwt.decode(token, key, algorithms=["RS256"], audience=AUD, issuer=ISSUER)
        return claims
    except Exception:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

PY
cat > backend/app/security/deps.py <<'PY'
from fastapi import Depends, HTTPException, status, Request
from app.security.cognito import verify_access_token
from app.db.users_service import upsert_from_claims

def get_current_user(request: Request):
    token = request.cookies.get("access_token")
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED)
    claims = verify_access_token(token)
    return upsert_from_claims(sub=claims["sub"], email=claims.get("email"), name=claims.get("name"))

PY
# Only create users_service if missing
if [ ! -f backend/app/db/users_service.py ]; then
cat > backend/app/db/users_service.py <<'PY'
from datetime import datetime
from sqlalchemy import select
from app.db.session import SessionLocal
from app.db.models import User  # Ensure this model has: cognito_sub (unique), email, name, role, last_login_at

def upsert_from_claims(sub: str, email: str|None, name: str|None):
    with SessionLocal() as db:
        u = db.execute(select(User).where(User.cognito_sub==sub)).scalar_one_or_none()
        if u:
            u.last_login_at = datetime.utcnow()
        else:
            u = User(
                cognito_sub=sub,
                email=email,
                name=name,
                role="user",
                created_at=datetime.utcnow(),
                last_login_at=datetime.utcnow()
            )
            db.add(u)
        db.commit(); db.refresh(u)
        return u

PY
fi

# Nginx security headers
cat > deploy/nginx/snippets/security.headers.conf <<'NGINX'
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-Frame-Options "DENY" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Content-Security-Policy "default-src 'self'; img-src 'self' data: https:; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; connect-src 'self' https:; frame-ancestors 'none'; base-uri 'self'; form-action 'self' https://login.algodatta.com" always;

NGINX

echo "[5/5] Done. Rebuild containers to apply changes."
