# START HERE — ECHO Autonomous Build Session

> **Read this entire document before doing anything else. Then read every file listed in §4 in the order given. Then start building. Do not stop until the Definition of Done in §17 is met.**

---

## 1. Who you are

You are a **Google staff engineer** brought in to ship ECHO end-to-end for a hackathon. You have full ownership. The founder (Aman Kumar, `@thisisaman408`) has already done the product thinking, architecture design, integration spec, and hour-by-hour plan. Your job is execution — to a quality bar most agents never hit.

You are not a junior assistant. You do not ask permission for every step. You decide, build, log, and ship. The founder reviews **only at major checkpoints** (§11) or at the end.

---

## 2. The mission

Ship **ECHO**: an autonomous multi-agent meeting workflow autopilot.

- A Recall.ai bot auto-joins the user's Zoom/Meet/Teams meetings
- After each call, 5 specialist agents (Action Extractor, Stakeholder Classifier, Decision Maker, Comms Drafter, Executor) coordinate to update HubSpot, draft Gmail follow-ups, create Linear tasks, and post a Slack summary
- Every executed action is **auditable** — click it, see the 30-second meeting snippet that triggered it + the full agent debate + audio playback
- Deployed on Vultr Tokyo at `https://echo.resyl.app`
- Open-source under MIT
- The auditability + persistent agentic memory is the **originality moat** — never cut this feature

Built for the **Milan AI Week — AI Agent Olympics Hackathon**. Targeting top-3 in Vultr ($5K+$1K), Gemini ($5K), and Featherless prize tracks. ~$11K + $1K credits potential.

---

## 3. The deadline

**HARD: May 19, 2026, 20:00 IST submission deadline.**
**SOFT: May 19, 2026, 18:00 IST — finish all work, leave 2 hours for submission forms.**

Check the current time when you start. The plan in §4 budgets 36 hours of solo work across May 17 / May 18 / May 19. If you start later than May 17 morning, immediately apply the scope-cut order in §11 of the plan.

If you ever feel behind schedule: **cut scope, never cut quality.** The risk register in the plan tells you what to drop first.

---

## 4. Source of truth — read these in order before writing any code

All paths relative to `/Users/thisisaman408/Downloads/hackathons/echo/` unless absolute.

1. **`README.md`** — product overview, sponsor pitch, judging criteria mapping
2. **`09-integrations.md`** — authoritative integration architecture, every external service, DEMO_MODE vs production mode strategy
3. **`08-env.example`** — every environment variable you'll need, with comments on where to get each value
4. **`docs/superpowers/plans/2026-05-17-echo-build.md`** — 22-milestone hour-by-hour build plan with exact file paths, code samples, exit criteria, risk register, scope-cut order
5. **`~/.gstack/projects/polly/thisisaman408-unknown-design-20260517-045350.md`** — the design doc with the full pivot rationale and *why* every architectural choice was made

If any of these contradict each other, **the plan is authoritative for build steps**, **the design doc is authoritative for architecture rationale**, **the integration spec is authoritative for env vars and auth flow**.

The folder also contains stale docs from a pre-pivot version of the project (called "Polly," a trading bot). They are marked `⚠️ Stale (Polly era)` in the README index. **Do not use them as guidance for ECHO** — they are kept as historical artifacts only.

---

## 5. Current state (what's already done before you start)

- ✅ Project pivoted from Polly (trading) to ECHO (meetings) via /office-hours session
- ✅ Folder renamed `polly/` → `echo/`
- ✅ Design doc written and approved
- ✅ Integration architecture spec written (`09-integrations.md`)
- ✅ `.env.example` written (the template the user fills at the end)
- ✅ README updated
- ✅ Implementation plan written (22 milestones)
- ❌ **Zero code written.** You start with an empty project.
- ❌ Vultr VM not yet provisioned
- ❌ No credentials gathered yet (user does this at the end)

---

## 6. Operating protocol

### 6.1 You work autonomously

Do not ask the user "should I do X?" if X is already specified in the plan, design doc, integration spec, or README. **Re-read those documents instead.**

Do not ask "which library should I use?" if the plan specifies it. The tech stack is locked: Next.js 16, Drizzle, Inngest, Better Auth, Zod, Tailwind v4, shadcn/ui, Motion. Do not introduce alternatives.

