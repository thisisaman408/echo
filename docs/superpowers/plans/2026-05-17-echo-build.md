# ECHO Implementation Plan — Milan AI Week Hackathon

> **For agentic workers:** Use `superpowers:subagent-driven-development` (if subagents available) or `superpowers:executing-plans` to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a multi-agent meeting workflow autopilot (ECHO) that captures meetings via Recall.ai, transcribes via Speechmatics, runs 5 specialist agents to extract+decide+execute across HubSpot/Gmail/Linear/Slack, and exposes an auditable memory dashboard — deployed to Vultr Tokyo and submitted by May 19 20:00 IST.

**Architecture:** Next.js 16 monolith on a single Vultr Tokyo VM (Ubuntu 24.04, 2vCPU/4GB). Postgres 16 + pgvector for transcripts, agent messages, executed actions, and embeddings. Inngest dev server in-process for cron + event orchestration. 5 typed agents reading/writing to a shared `agent_messages` bus. Real integrations via personal tokens (DEMO_MODE=true) so we skip OAuth screen recording for the hackathon. SSE for live dashboard streams. Audio archived to Vultr Object Storage with backlinks from every executed action.

**Tech Stack:** TypeScript 5+ (strict), Next.js 16, Tailwind v4, shadcn/ui, Drizzle ORM + pgvector, Better Auth, Inngest, Zod, Recall.ai SDK, Speechmatics SDK, Google Gemini API, Featherless OpenAI-compatible API, HubSpot Node SDK, Linear SDK, Slack Webhooks, Gmail API via googleapis. Hosting: Vultr Tokyo. Reverse proxy: Caddy (auto-HTTPS).

**Time budget:** ~36 hours solo across May 17 (14h) + May 18 (12h) + May 19 (10h).

**Pragmatic TDD policy:** Strict TDD is too slow for a 36-hour hackathon. We apply TDD where regressions hurt most:
- **TDD required**: integration clients (HubSpot, Linear, Slack, Gmail, Recall, Speechmatics), agent prompt contracts (input/output Zod schemas), Inngest function orchestration.
- **TDD skipped**: UI components, scripts, one-off configs, dashboard styling.

**Commit cadence:** Commit after every milestone exit criterion hits. Push to GitHub at least every 3 hours so work survives a Vultr or laptop death.

---

## File Structure (locked in advance)

```
echo/
├── apps/echo/                              # the Next.js app
│   ├── src/
│   │   ├── app/
│   │   │   ├── (dashboard)/
│   │   │   │   ├── layout.tsx              # auth-gated shell
│   │   │   │   ├── page.tsx                # main dashboard (live agent feed + recent actions)
│   │   │   │   ├── meetings/[id]/page.tsx  # meeting detail + audit drill-down
│   │   │   │   └── search/page.tsx         # pgvector search UI
│   │   │   ├── (auth)/login/page.tsx
│   │   │   ├── api/
│   │   │   │   ├── recall/webhook/route.ts # receives bot lifecycle events
│   │   │   │   ├── bots/start/route.ts     # POST { meeting_url } → dispatches Recall bot
│   │   │   │   ├── sse/agents/route.ts     # streams agent_messages
│   │   │   │   ├── sse/actions/route.ts    # streams executed_actions
│   │   │   │   ├── search/route.ts         # pgvector kNN search
│   │   │   │   └── auth/[...all]/route.ts  # better-auth catch-all
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx                    # public landing
│   │   ├── agents/
│   │   │   ├── action-extractor.ts         # Featherless
│   │   │   ├── stakeholder-classifier.ts   # Featherless
│   │   │   ├── decision-maker.ts           # Gemini Pro
│   │   │   ├── comms-drafter.ts            # Gemini Flash
│   │   │   ├── executor.ts                 # deterministic + Gemini narration
│   │   │   ├── orchestrator.ts             # Inngest fn that fans out
│   │   │   └── prompts/                    # *.txt prompt templates
│   │   ├── integrations/
│   │   │   ├── recall.ts                   # bot create, list, recording download
│   │   │   ├── speechmatics.ts             # batch transcribe + diarize
│   │   │   ├── gemini.ts                   # Pro + Flash + Vision clients
│   │   │   ├── featherless.ts              # OpenAI-compat client
│   │   │   ├── hubspot.ts                  # deal update, note, contact upsert
│   │   │   ├── linear.ts                   # createIssue
│   │   │   ├── slack.ts                    # postMessage via webhook
│   │   │   ├── gmail.ts                    # draft create
│   │   │   └── vultr-storage.ts            # S3-compatible put/get
│   │   ├── db/
│   │   │   ├── schema.ts                   # drizzle tables
│   │   │   ├── client.ts                   # singleton
│   │   │   └── migrations/                 # generated
│   │   ├── lib/
│   │   │   ├── auth.ts                     # better-auth config
│   │   │   ├── inngest.ts                  # inngest client
│   │   │   ├── env.ts                      # Zod-validated env loader
│   │   │   ├── sse.ts                      # SSE helper
│   │   │   └── ulid.ts                     # id generator
│   │   ├── components/
│   │   │   ├── agent-feed.tsx              # live SSE feed
│   │   │   ├── action-card.tsx             # executed action with drill link
│   │   │   ├── audit-drilldown.tsx         # modal: snippet + agent debate + audio
│   │   │   ├── transcript-viewer.tsx       # diarized transcript with speaker colors
│   │   │   ├── meeting-search.tsx          # search bar + result list
│   │   │   └── ui/                         # shadcn components
│   │   └── styles/globals.css
│   ├── tests/
│   │   ├── integrations/                   # one file per integration
│   │   ├── agents/                         # one file per agent
│   │   └── orchestrator.test.ts
│   ├── package.json
│   ├── tsconfig.json
│   ├── tailwind.config.ts
│   ├── next.config.ts
│   └── drizzle.config.ts
├── scripts/
│   ├── provision-vultr.sh                  # creates VM, installs deps, Caddy, Postgres
│   ├── setup-postgres.sh                   # creates DB, enables pgvector
│   ├── google-oauth-dance.ts               # one-time refresh token getter
│   ├── deploy.sh                           # SSH + git pull + pm2 restart
│   └── seed-demo-meeting.ts                # uploads a canned recording for demo
├── .env                                    # gitignored
├── 08-env.example                          # template
├── 09-integrations.md                      # auth architecture
├── README.md
├── LICENSE                                 # MIT
├── package.json                            # pnpm workspace root
├── pnpm-workspace.yaml
└── docs/superpowers/plans/
    └── 2026-05-17-echo-build.md            # this file
```

**Why monolithic Next.js, not Turborepo?** Polly's spec called for Turborepo. For ECHO's 36-hour budget, monorepo overhead (multiple `package.json`, workspace plumbing, separate package builds) is friction we can't afford. One `apps/echo` directory. Done.

**Why Inngest dev server in-process?** Avoids the second-VM / Inngest Cloud setup. For demo it runs in the same Node process. Production migration to Inngest Cloud is a flag flip.

---

## Chunk 1: Day 1 — May 17 (Foundations + Audio Pipeline + First Agent)

**Total budget: 14 hours.** Exit at the end of Day 1 with: Vultr VM live, public domain serving, Postgres+pgvector running, Recall bot can join a Zoom call and webhook the audio, Speechmatics transcribes it with diarization, Action Extractor (Featherless) extracts structured commitments from the transcript, results visible in a basic dashboard.

### Milestone 1.1 — Repo init + Next.js scaffold (45 min)

**Files:**
- Create: `echo/package.json`, `echo/pnpm-workspace.yaml`, `echo/.gitignore`, `echo/LICENSE`
- Create: `echo/apps/echo/` (Next.js scaffold)

- [ ] **Step 1: Init git repo + GitHub**

```bash
cd /Users/thisisaman408/Downloads/hackathons/echo
git init
gh repo create thisisaman408/echo --public --source=. --description "Autonomous meeting workflow agent — Milan AI Week 2026"
```

- [ ] **Step 2: Add MIT LICENSE (required for Featherless prize)**

Use `gh repo edit --add-topic` or write `LICENSE` directly. Use the standard MIT text with copyright `2026 Aman Kumar`.

- [ ] **Step 3: Init pnpm workspace**

