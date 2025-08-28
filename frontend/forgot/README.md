# AlgoDatta — Phase 7 (Frontend Integration)

Vite + React + TS + Tailwind single-page app that talks to the existing FastAPI backend.

## Setup
```bash
cd frontend
cp .env.example .env   # adjust VITE_API_BASE if backend not on localhost:8000
npm i
npm run dev           # http://localhost:5173
```

## Pages
- Login (stores JWT; fetches `/auth/me`)
- Strategies (list/create/toggle/rotate/delete via `/strategies`)
- Executions (live polling `/orders`)
- Positions (`/positions`)
- Reports (equity JSON + CSV link)
- Admin (summary + users; visible when `/auth/me` role = admin)

This is a clean foundation you can extend with charts (Recharts) and form modals (shadcn/ui) if you want a richer UI.


## Admin Panel (opinionated)
Open **/admin** after logging in as the seeded admin.
Tabs included:
- Overview (system summary)
- Users (create + list)
- Brokers (Dhan upsert per user)
- Instruments Upload (CSV form)
- Strategy Config (Dhan fields + paper/live toggle)
- Risk (rate limit / windows / caps)
- Notifications (list/add/verify/delete)
- Executions (recent admin view)
- Metrics (/metrics text)
- Equity (line chart powered by Recharts)


Admin PRO features added: pagination, filters, instrument search, theme toggle.
