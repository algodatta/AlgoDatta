
#!/usr/bin/env bash
set -euo pipefail
echo "Starting stack..."
docker compose up -d --build
echo "Wait for API..."
for i in {1..30}; do
  if curl -sS http://localhost:8000/api/healthz | grep -q '"ok"\?\|status'; then
    echo "API is up"; break
  fi
  sleep 1
done
echo "Try login..."
curl -sS -X POST http://localhost:8000/api/auth/login -H 'content-type: application/json' -d '{"email":"admin@algodatta.com","password":"ChangeMe123!"}' && echo
