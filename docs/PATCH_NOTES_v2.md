# Patch v2 — Fixes

- Completed React page (no truncation) for admin suppressions.
- Backend compatible with Python 3.8+/FastAPI on Pydantic v1 or v2 (no `|` types, added `orm_mode`).
- Accurate SQLAlchemy count.
- Added `__init__.py` in packages.
- SES bootstrap script: fixed TXT quoting and `USE_DEFAULT_VALUE` enum; no temp files.
- Added `scripts/post_merge_sanity.sh` to smoke-test imports after merge.
