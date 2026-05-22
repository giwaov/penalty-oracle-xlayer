param(
  [ValidateSet("testnet", "mainnet")]
  [string]$Network = "testnet"
)

$ErrorActionPreference = "Stop"

if (-not $env:PRIVATE_KEY) {
  throw "Set PRIVATE_KEY in the current shell before deploying."
}

$rpc = if ($Network -eq "mainnet") {
  "https://rpc.xlayer.tech"
} else {
  "https://testrpc.xlayer.tech/terigon"
}

forge create `
  --rpc-url $rpc `
  --private-key $env:PRIVATE_KEY `
  --broadcast `
  contracts/XCupOracleArena.sol:XCupOracleArena
