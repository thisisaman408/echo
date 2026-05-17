# Gemini Submission — ECHO

## Project title
ECHO — Autonomous Meeting Workflow Autopilot

## Short description
A multi-agent meeting workflow autopilot. After each meeting, five specialist agents extract commitments, identify stakeholders, decide what to do, draft tone-calibrated copy, and execute across HubSpot, Linear, Slack, and Gmail. Every action auditable to the originating moment in audio.

## How Gemini is used (real work, not decoration)

ECHO uses **two Gemini 2.0 models** for two complementary roles that play to their strengths:

### 1. Decision Maker — Gemini 2.0 Pro (`gemini-2.0-pro-exp`)
The chief-of-staff agent. It receives:
- The full diarized transcript
- The Action Extractor's structured commitment list
- The Stakeholder Classifier's per-speaker role / internal-vs-external map

It synthesizes a structured execution plan in JSON (validated with Zod) across 4 channels — HubSpot deal updates with deal_search_hint + notes, Linear issues with priority + assignee hint, Gmail drafts (only to external stakeholders with known emails — never invented), and a Slack summary. Pro's reasoning is the bottleneck for output quality: it decides what NOT to do as much as what to do.

### 2. Comms Drafter — Gemini 2.0 Flash (`gemini-2.0-flash-exp`)
Takes the Decision Maker's structured plan and rewrites every piece of copy to be tone-calibrated:
- Internal Slack / Linear: tight, factual, low-ceremony
- External Gmail: warm, specific, professional, short
- Filler-banned ("just touching base", "circling back", etc.)

Flash is right-sized for high-volume text polish — the prompt explicitly preserves all routing fields (deal IDs, source_action_index, recipient emails) and rewrites ONLY the copy.

### 3. Text-Embedding-004 for semantic search
After every meeting, transcripts are embedded via `text-embedding-004` (768-d) and stored in pgvector with an HNSW index. The dashboard's search bar (`/dashboard/search`) lets users ask "What did Sarah say about pricing?" and get the exact transcript segment + speaker + timestamp back.

## Multimodal-ready
The architecture is set up to extend to Gemini's vision capability for shared-screen frames captured by Recall.ai — already on the roadmap.

## Tech tags
Gemini 2.0, Multi-Agent Systems, AI Agents, Vultr, Next.js, TypeScript, Postgres, pgvector

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
