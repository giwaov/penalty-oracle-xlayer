# Production Launch Runbook

Goal: a public Vercel URL that judges and nontechnical users can open, try, and verify on X Layer.

## Current Production

- Demo: https://xkick.vercel.app
- X Layer contract: `0x0C3bf4A6c9A1C90FCc6264558305979F1cD54d39`
- Explorer: https://www.okx.com/web3/explorer/xlayer/address/0x0C3bf4A6c9A1C90FCc6264558305979F1cD54d39

## What Must Be Live

1. Smart contract deployed on X Layer mainnet.
2. `frontend/config.js` set to the contract address.
3. Vercel production deployment published.
4. `OPENAI_API_KEY` added to Vercel if AI commentary should use OpenAI.
5. Practice Mode available for users without OKB gas.

## 1. Set Deployer Wallet Locally

Do not commit private keys.

```powershell
cd C:\Users\DELL\aibtc-godmode\submissions\x-cup-oracle-arena
$env:PRIVATE_KEY="0xYOUR_PRIVATE_KEY"
```

## 2. Deploy Contract

Mainnet:

```powershell
.\script\deploy.ps1 -Network mainnet
```

After deployment, update:

```text
frontend/config.js
```

## 3. Configure AI Oracle On Vercel

Add:

```text
OPENAI_API_KEY
```

Optional:

```text
OPENAI_MODEL
```

The serverless function falls back to deterministic commentary if OpenAI is unavailable.

## 4. Publish Frontend

```powershell
.\script\publish-vercel.ps1
```

The script builds `.vercel/output` and deploys a prebuilt static app plus `/api/oracle`.

## 5. Public Testing Flow

Visitors can:

- open the Vercel URL
- run Practice Mode without a wallet
- connect OKX Wallet or another EVM wallet
- switch to X Layer mainnet
- choose a World Cup squad
- take up to five daily on-chain penalties
- inspect the transaction from the status link or Live Arena Feed

## 6. Final Hackathon Tasks

- Publish GitHub repository
- Create dedicated X account
- Post build updates tagging `@XLayerOfficial`
- Record 1-3 minute demo video
- Submit before May 28, 2026 23:59 UTC
