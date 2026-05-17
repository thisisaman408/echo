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

## 2026-05-17 06:00 — Skip vendor SDKs for Recall.ai and Speechmatics
**Decision:** Use raw `fetch` for both Recall.ai and Speechmatics instead of `@recall-ai/sdk` and `speechmatics` npm packages. Wrapped responses in Zod for safety.
**Why:** We hit ~3 endpoints per vendor. Pulling SDKs adds bundle weight, transitive deps, and an extra layer of mocking in tests. Raw fetch is testable with `vi.stubGlobal("fetch", …)` and the surface is small enough to maintain.
**Considered:** Use the official SDKs — rejected for the reasons above.
**Founder impact:** Smaller bundle, simpler tests; small risk that if Recall changes a payload field name we silently drop it (Zod will throw, surfacing the bug fast).
**Reversible:** Yes — swap to SDK is a one-file change.

## 2026-05-17 06:00 — Use Zod v4 (came down from npm as default)
**Decision:** Stayed on the installed Zod v4 (originally plan referenced v3).
**Why:** v4 is already in `node_modules` and the API differences are minor for our usage. The one v4 quirk we hit was `.default()` after `.transform()` now needs the post-transform type (`boolean` not `"true"`) — fixed in `env.ts`.
**Considered:** Pinning Zod v3 — rejected because v4 is now the maintained branch and the migration is trivial.
**Founder impact:** Future Zod docs you read should be v4 docs.
**Reversible:** Yes, low-cost downgrade if needed.

## 2026-05-17 06:00 — Dashboard mounted at /dashboard, not /(dashboard)/
**Decision:** Public landing at `/`, dashboard at `/dashboard`, meeting detail at `/dashboard/meetings/[id]`. Not using a `(dashboard)` route group.
**Why:** The original plan put `(dashboard)/page.tsx` AND `page.tsx` both at `/` which is a Next.js routing conflict (parens-groups don't add to URL). Picking explicit `/dashboard` avoids ambiguity.
**Considered:** Make landing live under `(marketing)/page.tsx` — also valid, but less common URL pattern for SaaS dashboards.
**Founder impact:** Demo URL becomes `echo.resyl.app/dashboard` (links from landing CTA) and meeting detail is `echo.resyl.app/dashboard/meetings/[id]`.
**Reversible:** Yes, easy to rename routes later.

## 2026-05-17 06:00 — Inlined LLM prompts as TS exports, not .txt files
**Decision:** Agent prompts live in `src/agents/prompts/*.ts` as exported string constants instead of `.txt` files loaded via `fs.readFileSync`.
**Why:** Next.js App Router + Turbopack don't reliably bundle adjacent .txt files into the serverless output. TS exports are part of the module graph, type-safe, and never have a missing-file bug.
**Considered:** Use `import "x.txt?raw"` via webpack loader — rejected as unsupported by Turbopack today.
**Founder impact:** None visible. Prompt iteration is slightly more annoying (need to escape quotes) but still a single file edit.
**Reversible:** Trivial to swap to fs-based loading once Turbopack supports `?raw`.

## 2026-05-17 06:20 — Cut Better Auth from v1; DEMO_MODE single-user
**Decision:** Skipped Better Auth integration (plan M3.3 step 2). The DEMO_MODE single-user flow has no login screen — the dashboard at `/dashboard` is publicly accessible during the hackathon demo. Founder seeds a single demo user on first bot dispatch.
**Why:** Better Auth integration requires schema additions (4 new tables), an OAuth callback page, a sign-in UI, and session middleware on every protected route — at least 1-2 hours. The judges' demo is single-user; nobody is logging in. Scope-cut order in plan §11 explicitly allows cutting Better Auth.
**Considered:** Build it anyway with Google-only — rejected for time. Add a password gate — rejected (worse UX than nothing).
**Founder impact:** Production URL is publicly accessible. **Mitigation:** until multi-user mode ships, deploy with HTTP basic auth at the Caddy layer if exposing publicly beyond the demo. See SETUP_REQUIRED.md.
**Reversible:** Yes. Better Auth scaffolding is a documented Day 4 task; tables already in plan, only ~2h to wire fully.

## 2026-05-17 06:00 — Inngest v4 createFunction API used directly
**Decision:** Use the new 3-arg → 2-arg shape `createFunction({ id, triggers, ...config }, handler)` (Inngest v4) instead of the v3 `(config, trigger, handler)` shape shown in the plan.
**Why:** Inngest v4 is installed; the v3 signature no longer typechecks. v4 collapses the trigger object into the options bag.
**Considered:** Pin Inngest v3 — rejected as v4 has cleaner API and active support.
**Founder impact:** None for the demo; event names and step semantics are unchanged.
**Reversible:** Yes, package downgrade.
