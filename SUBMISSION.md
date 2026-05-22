# X Cup Hackathon Submission Draft

## Project Name

XKick

## Track

AI Agent / GameFi / Social / Fan engagement

## Summary

XKick is a World Cup AI shootout game on X Layer. Fans connect a wallet, join one of the 48 qualified World Cup squads, take five daily on-chain penalties, and compete through fan passports, wallet-vs-wallet ranking, daily races, squad leaderboards, live arena events, and AI Oracle match reports.

## What I Built

- X Layer Solidity contract for squad membership, wallet registration, daily penalties, scoring, streaks, daily wallet stats, and country stats
- Static Vercel frontend for nontechnical users
- Practice Mode so visitors can test the shootout without wallet friction
- Live Arena Feed that indexes recent `PenaltyTaken` events and links to X Layer explorer transactions
- AI Oracle Agent API using OpenAI when configured, with deterministic fallback commentary
- Oracle Insights panel for live squad momentum and conversion patterns
- AI Match Report card that turns every real shot into a shareable X post tagging `@XLayerOfficial`
- Today's Race panel with top wallet, top squad, and countdown to the UTC reset
- Full 48-team qualified World Cup squad list based on FIFA's published qualified-team field

## How It Functions

The user opens the app, tries Practice Mode if they do not have gas, connects an EVM wallet, switches to X Layer mainnet, chooses a country squad, and takes up to five penalties per UTC day. The contract registers the wallet, calculates the keeper dive from current on-chain state, awards points, updates fan, daily race, and squad records, and emits a public event. The frontend reads contract state and events back into player rankings, squad rankings, a live activity feed, today's race, and Oracle Agent narration.

## X Layer Integration

- Contract deployed on X Layer mainnet
- Chain ID: `196`
- Contract: `0xAC40CBeaDa2ED563c2B49443E61A174269d88ce5`
- Explorer: https://www.okx.com/web3/explorer/xlayer/address/0xAC40CBeaDa2ED563c2B49443E61A174269d88ce5
- Core game actions are on-chain: squad join and daily penalty

## Proof Of Work

- Demo URL: https://xkick.vercel.app
- Contract address: `0xAC40CBeaDa2ED563c2B49443E61A174269d88ce5`
- GitHub repository: https://github.com/giwaov/penalty-oracle-xlayer
- X account: TBD
- Demo video: TBD

## Why It Matters

World Cup traffic is emotional, daily, and global. XKick gives fans a simple football ritual that creates real X Layer activity: join a squad, shoot up to five times per day, build streaks, climb the player board, chase the daily reset, share the AI match report, and watch country momentum shift in public. Practice Mode lowers the entry barrier, while the live feed and AI agent make the product feel active even before a user connects a wallet.

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
