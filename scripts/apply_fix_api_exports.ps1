
param(
  [Parameter(Mandatory=$true)]
  [string]$RepoRoot
)

$ErrorActionPreference = "Stop"

function Write-Info($msg){ Write-Host "[patch] $msg" -ForegroundColor Cyan }

# 1) Ensure lib/ exists and drop in api.ts
$lib = Join-Path $RepoRoot "lib"
if(!(Test-Path $lib)){ New-Item -ItemType Directory -Force -Path $lib | Out-Null }
Copy-Item -Force (Join-Path $PSScriptRoot "..\lib\api.ts") (Join-Path $lib "api.ts")
Write-Info "Updated lib\api.ts"

# 2) Type fix in app\admin\page.tsx (makes res a Response)
$adminPage = Join-Path $RepoRoot "app\admin\page.tsx"
if(Test-Path $adminPage){
  $content = Get-Content -Raw $adminPage
  $fixed = [System.Text.RegularExpressions.Regex]::Replace(
    $content,
    'const\s+res\s*=\s*await\s+apiFetch\(',
    'const res: Response = await apiFetch('
  )
  if($fixed -ne $content){
    Set-Content -Path $adminPage -Value $fixed -NoNewline
    Write-Info "Adjusted type in app\admin\page.tsx"
  } else {
    Write-Info "app\admin\page.tsx already typed"
  }
} else {
  Write-Info "app\admin\page.tsx not found (skipping type tweak)"
}

# 3) Commit & push
Push-Location $RepoRoot
git add lib/api.ts 2>$null
if(Test-Path $adminPage){ git add app/admin/page.tsx 2>$null }
git commit -m "fix(frontend): export apiBase/getToken/authHeaders; type admin res" 2>$null
git push
Pop-Location

Write-Info "Done."
