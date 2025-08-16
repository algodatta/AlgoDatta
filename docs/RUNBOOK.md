# AlgoDatta Runbook — Fix & Deploy

## One-time: ensure backend health route is wired
Copy `backend/app/api/routers/admin_health.py` into your repo and run:
```
python ops/patch_main.py
```

## Switch to psycopg binary wheels (recommended)
Apply patch if you currently use psycopg2-binary:
```
git apply patches/backend_requirements_psycopg.patch || echo "patch may already be applied"
```

## Build, migrate, deploy (on server)
```
bash ops/fix_and_deploy.sh
```

## Diagnose if something fails
```
bash ops/diagnose.sh
```

## Notes
- The DB-polling publisher is enabled by default via docker-compose env.
- If your backend cannot import SessionLocal, add DATABASE_URL to backend environment.
- Frontend should call https://algodatta.com via NEXT_PUBLIC_API_BASE. Ensure that is set in frontend env or hardcoded in lib/api.