```bash
cat > pnpm-workspace.yaml <<EOF
packages:
  - 'apps/*'
EOF

cat > package.json <<EOF
{
  "name": "echo",
  "private": true,
  "scripts": {
    "dev": "pnpm --filter echo dev",
    "build": "pnpm --filter echo build",
    "test": "pnpm --filter echo test",
    "db:migrate": "pnpm --filter echo db:migrate",
    "lint": "pnpm --filter echo lint",
    "typecheck": "pnpm --filter echo typecheck"
  },
  "packageManager": "pnpm@9.0.0"
}
EOF
```

- [ ] **Step 4: Scaffold Next.js**

```bash
pnpm dlx create-next-app@latest apps/echo \
  --typescript --tailwind --app --src-dir \
  --import-alias "@/*" --eslint --no-git --turbopack
cd apps/echo && pnpm install
```

- [ ] **Step 5: Add baseline deps**

```bash
cd apps/echo
pnpm add drizzle-orm postgres pgvector inngest zod \
  better-auth @googleapis/gmail @google/generative-ai \
  @linear/sdk @slack/webhook openai \
  recallai-sdk speechmatics ulid
pnpm add -D drizzle-kit @types/node tsx vitest @vitest/ui
```

(Recall.ai's official SDK is `recallai-node` — verify the exact package name when installing; npm shows `@recall-ai/sdk` or similar. Adjust at install time.)

- [ ] **Step 6: First commit**

```bash
git add -A && git commit -m "chore: init echo monorepo (Next.js 16 + Tailwind v4 + Drizzle + Inngest)"
git push -u origin main
```

**Exit criteria:** `pnpm dev` serves the default Next.js page on `localhost:3000`. Repo public on GitHub. License present.

---

### Milestone 1.2 — Provision Vultr Tokyo VM + DNS + Caddy (60 min)

**Files:**
- Create: `scripts/provision-vultr.sh`
- Create: `scripts/setup-postgres.sh`

- [ ] **Step 1: Create VM via Vultr UI (not script-able without API key)**

Go to https://my.vultr.com/deploy/ → Cloud Compute (Regular Performance) → Tokyo → Ubuntu 24.04 → 2vCPU/4GB plan ($24/mo, fine within $200 credit). Add your SSH key. Note the IP.

- [ ] **Step 2: Point DNS**

In your Cloudflare/Namecheap/wherever for `resyl.app`: add A record `echo` → Vultr IP. TTL 1 min.

- [ ] **Step 3: SSH in, install system deps**

```bash
ssh root@<vultr-ip>
apt update && apt upgrade -y
apt install -y curl git build-essential ufw postgresql-16 postgresql-16-pgvector caddy
curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
apt install -y nodejs
npm install -g pnpm@9 pm2
ufw allow 22 && ufw allow 80 && ufw allow 443 && ufw enable
```

- [ ] **Step 4: Configure Postgres**

```bash
sudo -u postgres psql <<EOF
CREATE USER echo WITH PASSWORD 'CHANGE_ME';
CREATE DATABASE echo OWNER echo;
\c echo
CREATE EXTENSION IF NOT EXISTS vector;
EOF
```

Edit `/etc/postgresql/16/main/pg_hba.conf` to allow `echo` user via password from localhost.

- [ ] **Step 5: Configure Caddy reverse proxy**

```bash
cat > /etc/caddy/Caddyfile <<EOF
echo.resyl.app {
  reverse_proxy localhost:3000
}
EOF
systemctl reload caddy
```

- [ ] **Step 6: Smoke test**

`curl https://echo.resyl.app` → 502 expected (no app running yet, but Caddy + TLS working).

- [ ] **Step 7: Save the credentials**

Write the VM IP, postgres password, SSH key location to `scripts/provision-vultr.sh` as a documented snapshot (don't commit secrets — write the *procedure*, not the values).

**Exit criteria:** `https://echo.resyl.app` returns 502 with a valid TLS cert. Postgres reachable from VM localhost as `echo` user. pgvector extension enabled.

---

### Milestone 1.3 — Drizzle schema + first migration (60 min)

**Files:**
- Create: `apps/echo/drizzle.config.ts`
- Create: `apps/echo/src/db/schema.ts`
- Create: `apps/echo/src/db/client.ts`
- Create: `apps/echo/src/lib/env.ts`

- [ ] **Step 1: Write the env validator (Zod)**

```typescript
// src/lib/env.ts
import { z } from "zod";

const envSchema = z.object({
  DEMO_MODE: z.enum(["true", "false"]).default("true"),
  DATABASE_URL: z.string().url(),
  BETTER_AUTH_SECRET: z.string().min(32),
  BETTER_AUTH_URL: z.string().url(),
  GOOGLE_OAUTH_CLIENT_ID: z.string().min(1),
  GOOGLE_OAUTH_CLIENT_SECRET: z.string().min(1),
  GOOGLE_OAUTH_REDIRECT_URI: z.string().url(),
  GOOGLE_OAUTH_REFRESH_TOKEN: z.string().optional(),
  RECALL_API_KEY: z.string().min(1),
  RECALL_REGION: z.string().default("ap-northeast-1"),
  RECALL_WEBHOOK_SECRET: z.string().min(16),
  SPEECHMATICS_API_KEY: z.string().min(1),
  GEMINI_API_KEY: z.string().min(1),
  GEMINI_MODEL_REASONING: z.string().default("gemini-2.0-pro-exp"),
  GEMINI_MODEL_FAST: z.string().default("gemini-2.0-flash-exp"),
  FEATHERLESS_API_KEY: z.string().min(1),
  FEATHERLESS_MODEL_EXTRACTOR: z.string().default("meta-llama/Meta-Llama-3.1-8B-Instruct"),
  FEATHERLESS_MODEL_CLASSIFIER: z.string().default("meta-llama/Meta-Llama-3.1-8B-Instruct"),
  HUBSPOT_PRIVATE_TOKEN: z.string().min(1),
  LINEAR_API_KEY: z.string().min(1),
  LINEAR_TEAM_ID: z.string().uuid(),
  SLACK_WEBHOOK_URL: z.string().url(),
  VULTR_STORAGE_ACCESS_KEY: z.string().min(1),
  VULTR_STORAGE_SECRET_KEY: z.string().min(1),
  VULTR_STORAGE_ENDPOINT: z.string().url(),
  VULTR_STORAGE_BUCKET: z.string().min(1),
  ECHO_PUBLIC_HOSTNAME: z.string().min(1),
});

export const env = envSchema.parse(process.env);
```

- [ ] **Step 2: Write Drizzle schema**

```typescript
// src/db/schema.ts
import { pgTable, uuid, text, timestamp, jsonb, integer, vector, pgEnum, index } from "drizzle-orm/pg-core";
import { ulid } from "ulid";

const id = () => text("id").primaryKey().$defaultFn(() => ulid());

export const agentEnum = pgEnum("agent", ["action_extractor", "stakeholder_classifier", "decision_maker", "comms_drafter", "executor"]);
export const urgencyEnum = pgEnum("urgency", ["low", "med", "high"]);
export const meetingStatusEnum = pgEnum("meeting_status", ["scheduled", "recording", "processing", "complete", "failed"]);

export const users = pgTable("users", {
  id: id(),
  email: text("email").notNull().unique(),
  name: text("name"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const meetings = pgTable("meetings", {
  id: id(),
  userId: text("user_id").notNull().references(() => users.id),
  meetingUrl: text("meeting_url").notNull(),
  recallBotId: text("recall_bot_id").unique(),
  title: text("title"),
  startedAt: timestamp("started_at"),
  endedAt: timestamp("ended_at"),
  status: meetingStatusEnum("status").notNull().default("scheduled"),
  audioStorageKey: text("audio_storage_key"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const transcripts = pgTable("transcripts", {
  id: id(),
  meetingId: text("meeting_id").notNull().references(() => meetings.id, { onDelete: "cascade" }),
  speaker: text("speaker").notNull(),       // diarization label, e.g. "S1", "S2"
  speakerName: text("speaker_name"),        // resolved later by Stakeholder Classifier
  startSec: integer("start_sec").notNull(),
  endSec: integer("end_sec").notNull(),
  text: text("text").notNull(),
  embedding: vector("embedding", { dimensions: 1536 }),
}, (t) => ({
  meetingIdx: index("transcripts_meeting_idx").on(t.meetingId),
  embeddingIdx: index("transcripts_embedding_idx").using("hnsw", t.embedding.op("vector_cosine_ops")),
}));

export const agentMessages = pgTable("agent_messages", {
  id: id(),
  meetingId: text("meeting_id").notNull().references(() => meetings.id, { onDelete: "cascade" }),
  agent: agentEnum("agent").notNull(),
  parentId: text("parent_id"),
  urgency: urgencyEnum("urgency").notNull().default("med"),
  content: jsonb("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (t) => ({
  meetingIdx: index("agent_messages_meeting_idx").on(t.meetingId),
}));

export const executedActions = pgTable("executed_actions", {
  id: id(),
  meetingId: text("meeting_id").notNull().references(() => meetings.id, { onDelete: "cascade" }),
  agentMessageId: text("agent_message_id").references(() => agentMessages.id),
  sourceTranscriptId: text("source_transcript_id").references(() => transcripts.id),
  integration: text("integration").notNull(),  // 'hubspot' | 'linear' | 'slack' | 'gmail'
  actionType: text("action_type").notNull(),   // 'deal_update' | 'create_issue' | 'post_message' | 'create_draft'
  externalId: text("external_id"),             // id returned by the external service
  payload: jsonb("payload").notNull(),
  status: text("status").notNull(),            // 'pending' | 'success' | 'failed'
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
```

- [ ] **Step 3: Drizzle config + first migration**

```typescript
// drizzle.config.ts
import { defineConfig } from "drizzle-kit";
export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./src/db/migrations",
  dialect: "postgresql",
  dbCredentials: { url: process.env.DATABASE_URL! },
});
```

```bash
pnpm drizzle-kit generate
pnpm drizzle-kit migrate
```

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "feat(db): drizzle schema for meetings, transcripts, agent_messages, executed_actions with pgvector"
git push
```

**Exit criteria:** Migration runs cleanly against local Postgres. `psql` shows all 5 tables + pgvector index. Env validator fails fast if any required var is missing.

---

### Milestone 1.4 — Recall.ai integration + webhook handler (90 min)

**Files:**
- Create: `apps/echo/src/integrations/recall.ts`
- Create: `apps/echo/src/app/api/recall/webhook/route.ts`
- Create: `apps/echo/src/app/api/bots/start/route.ts`
- Create: `apps/echo/tests/integrations/recall.test.ts`

- [ ] **Step 1: Write the failing test for Recall client**

```typescript
// tests/integrations/recall.test.ts
import { describe, it, expect, vi } from "vitest";
import { startBot } from "@/integrations/recall";

describe("recall.startBot", () => {
  it("POSTs meeting_url to the correct region endpoint and returns bot id", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ id: "bot_123", status: "ready" }),
    });
    global.fetch = fetchMock;

    const bot = await startBot("https://zoom.us/j/abc123");

    expect(fetchMock).toHaveBeenCalledWith(
      "https://ap-northeast-1.recall.ai/api/v1/bot",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({ Authorization: expect.stringMatching(/^Token/) }),
        body: expect.stringContaining("zoom.us"),
      })
    );
    expect(bot.id).toBe("bot_123");
  });
});
```

- [ ] **Step 2: Run test, see it fail**

```bash
pnpm vitest run tests/integrations/recall.test.ts
```
Expected: FAIL with import error.

- [ ] **Step 3: Implement the Recall client**

```typescript
// src/integrations/recall.ts
import { env } from "@/lib/env";

