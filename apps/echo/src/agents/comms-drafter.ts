import { db } from "@/db/client";
import { agentMessages } from "@/db/schema";
import { geminiFlash, geminiJson } from "@/integrations/gemini";
import { COMMS_DRAFTER_SYSTEM } from "./prompts/comms-drafter";
import {
  decisionMakerOutputSchema,
  type DecisionMakerOutput,
  type Workflow,
} from "./decision-maker";

export type CommsDrafterResult = {
  workflow: Workflow;
  agentMessageId: string;
  durationMs: number;
};

export async function runCommsDrafter(
  meetingId: string,
  decision: DecisionMakerOutput,
  parentAgentMessageId?: string,
): Promise<CommsDrafterResult> {
  const t0 = Date.now();

  const userPrompt = [
    `Decision Maker workflow plan (rewrite ONLY the copy fields):`,
    JSON.stringify(decision, null, 2),
  ].join("\n");

  const polished = await geminiJson(
    {
      model: geminiFlash(),
      system: COMMS_DRAFTER_SYSTEM,
      user: userPrompt,
    },
    decisionMakerOutputSchema,
  );

  const durationMs = Date.now() - t0;
  const [row] = await db
    .insert(agentMessages)
    .values({
      meetingId,
      agent: "comms_drafter",
      urgency: "med",
      content: polished,
      parentId: parentAgentMessageId,
      durationMs,
    })
    .returning();

  return {
    workflow: polished.workflow,
    agentMessageId: row.id,
    durationMs,
  };
}
