-- ECHO init migration. pgvector extension is also installed by
-- scripts/setup-postgres.sh but we ensure it here so local Docker /
-- ephemeral test DBs work without the script.
CREATE EXTENSION IF NOT EXISTS vector;--> statement-breakpoint
CREATE TYPE "public"."action_status" AS ENUM('pending', 'success', 'failed', 'skipped');--> statement-breakpoint
CREATE TYPE "public"."agent" AS ENUM('action_extractor', 'stakeholder_classifier', 'decision_maker', 'comms_drafter', 'executor');--> statement-breakpoint
CREATE TYPE "public"."integration" AS ENUM('hubspot', 'linear', 'slack', 'gmail');--> statement-breakpoint
CREATE TYPE "public"."meeting_status" AS ENUM('scheduled', 'recording', 'processing', 'complete', 'failed');--> statement-breakpoint
CREATE TYPE "public"."urgency" AS ENUM('low', 'med', 'high');--> statement-breakpoint
CREATE TABLE "agent_messages" (
	"id" text PRIMARY KEY NOT NULL,
	"meeting_id" text NOT NULL,
	"agent" "agent" NOT NULL,
	"parent_id" text,
	"urgency" "urgency" DEFAULT 'med' NOT NULL,
	"content" jsonb NOT NULL,
	"duration_ms" integer,
	"token_usage" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "executed_actions" (
	"id" text PRIMARY KEY NOT NULL,
	"meeting_id" text NOT NULL,
	"agent_message_id" text,
	"source_transcript_id" text,
	"integration" "integration" NOT NULL,
	"action_type" text NOT NULL,
	"external_id" text,
	"external_url" text,
	"payload" jsonb NOT NULL,
	"result" jsonb,
	"status" "action_status" DEFAULT 'pending' NOT NULL,
	"error_message" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "meetings" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"meeting_url" text NOT NULL,
	"recall_bot_id" text,
	"title" text,
	"started_at" timestamp with time zone,
	"ended_at" timestamp with time zone,
	"duration_sec" integer,
	"status" "meeting_status" DEFAULT 'scheduled' NOT NULL,
	"audio_storage_key" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "meetings_recall_bot_id_unique" UNIQUE("recall_bot_id")
);
--> statement-breakpoint
CREATE TABLE "oauth_tokens" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"provider" text NOT NULL,
	"access_token" text NOT NULL,
	"refresh_token" text,
	"expires_at" timestamp with time zone,
	"scopes" text[],
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "transcripts" (
	"id" text PRIMARY KEY NOT NULL,
	"meeting_id" text NOT NULL,
	"speaker" text NOT NULL,
	"speaker_name" text,
	"start_sec" integer NOT NULL,
	"end_sec" integer NOT NULL,
	"text" text NOT NULL,
	"embedding" vector(768),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"name" text,
	"image" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "agent_messages" ADD CONSTRAINT "agent_messages_meeting_id_meetings_id_fk" FOREIGN KEY ("meeting_id") REFERENCES "public"."meetings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "executed_actions" ADD CONSTRAINT "executed_actions_meeting_id_meetings_id_fk" FOREIGN KEY ("meeting_id") REFERENCES "public"."meetings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "executed_actions" ADD CONSTRAINT "executed_actions_agent_message_id_agent_messages_id_fk" FOREIGN KEY ("agent_message_id") REFERENCES "public"."agent_messages"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "executed_actions" ADD CONSTRAINT "executed_actions_source_transcript_id_transcripts_id_fk" FOREIGN KEY ("source_transcript_id") REFERENCES "public"."transcripts"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "meetings" ADD CONSTRAINT "meetings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "oauth_tokens" ADD CONSTRAINT "oauth_tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transcripts" ADD CONSTRAINT "transcripts_meeting_id_meetings_id_fk" FOREIGN KEY ("meeting_id") REFERENCES "public"."meetings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "agent_messages_meeting_idx" ON "agent_messages" USING btree ("meeting_id");--> statement-breakpoint
CREATE INDEX "agent_messages_meeting_agent_idx" ON "agent_messages" USING btree ("meeting_id","agent");--> statement-breakpoint
CREATE INDEX "executed_actions_meeting_idx" ON "executed_actions" USING btree ("meeting_id");--> statement-breakpoint
CREATE INDEX "executed_actions_integration_idx" ON "executed_actions" USING btree ("integration");--> statement-breakpoint
CREATE INDEX "meetings_user_idx" ON "meetings" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "meetings_status_idx" ON "meetings" USING btree ("status");--> statement-breakpoint
CREATE INDEX "oauth_tokens_user_provider_idx" ON "oauth_tokens" USING btree ("user_id","provider");--> statement-breakpoint
CREATE INDEX "transcripts_meeting_idx" ON "transcripts" USING btree ("meeting_id");--> statement-breakpoint
CREATE INDEX "transcripts_meeting_time_idx" ON "transcripts" USING btree ("meeting_id","start_sec");--> statement-breakpoint
CREATE INDEX "transcripts_embedding_idx" ON "transcripts" USING hnsw ("embedding" vector_cosine_ops);