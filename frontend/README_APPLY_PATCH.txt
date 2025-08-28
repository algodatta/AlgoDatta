# algodatta_fix_frontend_paths_20250828

This patch fixes the build errors by:
1) Correcting `RequireAuth` import paths in *all* section layouts.
2) Adding `frontend/lib/api.ts` and pointing `admin/page.tsx` to it.
3) (Optional) Removing an accidental nested `frontend/frontend` folder if it exists.

## Apply (Windows PowerShell)

1. Extract this zip somewhere, e.g. `C:\Users\Administrator\Downloads\algodatta_fix_frontend_paths_20250828`.
2. Copy files into your repo:

    ```powershell
    $repo = "E:\ShreeDattaTech\AlgoApp1"
    Copy-Item "$PWD\frontend\admin\layout.tsx"            -Destination "$repo\frontend\admin\layout.tsx"            -Force
    Copy-Item "$PWD\frontend\dashboard\layout.tsx"        -Destination "$repo\frontend\dashboard\layout.tsx"        -Force
    Copy-Item "$PWD\frontend\executions\layout.tsx"       -Destination "$repo\frontend\executions\layout.tsx"       -Force
    Copy-Item "$PWD\frontend\orders\layout.tsx"           -Destination "$repo\frontend\orders\layout.tsx"           -Force
    Copy-Item "$PWD\frontend\reports\layout.tsx"          -Destination "$repo\frontend\reports\layout.tsx"          -Force
    Copy-Item "$PWD\frontend\strategies\layout.tsx"       -Destination "$repo\frontend\strategies\layout.tsx"       -Force
    New-Item -ItemType Directory "$repo\frontend\lib" -Force | Out-Null
    Copy-Item "$PWD\frontend\lib\api.ts"                   -Destination "$repo\frontend\lib\api.ts"                  -Force
    Copy-Item "$PWD\frontend\admin\page.tsx"              -Destination "$repo\frontend\admin\page.tsx"              -Force
    ```

3. (Optional) Remove stray nested folder if present:

    ```powershell
    if (Test-Path "E:\ShreeDattaTech\AlgoApp1\frontend\frontend") {
      Remove-Item -Recurse -Force "E:\ShreeDattaTech\AlgoApp1\frontend\frontend"
    }
    ```

4. Commit & push:

    ```powershell
    cd E:\ShreeDattaTech\AlgoApp1
    git add frontend/admin/layout.tsx `
            frontend/dashboard/layout.tsx `
            frontend/executions/layout.tsx `
            frontend/orders/layout.tsx `
            frontend/reports/layout.tsx `
            frontend/strategies/layout.tsx `
            frontend/lib/api.ts `
            frontend/admin/page.tsx
    git rm -r --cached frontend/frontend 2>$null
    git commit -m "fix(frontend): correct RequireAuth imports, add lib/api, fix admin page import path"
    git push
    ```

5. Re-run Jenkins.
