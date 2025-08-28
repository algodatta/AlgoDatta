
param(
  [Parameter(Mandatory=$true)]
  [string]$RepoRoot
)

Write-Host "Applying algodatta_fix_api_exports_v3 (lib/api.ts + admin/page.tsx typing)..." -ForegroundColor Cyan

# 1) Copy lib/api.ts
$targetLib = Join-Path $RepoRoot "lib\api.ts"
$sourceLib = Join-Path $PSScriptRoot "..\lib\api.ts"

if (!(Test-Path (Split-Path $targetLib))) {
  New-Item -ItemType Directory -Path (Split-Path $targetLib) -Force | Out-Null
}

Copy-Item -Path $sourceLib -Destination $targetLib -Force
Write-Host "Updated: $targetLib" -ForegroundColor Green

# 2) Patch app/admin/page.tsx so 'res' is typed as Response (if needed)
$adminPage = Join-Path $RepoRoot "app\admin\page.tsx"
if (Test-Path $adminPage) {
  $content = Get-Content $adminPage -Raw

  # Ensure apiFetch import exists
  if ($content -notmatch "from\s+['""]\.\.\/\.\.\/lib\/api['""]") {
    # Try to add the import (safe no-op if project already imports it elsewhere)
    $content = $content -replace '("use client";\s*)', "`$1import { apiFetch } from ""../../lib/api"";`r`n"
  }

  # If TypeScript thinks 'res' is unknown, we can add an explicit type annotation on the variable
  # Replace 'const res = await apiFetch(' with 'const res: Response = await apiFetch('
  $content = $content -replace 'const\s+res\s*=\s*await\s+apiFetch\(', 'const res: Response = await apiFetch('

  Set-Content -Path $adminPage -Value $content -Encoding UTF8
  Write-Host "Patched: $adminPage" -ForegroundColor Green
} else {
  Write-Warning "app\admin\page.tsx not found. Skipped typing patch."
}

Write-Host "Done. Commit changes and re-run your pipeline." -ForegroundColor Cyan