const BASE = `https://${env.RECALL_REGION}.recall.ai/api/v1`;

export async function startBot(meetingUrl: string) {
  const res = await fetch(`${BASE}/bot`, {
    method: "POST",
    headers: {
      Authorization: `Token ${env.RECALL_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      meeting_url: meetingUrl,
      bot_name: "ECHO",
      recording_config: {
        transcript: { provider: { recallai_streaming: null } }, // we use Speechmatics post-hoc; disable Recall's
        video_mixed_layout: "speaker_view",
      },
      webhook_url: `https://${env.ECHO_PUBLIC_HOSTNAME}/api/recall/webhook`,
    }),
  });
  if (!res.ok) throw new Error(`Recall startBot failed: ${res.status} ${await res.text()}`);
  return res.json() as Promise<{ id: string; status: string }>;
}

export async function getRecordingDownloadUrl(botId: string): Promise<string | null> {
  const res = await fetch(`${BASE}/bot/${botId}`, {
    headers: { Authorization: `Token ${env.RECALL_API_KEY}` },
  });
  if (!res.ok) throw new Error(`Recall getBot failed: ${res.status}`);
  const data = await res.json();
  return data.video_url || data.recording?.download_url || null;
}
```

- [ ] **Step 4: Run test, verify it passes**

```bash
pnpm vitest run tests/integrations/recall.test.ts
```
Expected: PASS.

- [ ] **Step 5: Write the webhook handler**

```typescript
// src/app/api/recall/webhook/route.ts
import { db } from "@/db/client";
import { meetings } from "@/db/schema";
import { eq } from "drizzle-orm";
import { inngest } from "@/lib/inngest";
import crypto from "node:crypto";
import { env } from "@/lib/env";

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get("x-recall-signature");
  // Verify signature (Recall HMAC docs — exact algorithm TBD on first test)
  const expected = crypto.createHmac("sha256", env.RECALL_WEBHOOK_SECRET).update(body).digest("hex");
  if (signature !== expected) return new Response("Invalid signature", { status: 401 });

  const event = JSON.parse(body);

  if (event.event === "bot.status_change") {
    const status = event.data.status;
    await db.update(meetings)
      .set({ status: status === "done" ? "complete" : status === "in_call_recording" ? "recording" : "scheduled" })
      .where(eq(meetings.recallBotId, event.data.bot_id));
  }

  if (event.event === "recording.done") {
    await inngest.send({
      name: "echo/meeting.recording_done",
      data: { recallBotId: event.data.bot_id, recordingUrl: event.data.recording.url },
    });
  }

  return new Response("ok", { status: 200 });
}
```

- [ ] **Step 6: Write the bot dispatch endpoint**

```typescript
// src/app/api/bots/start/route.ts
import { startBot } from "@/integrations/recall";
import { db } from "@/db/client";
import { meetings } from "@/db/schema";
import { z } from "zod";

const bodySchema = z.object({ meetingUrl: z.string().url(), userId: z.string() });

export async function POST(req: Request) {
  const { meetingUrl, userId } = bodySchema.parse(await req.json());
  const bot = await startBot(meetingUrl);
  const [meeting] = await db.insert(meetings).values({
    userId,
    meetingUrl,
    recallBotId: bot.id,
    status: "scheduled",
  }).returning();
  return Response.json({ meetingId: meeting.id, botId: bot.id });
}
```

- [ ] **Step 7: Smoke test the live API**

Get a Zoom personal room URL. Hit `POST /api/bots/start` from `curl` against the deployed `https://echo.resyl.app`. Join the Zoom call yourself. Confirm the Recall bot joins. Talk for 30 seconds. End the call. Check the Recall dashboard logs show a `recording.done` event fired toward your webhook URL.

- [ ] **Step 8: Commit**

```bash
git add -A && git commit -m "feat(recall): bot dispatch + webhook handler + signature verification"
git push
```

**Exit criteria:** End-to-end: POST to `/api/bots/start` → bot joins your real Zoom call → talking → ending the call → webhook fires → meeting row updated → Inngest event emitted. The video file is downloadable from Recall.

---

### Milestone 1.5 — Speechmatics integration (transcribe + diarize) (75 min)

**Files:**
- Create: `apps/echo/src/integrations/speechmatics.ts`
- Create: `apps/echo/src/integrations/vultr-storage.ts`
- Create: `apps/echo/tests/integrations/speechmatics.test.ts`
- Modify: `apps/echo/src/agents/orchestrator.ts` (add audio-process step)

- [ ] **Step 1: Write Speechmatics client (batch transcription with diarization)**

