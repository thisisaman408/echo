# Polly — System Design

## Architecture overview (ASCII)

```
┌──────────────────────────────────────────────────────────────────────┐
│  POLLY DASHBOARD · Next.js 16 + shadcn + Tailwind v4 + Framer        │
│                                                                       │
│  ┌──────────────┐  ┌────────────────────┐  ┌─────────────────────┐   │
│  │ 3D TRADING   │  │ LIVE AGENT CHAT    │  │ P&L Equity Curve    │   │
│  │ FLOOR (R3F)  │  │ (5 agents debate   │  │ + Positions Grid    │   │
│  │ 5 animated   │  │  in real time)     │  │ + Order Book        │   │
│  │ avatars      │  │                    │  │                     │   │
│  └──────────────┘  └────────────────────┘  └─────────────────────┘   │
│  ┌─────────────────────────────────────────────────────────────────┐ │
│  │ 🎙 LIVE AUDIO TRANSCRIPT (Speechmatics)                         │ │
│  │   "Federal Reserve Chair... raising rates by 25 basis points…"  │ │
│  │   → catalyst detected: HAWKISH FED                              │ │
│  │   → Strategist updating thesis on rate-sensitive tickers...     │ │
│  └─────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────┬────────────────────────────────────────┘
                              │ Server-Sent Events (live stream)
                              ▼
┌──────────────────────────────────────────────────────────────────────┐
│  AUDIO INGESTION LAYER  ·  Speechmatics RT API (sponsor)              │
│                                                                       │
│  ┌────────────────────────────────────────────────────────────────┐  │
│  │  Audio source (YouTube live Fed feed / pre-recorded earnings)  │  │
│  │     ↓                                                           │  │
│  │  Speechmatics streaming WebSocket → live transcript chunks      │  │
│  │     ↓                                                           │  │
│  │  Speaker diarization (CEO vs analyst question)                  │  │
│  └────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────┬────────────────────────────────────────┘
                              ▼
┌──────────────────────────────────────────────────────────────────────┐
│            ORCHESTRATOR  ·  Inngest cron + event triggers             │
│                                                                       │
│   • Cron: every 5 min → run regular agent cycle                       │
│   • Event: audio catalyst fired → run urgent agent cycle              │
└──┬──────────┬─────────────┬───────────────┬────────────┬─────────────┘
   ▼          ▼             ▼               ▼            ▼
┌──────┐ ┌──────────┐  ┌───────────┐ ┌────────────┐ ┌──────────┐
│MARKET│ │  NEWS    │  │STRATEGIST │ │RISK MGR    │ │EXECUTOR  │
│SCOUT │ │  READER  │  │           │ │            │ │          │
│      │ │          │  │ Gemini    │ │ Gemini     │ │ Alpaca   │
│Gemini│ │Featherless│ │ Pro       │ │ Flash      │ │ paper    │
│Flash │ │ (+ audio │  │           │ │            │ │ API      │
│      │ │  trans-  │  │           │ │            │ │          │
│ RSI/ │ │  cripts) │  │ thesis +  │ │ pos size + │ │ places   │
│MACD/ │ │catalysts │  │conviction │ │ stop-loss  │ │ orders   │
│volume│ │sentiment │  │           │ │            │ │          │
└──┬───┘ └────┬─────┘  └─────┬─────┘ └────┬───────┘ └────┬─────┘
   │          │              │            │              │
   └──────────┴──────┬───────┴────────────┴──────────────┘
                     ▼
              ┌──────────────────────┐
              │ NARRATOR  · Gemini   │
              │ plain-English        │
              │ commentary           │
              └──────────┬───────────┘
                         │
                         ▼
              ┌─────────────────────────────────────────┐
              │  VULTR VM (sponsor — required infra)    │
              │  Ubuntu 24.04 · ~$6/month               │
              │  ├─ Next.js app (frontend + API)        │
              │  ├─ Inngest worker                      │
              │  └─ Postgres self-hosted                │
              │     ├─ positions, trades                │
              │     ├─ agent_messages                   │
              │     ├─ market_snapshots                 │
              │     ├─ audio_transcripts                │
              │     └─ pgvector (news/transcript dedup) │
              └─────────────────────────────────────────┘
```

## Data flow — regular cycle (every 5 min)

