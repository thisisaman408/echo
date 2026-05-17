# ECHO — Integrations & .env Architecture

**Goal:** you fill `.env`, run `./scripts/setup.sh`, run `pnpm dev`, the product is fully functional.

---

## TL;DR — the two-mode strategy

We build the product in two switchable modes so you can demo *now* and ship multi-tenant *later* without rewriting integrations.

| Mode | When | Auth pattern | Setup time |
|---|---|---|---|
| **DEMO_MODE=true** (hackathon) | You are the only user. Single workspace (yours). | Personal tokens, webhooks. No OAuth flows. | ~25 minutes total to get all credentials |
| **DEMO_MODE=false** (post-hackathon) | Real users sign up. Each connects their own workspace. | Full OAuth 2.0 per service. | Already wired in code, just flip the flag |

For the hackathon submission you ship **DEMO_MODE=true** because:
1. Judges see the product working end-to-end on YOUR HubSpot/Linear/Slack
2. No OAuth screen recordings needed for the demo video
3. No third-party app review delays (HubSpot/Slack public apps need approval)
4. Code still supports OAuth — you just demo with the simpler path

The architecture below is built so flipping the flag swaps the auth provider without touching the agent logic.

---

## Architecture: integrations + data flow

```
                          ┌─────────────────────────┐
                          │  ECHO Web App (Vultr)    │
                          │  Next.js 16 + Postgres   │
                          └────────────┬────────────┘
                                       │
            ┌──────────────────────────┼──────────────────────────┐
            │ INBOUND (audio capture)  │  OUTBOUND (execution)    │
            ▼                          │                          ▼
    ┌───────────────┐                  │              ┌───────────────────┐
    │  Recall.ai    │                  │              │   HubSpot CRM     │
    │  (Tokyo)      │                  │              │   (deal updates,  │
    │  - bot joins  │                  │              │    notes,         │
    │  - audio file │                  │              │    contacts)      │
    │  - calendar   │                  │              └───────────────────┘
    │    auto-sync  │                  │              ┌───────────────────┐
    └───────┬───────┘                  │              │   Gmail (drafts   │
            │                          │              │    only, never    │
            │ webhook on               │              │    auto-send)     │
            │ recording.done           │              └───────────────────┘
            ▼                          │              ┌───────────────────┐
    ┌───────────────┐                  │              │   Linear (tasks)  │
    │ Speechmatics  │                  │              └───────────────────┘
    │ batch         │                  │              ┌───────────────────┐
    │ transcription │                  │              │   Slack (webhook  │
    │ + diarization │                  │              │    in demo mode,  │
    └───────┬───────┘                  │              │    OAuth in prod) │
            │                          │              └───────────────────┘
            ▼                          │                       ▲
    ┌───────────────────────────────────────────────────────────┴────────┐
    │  AGENT PIPELINE (Inngest orchestrator)                              │
    │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────┐ │
    │  │ Action   │→ │ Stake-   │→ │ Decision │→ │ Comms    │→ │Exec  │ │
    │  │ Extractor│  │ holder   │  │ Maker    │  │ Drafter  │  │utor  │ │
    │  │(Feather) │  │(Feather) │  │(Gemini P)│  │(Gemini F)│  │      │ │
    │  └──────────┘  └──────────┘  └──────────┘  └──────────┘  └──────┘ │
    └───────────────────────────────────────────────────────────────────┘
            │
            ▼
    ┌─────────────────────────────────────────┐
    │ Postgres + pgvector (Vultr VM)           │
    │  meetings, transcripts, agent_messages,  │
    │  executed_actions, embeddings,           │
    │  oauth_tokens (per-user, prod mode only) │
    └─────────────────────────────────────────┘
```

---

## Service-by-service: what you need

### 1. Recall.ai — meeting bot + calendar sync
**What we use it for:** Bot joins Zoom/Meet/Teams meetings, captures audio, fires webhook when meeting ends. Optionally: auto-schedules bots from connected calendars (Calendar V1 API).

- **Region:** `ap-northeast-1` (Tokyo) — you're already in this region; matches Vultr Tokyo for low latency
- **Auth:** `RECALL_API_KEY` (single key, no OAuth needed for bot dispatch)
- **Pricing:** $0.50/hr recording. You have $5 credit = **10 hours of free meetings**. Enough for ~60 test runs of 10-min mock meetings + 5 demo recordings.
- **Built-in transcription:** SKIP ($0.15/hr extra). We send audio to Speechmatics instead (sponsor + more accurate).
- **Where to get key:** https://ap-northeast-1.recall.ai/dashboard/developers
- **Time to set up:** 2 min (already have account)

**Webhooks to configure:**
- `bot.status_change` → update meeting status in DB
- `recording.done` → trigger Speechmatics + agent pipeline

