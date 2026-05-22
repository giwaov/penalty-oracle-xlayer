# X Cup Hackathon Submission Draft

## Project Name

XKick

## Track

AI Agent / GameFi / Social / Fan engagement

## Summary

XKick is a World Cup AI shootout game on X Layer. Fans connect a wallet, join one of the 48 qualified World Cup squads, take five daily on-chain penalties, and compete through fan passports, squad leaderboards, live arena events, and AI Oracle commentary.

## What I Built

- X Layer Solidity contract for squad membership, daily penalties, scoring, streaks, and country stats
- Static Vercel frontend for nontechnical users
- Practice Mode so visitors can test the shootout without wallet friction
- Live Arena Feed that indexes recent `PenaltyTaken` events and links to X Layer explorer transactions
- AI Oracle Agent API using OpenAI when configured, with deterministic fallback commentary
- Oracle Insights panel for live squad momentum and conversion patterns
- Full 48-team qualified World Cup squad list based on FIFA's published qualified-team field

## How It Functions

The user opens the app, tries Practice Mode if they do not have gas, connects an EVM wallet, switches to X Layer mainnet, chooses a country squad, and takes up to five penalties per UTC day. The contract calculates the keeper dive from current on-chain state, awards points, updates fan and squad records, and emits a public event. The frontend reads those events back into a live activity feed and uses the Oracle Agent to narrate the arena.

## X Layer Integration

- Contract deployed on X Layer mainnet
- Chain ID: `196`
- Contract: `0x0C3bf4A6c9A1C90FCc6264558305979F1cD54d39`
- Explorer: https://www.okx.com/web3/explorer/xlayer/address/0x0C3bf4A6c9A1C90FCc6264558305979F1cD54d39
- Core game actions are on-chain: squad join and daily penalty

## Proof Of Work

- Demo URL: https://xkick.vercel.app
- Contract address: `0x0C3bf4A6c9A1C90FCc6264558305979F1cD54d39`
- GitHub repository: https://github.com/giwaov/penalty-oracle-xlayer
- X account: TBD
- Demo video: TBD

## Why It Matters

World Cup traffic is emotional, daily, and global. XKick gives fans a simple football ritual that creates real X Layer activity: join a squad, shoot up to five times per day, build streaks, share the result, and watch country momentum shift in public. Practice Mode lowers the entry barrier, while the live feed and AI agent make the product feel active even before a user connects a wallet.

## Submission Checklist

- [x] Deploy contract on X Layer mainnet
- [x] Update `frontend/config.js` with deployed address
- [x] Publish public Vercel demo
- [x] Add AI Oracle backend
- [x] Add Practice Mode for nontechnical testing
- [x] Add live on-chain activity feed
- [x] Publish public GitHub repository
- [ ] Create dedicated X account
- [ ] Post submission tagging `@XLayerOfficial`
- [ ] Record 1-3 minute demo video
- [ ] Submit Google Form before May 28, 2026 23:59 UTC
