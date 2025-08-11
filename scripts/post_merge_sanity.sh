#!/usr/bin/env bash
set -euo pipefail
echo "== Python & deps =="
python3 -V || python -V || true
pip install -q httpx "sqlalchemy>=2" "pydantic>=1.10" || true
echo "== Import smoke test =="
python - <<'PY'
from app.db.suppressions import init_tables
from app.routes.sns_webhook import router as r1
from app.routes.admin_suppressions import router as r2
print('OK')
PY