**Webhook URL we'll provide to Recall:** `https://echo.<yourdomain>/api/recall/webhook`

### 2. Speechmatics — transcription + diarization
- **Auth:** `SPEECHMATICS_API_KEY` (single key)
- **Credit:** $200 hackathon credit (you have it)
- **Where to get key:** https://portal.speechmatics.com/manage-access
- **Mode:** Batch (post-meeting). Real-time WebSocket also supported if we add live transcription later.
- **Time to set up:** Already done (you have the credit)

### 3. Google Gemini — Decision Maker + Comms Drafter
- **Auth:** `GEMINI_API_KEY` (single key)
- **Free tier:** 2M tokens/day Flash, generous Pro
- **Where to get key:** https://aistudio.google.com → "Get API key" (instant, no card)
- **Time to set up:** 2 min

### 4. Featherless — Action Extractor + Stakeholder Classifier
- **Auth:** `FEATHERLESS_API_KEY` (single key)
- **Credit:** $25 + 1 month Premium via hackathon coupon (drops in Featherless Discord during kick-off)
- **Where to get key:** https://featherless.ai (dashboard after Premium activated)
- **Recommended models for ECHO:** to be confirmed from catalog — looking for instruct models fine-tuned on business/extraction tasks. Llama-3.1-8B-Instruct as default fallback.
- **Time to set up:** 5 min (after Featherless coupon redeemed)

### 5. HubSpot — CRM execution

**Demo mode** (hackathon — recommended):
- Use a **HubSpot Private App** token (not OAuth)
- Create at: https://app.hubspot.com/private-apps → New private app
- Scopes to enable: `crm.objects.deals.read`, `crm.objects.deals.write`, `crm.objects.notes.write`, `crm.objects.contacts.read`, `crm.objects.contacts.write`
- Env: `HUBSPOT_PRIVATE_TOKEN`
- **Time to set up:** 5 min
- **Test account:** sign up at https://www.hubspot.com/products/get-started (free dev account)

**Prod mode** (post-hackathon):
- Public app + OAuth flow
- Env: `HUBSPOT_CLIENT_ID`, `HUBSPOT_CLIENT_SECRET`, `HUBSPOT_REDIRECT_URI`

### 6. Linear — task creation

**Demo mode** (hackathon — recommended):
- Use a **Linear Personal API Key**
- Create at: https://linear.app/settings/api → "Create new key"
- Env: `LINEAR_API_KEY`
- Also need: `LINEAR_TEAM_ID` (the team where ECHO creates issues) — get via API or copy from URL
- **Time to set up:** 3 min

**Prod mode:** OAuth → `LINEAR_CLIENT_ID`, `LINEAR_CLIENT_SECRET`, `LINEAR_REDIRECT_URI`

### 7. Slack — summary posts

**Demo mode** (hackathon — recommended):
- Use an **Incoming Webhook URL** (one URL = one channel)
- Create at: https://api.slack.com/apps → "Create New App" → "From scratch" → Incoming Webhooks → Activate → Add new webhook to workspace
- Env: `SLACK_WEBHOOK_URL`
- **Time to set up:** 5 min

**Prod mode:** Full OAuth → `SLACK_CLIENT_ID`, `SLACK_CLIENT_SECRET`, `SLACK_SIGNING_SECRET`, with `chat:write` scope to post to arbitrary channels per workspace

### 8. Gmail — draft emails (NEVER auto-send in v1)

