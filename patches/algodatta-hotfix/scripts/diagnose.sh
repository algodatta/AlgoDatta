#!/usr/bin/env bash
set -euo pipefail
docker ps --format 'table {{.Names}}	{{.Status}}	{{.Ports}}'
docker ps -a --filter "name=algodatta-backend" --format 'table {{.ID}}	{{.Names}}	{{.Status}}	{{.Ports}}'
ss -ltnp | awk '$4 ~ /:8000$/'
curl -i http://127.0.0.1:8000/api/healthz || true
docker compose logs --no-color --tail=200 algodatta-backend || true