```typescript
// src/integrations/speechmatics.ts
import { env } from "@/lib/env";

const BASE = "https://asr.api.speechmatics.com/v2";

export type DiarizedSegment = { speaker: string; startSec: number; endSec: number; text: string };

export async function transcribeFromUrl(audioUrl: string): Promise<DiarizedSegment[]> {
  // Step 1: submit job
  const formData = new FormData();
  formData.append("config", JSON.stringify({
    type: "transcription",
    transcription_config: {
      language: "en",
      operating_point: "enhanced",
      diarization: "speaker",
    },
    fetch_data: { url: audioUrl },
  }));
  const submit = await fetch(`${BASE}/jobs`, {
    method: "POST",
    headers: { Authorization: `Bearer ${env.SPEECHMATICS_API_KEY}` },
    body: formData,
  });
  if (!submit.ok) throw new Error(`Speechmatics submit failed: ${await submit.text()}`);
  const { id: jobId } = await submit.json();

  // Step 2: poll
  for (let attempt = 0; attempt < 60; attempt++) {
    await new Promise(r => setTimeout(r, 5000));
    const status = await fetch(`${BASE}/jobs/${jobId}`, {
      headers: { Authorization: `Bearer ${env.SPEECHMATICS_API_KEY}` },
    });
    const job = await status.json();
    if (job.job.status === "done") break;
    if (job.job.status === "rejected") throw new Error(`Speechmatics rejected job: ${JSON.stringify(job)}`);
  }

  // Step 3: fetch transcript
  const result = await fetch(`${BASE}/jobs/${jobId}/transcript?format=json-v2`, {
    headers: { Authorization: `Bearer ${env.SPEECHMATICS_API_KEY}` },
  });
  const transcript = await result.json();

  // Step 4: collapse word-level results into per-speaker segments
  const segments: DiarizedSegment[] = [];
  let current: DiarizedSegment | null = null;
  for (const r of transcript.results || []) {
    const word = r.alternatives?.[0]?.content;
    const speaker = r.alternatives?.[0]?.speaker || "UU";
    if (!word) continue;
    if (current && current.speaker === speaker) {
      current.text += " " + word;
      current.endSec = r.end_time;
    } else {
      if (current) segments.push(current);
      current = { speaker, startSec: r.start_time, endSec: r.end_time, text: word };
    }
  }
  if (current) segments.push(current);
  return segments;
}
```

- [ ] **Step 2: Write Vultr Object Storage client (S3-compatible)**

```typescript
// src/integrations/vultr-storage.ts
import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { env } from "@/lib/env";

const s3 = new S3Client({
  endpoint: env.VULTR_STORAGE_ENDPOINT,
  region: "ap-northeast-1",
  credentials: { accessKeyId: env.VULTR_STORAGE_ACCESS_KEY, secretAccessKey: env.VULTR_STORAGE_SECRET_KEY },
  forcePathStyle: true,
});

export async function putAudio(key: string, body: Buffer | ReadableStream): Promise<string> {
  await s3.send(new PutObjectCommand({ Bucket: env.VULTR_STORAGE_BUCKET, Key: key, Body: body }));
  return key;
}

export async function getSignedAudioUrl(key: string): Promise<string> {
  return getSignedUrl(s3, new GetObjectCommand({ Bucket: env.VULTR_STORAGE_BUCKET, Key: key }), { expiresIn: 3600 });
}
```

Install: `pnpm add @aws-sdk/client-s3 @aws-sdk/s3-request-presigner`

- [ ] **Step 3: Wire orchestrator: download from Recall → put in Vultr → send to Speechmatics → insert transcripts**

```typescript
// src/agents/orchestrator.ts (initial version)
import { inngest } from "@/lib/inngest";
import { getRecordingDownloadUrl } from "@/integrations/recall";
import { transcribeFromUrl } from "@/integrations/speechmatics";
import { putAudio } from "@/integrations/vultr-storage";
import { db } from "@/db/client";
import { meetings, transcripts } from "@/db/schema";
import { eq } from "drizzle-orm";

export const processRecording = inngest.createFunction(
  { id: "process-recording" },
  { event: "echo/meeting.recording_done" },
  async ({ event, step }) => {
    const { recallBotId } = event.data;

    const meeting = await step.run("load-meeting", async () => {
      const [m] = await db.select().from(meetings).where(eq(meetings.recallBotId, recallBotId));
      return m;
    });

    const recordingUrl = await step.run("get-recording-url", () => getRecordingDownloadUrl(recallBotId));
    if (!recordingUrl) throw new Error("No recording URL");

    const audioKey = await step.run("archive-audio", async () => {
      const audioRes = await fetch(recordingUrl);
      const buf = Buffer.from(await audioRes.arrayBuffer());
      return putAudio(`meetings/${meeting.id}.mp4`, buf);
    });

    await db.update(meetings).set({ audioStorageKey: audioKey, status: "processing" }).where(eq(meetings.id, meeting.id));

    const segments = await step.run("speechmatics", () => transcribeFromUrl(recordingUrl));

    await step.run("insert-transcripts", async () => {
      if (segments.length === 0) return;
      await db.insert(transcripts).values(segments.map(s => ({
        meetingId: meeting.id,
        speaker: s.speaker,
        startSec: Math.floor(s.startSec),
        endSec: Math.floor(s.endSec),
        text: s.text,
      })));
    });

    // Fan out to agents (next milestones)
    await step.sendEvent("trigger-agents", {
      name: "echo/agents.start",
      data: { meetingId: meeting.id },
    });
  },
);
```

- [ ] **Step 4: Smoke test end-to-end with a real Zoom call (~5 min meeting)**

Run a real Zoom call. Verify: audio downloaded → uploaded to Vultr Object Storage → Speechmatics transcribes → `transcripts` table populated with diarized segments.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat(audio): speechmatics batch transcribe + vultr object storage archive + orchestrator step"
git push
```

**Exit criteria:** A real Zoom call's audio lands in Vultr Object Storage; the `transcripts` table has rows with speaker labels and timestamps; downstream Inngest event fires to trigger agents.

---

### Milestone 1.6 — Featherless client + Action Extractor agent (90 min)

**Files:**
- Create: `apps/echo/src/integrations/featherless.ts`
- Create: `apps/echo/src/agents/action-extractor.ts`
- Create: `apps/echo/src/agents/prompts/action-extractor.txt`
- Create: `apps/echo/tests/agents/action-extractor.test.ts`

- [ ] **Step 1: Write Featherless OpenAI-compat client**

```typescript
// src/integrations/featherless.ts
import OpenAI from "openai";
import { env } from "@/lib/env";

export const featherless = new OpenAI({
  apiKey: env.FEATHERLESS_API_KEY,
  baseURL: "https://api.featherless.ai/v1",
});

export async function completeJson<T>(model: string, system: string, user: string, zodSchema: { parse: (data: unknown) => T }): Promise<T> {
  const res = await featherless.chat.completions.create({
    model,
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
    response_format: { type: "json_object" },
    temperature: 0.2,
  });
  const raw = res.choices[0]?.message?.content ?? "{}";
  return zodSchema.parse(JSON.parse(raw));
}
```

- [ ] **Step 2: Write Action Extractor prompt + Zod output schema**

```
// src/agents/prompts/action-extractor.txt
You are Action Extractor — a meeting analyst agent.
Given a diarized meeting transcript, extract every concrete action item, commitment, decision, blocker, and follow-up that was mentioned.

You will receive:
  Transcript (diarized): {transcript}

Return JSON only with the following shape:
{
  "actions": [
    {
      "type": "action_item|commitment|decision|blocker|follow_up",
      "description": "<one sentence>",
      "owner_hint": "<speaker label, e.g. S1, or 'unknown'>",
      "due_hint": "<verbatim due reference if any, else null>",
      "source_speaker": "<speaker label>",
      "source_start_sec": <number>,
      "source_end_sec": <number>,
      "verbatim_quote": "<the exact transcript phrase that triggered this>"
    }
  ]
}

If no actions are present, return { "actions": [] }.
```

```typescript
// src/agents/action-extractor.ts
import { completeJson } from "@/integrations/featherless";
import { env } from "@/lib/env";
import { db } from "@/db/client";
import { agentMessages, transcripts } from "@/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import fs from "node:fs";
import path from "node:path";

const ActionSchema = z.object({
  actions: z.array(z.object({
    type: z.enum(["action_item", "commitment", "decision", "blocker", "follow_up"]),
    description: z.string(),
    owner_hint: z.string(),
    due_hint: z.string().nullable(),
    source_speaker: z.string(),
    source_start_sec: z.number(),
    source_end_sec: z.number(),
    verbatim_quote: z.string(),
  })),
});

