# Frontend merge notes (Next.js)

This scaffold adds:
- /register, /forgot-password, /reset-password pages
- /dashboard admin hub
- Minimal stubs: /broker, /strategies, /reports, /admin
- middleware.ts to protect routes
- lib/auth.ts (best-effort cookie decode)

## How to merge

1) Copy **app/** subfolders into your `frontend/app/` (create `(auth)` and `(site)` groups if missing).
2) Add links on your `/login` page:
   ```tsx
   <div className="mt-4 flex items-center justify-between text-sm">
     <a href="/register" className="underline">Create an account</a>
     <a href="/forgot-password" className="underline">Forgot password?</a>
   </div>
   ```
3) Place `middleware.ts` in the `frontend/` root (same level as `next.config.js`).
4) Ensure your API routes exist:
   - POST /api/auth/register
   - POST /api/auth/forgot-password
   - POST /api/auth/reset-password
   - GET /api/broker/profile, /api/broker/holdings, /api/broker/positions, POST /api/broker/connect
   - GET /api/strategies, POST /api/strategies/:id/toggle
   - GET /api/executions, GET /api/reports/csv
   - GET /healthz (proxied from api.algodatta.com or served by frontend api routes)

5) Rebuild:
   ```bash
   npm run build && npm run start
   ```

> Make sure your auth cookie is named `access_token` and contains `{ sub, email, role }`.
