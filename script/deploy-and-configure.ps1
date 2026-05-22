param(
  [ValidateSet("testnet", "mainnet")]
  [string]$Network = "testnet"
)

$ErrorActionPreference = "Stop"

if (-not $env:PRIVATE_KEY) {
  throw "Set PRIVATE_KEY in the current shell before deploying."
}

$projectRoot = Split-Path -Parent $PSScriptRoot
$configPath = Join-Path $projectRoot "frontend\config.js"

$rpc = if ($Network -eq "mainnet") {
  "https://rpc.xlayer.tech"
} else {
  "https://testrpc.xlayer.tech/terigon"
}

$chainId = if ($Network -eq "mainnet") { 196 } else { 1952 }

Push-Location $projectRoot
try {
  $output = forge create `
    --rpc-url $rpc `
    --private-key $env:PRIVATE_KEY `
    --broadcast `
    contracts/XCupOracleArena.sol:XCupOracleArena 2>&1

  $output | ForEach-Object { Write-Host $_ }

  $addressLine = $output | Where-Object { $_ -match "Deployed to:\s*(0x[a-fA-F0-9]{40})" } | Select-Object -Last 1
  if (-not $addressLine) {
    throw "Deployment succeeded or failed without a parseable contract address."
  }

  $contractAddress = [regex]::Match($addressLine, "0x[a-fA-F0-9]{40}").Value
  $config = Get-Content $configPath -Raw
  $config = $config -replace 'contractAddress:\s*"[a-fA-F0-9x]*"', "contractAddress: `"$contractAddress`""
  $config = $config -replace 'preferredChainId:\s*\d+', "preferredChainId: $chainId"
  Set-Content -Path $configPath -Value $config -NoNewline

  Write-Host ""
  Write-Host "Configured frontend contractAddress=$contractAddress preferredChainId=$chainId"
} finally {
  Pop-Location
}
