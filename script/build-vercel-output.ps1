$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $PSScriptRoot
$frontendRoot = Join-Path $projectRoot "frontend"
$vercelRoot = Join-Path $frontendRoot ".vercel"
$outputRoot = Join-Path $vercelRoot "output"
$staticRoot = Join-Path $outputRoot "static"

$resolvedFrontend = (Resolve-Path $frontendRoot).Path

if (Test-Path $outputRoot) {
  $resolvedOutput = (Resolve-Path $outputRoot).Path
  if (-not $resolvedOutput.StartsWith($resolvedFrontend)) {
    throw "Refusing to remove output outside frontend root: $resolvedOutput"
  }
  Remove-Item -LiteralPath $resolvedOutput -Recurse -Force
}

New-Item -ItemType Directory -Force -Path $staticRoot | Out-Null

$files = @("index.html", "styles.css", "app.js", "config.js", "artifact.js", "vercel.json", "package.json")
foreach ($file in $files) {
  Copy-Item -LiteralPath (Join-Path $frontendRoot $file) -Destination (Join-Path $staticRoot $file) -Force
}

$assetsRoot = Join-Path $frontendRoot "assets"
if (Test-Path $assetsRoot) {
  Copy-Item -LiteralPath $assetsRoot -Destination (Join-Path $staticRoot "assets") -Recurse -Force
}

$apiRoot = Join-Path $frontendRoot "api"
if (Test-Path (Join-Path $apiRoot "oracle.js")) {
  $functionRoot = Join-Path $outputRoot "functions\api\oracle.func"
  New-Item -ItemType Directory -Force -Path $functionRoot | Out-Null
  Copy-Item -LiteralPath (Join-Path $apiRoot "oracle.js") -Destination (Join-Path $functionRoot "index.js") -Force
  $functionConfig = @{
    runtime = "nodejs20.x"
    handler = "index.js"
    launcherType = "Nodejs"
  } | ConvertTo-Json -Depth 5
  Set-Content -Path (Join-Path $functionRoot ".vc-config.json") -Value $functionConfig -NoNewline
}

$config = @{
  version = 3
  routes = @(
    @{
      src = "/(.*)"
      headers = @{
        "X-Content-Type-Options" = "nosniff"
      }
      continue = $true
    }
  )
} | ConvertTo-Json -Depth 10

Set-Content -Path (Join-Path $outputRoot "config.json") -Value $config -NoNewline

Write-Host "Built Vercel static output at $outputRoot"
