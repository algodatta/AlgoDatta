algodatta_fix_api_exports_v2_20250828
====================================

This patch fixes the remaining frontend build errors:

1) Adds named exports from lib/api.ts:
   - apiBase, getToken, authHeaders
   - apiFetch(): Promise<Response>
   - apiJson/apiGet/apiPost/apiPut/apiDelete

2) Types the `res` variable in app/admin/page.tsx so TS stops treating it as `unknown`.

HOW TO APPLY (Windows):

1) Unzip this folder somewhere, e.g.
   C:\Users\Administrator\Downloads\algodatta_fix_api_exports_v2_20250828\

2) Open PowerShell and run:

   Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
   cd "C:\Users\Administrator\Downloads\algodatta_fix_api_exports_v2_20250828\scripts"
   .\apply_fix_api_exports_v2.ps1 -RepoRoot "E:\ShreeDattaTech\AlgoApp1"

3) Re-run your Jenkins job.

NOTES:
- If your API is on a separate origin, set NEXT_PUBLIC_API_BASE_URL to the absolute base URL
  (e.g. https://api.example.com). Otherwise, relative paths keep using same-origin.
- The token lookup checks localStorage keys: algodatta_token, token, access_token.
  It also falls back to a 'token' cookie if present.
