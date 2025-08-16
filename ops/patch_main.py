#!/usr/bin/env python3
import re, sys, pathlib

p = pathlib.Path("backend/app/main.py")
if not p.exists():
    print("backend/app/main.py not found")
    sys.exit(0)

s = p.read_text(encoding="utf-8")
changed = False

if "from app.api.routers import admin_health" not in s:
    # place near other router imports or after FastAPI import
    s = re.sub(r"(from fastapi import[^\n]*\n)", r"\1from app.api.routers import admin_health\n", s, count=1)
    changed = True

if "app.include_router(admin_health.router)" not in s:
    # insert after app = FastAPI(...)
    s = re.sub(r"(app\s*=\s*FastAPI\([^)]*\)|app\s*=\s*FastAPI\(\))",
               r"\1\napp.include_router(admin_health.router)", s, count=1)
    if "app.include_router(admin_health.router)" not in s:
        s += "\napp.include_router(admin_health.router)\n"
    changed = True

if changed:
    p.write_text(s, encoding="utf-8")
    print("Patched", p)
else:
    print("No changes needed")