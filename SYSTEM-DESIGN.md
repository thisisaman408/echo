# Polly — Autonomous AI Hedge Fund

> Multi-strategy autonomous AI hedge fund for Kraken xStocks. Five PM agents debate trades every morning in a live Investment Committee, broadcast on a Bloomberg-Terminal-style dashboard. Built for Milan AI Week — AI Agent Olympics, May 13–20, 2026.

---

## 1. Product statement

Polly is not a trading bot. Polly is a hedge fund.

Five LLM-driven Portfolio Manager agents — Atlas (fundamental), Crest (technical), Forge (macro), Pulse (event-driven), Sentinel (risk officer) — convene at 09:30 ET daily for an Investment Committee. They propose trades on Kraken xStocks (tokenized U.S. equities), debate them with structured rebuttals, route the approved set through Sentinel for cross-fund VaR and concentration checks, and emit paper orders via the Kraken CLI. Every input PDF, chart screenshot, news article, prompt and response is committed to an immutable audit log. The day closes with a Gemini Pro-authored Daily Brief and an auto-tweet tagged `@krakenfx @lablabai @Surgexyz_`.

The user sees this through a dark, Bloomberg-aesthetic web app: a 3D "trading floor" landing scene, a live SSE-driven Committee transcript, equity curve, drawdown chart, positions table, and an audit log viewer where you can scrub backward through any decision and see the exact prompt, Vision input, model name, token count and Sentinel verdict.

It targets every prize on the Milan AI Week board simultaneously — Vultr (deployment + serverless inference), Gemini (multimodal reasoning), Kraken Trading PnL (paper PnL ranking), Kraken Social Engagement (build-in-public posting), and Featherless (domain-specialized model for Pulse). The repo ships MIT licensed.

---

## 2. Why this wins

### 2.1 Direct competitor analysis

The Kraken xStocks PnL prize has five direct competitors that pitched a trading agent. Polly is structurally different from all of them.

| Competitor | Pitch | What they will demo | Polly's structural advantage |
|---|---|---|---|
| **Buffet AI** (UTC +2:00) | Buffett-style xStocks via Kraken CLI | Single-agent value-investing screener. Pulls fundamentals, ranks tickers, fires orders. | Polly is a *committee* — fundamental, technical, macro, event, risk debate before any order. Buffet AI is one prompt; Polly is five prompts in conversation. Polly also has Vision (PDF + chart screenshots) which Buffet AI's bio doesn't claim. |
| **YuJiDi Capital** (UTC +5:30) | High-frequency autonomous trading on Kraken xStocks | Latency-optimized loop, probably one model, scalper-style. | HFT in a hackathon paper-trading week is a recipe for a flat-or-negative PnL chart. Polly trades 1–3 times/day with thesis-grade conviction. Demos better, audits better, narrates better. |
| **TradeFlow AI** (UTC +1:00) | Dynamic strategy selection | Likely a router that picks a strategy. | "Strategy router" is invisible on stage. A 5-agent live debate is visible on stage. |
| **Felu** (UTC -4:00) | Portfolio monitor → Telegram briefings | Read-only briefing, not execution. | Polly is read + write. Felu loses on Kraken Trading PnL eligibility (no execution claimed). |
| **PureAgent** (UTC +8:00) | "Walking agent for trading" — single line, vague | Probably basic. | Vague pitch = vague execution. Polly's specificity dominates judging rubric. |
| **Profynn** (UTC +5:30) | AI CFO for SMBs | Not xStocks. Not Kraken. | Not the same prize lane. |

Five direct competitors. None claim multi-agent debate. None claim Gemini Vision on financial PDFs and charts. None claim a domain-specialized Featherless model. None claim a 3D trading-floor visualization. Polly's surface area is wider than the entire competitor set combined.

### 2.2 Empty-lane exploitation

From `MARKET-INTEL.md` across 1,577 hackathon entrants:

| Combo | Teams claiming it | Heat |
|---|---:|---:|
| finance + multi-agent / swarm | **0** | 256 |
| finance + vision / image | **0** | 192 |
| finance + automation / workflow | 0 | 1280 |

Polly is the only finance team in the entire 1,577-entrant field that hits both multi-agent and multimodal vision. The two lanes are completely empty and Polly straddles both.

Cross-vertical: only 8 teams in Milan even touch finance/fintech. Three of those (ChainSentinel, VulnraAI, Profynn) aren't trading. So the *real* xStocks PnL field is five teams. Of those five, only Buffet AI claims Kraken CLI execution in their bio. Polly is one of two teams confirmed using the actual sponsor execution layer.

### 2.3 Sponsor-stack edge

`MARKET-INTEL.md`: "Teams explicitly mentioning sponsor tech: 2 of 133 (2%) in Milan." Polly's submission long-description name-drops every sponsor in the first 200 characters:

> Polly is an autonomous AI hedge fund. Five Gemini- and Featherless-powered Portfolio Manager agents debate trades on Kraken xStocks every morning, executed via Kraken CLI, deployed on Vultr VMs with Vultr Serverless Inference, live-broadcast on a Bloomberg-Terminal-style dashboard. MIT licensed.

Polly hits **5 sponsor prizes at once**:

| Sponsor | Hook | Where it shows up |
|---|---|---|
| Vultr | Deploy + at least one model on Vultr Serverless Inference | All API hits live behind `vultr.com`; Pulse and Sentinel route through Vultr Serverless |
| Gemini | Gemini 2.0 Pro + Flash + Vision | Atlas/Forge use Pro for reasoning; Crest/Sentinel use Flash for speed; Vision reads 10-K PDFs and chart screenshots |
| Kraken PnL | Kraken CLI for execution + read-only API key submission | Executor agent shells out to `kraken trade`; user submits read-only API key in form |
| Kraken Social | Build-in-public posts tagged `@krakenfx @lablabai @Surgexyz_` | Auto-tweet at 16:00 ET daily, plus 2 manual posts/day during build week |
| Featherless | Open-source domain-specialized model | Pulse runs a financial-news-tuned model from Featherless catalog; MIT license |

Only **ContractSentinel AI** is also stacking Gemini + Vultr + Featherless, and they're in legal/procurement — different prize lane. Polly is the only finance team doing the multi-sponsor stack.

### 2.4 Judging criteria mapping

Lablab.ai hackathon judging consistently rewards five axes. How Polly scores each:

| Axis | Polly's evidence |
|---|---|
| **Innovation** | Multi-agent investment committee with Vision + structured debate. Nothing else in the field. |
| **Technical execution** | Next.js 16, App Router, Server Actions, Drizzle, pgvector, Inngest crons, SSE streaming, R3F 3D scene. Real production stack. |
| **Use of sponsor tech** | 5/5 sponsors hit. Most teams hit 1–2. |
| **Real-world impact** | Open source. Anyone can paper-trade their own xStocks with a research-grade committee. Retail democratization angle. |
| **Pitch / demo quality** | 90-second live FOMC reaction demo. Vision-driven, audible debate, on-screen audit, paper order placed in front of judges. |

---

## 3. Prize eligibility & submission checklist

### 3.1 Vultr

**Requirement:** Deploy on a Vultr VM (mandatory). Use Vultr Serverless Inference for at least one model.

**Polly's compliance:**
- Vultr Cloud Compute instance (vc2-2c-4gb minimum, ams or fra region for low EU latency to Milan judges)
- Coolify installed on the VM for one-command deploys
- Postgres + pgvector runs in a Docker container on the same VM
- Pulse agent calls Vultr Serverless Inference (Llama 3.x or similar from Vultr catalog) as fallback when Featherless is rate-limited — guarantees the "uses Vultr Serverless Inference" box is checked even if Featherless dies mid-demo
- Submission includes `VULTR_DEPLOY.md` with the public URL, region, and a screenshot of the Vultr panel showing the running instance

**Submission artifacts:**
- Live URL: `https://polly.<vultr-public-ip>.sslip.io` (Coolify handles TLS via sslip.io)
- Vultr panel screenshot: `/screenshots/vultr-instance.png`
- `vultr.deploy.json` config committed to repo

### 3.2 Gemini

**Requirement:** Use Gemini via Google AI Studio or Gemini API. Multimodal use ideal for "Best use of Gemini."

**Polly's compliance:**
- Atlas: Gemini 2.0 Pro (`gemini-2.0-pro-exp`) for fundamental analysis. Reads 10-K and 10-Q PDFs via Gemini Vision.
- Crest: Gemini 2.0 Flash (`gemini-2.0-flash-exp`) for fast technical analysis. Reads candlestick screenshots via Vision.
- Forge: Gemini 2.0 Pro for macro thematic reasoning. Reads FOMC dot plots, CPI heatmaps, yield curve images via Vision.
- Sentinel: Gemini 2.0 Flash for risk scoring (Flash chosen for low latency — risk veto must happen <2s).
- Daily Brief author: Gemini 2.0 Pro with the full day's audit log as context.

**Multimodal showcase (the killer demo):** at 14:00 ET on May 20, a recorded FOMC statement PDF is dropped into Polly. Gemini Vision reads the dot plot and CPI table directly from the PDF image. Forge produces a `signal: hawkish, confidence: 0.78` output. Visible on stage.

**Submission artifacts:**
- README section "Gemini usage" lists every Gemini model and where it's called
- `/api/gemini-trace` endpoint exposes the last 50 Gemini calls (model, tokens, latency, image attached y/n) — judges can verify
- Sample Vision input/output pair in `/docs/gemini-vision-sample.md`

### 3.3 Kraken Trading PnL

**Requirement:** Use Kraken CLI as execution layer. Submit read-only Kraken API key. PnL ranking over the contest window.

**Polly's compliance:**
- `Executor` agent invokes Kraken CLI via Node `child_process.spawn` (no Kraken SDK — explicit CLI use is the scoring criterion)
- Paper trading mode only (no real funds)
- Kraken read-only API key generated for submission account; submitted via lablab.ai form on May 19
- All orders idempotency-keyed by `decision_id` to prevent duplicate fills
- 30-day PnL window auto-tracked: Polly logs `nav_at_open` and `nav_at_close` each session; `leaderboard_snapshots` table is the source of truth Kraken can pull

**Submission artifacts:**
- Read-only Kraken API key + secret submitted via lablab.ai form
- `KRAKEN_INTEGRATION.md` with sample CLI invocation transcript
- `/api/portfolio/snapshot` endpoint returns current positions + NAV in Kraken-friendly JSON

### 3.4 Kraken Social Engagement

**Requirement:** Public posts tagged `@krakenfx @lablabai @Surgexyz_` over a 30-day window. Ranked by engagement.

**Polly's compliance:**
- Auto-tweet at 16:00 ET daily summarizing the Investment Committee outcome (Gemini Pro generates the tweet body, attaches the equity curve PNG)
- Manual posts during build week: 2/day, structured (build progress, screenshots, "what Pulse said about NVDA today")
- Each tweet hits all three tags + `#xStocks #Kraken #MilanAIWeek #AIAgentOlympics`
- Engagement amplified via cross-post to LinkedIn + Threads

**Submission artifacts:**
- `social_posts` table tracks every post with URL + engagement counts (impressions, likes, RTs) pulled via X API daily
- `/leaderboard/social` public page renders engagement totals
- README links to `@polly_fund` X handle (or whatever the user secures)

### 3.5 Featherless

**Requirement:** Use Featherless models. Domain-specialized agent. Open-source MIT/Apache license.

**Polly's compliance:**
- Pulse agent points its OpenAI-compatible client at `https://api.featherless.ai/v1`
- Model selection (open question — see §16): a financial- or news-tuned 7B–13B from the Featherless catalog. Default candidate: a Llama-3.1-8B fine-tuned for financial sentiment if available; else Mistral-7B-Instruct as control with strong system prompt
- Pulse is the *only* news-and-sentiment agent — so the domain-specialization argument is clean: Pulse exists *because* Featherless makes a finance-tuned model available
- Repo `LICENSE`: MIT
- `/api/featherless-trace` endpoint exposes Pulse's recent calls for judges to verify

**Submission artifacts:**
- README section "Featherless usage" explains the model choice and why it matters
- `pulse.prompts.ts` shows the system prompt that exploits the domain tuning
- MIT license file in repo root

### 3.6 Lablab.ai submission requirements

Standard lablab.ai hackathon submission. Hard deadline: **May 19, 8:30 PM IST**. Polly internal cutoff: **May 19, 8:00 PM IST** (24h buffer).

| Field | Polly's content |
|---|---|
| Project name | Polly |
| One-liner | Autonomous AI hedge fund. Five PM agents debate Kraken xStocks trades every morning. Multimodal, MIT licensed. |
| Long description | (full pitch, name-drops every sponsor, ~600 words) |
| Demo video | YouTube unlisted, 3:00 max. See §13. |
| Repo URL | GitHub public, MIT licensed. |
| Live demo URL | Vultr-hosted Coolify deployment. |
| Tech stack tags | Gemini, Vultr, Featherless, Kraken, Next.js, TypeScript, Drizzle, pgvector, Inngest, R3F |
| Team | Solo (`thisisaman408`) |
| Track / prize | Multi-select: Vultr, Gemini, Kraken PnL, Kraken Social, Featherless |
| Sponsor API keys submitted | Kraken read-only API key (PnL track) |

---

## 4. Feature list (P0 / P1 / P2)

### 4.1 P0 — Must ship to be eligible

| # | Feature | Owner of breakage |
|---|---|---|
| P0.1 | Deploy on Vultr VM with Coolify, public HTTPS URL | Vultr eligibility |
| P0.2 | Postgres + pgvector running, Drizzle migrations applied | All persistence |
| P0.3 | Atlas, Crest, Forge agents call Gemini 2.0 (Pro for Atlas/Forge, Flash for Crest) | Gemini eligibility |
| P0.4 | At least one Gemini Vision call demonstrated on a real financial image (10-K page or chart) | Best use of Gemini |
| P0.5 | Pulse calls Featherless OpenAI-compatible API with a chosen model | Featherless eligibility |
| P0.6 | Sentinel reviews and can veto proposals | Differentiation; demo critical |
| P0.7 | Executor invokes Kraken CLI to place a paper trade | Kraken PnL eligibility |
| P0.8 | Investment Committee runs end-to-end as a single workflow (manual trigger sufficient) | Demo critical |
| P0.9 | Audit log writes every decision, every prompt, every response | Trust + demo screen |
| P0.10 | Equity curve chart (recharts) with at least 5 days of seeded paper data | Demo screen |
| P0.11 | Live Committee transcript page (SSE or polling fallback) | Demo critical |
| P0.12 | Kraken read-only API key submitted via lablab.ai form | Kraken PnL eligibility |
| P0.13 | At least 5 build-in-public posts with `@krakenfx @lablabai @Surgexyz_` | Kraken Social eligibility |
| P0.14 | MIT LICENSE file in repo root | Featherless + general OSS posture |
| P0.15 | Public GitHub repo with README explaining setup | Submission requirement |
| P0.16 | 3-minute demo video uploaded to YouTube unlisted | Submission requirement |
| P0.17 | Lablab.ai submission form filled and submitted before May 19, 8:00 PM IST | Eligibility wall |
| P0.18 | Backup recording of the 90-second killer moment in case live demo fails | Demo risk |

### 4.2 P1 — Differentiators

| # | Feature | Why it matters |
|---|---|---|
| P1.1 | Inngest cron at 09:30 ET runs the Committee automatically | Proves "autonomous" claim |
| P1.2 | News ingestion pipeline (NewsAPI + 4 RSS feeds) into `news_items` table | Pulse needs fresh input |
| P1.3 | pgvector dedup of news items (cosine similarity > 0.92 = duplicate) | Quality of Pulse |
| P1.4 | Daily Brief generation by Gemini Pro at 16:00 ET, stored in `daily_briefs` | Audit + Twitter content |
| P1.5 | Auto-tweet at 16:00 ET via X API v2 | Kraken Social score |
| P1.6 | 3D Trading Floor landing scene (R3F) | Visual moat; nothing else in field has this |
| P1.7 | Live SSE Committee broadcast page | "Bloomberg Terminal" hero |
| P1.8 | Sentinel cross-fund VaR calc (parametric, 1-day, 95% confidence) | Real risk officer behavior |
| P1.9 | Public NAV leaderboard (optional multi-tenant) | Future virality |
| P1.10 | Decision Timeline viewer (audit log scrubber) | Trust + judging "how did it decide?" |
| P1.11 | Vultr Serverless Inference fallback for Pulse | Vultr Serverless box checked |
| P1.12 | Drawdown chart alongside equity curve | Real-fund signal |
| P1.13 | Reduced-motion respect + accessible focus rings | Polish; demos better |
| P1.14 | Shimmer skeletons on every async load | No spinners; "Stripe Docs" vibe |
| P1.15 | JetBrains Mono for all data, Inter for prose | Aesthetic consistency |

