# Polly — Features (prioritized)

## P0 — Must ship for submission

| # | Feature | Why P0 |
|---|---|---|
| 1 | Watchlist CRUD (add/remove tickers) | Without it, nothing to trade |
| 2 | All 5 agents (Scout, News, Strategist, Risk, Executor) running on cron every 5 min | The product itself |
| 3 | Alpaca paper trading execution | The "trade actually fires" demo moment |
| 4 | Live agent message feed (SSE) | Shows the swarm in action |
| 5 | P&L dashboard + positions grid | Shows the result |
| 6 | Speechmatics live audio → urgent cycle | THE hero feature for the demo |
| 7 | Featherless News Reader (domain-specialized) | Featherless prize eligibility |
| 8 | Vultr deployment with public URL | Vultr prize eligibility (mandatory) |
| 9 | MIT license + reproducible setup README | Featherless prize requirement |
| 10 | Open-source repo on GitHub | Submission requirement |

## P1 — Ship if time permits (most by Day 5)

| # | Feature | Why P1 |
|---|---|---|
| 11 | 3D trading floor (React Three Fiber) | Demo wow factor; differentiates from other agent demos |
| 12 | Narrator agent (plain-English commentary) | Makes demo intelligible to non-quant judges |
| 13 | Conviction meter (radial gauge) per Strategist thesis | Visual storytelling |
| 14 | Live audio transcript panel with speaker diarization | Showcases Speechmatics' diarization |
| 15 | Trade chain visualization (Strategist → Risk → Executor) | Shows decision tree |
| 16 | Equity curve animation (Framer Motion) | Polish |
| 17 | Auto-tweet build progress | Social visibility |

## P2 — Stretch (only if Day 5 PM is clear)

| # | Feature | Why P2 |
|---|---|---|
| 18 | Backtest mode (replay historical day) | Cool but not central |
| 19 | Voice command mode ("Polly, show me NVDA") | Showmanship |
| 20 | Public leaderboard (multi-tenant) | Distribution play, post-hackathon |
| 21 | News heatmap (geographic) | Decoration |
| 22 | Strategy customization UI (slider for risk tolerance) | Power-user feature |

## P3 — Post-hackathon roadmap

| # | Feature |
|---|---|
| 23 | Live Bloomberg/CNBC stream ingestion (not pre-recorded) |
| 24 | Multi-portfolio support |
| 25 | Mobile companion app (React Native) |
| 26 | Slack/Discord webhook integrations for trade alerts |
| 27 | Fine-tuned News Reader on a curated financial corpus |
| 28 | Cloud-deployed multi-tenant version (Polly Cloud) |
| 29 | Integration with real trading APIs (regulatory pathway) |

## Feature → demo-narrative map

The 3-minute demo video features will reference these in order:

1. **Opening:** P0 #1, #2, #3 — show watchlist, agents running, paper trades on Alpaca
2. **Hero moment (0:45–2:00):** P0 #6 — play Fed speech → live transcript → catalyst detection → urgent cycle → trade fires
3. **Polish:** P1 #11, #12, #13 — 3D floor, narrator commentary, conviction meter
4. **Sponsor callouts:** P0 #7, #8, #9, #10 — Featherless, Vultr, MIT, open-source

## Bug bar

P0 features must have:
- Loading state (skeleton, not spinner)
- Error state (toast or inline message)
- Empty state (illustration + CTA)
- Mobile responsive (320px–2560px)
- Keyboard accessible
- `prefers-reduced-motion` respected

P1 features can ship without all the above if time-constrained — but the demo recording should avoid the missing states.

## Performance bar (P0 only)

- Dashboard initial load: < 2.5s LCP
- SSE message latency: < 200ms
- Audio-to-trade end-to-end: < 5s
- API endpoints: < 500ms p95
