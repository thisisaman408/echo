# Polly — Build Plan (May 13–19, 2026)

## Constraints

- Choir 48h sprint locks **May 15 PM → May 17 PM** — Polly paused that window.
- Tower deadline is May 18, so Tower competes for May 14 + May 18 time.
- Polly submit target: **May 19, 8 PM IST** (24h before official deadline).

## High-level timeline

| Date | Polly status |
|---|---|
| Wed May 13 (tonight) | Scaffold + Vultr VM + Alpaca account |
| Thu May 14 | Core agent loop (Scout, News, Strategist) |
| Fri May 15 AM | Risk Mgr + Executor + end-to-end cycle running |
| Fri May 15 PM → Sun May 17 PM | ⛔ **Choir 48h sprint — Polly paused** |
| Sun May 17 night | Brief Polly check-in after submitting Choir |
| Mon May 18 AM | Speechmatics integration (the hero feature) |
| Mon May 18 PM | Submit Tower, then Polly dashboard polish |
| Tue May 19 AM | 3D trading floor + Narrator + Vultr deploy |
| Tue May 19 PM | Demo video + **SUBMIT POLLY** by 8 PM IST |

---

## Day 1 — Wed May 13 (4 hours tonight)

**Goal:** All infra accounts provisioned, monorepo scaffolded, Polly app skeleton compiles.

### Tasks

- [ ] Turborepo monorepo scaffolded at `~/Downloads/hackathons-monorepo`
- [ ] `apps/polly` created with Next.js 16 + Tailwind v4 + shadcn
- [ ] `packages/db` with Drizzle + Postgres connection helper
- [ ] `packages/agents` with typed LLM gateway (`callGemini`, `callFeatherless`, `callClaude`)
- [ ] `packages/ui` with shared dark-mode design tokens
- [ ] Alpaca paper trading account created → API key in `.env.local`
- [ ] Gemini API key in `.env.local`
- [ ] Featherless API key in `.env.local` (using your existing $25 credit)
- [ ] Speechmatics API key in `.env.local` (using your existing $200 credit)
- [ ] Vultr VM provisioned (smallest $6/month instance, Ubuntu 24.04)
- [ ] Postgres + pgvector installed on the VM, accessible via SSH tunnel for dev
- [ ] GitHub repo `aman/hackathons-monorepo` initialized + MIT license + first commit pushed
- [ ] Vercel deployment for `apps/polly` (free tier for dev/preview; production goes on Vultr)

### Stretch

- [ ] Caddy reverse proxy set up on Vultr → HTTPS for `polly.<your-domain>.dev`
- [ ] Tweet "Started building Polly tonight" tagged `@lablabai`

---

## Day 2 — Thu May 14 (10 hours)

**Goal:** Core agent loop (Scout + News + Strategist) end-to-end on a single ticker.

### AM (4h)

- [ ] Drizzle schema: `positions`, `trades`, `agent_messages`, `market_snapshots`, `audio_transcripts`, `watchlist`
- [ ] Migrations applied to local + Vultr Postgres
- [ ] Inngest set up — first cron job runs every 5 min and writes a log row
- [ ] **Market Scout agent**:
  - Alpaca client wrapper
  - Pulls last 50 bars for each watchlist ticker
  - Computes RSI, MACD, volume z-score
  - Calls Gemini Flash to generate `ScoutFinding[]`
  - Writes to `agent_messages`

### PM (4h)

- [ ] **News Reader agent**:
  - NewsAPI + RSS feeds wrapper
  - Featherless client wrapper
  - Extracts `NewsCatalyst[]` per ticker
  - Writes to `agent_messages`
- [ ] **Strategist agent**:
  - Reads last 30 min of Scout + News messages
  - Calls Gemini Pro with synthesis prompt
  - Outputs `TradeThesis[]`
  - Writes to `agent_messages`

### Late evening (2h)

- [ ] Minimal dashboard page (`/`) showing:
  - Watchlist ticker grid
  - Live agent message feed (poll Postgres every 2s for now; SSE comes later)
  - One chart panel with Recharts
- [ ] Tweet build progress

---

## Day 3 — Fri May 15 AM (5 hours)

**Goal:** End-to-end agent cycle. Risk Manager approves, Executor places paper trades on Alpaca.

### Tasks

- [ ] **Risk Manager agent**:
  - Hard-rule checker (position limit, drawdown)
  - Gemini Flash for position sizing + stop-loss
  - Approves/rejects each `TradeThesis`
- [ ] **Executor agent**:
  - Deterministic Alpaca order placement
  - Stop-loss + take-profit OCO orders
  - Updates `positions` and `trades` tables
- [ ] **Narrator agent**:
  - Reads full cycle of `agent_messages`
  - Gemini Flash for prose
  - Writes to `agent_messages` as `agent: 'narrator'`
- [ ] **Full cycle test:**
  - Add NVDA, TSLA, AAPL to watchlist
  - Trigger cycle manually
  - Verify: Scout → News → Strategist → Risk → Executor → (paper trade fills on Alpaca) → Narrator
  - Check Alpaca dashboard: a paper trade should appear