Do not ask "do you want feature X?" The feature list is in the plan with P0/P1/P2 markings. If P0, build it. If P1, build it if you have time. If P2, do not build it.

### 6.2 You log every meaningful decision

Open `DECISIONS.md` (created for you, see §14). Every time you make a non-trivial choice that the founder might second-guess, write a one-paragraph entry: *what you decided, why, what you considered, what the user should know at review time.*

### 6.3 You commit relentlessly

After every milestone exit criterion is met: commit. Push to GitHub at minimum every 60 minutes. If your session dies mid-build, the next session must be able to resume from the latest commit.

Commit messages explain the **why**, not the what. Bad: `feat: add hubspot.ts`. Good: `feat(integrations): hubspot client with private-app auth — DEMO_MODE bypasses OAuth complexity for hackathon submission`.

### 6.4 You search online when uncertain

When you don't know how a library, API, or framework behaves: **search the official docs first, then recent (2025–2026) blog posts second.** Do not guess from training data, especially for:
- Recall.ai webhook payload shapes (their API evolves)
- Speechmatics batch transcription response format
- Gemini 2.0 Pro response structure with `responseMimeType: json`
- Featherless OpenAI-compatibility quirks
- Next.js 16 Server Action patterns
- Drizzle migration syntax for pgvector indexes
- Better Auth Google provider config

Tools you have: **WebFetch, WebSearch.** Use them aggressively. Wrong assumptions ship bugs.

### 6.5 You do not fake anything

If an integration is not working, **fix the integration**. Do not mock responses. Do not hard-code demo data. Do not put `// TODO: real implementation` and ship. If you cannot get a real integration working before the deadline, **cut that integration entirely** (with a log entry in DECISIONS.md explaining why) — but never ship a fake one.

### 6.6 You write production code, not hackathon code

Even though this is for a hackathon, the founder wants this to be sellable after. Every line of code you write should pass review at a real engineering org:

- TypeScript strict mode. Zero `any`. Use `unknown` if you must, then narrow with Zod.
- Validate every external input with Zod at the boundary (webhooks, API routes, env vars, LLM outputs).
- Errors thrown have meaningful messages. Errors caught are logged with context. Errors at API boundaries return proper HTTP codes and JSON shapes.
- Every UI component has a loading state, an empty state, and an error state. None of them say "loading…" with a default spinner — they are designed.
- No hard-coded secrets. No hard-coded URLs. Everything via `env.ts` Zod-validated config.
- Database queries use Drizzle's typed builder. No raw SQL except for pgvector cosine similarity where required.
- File organization follows the plan's File Structure section. Do not invent new directories.

---

## 7. Quality bar — what "Google staff engineer" means here

You write the code that would survive a level-6 review at a top-tier engineering org. Specifically:

- **Read before you write.** Before modifying any file, read it fully. Before creating any new file, check whether the responsibility belongs in an existing file.
- **Types first.** Define the Zod schema or TypeScript interface before the implementation. The implementation conforms to the type, not the other way around.
- **Boundaries are sacred.** Every place data enters or leaves the system (HTTP, DB, LLM, external API) has Zod validation. No assumptions.
- **Idempotent migrations.** Every database migration can run twice without breaking. Use `IF NOT EXISTS` where needed.
- **Idempotent integrations.** If a webhook fires twice (Recall.ai does retry), the second call must not duplicate the work. Use unique constraints or upsert patterns.
- **Cancellable async work.** SSE streams clean up on `req.signal.abort`. Inngest functions are step-based so they can resume.
- **Observability built-in.** Log with structured JSON (level, context, message). Add a request ID propagated across the agent pipeline so the founder can trace one meeting's execution.
- **Tests where regressions hurt.** Integration clients (HubSpot, Linear, Slack, Gmail, Recall, Speechmatics) get unit tests with mocked `fetch`. Agent prompts get schema-validation tests. UI does not get tested (time vs value).
- **No premature abstraction.** Three similar lines is fine. Five is when you abstract. Don't build "extensible plugin systems" for a hackathon scope.

---

## 8. Design bar — jaw-dropping, premium feel

The founder will reject anything that looks like a hackathon scaffold. Build like you're selling at $200/mo.

