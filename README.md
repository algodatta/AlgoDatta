# AlgoDatta — SES Scaffold (Phase 0–2+)
Next.js App Router + FastAPI + JWT + SQLite + Registration + **Email verification via AWS SES** + **Password reset** with TTL/rate limits + **Suppression** + **Ops health** + **Audit log**.

## Backend
```bash
cd backend
python -m venv .venv && source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
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

## SES Setup
1) Verify sender email/domain in AWS SES (same region as `AWS_REGION`).  
2) If in **sandbox**, verify recipients or request production access.  
3) Configure `backend/.env` with SES vars. Optional: `SES_CONFIG_SET_NAME` for tagging/events.

## Password reset
Endpoints:
- `POST /api/auth/request_password_reset` → `{ "email": "user@example.com" }`
- `POST /api/auth/reset_password` → `{ "token": "<token>", "password": "<new strong password>" }`

Frontend pages:
- `/forgot` — request a reset link
- `/reset?token=...` — set a new password (with **Resend reset link** option)

Security knobs (in `.env`):
```
PASSWORD_RESET_TOKEN_TTL_MINUTES=30
PASSWORD_RESET_REQUESTS_PER_HOUR=3
PASSWORD_RESET_GLOBAL_PER_MINUTE=60
```

## DKIM & Custom MAIL FROM
See `docs/email-dkim-mailfrom.md` for step‑by‑step setup, DNS examples, alignment tips, and a rollout checklist.

## SNS (bounces/complaints → suppression)
- Endpoint: `POST /api/notifications/ses-sns`
- Wire your SES **Configuration Set** → **SNS** event destinations (Bounce/Complaint) → subscribe your HTTPS endpoint.

## Admin
- `/admin` → Users, **Suppressions**, **Audit log**
- `/ops/health` → SES quotas & CW alarms (admin only)

## Terraform / CloudFormation
- `infrastructure/terraform` and `infrastructure/cloudformation` provision DKIM CNAMEs, Custom MAIL FROM, DMARC, optional SESv2 Config Set, SNS, and CW alarms.

