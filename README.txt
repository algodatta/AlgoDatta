
algodatta_fix_api_exports_v3_20250828
-------------------------------------

What this patch does
- Fixes lib/api.ts to export: apiBase, getToken, authHeaders, apiFetch, apiJson, apiGet, apiPost, apiPut, apiDelete.
- Ensures apiFetch has a proper return type: Promise<Response>.
- Patches app/admin/page.tsx to type `res: Response` if needed, eliminating the `'res' is of type 'unknown'` error.

How to apply (Windows PowerShell)
1) Unzip this folder somewhere (e.g., C:\Users\Administrator\Downloads\algodatta_fix_api_exports_v3_20250828).
2) Open PowerShell and run:
   Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
   cd C:\Users\Administrator\Downloads\algodatta_fix_api_exports_v3_20250828\scripts
   .\apply_fix_api_exports_v3.ps1 -RepoRoot "E:\ShreeDattaTech\AlgoApp1"

3) Commit the changes and re-run your Jenkins job.

Environment
- If your backend runs on a different origin, set NEXT_PUBLIC_API_BASE_URL to the API root (e.g., https://api.algodatta.com).
  Otherwise, relative paths (same-origin) will be used.

Manual apply (if you prefer)
- Replace your repository file: lib/api.ts with the one in this package.
- In app/admin/page.tsx, change:
    const res = await apiFetch(...)
  to:
    const res: Response = await apiFetch(...)
  if your editor/TS still complains.

Notes
- Pages that import { apiBase, authHeaders, getToken } from '../../lib/api' or '../../../lib/api'
  will now succeed because these symbols are actually exported.
- You can also import the default export for apiFetch:
    import apiFetch from '../../lib/api';
