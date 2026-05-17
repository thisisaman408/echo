# Polly — Sponsor Stack

## Active sponsors (in-use, prize-eligible)

### 1. Vultr — backend infra (MANDATORY for Vultr prize)

| | |
|---|---|
| Role in Polly | Hosts Next.js app + Inngest worker + Postgres on a single VM |
| Prize | **$5,000 + $1,000 in Vultr credits** (1st), $3K + $1K (2nd), $1K + $1K (3rd) |
| Mandatory deliverables | GitHub repo, **Vultr VM backend deployment**, public demo URL, recorded demo video |
| Credit claim | No public hackathon code as of May 13. Check `#vultr-channel` Discord pins, or DM Vultr rep. Fallback: ~$5–10 of your own money for a small VM. |

**Polly's Vultr footprint:**
- 1× VM (Ubuntu 24.04, 1 vCPU, 1 GB RAM, $6/month)
- Self-hosted Postgres + pgvector on the same VM (save $15/month vs managed)
- Optional: Vultr Object Storage for demo screenshots
- **Expected total cost for hackathon week: $5–10**

**Coolify deployment guide:** https://docs.vultr.com/how-to-deploy-claude-code-projects-on-vultr-using-coolify

### 2. Google Gemini — LLM brain (high-value prize)

| | |
|---|---|
| Role in Polly | Strategist (Pro), Scout/Risk/Narrator (Flash), Chart Vision (Flash multimodal) |
| Prize | **$5,000** (1st), $3K (2nd), $2K (3rd) |
| Credit claim | https://aistudio.google.com → "Get API key" → instant, no card |
| Free tier | 2M tokens/day on Flash, generous on Pro |
| Bonus | $300 Google Cloud trial available at cloud.google.com/free (optional) |

**Judging hook:** Gemini Award goes to "best use of Gemini." Polly uses 4 separate Gemini capabilities (Pro reasoning, Flash speed, Vision multimodal, embeddings for transcript dedup). Lean into the multimodal vision angle in the demo — most teams won't.

### 3. Featherless — open-source domain agent (prize + identity)

| | |
|---|---|
| Role in Polly | News Reader runs on a Featherless-hosted, financial-sentiment-tuned open-source model |
| Prize | 1st: 500 inference credits + Claw Pro plan ($200); 2nd: 300+Pro; 3rd: 100+Pro |
| Credit claim | $25 free hackathon credit + Featherless Premium (1 month) — coupon code dropped during Featherless kick-off stream / Discord |
| Mandatory | **MIT or Apache 2.0 license** for the repo. Polly is MIT. ✅ |

**Featherless judging hook:** "Domain-specialized, not generalist." Polly's News Reader is *only* about financial news sentiment — not a general chat assistant. Pitch this clearly in the README + demo.

### 4. Speechmatics — live audio (hero feature, no specific prize)

| | |
|---|---|
| Role in Polly | Real-time WebSocket transcription of audio sources (Fed speeches, earnings calls) |
| Prize | **No dedicated Milan prize tier** — but huge demo value + possible sponsor recognition |
| Credit claim | $200 hackathon credit (you have it, coupon redeemed) |
| Free tier | 8 hours/month free for individual accounts |

**Why include it:** Speechmatics turns Polly from "another agent demo" into "agents that react to live financial audio in seconds." That's the kind of moment that wins judging when memos go around after the event.

## Skipped sponsors

### Kraken (Trading + Social prizes)

| Why skipped | xStocks not available in India region. Cannot use Kraken CLI as execution layer. |
| Prize lost | $1.8K (Trading) + $1.2K (Social) = $3K |
| Replacement | Alpaca paper trading API for the actual execution layer |

### Surge (under Kraken Social)

| Why skipped | Gated under Kraken Social Engagement; tag-only sponsor |

## Prize map summary

| Sponsor | Polly hits it? | Prize ceiling |
|---|---|---|
| Vultr | ✅ Yes | **$5K + $1K credits** |
| Gemini | ✅ Yes | **$5K** |
| Featherless | ✅ Yes | ~**$200** + credits |
| Speechmatics | ✅ Uses tech, no dedicated prize | — |
| Kraken | ❌ Skipped (region) | $3K lost |

**Total ceiling: ~$11K + $1K Vultr credits.**

## Submission checklist (Vultr Award eligibility)

- [ ] **Public GitHub repository** with setup + documentation
- [ ] **Vultr VM backend deployment** (must show in demo)
- [ ] **Public demo URL** (polly.aman.dev or similar)
- [ ] **Recorded demo video** (3 min)
- [ ] **Clear architecture explanation** in README
- [ ] **Use case clarity** — for hedge funds / institutional trading desks

## Submission checklist (Gemini Award eligibility)

- [ ] Gemini used for reasoning (Strategist)
- [ ] Gemini used multimodal (Vision for chart patterns)
- [ ] Mentioned prominently in demo video + slides
- [ ] Working prototype with practical value

## Submission checklist (Featherless Award eligibility)

- [ ] **MIT license file in repo root**
- [ ] **Domain-specialized agent** (News Reader is financial-sentiment only)
- [ ] **Async-first architecture** (Polly runs in background as an Inngest cron job)
- [ ] **Production-shaped** (README, env example, deployment instructions, Docker file)
- [ ] **Reproducible** (one-command setup script)

## Build-in-public for visibility (no prize, but pre-Milan attention)

While Polly isn't competing for Kraken Social, building publicly still helps:
- Tag `@lablabai` in tweets about progress
- Post on LinkedIn with `#MilanAIWeek2026` and `#AIAgentOlympics`
- Demo video on YouTube + LinkedIn = potential Vultr / Gemini reposts pre-judging
