# 🎧 ECHO

**Autonomous meeting workflow agent. By the time you leave the meeting, the work is done.**

Built for **Milan AI Week — AI Agent Olympics Hackathon** · May 13–20, 2026.

---

## TL;DR

ECHO is a multi-agent enterprise meeting autopilot. A Recall.ai bot joins your Zoom/Meet/Teams calls automatically. After each meeting, **five specialist agents** (Action Extractor, Stakeholder Classifier, Decision Maker, Comms Drafter, Executor) coordinate to update your CRM, draft follow-up emails, create tasks, and post summaries — across HubSpot, Gmail, Linear, and Slack. Every action ECHO took is auditable: click any executed task and drill into the 30-second audio snippet + agent debate that triggered it.

**Hero feature:** auditable agentic memory. Search every meeting. Trace every action back to the moment in audio that caused it. This is the trust layer that lets enterprises actually deploy agents to real systems.

Deployed on **Vultr** (Tokyo region). Open-source under **MIT**. Built to win.

---

## Why this wins

| Judging criterion | ECHO's pitch |
|---|---|
| **Application of Technology** | All 4 sponsor stacks do real work, not decoration. Recall.ai (capture), Speechmatics (transcription), Gemini (decision/multimodal), Featherless (domain-specialized extraction) — remove any one and the product breaks. |
| **Presentation** | Two-act demo: (1) workflow firing in real time after a meeting ends, (2) memory + audit drill-down. Visceral pain that every judge feels every day. |
| **Business Value** | ~5 hours/week saved per manager. 100M+ knowledge workers. CRM hygiene is independently measurable. |
| **Originality** | "Auditable agentic AI with persistent memory" is in an empty lane across the 456-team field. Otter/Fellow/Fireflies summarize — ECHO *executes* and lets you *audit*. |

---

## Sponsor stack (target prizes)

