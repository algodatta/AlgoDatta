#!/usr/bin/env bash
set -euo pipefail

echo "== Checking docker compose =="
docker compose ps >/dev/null 2>&1 || { echo "Docker not ready or compose file missing."; exit 1; }

echo "== Building and starting =="
docker compose up -d --build

echo "== Waiting for API =="
for i in {1..30}; do
  if curl -fsS http://localhost:8000/healthz >/dev/null; then
    echo "API is up."
    break
  fi
  sleep 1
done

echo "== Backend /docs check =="
curl -fsS http://localhost:8000/docs >/dev/null && echo "Docs OK"

echo "== Frontend basic homepage =="
curl -fsS http://localhost:3000 >/dev/null && echo "Frontend OK"

echo "All good!"
