
param(
  [Parameter(Mandatory=$true)]
  [string]$RepoRoot
)
Write-Host "==> Applying algodatta_fix_api_exports_v2 to $RepoRoot" -ForegroundColor Cyan

# 1) Copy lib/api.ts
$srcApi = Join-Path $PSScriptRoot "..\lib\api.ts"
$dstApi = Join-Path $RepoRoot "lib\api.ts"
if (-not (Test-Path (Split-Path $dstApi))) {
  New-Item -ItemType Directory -Force -Path (Split-Path $dstApi) | Out-Null
}
Copy-Item -Force $srcApi $dstApi
Write-Host " - Updated lib\api.ts"

# 2) Ensure admin page uses 'Response' type for apiFetch result
$adminPage = Join-Path $RepoRoot "app\admin\page.tsx"
if (Test-Path $adminPage) {
  $content = Get-Content $adminPage -Raw
  $updated = $content -replace 'const\s+res\s*=\s*await\s+apiFetch\(', 'const res: Response = await apiFetch('
  if ($updated -ne $content) {
    Set-Content -Path $adminPage -Value $updated -NoNewline
    Write-Host " - Patched app\admin\page.tsx (typed apiFetch result)"
  } else {
    Write-Host " - app\admin\page.tsx already typed (no change)"
  }
} else {
  Write-Warning " - app\admin\page.tsx not found (skipped)"
}

# 3) (Optional) Patch RequireAuth import use of getToken if compile warned previously
$requireAuth = Join-Path $RepoRoot "components\RequireAuth.tsx"
if (Test-Path $requireAuth) {
  $c = Get-Content $requireAuth -Raw
  if ($c -match "from\s+'../lib/api'") {
    # no-op; just a sanity message
    Write-Host " - components\RequireAuth.tsx imports ../lib/api (OK)"
  }
}

# 4) Git commit
Push-Location $RepoRoot
try {
  git add lib/api.ts app/admin/page.tsx | Out-Null
  $status = git status --porcelain
  if ($status) {
    git commit -m "fix(frontend): export apiBase/authHeaders/getToken and type apiFetch result" | Out-Null
    Write-Host " - Git commit created"
    try {
      git push | Out-Null
      Write-Host " - Pushed to origin"
    } catch {
      Write-Warning " - Push failed (check credentials); changes are committed locally."
    }
  } else {
    Write-Host " - Nothing to commit"
  }
} finally {
  Pop-Location
}
Write-Host "==> Done." -ForegroundColor Green
