#!/usr/bin/env bash
set -euo pipefail
docker ps -a --filter "name=algodatta-backend" -q | xargs -r docker rm -f || true
if ss -ltnp | grep -q ":8000 "; then
  echo "WARNING: something is on :8000"
  ss -ltnp | grep ":8000 " || true
fi
docker compose up -d --build
for i in $(seq 1 30); do
  if curl -fsS http://127.0.0.1:8000/api/healthz >/dev/null 2>&1; then
    echo "Health OK"
    exit 0
  fi
  echo "attempt $i ..."; sleep 2
done
echo "Backend not healthy"; exit 1