**Demo mode** (hackathon — recommended):
- Use Google OAuth for *your single account*, store the refresh token in `.env`
- Setup:
  1. Go to https://console.cloud.google.com → Create project "echo-hackathon"
  2. Enable Gmail API + Google Calendar API (single project, both APIs)
  3. OAuth consent screen → External → add your email as test user
  4. Credentials → Create OAuth client ID → Web application → Redirect URI: `http://localhost:3000/api/auth/google/callback`
  5. One-time OAuth dance script (we'll provide) → spits out a refresh token → paste into `.env`
- Env: `GOOGLE_OAUTH_CLIENT_ID`, `GOOGLE_OAUTH_CLIENT_SECRET`, `GOOGLE_OAUTH_REFRESH_TOKEN`, `GOOGLE_OAUTH_REDIRECT_URI`
- Scopes: `https://www.googleapis.com/auth/gmail.compose` (drafts only — safer than `gmail.send`)
- **Time to set up:** 15 min (Google Cloud Console is the slowest part of everything)

**Prod mode:** Same OAuth app, per-user refresh tokens stored in DB instead of `.env`

### 9. Google Calendar — auto-schedule Recall.ai bots (P1, optional for MVP)

**Reuses the same Google OAuth app as Gmail** — single OAuth client, two scopes.
- Add scope: `https://www.googleapis.com/auth/calendar.events.readonly`
- Recall.ai Calendar V1 handles the actual sync — we just hand it our Google OAuth credentials and it watches the calendar for us
- Configured at: https://ap-northeast-1.recall.ai/dashboard/calendar-integration (the page you're on)
- **Env:** same Google vars as Gmail. Recall.ai stores the calendar auth token server-side per-user.
- **Time to set up:** Already covered by Gmail setup if scopes added; just enable Recall Calendar V1 in their dashboard

### 10. Better Auth — ECHO web app login (users signing into ECHO itself)
- `BETTER_AUTH_SECRET`: `openssl rand -hex 32`
- `BETTER_AUTH_URL`: `http://localhost:3000` (dev) / `https://echo.<yourdomain>` (prod)
- Login providers: Google (reuse the same Google OAuth app from above — third use of one client_id) + email/password fallback
- **Time to set up:** 2 min (once Google OAuth app exists)

### 11. Postgres + pgvector on Vultr
- `DATABASE_URL`: `postgresql://echo:<password>@<vultr-ip>:5432/echo?sslmode=disable`
- Self-hosted, set up via `./scripts/provision-vultr.sh`
- pgvector extension enabled in init migration
- **Time to set up:** 10 min (Vultr VM provisioning script handles this)

### 12. Inngest — agent orchestration
- Local dev: just runs the Inngest dev server, no key needed
- Production: free tier at https://inngest.com
- Env: `INNGEST_EVENT_KEY`, `INNGEST_SIGNING_KEY`
- **Time to set up:** 5 min for production

### 13. Vultr VM + Object Storage
- VM: 1 vCPU, 2 GB RAM, Tokyo region, Ubuntu 24.04 (~$12/month, well within $200 credit)
- Object Storage: store audio archives for the audit drill-down feature
- Env (Object Storage only): `VULTR_STORAGE_ACCESS_KEY`, `VULTR_STORAGE_SECRET_KEY`, `VULTR_STORAGE_ENDPOINT`, `VULTR_STORAGE_BUCKET`
- **Time to set up:** 20 min (provision + DNS)

---

## The complete `.env` (DEMO_MODE)

See `08-env.example` for the file you actually fill in. The list below is the human-readable version.

```
# === MODE ===
DEMO_MODE=true
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000

# === DATABASE ===
DATABASE_URL=postgresql://...

# === AUTH (Better Auth for ECHO login) ===
BETTER_AUTH_SECRET=<openssl rand -hex 32>
BETTER_AUTH_URL=http://localhost:3000

# === GOOGLE OAUTH (shared: Calendar via Recall + Gmail + Better Auth login) ===
GOOGLE_OAUTH_CLIENT_ID=
GOOGLE_OAUTH_CLIENT_SECRET=
GOOGLE_OAUTH_REDIRECT_URI=http://localhost:3000/api/auth/google/callback
GOOGLE_OAUTH_REFRESH_TOKEN=<your-personal-refresh-token, demo only>

# === RECALL.AI (meeting bot) ===
RECALL_API_KEY=
RECALL_REGION=ap-northeast-1
RECALL_WEBHOOK_SECRET=<openssl rand -hex 16>  # we register this with Recall

# === SPEECHMATICS (transcription) ===
SPEECHMATICS_API_KEY=

# === LLMS ===
GEMINI_API_KEY=
FEATHERLESS_API_KEY=
FEATHERLESS_MODEL_EXTRACTOR=  # e.g. meta-llama/Meta-Llama-3.1-8B-Instruct
FEATHERLESS_MODEL_CLASSIFIER=

# === HUBSPOT (CRM) — DEMO: private app token ===
HUBSPOT_PRIVATE_TOKEN=

# === LINEAR (tasks) — DEMO: personal API key ===
LINEAR_API_KEY=
LINEAR_TEAM_ID=

# === SLACK (summaries) — DEMO: incoming webhook ===
SLACK_WEBHOOK_URL=

# === INNGEST (orchestrator) ===
INNGEST_EVENT_KEY=
INNGEST_SIGNING_KEY=

# === VULTR OBJECT STORAGE (audio archive) ===
VULTR_STORAGE_ACCESS_KEY=
VULTR_STORAGE_SECRET_KEY=
VULTR_STORAGE_ENDPOINT=https://<region>.vultrobjects.com
VULTR_STORAGE_BUCKET=echo-audio

# === OBSERVABILITY (optional) ===
SENTRY_DSN=
NEXT_PUBLIC_POSTHOG_KEY=
```

That's **20 env vars** total. ~25 minutes of clicking through dashboards to fill them all in, once.

---

## Setup checklist — in the order you should do them

Each step is independent unless noted. Do them in this order to minimize blocking.

1. **Vultr VM provisioned** (Tokyo region) — 10 min. Output: public IP + SSH key. Run `./scripts/provision-vultr.sh`
2. **Postgres + pgvector running on VM** — 5 min. Run `./scripts/setup-postgres.sh <vm-ip>`
3. **Domain + DNS** — 10 min. Point `echo.<yourdomain>` to Vultr VM IP. Get Caddy auto-HTTPS working.
4. **Google Cloud project + OAuth app + scopes added** — 15 min. The slowest one. Do it once for Calendar + Gmail + Better Auth login.
5. **HubSpot dev account + private app** — 5 min. Note the access token.
6. **Linear personal API key + team ID lookup** — 3 min.
7. **Slack workspace + incoming webhook to a #echo-test channel** — 5 min.
8. **Recall.ai webhook URL registered** — 2 min. Point to `https://echo.<yourdomain>/api/recall/webhook`. Generate + save the webhook secret.
9. **Recall.ai Calendar V1 — paste Google OAuth credentials** — 5 min. (P1, can be skipped for MVP if upload path works.)
10. **Speechmatics + Gemini + Featherless keys** — already done.
11. **Inngest cloud project + keys** — 5 min.
12. **Run one-time Google OAuth dance** to get personal refresh token — 2 min. Run `./scripts/google-oauth-dance.ts`
13. **`pnpm install && pnpm db:migrate && pnpm dev`** — 5 min first time.
14. **Smoke test**: paste a Zoom meeting URL → ECHO dispatches Recall bot → join meeting yourself → talk for 30 seconds → end meeting → confirm pipeline fires and updates HubSpot/Linear/Slack.

**Total setup time after code is written: ~70 minutes.**

---

## Multi-tenant evolution (post-hackathon)

The code is built so flipping `DEMO_MODE=false` activates the OAuth paths everywhere. Adds these env vars:

```
# HubSpot OAuth (replaces HUBSPOT_PRIVATE_TOKEN)
HUBSPOT_CLIENT_ID=
HUBSPOT_CLIENT_SECRET=
HUBSPOT_REDIRECT_URI=

# Linear OAuth (replaces LINEAR_API_KEY)
LINEAR_CLIENT_ID=
LINEAR_CLIENT_SECRET=
LINEAR_REDIRECT_URI=

# Slack OAuth (replaces SLACK_WEBHOOK_URL)
SLACK_CLIENT_ID=
SLACK_CLIENT_SECRET=
SLACK_SIGNING_SECRET=
```

DB gets an `oauth_tokens(user_id, provider, access_token, refresh_token, expires_at)` table. The integration clients read from this table instead of `.env` when `DEMO_MODE=false`.

That's the whole multi-tenant story. No agent code changes.

---

## What we deliberately don't integrate (and why)

| Skipped | Why | Alternative if asked |
|---|---|---|
| Salesforce | HubSpot dev account is faster to provision; Salesforce dev orgs take 24h. | Same shape as HubSpot — swap the client. |
| Notion | Linear's API is cleaner; one task system is enough for demo. | Could add as alt to Linear with feature flag. |
| Microsoft Teams + Outlook | Recall.ai supports them; we just need to add Microsoft OAuth (more Azure setup overhead). | Add Microsoft OAuth app for prod release. |
| Zapier / Make webhooks | Too generic; reduces our "real integrations" story. | Could be the "long tail" path for niche tools. |
| Custom email-send (vs draft-only) | Auto-sending emails has trust/spam risk. v1: draft only, human reviews. | Add `gmail.send` scope + UI toggle in v2. |
| Twilio SMS notifications | Out of scope for the demo. | Add later as a notification channel. |
| Real meeting bot built in-house | 5+ days of work for what Recall.ai does in 4 hours. | Never — Recall is the right call. |

---

## Open questions before we start building

1. **Domain.** You use `resyl.app`. Are we using `echo.resyl.app` or a separate domain for the hackathon? (Affects DNS/OAuth redirect URI setup.)
2. **Featherless models.** Coupon dropped yet? We need the model name for `FEATHERLESS_MODEL_EXTRACTOR` and `FEATHERLESS_MODEL_CLASSIFIER` before code starts using them.
3. **Project rename.** Are we renaming the `polly/` folder to `echo/` now, or after the hackathon? (Recommend now — cleaner GitHub repo for submission.)
4. **Single sponsor focus.** Is the demo going to push ALL 4 sponsors (Vultr + Gemini + Featherless + Speechmatics) equally, or lean harder on Vultr (highest cash prize) at the expense of demo time?

Answer these before we run `sp-writing-plans` for the hour-by-hour build schedule.