| Prize | Amount | How ECHO qualifies |
|---|---|---|
| 🏆 Vultr 1st | $5,000 + $1,000 Vultr credits | Tokyo VM hosts Next.js, Postgres+pgvector, Object Storage for audio. Literal "system of record for planning, coordination, execution." |
| 🏆 Gemini 1st | $5,000 | Gemini Pro for Decision Maker reasoning, Flash for Comms Drafter + Executor narration, Vision for shared-screen frames + deck PDFs. Multimodal does real work. |
| 🏆 Featherless 1st | 500 credits + Claw Pro plan ($200) | Async-first post-meeting pipeline. Domain-specialized Action Extractor + Stakeholder Classifier. MIT licensed. ✓ |
| Speechmatics | No specific prize tier | Mission-critical for diarized transcription (without diarization, Stakeholder Classifier can't work). Earns demo magic. |
| **TOTAL** | **~$11,000 + $1,000 credits** | |

---

## Architecture in one paragraph

User connects Google Calendar via Recall.ai → Recall bot auto-joins their meetings → audio webhooks to ECHO backend on Vultr Tokyo → Speechmatics batch transcribes + diarizes → Inngest dispatches 5 agents in sequence: Action Extractor (Featherless) extracts commitments, Stakeholder Classifier (Featherless) identifies people, Decision Maker (Gemini Pro) synthesizes the workflow, Comms Drafter (Gemini Flash) writes the messages, Executor fires real API calls to HubSpot/Gmail/Linear/Slack. Every step lands in `agent_messages` Postgres table, every action lands in `executed_actions` with a backlink to the originating transcript snippet stored in Vultr Object Storage. Dashboard streams agent activity via SSE, search uses pgvector over all transcripts, audit drill-down opens the snippet + agent debate for any past action.

See [`09-integrations.md`](09-integrations.md) for the authoritative integration architecture.

---

## Index

| File | Status | Purpose |
|---|---|---|
| [`09-integrations.md`](09-integrations.md) | ✅ Current | **Authoritative integration architecture. Start here.** |
| [`08-env.example`](08-env.example) | ✅ Current | **Turnkey `.env` template. Fill once, product runs.** |
| `README.md` | ✅ Current | This file. |
| `01-system-design.md` | ⚠️ Stale (Polly era) | Pre-pivot system diagram. Conceptually same shape, different domain. |
| `02-agents.md` | ⚠️ Stale (Polly era) | Pre-pivot agent prompts. To be rewritten during build. |
| `03-tech-stack.md` | ⚠️ Mostly current | Stack mostly unchanged; remove Alpaca/NewsAPI/market data refs. |
| `04-sponsor-stack.md` | ⚠️ Stale (Polly era) | Pre-pivot sponsor pitch. New version embedded in this README. |
| `05-build-plan.md` | ⚠️ Stale (Polly era) | Pre-pivot schedule. New plan via `sp-writing-plans` next. |
| `06-features.md` | ⚠️ Stale (Polly era) | Pre-pivot feature list. To be rewritten for ECHO. |
| `07-demo-script.md` | ⚠️ Stale (Polly era) | Pre-pivot demo script. To be rewritten for ECHO Day 7. |

**Design doc & full pivot rationale:** `~/.gstack/projects/polly/thisisaman408-unknown-design-20260517-045350.md`

---

## Critical dates

- **May 13 (tonight):** Vultr VM provisioned, Recall.ai validated, repo scaffolded
- **May 14 AM:** Audio pipeline (Recall webhook → Speechmatics) end-to-end
- **May 15 AM:** All 5 agents wired, dashboard scaffolded
- **May 15 PM → May 17 PM:** ⛔ 48h pause (Choir sprint commitment) — ECHO paused
- **May 18:** Integrations (HubSpot, Linear, Slack, Gmail), dashboard polish, audit drill-down
- **May 19:** Demo video record + backup video record + **SUBMIT BY 20:00 IST**

---

## Repo

GitHub: `aman/echo` (to be created) — MIT licensed
Demo URL: `https://echo.resyl.app` (Vultr Tokyo deployment)
License: **MIT** (mandatory for Featherless prize)

## Team

- **Aman Kumar** ([@thisisaman408](https://github.com/thisisaman408)) — founder/engineer
- (Open slot) — frontend / dashboard polish
- (Open slot) — growth / demo distribution

---

## Setup (once code exists)

```bash
# 1. Provision Vultr VM (Tokyo)
./scripts/provision-vultr.sh

# 2. Set up Postgres + pgvector
./scripts/setup-postgres.sh <vm-ip>

# 3. Fill credentials (see 09-integrations.md for where to get each one)
cp 08-env.example .env
# … fill in 20 values, ~25 min of dashboard clicking …

# 4. One-time Google OAuth dance for personal refresh token (DEMO_MODE only)
pnpm tsx scripts/google-oauth-dance.ts

# 5. Install + migrate + run
pnpm install
pnpm db:migrate
pnpm dev

# 6. Smoke test: paste a Zoom URL → bot joins → talk 30s → end meeting
#    → confirm HubSpot/Linear/Slack updates fire within 90s
```

Total time from clone to running product: **~70 minutes** (most of it is Vultr provisioning + Google Cloud Console).

---

## Pivot history

Originally **Polly** — a 5-agent trading swarm with live financial audio. Pivoted to **ECHO** on May 17 after office-hours analysis revealed:
1. Trading bots were saturated in the field (~12 competing teams)
2. The "enterprise utility" brief favored meeting workflow over paper trading
3. Auditable agentic memory was a genuinely empty lane

The architecture stayed 75% the same — agent message bus, Inngest, pgvector, Vultr deploy. Only the wrapper (trading → meetings) and integrations (Alpaca/NewsAPI → HubSpot/Gmail/Linear/Slack) changed. Recall.ai was added as the friction-killer that made automatic capture possible without building a meeting bot from scratch.

Full pivot rationale: `~/.gstack/projects/polly/thisisaman408-unknown-design-20260517-045350.md`.
