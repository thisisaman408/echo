import { and, asc, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db/client";
import { agentMessages, transcripts } from "@/db/schema";
import { env } from "@/lib/env";
import { completeJson } from "@/integrations/featherless";
import { formatTranscriptForExtractor } from "./prompts/action-extractor";
import { STAKEHOLDER_CLASSIFIER_SYSTEM } from "./prompts/stakeholder-classifier";
import { actionItemSchema } from "./action-extractor";

export const speakerProfileSchema = z.object({
  label: z.string().min(1),
  role: z.enum([
    "rep",
    "prospect",
    "internal_team",
    "customer",
    "manager",
    "unknown",
  ]),
  internal: z.boolean(),
  name_hint: z.string().nullable(),
  email_hint: z.string().nullable(),
  company_hint: z.string().nullable(),
});

export const actionAssignmentSchema = z.object({
  action_index: z.number().int().nonnegative(),
  owner_speaker: z.string(),
  watcher_speakers: z.array(z.string()),
});

export const stakeholderClassifierOutputSchema = z.object({
  speakers: z.array(speakerProfileSchema),
  action_assignments: z.array(actionAssignmentSchema),
});

export type SpeakerProfile = z.infer<typeof speakerProfileSchema>;
export type StakeholderClassifierOutput = z.infer<
  typeof stakeholderClassifierOutputSchema
>;

const actionExtractorContentSchema = z.object({
  actions: z.array(actionItemSchema).default([]),
});

/**
 * Reads the prior Action Extractor row for this meeting, classifies each
 * speaker, assigns owners/watchers per action. Persists output as agent row.
 */
export async function runStakeholderClassifier(meetingId: string): Promise<{
  output: StakeholderClassifierOutput;
  agentMessageId: string;
  durationMs: number;
}> {
  const t0 = Date.now();

  const [priorActionRow] = await db
    .select()
    .from(agentMessages)
    .where(
      and(
        eq(agentMessages.meetingId, meetingId),
        eq(agentMessages.agent, "action_extractor"),
      ),
    )
    .orderBy(asc(agentMessages.createdAt))
    .limit(1);

  const priorActions = priorActionRow
    ? actionExtractorContentSchema.parse(priorActionRow.content).actions
    : [];

  const segments = await db
    .select()
    .from(transcripts)
    .where(eq(transcripts.meetingId, meetingId))
    .orderBy(asc(transcripts.startSec));

  if (segments.length === 0) {
    const empty: StakeholderClassifierOutput = {
      speakers: [],
      action_assignments: [],
    };
    const [row] = await db
      .insert(agentMessages)
      .values({
        meetingId,
        agent: "stakeholder_classifier",
        urgency: "low",
        content: empty,
        parentId: priorActionRow?.id,
      })
      .returning();
    return {
      output: empty,
      agentMessageId: row.id,
      durationMs: Date.now() - t0,
    };
  }

  const userPrompt = [
    `Transcript (diarized):`,
    formatTranscriptForExtractor(segments),
    ``,
    `Previously extracted actions (0-indexed):`,
    JSON.stringify(priorActions, null, 2),
  ].join("\n");

  const { data, usage } = await completeJson(
    {
      model: env.FEATHERLESS_MODEL_CLASSIFIER,
      system: STAKEHOLDER_CLASSIFIER_SYSTEM,
      user: userPrompt,
    },
    stakeholderClassifierOutputSchema,
  );

  const durationMs = Date.now() - t0;
  const [row] = await db
    .insert(agentMessages)
    .values({
      meetingId,
      agent: "stakeholder_classifier",
      urgency: "med",
      content: data,
      parentId: priorActionRow?.id,
      durationMs,
      tokenUsage: usage ? { ...usage } : null,
    })
    .returning();

  return { output: data, agentMessageId: row.id, durationMs };
}