const PROMPT = fs.readFileSync(path.join(process.cwd(), "src/agents/prompts/action-extractor.txt"), "utf8");

export async function runActionExtractor(meetingId: string) {
  const segments = await db.select().from(transcripts).where(eq(transcripts.meetingId, meetingId)).orderBy(transcripts.startSec);
  const formatted = segments.map(s => `[${s.speaker} ${s.startSec}-${s.endSec}s]: ${s.text}`).join("\n");

  const { actions } = await completeJson(
    env.FEATHERLESS_MODEL_EXTRACTOR,
    PROMPT,
    `Transcript:\n${formatted}`,
    ActionSchema,
  );

  await db.insert(agentMessages).values({
    meetingId,
    agent: "action_extractor",
    urgency: "med",
    content: { actions },
  });

  return actions;
}
```

- [ ] **Step 3: Wire into orchestrator**

```typescript
// Append to src/agents/orchestrator.ts
import { runActionExtractor } from "@/agents/action-extractor";

export const runAgents = inngest.createFunction(
  { id: "run-agents" },
  { event: "echo/agents.start" },
  async ({ event, step }) => {
    const { meetingId } = event.data;
    await step.run("action-extractor", () => runActionExtractor(meetingId));
    // Other agents wired in Milestone 2.1–2.4
  },
);
```

- [ ] **Step 4: Smoke test with the meeting from Milestone 1.5**

Trigger the agent manually if Inngest didn't already fire. Verify `agent_messages` has a row from `action_extractor` with extracted JSON.

- [ ] **Step 5: Build a minimal dashboard view**

```typescript
// src/app/(dashboard)/page.tsx (initial version)
import { db } from "@/db/client";
import { meetings, agentMessages } from "@/db/schema";
import { desc } from "drizzle-orm";

