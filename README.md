# Penalty Oracle

Penalty Oracle is a World Cup AI shootout game built for the X Layer Build X Hackathon. Fans connect a wallet, choose one of the 48 qualified World Cup squads, take one on-chain penalty per day, and compete on a live country leaderboard.

Live demo: https://frontend-liart-two-92.vercel.app

GitHub: https://github.com/giwaov/penalty-oracle-xlayer

X Layer contract: `0x6698Ac4582BD9b657236766bDae5995ac3B75284`

## What It Does

- Lets fans join a country squad on X Layer
- Records one daily penalty per wallet
- Awards points for goals, streaks, and saved-shot grit
- Shows a live leaderboard for all 48 qualified World Cup teams
- Streams recent on-chain penalties from contract events
- Uses an AI Oracle Agent for short match-style commentary and momentum insights
- Includes Practice Mode so nontechnical users can try the flow without gas

## Hackathon Fit

- World Cup theme: country squads, penalties, fan streaks, live tournament energy
- X Layer deployment: the core game contract is deployed on X Layer mainnet
- AI Agent track: OpenAI-backed Oracle commentary plus deterministic fallback
- GameFi/social track: daily fan actions, leaderboards, shareable fan passports
- Market potential: simple, repeatable match-day behavior that turns football attention into X Layer transactions

The squad list follows FIFA's published 48-team qualified field for World Cup 2026:
https://www.fifa.com/en/articles/world-cup-2026-who-has-qualified

## Repository Layout

```text
submissions/x-cup-oracle-arena/
  contracts/XCupOracleArena.sol
  test/XCupOracleArena.t.sol
  frontend/index.html
  frontend/styles.css
  frontend/app.js
  frontend/config.js
  frontend/api/oracle.js
  script/deploy.ps1
  script/build-vercel-output.ps1
  script/publish-vercel.ps1
  foundry.toml
  SUBMISSION.md
```

## X Layer Network

Mainnet:

- Chain ID: `196`
- RPC: `https://rpc.xlayer.tech`
- Explorer: `https://www.okx.com/web3/explorer/xlayer`
- Gas token: OKB

Testnet:

- Chain ID: `1952`
- RPC: `https://testrpc.xlayer.tech/terigon`
- Explorer: `https://www.okx.com/web3/explorer/xlayer-test`
- Gas token: OKB

## Build

```powershell
cd C:\Users\DELL\aibtc-godmode\submissions\x-cup-oracle-arena
forge build
```

## Test

```powershell
cd C:\Users\DELL\aibtc-godmode\submissions\x-cup-oracle-arena
forge test -vv
```

## Deploy Contract

Set a deployer private key in the current shell. Do not commit it.

```powershell
$env:PRIVATE_KEY="0x..."
.\script\deploy.ps1 -Network mainnet
```

After deployment, set the address in:

```text
frontend/config.js
```

## Publish Frontend

```powershell
.\script\publish-vercel.ps1
```

The app is deployed as a prebuilt Vercel static output with a serverless `/api/oracle` function.

## AI Oracle Setup

Add this Vercel environment variable for production:

```text
OPENAI_API_KEY
```

Optional:

```text
OPENAI_MODEL
```

If no API key is present, the app still works with deterministic fallback commentary.

## User Flow

1. Open the Vercel URL.
2. Try Practice Mode with no wallet.
3. Connect OKX Wallet or another EVM wallet.
4. Switch to X Layer mainnet.
5. Pick a qualified World Cup squad.
6. Take one daily penalty.
7. Watch the fan passport, live feed, and country leaderboard update.

## Notes

This MVP has no custody, betting, payouts, or monetary rewards. The keeper dive is suitable for a no-prize fan game. If real rewards are added later, randomness should move to commit-reveal or a verifiable randomness source.