### 4.3 P2 — Polish & wow

| # | Feature | Why it's optional |
|---|---|---|
| P2.1 | Multi-tenant Better Auth + per-user Kraken keys | Solo demo doesn't need it; nice for post-hackathon |
| P2.2 | Sentinel "stress test" mode that replays the 2008 or 2020 crash | Eye candy if time |
| P2.3 | Agent persona portraits (DALL-E generated, stored locally) | Pure polish |
| P2.4 | Slack/Discord webhook for Committee notifications | Build-in-public amplifier |
| P2.5 | Telegram bot that mirrors auto-tweet | Adjacent to Felu but secondary |
| P2.6 | OpenAI Whisper transcribes a recorded FOMC presser, feeds Forge | Cool but fragile |
| P2.7 | Replay mode: scrub any past Committee like a stock trading replay | Excellent if time |
| P2.8 | Public "Polly Index" composite of all PM agent NAVs | Marketing-grade flourish |
| P2.9 | Mobile-responsive Trading Floor (fall back to 2D) | Judges likely on laptops |
| P2.10 | Light theme toggle (default stays dark) | We are *Bloomberg dark*; not really needed |

---

## 5. System architecture

### 5.1 ASCII diagram

```
                                  ┌──────────────────────────────────────────┐
                                  │              VULTR VM (4GB, fra1)        │
                                  │                                          │
   ┌─────────┐    HTTPS           │   ┌────────────────┐    ┌────────────┐   │
   │ Browser │ ◄──────────────────┼───┤  Next.js 16    │    │   Inngest  │   │
   │ (R3F UI)│    SSE / fetch     │   │  App Router    │◄───┤   (cron +  │   │
   └─────────┘                    │   │                │    │  workflows)│   │
                                  │   │  Server Actions│    └──────┬─────┘   │
                                  │   │  Route Handlers│           │         │
                                  │   └──┬─────┬────┬──┘           │         │
                                  │      │     │    │              │         │
                                  │      ▼     ▼    ▼              ▼         │
                                  │  ┌───────────────────────────────────┐   │
                                  │  │      Orchestrator (Inngest)       │   │
                                  │  │   step.run("propose-atlas")       │   │
                                  │  │   step.run("propose-crest")       │   │
                                  │  │   step.run("propose-forge")       │   │
                                  │  │   step.run("propose-pulse")       │   │
                                  │  │   step.run("debate")              │   │
                                  │  │   step.run("sentinel-review")     │   │
                                  │  │   step.run("execute")             │   │
                                  │  │   step.run("daily-brief")         │   │
                                  │  └─┬───┬───┬───┬───┬───┬───────┬─────┘   │
                                  │    │   │   │   │   │   │       │         │
                                  │    ▼   ▼   ▼   ▼   ▼   ▼       ▼         │
                                  │  Atlas Crest Forge Pulse Sent. Exec.     │
                                  │   │    │    │    │     │     │           │
                                  │   ▼    ▼    ▼    ▼     ▼     ▼           │
   ┌─────────────────┐  ◄─────────┼───┴────┴────┴┐  ┌┴─────┴─────┴┐          │
   │ Google AI Studio│  Gemini    │              │  │             │          │
   │ Gemini 2.0      │  Vision    │              │  │             │          │
   │  Pro / Flash    │ ◄──────────┼──────────────┘  │             │          │
   └─────────────────┘            │                 │             │          │
                                  │                 ▼             │          │
   ┌─────────────────┐  ◄─────────┼───────  Featherless API       │          │
   │ Featherless     │  Pulse     │         (OpenAI-compat)       │          │
   │ (Llama-FinTune) │            │                               │          │
   └─────────────────┘            │                               │          │
                                  │                               ▼          │
   ┌─────────────────┐  ◄─────────┼───────────────────────  Kraken CLI       │
   │ Kraken          │  Executor  │                         (child_process)  │
   │ (paper xStocks) │            │                                          │
   └─────────────────┘            │                                          │
                                  │   ┌────────────────────────────────┐     │
   ┌─────────────────┐            │   │  Postgres 16 + pgvector        │     │
   │ NewsAPI / RSS / │  ────────► │   │  (Docker on VM)                │     │
   │ X firehose      │  ingest    │   │                                │     │
   └─────────────────┘  worker    │   │  drizzle migrations            │     │
                                  │   └────────────────────────────────┘     │
   ┌─────────────────┐  ◄─────────┼────  X API v2 (auto-tweet 16:00 ET)      │
   │ X / Twitter     │            │                                          │
   └─────────────────┘            │                                          │
                                  │   ┌────────────────────────────────┐     │
                                  │   │  Vultr Serverless Inference    │     │
                                  │   │  (Pulse fallback path)         │     │
                                  │   └────────────────────────────────┘     │
                                  └──────────────────────────────────────────┘
```

### 5.2 Component breakdown

| Component | Runtime | Purpose | Location |
|---|---|---|---|
| Next.js app | Node 20, Next.js 16.x | UI + Server Actions + Route Handlers | Vultr VM, Coolify-managed Docker |
| Postgres 16 | Docker container | Persistence, audit log, pgvector for news dedup | Same VM, persistent volume `/var/lib/polly-pg` |
| Inngest | Inngest Cloud (free tier) | Cron, retries, step durability for Committee workflow | External; webhooks back to Next.js |
| Ingestion worker | Node script via Inngest cron every 15 min | Pulls NewsAPI + RSS, dedups via pgvector | Same Next.js codebase, `/api/inngest` |
| Kraken CLI | Binary, `kraken` v1.x | Executor's only execution path | Installed on VM via Coolify build hook |
| Gemini SDK | `@google/generative-ai` npm | Atlas, Crest, Forge, Sentinel, Daily Brief | Inside Next.js |
| Featherless SDK | `openai` npm pointed at Featherless base URL | Pulse | Inside Next.js |
| Vultr Serverless | HTTPS REST | Pulse fallback when Featherless 429s | Inside Next.js |
| X API v2 | `twitter-api-v2` npm | Auto-tweet | Inside Next.js |
| R3F | `@react-three/fiber` + `drei` | 3D Trading Floor scene | Client component |
| recharts | `recharts` | Equity + drawdown chart | Client component |
| shadcn/ui | shadcn CLI added components | Tables, dialogs, sheets, toasts | Client + server components |
| Framer Motion | `framer-motion` | Page transitions, micro-interactions | Client components |
| Better Auth | `better-auth` | Auth (P2; not P0) | Inside Next.js |

### 5.3 Sequence: Investment Committee morning flow

```
Time      Actor             Action                                            Persists to
─────────────────────────────────────────────────────────────────────────────────────────
09:25 ET  Inngest cron      Triggers `committee.daily` event                  -
09:25 ET  Orchestrator      Creates `decisions` row (status=in_progress)      decisions
09:25 ET  Orchestrator      Fan-out: emits 4 events to PM agents              -
09:25 ET  Pulse worker      Pulls last 6h of news_items not yet processed     news_items
09:26 ET  Atlas worker      Loads recent 10-K excerpts for watchlist tickers  -
09:26 ET  Atlas worker      Calls Gemini Pro w/ PDF page images via Vision    audit_log
09:26 ET  Crest worker      Generates candlestick PNG for each watchlist tkr  -
09:26 ET  Crest worker      Calls Gemini Flash w/ chart image via Vision      audit_log
09:27 ET  Forge worker      Loads latest FOMC dot plot, CPI heatmap from /macro audit_log
09:27 ET  Forge worker      Calls Gemini Pro w/ macro images                  audit_log
09:27 ET  Pulse worker      Calls Featherless w/ news + sentiment prompt      audit_log
09:28 ET  Atlas worker      Returns Proposal[] (zod-validated)                proposals
09:28 ET  Crest worker      Returns Proposal[]                                proposals
09:28 ET  Forge worker      Returns Proposal[]                                proposals
09:28 ET  Pulse worker      Returns Proposal[]                                proposals
09:28 ET  Orchestrator      Joins fan-out, begins debate round                -
09:28 ET  Debate moderator  Pairs conflicting proposals (e.g. Atlas long      audit_log
                            NVDA vs Pulse short NVDA)
09:29 ET  Atlas worker      Rebuttal call (Gemini Pro, context = opposing     audit_log
                            proposal + own original)
09:29 ET  Pulse worker      Counter-rebuttal call                             audit_log
09:29 ET  Orchestrator      Compiles debate transcript                        decisions
09:30 ET  Sentinel          Receives all proposals + debate transcript        -
09:30 ET  Sentinel          Computes parametric VaR for proposed portfolio    -
09:30 ET  Sentinel          Calls Gemini Flash w/ VaR + concentration check   audit_log
09:30 ET  Sentinel          Emits Approval[] or Veto[] for each proposal      proposals
09:30 ET  Executor          For each approved proposal:                       trades
                              - shells out to `kraken trade` with idem key
                              - parses CLI output
                              - writes trades row
09:31 ET  Orchestrator      Marks decision as `complete`                      decisions
09:31 ET  SSE emitter       Broadcasts `committee.complete` to all clients    -
16:00 ET  Inngest cron      Triggers `daily.brief.generate`                   -
16:00 ET  Brief author      Gemini Pro composes brief from day's audit_log    daily_briefs
16:00 ET  Tweet job         Posts to X with equity curve PNG                  social_posts
```

### 5.4 Sequence: Single trade decision lifecycle

```
1.  Proposal originates (PM agent emits zod-validated Proposal)
       │
       ▼
2.  proposals row created: status="proposed"
       │
       ▼
3.  Debate (if conflicting proposals exist for same ticker)
       │   - rebuttal stored in audit_log linked to proposal_id
       ▼
4.  Sentinel review
       │   - VaR check: incremental contribution to portfolio VaR
       │   - Concentration check: post-trade position > 5% NAV → veto
       │   - Sector concentration: post-trade sector > 25% NAV → cap to 25%
       │   - Daily loss limit: realized + unrealized loss today > 2% NAV → veto
       │   - Cooldown check: ticker traded in last 60 min → veto duplicate
       ▼
5a. proposals.status = "approved"  ──►  6. Executor
5b. proposals.status = "vetoed"    ──►  audit_log entry (reason), end.
5c. proposals.status = "modified"  ──►  size reduced, then 6. Executor
       │
       ▼
6.  Executor places trade
       │   - generates idempotency key: hash(decision_id + ticker + side + size)
       │   - shells out: `kraken trade place --pair=$pair --side=$side ...`
       │   - parses JSON output
       │   - retries on transient error (max 3, exponential backoff)
       ▼
7.  trades row created: status="filled" | "rejected" | "partial"
       │
       ▼
8.  audit_log entry: kind="execution"
       │
       ▼
9.  SSE broadcast: `trade.filled` with trade_id
       │
       ▼
10. Portfolio NAV recomputed (server action invalidates revalidatePath("/portfolio"))
       │
       ▼
11. (16:00 ET batch) Brief author cites trade in daily_briefs.body
       │
       ▼
12. (16:00 ET batch) X tweet auto-generated
```

---

## 6. Tech stack

| Layer | Choice | Version | Why |
|---|---|---|---|
| Runtime | Node | 20.x LTS | Next.js 16 baseline |
| Framework | Next.js | 16.0.x | App Router, Server Actions, Route Handlers, proxy.ts |
| Language | TypeScript | 5.5+ strict | No `any`, no implicit returns |
| Styling | Tailwind CSS | v4 | Native CSS variables, `@theme` block |
| Components | shadcn/ui | latest | Add per-component via CLI |
| Animation | Framer Motion | 12.x | Page transitions, layout animations |
| 3D | React Three Fiber + drei | r3f 9.x, drei 9.x | Trading Floor scene |
| Charts | recharts | 2.x | Equity curve, drawdown |
| ORM | Drizzle | latest | TypeScript-first, fast migrations |
| Database | Postgres | 16 + pgvector 0.7 | News embeddings + relational |
| Cron / queue | Inngest | free tier | Step durability, retries, fan-out/fan-in |
| Auth (P2) | Better Auth | latest | Solo demo doesn't strictly need it |
| AI: reasoning | Gemini 2.0 Pro | `gemini-2.0-pro-exp` | Atlas, Forge, Daily Brief |
| AI: fast | Gemini 2.0 Flash | `gemini-2.0-flash-exp` | Crest, Sentinel |
| AI: vision | Gemini 2.0 multimodal | same as above | PDF pages, charts, dot plots |
| AI: domain | Featherless | model TBD (§16) | Pulse |
| AI: fallback | Vultr Serverless Inference | latest catalog | Pulse fallback |
| Execution | Kraken CLI | v1.x | Paper trades on xStocks |
| Market data | Kraken REST (`/0/public/Ticker`) | - | OHLCV, last prices |
| News | NewsAPI (free tier) + 4 RSS feeds | - | Pulse input |
| Sentiment | X API v2 (filtered stream OR sample) | - | Pulse signal |
| Auto-post | `twitter-api-v2` | - | Daily summary tweets |
| Validation | Zod | 3.x | All LLM outputs, all API contracts |
| Charts in PNG | `chart.js` + `canvas` server-side | - | Chart screenshots for Gemini Vision |
| PDF rendering | `pdfjs-dist` (server-side rasterize) | - | 10-K page-as-image for Vision |
| Deploy | Vultr VM + Coolify | - | One-click redeploy on git push |
| TLS | sslip.io + Coolify Let's Encrypt | - | Free HTTPS, no DNS hassle |
| Observability | Pino + Vultr disk logs + Inngest dashboard | - | Audit fallback |
| License | MIT | - | Featherless eligibility + OSS posture |

---

## 7. Data model (Drizzle schemas)

### 7.1 Tables

```ts
// db/schema/users.ts
import { pgTable, uuid, text, timestamp, boolean } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull().unique(),
  displayName: text("display_name"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  isDemo: boolean("is_demo").default(false).notNull(),
});
```

```ts
// db/schema/portfolios.ts
import { pgTable, uuid, text, numeric, timestamp, jsonb } from "drizzle-orm/pg-core";
import { users } from "./users";

export const portfolios = pgTable("portfolios", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  name: text("name").notNull(),                           // "Polly Main"
  navOpen: numeric("nav_open", { precision: 18, scale: 4 }).notNull(),       // session open NAV
  navCurrent: numeric("nav_current", { precision: 18, scale: 4 }).notNull(),
  navHigh: numeric("nav_high", { precision: 18, scale: 4 }).notNull(),       // running high-water mark
  cash: numeric("cash", { precision: 18, scale: 4 }).notNull(),
  inceptionDate: timestamp("inception_date", { withTimezone: true }).notNull(),
  riskParams: jsonb("risk_params").$type<{
    maxPositionPctNav: number;       // 0.05 = 5%
    maxSectorPctNav: number;         // 0.25 = 25%
    dailyLossLimitPctNav: number;    // 0.02 = 2%
    cooldownMinutes: number;         // 60
    varConfidence: number;           // 0.95
    varHorizonDays: number;          // 1
  }>().notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});
```

```ts
// db/schema/agents.ts
import { pgTable, uuid, text, timestamp, jsonb, boolean } from "drizzle-orm/pg-core";

export const agents = pgTable("agents", {
  id: uuid("id").defaultRandom().primaryKey(),
  slug: text("slug").notNull().unique(),                  // "atlas" | "crest" | "forge" | "pulse" | "sentinel" | "executor"
  name: text("name").notNull(),
  role: text("role").notNull(),                            // "fundamental" | "technical" | "macro" | "event" | "risk" | "execution"
  provider: text("provider").notNull(),                    // "gemini" | "featherless" | "vultr-serverless"
  model: text("model").notNull(),                          // "gemini-2.0-pro-exp" etc
  systemPromptVersion: text("system_prompt_version").notNull(), // git-sha or semver
  active: boolean("active").default(true).notNull(),
  meta: jsonb("meta").$type<{ description: string; persona: string }>().notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});
```

