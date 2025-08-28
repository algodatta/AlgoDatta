#!/usr/bin/env bash
set -euo pipefail

patch_file() {
  f="$1"
  [ -f "$f" ] || return 0
  echo "Patching $f"

  # 1) Replace apiFetch<T> with jsonFetch<T>
  sed -i 's/apiFetch</jsonFetch</g' "$f"

  # 2) Ensure the import adds { jsonFetch } alongside apiFetch
  # ../lib/api (admin/page.tsx)
  sed -i "s#^import[[:space:]]\\+apiFetch[[:space:]]\\+from[[:space:]]\\+'\\(.\\./lib/api\\)'\\;#import apiFetch, { jsonFetch } from '\\1';#g" "$f" || true
  # ../../lib/api (app/admin/page.tsx)
  sed -i "s#^import[[:space:]]\\+apiFetch[[:space:]]\\+from[[:space:]]\\+'\\(..\\./..\\)/lib/api'\\;#import apiFetch, { jsonFetch } from '\\1/lib/api';#g" "$f" || true

  # Optional: normalize path to /api/admin/users if needed (keeps your current path otherwise)
  # sed -i "s#\"/admin/users\"#\"/api/admin/users\"#g" "$f" || true
}

patch_file "admin/page.tsx"
patch_file "app/admin/page.tsx"

echo "Done."
