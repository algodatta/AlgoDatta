# Backend merge notes (FastAPI)

Adds `/api/auth` endpoints required by the new frontend pages:
- POST `/api/auth/register`
- POST `/api/auth/forgot-password`
- POST `/api/auth/reset-password`

The provided `auth.py` uses an in-memory FAKE_DB for demonstration.
**Replace** FAKE_DB and helper functions with your real SQLAlchemy models and mailer.

## DB migration
Add columns to your `users` table:
- `reset_token_hash TEXT NULL`
- `reset_token_expires_at TIMESTAMP NULL`

A SQL stub is included at `backend/migrations/001_add_reset_token_columns.sql`.

## Wire the router
In your main FastAPI app:
```py
from app.routers import auth
app.include_router(auth.router)
```
