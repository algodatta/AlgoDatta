#!/usr/bin/env bash
set -euo pipefail
# Resolve Next.js app/pages conflicts by moving legacy "pages/*" into "pages_legacy/*"
# so the modern /app router remains the source of truth.

ROOT_DIR="${1:-.}"
PAGES_DIR="$ROOT_DIR/frontend/pages"
APP_DIR="$ROOT_DIR/frontend/app"

if [[ -d "$PAGES_DIR" && -d "$APP_DIR" ]]; then
  mkdir -p "$ROOT_DIR/frontend/pages_legacy"
  shopt -s nullglob
  mv "$PAGES_DIR"/* "$ROOT_DIR/frontend/pages_legacy/" || true
  rmdir "$PAGES_DIR" || true
  echo "Moved /frontend/pages -> /frontend/pages_legacy (to avoid Next.js conflicts)."
else
  echo "No /frontend/pages & /frontend/app conflict detected or paths differ."
fi
