algodatta_fix_api_exports_20250828
=================================

This patch fixes the Next.js build errors:
- Missing exports: `apiBase`, `authHeaders`, `getToken` from `lib/api.ts`
- Type error in `app/admin/page.tsx` (`res` inferred as `unknown`)

What this adds
--------------
- `lib/api.ts` exporting:
  - `apiBase`, `getToken`, `authHeaders`
  - `apiFetch` (typed `Promise<Response>`)
  - `apiJson`, `apiGet`, `apiPost`, `apiPut`, `apiDelete`
- PowerShell helper to apply and commit: `scripts/apply_fix_api_exports.ps1`

Quick apply (Windows)
---------------------
1) Unzip this folder.
2) Open **PowerShell** and run:

   Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
   cd "C:\Users\Administrator\Downloads\algodatta_fix_api_exports_20250828\scripts"
   .\apply_fix_api_exports.ps1 -RepoRoot "E:\ShreeDattaTech\AlgoApp1"

3) Re-run your Jenkins pipeline.

Notes
-----
- If your app relies on a separate backend origin, set `NEXT_PUBLIC_API_BASE_URL` in the environment.
  Otherwise `/api/*` calls will use same-origin (kept intact).
