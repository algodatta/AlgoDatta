#!/usr/bin/env bash
set -euo pipefail
echo "== AlgoDatta: diagnose =="

COMPOSE="docker compose"

echo "-- docker compose ps --"
$COMPOSE ps || true

echo "-- backend last 200 logs --"
$COMPOSE logs --tail=200 backend || true

echo "-- frontend last 200 logs --"
$COMPOSE logs --tail=200 frontend || true

echo "-- psycopg import check --"
set +e
$COMPOSE exec -T backend python - <<'PY'
try:
    import psycopg
    print("psycopg OK:", psycopg.__version__)
except Exception as e:
    print("psycopg import failed:", e)
try:
    import psycopg2
    import psycopg2.errors as _
    print("psycopg2 OK")
except Exception as e:
    print("psycopg2 import failed:", e)
PY
set -e

echo "-- env check (backend) --"
$COMPOSE exec -T backend env | egrep 'DATABASE_URL|DB_URL|ALLOWED_ORIGINS|NEXT_PUBLIC_API_BASE|DHAN|SMTP|SECRET|JWT|EXEC_PUBLISHER' || true

echo "-- curl health --"
curl -sk --max-time 5 http://localhost:8000/api/admin/health || true

echo "== Diagnose complete =="