### Afternoon (3:00–8:00 PM IST)

- ⛔ Stop Polly work at 8:00 PM IST sharp
- [ ] Switch to Choir prep (review IBM Bob docs, refresh Bob API access)
- [ ] Choir kicks off at 8:30 PM IST

---

## ⛔ Fri May 15 PM → Sun May 17 PM — Choir 48h sprint

Polly is paused. **Do not touch.** Choir gets full focus.

---

## Sun May 17 night (1-2 hours buffer)

After submitting Choir at ~6 PM IST:

- [ ] Pull main branch, verify Polly's last commit still works
- [ ] Smoke test: agent cycle runs without errors
- [ ] Sleep — recover

---

## Day 4 — Mon May 18 AM (4 hours, then switch to Tower)

**Goal:** Speechmatics live audio catalyst detection working end-to-end.

### Tasks

- [ ] `speechmatics-client.ts` — WebSocket wrapper for RT API
- [ ] `audio-sources.ts` — adapter for YouTube live stream + pre-recorded MP3
- [ ] Test: stream a pre-recorded Fed speech MP3 → see transcripts arriving in DB
- [ ] `catalyst-classifier.ts` — Featherless model classifies transcript chunks for importance
- [ ] Wire into News Reader → catalyst events trigger urgent agent cycles via Inngest events
- [ ] Test demo flow: play a "rate hike" line → Polly trades within 5s

### Mon May 18 PM (4 hours) — Tower polish + submit

- ⚠️ Switch to Tower for the rest of the day. Submit Tower by 8 PM IST.

---

## Day 5 — Tue May 19 AM (6 hours)

**Goal:** Demo-ready dashboard + deployed on Vultr.

### Tasks

- [ ] **3D Trading Floor (React Three Fiber):**
  - 5 agent avatars on a virtual floor
  - Float animation
  - Color-shift based on portfolio P&L (green up, red down)
  - Speech bubbles pop up when each agent posts a message
- [ ] **Live Agent Chat panel:**
  - SSE-driven message feed
  - Color-coded by agent
  - Conviction meter for Strategist messages
- [ ] **P&L Equity Curve + Positions Grid:**
  - Recharts area chart for equity over time
  - Sortable positions table with live unrealized P&L
- [ ] **Audio Transcript panel:**
  - Live transcript with speaker diarization
  - Highlight catalysts as they're detected
- [ ] **Deploy to Vultr (production):**
  - Build Next.js → upload to Vultr VM
  - Caddy serves on `polly.<domain>.dev` with auto-HTTPS
  - Smoke test: visit the URL, agents run on schedule

---

## Day 5 — Tue May 19 PM (6 hours)

**Goal:** Demo video + submission.

### Tasks

- [ ] **Demo video script** (`07-demo-script.md`) — rehearse
- [ ] Record 3-min demo with Tella or Screen Studio (4K):
  - 0:00–0:20 — problem statement
  - 0:20–0:45 — Polly architecture overview
  - 0:45–2:00 — **HERO MOMENT:** play Fed speech → Polly reacts → trade fires → P&L moves
  - 2:00–2:30 — agent debate, 3D floor, narrator commentary
  - 2:30–2:50 — sponsor tech callouts (Vultr, Gemini, Featherless, Speechmatics)
  - 2:50–3:00 — closing slide
- [ ] **Slide deck (10 slides):**
  - Title, problem, solution, architecture, agents, demo gif, sponsor tech, prize map, team, ask
- [ ] **Submission form on lablab:**
  - Project Title: "Polly — Multi-Agent Trading Swarm with Live Audio Catalyst Detection"
  - Short description (250 chars)
  - Long description (markdown)
  - Tags: AI Agents, Multi-Agent Systems, Gemini, Vultr, Featherless, Speechmatics, Open Source
  - Cover image (use the dark-mode design we already have)
  - Video presentation (uploaded to YouTube unlisted)
  - Slide presentation (uploaded to Drive)
  - GitHub URL
  - Demo URL (Vultr deployment)
- [ ] **SUBMIT BY 8 PM IST**

---

## Daily ritual

Every day at 9 AM: 5-min standup with yourself.

> Yesterday: [what shipped]
> Today: [top 3 tasks]
> Blockers: [anything stuck for >2h]
> P&L (literal, on Polly's paper account): [Δ today]

Post each standup as a public tweet tagged `@lablabai`. Adds social engagement and forces accountability.

## Risk register

| Risk | Mitigation |
|---|---|
| Vultr VM costs > $20 | Use $6/month tier, self-host Postgres, delete VM May 21 |
| Speechmatics quota runs out | $200 credit is plenty for hackathon — but cap usage to 30s clips for demo |
| Gemini Pro hits rate limit | Fall back to Claude Sonnet for Strategist (already in `packages/agents`) |
| Alpaca paper market closed during demo | Pre-record a market-hours demo Friday or Monday |
| Choir overruns 48h window | Hard stop at Sun 6 PM — submit what's there |
| Polly bug in last 24h | Don't deploy new code Tue PM after 5 PM — only fix obvious bugs |
