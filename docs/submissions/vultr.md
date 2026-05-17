# Vultr Submission — ECHO

## Project title
ECHO — Autonomous Meeting Workflow Autopilot

## Short description (≤ 280 chars)
ECHO is a multi-agent workflow autopilot. A bot joins your meetings, five specialist agents extract / decide / execute across HubSpot, Linear, Gmail, and Slack — and every action is auditable back to the moment in audio that caused it. Deployed on Vultr Tokyo.

## Long description
Managers run 15–30 meetings a week. After each one, they lose 20–60 minutes to follow-ups: updating CRM, drafting emails, filing tasks, posting summaries. ECHO automates the entire post-meeting workflow:

1. **Capture (Recall.ai + Vultr Tokyo)** — a bot auto-joins Zoom/Meet/Teams calls. Audio webhooks back to ECHO's Next.js 16 app running on a Vultr Tokyo VM.
2. **Transcribe (Speechmatics)** — batch diarized transcription. Speaker labels feed the downstream agents.
3. **5-agent pipeline (Featherless + Gemini)** — Action Extractor + Stakeholder Classifier (Featherless / Llama 3.1), Decision Maker (Gemini 2.0 Pro), Comms Drafter (Gemini 2.0 Flash), Executor (deterministic + Gemini narration).
4. **Execute (HubSpot, Linear, Slack, Gmail)** — real API calls. Real deal updates, real tickets, real Slack posts, real Gmail drafts (never auto-sent — human reviews).
5. **Audit (Vultr Postgres + pgvector + Object Storage)** — every executed action back-links to the originating transcript segment and the agent debate. Click any action → see the exact 30 seconds of audio that triggered it.

The originality moat: **auditable agentic memory**. Existing tools (Otter, Fellow, Fireflies) summarize. ECHO executes — and lets you prove what the agent did and why.

## Why Vultr — central system of record
Vultr is not decoration. It is the literal system of record:

- **Vultr Tokyo VM** (Ubuntu 24.04, 2 vCPU / 4 GB) hosts Next.js 16, Caddy reverse proxy with auto-HTTPS, Postgres 16 + pgvector, and Inngest dev server in-process.
- **Postgres + pgvector on the VM** stores meetings, transcripts (with HNSW-indexed 768-d embeddings via Gemini text-embedding-004), the agent debate log, and the executed-actions audit trail.
- **Vultr Object Storage** (S3-compatible, ap-northeast-1) archives every meeting's audio so the audit drill-down can stream the snippet at the right timestamp via a signed URL.

Remove Vultr and you lose the entire persistence layer that makes ECHO auditable in the first place.

## Tech stack
Next.js 16 (App Router, React 19) · TypeScript · Tailwind v4 · Drizzle ORM · Postgres 16 · pgvector · Inngest · Zod · OpenAI SDK (for Featherless) · @google/generative-ai · @linear/sdk · @slack/webhook · googleapis · @aws-sdk/client-s3 · Caddy

## Tech tags
AI Agents, Multi-Agent Systems, Vultr, Gemini, Featherless, Speechmatics, Recall.ai, Next.js, TypeScript, Postgres, pgvector, Inngest, Audit Trail, Enterprise AI

## Cover image
1280×720 PNG — to be designed in Figma/Canva and uploaded with submission.

## Demo video
[YouTube unlisted URL — to be filled by founder after recording]

## Backup demo video
[YouTube unlisted URL — to be filled by founder after recording]

## GitHub repo
https://github.com/thisisaman408/echo (MIT)

## Live demo
https://echo.resyl.app

## Setup instructions
See README.md and 09-integrations.md.

## Team
Aman Kumar — founder/engineer (`@thisisaman408`)