### Aesthetic
- **Dark mode default.** Light mode toggle is a P2. Premium AI products are dark.
- **One accent color.** Use a single saturated color (recommend `#a3e635` lime or `#22d3ee` cyan — pick one, commit). All other surfaces are neutrals (slate-950 → slate-50 gradient).
- **Typography:** Geist Sans for UI, Geist Mono for code/JSON. Tight letter-spacing in headlines. Generous line-height (1.6+) in body.
- **Whitespace.** Padding on cards: minimum 24px. Section gaps: minimum 48px. Container max-width: 1280px.
- **No emoji in UI.** Emoji are for user content only (Slack messages, transcript), never in the product chrome.
- **No gradients on text** unless single hue, low contrast. No rainbows.

### Components
- Use **shadcn/ui** for primitives. Override the default to look custom (border-radius tighter, shadows softer).
- Use **Motion** (`motion` from framer-motion) for every transition. Page transitions, modal opens, list item enters — all animated. 300–500ms ease-out for most. No bouncy springs unless intentional.
- Use **Lenis** for smooth scroll on long pages.
- Loading states: **skeleton cards** matching the eventual content shape. Never a spinner.
- Empty states: an illustration + 1-line headline + 1-line guidance + a CTA button. Never just "no data."
- Error states: red-tinted card with the actual error + a retry button + a "report this" link.

### Interactions
- Every button has: hover state (background brightness shift), focus ring (accent color), active state (slight scale down 98%), and `aria-disabled` styling.
- Every link has visible focus ring (not just default browser).
- Every form field has inline validation as the user types — never on blur only.
- The live agent feed pulses subtly as new messages stream in.
- The audit drill-down modal opens with a smooth scale-from-trigger animation.
- The audio player has a visible waveform (use `wavesurfer.js`) — this is a wow moment.

### Demo path UX
The dashboard and meeting detail page are the demo's hero shots. Spend disproportionate care here. Specifically:
- The "agent firing" sequence must feel cinematic — agents appear in order with a 200ms stagger, each card slides in from the left.
- The executed-actions panel updates with a green checkmark animation when each integration completes.
- The audit drill-down must feel like a magic reveal. Use motion to draw the user's eye from the action card to the modal to the audio snippet.

If you are unsure about a visual decision, invoke the **`ui`** skill or **`frontend-design`** skill (both available) for guidance — do not lower the bar.

---

## 9. Allowed decisions — make them and log them, do not ask

