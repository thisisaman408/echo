import { and, asc, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { agentMessages, executedActions, transcripts } from "@/db/schema";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Returns the full audit trail for one executed action:
 *  - the originating transcript segment (the audio moment that triggered it)
 *  - the chain of agent_messages for the parent meeting (debate log)
 *  - the executed action payload itself
 *
 * The dashboard renders this in the drill-down modal: snippet at top, agent
 * debate timeline below, executed payload + status pill at bottom.
 */
export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  const [action] = await db
    .select()
    .from(executedActions)
    .where(eq(executedActions.id, id))
    .limit(1);
  if (!action) return new Response("not_found", { status: 404 });

  const [sourceSegment, agents] = await Promise.all([
    action.sourceTranscriptId
      ? db
          .select()
          .from(transcripts)
          .where(eq(transcripts.id, action.sourceTranscriptId))
          .limit(1)
          .then((rows) => rows[0] ?? null)
      : Promise.resolve(null),
    db
      .select()
      .from(agentMessages)
      .where(eq(agentMessages.meetingId, action.meetingId))
      .orderBy(asc(agentMessages.createdAt)),
  ]);

  // Surface ±10s of context around the source segment.
  const contextRange = sourceSegment
    ? await db
        .select()
        .from(transcripts)
        .where(
          and(
            eq(transcripts.meetingId, action.meetingId),
          ),
        )
        .orderBy(asc(transcripts.startSec))
        .then((rows) =>
          rows.filter(
            (r) =>
              r.startSec >= Math.max(0, sourceSegment.startSec - 10) &&
              r.endSec <= sourceSegment.endSec + 10,
          ),
        )
    : [];

  return Response.json({
    action,
    sourceSegment,
    contextRange,
    agents: agents.map((a) => ({
      ...a,
      createdAt: a.createdAt.toISOString(),
    })),
  });
}
