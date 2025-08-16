#!/usr/bin/env bash
set -euo pipefail

# Run alembic migrations inside the backend container/image.
# Usage: ./deploy/migrate.sh

# Ensure DB is ready (if you have a db service)
docker compose up -d db || true

# Run migration
docker compose run --rm backend alembic upgrade head