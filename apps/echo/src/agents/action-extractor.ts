import { asc, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db/client";
import { agentMessages, transcripts } from "@/db/schema";
import { env } from "@/lib/env";
import { completeJson } from "@/integrations/featherless";
import {
  ACTION_EXTRACTOR_SYSTEM,
  formatTranscriptForExtractor,
} from "./prompts/action-extractor";

export const actionItemSchema = z.object({
  type: z.enum([
    "action_item",
    "commitment",
    "decision",
    "blocker",
    "follow_up",
  ]),
  description: z.string().min(1),
  owner_hint: z.string(),
  due_hint: z.string().nullable(),
  source_speaker: z.string(),
  source_start_sec: z.number().int().nonnegative(),
  source_end_sec: z.number().int().nonnegative(),
  verbatim_quote: z.string().min(1),
});

export const actionExtractorOutputSchema = z.object({
  actions: z.array(actionItemSchema),
});

export type ActionItem = z.infer<typeof actionItemSchema>;
export type ActionExtractorOutput = z.infer<typeof actionExtractorOutputSchema>;

/**
 * Runs the Action Extractor agent over a meeting's transcript and persists
 * its output as an `agent_messages` row. Returns the parsed actions and the
 * id of the inserted agent_messages row so downstream agents can reference it.
 */
export async function runActionExtractor(meetingId: string): Promise<{
  actions: ActionItem[];
  agentMessageId: string;
  durationMs: number;
}> {
  const t0 = Date.now();
  const segments = await db
    .select()
    .from(transcripts)
    .where(eq(transcripts.meetingId, meetingId))
    .orderBy(asc(transcripts.startSec));

  if (segments.length === 0) {
    const [row] = await db
      .insert(agentMessages)
      .values({
        meetingId,
        agent: "action_extractor",
        urgency: "low",
        content: { actions: [], note: "no_transcript_segments" },
      })
      .returning();
    return { actions: [], agentMessageId: row.id, durationMs: Date.now() - t0 };
  }

  const userPrompt = `Transcript (diarized):\n${formatTranscriptForExtractor(segments)}`;

  const { data, usage } = await completeJson(
    {
      model: env.FEATHERLESS_MODEL_EXTRACTOR,
      system: ACTION_EXTRACTOR_SYSTEM,
      user: userPrompt,
    },
    actionExtractorOutputSchema,
  );

  // Cap to safety limit. Prevents pathological model output from causing
  // hundreds of dud integrations downstream.
  const capped = data.actions.slice(0, env.ECHO_MAX_ACTIONS_PER_MEETING);

  const durationMs = Date.now() - t0;
  const [row] = await db
    .insert(agentMessages)
    .values({
      meetingId,
      agent: "action_extractor",
      urgency: capped.length > 0 ? "med" : "low",
      content: { actions: capped },
      durationMs,
      tokenUsage: usage ? { ...usage } : null,
    })
    .returning();

  return { actions: capped, agentMessageId: row.id, durationMs };
}
