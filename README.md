# AlgoDatta Scaffold — Phase 0–2 (with Email Verification)
Quick dev scaffold: Next.js App Router + FastAPI + JWT + SQLite + Registration with strong password rules and email verification (dev stub).

## Backend
```bash
cd backend
python -m venv .venv && source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
python -m app.init_db
python -m app.seed
uvicorn app.main:app --reload --port 8000
```

## Frontend
```bash
cd frontend
npm i
cp .env.example .env.local
npm run dev
```

## Register & Verify
- Open http://localhost:3000/register and create a user (password rules enforced).
- The backend prints a **verification link** to its console; the API also returns `dev_verify_token` for convenience.
- You’ll be redirected to `/verify?token=<token>`; after success, **Sign in**.

### Password Rules
- At least 8 chars, and include uppercase, lowercase, digit, special char.

## Notes
- This is a scaffold; order routing and reports KPIs arrive in later phases.


## SendGrid Email Delivery
1. Create a SendGrid account and generate an **API Key** with "Mail Send" permission.
2. Verify a **Single Sender** or set up a verified domain.
3. Set these env vars in `backend/.env`:
   ```env
   SENDGRID_API_KEY=SG.xxxxx
   SENDGRID_FROM_EMAIL=you@yourdomain.com
   FRONTEND_BASE_URL=http://localhost:3000
   ```
4. Install deps and run the backend. On registration, a real email will be sent.  
   If the keys are missing, the backend will log a warning and print the verification link to console.


## Email: Rate limiting & retries
- **Global limits:** `EMAIL_RATE_LIMIT_PER_MINUTE`, `EMAIL_RATE_LIMIT_PER_HOUR`
- **Per-recipient limits:** `EMAIL_RECIPIENT_LIMIT_PER_HOUR`, `EMAIL_RECIPIENT_LIMIT_PER_DAY`
- **Retries:** `EMAIL_MAX_RETRIES` with exponential backoff (`EMAIL_BACKOFF_BASE_SECONDS`, `EMAIL_BACKOFF_MAX_SECONDS`) on 429/5xx
- **Distributed limits:** set `REDIS_URL` (e.g., `redis://localhost:6379/0`). Without Redis, an in-memory limiter is used per-process.