```ts
// db/schema/decisions.ts
import { pgTable, uuid, text, timestamp, jsonb } from "drizzle-orm/pg-core";
import { portfolios } from "./portfolios";

export const decisions = pgTable("decisions", {
  id: uuid("id").defaultRandom().primaryKey(),
  portfolioId: uuid("portfolio_id").references(() => portfolios.id).notNull(),
  sessionDate: text("session_date").notNull(),             // "2026-05-15" ET local
  triggeredBy: text("triggered_by").notNull(),             // "cron" | "manual" | "fomc-override"
  status: text("status").notNull(),                        // "in_progress" | "complete" | "failed"
  debateTranscript: jsonb("debate_transcript").$type<DebateTurn[]>(),
  startedAt: timestamp("started_at", { withTimezone: true }).defaultNow().notNull(),
  completedAt: timestamp("completed_at", { withTimezone: true }),
  errorMessage: text("error_message"),
});

export type DebateTurn = {
  turnIndex: number;
  agentSlug: string;
  utterance: string;
  refersToProposalId?: string;
  tokens: number;
};
```

```ts
// db/schema/proposals.ts
import { pgTable, uuid, text, numeric, timestamp, jsonb } from "drizzle-orm/pg-core";
import { decisions } from "./decisions";
import { agents } from "./agents";

export const proposals = pgTable("proposals", {
  id: uuid("id").defaultRandom().primaryKey(),
  decisionId: uuid("decision_id").references(() => decisions.id).notNull(),
  agentId: uuid("agent_id").references(() => agents.id).notNull(),
  ticker: text("ticker").notNull(),                        // e.g. "NVDAx" for the xStock
  underlyingTicker: text("underlying_ticker").notNull(),   // "NVDA"
  side: text("side").notNull(),                            // "buy" | "sell" | "short" | "cover"
  sizeUsd: numeric("size_usd", { precision: 18, scale: 4 }).notNull(),
  conviction: numeric("conviction", { precision: 4, scale: 3 }).notNull(), // 0.000..1.000
  horizonDays: numeric("horizon_days", { precision: 6, scale: 1 }).notNull(),
  thesis: text("thesis").notNull(),
  riskNotes: text("risk_notes"),
  status: text("status").notNull(),                        // "proposed" | "approved" | "modified" | "vetoed"
  sentinelVerdict: jsonb("sentinel_verdict").$type<{
    verdict: "approve" | "modify" | "veto";
    reason: string;
    modifiedSizeUsd?: number;
    incrementalVar: number;
  }>(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});
```

```ts
// db/schema/trades.ts
import { pgTable, uuid, text, numeric, timestamp, jsonb } from "drizzle-orm/pg-core";
import { proposals } from "./proposals";
import { portfolios } from "./portfolios";

export const trades = pgTable("trades", {
  id: uuid("id").defaultRandom().primaryKey(),
  portfolioId: uuid("portfolio_id").references(() => portfolios.id).notNull(),
  proposalId: uuid("proposal_id").references(() => proposals.id).notNull(),
  idempotencyKey: text("idempotency_key").notNull().unique(),
  ticker: text("ticker").notNull(),
  side: text("side").notNull(),
  sizeUsd: numeric("size_usd", { precision: 18, scale: 4 }).notNull(),
  filledSizeUsd: numeric("filled_size_usd", { precision: 18, scale: 4 }).notNull(),
  fillPrice: numeric("fill_price", { precision: 18, scale: 8 }).notNull(),
  fees: numeric("fees", { precision: 18, scale: 4 }).notNull(),
  status: text("status").notNull(),                        // "filled" | "rejected" | "partial"
  krakenOrderId: text("kraken_order_id"),
  krakenRawResponse: jsonb("kraken_raw_response"),
  placedAt: timestamp("placed_at", { withTimezone: true }).defaultNow().notNull(),
  filledAt: timestamp("filled_at", { withTimezone: true }),
});
```

```ts
// db/schema/positions.ts
import { pgTable, uuid, text, numeric, timestamp } from "drizzle-orm/pg-core";
import { portfolios } from "./portfolios";

export const positions = pgTable("positions", {
  id: uuid("id").defaultRandom().primaryKey(),
  portfolioId: uuid("portfolio_id").references(() => portfolios.id).notNull(),
  ticker: text("ticker").notNull(),
  underlyingTicker: text("underlying_ticker").notNull(),
  sector: text("sector"),                                  // "tech", "energy", "financials"
  quantity: numeric("quantity", { precision: 18, scale: 8 }).notNull(),
  avgEntryPrice: numeric("avg_entry_price", { precision: 18, scale: 8 }).notNull(),
  markPrice: numeric("mark_price", { precision: 18, scale: 8 }).notNull(),
  unrealizedPnlUsd: numeric("unrealized_pnl_usd", { precision: 18, scale: 4 }).notNull(),
  openedAt: timestamp("opened_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});
```

```ts
// db/schema/news_items.ts
import { pgTable, uuid, text, timestamp, jsonb, varchar } from "drizzle-orm/pg-core";

export const newsItems = pgTable("news_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  source: text("source").notNull(),                        // "newsapi" | "rss:reuters" | "rss:bloomberg" | "x"
  url: text("url").notNull(),
  externalId: text("external_id"),                         // url-hash or guid
  title: text("title").notNull(),
  body: text("body"),
  publishedAt: timestamp("published_at", { withTimezone: true }).notNull(),
  tickers: jsonb("tickers").$type<string[]>().default([]).notNull(),
  sentimentScore: text("sentiment_score"),                 // "-1.000" to "1.000" once Pulse rates it
  ingestedAt: timestamp("ingested_at", { withTimezone: true }).defaultNow().notNull(),
  raw: jsonb("raw").notNull(),
});
```

```ts
// db/schema/news_embeddings.ts
import { pgTable, uuid, vector } from "drizzle-orm/pg-core";
import { newsItems } from "./news_items";

// pgvector dim 768 for `text-embedding-004` (Google) or 1024 for Featherless catalog default.
// We pick 768 to use Gemini embeddings — same provider as half the agents.
export const newsEmbeddings = pgTable("news_embeddings", {
  newsItemId: uuid("news_item_id").primaryKey().references(() => newsItems.id),
  embedding: vector("embedding", { dimensions: 768 }).notNull(),
});
```

```ts
// db/schema/audit_log.ts
import { pgTable, uuid, text, timestamp, jsonb, integer } from "drizzle-orm/pg-core";
import { decisions } from "./decisions";

export const auditLog = pgTable("audit_log", {
  id: uuid("id").defaultRandom().primaryKey(),
  decisionId: uuid("decision_id").references(() => decisions.id),
  proposalId: uuid("proposal_id"),                         // nullable FK; not enforced to allow pre-creation
  agentSlug: text("agent_slug").notNull(),
  kind: text("kind").notNull(),                            // "llm_call" | "tool_call" | "execution" | "veto" | "error"
  provider: text("provider"),                              // "gemini" | "featherless" | "kraken-cli"
  model: text("model"),
  promptText: text("prompt_text"),
  inputImagesUrls: jsonb("input_images_urls").$type<string[]>().default([]).notNull(),
  responseText: text("response_text"),
  responseJson: jsonb("response_json"),
  tokensIn: integer("tokens_in"),
  tokensOut: integer("tokens_out"),
  latencyMs: integer("latency_ms"),
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});
```

```ts
// db/schema/daily_briefs.ts
import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";
import { portfolios } from "./portfolios";

export const dailyBriefs = pgTable("daily_briefs", {
  id: uuid("id").defaultRandom().primaryKey(),
  portfolioId: uuid("portfolio_id").references(() => portfolios.id).notNull(),
  sessionDate: text("session_date").notNull(),             // "2026-05-15"
  headline: text("headline").notNull(),
  body: text("body").notNull(),                            // markdown, ~400 words
  tweetText: text("tweet_text").notNull(),                 // <=280 chars
  equityCurvePngUrl: text("equity_curve_png_url"),
  generatedAt: timestamp("generated_at", { withTimezone: true }).defaultNow().notNull(),
});
```

```ts
// db/schema/leaderboard_snapshots.ts
import { pgTable, uuid, numeric, timestamp, jsonb } from "drizzle-orm/pg-core";
import { portfolios } from "./portfolios";

export const leaderboardSnapshots = pgTable("leaderboard_snapshots", {
  id: uuid("id").defaultRandom().primaryKey(),
  portfolioId: uuid("portfolio_id").references(() => portfolios.id).notNull(),
  snapshotAt: timestamp("snapshot_at", { withTimezone: true }).defaultNow().notNull(),
  nav: numeric("nav", { precision: 18, scale: 4 }).notNull(),
  cumulativePctReturn: numeric("cumulative_pct_return", { precision: 8, scale: 4 }).notNull(),
  drawdownPct: numeric("drawdown_pct", { precision: 8, scale: 4 }).notNull(),
  positions: jsonb("positions").$type<Array<{
    ticker: string;
    quantity: string;
    markPrice: string;
    unrealizedPnlUsd: string;
  }>>().notNull(),
});
```

```ts
// db/schema/api_keys.ts
import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";
import { users } from "./users";

export const apiKeys = pgTable("api_keys", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  provider: text("provider").notNull(),                    // "kraken" | "gemini" | "featherless" | "vultr"
  label: text("label").notNull(),                          // user-facing label
  // Stored encrypted at rest using libsodium sealed-box with VAULT_KEY env var
  encryptedValue: text("encrypted_value").notNull(),
  scope: text("scope").notNull(),                          // "read-only" | "read-write"
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  rotatedAt: timestamp("rotated_at", { withTimezone: true }),
});
```

```ts
// db/schema/social_posts.ts
import { pgTable, uuid, text, integer, timestamp } from "drizzle-orm/pg-core";

export const socialPosts = pgTable("social_posts", {
  id: uuid("id").defaultRandom().primaryKey(),
  platform: text("platform").notNull(),                    // "x" | "linkedin" | "threads"
  externalId: text("external_id"),                         // tweet ID
  url: text("url"),
  body: text("body").notNull(),
  postedAt: timestamp("posted_at", { withTimezone: true }).defaultNow().notNull(),
  impressions: integer("impressions").default(0).notNull(),
  likes: integer("likes").default(0).notNull(),
  reposts: integer("reposts").default(0).notNull(),
  replies: integer("replies").default(0).notNull(),
  lastSyncedAt: timestamp("last_synced_at", { withTimezone: true }),
});
```

### 7.2 Extensions and indexes

```sql
-- Run once via `drizzle-kit push` or manual migration
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS pg_trgm;            -- fast ILIKE on news.title
CREATE EXTENSION IF NOT EXISTS pgcrypto;           -- gen_random_uuid (Drizzle uses this for defaultRandom)

-- Hot path indexes
CREATE INDEX idx_audit_log_decision ON audit_log (decision_id, created_at DESC);
CREATE INDEX idx_audit_log_agent ON audit_log (agent_slug, created_at DESC);
CREATE INDEX idx_proposals_decision ON proposals (decision_id);
CREATE INDEX idx_trades_portfolio_placed ON trades (portfolio_id, placed_at DESC);
CREATE INDEX idx_positions_portfolio ON positions (portfolio_id);
CREATE INDEX idx_news_items_published ON news_items (published_at DESC);
CREATE INDEX idx_news_items_tickers_gin ON news_items USING GIN (tickers);  -- jsonb array contains
CREATE INDEX idx_news_items_title_trgm ON news_items USING GIN (title gin_trgm_ops);
CREATE INDEX idx_leaderboard_portfolio_time ON leaderboard_snapshots (portfolio_id, snapshot_at DESC);

-- pgvector IVFFlat index for cosine sim search (build after first ~1k rows; lists ≈ sqrt(N))
CREATE INDEX idx_news_embeddings_ivfflat
  ON news_embeddings USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 64);

-- Constraint: idempotency on trades (already via .unique() in Drizzle, this enforces in SQL)
CREATE UNIQUE INDEX uq_trades_idempotency ON trades (idempotency_key);

-- Constraint: one decision per portfolio per session_date
CREATE UNIQUE INDEX uq_decisions_portfolio_session
  ON decisions (portfolio_id, session_date) WHERE status != 'failed';
```

### 7.3 Migrations strategy

- Drizzle Kit (`drizzle-kit`) generates SQL migrations from schema diffs
- Migrations live in `db/migrations/*.sql`
- CI step (GitHub Actions on push to `main`): `drizzle-kit check` to verify no drift
- Deployment (Coolify post-deploy hook): `drizzle-kit migrate` runs before app starts
- Rollback: keep `down` SQL for each migration; manual apply only if needed
- Local dev: `drizzle-kit push` for fast iteration; never `push` to production

**Migration order on May 13:**
1. `0001_init.sql` — all tables above
2. `0002_extensions.sql` — vector, pg_trgm, pgcrypto + the SQL indexes block
3. `0003_seed_agents.sql` — INSERT the six agent rows with slugs and system prompt versions
4. `0004_seed_demo_portfolio.sql` — INSERT one demo portfolio with `nav_open=100000`, the standard risk params, and inception_date=2026-05-13

---

## 8. Agent design

All agents share a common contract: they consume typed input, call exactly one LLM provider, return a Zod-validated output, and every call is appended to `audit_log`. Agents are pure functions modulo their LLM call — orchestration owns the state.

### 8.1 Atlas — Fundamental long/short PM

- **Role:** Long-horizon (5–60 day) trades on Kraken xStocks based on fundamentals (10-K/10-Q financials, earnings deck PDFs, valuation multiples).
- **LLM + provider:** Gemini 2.0 Pro via `@google/generative-ai`. Reasoning-heavy, slow OK.
- **Inputs (typed):**
```ts
type AtlasInput = {
  decisionId: string;
  watchlist: Array<{
    ticker: string;
    underlyingTicker: string;
    sector: string;
    lastPrice: number;
    marketCapUsd: number;
  }>;
  filings: Array<{
    ticker: string;
    docType: "10-K" | "10-Q" | "8-K" | "earnings-deck";
    filedAt: string;
    pageImageUrls: string[];   // local URLs to rasterized PDF pages, fed to Gemini Vision
  }>;
  currentPositions: Array<{ ticker: string; quantity: number; avgEntry: number }>;
  riskParams: Portfolio["riskParams"];
};
```
- **Outputs (Zod):**
```ts
import { z } from "zod";

export const AtlasOutputSchema = z.object({
  proposals: z.array(z.object({
    ticker: z.string().regex(/^[A-Z]{1,5}x$/),                          // xStock suffix enforced
    underlyingTicker: z.string().regex(/^[A-Z]{1,5}$/),
    side: z.enum(["buy", "sell", "short", "cover"]),
    sizeUsd: z.number().positive().max(10_000),                          // hard upper cap per single proposal
    conviction: z.number().min(0).max(1),
    horizonDays: z.number().min(5).max(60),
    thesis: z.string().min(80).max(1200),
    riskNotes: z.string().min(20).max(400),
    citations: z.array(z.object({
      docType: z.enum(["10-K", "10-Q", "8-K", "earnings-deck"]),
      ticker: z.string(),
      pageNumber: z.number().int().positive(),
      excerpt: z.string().max(300),
    })).min(1),                                                          // must cite a filing
  })).max(3),                                                            // <=3 proposals per session
  notesToCommittee: z.string().max(800),
});

export type AtlasOutput = z.infer<typeof AtlasOutputSchema>;
```
- **Tools:**
```ts
interface AtlasTools {
  fetchFilingPages(args: { ticker: string; docType: "10-K" | "10-Q"; limitPages: number }): Promise<{ pageImageUrls: string[] }>;
  computeValuationMetrics(args: { ticker: string }): Promise<{ pe: number; pb: number; evEbitda: number; fcfYield: number }>;
}
```
- **System prompt:**
```
You are Atlas, the fundamental long/short Portfolio Manager of Polly, an autonomous AI hedge fund trading Kraken xStocks (tokenized U.S. equities).

Your discipline: deep fundamentals. You think in 10-Ks, cash flows, moats, valuation. You hold positions 5–60 days. You do not chase momentum.

You will receive:
- A watchlist of {{watchlist_count}} tickers with last prices and market caps.
- {{filings_count}} recent SEC filings, rasterized to images. Read them with care; cite page numbers.
- Current portfolio positions (you may propose adds, trims, or closes).
- Risk parameters: max position {{max_position_pct}}% NAV, max sector {{max_sector_pct}}% NAV.

For each proposal you MUST:
1. Choose a ticker from the watchlist OR a current position.
2. Specify side: buy, sell (close long), short, cover (close short).
3. Size in USD, between $500 and $10,000.
4. Conviction 0–1. Be honest. Use 0.9+ sparingly.
5. Thesis: 80–1200 chars. Specific numbers from the filings. No platitudes.
6. Citations: at least one filing page with an exact excerpt.

Output strict JSON matching the schema. No prose outside JSON.

Today: {{today_iso}}. Session: {{session_date}}. Decision ID: {{decision_id}}.
```
- **Constraints:**
  - Max 3 proposals per session.
  - Must include at least one filing citation per proposal (Zod-enforced).
  - sizeUsd capped at $10k per proposal (Zod-enforced).
  - If `conviction < 0.5`, the orchestrator may suppress the proposal (Sentinel-level gate, not Atlas-level).
