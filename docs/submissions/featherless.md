# Featherless Submission — ECHO

## Project title
ECHO — Autonomous Meeting Workflow Autopilot

## Short description
A multi-agent meeting workflow autopilot built on Featherless's serverless inference for the two domain-specialized extraction agents. Async-first post-meeting pipeline. MIT-licensed. Real execution across HubSpot, Linear, Gmail, Slack with auditable agentic memory.

## How Featherless is used

ECHO's 5-agent pipeline uses Featherless for the two agents where domain-specialized open-weight models outperform general-purpose chat models:

### 1. Action Extractor — Featherless (default: Llama 3.1 8B Instruct)
Reads the diarized meeting transcript and extracts every concrete action item, commitment, decision, blocker, and follow-up. Each extraction includes:
- type (action_item / commitment / decision / blocker / follow_up)
- description (one sentence)
- owner_hint (speaker label)
- due_hint (verbatim due reference if any)
- source_speaker + source_start_sec + source_end_sec (audit trail)
- verbatim_quote (the exact transcript phrase — must be a substring of the transcript)

Validated with Zod; retry-with-temperature-0 on parse failure for determinism.

### 2. Stakeholder Classifier — Featherless (default: Llama 3.1 8B Instruct)
Reads the transcript + the Action Extractor's output. Identifies each unique speaker label and infers:
- role (rep / prospect / internal_team / customer / manager / unknown)
- internal (true/false)
- name_hint / email_hint / company_hint

Then assigns each action to an owner_speaker + watcher_speakers list — this is what tells the Decision Maker which Linear issues need an assignee_email_hint and which Gmail drafts go to external recipients.

## Why Featherless fits ECHO

- **Async-first**: the post-meeting pipeline is event-driven via Inngest. Featherless's serverless inference matches this pattern — no warm pools, no idle GPU costs.
- **Domain-specialized choice**: the model name is an env var (`FEATHERLESS_MODEL_EXTRACTOR`, `FEATHERLESS_MODEL_CLASSIFIER`) so we can swap to any model on the catalog — including business-NER or intent-classification fine-tunes — without code changes.
- **MIT-licensed**: the entire ECHO repo is MIT (required by Featherless prize).
- **OpenAI-compatible**: we reuse the `openai` SDK with a `baseURL` override, so the integration is ~30 lines.

## Tech stack
Next.js 16 · TypeScript · Drizzle ORM · Postgres 16 · pgvector · Inngest · OpenAI SDK (against Featherless) · @google/generative-ai · @linear/sdk · @slack/webhook · googleapis · @aws-sdk/client-s3 · Caddy · Vultr Tokyo

## License
MIT — see LICENSE in repo root.

## Tech tags
Featherless, Llama 3.1, Multi-Agent Systems, AI Agents, MIT, Open Source, Vultr, Next.js, TypeScript, Postgres, pgvector

## Cover image
1280×720 — to be uploaded with submission.

## Demo video
[YouTube unlisted URL — to be filled by founder]

## Backup demo video
[YouTube unlisted URL — to be filled by founder]

## GitHub repo
https://github.com/thisisaman408/echo (MIT)

## Live demo
https://echo.resyl.app

## Team
Aman Kumar — founder/engineer (`@thisisaman408`)
