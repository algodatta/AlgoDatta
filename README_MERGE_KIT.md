# AlgoDatta Merge Kit

This kit was generated on 2025-08-27T19:24:00 to help you
merge the optimized contents of your tarball into the GitHub repo clone.

## What this kit includes

- `tools/merge_algodatta_tar_into_repo.sh` — Interactive rsync-based merge script.
- `tools/fix_next_conflicts.sh` — Helper to avoid Next.js app/pages conflicts by archiving legacy `pages/`.
- `docker-compose.yml` (if missing/broken, a working one was generated).
- Cleaned backend `requirements.txt` files (prefer `psycopg[binary]` and deduped).
- Updated `.gitignore` for a Python + Next.js monorepo.

## How to use

1. Clone your GitHub repo locally (if not already):
   ```bash
   git clone https://github.com/algodatta/AlgoDatta.git
   cd AlgoDatta
   ```

2. Extract the **optimized** tar tree (this folder) somewhere accessible, e.g. `/tmp/algo_tar_optimized`.

3. Run the merge script:
   ```bash
   chmod +x tools/merge_algodatta_tar_into_repo.sh
   ./tools/merge_algodatta_tar_into_repo.sh /path/to/AlgoDatta /tmp/algo_tar_optimized
   ```

   - It will show a **dry-run preview** of changes before applying them.
   - It creates a new branch named like `merge-algodatta-tar-YYYYmmdd_HHMMSS`.

4. After merge:
   ```bash
   # Optional for Next.js apps using the /app router:
   bash tools/fix_next_conflicts.sh /path/to/AlgoDatta

   # Bring up services to validate
   docker compose up -d --build
   ```

## Notes
- Environment variables like `NEXT_PUBLIC_API_BASE` and `DATABASE_URL` should be set in compose or `.env` files as appropriate.
- If your repo already has a good `docker-compose.yml`, compare with the generated one and keep your settings.
- The merge excludes heavy/ephemeral folders (`node_modules`, `.next`, `__pycache__`, venvs, `.env*`, etc.) to avoid noise.

## Summary of changes performed during optimization

- Updated .gitignore with additional monorepo patterns
- Optimized backend requirements at backend/requirements.txt
- Added tools/merge_algodatta_tar_into_repo.sh (rsync-based merge with dry-run)

---

## Conditional Auth Redirect (scaffolded)

- Added **`frontend/middleware.ts`** to redirect:
  - `/` → `/executions` if authenticated, else `/login?next=/executions`
  - Protects `/executions`, `/strategies`, `/broker`, `/reports`, `/admin`
  - Keeps signed-in users away from `/login`, `/signup`, `/forgot`

- Added **`jose`** to `frontend/package.json` dependencies.

- Added **`frontend/.env.example`** with `AUTH_JWT_*` variables.
  - Copy to `.env.local` (dev) and `.env.production` (prod) and set real values.

**Local test**
```bash
cd frontend
npm i
npm run build && npm run start
# visit http://localhost:3000/
```

**Docker**
Rebuild the frontend image so Next.js picks the middleware:
```bash
docker compose build frontend && docker compose up -d
```


---

## Role-Based Routing (RBAC)

- Middleware upgraded to read roles from JWT claims (`role`, `roles[]`, or `scope` tokens like `role:admin`).
- Default mapping:
  - `/admin` → `admin`
  - `/reports` → `admin`, `analyst`
  - `/executions` → `admin`, `trader`
  - `/strategies` → `admin`, `trader`, `analyst`
  - `/broker` → `admin`, `trader`
- Landing path when signed in:
  - `admin` → `/admin`
  - `trader` → `/executions`
  - `analyst` → `/reports`
  - default → `/executions`
- Unauthorized users are redirected to **`/unauthorized`**.

> Adjust `ROLE_ROUTES` and landing logic in `frontend/middleware.ts` to fit your exact roles.


## API-level Enforcement

Added:
- `backend/app/security/jwt_auth.py` — JWT verification supporting HS256, RS/ES with PEM, or JWKS.
- `backend/app/security/deps.py` — FastAPI dependencies: `get_current_user` and `require_roles()`.
- `backend/app/routers/demo.py` — Sample protected endpoints:
  - `GET /me` — requires a valid token
  - `GET /admin/ping` — role: `admin`
  - `GET /executions/private` — roles: `admin` or `trader`
  - `GET /reports/private` — roles: `admin` or `analyst`

### Configure (dev)
Use env vars (Docker Compose already sets HS256 defaults):
```
AUTH_JWT_ALGO=HS256
AUTH_JWT_SECRET=dev_secret_change_me
# or JWKS/RS256 options:
# AUTH_JWKS_URL=https://api.algodatta.com/.well-known/jwks.json
# AUTH_JWT_PUBLIC_KEY="-----BEGIN PUBLIC KEY-----\n...\n-----END PUBLIC KEY-----"
```

### Test with a sample token
Create a JWT with claims like:
```json
{
  "sub": "u123",
  "role": "trader",
  "scope": "role:trader",
  "exp": 4070908800
}
```
Sign with HS256 using `AUTH_JWT_SECRET`.

Then:
```bash
curl -H "Authorization: Bearer <JWT>" http://localhost:8000/me
curl -H "Authorization: Bearer <JWT>" http://localhost:8000/executions/private
curl -H "Authorization: Bearer <JWT>" http://localhost:8000/admin/ping   # will 403 unless role=admin
```


---

## Dashboard Landing + Login Flow

- **Login flow**: `POST /auth/login` sets an HttpOnly cookie and responds `{ ok: true }`.
- **Frontend**: `/login` posts to `/auth/login` (backend) and navigates to `next` (default `/dashboard`).
- **Middleware**: Root `/` and auth pages redirect to `/dashboard` when authenticated; otherwise go to `/login?next=/dashboard`.
- **Dashboard**: `/dashboard` shows feature tiles and calls `/dashboard/summary` for quick stats.

**Env for cookies (prod)**
```
AUTH_COOKIE_DOMAIN=www.algodatta.com
AUTH_COOKIE_SECURE=true
AUTH_COOKIE_SAMESITE=None  # if crossing domains (ensure HTTPS)
```