- **Failure modes + fallbacks:**
  - Gemini Pro 429: retry with 2s, 4s, 8s; on third failure, downgrade to Gemini Flash with same prompt and `conviction_cap=0.6` applied post-hoc.
  - Vision parse failure on a PDF page: skip that page, continue with remaining; log to audit.
  - Schema validation failure: re-prompt once with `"Your previous response failed validation: {{zod_error}}. Reply with valid JSON only."`. If second attempt fails, return `{ proposals: [], notesToCommittee: "Atlas offline: schema failure" }`.

### 8.2 Crest — Technical momentum PM

- **Role:** Short-horizon (1–10 day) trades based on price action, volume, and chart structure.
- **LLM + provider:** Gemini 2.0 Flash (speed > depth). Vision call on candlestick PNG.
- **Inputs (typed):**
```ts
type CrestInput = {
  decisionId: string;
  watchlist: Array<{
    ticker: string;
    underlyingTicker: string;
    last: number;
    sma20: number;
    sma50: number;
    sma200: number;
    rsi14: number;
    atr14: number;
    volume: number;
    chartPngUrl: string;   // server-rendered candlestick + volume, 1024×640
  }>;
  riskParams: Portfolio["riskParams"];
};
```
- **Outputs (Zod):**
```ts
export const CrestOutputSchema = z.object({
  proposals: z.array(z.object({
    ticker: z.string().regex(/^[A-Z]{1,5}x$/),
    underlyingTicker: z.string().regex(/^[A-Z]{1,5}$/),
    side: z.enum(["buy", "sell", "short", "cover"]),
    sizeUsd: z.number().positive().max(8_000),
    conviction: z.number().min(0).max(1),
    horizonDays: z.number().min(1).max(10),
    thesis: z.string().min(60).max(800),
    riskNotes: z.string().min(20).max(300),
    setupName: z.enum([
      "breakout", "pullback-to-20sma", "bull-flag", "bear-flag",
      "double-bottom", "double-top", "trend-continuation", "mean-reversion-oversold", "mean-reversion-overbought"
    ]),
    keyLevels: z.object({
      entry: z.number(),
      stop: z.number(),
      target: z.number(),
    }),
  })).max(3),
  notesToCommittee: z.string().max(600),
});

export type CrestOutput = z.infer<typeof CrestOutputSchema>;
```
- **Tools:** Crest is mostly Vision-driven; no tool calls in v1. Charts are pre-rendered.
- **System prompt:**
```
You are Crest, the technical momentum Portfolio Manager of Polly.

Your discipline: price action. You read candles, volume, key levels, and named setups. You hold 1–10 days. You set explicit stops and targets.

You will receive {{watchlist_count}} tickers, each with a candlestick+volume chart image and basic indicators (SMA20/50/200, RSI14, ATR14).

For each proposal:
1. Identify a named setup from this list: breakout, pullback-to-20sma, bull-flag, bear-flag, double-bottom, double-top, trend-continuation, mean-reversion-oversold, mean-reversion-overbought.
2. Specify entry, stop, and target levels (numbers).
3. Risk/reward ratio (target − entry) / (entry − stop) for longs MUST be >= 1.5.
4. Size in USD, max $8,000.
5. Conviction 0–1.
6. Thesis: read the chart out loud — name the candles, the volume signature, the levels you see.

Reject any setup where you cannot draw the keyLevels triangle clearly. Output strict JSON.

Session: {{session_date}}. Decision ID: {{decision_id}}.
```
- **Constraints:**
  - R:R >= 1.5 enforced post-hoc by orchestrator (Zod can't enforce arithmetic between fields).
  - Stop and target on opposite sides of entry, sign-matched to side (orchestrator-validated).
- **Failure modes + fallbacks:**
  - Chart PNG generation failure: skip that ticker.
  - Flash 429: retry 1s/2s; then degrade to Pro (slower but reliable).
  - Setup-name out of enum: re-prompt once.

### 8.3 Forge — Macro thematic PM

- **Role:** Medium-horizon (10–60 day) trades driven by macro themes (rate path, growth/inflation, sector rotation, geopolitical).
- **LLM + provider:** Gemini 2.0 Pro with Vision (FOMC dot plot, CPI heatmap, yield curve PNGs).
- **Inputs (typed):**
```ts
type ForgeInput = {
  decisionId: string;
  macroImages: Array<{
    label: "fomc-dot-plot" | "cpi-heatmap" | "yield-curve" | "pmi-map" | "labor-market" | "credit-spreads";
    asOf: string;            // ISO date
    imageUrl: string;
    sourceDescription: string;
  }>;
  watchlistByTheme: Record<string, string[]>;   // theme name → tickers (e.g. "rate-sensitive" → ["XLREx","TLTx","HYGx"])
  riskParams: Portfolio["riskParams"];
};
```
- **Outputs (Zod):**
```ts
export const ForgeOutputSchema = z.object({
  themeAssessment: z.array(z.object({
    theme: z.string(),
    stance: z.enum(["bullish", "neutral", "bearish"]),
    confidence: z.number().min(0).max(1),
    rationale: z.string().min(80).max(800),
    imageEvidence: z.array(z.string()),   // labels of macroImages cited
  })).min(1).max(4),
  proposals: z.array(z.object({
    ticker: z.string().regex(/^[A-Z]{1,5}x$/),
    underlyingTicker: z.string().regex(/^[A-Z]{1,5}$/),
    side: z.enum(["buy", "sell", "short", "cover"]),
    sizeUsd: z.number().positive().max(10_000),
    conviction: z.number().min(0).max(1),
    horizonDays: z.number().min(10).max(60),
    thesis: z.string().min(80).max(1000),
    riskNotes: z.string().min(20).max(400),
    drivingTheme: z.string(),
  })).max(3),
  notesToCommittee: z.string().max(800),
});

export type ForgeOutput = z.infer<typeof ForgeOutputSchema>;
```
- **Tools:** None in v1; macro images are pre-staged in `/public/macro/<asOf>/`.
- **System prompt:**
```
You are Forge, the macro thematic Portfolio Manager of Polly.

Your discipline: top-down. You read FOMC dot plots, CPI heatmaps, yield curves, PMIs, labor markets, credit spreads, and translate them into themes (e.g. "rates higher for longer", "growth slowdown", "USD weaker", "energy supply tight"), then express those themes via Kraken xStocks.

You will receive {{macro_images_count}} macro images. Read them literally — extract numbers from dots, columns from heatmaps, slope from curves.

Process:
1. First, write a themeAssessment: 1–4 themes you currently see in the data. Each cites at least one macroImage label.
2. Then, express up to 3 themes through specific xStock trades. Long/short equity, sector ETFs, or rate-proxy tickers (TLTx, IEFx if available, otherwise rate-sensitive sectors).
3. drivingTheme on each proposal MUST match a theme name from themeAssessment.

You hold 10–60 days. Conviction below 0.4 means "don't bother — return no proposal for that theme."

Output strict JSON. Session: {{session_date}}.
```
- **Constraints:**
  - Every proposal's `drivingTheme` must appear in `themeAssessment[].theme` (orchestrator-validated).
  - Max 4 themes per session.
- **Failure modes + fallbacks:**
  - Vision can't read dot plot (e.g. low-res image): fall back to text-only macro summary auto-generated from FRED API as a substitute input.
  - Pro 429: same retry/downgrade as Atlas.

### 8.4 Pulse — Event-driven / sentiment PM

- **Role:** Same-day / next-day trades from news, sentiment, and catalysts. The "fast brain."
- **LLM + provider:** **Featherless** (domain-specialized financial model — see §16 for exact model). Fallback: Vultr Serverless Inference (Llama-3.x), also fallback: Gemini Flash.
- **Inputs (typed):**
```ts
type PulseInput = {
  decisionId: string;
  newsItems: Array<{
    id: string;
    source: string;
    title: string;
    body: string;
    publishedAt: string;
    tickers: string[];
  }>;
  xSamples: Array<{
    handle: string;
    text: string;
    postedAt: string;
    likes: number;
    impressions: number;
  }>;
  watchlistTickers: string[];
  riskParams: Portfolio["riskParams"];
};
```
- **Outputs (Zod):**
```ts
export const PulseOutputSchema = z.object({
  sentimentByTicker: z.record(
    z.string(),
    z.object({
      sentiment: z.number().min(-1).max(1),
      volume: z.number().int().nonnegative(),       // # of items contributing
      topHeadlines: z.array(z.string()).max(3),
    })
  ),
  catalysts: z.array(z.object({
    ticker: z.string(),
    catalystType: z.enum([
      "earnings", "guidance-change", "M&A", "regulatory",
      "macro-print", "product-launch", "litigation", "executive-change"
    ]),
    summary: z.string().min(40).max(400),
    expectedImpact: z.enum(["high-positive", "low-positive", "neutral", "low-negative", "high-negative"]),
  })).max(8),
  proposals: z.array(z.object({
    ticker: z.string().regex(/^[A-Z]{1,5}x$/),
    underlyingTicker: z.string().regex(/^[A-Z]{1,5}$/),
    side: z.enum(["buy", "sell", "short", "cover"]),
    sizeUsd: z.number().positive().max(6_000),
    conviction: z.number().min(0).max(1),
    horizonDays: z.number().min(0.25).max(3),       // 6 hours to 3 days
    thesis: z.string().min(60).max(700),
    catalystRef: z.string(),                         // index or summary referencing catalysts[]
  })).max(3),
  notesToCommittee: z.string().max(600),
});

export type PulseOutput = z.infer<typeof PulseOutputSchema>;
```
- **Tools:**
```ts
interface PulseTools {
  fetchLiveHeadlines(args: { ticker: string; since: string }): Promise<NewsItem[]>;
  fetchXSamples(args: { tickerCashtag: string; minLikes: number }): Promise<XSample[]>;
}
```
- **System prompt:**
```
You are Pulse, the event-driven and sentiment Portfolio Manager of Polly.

Your discipline: catalysts and crowd-mood. You read news in real time, identify catalysts, score sentiment per ticker, and propose fast trades (6 hours to 3 days). You're the only PM allowed to be aggressively short-term.

You will receive:
- {{news_count}} news items from the last 6 hours, deduplicated by embedding.
- {{x_count}} representative X posts mentioning watchlist tickers.
- The watchlist.

For each ticker that appears in news AND has >=3 items, emit a sentimentByTicker entry. Score:
  +1.0 = strongly positive (clear bullish catalyst)
  +0.5 = mildly positive
   0.0 = neutral or balanced
  -0.5 = mildly negative
  -1.0 = clearly bearish

Identify up to 8 catalysts with type and expected impact.

Propose up to 3 trades. Only propose if conviction >= 0.55. catalystRef must point to a real catalyst in your list.

You are running on a domain-specialized financial model. Trust your sentiment instincts; don't second-guess into a flat read.

Output strict JSON. Session: {{session_date}}.
```
- **Constraints:**
  - sizeUsd capped lower ($6k) than Atlas/Forge because event-driven has wider stops.
  - Horizon must be < 3 days (event-driven, not swing).
  - Every proposal must reference a real `catalystType` (orchestrator validates index).
- **Failure modes + fallbacks:**
  - Featherless 429 or 5xx: retry once at 2s; then route to Vultr Serverless Inference (same prompt, generic Llama 3.x). If that also fails, Gemini Flash with stripped system prompt.
  - News API empty (off-hours): Pulse returns `proposals: []` and an empty assessment — no synthetic trades.
  - Schema validation failure: re-prompt once with the validation error included.

### 8.5 Sentinel — Risk officer

- **Role:** Reviews all PM proposals. Veto, modify, or approve. Maintains cross-fund VaR, sector and position caps, daily loss limit, cooldown enforcement.
- **LLM + provider:** Gemini 2.0 Flash (latency matters). Most logic is deterministic; LLM is used for *explanation* of veto reasons and edge-case adjudication when proposals conflict.
- **Inputs (typed):**
```ts
type SentinelInput = {
  decisionId: string;
  proposals: ProposalDraft[];        // all PM outputs concatenated
  currentPositions: Position[];
  navCurrent: number;
  navOpen: number;
  realizedPnlToday: number;
  riskParams: Portfolio["riskParams"];
  varInputs: {
    // 30-day daily return series per held ticker, plus pairwise correlations
    returns: Record<string, number[]>;
    correlationMatrix: Record<string, Record<string, number>>;
  };
};
```
- **Outputs (Zod):**
```ts
export const SentinelOutputSchema = z.object({
  verdicts: z.array(z.object({
    proposalId: z.string().uuid(),
    verdict: z.enum(["approve", "modify", "veto"]),
    reason: z.string().min(20).max(500),
    modifiedSizeUsd: z.number().positive().optional(),
    incrementalVar: z.number().nonnegative(),                  // dollars
    postTradePositionPctNav: z.number().nonnegative(),
    postTradeSectorPctNav: z.number().nonnegative(),
  })),
  portfolioVarAfter: z.number().nonnegative(),
  riskNarrative: z.string().min(40).max(800),                  // for the audit log + tweet
});

export type SentinelOutput = z.infer<typeof SentinelOutputSchema>;
```
- **Tools:**
```ts
interface SentinelTools {
  computeIncrementalVar(args: {
    currentPositions: Position[];
    candidate: ProposalDraft;
    returnsByTicker: Record<string, number[]>;
    correlationMatrix: Record<string, Record<string, number>>;
    confidence: number;
    horizonDays: number;
  }): { incrementalVar: number; portfolioVarAfter: number };
}
```
- **System prompt:**
```
You are Sentinel, the risk officer of Polly.

Your job: protect capital. You are the only agent that can stop a trade. Your verdicts are final.

Hard rules (apply BEFORE the LLM call; the orchestrator pre-screens):
- Position size > {{max_position_pct}}% NAV post-trade → VETO.
- Sector exposure > {{max_sector_pct}}% NAV post-trade → MODIFY (cap to limit) or VETO if cap < $500.
- Daily realized + unrealized loss > {{daily_loss_limit_pct}}% NAV → VETO all new risk-on trades for the day.
- Same ticker traded < {{cooldown_minutes}} minutes ago → VETO.
- Incremental VaR > 1.5% of NAV → VETO.

Your LLM job: when proposals from different PMs conflict (e.g. Atlas long NVDA, Pulse short NVDA), adjudicate. Read both theses. Decide which to approve, or veto both if neither is convincing.

For each proposal, output a verdict with a 20–500 char reason. Then output a riskNarrative — a 40–800 char paragraph summarizing the day's risk posture (this becomes part of the tweet).

You are paranoid. When in doubt, veto. Be specific about WHY in the reason.

Session: {{session_date}}. Current NAV: ${{nav_current}}. Open NAV: ${{nav_open}}. Realized PnL today: ${{realized_pnl_today}}.
```
- **Constraints:**
  - Hard rules in the prompt are also enforced in code (the LLM is advisory, not authoritative for the deterministic checks).
  - Every veto has a human-readable reason logged to `audit_log` with `kind="veto"`.
- **Failure modes + fallbacks:**
  - Gemini Flash unavailable: fall back to deterministic-only risk path (no LLM-driven conflict adjudication; conflicts auto-resolved by "highest conviction wins; loser vetoed").
  - VaR computation NaN (degenerate returns matrix): clamp to portfolio-volatility proxy = 1.5% NAV × position size; log warning.

### 8.6 Executor — Order placement

- **Role:** Take approved proposals, place paper trades via Kraken CLI. NOT an LLM agent.
- **LLM + provider:** None. Pure code.
- **Inputs (typed):**
```ts
type ExecutorInput = {
  decisionId: string;
  approvedProposals: Array<ProposalDraft & {
    proposalId: string;
    finalSizeUsd: number;     // post-Sentinel modification
  }>;
};
```
- **Outputs (Zod):**
```ts
export const ExecutorOutputSchema = z.object({
  results: z.array(z.object({
    proposalId: z.string().uuid(),
    krakenOrderId: z.string().nullable(),
    idempotencyKey: z.string(),
    status: z.enum(["filled", "partial", "rejected", "errored"]),
    fillPrice: z.number().nullable(),
    fees: z.number().nonnegative(),
    errorMessage: z.string().nullable(),
  })),
});
```
- **Tools:**
```ts
interface ExecutorTools {
  krakenPlaceOrder(args: {
    pair: string;
    side: "buy" | "sell";
    type: "market";          // v1 = market only; limit in P2
    sizeBaseUnits: number;
    idempotencyKey: string;
    paperMode: true;
  }): Promise<KrakenOrderResponse>;
}
```
- **Mechanism:**
```ts
import { spawn } from "node:child_process";

function krakenCli(args: string[], timeoutMs = 8000): Promise<{ code: number; stdout: string; stderr: string }> {
  return new Promise((resolve, reject) => {
    const child = spawn("kraken", args, { env: { ...process.env, KRAKEN_PAPER: "1" } });
    let stdout = "", stderr = "";
    const t = setTimeout(() => { child.kill("SIGKILL"); reject(new Error("kraken-cli timeout")); }, timeoutMs);
    child.stdout.on("data", (d) => stdout += d);
    child.stderr.on("data", (d) => stderr += d);
    child.on("close", (code) => { clearTimeout(t); resolve({ code: code ?? -1, stdout, stderr }); });
  });
}
```
- **Constraints:**
  - Paper mode ONLY (`KRAKEN_PAPER=1`).
  - Idempotency key = SHA-256 of `decisionId + proposalId + ticker + side + finalSizeUsd`. Unique constraint on `trades.idempotency_key` prevents double-fill.
  - Each retry uses the same idempotency key. Kraken CLI is expected to deduplicate (verify in §16 open questions).
  - Max 3 attempts per proposal, exponential backoff: 1s, 2s, 4s.
- **Failure modes + fallbacks:**
  - CLI binary missing: error to audit_log; mark proposal as `errored`; do not block remaining proposals.
  - Timeout: retry; on third timeout, mark `errored`.
  - Insufficient cash (paper): mark `rejected` with reason from CLI stderr.

---

## 9. API surface

### 9.1 Server actions

Located in `app/_actions/*.ts`. All use `"use server"` and `zod.parseAsync` on inputs.

```ts
// app/_actions/committee.ts
"use server";

export async function triggerCommitteeManually(input: {
  portfolioId: string;
  asOf?: string;     // optional ISO; defaults to now
}): Promise<{ decisionId: string; status: "started" }> { /* ... */ }

export async function getDecisionStatus(input: {
  decisionId: string;
}): Promise<{
  status: "in_progress" | "complete" | "failed";
  startedAt: string;
  completedAt?: string;
  errorMessage?: string;
  proposalCount: number;
  approvedCount: number;
  vetoedCount: number;
}> { /* ... */ }
```

```ts
// app/_actions/portfolio.ts
"use server";

export async function getPortfolioSnapshot(input: {
  portfolioId: string;
}): Promise<{
  navCurrent: number;
  navOpen: number;
  navHigh: number;
  cash: number;
  drawdownPct: number;
  positions: Array<{ ticker: string; quantity: number; avgEntry: number; mark: number; unrealizedPnlUsd: number }>;
  todayPnlUsd: number;
}> { /* ... */ }

export async function getEquityCurve(input: {
  portfolioId: string;
  windowDays: 7 | 14 | 30 | 90;
}): Promise<Array<{ t: string; nav: number; drawdown: number }>> { /* ... */ }
```

```ts
// app/_actions/audit.ts
"use server";

export async function listDecisions(input: {
  portfolioId: string;
  limit?: number;
  before?: string;
}): Promise<Array<{
  id: string;
  sessionDate: string;
  status: string;
  proposalCount: number;
  approvedCount: number;
  vetoedCount: number;
  startedAt: string;
}>> { /* ... */ }

export async function getDecisionDetail(input: {
  decisionId: string;
}): Promise<{
  decision: { /* full row */ };
  proposals: Array<{ /* full row + sentinelVerdict */ }>;
  debate: Array<{ /* DebateTurn */ }>;
  auditLog: Array<{ /* full audit_log row, possibly truncated promptText */ }>;
  trades: Array<{ /* full trades row */ }>;
}> { /* ... */ }
```

```ts
// app/_actions/keys.ts
"use server";

export async function upsertApiKey(input: {
  provider: "kraken" | "gemini" | "featherless" | "vultr";
  label: string;
  rawValue: string;
  scope: "read-only" | "read-write";
}): Promise<{ id: string }> { /* encrypts via libsodium sealed-box, persists */ }

export async function listApiKeys(): Promise<Array<{
  id: string;
  provider: string;
  label: string;
  scope: string;
  createdAt: string;
  rotatedAt?: string;
}>> { /* never returns the value */ }

export async function deleteApiKey(input: { id: string }): Promise<void> { /* ... */ }
```

### 9.2 Route handlers

```ts
// app/api/health/route.ts
// GET /api/health → 200 { ok: true, deps: { db, gemini, featherless, kraken } }

// app/api/inngest/route.ts
// POST /api/inngest → Inngest webhook receiver (handles cron + step events)

// app/api/webhook/x/route.ts
// POST /api/webhook/x → engagement sync (called by cron, not external webhook)

// app/api/portfolio/snapshot/route.ts
// GET /api/portfolio/snapshot?portfolioId=... → JSON snapshot for Kraken evaluation
//   (public, rate-limited, no auth required for the demo portfolio)

// app/api/gemini-trace/route.ts
// GET /api/gemini-trace → last 50 Gemini calls (model, tokens, latency, hadImage)

// app/api/featherless-trace/route.ts
// GET /api/featherless-trace → last 50 Featherless calls

// app/api/macro/upload/route.ts
// POST /api/macro/upload (multipart) → upload an FOMC PDF / image; rasterizes, stores, indexes
//   (used for the killer demo: drop FOMC statement → Forge picks it up)

// app/api/leaderboard/route.ts
// GET /api/leaderboard → top portfolios by 30-day return + drawdown

// app/api/briefs/[date]/route.ts
// GET /api/briefs/2026-05-19 → daily brief markdown + tweet text + image URL
```

### 9.3 SSE endpoint for live Committee broadcast

```ts
// app/api/committee/stream/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/committee/stream?decisionId=<uuid>
// Server-Sent Events. Emits:
//   event: agent.started   data: { agentSlug, decisionId, at }
//   event: agent.finished  data: { agentSlug, decisionId, proposalCount, at }
//   event: debate.turn     data: { agentSlug, utterance, refersToProposalId, at }
//   event: sentinel.verdict data: { proposalId, verdict, reason, at }
//   event: trade.placed    data: { tradeId, ticker, side, sizeUsd, fillPrice, at }
//   event: committee.complete data: { decisionId, at }
//   event: error           data: { stage, message, at }
//
// Heartbeat every 15s (`event: ping`) to keep proxies alive.
```

Implementation sketch:
```ts
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const decisionId = searchParams.get("decisionId");
  if (!decisionId) return new Response("decisionId required", { status: 400 });

  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: string, data: unknown) => {
        controller.enqueue(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
      };
      const heartbeat = setInterval(() => send("ping", { t: Date.now() }), 15000);

      const unsubscribe = await committeeBus.subscribe(decisionId, (msg) => send(msg.event, msg.data));

      req.signal.addEventListener("abort", () => {
        clearInterval(heartbeat);
        unsubscribe();
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      "Connection": "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
```

`committeeBus` is a simple in-process pub/sub (Map<decisionId, Set<callback>>). For single-VM deployment this is sufficient. If horizontal scale ever needed, switch to Postgres `LISTEN/NOTIFY`.

### 9.4 Webhook endpoints

- `POST /api/inngest` — Inngest workflow webhook (signed, verified by `INNGEST_SIGNING_KEY`)
- (Optional) `POST /api/x/webhook` — X webhook for reply tracking (P2; not v1)

---

## 10. UI / UX design

### 10.1 Design tokens

```css
/* app/globals.css */
@import "tailwindcss";

@theme {
  /* Bloomberg-Stripe Dark */
  --color-bg:           oklch(0.16 0.012 240);   /* zinc-950 vibe */
  --color-surface:      oklch(0.20 0.012 240);   /* zinc-900 */
  --color-surface-2:    oklch(0.24 0.012 240);
  --color-border:       oklch(0.32 0.012 240);
  --color-text:         oklch(0.96 0.005 240);   /* zinc-100 */
  --color-text-muted:   oklch(0.70 0.012 240);
  --color-text-dim:     oklch(0.55 0.012 240);

  --color-green:        oklch(0.78 0.18 145);    /* longs / gains */
  --color-red:          oklch(0.66 0.20 25);     /* shorts / losses */
  --color-amber:        oklch(0.80 0.16 75);     /* warnings / Sentinel */
  --color-violet:       oklch(0.70 0.18 290);    /* Forge macro */
  --color-blue:         oklch(0.74 0.14 220);    /* Atlas */
  --color-teal:         oklch(0.74 0.12 195);    /* Crest */
  --color-magenta:      oklch(0.72 0.20 330);    /* Pulse */

  --font-mono: "JetBrains Mono", ui-monospace, monospace;
  --font-sans: "Inter", ui-sans-serif, system-ui, sans-serif;
  --font-display: "Inter", ui-sans-serif, system-ui;

  --radius-tight: 4px;
  --radius-base: 6px;
  --radius-soft: 10px;
  --radius-pill: 999px;

  --shadow-deck: 0 0 0 1px var(--color-border), 0 8px 32px -8px rgba(0,0,0,0.6);

  --grid-tick: 8px;     /* base spacing unit */
}

html, body {
  background: var(--color-bg);
  color: var(--color-text);
  font-family: var(--font-sans);
}

[data-density="compact"] table td, [data-density="compact"] table th {
  padding: calc(var(--grid-tick) * 0.75) var(--grid-tick);
  font-family: var(--font-mono);
  font-feature-settings: "tnum", "calt" 0;
  font-size: 12px;
}

@media (prefers-reduced-motion: reduce) {
  * { animation: none !important; transition: none !important; }
}
```

Agent palette mapping (used in transcripts, badges, charts):

| Agent | Hex hint | Token |
|---|---|---|
| Atlas | blue | `--color-blue` |
| Crest | teal | `--color-teal` |
| Forge | violet | `--color-violet` |
| Pulse | magenta | `--color-magenta` |
| Sentinel | amber | `--color-amber` |
| Executor | mono text-muted | `--color-text-muted` |

### 10.2 Component library mapping (shadcn, Aceternity, Magic UI)

| Component | Source | Used in |
|---|---|---|
| `Button`, `Card`, `Badge`, `Separator`, `Tabs`, `Dialog`, `Sheet`, `Toast`, `Skeleton` | shadcn/ui | Everywhere |
| `Table` (sticky head, dense rows) | shadcn `data-table` + custom density | Positions, audit log, decisions list |
| `Tooltip` | shadcn | Risk metrics, glossary terms |
| `Command` (cmd-k) | shadcn | Quick nav to ticker / decision id |
| `LineChart`, `AreaChart` | recharts | Equity curve, drawdown, PnL |
| Animated number (count-up) | Custom hook + Framer Motion | NAV, PnL badges |
| `ShineBorder` / glow border | Magic UI | Sentinel veto card |
| `MarqueeText` | Magic UI / custom | Top-of-page ticker tape |
| `BentoGrid` (2-col asymmetric) | Aceternity-inspired | Dashboard summary |
| `BackgroundBeams` (low-amplitude, subtle) | Aceternity | Trading Floor section divider only |
| 3D scene | R3F + drei `OrbitControls`, `Environment`, `Text3D` | Landing Trading Floor |
| Shimmer skeleton | Custom (Tailwind `animate-pulse` overridden with horizontal gradient sweep) | All async loads |

No spinners. Every loading state is a shimmer skeleton sized to the target content shape.

### 10.3 Key screens (text wireframes)

#### 10.3.1 Trading Floor (3D) — `/` (landing)

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  POLLY                                                          [Sign in] >  │
│  ━━━━━                                                                       │
│                                                                              │
│       ╔══════════════════════════════════════════════════════════════╗       │
│       ║                                                              ║       │
│       ║                  [R3F canvas — Trading Floor]                ║       │
│       ║                                                              ║       │
│       ║   • Six low-poly desk meshes arranged in a half-arc:         ║       │
│       ║     Atlas (blue), Crest (teal), Forge (violet),              ║       │
│       ║     Pulse (magenta), Sentinel (amber), Executor (gray).      ║       │
│       ║   • Each desk has a floating Text3D nameplate.               ║       │
│       ║   • Glowing point lights pulse when their agent is "active"  ║       │
│       ║     (driven by SSE: agent.started → glow up, agent.finished  ║       │
│       ║      → fade).                                                ║       │
│       ║   • Slow auto-orbit (5° / sec). OrbitControls enabled.       ║       │
│       ║   • prefers-reduced-motion → static isometric snapshot PNG.  ║       │
│       ║                                                              ║       │
│       ╚══════════════════════════════════════════════════════════════╝       │
│                                                                              │
│   "Five PMs. One paper portfolio. Live."                                     │
│                                                                              │
│   ┌─────────────┐  ┌──────────────────┐  ┌────────────────────────────┐      │
│   │ Live now    │  │ NAV $103,847.22  │  │ Today +1.42%   YTD +3.85%  │      │
│   │ ● Committee │  │ ▲ +$847 today    │  │ Drawdown -0.6%             │      │
│   │   running   │  │                  │  │                            │      │
│   └─────────────┘  └──────────────────┘  └────────────────────────────┘      │
│                                                                              │
│   [ Watch the 09:30 ET committee → ]  [ See audit log → ]                    │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

#### 10.3.2 Investment Committee live stream — `/committee/[decisionId]`

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ ← Back   COMMITTEE · 2026-05-15 · 09:30 ET     [● Live]   shareable URL  ⤴  │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│ ┌──── AGENTS ────────────┐  ┌──── DEBATE TRANSCRIPT ──────────────────────┐  │
│ │ ● Atlas    proposed 2  │  │ 09:25:14  Atlas → "Long NVDAx $2,400 ..."   │  │
│ │ ● Crest    proposed 3  │  │ 09:25:33  Crest → "Setup: pullback-to-20..."│  │
│ │ ○ Forge    proposed 1  │  │ 09:26:01  Forge → "Theme: AI-capex ..."     │  │
│ │ ● Pulse    proposed 2  │  │ 09:26:44  Pulse → "Catalyst: NVDA guides ↑" │  │
│ │ ● Sentinel  reviewing  │  │ 09:27:10  --- Debate begins ---             │  │
│ │ ○ Executor  pending    │  │ 09:27:11  Atlas vs Pulse on NVDAx:          │  │
│ │                        │  │           Atlas: "Long horizon thesis..."   │  │
│ │                        │  │           Pulse: "Short-term catalyst..."   │  │
│ │                        │  │ 09:27:54  Sentinel: "Approve Atlas $2,000;  │  │
│ │                        │  │           cap Pulse to $1,000; veto Crest"  │  │
│ └────────────────────────┘  │ 09:28:42  Executor: 3 orders filled         │  │
│                              │ 09:28:51  ━━━ COMPLETE ━━━                  │  │
│ ┌──── PROPOSAL CARDS ────┐  └──────────────────────────────────────────────┘ │
│ │ ┌───────────────────┐  │                                                   │
│ │ │ NVDAx · BUY       │  │  ┌────── DECISION SUMMARY ───────────────────┐   │
│ │ │ Atlas · $2,000    │  │  │ Decision    36c3f...                       │   │
│ │ │ ▲ APPROVED        │  │  │ Started     09:25:14                        │   │
│ │ │ conv 0.78  h 30d  │  │  │ Completed   09:28:51   (3m 37s)             │   │
│ │ │ ⤷ Sentinel: ok    │  │  │ Proposed    8   Approved 4  Vetoed 4        │   │
│ │ └───────────────────┘  │  │ Trades      4   Filled 4   Rejected 0       │   │
│ │ ┌───────────────────┐  │  │ Portfolio VaR  $1,420   (1.37% NAV)          │   │
│ │ │ TSLAx · SHORT     │  │  │ Risk narrative: "Concentration trimmed in   │   │
│ │ │ Pulse · $1,000    │  │  │  tech; energy hedge added; daily loss limit │   │
│ │ │ ⚠ MODIFIED        │  │  │  intact at -0.4%."                          │   │
│ │ │ from $1,800 → cap │  │  └─────────────────────────────────────────────┘   │
│ │ │ Sentinel: sector  │  │                                                   │
│ │ │  cap reached      │  │  [ Audit log → ] [ Replay this committee → ]      │
│ │ └───────────────────┘  │                                                   │
│ │ ... (scroll)            │                                                   │
│ └────────────────────────┘                                                   │
└──────────────────────────────────────────────────────────────────────────────┘
```

The transcript area auto-scrolls. Each turn renders with agent color stripe on the left. Sentinel verdicts use a yellow shine border. Executor lines are mono-gray.

#### 10.3.3 Portfolio / Positions / Open Orders — `/portfolio`

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  PORTFOLIO  ·  Polly Main                            [Manual committee ▶]    │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─ NAV ─────────┐  ┌─ TODAY ──────┐  ┌─ INCEPTION ──┐  ┌─ DRAWDOWN ────┐    │
│  │ $103,847.22   │  │ ▲ +1.42%     │  │ ▲ +3.85%     │  │ -0.62%        │    │
│  │ ▲ +$847       │  │ +$1,453      │  │ +$3,847      │  │ max -1.2%     │    │
│  └───────────────┘  └──────────────┘  └──────────────┘  └───────────────┘    │
│                                                                              │
│  ┌── POSITIONS (12) ──────────────────────────────────────────────────────┐  │
│  │ Ticker    Side  Qty       Avg     Mark    Unrealized   %NAV  Opened    │  │
│  │────────────────────────────────────────────────────────────────────────│  │
│  │ NVDAx     LONG   3.2421   895.40  912.17  ▲ +$54.32    2.81%  05-13   │  │
│  │ TSLAx     SHORT  4.1100   240.85  234.10  ▲ +$27.73    0.93%  05-14   │  │
│  │ XLEx      LONG   12.3000   88.20   89.05  ▲ +$10.46    1.05%  05-13   │  │
│  │ TLTx      SHORT   8.7400   95.40   94.20  ▲ +$10.49    0.79%  05-12   │  │
│  │ ...                                                                    │  │
│  │────────────────────────────────────────────────────────────────────────│  │
│  │                                          Σ unrealized   ▲ +$478.21     │  │
│  └────────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│  ┌── OPEN ORDERS (0) ─────────────────────────────────────────────────────┐  │
│  │ (no open orders — all trades fill same-second in paper mode)            │  │
│  └────────────────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────────────┘
```

#### 10.3.4 P&L equity curve + drawdown — `/pnl`

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  EQUITY  ·  last 30 days        [ 7d ] [ 14d ] [● 30d ] [ 90d ]              │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  $108k ┤                                              ╭─────                │
│        │                                          ╭───╯                     │
│  $106k ┤                                     ╭────╯                          │
│        │                          ╭───╮ ╭────╯                               │
│  $104k ┤                  ╭──╮ ╭──╯   ╰─╯                                    │
│        │              ╭───╯  ╰─╯                                             │
│  $102k ┤  ╭───╮ ╭────╯                                                       │
│        │ ╭╯   ╰─╯                                                            │
│  $100k ┤─╯                                                  Start ──         │
│        └─┬────┬────┬────┬────┬────┬────┬────┬────┬────┬────┬────┬─           │
│        Apr15  20    25   30  May5   10   15   20   25  30  Jun4              │
│                                                                              │
│  ── nav   ··· high-water mark                                                │
│                                                                              │
│  DRAWDOWN                                                                    │
│     0% ┤━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━                   │
│   -0.5%┤        ╲      ╱╲    ╲╱╲     ╱╲          ╲                          │
│   -1.0%┤         ╲    ╱   ╲      ╲ ╱   ╲   ╱╲    ╱                          │
│   -1.5%┤          ╲╱        ╲      ╲     ╲ ╱  ╲ ╱                           │
│        └──────────────────────────────────────────────                       │
│                                                                              │
│  ┌── METRICS ─────────────────────────────────────────────────────────────┐  │
│  │ Total return    +3.85%      Sharpe (30d)    1.84                       │  │
│  │ Max drawdown    -1.42%      Sortino         2.31                       │  │
│  │ Volatility 1d   0.78%       Hit rate         62%                       │  │
│  │ Best day       +1.42%       Worst day      -0.91%                      │  │
│  └────────────────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────────────┘
```

#### 10.3.5 Decision timeline (audit log viewer) — `/audit/[decisionId]`

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  ← Decisions    AUDIT · 36c3f8a2-...  ·  2026-05-15 · 09:25–09:28 ET         │
├─────────────────────────────────┬────────────────────────────────────────────┤
│                                 │                                            │
│  TIMELINE                       │   FOCUS: Atlas → Gemini Pro                │
│  ━━━━━━━━                       │                                            │
│  09:25:14  decision.started     │   Provider     google                      │
│  09:25:18  ▸ atlas.input        │   Model        gemini-2.0-pro-exp          │
│  09:25:19  ▸ atlas.gemini.call  │   Tokens in    14,302                      │
│  ●  ↑ selected                  │   Tokens out   1,847                       │
│  09:25:34  ▾ atlas.output       │   Latency      14,201 ms                   │
│  09:25:34  ▸ crest.input        │   Images       3  (NVDA 10-K pp. 47–49)    │
│  09:25:36  ▸ crest.gemini.call  │                                            │
│  09:25:46  ▾ crest.output       │   PROMPT (first 600 chars)                 │
│  09:25:48  ▸ forge.input        │   ────────────────────────────             │
│  09:25:49  ▸ forge.gemini.call  │   You are Atlas, the fundamental long...   │
│  09:26:18  ▾ forge.output       │   Your discipline: deep fundamentals...    │
│  09:26:18  ▸ pulse.input        │   [show full] [copy]                       │
│  09:26:20  ▸ pulse.feather.call │                                            │
│  09:26:38  ▾ pulse.output       │   RESPONSE                                 │
│  09:26:38  --- debate ---       │   ────────                                 │
│  09:26:39  atlas.rebuttal       │   {                                        │
│  09:26:42  pulse.rebuttal       │     "proposals": [                         │
│  09:27:10  sentinel.input       │       { "ticker": "NVDAx",                 │
│  09:27:11  sentinel.gemini.call │         "side": "buy",                     │
│  09:27:14  sentinel.verdict     │         "sizeUsd": 2400,                   │
│  09:27:14  --- approved 4 ---   │         "conviction": 0.78,                │
│  09:28:01  executor.kraken.cli  │         "thesis": "NVDA Q3 print ...",     │
│  09:28:42  executor.results     │         "citations": [{"docType":"10-Q",   │
│  09:28:51  decision.complete    │           "ticker":"NVDA","pageNumber":48, │
│                                 │           "excerpt":"Data Center revenue   │
│  [Filter: ◯ All ◯ Errors        │            grew 154% YoY..."}]            │
│           ◯ LLM calls ◯ Veto]   │       }                                   │
│                                 │     ],                                     │
│                                 │     "notesToCommittee": "..."              │
│                                 │   }                                        │
│                                 │                                            │
│                                 │   [view in raw JSON] [download .jsonl]     │
└─────────────────────────────────┴────────────────────────────────────────────┘
```

#### 10.3.6 Public NAV leaderboard — `/leaderboard`

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  LEADERBOARD                                              window: [30d ▼]    │
├──────────────────────────────────────────────────────────────────────────────┤
│  #  Portfolio          Return   Sharpe  MaxDD   AUM       Last 30d           │
│  ──────────────────────────────────────────────────────────────────────────  │
│  1  Polly Main        ▲+3.85%   1.84   -1.42%  $103,847  ▁▂▃▃▄▅▅▆▇          │
│  2  ...                                                                      │
│  ──────────────────────────────────────────────────────────────────────────  │
│                                                                              │
│  Methodology: paper portfolios, USD-denominated, 09:30 ET committee daily.   │
│  Read more →                                                                 │
└──────────────────────────────────────────────────────────────────────────────┘
```

(In solo demo, Polly Main is the only row. Schema supports multi-tenant for P2.)

#### 10.3.7 Daily brief viewer — `/briefs/[date]`

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  ← All briefs     DAILY BRIEF · 2026-05-15                                   │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  POLLY · 2026-05-15                                                          │
│  "Tech trimmed; energy hedge added; macro caution"                           │
│                                                                              │
│  NAV closed at $103,847 (+1.42%). Sharpe 30d: 1.84.                          │
│                                                                              │
│  Atlas opened a $2,000 long in NVDAx on the Q3 10-Q print showing            │
│  Data Center revenue +154% YoY. Pulse added a $1,000 short in TSLAx on a     │
│  guidance-cut catalyst (cap reduced by Sentinel from $1,800 to $1,000 on    │
│  sector concentration). Forge added a long in XLEx (energy) and a short in  │
│  TLTx, expressing the "rates higher for longer + tight oil supply" theme.   │
│                                                                              │
│  Sentinel vetoed Crest's MSFTx breakout on cooldown (already long since 5/12)│
│  and Atlas's META short on incremental VaR contribution above 1.5% NAV.      │
│                                                                              │
│  Tomorrow: watching FOMC minutes 14:00 ET, GOOG earnings AMC.                │
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐    │
│  │  [Equity curve PNG embedded — last 30 days]                          │    │
│  └──────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│  Tweet preview:                                                              │
│  ┌────────────────────────────────────────────────────────────────────┐      │
│  │ Polly hedge fund · day 3                                            │      │
│  │ NAV $103,847 (+1.42%) │ Sharpe 1.84                                 │      │
│  │ Atlas long NVDAx · Forge long XLEx, short TLTx                      │      │
│  │ Sentinel vetoed 2 trades (concentration, VaR)                       │      │
│  │ Full audit log → polly.fund                                         │      │
│  │ @krakenfx @lablabai @Surgexyz_  #xStocks #AIAgentOlympics           │      │
│  └────────────────────────────────────────────────────────────────────┘      │
│                                                                              │
│  [ post now ▶ ]   [ regenerate ↻ ]                                            │
└──────────────────────────────────────────────────────────────────────────────┘
```

#### 10.3.8 Settings / API key management — `/settings/keys`

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  SETTINGS · API KEYS                                                         │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  Provider     Label                Scope        Created     Last rotated     │
│  ──────────────────────────────────────────────────────────────────────────  │
│  kraken       prod-readonly        read-only    May 13      —                │
│  gemini       google-ai-studio     read-write   May 13      —                │
│  featherless  finance-tuned        read-write   May 13      —                │
│  vultr        serverless-fallback  read-write   May 13      —                │
│                                                                              │
│  [ + add key ]                                                               │
│                                                                              │
│  Keys are encrypted at rest using libsodium sealed-box with the              │
│  VAULT_KEY env var. We never log or display key values after creation.       │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

### 10.4 Animations & micro-interactions

- Page transitions: 180ms fade + 8px upward translate. Framer Motion `AnimatePresence` per route segment.
- NAV badge: count-up animation on value change (300ms, easeOut). Direction indicator (▲/▼) tints with color.
- Agent badge pulse: when an agent's status flips to `running`, badge pulses (radial glow, 1.2s loop) until it finishes.
- Equity curve: on `windowDays` change, recharts animates with 400ms duration. Drawdown chart syncs.
- Sentinel veto: card slides in with a yellow shine border sweep (Magic UI ShineBorder; 800ms one-shot).
- Trade fill: small green/red flash on the position row for 600ms.
- Ticker tape (optional): top of dashboard scrolls live `marquee` of watchlist prices via Magic UI marquee.
- Cmd-K palette: 150ms scale + fade.
- Hover on agent in Trading Floor: that agent's desk halo brightens; tooltip with role + last action.

### 10.5 Accessibility

- `prefers-reduced-motion`: globally disables animations via the CSS rule. R3F scene switches to static isometric PNG (server-rendered fallback).
- Color: agent colors all > AA contrast on `bg-zinc-950`. Green/red also use slight luminance shift so colorblind users see a difference (not relying on hue alone). Plus `▲`/`▼` glyphs.
- Focus rings: 2px outline `--color-blue` with 2px offset on every interactive element. No removed outlines.
- Keyboard nav: every action reachable via tab + enter. Cmd-K for power users.
- Live-region: SSE-driven transcript wraps in `aria-live="polite"` for screen readers; new turns announced.
- Tables: proper `<th scope="col">`; row striping via background, not background-image (works with high-contrast OS theme).

---

## 11. Setup & accounts

### 11.1 Sign-ups required

| Service | Cost | Purpose | When |
|---|---|---|---|
| Vultr | $0 (initial credit; ~$10/mo VM cost during contest) | VM hosting | May 13 evening |
| Google AI Studio | $0 (free tier) | Gemini API key | May 13 evening |
| Kraken (with xStocks) | $0 | Read-only API key for paper trading + PnL | May 13 evening |
| Featherless | $0 (free tier or initial credit) | Pulse domain model | May 13 evening |
| X / Twitter Developer | $0 (basic) | Auto-tweet + read engagement | May 14 morning |
| NewsAPI | $0 (developer tier, 100 req/day) | News ingestion | May 14 morning |
| GitHub | $0 | Repo, Actions | already have |
| Inngest | $0 (free tier) | Cron + workflow | May 14 morning |
| Lablab.ai | $0 | Submission | already have account |

### 11.2 API keys & secrets management

**Local development (`.env.local`):**
```
DATABASE_URL=postgres://polly:polly@localhost:5432/polly
GEMINI_API_KEY=AIza...
FEATHERLESS_API_KEY=fl_...
FEATHERLESS_BASE_URL=https://api.featherless.ai/v1
FEATHERLESS_MODEL=<TBD-see-§16>
VULTR_API_KEY=vlt_...
VULTR_SERVERLESS_URL=https://api.vultrinference.com/v1
VULTR_SERVERLESS_MODEL=llama-3.1-8b-instruct
KRAKEN_API_KEY=k_readonly_...
KRAKEN_API_SECRET=...
KRAKEN_CLI_PATH=/usr/local/bin/kraken
KRAKEN_PAPER=1
NEWSAPI_KEY=...
X_API_KEY=...
X_API_SECRET=...
X_BEARER_TOKEN=...
X_ACCESS_TOKEN=...
X_ACCESS_SECRET=...
INNGEST_EVENT_KEY=...
INNGEST_SIGNING_KEY=...
VAULT_KEY=<libsodium-32-byte-base64>     # for encrypting user-stored API keys
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Production (Coolify env vars):**
- Same set, with `DATABASE_URL` pointing at the in-VM Postgres container
- `NEXT_PUBLIC_APP_URL=https://polly.<ip>.sslip.io`
- All values entered through Coolify UI (encrypted at rest by Coolify)

**Repo secrets:**
- `.env.example` committed with all keys present but values redacted to `<your-key-here>`
- `.gitignore` includes `.env*` (except `.env.example`)
- Never commit a real key. Pre-commit hook `git-secrets` or `gitleaks` on local.

### 11.3 Local dev setup

```bash
# 1. clone
git clone git@github.com:thisisaman408/polly.git
cd polly

# 2. node + pnpm
nvm install 20 && nvm use 20
npm install -g pnpm

# 3. install deps
pnpm install

# 4. local postgres with pgvector
docker run -d --name polly-pg -p 5432:5432 \
  -e POSTGRES_USER=polly -e POSTGRES_PASSWORD=polly -e POSTGRES_DB=polly \
  pgvector/pgvector:pg16

# 5. env
cp .env.example .env.local
# fill in keys

# 6. migrate + seed
pnpm db:migrate
pnpm db:seed         # inserts the 6 agents, demo portfolio, 5d of seed leaderboard rows

# 7. install kraken cli (paper mode)
curl -fsSL https://kraken.dev/cli/install.sh | bash
kraken auth set --key $KRAKEN_API_KEY --secret $KRAKEN_API_SECRET --paper

# 8. dev server
pnpm dev
# → http://localhost:3000

# 9. trigger a committee manually
curl -X POST http://localhost:3000/api/_dev/trigger-committee \
  -H 'Content-Type: application/json' \
  -d '{"portfolioId":"<demo-portfolio-id>"}'
```

### 11.4 Deployment scripts (Vultr Coolify)

**One-time Vultr setup (May 13 evening):**
```bash
# 1. spin up VM: vc2-2c-4gb, fra1 (closer to Milan judges than ams)
# (use Vultr web console or vultr-cli)

# 2. SSH in, install Coolify
ssh root@<vultr-ip>
curl -fsSL https://cdn.coollabs.io/coolify/install.sh | bash

# 3. open Coolify on https://<vultr-ip>:8000, complete setup wizard

# 4. add a new application:
#    - type: Dockerfile (or Nixpacks for Next.js)
#    - source: GitHub repo polly
#    - branch: main
#    - port: 3000
#    - env vars: paste production set
#    - domain: polly.<vultr-ip>.sslip.io
#    - TLS: Let's Encrypt (auto)
#    - persistent volume: /var/lib/polly-pg → polly-pg-data

# 5. add Postgres service (Coolify built-in template) with pgvector image override:
#    image: pgvector/pgvector:pg16
#    db name: polly
#    port: 5432 (internal only)
#    persistent volume mounted

# 6. install kraken cli on the VM (post-deploy hook):
#    Coolify → App → Settings → "Post-deploy Commands"
#    curl -fsSL https://kraken.dev/cli/install.sh | bash
```

**`Dockerfile`:**
```dockerfile
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat python3 make g++ curl bash
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN corepack enable && pnpm install --frozen-lockfile

FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN corepack enable && pnpm build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN apk add --no-cache curl bash ca-certificates
# Install Kraken CLI
RUN curl -fsSL https://kraken.dev/cli/install.sh | bash
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/db ./db
EXPOSE 3000
CMD ["sh", "-c", "node node_modules/drizzle-kit/bin.cjs migrate --config=db/drizzle.config.ts && node node_modules/next/dist/bin/next start -p 3000"]
```

**Coolify post-deploy hook:**
```bash
# Run inside container after each deploy
node ./db/seed-if-empty.js
```

**Inngest configuration:**
- Sign in to Inngest cloud, create app `polly`
- Endpoint URL: `https://polly.<ip>.sslip.io/api/inngest`
- Set `INNGEST_EVENT_KEY` and `INNGEST_SIGNING_KEY` in Coolify env vars
- Define two cron functions in `inngest/functions.ts`:
  - `committeeDaily` — cron: `30 13 * * 1-5` (09:30 ET = 13:30 UTC weekdays — adjust for DST)
  - `briefDaily` — cron: `0 20 * * 1-5` (16:00 ET = 20:00 UTC weekdays)

---

## 12. Standard Operating Procedures (SOPs)

### 12.1 Build SOP — day by day

> Total window: 7 evenings (May 13 evening → May 19 evening). Solo. Possible 48-hour Choir/Renatus pause = bake 2 days of slack into the plan. Half-day blocks = ~4 hours each.

**Pre-flight (May 13, before kickoff 19:30 IST):**
- [ ] Create GitHub repo `polly`, MIT license, README skeleton
- [ ] Sign up: Vultr (preload credit), Google AI Studio, Kraken (xStocks-enabled), Featherless, X dev portal, NewsAPI
- [ ] Note all keys in 1Password / pass / encrypted local file
- [ ] Acceptance: every service has a "Hello world" smoke test passing in a scratch script

**Day 1 — May 13 PM (kickoff to ~02:00 IST)** — *Foundation*
- [ ] Initialize Next.js 16 + TS strict + Tailwind v4 + shadcn baseline
- [ ] Set up Drizzle, create all 12 tables from §7.1, write migrations, run on local Postgres
- [ ] Boot Vultr VM, install Coolify, deploy a "hello polly" Next.js app, confirm HTTPS
- [ ] Acceptance: `https://polly.<ip>.sslip.io/` returns a page styled with the dark tokens; `/api/health` returns `{ ok: true, deps: { db: "ok" } }`

**Day 2 — May 14 AM** — *Agent skeletons*
- [ ] Write `lib/llm/gemini.ts` with `callGemini(input)` that handles text + vision + retries + audit_log write
- [ ] Write `lib/llm/featherless.ts` (OpenAI-compatible) + Vultr Serverless fallback chain in same file
- [ ] Implement Atlas, Crest, Forge, Pulse as separate modules with their Zod output schemas
- [ ] Seed agents table
- [ ] Acceptance: standalone CLI script `pnpm tsx scripts/run-atlas.ts` produces a valid AtlasOutput JSON locally

**Day 2 — May 14 PM** — *Sentinel + Executor + Orchestrator*
- [ ] Implement Sentinel with deterministic risk pre-screen + Gemini Flash explanation pass
- [ ] Implement VaR computation (parametric, 1d, 95%) in `lib/risk/var.ts` with unit tests
- [ ] Implement Executor with `child_process.spawn` of Kraken CLI, idempotency key, retries
- [ ] Implement Inngest workflow `committeeDaily` that fan-out/fan-in calls Atlas/Crest/Forge/Pulse, then debate, then Sentinel, then Executor
- [ ] Acceptance: end-to-end CLI run via `pnpm tsx scripts/run-committee.ts` produces a `decisions` row with status=complete and at least one filled trade in paper mode

**Day 3 — May 15 AM** — *Ingestion*
- [ ] News ingestion worker: NewsAPI + 4 RSS (Reuters, Bloomberg, WSJ, FT) every 15 min via Inngest cron
- [ ] Gemini embeddings for dedup (cosine > 0.92 = skip)
- [ ] Market data refresh job: pull Kraken `/0/public/Ticker` for watchlist every 5 min, update `positions.markPrice`
- [ ] Chart PNG generation: server-side `chart.js` + `canvas` for Crest's input
- [ ] Macro images: pre-stage FOMC dot plot, CPI heatmap, yield curve PNGs in `/public/macro/` for Forge
- [ ] Acceptance: `news_items` has >100 unique rows after 4 hours of ingestion

**Day 3 — May 15 PM** — *UI shell + portfolio*
- [ ] Layout: dark theme, sidebar nav, top NAV badge
- [ ] `/portfolio`: positions table, NAV header tiles, today PnL
- [ ] `/pnl`: equity curve + drawdown (recharts), metrics tiles
- [ ] Server actions for `getPortfolioSnapshot`, `getEquityCurve`
- [ ] Acceptance: dashboard renders with seed leaderboard data; numbers update on commit/refresh

**Day 4 — May 16 AM** — *Live Committee UI*
- [ ] SSE endpoint `/api/committee/stream`
- [ ] `committeeBus` in-process pub/sub
- [ ] Orchestrator publishes events at each step
- [ ] `/committee/[decisionId]` page with auto-scrolling transcript, agent badges, proposal cards
- [ ] Acceptance: triggering a manual committee, the page updates in real time without refresh

**Day 4 — May 16 PM** — *Audit log viewer*
- [ ] `/audit/[decisionId]` two-pane: timeline + detail
- [ ] Truncate long prompts in list, full prompt in detail with "copy" / "download JSONL"
- [ ] Filter chips: All / LLM calls / Vetoes / Errors
- [ ] `/audit` list view of recent decisions
- [ ] Acceptance: every entry in audit_log for a committee run is visible and inspectable end-to-end

**Day 5 — May 17 AM** — *3D Trading Floor*
- [ ] R3F scene: 6 desks in a half-arc, low-poly, OrbitControls, slow auto-orbit
- [ ] Float Text3D nameplates
- [ ] Wire agent status to glow intensity (subscribed to SSE)
- [ ] Reduced-motion fallback: rasterized PNG of scene
- [ ] Acceptance: `/` loads in <2s on judge laptop, animates smoothly at 60fps, falls back to static image with reduced motion

**Day 5 — May 17 PM** — *Daily Brief + Tweet + Killer demo path*
- [ ] Daily brief generator (Gemini Pro, full audit_log of the day as context)
- [ ] Equity curve PNG renderer (server-side)
- [ ] Twitter post job (X API v2 with image)
- [ ] FOMC override path: `/api/macro/upload` accepts a PDF, rasterizes pages, attaches as macro images for next committee
- [ ] Manual trigger button for committee with "FOMC override on" toggle
- [ ] Acceptance: run end-to-end demo locally: upload FOMC PDF → click trigger → committee runs → trade placed → brief generated → tweet posted to a sandbox account

**Day 6 — May 18 AM** — *Polish pass 1*
- [ ] Shimmer skeletons on every async load
- [ ] Cmd-K palette (shadcn `Command`) with ticker + decision lookup
- [ ] Toast notifications on trade fills
- [ ] All TODO/console.logs removed
- [ ] /leaderboard and /briefs/[date] pages
- [ ] Acceptance: clicked through every page, no spinners visible, no console errors, no layout shifts

**Day 6 — May 18 PM** — *Polish pass 2 + record demo*
- [ ] Accessibility audit: focus rings, aria-live, reduced-motion check on `/`
- [ ] Lighthouse run, fix score < 90 on Performance or Accessibility
- [ ] Record 3-min demo (§13.2)
- [ ] Record 90-second backup video (§13.3)
- [ ] Upload both to YouTube unlisted
- [ ] Acceptance: two demo URLs in hand, watched all the way through with no embarrassing moments

**Day 7 — May 19 AM** — *Submission package*
- [ ] README final: setup, architecture, sponsor mentions
- [ ] `VULTR_DEPLOY.md`, `KRAKEN_INTEGRATION.md`, `GEMINI_USAGE.md`, `FEATHERLESS_USAGE.md`
- [ ] LICENSE: MIT
- [ ] Lablab.ai submission form filled (don't submit yet)
- [ ] All sponsor screenshots prepared (Vultr panel, Kraken paper account, Gemini AI Studio usage, X analytics)
- [ ] Acceptance: every checklist item in §3 (Prize eligibility) checked off

**Day 7 — May 19 PM (target 19:00 IST submission, hard cutoff 20:30 IST)** — *Submit*
- [ ] Push final commit; confirm Coolify deploy green
- [ ] Smoke test live URL: load `/`, trigger a committee, watch one finish
- [ ] Submit on lablab.ai
- [ ] Post submission tweet tagged `@krakenfx @lablabai @Surgexyz_`
- [ ] Take a snapshot of leaderboard NAV for the record
- [ ] Acceptance: submission confirmation email + screenshot

**Buffer days (if Choir/Renatus pause eats 48h):**
- Drop P1.6 (3D Trading Floor) → replace with static isometric hero image; same vibe, 4 hours saved
- Drop P1.9 (multi-tenant leaderboard) — show only Polly Main
- Drop P2.* entirely
- If still behind: skip auto-tweet job, run manual tweets

### 12.2 Pre-demo checklist (run 1h before any demo)

- [ ] Verify Vultr VM up: `curl https://polly.<ip>.sslip.io/api/health` returns ok
- [ ] Verify Postgres reachable: `pnpm db:ping`
- [ ] Verify Gemini key not rate-limited: `pnpm tsx scripts/gemini-smoke.ts`
- [ ] Verify Featherless key alive: `pnpm tsx scripts/featherless-smoke.ts`
- [ ] Verify Vultr Serverless fallback alive: `pnpm tsx scripts/vultr-smoke.ts`
- [ ] Verify Kraken CLI auth: `kraken auth status`
- [ ] Verify Kraken paper balance > $50,000 USD (room for the demo trade)
- [ ] Pre-warm a committee: trigger one 30 min before demo so the audit log is populated and visible
- [ ] Open all demo tabs in order: `/`, `/committee/<latest>`, `/audit/<latest>`, `/portfolio`, `/pnl`, `/briefs/<today>`
- [ ] Browser zoom 100%, dark OS theme on, Do Not Disturb on, screen recorder rolling
- [ ] Have backup recording video URL ready in clipboard
- [ ] FOMC override demo PDF in `~/Desktop/fomc-demo.pdf`, sized so Gemini Vision reads it cleanly
- [ ] Network: tethered hotspot fallback ready in case venue wifi dies

### 12.3 Submission procedure on lablab.ai (step by step)

1. Log into lablab.ai with `thisisaman408@gmail.com`
2. Navigate to Milan AI Week hackathon page → "My Team" → Edit submission
3. Fill fields:
   - **Project name:** Polly
   - **Tagline:** Autonomous AI hedge fund. Five PM agents debate Kraken xStocks trades every morning.
   - **Long description:** Paste 600-word writeup (in `submission/long-description.md`). MUST mention: Vultr, Vultr Serverless Inference, Gemini Pro, Gemini Flash, Gemini Vision, Featherless, Kraken CLI, xStocks, MIT license, in this order in the first 200 chars.
   - **Demo video URL:** YouTube unlisted link
   - **GitHub URL:** https://github.com/thisisaman408/polly
   - **Live demo URL:** https://polly.<ip>.sslip.io
   - **Tech tags:** Gemini, Vultr, Featherless, Kraken, Next.js, TypeScript, Drizzle, pgvector, Inngest, R3F
   - **Prize tracks:** select Vultr + Gemini + Kraken PnL + Kraken Social + Featherless
   - **Sponsor API keys:** paste Kraken read-only key in PnL track field
4. Preview the submission
5. Save draft, walk away for 10 minutes
6. Re-read with fresh eyes; fix typos
7. Submit
8. Screenshot confirmation page (filename `submission/confirmation-<timestamp>.png`)
9. Forward confirmation email to a backup mailbox
10. Tweet submission tagged `@krakenfx @lablabai @Surgexyz_`

### 12.4 Demo failure recovery

| Failure | Probability | Recovery |
|---|---|---|
| Vultr VM unreachable | L | Switch to local `pnpm dev` running with ngrok tunnel; have ngrok pre-installed and logged in |
| Gemini 429 mid-demo | M | Pre-warmed committee from §12.2 means transcript is already on screen; speak past the live call. If you absolutely need a fresh call, switch to backup recording |
| Featherless 429 mid-demo | M | Vultr Serverless fallback fires automatically; no user-visible impact |
| Kraken CLI hangs | L | Backup committee from 30 min ago is already complete; show that |
| Internet at venue dies | M | Tethered hotspot. If both die: play the 90-second backup recording |
| Page crashes / blank screen | L | Reload. If persistent, fall back to backup recording |
| Live FOMC PDF upload fails | M | A previously-uploaded FOMC PDF result is already in the audit log — open that decision directly |

Always have the **90-second backup video** open in a second tab. Switching to it is 2 keystrokes.

### 12.5 Build-in-public posting cadence (Kraken Social)

**Target: 2 posts/day during build week (May 13–19), 1 post/day post-submission for 30 days.** Always tag `@krakenfx @lablabai @Surgexyz_`. Always include a screenshot or short clip.

**Build-week post matrix (14 posts):**

| Day | Time (IST) | Content |
|---|---|---|
| May 13 | 22:00 | "Day 0: kicking off Polly — an autonomous AI hedge fund for Kraken xStocks. Five PM agents. Bloomberg Terminal for retail. MIT licensed. Building live this week." + repo link |
| May 14 | 10:00 | Atlas/Crest/Forge/Pulse/Sentinel agent personas (4-up image) |
| May 14 | 22:00 | First live Gemini Vision call reading a 10-K PDF page → screenshot of output JSON |
| May 15 | 10:00 | Featherless config: Pulse with [model] — financial sentiment on real news |
| May 15 | 22:00 | First end-to-end committee run completing with a paper trade on $NVDAx |
| May 16 | 10:00 | Live SSE transcript page demo clip (15s) |
| May 16 | 22:00 | Audit log screenshot: every Gemini call visible with tokens + latency |
| May 17 | 10:00 | 3D Trading Floor R3F scene preview clip (10s) |
| May 17 | 22:00 | First auto-generated Daily Brief screenshot |
| May 18 | 10:00 | First "Sentinel veto" moment — Sentinel rejecting an Atlas proposal on VaR |
| May 18 | 22:00 | Equity curve after 4 days of paper trading |
| May 19 | 10:00 | "Submitting tonight. Full repo MIT. Built solo in 7 days. Polly is open." |
| May 19 | 19:30 | Submission tweet w/ live URL + repo + 3-min demo video |
| May 19 | 22:00 | Recap thread: 7-tweet thread of build journey |

**Post-submission (May 20 onward) cadence:** one tweet per trading day at 16:00 ET (auto-generated by Daily Brief job), plus 2 manual posts per week (build-in-public reflection, milestone updates, response to comments).

### 12.6 Daily Investment Committee operations

**09:25 ET — Inngest cron fires.**

**09:25–09:30 ET — Committee runs:**
- Atlas/Crest/Forge/Pulse pull inputs, call LLMs, emit proposals
- Debate runs (rebuttals on conflicting tickers)
- Sentinel reviews

**09:30 ET — Executor places approved trades.**

**09:31 ET — `committee.complete` SSE broadcast.**

**Throughout the day:** every 15 min, news ingestion runs; every 5 min, position marks refresh.

**16:00 ET — `briefDaily` cron fires:**
- Gemini Pro composes Daily Brief
- Equity curve PNG rendered
- Auto-tweet posted

**End of day:** snapshot inserted to `leaderboard_snapshots`.

**Weekly:** on Sundays, re-rank the watchlist (drop tickers with no recent activity, add tickers Pulse has surfaced repeatedly).

**Operator interventions allowed:**
- Manual trigger of committee at any time (during demos)
- Manual upload of macro PDF (e.g. for FOMC override)
- Regenerate daily brief (replaces tweet if not yet posted)
- Disable specific agent for next session (rare; risk-mitigation only)

**Operator interventions NOT allowed:**
- Override a Sentinel veto
- Edit a `proposals` or `trades` row after creation
- Manually post a trade outside the committee flow

Both rules are enforced in code: there's no `updateTrade` server action, and Sentinel verdicts go through a constant-time signed channel from the orchestrator (overriding requires editing the DB directly with the VM SSH key).

---

## 13. Demo script (3-minute video)

### 13.1 The 90-second killer moment (FOMC reaction)

> Narrated voiceover script. Total 90 seconds. Record at 1.0x; edit to 1.05x if too slow. Use screen-recorder + voice. Text overlays for ticker names and times.

```
[00:00 — 00:08]  (Screen: Polly trading floor 3D scene, agents idle, glowing dimly)
"This is Polly. Five AI portfolio managers. One paper hedge fund.
 At 09:30 each morning, they convene an Investment Committee.
 Right now, a Fed statement just dropped."

[00:08 — 00:18]  (Cut to: drag-and-drop a PDF labeled 'FOMC_Statement_2026-05-20.pdf' onto Polly)
"I'm dropping the FOMC statement — the dot plot, the projections.
 Gemini Vision reads it directly from the PDF."

[00:18 — 00:35]  (Cut to: /committee/<id> SSE transcript, Forge's badge glowing violet)
"Forge — our macro PM — pulls the dot plot.
 [Text overlay: 'Forge → Gemini 2.0 Pro Vision']
 In 4 seconds, Forge extracts the signal."
 (On-screen: Forge's output JSON streams in)
 "Hawkish. Confidence 0.78. He proposes a short on TLTx —
  20-year Treasury — sized $4,000."

[00:35 — 00:55]  (Cut to: Pulse and Forge in debate, transcript scrolling)
"But Pulse — our event-driven PM, running on a Featherless
 financial model — disagrees. He just pulled breaking news:
 the Chair's presser softened the dot plot tone."
 (Transcript: Pulse rebuts Forge; Forge counter-rebuts)
 "They debate. Two LLMs, structured rebuttals, in 11 seconds."

[00:55 — 01:18]  (Cut to: Sentinel card animating in, yellow shine border)
"Sentinel — the risk officer — listens.
 He runs an incremental VaR check.
 [Text overlay: 'Sentinel · Gemini Flash · parametric VaR']
 The proposed short would push portfolio VaR to 1.4% of NAV —
 below the 1.5% cap. He approves Forge.
 But he caps the size from $4,000 to $2,800
 to stay under the 25% sector exposure on rates."

[01:18 — 01:30]  (Cut to: Executor section — Kraken CLI invocation, terminal output streams)
"Executor places the paper trade via Kraken CLI.
 [Text overlay: 'kraken trade place --pair=TLTxUSD --side=sell ...']
 Filled at $94.20. The audit log is permanent.
 Five agents. One trade. Fully autonomous."
```

### 13.2 Full 3-min video structure

| Time | Section | Visual | Voiceover (paraphrased) |
|---|---|---|---|
| 00:00–00:15 | Hook | Trading Floor 3D scene with all 6 agents glowing | "Bridgewater on a laptop. An autonomous AI hedge fund. Built solo in 7 days." |
| 00:15–00:30 | Problem | Snippet of retail traders losing money / no audit / single-strategy bots | "Trading bots are single-strategy and opaque. Real funds have committees and audit trails. We bring that to retail." |
| 00:30–01:00 | Agents intro | Quick cut of each agent's badge with one-line role | Introduce Atlas (fundamental, Gemini Pro, 10-Ks via Vision), Crest (technical, Gemini Flash, candlestick screenshots via Vision), Forge (macro, Gemini Pro, FOMC dot plots), Pulse (event/sentiment, Featherless domain model), Sentinel (risk, Gemini Flash, VaR + caps + veto). |
| 01:00–02:30 | Killer demo | §13.1 90-second FOMC scene | (See above script) |
| 02:30–02:45 | Audit log | Scroll the decision detail page showing every prompt, image, response, token count | "Every prompt, every image, every veto, every trade — auditable. Open the JSONL and replay any decision." |
| 02:45–03:00 | Outro | Trading Floor with NAV badge | "Polly. Five AI PMs. Kraken xStocks. Gemini multimodal. Featherless. Vultr. MIT open source. Try it live: polly.fund" |

### 13.3 Backup plan if live demo fails

Two backup videos pre-recorded and uploaded to YouTube unlisted:

1. **`polly-3min-canonical.mp4`** — the full 3-min demo recorded smoothly when everything worked
2. **`polly-90s-killer.mp4`** — just the FOMC moment, in case a partial recovery is needed

During live judging:
- Play `polly-3min-canonical` if the live site is fully unreachable
- Play `polly-90s-killer` if only the SSE / FOMC path is broken
- Always have both URLs in clipboard

After the recording is shown, switch to the live audit log (which is usually still up even if the live committee path is down) to show the depth — judges will appreciate seeing the real data behind the recording.

---

## 14. Risk register

| # | Risk | Prob | Impact | Mitigation |
|---|---|---|---|---|
| R1 | Gemini API rate limits during demo | M | H | Pre-warmed committee 30 min before demo. Backup video. Vultr Serverless fallback path for non-vision calls. |
| R2 | Featherless API down or model unavailable | M | M | Auto-fallback to Vultr Serverless (Llama 3.1) then Gemini Flash. Pulse still runs; only "domain-specialized" claim takes a hit on that one call. Audit log records the actual provider used. |
| R3 | Kraken CLI breaks paper-mode contract or hangs | L | H | Idempotency keys. Timeout 8s. Retry with backoff. Two backup committee runs from earlier in the day still showable. Manual `kraken status` health check in pre-demo. |
| R4 | Vultr VM goes down 1h before demo | L | H | Local `pnpm dev` + ngrok fallback. Coolify auto-restart on health check failure. Have backup VM image snapshot. |
| R5 | Pgvector index too slow on first night of ingestion | M | L | Index only after 1k rows; until then use brute-force cosine sim. Cap news_items insert rate. |
| R6 | LLM returns invalid JSON, schema validation fails repeatedly | M | M | Single re-prompt with validation error. On second fail, agent returns empty proposals. Orchestrator continues. Logged. |
| R7 | Sentinel becomes overly conservative and vetoes everything | M | M | Demo committee can be triggered with `RISK_MODE=demo` env that loosens VaR cap to 3% NAV. Real PnL track stays at 1.5%. Document this clearly. |
| R8 | News ingestion floods (e.g. major event spawns 500 items) and embeddings blow Gemini quota | L | M | Dedupe BEFORE embedding (title trigram + URL hash). Embed at most 50 new items per 15-min cron. Cap daily embed quota at 800 calls. |
| R9 | X/Twitter auto-tweet job fails or X dev account suspended | L | M | Daily Brief still generated and visible in UI. Manual tweet fallback. Cross-post to LinkedIn + Threads to maintain "tagged" presence. |
| R10 | Kraken xStocks paper API behavior diverges from real | M | L | Paper-mode is explicitly stated. PnL track scores paper PnL by Kraken's own metric. Diverge risk is theirs to absorb. |
| R11 | Two committees triggered simultaneously (manual + cron overlap) | L | M | `decisions` table has `UNIQUE INDEX uq_decisions_portfolio_session` per session_date. Second trigger short-circuits with "already in progress" toast. |
| R12 | Demo PDF too large for Gemini Vision (>20 MB) | M | M | Pre-tested FOMC PDF rasterized at 150 dpi, ~2 MB total. `/api/macro/upload` enforces 10MB max. |
| R13 | Solo builder fatigue mid-week | H | M | Day 6 PM is buffer. Drop P2 items first, then P1 in order: P1.6 (R3F) → P1.9 (leaderboard) → P1.13 (a11y polish — but only the deep polish; basic stays). |
| R14 | Choir / Renatus side-project pulls 48 hours | M | H | Buffer days baked in. P0 items locked first; P1 items adjustable. Have a "minimum viable submission" checklist ready (just the 18 P0 items). |
| R15 | Hackathon submission portal goes down at deadline | L | H | Submit by 19:00 IST May 19, 90 minutes before official cutoff. Screenshot the confirmation. Email the confirmation to a backup mailbox. |
| R16 | Judges think it's "just another trading bot" | M | H | Pitch positioning: "hedge fund, not trading bot." First 200 chars of long description name-drop the five sponsors. 3D Trading Floor + Investment Committee transcript are visually distinct from any other team. Direct competitor table in submission. |
| R17 | Direct competitor (Buffet AI / YuJiDi) ranks higher on Kraken PnL | M | M | Polly's expected hold horizon means lower turnover, lower exposure to overnight blow-up. Diversified 5-strategy committee should outperform single-strategy on Sharpe over a 7-day window even if not on raw return. We hedge by also dominating Best-of-Gemini and Best-of-Featherless tracks. |
| R18 | Vault key for API key encryption lost → can't decrypt user keys | L | M | We're solo for the demo (no user keys to encrypt). VAULT_KEY only needed for P2 multi-tenant. Generate fresh on Day 6 if scope expands. |
| R19 | Reduced-motion users see the R3F scene anyway | L | L | CSS rule disables animations globally; R3F scene wrapped in `<MotionConfig reducedMotion="user">` and falls back to PNG hero. Tested with macOS reduce-motion toggle on Day 6. |
| R20 | Submission long description exceeds lablab.ai character limit | L | L | Draft early. Trim to fit. Excess goes into README. |

---

## 15. Cost estimates

### Build phase (May 13–19, 7 days)

| Line item | Unit cost | Quantity | Subtotal |
|---|---|---|---|
| Vultr VM (vc2-2c-4gb, fra1) | $0.034/hr | 168 hr | ~$5.71 (likely $0 with onboarding credit) |
| Gemini API (Pro + Flash + Vision) | Free tier (1.5M tokens/day) | Within tier | $0 |
| Featherless | Free tier credits | Within tier | $0 |
| Vultr Serverless Inference | Pay-per-token | Fallback only, ~50 calls | <$1 |
| NewsAPI | Free dev tier (100 req/day) | Within tier | $0 |
| X API v2 Basic | Free tier (1500 tweets/month) | ~20 tweets/week | $0 |
| Inngest | Free tier (50k events/month) | ~5k events expected | $0 |
| GitHub | Free | — | $0 |
| Coolify | Self-hosted on Vultr VM | — | $0 |
| Domain (optional) | $12/year if used | 0 (use sslip.io) | $0 |
| Stock photos / icons | $0 | — | $0 |
| **Build phase total** | | | **~$6 (or $0 with credit)** |

### Post-submission 30-day operation (May 20–Jun 19)

| Line item | Unit cost | Quantity | Subtotal |
|---|---|---|---|
| Vultr VM | $0.034/hr | 720 hr | ~$24.50 |
| Gemini API | $0 (within free tier) | — | $0 |
| Featherless | $0 (within free tier; ~50 calls/day) | — | $0 |
| Vultr Serverless Inference | Pay-per-token | Fallback only | <$3 |
| NewsAPI | $0 (free dev tier) | — | $0 |
| X API | $0 (Basic tier) | — | $0 |
| Inngest | $0 | — | $0 |
| **Monthly total** | | | **~$28** |

If Polly survives past 30 days and demand pushes above free tiers:
- Gemini API at scale: ~$5–15/day if generating Daily Briefs continuously
- Featherless at scale: ~$10–20/month
- VM if upgraded to vc2-4c-8gb for headroom: ~$50/month
- Estimated post-virality monthly: ~$100–200/mo

Comfortable to absorb personally for 30-day post-submission window. Beyond that, decide based on Kraken Social engagement traction.

---

## 16. Open questions / decisions deferred

| # | Question | Options | Decision deadline | Lean |
|---|---|---|---|---|
| Q1 | Exact Featherless model for Pulse | (a) Llama-3.1-8B finance-tuned (b) Mistral-7B-Instruct with strong system prompt (c) Featherless catalog's top financial sentiment SKU | May 14 AM | (a) if available; else (b) for stability; document choice loudly |
| Q2 | Kraken CLI version + idempotency support | Verify with `kraken trade --help` and Kraken docs whether idempotency-key flag exists; if not, dedup must be enforced at our layer alone | May 14 AM | Test on day 2 AM; if missing, our `idempotency_key` unique index covers it pre-call |
| Q3 | Inngest free-tier headroom | Free tier = 50k events/month; daily committee = ~30 events; ingestion = ~96/day; well under | May 14 | Stay free tier |
| Q4 | Multi-tenant from day 1 vs solo demo | Multi-tenant + Better Auth = ~6 hr of work, +1 leaderboard story, more risk | May 17 PM (latest cutoff to start) | Solo demo for hackathon; multi-tenant after May 20 |
| Q5 | Embedding model (Gemini text-embedding-004 vs Featherless's own) | Gemini's 768-dim is fast and free; Featherless's may match Pulse's domain better but adds latency | May 15 AM | Gemini (768) for v1; revisit if Pulse's dedup quality is poor |
| Q6 | Watchlist composition | xStocks available on Kraken (verify list day 2). Candidates: MSFTx, GOOGx, AAPLx, NVDAx, AMZNx, TSLAx, METAx, JPMx, XOMx, XLEx, XLKx, XLFx, TLTx, SPYx, QQQx | May 14 PM | 12 tickers across tech, fin, energy, broad index, rates proxy |
| Q7 | Chart PNG library | (a) chart.js + node-canvas (b) D3 + headless puppeteer (c) lightweight-charts headless | May 15 AM | (a) — simplest server-side path; 200ms render OK |
| Q8 | Demo FOMC PDF — recorded or live | Recorded is safer; live is more impressive | May 18 | Pre-recorded version of "drag-and-drop" + live version as stretch |
| Q9 | What if Sentinel vetoes all proposals on demo day | Either show audit log with veto reasoning (which is itself impressive) or relax risk params in `RISK_MODE=demo` | May 18 | Show one veto in demo (it's the whole point); rest pass |
| Q10 | Tweet from a brand-new `@polly_fund` handle vs personal | Personal has more reach; brand has more demo cred | May 14 AM | Brand handle if available; cross-post from personal too |
| Q11 | R3F scene complexity | Low-poly minimal vs detailed Bloomberg-terminal-style | May 17 AM | Low-poly minimal; 60fps mandatory; detail = post-hackathon |
| Q12 | Audit log retention | All time vs 30-day rolling | (post-submission) | All time during hackathon; revisit at $50/mo Postgres cost |
| Q13 | Are FOMC events between May 13–20 in the calendar to scrape live | Check FOMC calendar | May 14 | Either live event OR pre-recorded PDF; design for both |
| Q14 | Vultr region: ams vs fra | Both EU; fra slightly faster to Milan | May 13 | fra1 |
| Q15 | Should Daily Brief read aloud (TTS)? | ElevenLabs adds wow but cost + complexity | (P2) | Skip for v1; revisit if there's time |
| Q16 | What if xStocks paper trading is rate-limited differently than expected | Pre-test Kraken paper API on day 2 | May 14 PM | If limited: reduce committee to once/day OR cache mark prices for 30 min |
| Q17 | Sharpe / metrics calc — 30-day rolling vs since-inception | Hackathon window is 7 days; since-inception is the honest number | May 18 | Both shown; default view = since-inception (matches Kraken PnL evaluation) |
| Q18 | Risk-narrative tweet content if Sentinel goes deterministic-only | Pre-write 5 fallback narrative templates | May 18 | Yes; templates stored in `lib/fallbacks/narratives.ts` |
| Q19 | Should we add a "Polly Index" composite metric for marketing | Synthesizes Atlas/Crest/Forge/Pulse individual paper books into one composite | (P2) | Cool, post-hackathon |
| Q20 | Multi-language demo (Italian narration for Milan judges) | English is fine; Italian extra effort | May 18 | English; add Italian subtitle track on YouTube if time |
| Q21 | Encrypt Kraken read-only key submitted to lablab.ai? | They have to read it; we don't encrypt their side | May 19 | Just paste plaintext into their form; rotate after hackathon |
| Q22 | Do we need separate testing portfolio for development? | If we trade real paper money, mistakes accumulate | May 14 | Yes; create `polly-dev` portfolio with $10k for testing, `polly-main` with $100k for the contest |
| Q23 | Will Featherless eligibility be questioned if the fallback chain ever skips it? | If Pulse always falls back, we technically don't "use" Featherless | May 14 | Force at least 70% of Pulse calls to use Featherless; configure fallback to only fire on actual error, not preemptively |
| Q24 | Open-source license — MIT or Apache 2.0 | Both qualify for Featherless | May 13 | MIT (simpler; matches preference) |
| Q25 | Should the system prompts be versioned in repo or in DB | DB allows hot-edit; repo allows code-review | May 14 AM | Repo (`prompts/<agent>/<version>.md`); DB stores only the version string |

---

*End of SYSTEM-DESIGN.md*
