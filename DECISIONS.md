# DECISIONS Log

Every non-trivial choice made during the autonomous build session lands here.

Format:
```
## YYYY-MM-DD HH:MM — [short title]
**Decision:** what you chose.
**Why:** the reasoning.
**Considered:** alternatives rejected, with one-line reason per.
**Founder impact:** what the founder should know — does this change the demo? the architecture? the cost?
**Reversible:** yes / no — if no, name the migration cost.
```

What deserves an entry:
- Picking between two equally valid technical approaches
- Cutting any P0 or P1 feature
- Adding a dependency not in the original plan
- Skipping a test that was specified
- Changing a database column shape
- Anything that changes the demo flow
- Anything that costs money

What does NOT deserve an entry:
- Variable renames
- File splits for clarity
- Picking icons from `lucide-react` (already in stack)
- Routine bug fixes

---

## Pre-build session decisions (already made before code starts)

## 2026-05-17 04:30 — Pivot from Polly (trading) to ECHO (meeting workflow)
**Decision:** Discarded the original Polly trading-bot product and pivoted to ECHO — a multi-agent autonomous meeting workflow autopilot.
**Why:** Office-hours analysis showed trading bots were a saturated category (~12 competing teams in the 456-team field), the hackathon brief specifically rewarded "enterprise utility for managers and entrepreneurs," and "auditable agentic memory" was a genuinely empty lane.
**Considered:**
- Sales Call Coach (live during-call coaching) — rejected due to form-factor risk (Clippy problem)
- Compliance Officer (MNPI detector) — rejected as too niche; judges wouldn't feel the pain
- IR Radar / Competitor Intel — kept as Plan B if ECHO underperforms
- Lighthouse (multi-agent decision debate) — most original but harder to demo in 3 minutes
**Founder impact:** Whole product changed. README, env vars, integrations, demo narrative all reflect ECHO.
**Reversible:** Cost of reverting ≈ all design+spec work redone (~6 hours).

## 2026-05-17 05:00 — Merge Approach B (live capture) + Approach C (memory) via Recall.ai
**Decision:** Use Recall.ai (third-party meeting-bot-as-a-service) for frictionless meeting capture instead of building a Zoom/Meet bot ourselves OR limiting users to manual upload.
**Why:** Recall.ai is a ~4-hour integration vs ~5-day in-house bot build. Eliminates upload friction without sacrificing the "memory + audit" originality angle. $5 credit gives 10 hours of free recording — plenty for hackathon use.
**Considered:**
- Building Zoom SDK bot ourselves — rejected: 5+ days work
- Manual upload only (Approach C) — rejected: real friction in real use, weak demo
- Browser extension capturing tab audio — rejected: Chrome extension review/approval friction
**Founder impact:** Adds Recall.ai as a sponsor dependency we don't need (but they're not a hackathon sponsor; that's fine). Adds RECALL_API_KEY + RECALL_WEBHOOK_SECRET to .env.
**Reversible:** Yes; fall back to upload-only is documented in plan's Risk Register.

## 2026-05-17 05:00 — DEMO_MODE=true with personal tokens for hackathon
**Decision:** Use HubSpot Private App token, Linear Personal API Key, Slack Incoming Webhook URL, and a single Google OAuth refresh token (founder's own account) for the hackathon. OAuth flows for multi-tenant are coded but gated behind `DEMO_MODE=false` for post-hackathon.
**Why:** Hackathon demo is single-user (the founder demoing to judges). Full OAuth per service would burn 8+ hours on consent screens and redirect URI debugging. Personal tokens get us identical functionality with zero OAuth setup.
**Considered:**
- Full OAuth for all four services — rejected: ~8 hours of OAuth work that doesn't change the demo
- Hybrid (OAuth for HubSpot only) — rejected: inconsistent, more code paths
**Founder impact:** Founder needs to gather 4 personal tokens instead of registering 4 OAuth apps. Saves 8 hours. Production migration is a flag flip + OAuth callback handlers.
**Reversible:** Yes — OAuth is already part of the env schema, just unused in DEMO_MODE.

## 2026-05-17 05:15 — Monolithic Next.js, not Turborepo
**Decision:** Single `apps/echo/` Next.js app, not a Turborepo with shared packages.
**Why:** 36-hour solo build can't absorb monorepo overhead (multiple package.json, workspace plumbing, separate package builds). Polly's original spec used Turborepo for cross-product reuse; ECHO is one product.
**Considered:** Turborepo as originally planned — rejected for time.
**Founder impact:** If future products share code with ECHO, refactor to Turborepo then. For now, simpler is better.
**Reversible:** Yes, easy to extract packages later.

## 2026-05-17 05:15 — Inngest dev server in-process, not Inngest Cloud
**Decision:** Run Inngest in-process via the dev server in production for the hackathon.
**Why:** Avoids configuring Inngest Cloud project, API keys, signing keys for v1. The dev server is reliable enough for low-traffic demo use. Migration to Inngest Cloud is one config change.
**Considered:** Inngest Cloud — rejected for setup time + adds optional sponsor dependency we don't need.
**Founder impact:** Production has one fewer external dependency. Demo doesn't lose any feature.
**Reversible:** Yes, gated by env vars.

---

## Build session decisions (append below as you make them)

<!-- New entries go here -->
