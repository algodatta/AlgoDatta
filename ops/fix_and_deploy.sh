#!/usr/bin/env bash
set -euo pipefail

# Usage: run from the repo root on Lightsail (or any docker host)

echo "== AlgoDatta: fix_and_deploy =="

# 0) Basic checks
command -v docker >/dev/null || { echo "Docker not found"; exit 1; }
if [ -f docker-compose.yml ]; then
  COMPOSE="docker compose"
else
  echo "docker-compose.yml missing in current directory"; exit 1
fi

# 1) Build images
$COMPOSE build

# 2) Start DB if present (ignore if no db service)
($COMPOSE up -d db || true)

# 3) Run alembic migrations (if backend container and alembic exist)
set +e
$COMPOSE run --rm backend alembic upgrade head
ALEMBIC_RC=$?
set -e
if [ "$ALEMBIC_RC" -ne 0 ]; then
  echo "[warn] alembic upgrade head failed or alembic not configured; continuing"
fi

# 4) Bring up app
$COMPOSE up -d --remove-orphans

# 5) Wait for backend health
BACKEND_URL="${BACKEND_URL:-http://localhost:8000}"
if [ -n "${PUBLIC_DOMAIN:-}" ]; then
  BACKEND_HEALTH="https://${PUBLIC_DOMAIN}/api/admin/health"
else
  BACKEND_HEALTH="${BACKEND_URL%/}/api/admin/health"
fi

echo "Waiting for backend health at: $BACKEND_HEALTH"
for i in $(seq 1 30); do
  if curl -sk --max-time 3 "$BACKEND_HEALTH" | grep -q '"status":"ok"'; then
    echo "Backend healthy"
    OK=1
    break
  fi
  sleep 2
done
if [ "${OK:-0}" -ne 1 ]; then
  echo "[warn] health check not green; continuing"
fi

# 6) Show running services
$COMPOSE ps

echo "== Done =="