export default async function Dashboard() {
  const recentMeetings = await db.select().from(meetings).orderBy(desc(meetings.createdAt)).limit(10);
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">ECHO Dashboard</h1>
      <div className="space-y-4">
        {recentMeetings.map(m => (
          <div key={m.id} className="border p-4 rounded">
            <div className="font-mono text-sm">{m.id}</div>
            <div>Status: {m.status}</div>
            <a href={`/meetings/${m.id}`} className="text-blue-600 underline">View</a>
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "feat(agents): action extractor via featherless + minimal dashboard view"
git push
```

**Exit criteria:** End-to-end flow visible in the dashboard: real meeting → recording → transcript → action extractor output JSON. The full pipeline works for one agent.

---

### Milestone 1.7 — Day 1 wrap (deploy + checkpoint) (30 min)

- [ ] **Step 1: Write deploy script**

```bash
# scripts/deploy.sh
#!/usr/bin/env bash
set -e
VM=root@<vultr-ip>
ssh $VM "cd ~/echo && git pull && cd apps/echo && pnpm install && pnpm db:migrate && pm2 restart echo || pm2 start npm --name echo -- start"
```

- [ ] **Step 2: First deploy**

On Vultr VM: `git clone https://github.com/thisisaman408/echo.git ~/echo && cd ~/echo && pnpm install && cd apps/echo && pnpm build && pm2 start npm --name echo -- start`. Set up `.env` on the VM with all the keys gathered so far.

- [ ] **Step 3: Confirm `https://echo.resyl.app` is live**

Hit the URL in the browser. Should see the basic dashboard.

- [ ] **Step 4: Day 1 commit + push**

```bash
git tag v0.1-day1
git push --tags
```

- [ ] **Step 5: Sleep**

Day 2 starts fresh.

**Day 1 exit criteria:** `https://echo.resyl.app` live. One Zoom call → bot → transcript → action extraction. One agent of five done. Foundation solid.

---

## Chunk 2: Day 2 — May 18 (Remaining 4 Agents + 4 Integrations + Live Dashboard)

**Total budget: 12 hours.** Exit at end of Day 2 with: All 5 agents fully wired in Inngest pipeline. HubSpot + Linear + Slack + Gmail integrations firing real API calls. Live dashboard SSE streaming agent activity and executed actions as they happen.

### Milestone 2.1 — Stakeholder Classifier agent (60 min)

**Files:**
- Create: `apps/echo/src/agents/stakeholder-classifier.ts`
- Create: `apps/echo/src/agents/prompts/stakeholder-classifier.txt`

- [ ] **Step 1: Write the prompt**

```
You are Stakeholder Classifier. Given a diarized meeting transcript and the list of extracted actions, identify each unique speaker and map them to:
- Likely role (rep, prospect, internal_team, customer, manager, unknown)
- Suggested external resolution (HubSpot contact email if you can guess from context, e.g. "if speaker mentioned 'I'm Sarah from Acme'")
- Whether they are internal (your team) or external (customer/prospect/vendor)

For each action, identify which speakers are the OWNER (who will do it) and WATCHERS (who else cares).

Return JSON:
{
  "speakers": [
    { "label": "S1", "role": "...", "internal": true|false, "name_hint": "...", "email_hint": "..." }
  ],
  "action_assignments": [
    { "action_index": <int>, "owner_speaker": "S1", "watcher_speakers": ["S2"] }
  ]
}
```

- [ ] **Step 2: Implement (mirror Action Extractor structure)**

```typescript
// src/agents/stakeholder-classifier.ts — same shape as action-extractor.ts
// Reads transcripts + previous agent_messages from action_extractor.
// Outputs to agent_messages with agent='stakeholder_classifier'.
```

- [ ] **Step 3: Add to orchestrator after action extractor**

- [ ] **Step 4: Commit**

```bash
git commit -m "feat(agents): stakeholder classifier via featherless"
```

**Exit criteria:** `agent_messages` row appears for stakeholder_classifier after action_extractor completes.

---

### Milestone 2.2 — Decision Maker agent (Gemini Pro) (60 min)

**Files:**
- Create: `apps/echo/src/integrations/gemini.ts`
- Create: `apps/echo/src/agents/decision-maker.ts`
- Create: `apps/echo/src/agents/prompts/decision-maker.txt`

- [ ] **Step 1: Gemini client**

```typescript
// src/integrations/gemini.ts
import { GoogleGenerativeAI } from "@google/generative-ai";
import { env } from "@/lib/env";

const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
export const geminiPro = genAI.getGenerativeModel({ model: env.GEMINI_MODEL_REASONING });
export const geminiFlash = genAI.getGenerativeModel({ model: env.GEMINI_MODEL_FAST });

export async function geminiJson<T>(model: typeof geminiPro, system: string, user: string, zodSchema: { parse: (data: unknown) => T }): Promise<T> {
  const result = await model.generateContent({
    contents: [{ role: "user", parts: [{ text: `${system}\n\n${user}` }] }],
    generationConfig: { responseMimeType: "application/json", temperature: 0.3 },
  });
  return zodSchema.parse(JSON.parse(result.response.text()));
}
```

- [ ] **Step 2: Decision Maker prompt + impl**

Prompt synthesizes Action Extractor + Stakeholder Classifier outputs into a structured execution plan per integration. Output schema:

```typescript
{
  workflow: {
    hubspot_updates: [{ deal_search_hint: "...", stage_change?: "...", notes: ["..."] }],
    linear_issues:   [{ title: "...", description: "...", assignee_email_hint: "...", priority: "low|med|high" }],
    gmail_drafts:    [{ to: "...", subject: "...", body_markdown: "...", source_action_index: <int> }],
    slack_summary:   { headline: "...", bullets: ["..."] },
  }
}
```

- [ ] **Step 3: Add to orchestrator**

- [ ] **Step 4: Commit**

```bash
git commit -m "feat(agents): decision maker via gemini pro"
```

---

### Milestone 2.3 — Comms Drafter agent (Gemini Flash) (45 min)

**Files:**
- Create: `apps/echo/src/agents/comms-drafter.ts`
- Create: `apps/echo/src/agents/prompts/comms-drafter.txt`

The Comms Drafter takes Decision Maker output and **rewrites tone-calibrated final copy** for each comm (email body, Slack message, Linear description). Decision Maker outputs structure; Comms Drafter outputs polish.

- [ ] **Step 1: Prompt + impl + orchestrator wire-up**

- [ ] **Step 2: Commit**

```bash
git commit -m "feat(agents): comms drafter via gemini flash"
```

---

### Milestone 2.4 — HubSpot integration (75 min)

**Files:**
- Create: `apps/echo/src/integrations/hubspot.ts`
- Create: `apps/echo/tests/integrations/hubspot.test.ts`

- [ ] **Step 1: Write the failing tests**

```typescript
// tests/integrations/hubspot.test.ts
describe("hubspot", () => {
  it("creates a contact with email + name", async () => { /* ... */ });
  it("updates a deal stage by id", async () => { /* ... */ });
  it("creates a note and associates it to a deal", async () => { /* ... */ });
});
```

- [ ] **Step 2: Implement**

```typescript
// src/integrations/hubspot.ts
import { env } from "@/lib/env";

const BASE = "https://api.hubapi.com";
const headers = () => ({
  Authorization: `Bearer ${env.HUBSPOT_PRIVATE_TOKEN}`,
  "Content-Type": "application/json",
});

export async function upsertContact(p: { email: string; firstname?: string; lastname?: string }) {
  const res = await fetch(`${BASE}/crm/v3/objects/contacts/${encodeURIComponent(p.email)}?idProperty=email`, {
    method: "PATCH",
    headers: headers(),
    body: JSON.stringify({ properties: p }),
  });
  if (res.status === 404) {
    const create = await fetch(`${BASE}/crm/v3/objects/contacts`, { method: "POST", headers: headers(), body: JSON.stringify({ properties: p }) });
    return create.json();
  }
  return res.json();
}

export async function updateDealStage(dealId: string, stage: string) {
  const res = await fetch(`${BASE}/crm/v3/objects/deals/${dealId}`, {
    method: "PATCH",
    headers: headers(),
    body: JSON.stringify({ properties: { dealstage: stage } }),
  });
  if (!res.ok) throw new Error(`HubSpot updateDealStage: ${await res.text()}`);
  return res.json();
}

export async function createDealNote(dealId: string, body: string) {
  const noteRes = await fetch(`${BASE}/crm/v3/objects/notes`, {
    method: "POST", headers: headers(),
    body: JSON.stringify({ properties: { hs_note_body: body, hs_timestamp: Date.now() } }),
  });
  const note = await noteRes.json();
  // Association type 213 = note-to-deal
  await fetch(`${BASE}/crm/v3/objects/deals/${dealId}/associations/notes/${note.id}/213`, { method: "PUT", headers: headers() });
  return note;
}

export async function searchDeals(query: string) {
  const res = await fetch(`${BASE}/crm/v3/objects/deals/search`, {
    method: "POST", headers: headers(),
    body: JSON.stringify({ query, limit: 5 }),
  });
  return (await res.json()).results;
}
```

- [ ] **Step 3: Tests pass + commit**

```bash
git commit -m "feat(integrations): hubspot client (contacts, deals, notes)"
```

---

### Milestone 2.5 — Linear integration (45 min)

**Files:**
- Create: `apps/echo/src/integrations/linear.ts`
- Create: `apps/echo/tests/integrations/linear.test.ts`

- [ ] **Step 1: Test + impl**

```typescript
// src/integrations/linear.ts
import { LinearClient } from "@linear/sdk";
import { env } from "@/lib/env";

const linear = new LinearClient({ apiKey: env.LINEAR_API_KEY });

export async function createIssue(p: { title: string; description?: string; priority?: 0 | 1 | 2 | 3 | 4; assigneeEmail?: string }) {
  let assigneeId: string | undefined;
  if (p.assigneeEmail) {
    const users = await linear.users({ filter: { email: { eq: p.assigneeEmail } } });
    assigneeId = users.nodes[0]?.id;
  }
  const result = await linear.createIssue({
    teamId: env.LINEAR_TEAM_ID,
    title: p.title,
    description: p.description,
    priority: p.priority,
    assigneeId,
  });
  return result.issue;
}
```

- [ ] **Step 2: Commit**

```bash
git commit -m "feat(integrations): linear client (create issues)"
```

---

### Milestone 2.6 — Slack + Gmail integrations (60 min)

**Files:**
- Create: `apps/echo/src/integrations/slack.ts`
- Create: `apps/echo/src/integrations/gmail.ts`
- Create: `apps/echo/scripts/google-oauth-dance.ts`

- [ ] **Step 1: Slack (incoming webhook — trivial)**

```typescript
// src/integrations/slack.ts
import { IncomingWebhook } from "@slack/webhook";
import { env } from "@/lib/env";

const webhook = new IncomingWebhook(env.SLACK_WEBHOOK_URL);

export async function postSummary(headline: string, bullets: string[], meetingLink?: string) {
  await webhook.send({
    text: headline,
    blocks: [
      { type: "header", text: { type: "plain_text", text: headline } },
      ...bullets.map(b => ({ type: "section" as const, text: { type: "mrkdwn", text: `• ${b}` } })),
      ...(meetingLink ? [{ type: "context", elements: [{ type: "mrkdwn", text: `<${meetingLink}|View in ECHO>` }] }] : []),
    ],
  });
}
```

- [ ] **Step 2: One-time Google OAuth dance script**

```typescript
// scripts/google-oauth-dance.ts
import { google } from "googleapis";
import readline from "node:readline";

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_OAUTH_CLIENT_ID,
  process.env.GOOGLE_OAUTH_CLIENT_SECRET,
  process.env.GOOGLE_OAUTH_REDIRECT_URI,
);

const url = oauth2Client.generateAuthUrl({
  access_type: "offline",
  prompt: "consent",
  scope: ["https://www.googleapis.com/auth/gmail.compose"],
});

console.log("Open this URL, grant access, paste the code below:");
console.log(url);

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
rl.question("Code: ", async (code) => {
  const { tokens } = await oauth2Client.getToken(code);
  console.log("\nAdd this to .env:");
  console.log(`GOOGLE_OAUTH_REFRESH_TOKEN="${tokens.refresh_token}"`);
  rl.close();
});
```

Run once: `pnpm tsx scripts/google-oauth-dance.ts`. Paste the result into `.env`.

- [ ] **Step 3: Gmail draft client**

```typescript
// src/integrations/gmail.ts
import { google } from "googleapis";
import { env } from "@/lib/env";

const oauth2Client = new google.auth.OAuth2(env.GOOGLE_OAUTH_CLIENT_ID, env.GOOGLE_OAUTH_CLIENT_SECRET, env.GOOGLE_OAUTH_REDIRECT_URI);
oauth2Client.setCredentials({ refresh_token: env.GOOGLE_OAUTH_REFRESH_TOKEN! });
const gmail = google.gmail({ version: "v1", auth: oauth2Client });

export async function createDraft(p: { to: string; subject: string; bodyMarkdown: string }) {
  const raw = Buffer.from([
    `To: ${p.to}`,
    `Subject: ${p.subject}`,
    `Content-Type: text/plain; charset=utf-8`,
    "",
    p.bodyMarkdown,
  ].join("\n")).toString("base64url");
  const res = await gmail.users.drafts.create({ userId: "me", requestBody: { message: { raw } } });
  return res.data;
}
```

- [ ] **Step 4: Commit**

```bash
git commit -m "feat(integrations): slack webhook + gmail drafts + google oauth dance script"
```

---

### Milestone 2.7 — Executor agent + full pipeline E2E (90 min)

**Files:**
- Create: `apps/echo/src/agents/executor.ts`
- Modify: `apps/echo/src/agents/orchestrator.ts`

- [ ] **Step 1: Executor — deterministic dispatcher reading Comms Drafter output**

```typescript
// src/agents/executor.ts
import { db } from "@/db/client";
import { executedActions } from "@/db/schema";
import * as hubspot from "@/integrations/hubspot";
import * as linear from "@/integrations/linear";
import * as slack from "@/integrations/slack";
import * as gmail from "@/integrations/gmail";

export async function runExecutor(meetingId: string, workflow: any, agentMessageId: string) {
  const results: any[] = [];

  for (const h of workflow.hubspot_updates ?? []) {
    try {
      const deals = await hubspot.searchDeals(h.deal_search_hint);
      const deal = deals[0];
      if (!deal) { results.push({ integration: "hubspot", status: "skipped", reason: "no deal match" }); continue; }
      if (h.stage_change) await hubspot.updateDealStage(deal.id, h.stage_change);
      for (const note of h.notes ?? []) await hubspot.createDealNote(deal.id, note);
      await db.insert(executedActions).values({
        meetingId, agentMessageId, integration: "hubspot",
        actionType: "deal_update", externalId: deal.id,
        payload: h, status: "success",
      });
      results.push({ integration: "hubspot", status: "success", dealId: deal.id });
    } catch (e: any) {
      await db.insert(executedActions).values({
        meetingId, agentMessageId, integration: "hubspot",
        actionType: "deal_update", payload: h, status: "failed", errorMessage: e.message,
      });
    }
  }

  for (const issue of workflow.linear_issues ?? []) {
    try {
      const created = await linear.createIssue(issue);
      await db.insert(executedActions).values({
        meetingId, agentMessageId, integration: "linear",
        actionType: "create_issue", externalId: (await created)?.id,
        payload: issue, status: "success",
      });
    } catch (e: any) { /* ... */ }
  }

  for (const draft of workflow.gmail_drafts ?? []) {
    try {
      const created = await gmail.createDraft({ to: draft.to, subject: draft.subject, bodyMarkdown: draft.body_markdown });
      await db.insert(executedActions).values({
        meetingId, agentMessageId, integration: "gmail",
        actionType: "create_draft", externalId: created.id ?? undefined,
        payload: draft, status: "success",
      });
    } catch (e: any) { /* ... */ }
  }

  if (workflow.slack_summary) {
    try {
      await slack.postSummary(workflow.slack_summary.headline, workflow.slack_summary.bullets);
      await db.insert(executedActions).values({
        meetingId, agentMessageId, integration: "slack",
        actionType: "post_message", payload: workflow.slack_summary, status: "success",
      });
    } catch (e: any) { /* ... */ }
  }

  return results;
}
```

- [ ] **Step 2: Wire full orchestrator chain**

```typescript
// src/agents/orchestrator.ts (final)
export const runAgents = inngest.createFunction(
  { id: "run-agents" },
  { event: "echo/agents.start" },
  async ({ event, step }) => {
    const { meetingId } = event.data;
    await step.run("action-extractor", () => runActionExtractor(meetingId));
    await step.run("stakeholder-classifier", () => runStakeholderClassifier(meetingId));
    const decision = await step.run("decision-maker", () => runDecisionMaker(meetingId));
    const comms = await step.run("comms-drafter", () => runCommsDrafter(meetingId, decision));
    await step.run("executor", () => runExecutor(meetingId, comms.workflow, comms.messageId));
  },
);
```

- [ ] **Step 3: Full smoke test**

End-to-end: take a real 5-minute Zoom call with yourself (talk through a fake deal: "I'm Sarah from Acme, we need SAML by Q2, can you send a proposal?"). Watch the pipeline fire. Verify HubSpot, Linear, Slack all show updates and Gmail has a draft.

- [ ] **Step 4: Commit + tag**

```bash
git commit -m "feat(agents): executor + full 5-agent pipeline e2e"
git tag v0.2-pipeline-complete
git push --tags
```

**Exit criteria:** A real 5-min Zoom call triggers all 5 agents end-to-end. Real updates appear in HubSpot, Linear, Slack, Gmail.

---

### Milestone 2.8 — Live dashboard SSE feed (90 min)

**Files:**
- Create: `apps/echo/src/lib/sse.ts`
- Create: `apps/echo/src/app/api/sse/agents/route.ts`
- Create: `apps/echo/src/app/api/sse/actions/route.ts`
- Create: `apps/echo/src/components/agent-feed.tsx`
- Create: `apps/echo/src/components/action-card.tsx`
- Modify: `apps/echo/src/app/(dashboard)/page.tsx`

- [ ] **Step 1: SSE helper using Postgres NOTIFY/LISTEN**

In schema: add triggers on `agent_messages` and `executed_actions` that NOTIFY a channel. The SSE route listens on a `postgres` client and streams events.

Alternatively, simpler for hackathon: SSE polls every 1s for new rows after the last seen `created_at`. Less elegant, ships in 20 min instead of 60. **Take the polling path for time.**

```typescript
// src/app/api/sse/agents/route.ts
import { db } from "@/db/client";
import { agentMessages } from "@/db/schema";
import { gt } from "drizzle-orm";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const meetingId = url.searchParams.get("meetingId");
  if (!meetingId) return new Response("meetingId required", { status: 400 });

  const stream = new ReadableStream({
    async start(controller) {
      let lastTs = new Date(0);
      const encoder = new TextEncoder();
      const tick = async () => {
        const rows = await db.select().from(agentMessages).where(gt(agentMessages.createdAt, lastTs));
        for (const r of rows) {
          if (r.meetingId !== meetingId) continue;
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(r)}\n\n`));
          lastTs = r.createdAt;
        }
      };
      const interval = setInterval(tick, 1000);
      req.signal.addEventListener("abort", () => { clearInterval(interval); controller.close(); });
    },
  });

  return new Response(stream, { headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache" } });
}
```

- [ ] **Step 2: AgentFeed client component**

```typescript
// src/components/agent-feed.tsx
"use client";
import { useEffect, useState } from "react";

export function AgentFeed({ meetingId }: { meetingId: string }) {
  const [messages, setMessages] = useState<any[]>([]);
  useEffect(() => {
    const es = new EventSource(`/api/sse/agents?meetingId=${meetingId}`);
    es.onmessage = (e) => setMessages(m => [...m, JSON.parse(e.data)]);
    return () => es.close();
  }, [meetingId]);
  return (
    <div className="space-y-2">
      {messages.map(m => (
        <div key={m.id} className="border-l-4 border-blue-500 pl-3 py-2 bg-slate-50">
          <div className="font-mono text-xs text-slate-500">{m.agent}</div>
          <pre className="text-sm overflow-x-auto">{JSON.stringify(m.content, null, 2)}</pre>
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 3: Wire into meeting detail page + dashboard**

- [ ] **Step 4: Commit**

```bash
git commit -m "feat(dashboard): live SSE agent feed + executed actions panel"
```

**Exit criteria:** Open `/meetings/{id}` while a meeting processes — agent messages stream in live as each agent fires. Executed actions also visible with status badges.

---

### Milestone 2.9 — Day 2 wrap + deploy (30 min)

- [ ] **Step 1: Deploy to Vultr (`./scripts/deploy.sh`)**
- [ ] **Step 2: Run a real Zoom call against production — confirm everything works on `echo.resyl.app`**
- [ ] **Step 3: Tag + push**

```bash
git tag v0.5-day2
git push --tags
```

**Day 2 exit criteria:** Production at `https://echo.resyl.app` runs the full pipeline against real meetings, real integrations, with live dashboard feedback.

---

## Chunk 3: Day 3 — May 19 (Audit Drill-Down + Search + Demo + Submit)

**Total budget: 10 hours to 18:00 IST cutoff** (2hr submission buffer before 20:00 deadline).

### Milestone 3.1 — Embeddings + pgvector search (90 min)

**Files:**
- Modify: `apps/echo/src/agents/orchestrator.ts` (add embedding step)
- Create: `apps/echo/src/app/api/search/route.ts`
- Create: `apps/echo/src/components/meeting-search.tsx`
- Create: `apps/echo/src/app/(dashboard)/search/page.tsx`

- [ ] **Step 1: Add embedding step in orchestrator**

After Speechmatics inserts transcripts, batch-embed each segment via Gemini text embeddings (free tier covers it):

```typescript
const embeddings = await Promise.all(segments.map(s =>
  fetch("https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=" + env.GEMINI_API_KEY, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content: { parts: [{ text: s.text }] } }),
  }).then(r => r.json()).then(d => d.embedding.values)
));
// Then update transcripts rows by id with the embedding vectors
```

- [ ] **Step 2: Search API endpoint with cosine similarity**

```typescript
// src/app/api/search/route.ts
import { db } from "@/db/client";
import { sql } from "drizzle-orm";
import { transcripts } from "@/db/schema";

export async function POST(req: Request) {
  const { q } = await req.json();
  // Embed the query
  const emb = await embedQuery(q);  // helper
  const results = await db.execute(sql`
    SELECT t.*, m.title, m.id as meeting_id, 1 - (t.embedding <=> ${JSON.stringify(emb)}::vector) as score
    FROM transcripts t JOIN meetings m ON m.id = t.meeting_id
    ORDER BY t.embedding <=> ${JSON.stringify(emb)}::vector
    LIMIT 10
  `);
  return Response.json({ results });
}
```

- [ ] **Step 3: Search UI**

A search input on `/search` with a list of result cards: speaker, snippet text, meeting link, audio play button.

- [ ] **Step 4: Commit**

```bash
git commit -m "feat(search): gemini embeddings + pgvector search across all transcripts"
```

---

### Milestone 3.2 — Audit drill-down (the originality kicker) (90 min)

**Files:**
- Create: `apps/echo/src/components/audit-drilldown.tsx`
- Create: `apps/echo/src/components/transcript-viewer.tsx`
- Modify: `apps/echo/src/components/action-card.tsx`
- Modify: `apps/echo/src/app/(dashboard)/meetings/[id]/page.tsx`

- [ ] **Step 1: Each action card has a "Why?" button**

When clicked, opens a modal showing:
1. The originating transcript snippet (highlighted speaker + timestamp)
2. The Action Extractor entry that proposed it (verbatim JSON)
3. The Decision Maker reasoning that chose it
4. An inline audio player loaded from Vultr Object Storage (signed URL) seeking to the snippet's start time

- [ ] **Step 2: Audio playback uses HTML `<audio>` with `currentTime` set on play**

```typescript
const audioUrl = await fetch(`/api/audio/${meetingId}`).then(r => r.text());  // signed URL
<audio ref={ref} src={audioUrl} onLoadedMetadata={() => { ref.current!.currentTime = startSec; }} controls />
```

- [ ] **Step 3: Build the helper endpoint that signs Vultr URLs**

- [ ] **Step 4: Commit**

```bash
git commit -m "feat(audit): drill-down modal with transcript snippet, agent debate, and audio playback"
```

**Exit criteria:** Click any executed action → modal opens → see exact 30s of meeting that triggered it → can play audio at that timestamp. The "wow" moment of the demo.

---

### Milestone 3.3 — Polish + demo prep (90 min)

- [ ] **Step 1: Landing page (`/`)** with hero text, "how it works" diagram, and a "Sign in to try" CTA. ~30 min.
- [ ] **Step 2: Better Auth — Google sign-in only**. ~20 min.
- [ ] **Step 3: Add styling polish** — shadcn dark mode, agent status pills, action count badges. ~30 min.
- [ ] **Step 4: One full end-to-end run on production** with a scripted mock meeting. ~10 min.

- [ ] **Step 5: Commit**

```bash
git commit -m "feat(polish): landing page + better-auth google login + ui polish"
```

---

### Milestone 3.4 — Demo video record (90 min, including retakes)

**Files:**
- Create: `docs/demo-script.md`

- [ ] **Step 1: Write the 3-minute script**

```
0:00–0:15  Cold open: "I'm in 6 meetings today. After each one, I lose 30 minutes to follow-ups. Not anymore."
0:15–0:45  Intro to ECHO: 5 specialist agents, joins meetings automatically via Recall.ai, executes across HubSpot/Linear/Gmail/Slack.
0:45–2:15  ACT 1: Watch ECHO process a real meeting.
           Show: Zoom call ending → dashboard streams agents firing in real time → HubSpot deal updates, Linear tickets, Slack post, Gmail drafts appear in the right panel.
2:15–2:45  ACT 2: The audit reveal.
           Click any executed action → drill-down opens → "Here's the exact moment in the meeting that caused this Linear ticket to exist."
           Search bar: "What did Sarah say about pricing?" → instant answer with audio playback.
2:45–3:00  Closing: Vultr (system of record), Gemini (decision brain), Featherless (domain agents), Speechmatics (diarization). Open source. Deployed at echo.resyl.app.
```

- [ ] **Step 2: Record with Loom/QuickTime + iPhone for picture-in-picture talking head**
- [ ] **Step 3: Record a BACKUP DEMO VIDEO** that is the same script but using a pre-recorded meeting file (no live network risk)
- [ ] **Step 4: Upload to YouTube as unlisted, get the link**
- [ ] **Step 5: Commit script**

```bash
git commit -m "docs: 3-min demo video script"
```

---

### Milestone 3.5 — Final polish + submission (60 min, finish by 18:00 IST)

- [ ] **Step 1: README final polish** — ensure setup instructions work cold (`git clone`, fill `.env`, run, see it work)
- [ ] **Step 2: Architecture diagram in README** (use the ASCII from `09-integrations.md`)
- [ ] **Step 3: Submission package**

For each sponsor track on lablab.ai submission form:
- **Project title:** ECHO
- **Short description:** Autonomous meeting workflow agent. By the time you leave the meeting, the work is done.
- **Long description:** [pull from README]
- **Tech tags:** AI Agents, Multi-Agent Systems, Vultr, Gemini, Featherless, Speechmatics, Recall.ai, Next.js, TypeScript, Postgres, pgvector
- **Cover image:** create a 1280x720 in Figma or use Canva (~15 min)
- **Demo video:** YouTube unlisted link
- **Slide presentation:** 5-7 slide deck — problem, solution, demo, architecture, sponsor stack, team, ask. Use slides.com or Google Slides template. (~30 min)
- **GitHub repo:** https://github.com/thisisaman408/echo
- **Demo URL:** https://echo.resyl.app

- [ ] **Step 4: Submit by 18:00 IST** with 2 hours buffer before the 20:00 deadline
- [ ] **Step 5: Tag final**

```bash
git tag v1.0-submission
git push --tags
```

- [ ] **Step 6: Post submission**: tweet from @thisisaman408 tagging @lablabai @vultr @googleaistudios @speechmatics @featherless_ai

**Day 3 exit criteria:** All three submission forms (Vultr, Gemini, Featherless) submitted before 18:00 IST with a working demo URL, video, and public repo.

---

## Risk register (read before starting Day 1)

| Risk | Likelihood | Mitigation |
|---|---|---|
| Recall.ai integration takes >4hr | Med | Time-box at 4hr. If fails, fall back to manual MP4 upload (UI: drag-drop, backend identical post-upload). |
| Speechmatics rejects audio format from Recall | Low | Recall returns MP4 with audio track. If issue, use `ffmpeg` to extract WAV before sending. |
| Featherless model produces bad JSON | Med | `response_format: json_object` + Zod validation + retry with temperature=0.0 on parse failure. Fall back to Gemini Flash if persistent. |
| Vultr VM runs out of memory under load | Low | Single user demo; not a real concern. Add swap if seen. |
| Live demo on stage fails | Med | Pre-recorded backup video is mandatory. Always have a Plan B URL ready. |
| HubSpot scope wrong on private app | Med | Gather all credentials in advance (Milestone 1.3 priority) — discover scope issues before integration code is written. |
| Out of time on Day 3 | High | Cuts: drop pgvector search (Milestone 3.1) first — it's nice-to-have for "second act," but the audit drill-down is the originality kicker. |

## Scope cut order (if running out of time)

If 80% through Day 3 and you're still finishing 3.2 (audit drill-down):
1. Cut Better Auth — anonymous demo is fine (Milestone 3.3 step 2)
2. Cut landing page polish — basic h1 + "see demo" link suffices
3. Cut search UI — keep the search API but skip the front-end
4. Cut Gmail (it's the trickiest OAuth) — Slack + HubSpot + Linear is enough story
5. ⛔ **Do NOT cut audit drill-down** — it's the originality moat

## Daily checkpoint protocol

At end of each day:
1. `git tag` with version
2. `git push --tags`
3. Deploy to production via `./scripts/deploy.sh`
4. Run one real Zoom call against production to verify end-to-end
5. Write 3 sentences in `docs/day-N-retro.md` — what shipped, what's left, biggest worry
6. Sleep

---

## Plan complete and saved.

**Total milestones:** 22 across 3 days.
**Total commits expected:** ~25–30 (one per milestone + intermediate).
**Hard deadlines:**
- May 17 23:59 IST → Day 1 exit criteria met
- May 18 23:59 IST → Day 2 exit criteria met
- May 19 18:00 IST → All submissions in

Ready to execute.
