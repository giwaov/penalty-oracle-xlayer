$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $PSScriptRoot
$frontendRoot = Join-Path $projectRoot "frontend"

& (Join-Path $PSScriptRoot "build-vercel-output.ps1")

Push-Location $frontendRoot
try {
  vercel deploy --prebuilt --prod --yes
} finally {
  Pop-Location
}
