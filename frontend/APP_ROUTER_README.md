# App Router enabled

This project now uses Next.js App Router:

- `app/layout.tsx` (required)
- `app/page.tsx` (home)
- `app/broker/page.tsx`
- `app/strategies/page.tsx`
- `app/reports/page.tsx`

If you previously used `pages/`, those specific routes were removed to avoid conflicts.
Start the dev server with:

```bash
npm install
npm run dev
# Open http://localhost:3000
```
