import { and, asc, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db/client";
import { agentMessages, transcripts } from "@/db/schema";
import { geminiJson, geminiPro } from "@/integrations/gemini";
import {
  formatTranscriptForExtractor,
} from "./prompts/action-extractor";
import { DECISION_MAKER_SYSTEM } from "./prompts/decision-maker";
import { actionItemSchema } from "./action-extractor";
import { stakeholderClassifierOutputSchema } from "./stakeholder-classifier";

const intIndex = z.number().int();

export const hubspotUpdateSchema = z.object({
  deal_search_hint: z.string(),
  stage_change: z.string().nullable(),
  notes: z.array(z.string()).default([]),
  source_action_index: intIndex,
});

export const linearIssueSchema = z.object({
  title: z.string().min(1),
  description: z.string().default(""),
  assignee_email_hint: z.string().nullable(),
  priority: z.enum(["low", "med", "high"]).default("med"),
  source_action_index: intIndex,
});

export const gmailDraftSchema = z.object({
  to: z.string().email(),
  subject: z.string().min(1),
  body_markdown: z.string().min(1),
  source_action_index: intIndex,
});

export const slackSummarySchema = z.object({
  headline: z.string().min(1),
  bullets: z.array(z.string()),
});

export const workflowSchema = z.object({
  hubspot_updates: z.array(hubspotUpdateSchema).default([]),
  linear_issues: z.array(linearIssueSchema).default([]),
  gmail_drafts: z.array(gmailDraftSchema).default([]),
  slack_summary: slackSummarySchema.nullable().default(null),
});

export const decisionMakerOutputSchema = z.object({
  workflow: workflowSchema,
});

export type Workflow = z.infer<typeof workflowSchema>;
export type DecisionMakerOutput = z.infer<typeof decisionMakerOutputSchema>;

export async function runDecisionMaker(meetingId: string): Promise<{
  output: DecisionMakerOutput;
  agentMessageId: string;
  durationMs: number;
}> {
  const t0 = Date.now();

  const [actionRow] = await db
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

  const [classifierRow] = await db
    .select()
    .from(agentMessages)
    .where(
      and(
        eq(agentMessages.meetingId, meetingId),
        eq(agentMessages.agent, "stakeholder_classifier"),
      ),
    )
    .orderBy(asc(agentMessages.createdAt))
    .limit(1);

  const actions = actionRow
    ? z
        .object({ actions: z.array(actionItemSchema).default([]) })
        .parse(actionRow.content).actions
    : [];

  const classifier = classifierRow
    ? stakeholderClassifierOutputSchema.parse(classifierRow.content)
    : { speakers: [], action_assignments: [] };

  const segments = await db
    .select()
    .from(transcripts)
    .where(eq(transcripts.meetingId, meetingId))
    .orderBy(asc(transcripts.startSec));

  const userPrompt = [
    `Meeting transcript (diarized):`,
    formatTranscriptForExtractor(segments),
    ``,
    `Extracted actions (0-indexed):`,
    JSON.stringify(actions, null, 2),
    ``,
    `Stakeholders + assignments:`,
    JSON.stringify(classifier, null, 2),
  ].join("\n");

  const data = await geminiJson(
    {
      model: geminiPro(),
      system: DECISION_MAKER_SYSTEM,
      user: userPrompt,
    },
    decisionMakerOutputSchema,
  );

  const durationMs = Date.now() - t0;
  const [row] = await db
    .insert(agentMessages)
    .values({
      meetingId,
      agent: "decision_maker",
      urgency:
        data.workflow.linear_issues.some((i) => i.priority === "high")
          ? "high"
          : "med",
      content: data,
      parentId: classifierRow?.id ?? actionRow?.id,
      durationMs,
    })
    .returning();

  return { output: data, agentMessageId: row.id, durationMs };
}
