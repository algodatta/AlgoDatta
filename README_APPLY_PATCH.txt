AlgoDatta – Frontend patch (RequireAuth import + lib/api.ts)

WHAT THIS FIXES
- ./frontend/admin/layout.tsx now imports RequireAuth from ../components/RequireAuth (correct path).
- Adds ./frontend/lib/api.ts so imports like ../lib/api resolve.
- Optional: removes stray ./frontend/frontend folder if it exists.
- Optional: adjusts admin/page.tsx import from "../../lib/api" -> "../lib/api".

WINDOWS QUICK APPLY (PowerShell):
  1) Right–click Start → Windows PowerShell (Admin)
  2) Run:
     Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
     cd "C:\Users\Administrator\Downloads"
     # Unzip this package somewhere, then run:
     .\algodatta_frontend_auth_api_fix_20250828\scripts\apply_patch.ps1 -RepoRoot "E:\ShreeDattaTech\AlgoApp1"

  The script will copy files, clean the stray folder, commit, and push.

MANUAL COPY (if you prefer)
  Copy these files into your repo:
    - frontend\admin\layout.tsx  →  E:\ShreeDattaTech\AlgoApp1\frontend\admin\layout.tsx
    - frontend\lib\api.ts        →  E:\ShreeDattaTech\AlgoApp1\frontend\lib\api.ts
  (Create the lib folder if it doesn’t exist.)

  Optional: Fix admin/page.tsx import line
    from:  import { apiFetch } from "../../lib/api"
    to:    import { apiFetch } from "../lib/api"

  Optional: Remove stray folder if present
    E:\ShreeDattaTech\AlgoApp1\frontend\frontend

  Then commit & push:
    cd E:\ShreeDattaTech\AlgoApp1
    git add frontend/admin/layout.tsx frontend/lib/api.ts frontend/admin/page.tsx
    git rm -r --cached frontend/frontend  # only if it exists
    git commit -m "fix(frontend): RequireAuth import path; add lib/api; correct admin page import; remove nested frontend/"
    git push

NEXT STEPS
  - Re-run your Jenkins pipeline. It should pass the previous TypeScript error.
  - If another file complains about a missing lib/api, the new file covers it.
  - If anything else pops up, share the Jenkins log line and I’ll ship a follow-up patch.