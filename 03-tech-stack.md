# Polly — Tech Stack

## Frontend

| Tech | Version | Why |
|---|---|---|
| Next.js | 16+ | App Router, Server Actions, RSC |
| TypeScript | 5+ (strict) | Zero `any` allowed |
| Tailwind CSS | v4 (CSS-first config) | Standard |
| shadcn/ui | latest | Base component primitives |
| Aceternity UI | latest | Animated UI primitives — drop-in wow |
| Magic UI | latest | Hero animations |
| Framer Motion / Motion | latest | Every state change animated |
| React Three Fiber | latest | 3D trading floor |
| @react-three/drei | latest | R3F helpers (OrbitControls, Float, etc.) |
| recharts | latest | Equity curve, indicator charts |
| Lenis | latest | Smooth scroll |

## Backend

| Tech | Version | Why |
|---|---|---|
| Node.js | 22 LTS | Standard |
| Next.js Server Actions | 16+ | API surface |
| Inngest | latest | Cron + event-driven agent orchestration |
| Drizzle ORM | latest | Type-safe SQL |
| Zod | 4+ | Validation at every boundary |
| Better Auth | latest | Auth (multi-tenant later) |
| pgvector | latest | Embedding-based dedup |

## LLMs and AI services

| Service | Use | Model |
|---|---|---|
| **Google Gemini** | Strategist | Gemini 2.0 Pro |
| **Google Gemini** | Scout, Risk, Narrator | Gemini 2.0 Flash |
| **Google Gemini Vision** | Chart pattern reading | Gemini 2.0 Flash multimodal |
| **Featherless** | News Reader (domain-specialized sentiment) | Open-source fine-tune of choice |
| **Speechmatics** | Live audio → transcript | RT API streaming WebSocket |
| **Anthropic Claude** | Fallback for complex aggregation if Gemini stalls | Sonnet 4.6 |
| **Groq Cloud** | Cheap fallback inference for non-hot-path | Llama 3.1 8B |

## Data layer

| Service | Purpose |
|---|---|
| **Postgres 16** (self-hosted on Vultr) | Primary DB |
| **pgvector** | Embedding-based dedup (news + transcripts) |
| **Upstash Redis** (free tier) | Job queue + rate limiting (optional) |

## Infra and deployment

| Service | Role |
|---|---|
| **Vultr** (mandatory) | VM hosting Next.js + Inngest worker + Postgres |
| Caddy | Reverse proxy on the VM (auto-HTTPS) |
| pm2 / systemd | Process supervisor for Node + Postgres |
| Docker (optional) | Containerization for reproducibility |
| **Vultr Object Storage** | Demo data + agent message archives |

## Market data and execution

| Service | Use |
|---|---|
| **Alpaca** (paper trading) | US stock execution layer (replaces Kraken xStocks) |
| **NewsAPI.org** (free tier) | News headlines for News Reader |
| Yahoo Finance / RSS | Backup news sources |
| **YouTube live audio streams** | Speechmatics input source (Fed, CNBC, Bloomberg) |

## Observability and testing

| Tool | Use |
|---|---|
| Sentry (free) | Error tracking |
| PostHog (free) | Analytics, demo telemetry |
| Vitest | Unit + integration tests |
| Playwright | E2E tests for the dashboard |

## Repo + tooling

| Tool | Use |
|---|---|
| Turborepo | Monorepo orchestration |
| pnpm | Workspaces |
| ESLint + Prettier | Linting/formatting |
| Husky + lint-staged | Pre-commit hooks |
| GitHub Actions | CI: typecheck + lint + test on every push |

## Why this stack wins

1. **Type safety end-to-end** — strict TS + Zod at every boundary. No runtime surprises during a live demo.
2. **Reusable across all 3 hackathon products** — `packages/agents`, `packages/db`, `packages/ui` are shared between Polly, Choir, Tower.
3. **All sponsor tech integrated** — Vultr (deploy), Gemini (LLMs), Featherless (open-source agent), Speechmatics (audio).
4. **Production-shaped** — error tracking, retries, idempotent agent runs. Not a throwaway prototype.
5. **MIT licensed** — required for Featherless prize eligibility.

## What we deliberately don't use

| Tech | Why not |
|---|---|
| Retell / VAPI | Polly doesn't have human-voice conversations, only audio ingestion |
| ElevenLabs TTS | Narrator is text-only on the dashboard, no synthesized voice needed |
| OpenAI | Sponsors are Google/Featherless — leaning into them scores higher |
| Vercel for backend | Vultr is the mandatory deploy target for the Vultr prize |
| Kraken | Region-locked (xStocks not in India) |
