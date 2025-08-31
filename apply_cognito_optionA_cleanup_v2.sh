\
#!/usr/bin/env bash
set -euo pipefail

AUTH_GRP_DIR="frontend/app/(auth)/login"
AUTH_GRP_PAGE="$AUTH_GRP_DIR/page.tsx"

echo "[1/6] Removing legacy auth endpoints (if present)"
rm -f "backend/app/api/routers/auth.py" || true
rm -f "backend/app/api/routes/auth.py" || true
rm -f "backend/app/middleware/login_form_adapter.py" || true
rm -f "backend/app/api/routers/login.py" || true
rm -f "backend/app/api/routers/register.py" || true

echo "[2/6] Removing Next.js 'pages' that conflict with 'app' (if present)"
rm -f "frontend/pages/broker.tsx" || true
rm -f "frontend/pages/executions.tsx" || true
rm -f "frontend/pages/index.tsx" || true
rm -f "frontend/pages/reports.tsx" || true
rm -f "frontend/pages/strategies/index.tsx" || true

echo "[3/6] Ensuring required dependencies"
# Backend deps (append if missing)
if [ -f "backend/requirements.txt" ]; then
  grep -q "python-jose" "backend/requirements.txt" 2>/dev/null || echo "python-jose[cryptography]" >> "backend/requirements.txt"
  grep -q "^httpx" "backend/requirements.txt" 2>/dev/null || echo "httpx" >> "backend/requirements.txt"
fi

# Frontend dep jsonwebtoken
if [ -f "frontend/package.json" ]; then
  node -e "let fs=require('fs');let p=JSON.parse(fs.readFileSync('frontend/package.json','utf8'));p.dependencies=p.dependencies||{};if(!p.dependencies['jsonwebtoken']){p.dependencies['jsonwebtoken']='^9.0.2'};fs.writeFileSync('frontend/package.json',JSON.stringify(p,null,2));"
fi

echo "[4/6] Copying new frontend files"
mkdir -p "frontend/app/auth/login" "frontend/app/auth/callback" "frontend/app/api/auth/session" "frontend/app/api/auth/logout" "$AUTH_GRP_DIR"

cat > "frontend/app/auth/login/route.ts" <<'TS'

TS

cat > "frontend/app/auth/callback/route.ts" <<'TS'

TS

cat > "frontend/app/api/auth/logout/route.ts" <<'TS'

TS

cat > "frontend/app/api/auth/session/route.ts" <<'TS'

TS

# Create the route-group login page only if missing
if [ ! -f "$AUTH_GRP_PAGE" ]; then
  cat > "$AUTH_GRP_PAGE" <<'TSX'

TSX
fi

# Middleware (only create if not present)
if [ ! -f "frontend/middleware.ts" ]; then
cat > "frontend/middleware.ts" <<'TS'

TS
fi

echo "[5/6] Copying backend security files"
mkdir -p "backend/app/security" "backend/app/db" "deploy/nginx/snippets"

cat > "backend/app/security/cognito.py" <<'PY'

PY

cat > "backend/app/security/deps.py" <<'PY'

PY

# Only create users_service if missing
if [ ! -f "backend/app/db/users_service.py" ]; then
cat > "backend/app/db/users_service.py" <<'PY'

PY
fi

# Nginx security headers
cat > "deploy/nginx/snippets/security.headers.conf" <<'NGINX'
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-Frame-Options "DENY" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Content-Security-Policy "default-src 'self'; img-src 'self' data: https:; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; connect-src 'self' https:; frame-ancestors 'none'; base-uri 'self'; form-action 'self' https://login.algodatta.com" always;

NGINX

echo "[6/6] Done. Rebuild containers to apply changes."