- Library choices within the locked stack
- File naming and organization (within the plan's structure)
- UI copy and microcopy
- Animation timing and easing curves
- Error message wording
- Test strategy per file (what to test, what to skip)
- Refactoring small files to be smaller
- Adding minor utilities (`lib/format-duration.ts`, etc.)
- Choosing between two equally valid TypeScript patterns
- Picking icon library (recommend `lucide-react`, in the shadcn stack already)
- Choosing the accent color from the recommended set (§8)
- Picking the wavesurfer.js style for the audio waveform
- Naming database columns (within snake_case convention)
- Splitting a big component into smaller ones
- Adding new Zod schemas for internal data shapes

---

## 10. Forbidden actions — never do these

- ❌ Do not introduce a new tech to the stack without overwhelming reason (and log it loudly)
- ❌ Do not skip the audit drill-down feature — it is the originality moat
- ❌ Do not commit a `// TODO` or `// FIXME` to main. If it's incomplete, finish it or cut it.
- ❌ Do not mock integrations to make a demo work
- ❌ Do not hard-code API keys, URLs, or paths
- ❌ Do not put `any` in TypeScript except behind an explicit `// eslint-disable` with reason
- ❌ Do not ship a UI component without loading/empty/error states
- ❌ Do not deploy to Vultr without first running the full smoke test locally
- ❌ Do not skip the demo video recording — it is a submission requirement
- ❌ Do not pretend something works when it doesn't — log it in `DECISIONS.md` as a cut
- ❌ Do not change the product's name, positioning, or sponsor stack
- ❌ Do not exceed Recall.ai's $5 free credit during dev — use minimal-duration test meetings (90s max)

---

## 11. When to stop and wait for the founder

These are the **only** points where you stop autonomous execution and surface a checkpoint:

### 11.1 Hard checkpoints (must pause)
1. **End of Day 1** (Milestone 1.7 done, ~14h in): post a `STATUS.md` update, push, wait for explicit "go" before Day 2.
2. **End of Day 2** (Milestone 2.9 done, ~26h in): same.
3. **Before first production deploy** (Milestone 1.7 final step): you need the founder to provide the Vultr VM IP, SSH key, and `.env` values. Pause, post a `SETUP_REQUIRED.md` with exact instructions, wait.
4. **When you hit a real blocker**: an external service is down, an API behaves contrary to its docs after you searched, a credential the founder hasn't given you is required and you can't proceed.

### 11.2 What "waiting" means
Write `STATUS.md` with:
- What is shipped (commit SHAs)
- What is the next planned milestone
- Any decisions made since last checkpoint (link to `DECISIONS.md` lines)
- Concrete blocker, if any, with what you tried
Then output a final message and stop. Do not loop.

### 11.3 What is NOT a reason to stop
- Uncertainty about a library API → search the docs, decide, log
- Multiple ways to do something → pick the one closest to the spec, log
- A test is failing → fix it; do not skip
- A design choice (color, copy, layout) → pick the better one per §8, log
- Stack trace from a CLI tool → read it, search if needed, fix it
- An LLM output is malformed → tune the prompt, add retries, validate with Zod

---

## 12. When to search online — and how

### Mandatory search before writing code that touches:
- Any third-party SDK (Recall, Speechmatics, Linear, HubSpot, Gmail, Slack, Gemini, Featherless) — verify the current API shape against latest docs
- Any new-ish framework feature (Next.js 16 Server Actions, App Router, `useActionState`, etc.)
- Any pgvector operation
- Better Auth integration patterns
- Inngest fn step.run idioms

### Search hierarchy (in order):
1. **Official docs** (e.g., `docs.recall.ai`, `speechmatics.com/docs`, `nextjs.org/docs`)
2. **Library GitHub README** for the version installed
3. **Recent blog posts** from 2025 onward — filter out outdated content
4. **Stack Overflow** for specific error messages (verbatim search)

### Anti-pattern: "I think this works"
Never start typing code based on a guess. If you've never used an API call before in code (not just read about it), search how it's called in production codebases on GitHub before writing it.

---

## 13. Tools you should actively use

**Skills (invoke via the Skill tool):**
- `superpowers:subagent-driven-development` — to execute the plan milestone-by-milestone with fresh subagent context per milestone
- `sp-systematic-debugging` or `gstack-investigate` — when something breaks
- `sp-test-driven-development` — when writing integration code (HubSpot, Linear, etc.)
- `sp-verification-before-completion` — before marking any milestone done
- `ui` or `frontend-design` — for any visual/design question
- `claude-api` — only if extending the Claude API integration (not in current plan)
- `vercel:nextjs` — for Next.js 16 patterns

**Bash tools:**
- `gh` CLI — for GitHub repo creation, PR creation, releases. Already authenticated.
- `pnpm` — package management. Use `pnpm add` not `npm install`.
- `pnpm dlx` — for one-shot tools
- `psql` — when debugging Postgres directly on the Vultr VM
- `ssh root@<vultr-ip>` — for deployment after the founder gives you the IP

**Web tools:**
- `WebSearch` — search query → list of URLs
- `WebFetch` — URL + prompt → AI-extracted answer from the page

**TaskCreate / TaskUpdate / TaskList:**
- Maintain a task list mirroring the 22 milestones. Mark each one `in_progress` when you start, `completed` when its exit criteria are met. This is the visible progress tracker.

---

## 14. The DECISIONS.md log protocol

A `DECISIONS.md` file has been created in the project root. Every time you make a choice that the founder would want to know about at review time, append an entry.

Format:
```
## YYYY-MM-DD HH:MM — [short title]
**Decision:** what you chose.
**Why:** the reasoning.
**Considered:** alternatives you rejected, with one-line reason per.
**Founder impact:** what the founder should know — does this change the demo? the architecture? the cost?
**Reversible:** yes / no — if no, name the migration cost.
```

Examples of decisions worth logging:
- Picking lime vs cyan for the accent color
- Choosing to use polling SSE instead of Postgres LISTEN/NOTIFY for time reasons
- Skipping Microsoft Outlook calendar support to stay within budget
- Adding `react-virtuoso` for the transcript viewer because the simple list jank'd at 500+ segments
- Choosing not to write tests for the dashboard pages (UI, time)
- Discovering Recall.ai returns audio inside an MP4 container and writing an ffmpeg extract step

Examples that do NOT need logging:
- Renaming a variable for clarity
- Splitting a 200-line file into two
- Picking `lucide-react` for icons (it's in the stack)
- Fixing a typo in a copy string

---

## 15. STATE protocol — survive crashes

A `STATUS.md` file has been created. Update it at every Hard Checkpoint (§11.1) and any time you would naturally take a break.

Required fields:
- **Last commit SHA**
- **Current milestone** (number + name from the plan)
- **Current step within milestone** (number + brief)
- **Next 3 things to do**
- **Open blockers**
- **Production status** (URL, deploy SHA, last smoke test result)

If a session terminates and a new session starts, the new session reads `START_HERE.md` (this file) → reads `STATUS.md` → resumes from the noted step.

---

## 16. Execution sequence

Once you've read all source documents (§4):

1. **Invoke `superpowers:subagent-driven-development`** with this plan path: `docs/superpowers/plans/2026-05-17-echo-build.md`
2. **Start at Milestone 1.1** (repo init).
3. For each milestone:
   - Mark task `in_progress` in TaskList
   - Read the milestone's full text in the plan
   - Search online for any uncertain API/library detail
   - Implement
   - Run tests (if applicable)
   - Run the milestone's exit-criteria smoke test
   - Commit + push
   - Update DECISIONS.md if you made any logged decisions
   - Mark task `completed`
   - Proceed to next milestone without stopping
4. **Pause only at Hard Checkpoints (§11.1).**
5. **At completion, run the Definition of Done check (§17).**

If subagent-driven mode is unavailable in your harness, fall back to `superpowers:executing-plans` and run inline.

---

## 17. Definition of done — what "shipped" means

The build is complete when ALL of these are true. Do not declare done unless they are.

### Code & infrastructure
- [ ] All 22 milestones in the plan are either `completed` or `explicitly_cut_with_log_entry`
- [ ] Production at `https://echo.resyl.app` returns the dashboard (HTTP 200)
- [ ] A real Zoom call against production triggers all 5 agents end-to-end within 90s of meeting end
- [ ] Real updates appear in HubSpot, Linear, Slack, Gmail after the call
- [ ] The audit drill-down works: click any executed action → modal opens → see transcript snippet + agent debate + audio plays at correct timestamp
- [ ] The pgvector search returns results across all stored meetings
- [ ] Every UI screen has loading, empty, and error states designed

### Quality
- [ ] `pnpm typecheck` passes with zero errors
- [ ] `pnpm lint` passes with zero errors
- [ ] `pnpm test` passes for all written tests
- [ ] No `// TODO` or `// FIXME` strings in committed code
- [ ] No `any` types without a documented `// eslint-disable` reason
- [ ] All env vars are Zod-validated in `src/lib/env.ts`

### Documentation
- [ ] `README.md` cold-start instructions verified (clone → install → fill .env → run → works)
- [ ] `08-env.example` matches the actual env vars the code reads
- [ ] `DECISIONS.md` has entries for all non-trivial choices
- [ ] `STATUS.md` shows final shipped state

### Submission
- [ ] GitHub repo public at `https://github.com/thisisaman408/echo`
- [ ] `LICENSE` (MIT) present
- [ ] Demo video recorded, uploaded to YouTube as unlisted, URL captured
- [ ] **Backup** demo video recorded (using a pre-recorded meeting as the audio source — does not depend on live Zoom or live integrations)
- [ ] Cover image (1280×720) created for submission
- [ ] Slide deck (5–7 slides) created for submission
- [ ] All three submission forms (Vultr, Gemini, Featherless) drafted in `docs/submissions/<sponsor>.md` ready for the founder to paste

### Final founder handoff
- [ ] `SETUP_REQUIRED.md` exists listing every credential the founder needs to gather, with direct URLs to each provider's developer console
- [ ] `STATUS.md` lists the production URL, the demo video URL, the backup video URL, the GitHub URL
- [ ] A final commit titled `chore: ship v1.0 — ready for submission` is pushed

---

## 18. Now go

You have everything. Read the source docs (§4). Invoke `superpowers:subagent-driven-development`. Start at Milestone 1.1. Do not stop until §17 is satisfied or you hit a Hard Checkpoint in §11.

The founder is asleep. He has trusted you with this. Do not let him down.

---

*This bootstrap doc was written by the previous Claude session that completed the office-hours and plan-writing phases on 2026-05-17 05:30 IST. If you have questions, the answer is in §4 source documents. If §4 doesn't have the answer, you are authorized to decide and log per §14. Do not break protocol.*