```
1. Inngest cron fires    →  Orchestrator wakes
2. Market Scout polls    →  Alpaca prices for watchlist (NVDA, TSLA, AAPL, …)
                         →  computes RSI, MACD, volume signals
                         →  posts findings to agent_messages
3. News Reader polls     →  NewsAPI + RSS + recent Speechmatics transcripts
                         →  Featherless model: extract tickers + sentiment
                         →  posts findings to agent_messages
4. Strategist reads      →  Scout + News from last 30 min
                         →  Gemini Pro: synthesize → trade thesis
                         →  conviction 0–100 + recommended action
5. Risk Manager reads    →  Strategist thesis + current portfolio state
                         →  position sizing (Kelly criterion lite)
                         →  stop-loss / take-profit calculation
                         →  veto if portfolio over-exposed
6. Executor reads        →  approved trades
                         →  places paper orders via Alpaca API
                         →  updates positions table
7. Narrator reads        →  full round of agent_messages
                         →  Gemini Flash: plain-English commentary
                         →  streams to dashboard via SSE
```

## Data flow — urgent cycle (audio catalyst event)

```
1. Speechmatics WS       →  transcript chunk arrives ("rate hike of 25bps")
2. Stream classifier     →  Featherless model detects high-importance catalyst
3. Event fires           →  Inngest "audio_catalyst" event
4. Orchestrator wakes    →  triggers an urgent cycle (skip cron wait)
5. News Reader           →  picks up the transcript chunk immediately
6. Strategist            →  thesis update with urgent: true
7. Risk Manager          →  fast-track risk check
8. Executor              →  places trades within ~3 seconds of catalyst hitting wire
9. Narrator              →  announces the chain of events on dashboard
```

This is the demo's hero moment: real-time reactive trading on audio events.

## Component breakdown

### Frontend (`apps/polly/src/app/`)

- **`/` (dashboard)** — main view, all panels above
- **`/api/sse/agents`** — SSE stream of agent messages
- **`/api/sse/transcript`** — SSE stream of Speechmatics transcripts
- **`/api/sse/positions`** — SSE stream of P&L updates
- **`/api/watchlist`** — CRUD for tickers to track
- **`/api/audio/start`** — POST: start listening to an audio source

### Backend agents (`apps/polly/src/agents/`)

- `scout.ts` — Market Scout
- `news-reader.ts` — News Reader
- `strategist.ts` — Strategist
- `risk-manager.ts` — Risk Manager
- `executor.ts` — Executor
- `narrator.ts` — Narrator
- `orchestrator.ts` — Inngest function that runs the cycle

See [`02-agents.md`](02-agents.md) for prompts and detailed behavior.

### Speechmatics integration (`apps/polly/src/audio/`)

- `speechmatics-client.ts` — WebSocket wrapper for Speechmatics RT
- `audio-sources.ts` — adapters for YouTube live audio, pre-recorded MP3, mic
- `catalyst-classifier.ts` — Featherless-powered importance classifier
- `transcript-store.ts` — Postgres insert + pgvector embedding

### Storage layer (`packages/db/`)

Drizzle schemas:

- `positions` (id, ticker, qty, avg_price, opened_at)
- `trades` (id, ticker, side, qty, price, filled_at, agent_chain_id)
- `agent_messages` (id, agent, content, parent_id, urgency, created_at)
- `market_snapshots` (id, ticker, ts, price, rsi, macd, volume)
- `audio_transcripts` (id, source, speaker, text, ts, embedding vector(1536))
- `watchlist` (id, ticker, enabled)

## Deployment topology

```
┌─────────────────────────────────────────────────────┐
│   Vultr VM (Ubuntu 24.04 · 1 vCPU · 1 GB RAM)       │
│                                                       │
│   ┌──────────────────────────────────────────────┐  │
│   │  Caddy reverse proxy                          │  │
│   │   → polly.aman.dev → :3000 (Next.js)          │  │
│   │   → admin.polly.aman.dev → :3001 (Inngest)    │  │
│   └──────────────────────────────────────────────┘  │
│                                                       │
│   ┌─────────────────────┐   ┌────────────────────┐  │
│   │  Next.js (Node 22)  │   │ Inngest dev server │  │
│   │  pm2 / systemd      │   │ pm2 / systemd      │  │
│   └─────────────────────┘   └────────────────────┘  │
│                                                       │
│   ┌──────────────────────────────────────────────┐  │
│   │  Postgres 16 + pgvector                       │  │
│   │  /var/lib/postgresql/16/main                  │  │
│   └──────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
                         │
              ┌──────────┴──────────┐
              ▼                     ▼
       ┌────────────┐         ┌────────────┐
       │  Gemini    │         │ Alpaca     │
       │  Speechmatics       │ Featherless│
       │  NewsAPI   │         │  (HTTPS)   │
       └────────────┘         └────────────┘
```

## Performance budget

- Audio-to-trade latency target: **< 5 seconds** end-to-end
  - Speechmatics partials: < 500ms
  - Catalyst classifier (Featherless): < 1s
  - Strategist (Gemini Pro): < 2s
  - Risk (Gemini Flash): < 500ms
  - Executor (Alpaca paper API): < 500ms
- Dashboard SSE update lag: < 200ms
- Agent cycle (cron) duration: < 30s
