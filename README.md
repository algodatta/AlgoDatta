# AlgoDatta Minimal (Code-Only Update)

This bundle contains **frontend Next.js App Router pages** and **FastAPI backend routes** to drop into your Lightsail deployment without changing infra.

## Backend
- FastAPI app at `backend/app` with routes under `/api/*`.
- Uses SQLAlchemy with `DATABASE_URL` (defaults to SQLite for local dev).
- JWT auth: Register/Login then use `Authorization: Bearer <token>`.

Local run:
```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```
Open API docs: `http://localhost:8000/api/docs`

## Frontend
- Next.js 14 App Router under `frontend/app/*`.
- Set `NEXT_PUBLIC_API_BASE` to your backend URL.

Local run:
```bash
cd frontend
npm install
npm run dev
```

## Postman
Use the collection you downloaded earlier, or hit `/api/docs`.

— Generated on 2025-08-15 16:06:53 IST


## Production (Lightsail) Notes
- Backend uses **psycopg[binary]**. Set `DATABASE_URL` in `backend/.env.production` like:
  `postgresql+psycopg://<user>:<pass>@db:5432/algodatta`
- Frontend uses `NEXT_PUBLIC_API_BASE=https://www.algodatta.com` assuming Nginx proxies `/api` to backend.
- Rebuild only app containers (no infra change):
```bash
docker compose build backend frontend
docker compose up -d backend frontend
```
— Updated on 2025-08-15 16:10:04 IST
