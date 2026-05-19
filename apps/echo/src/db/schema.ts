import {
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  vector,
} from "drizzle-orm/pg-core";
import { newId } from "@/lib/ulid";

/**
 * ULID primary key. Lexically sortable, no DB-side defaults.
 */
const id = () =>
  text("id").primaryKey().$defaultFn(newId).notNull();

const createdAt = () =>
  timestamp("created_at", { withTimezone: true }).defaultNow().notNull();

export const agentEnum = pgEnum("agent", [
  "action_extractor",
  "stakeholder_classifier",
  "decision_maker",
  "comms_drafter",
  "executor",
]);

export const urgencyEnum = pgEnum("urgency", ["low", "med", "high"]);

export const meetingStatusEnum = pgEnum("meeting_status", [
  "scheduled",
  "recording",
  "processing",
  "complete",
  "failed",
]);

export const integrationEnum = pgEnum("integration", [
  "hubspot",
  "linear",
  "slack",
  "gmail",
]);

export const actionStatusEnum = pgEnum("action_status", [
  "pending",
  "success",
  "failed",
  "skipped",
]);

/**
 * Demo-mode users table. Better Auth's tables are created by its own migration
 * (added in M3.3). For DEMO_MODE we seed a single user row at boot.
 */
export const users = pgTable("users", {
  id: id(),
  email: text("email").notNull().unique(),
  name: text("name"),
  image: text("image"),
  createdAt: createdAt(),
});

export const meetings = pgTable(
  "meetings",
  {
    id: id(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    meetingUrl: text("meeting_url").notNull(),
    recallBotId: text("recall_bot_id").unique(),
    title: text("title"),
    startedAt: timestamp("started_at", { withTimezone: true }),
    endedAt: timestamp("ended_at", { withTimezone: true }),
    durationSec: integer("duration_sec"),
    status: meetingStatusEnum("status").notNull().default("scheduled"),
    audioStorageKey: text("audio_storage_key"),
    createdAt: createdAt(),
  },
  (t) => [
    index("meetings_user_idx").on(t.userId),
    index("meetings_status_idx").on(t.status),
  ],
);

/**
 * Diarized transcript segments. `speaker` is the Speechmatics speaker label
 * (e.g. "S1"); `speakerName` is the human name assigned by the Stakeholder
 * Classifier agent. Embedding is text-embedding-004 (768 dims).
 */
export const transcripts = pgTable(
  "transcripts",
  {
    id: id(),
    meetingId: text("meeting_id")
      .notNull()
      .references(() => meetings.id, { onDelete: "cascade" }),
    speaker: text("speaker").notNull(),
    speakerName: text("speaker_name"),
    startSec: integer("start_sec").notNull(),
    endSec: integer("end_sec").notNull(),
    text: text("text").notNull(),
    embedding: vector("embedding", { dimensions: 3072 }),
    createdAt: createdAt(),
  },
  (t) => [
    index("transcripts_meeting_idx").on(t.meetingId),
    index("transcripts_meeting_time_idx").on(t.meetingId, t.startSec),
    index("transcripts_embedding_idx")
      .using("hnsw", t.embedding.op("vector_cosine_ops")),
  ],
);

/**
 * One row per agent output. The 5-agent debate log. `parentId` lets future
 * agents reference what they read; for v1 it's nullable and unused.
 */
export const agentMessages = pgTable(
  "agent_messages",
  {
    id: id(),
    meetingId: text("meeting_id")
      .notNull()
      .references(() => meetings.id, { onDelete: "cascade" }),
    agent: agentEnum("agent").notNull(),
    parentId: text("parent_id"),
    urgency: urgencyEnum("urgency").notNull().default("med"),
    content: jsonb("content").notNull(),
    durationMs: integer("duration_ms"),
    tokenUsage: jsonb("token_usage"),
    createdAt: createdAt(),
  },
  (t) => [
    index("agent_messages_meeting_idx").on(t.meetingId),
    index("agent_messages_meeting_agent_idx").on(t.meetingId, t.agent),
  ],
);

/**
 * The audit trail. Every external API call ECHO made — both successes and
 * failures — with a back-pointer to the agent message and originating
 * transcript segment that triggered it.
 */
export const executedActions = pgTable(
  "executed_actions",
  {
    id: id(),
    meetingId: text("meeting_id")
      .notNull()
      .references(() => meetings.id, { onDelete: "cascade" }),
    agentMessageId: text("agent_message_id").references(() => agentMessages.id, {
      onDelete: "set null",
    }),
    sourceTranscriptId: text("source_transcript_id").references(
      () => transcripts.id,
      { onDelete: "set null" },
    ),
    integration: integrationEnum("integration").notNull(),
    actionType: text("action_type").notNull(),
    externalId: text("external_id"),
    externalUrl: text("external_url"),
    payload: jsonb("payload").notNull(),
    result: jsonb("result"),
    status: actionStatusEnum("status").notNull().default("pending"),
    errorMessage: text("error_message"),
    createdAt: createdAt(),
  },
  (t) => [
    index("executed_actions_meeting_idx").on(t.meetingId),
    index("executed_actions_integration_idx").on(t.integration),
  ],
);

/**
 * Per-user OAuth tokens. Only used when DEMO_MODE=false (multi-tenant mode).
 * For the hackathon this table stays empty.
 */
export const oauthTokens = pgTable(
  "oauth_tokens",
  {
    id: id(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    provider: text("provider").notNull(),
    accessToken: text("access_token").notNull(),
    refreshToken: text("refresh_token"),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
    scopes: text("scopes").array(),
    createdAt: createdAt(),
  },
  (t) => [index("oauth_tokens_user_provider_idx").on(t.userId, t.provider)],
);

export type User = typeof users.$inferSelect;
export type Meeting = typeof meetings.$inferSelect;
export type NewMeeting = typeof meetings.$inferInsert;
export type Transcript = typeof transcripts.$inferSelect;
export type NewTranscript = typeof transcripts.$inferInsert;
export type AgentMessage = typeof agentMessages.$inferSelect;
export type NewAgentMessage = typeof agentMessages.$inferInsert;
export type ExecutedAction = typeof executedActions.$inferSelect;
export type NewExecutedAction = typeof executedActions.$inferInsert;
