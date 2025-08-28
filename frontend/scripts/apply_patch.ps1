\
    Param(
      [string]$RepoRoot = "E:\ShreeDattaTech\AlgoApp1"
    )

    Write-Host "Applying patch to $RepoRoot" -ForegroundColor Cyan

    $srcRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
    $pkgRoot = Split-Path -Parent $srcRoot

    # 1) Remove accidental nested frontend\frontend if present
    $nested = Join-Path $RepoRoot "frontend\frontend"
    if (Test-Path $nested) {
      Write-Host "Removing stray folder: $nested" -ForegroundColor Yellow
      Remove-Item -Recurse -Force $nested
    }

    # 2) Copy fixed admin layout
    $dstLayoutDir = Join-Path $RepoRoot "frontend\admin"
    if (!(Test-Path $dstLayoutDir)) { New-Item -ItemType Directory $dstLayoutDir | Out-Null }
    Copy-Item -Force (Join-Path $pkgRoot "frontend\admin\layout.tsx") $dstLayoutDir

    # 3) Copy lib\api.ts
    $dstLibDir = Join-Path $RepoRoot "frontend\lib"
    if (!(Test-Path $dstLibDir)) { New-Item -ItemType Directory $dstLibDir | Out-Null }
    Copy-Item -Force (Join-Path $pkgRoot "frontend\lib\api.ts") $dstLibDir

    # 4) Fix import path in admin\page.tsx if it still points to ../../lib/api
    $adminPage = Join-Path $RepoRoot "frontend\admin\page.tsx"
    if (Test-Path $adminPage) {
      $content = Get-Content $adminPage -Raw
      $newContent = $content -replace "\.\./\.\./lib/api", "../lib/api"
      if ($newContent -ne $content) {
        Write-Host "Updated import in admin\page.tsx" -ForegroundColor Green
        Set-Content -Path $adminPage -Value $newContent -Encoding UTF8
      } else {
        Write-Host "admin\page.tsx import looks correct already" -ForegroundColor Green
      }
    } else {
      Write-Host "admin\page.tsx not found — skipping import fix" -ForegroundColor Yellow
    }

    # 5) Git commit
    Push-Location $RepoRoot
    git add frontend/admin/layout.tsx frontend/lib/api.ts 2>$null
    if (Test-Path "$RepoRoot\frontend\frontend") {
      git rm -r --cached frontend/frontend 2>$null
    }
    git commit -m "fix(frontend): RequireAuth import path; add lib/api; correct admin page import; remove nested frontend/" || Write-Host "Nothing to commit" -ForegroundColor Yellow
    git push
    Pop-Location

    Write-Host "Patch applied." -ForegroundColor Cyan