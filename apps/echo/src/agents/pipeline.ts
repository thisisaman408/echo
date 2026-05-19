import { eq, isNull, and, sql } from "drizzle-orm";
import { db } from "@/db/client";
import { meetings, transcripts } from "@/db/schema";
import { getRecordingDownloadUrl } from "@/integrations/recall";
import { transcribeFromUrl } from "@/integrations/speechmatics";
import { putAudio } from "@/integrations/vultr-storage";
import { embedTexts } from "@/integrations/gemini";
import { runActionExtractor } from "./action-extractor";
import { runStakeholderClassifier } from "./stakeholder-classifier";
import { runDecisionMaker } from "./decision-maker";
import { runCommsDrafter } from "./comms-drafter";
import { runExecutor } from "./executor";

/**
 * Direct pipeline runner — no Inngest required.
 * Called fire-and-forget from the Recall webhook on recording.done.
 */
export async function runPipeline(recallBotId: string): Promise<void> {
  console.log(`[pipeline] starting for bot ${recallBotId}`);

  const [meeting] = await db
    .select()
    .from(meetings)
    .where(eq(meetings.recallBotId, recallBotId));
  if (!meeting) throw new Error(`No meeting for botId ${recallBotId}`);

  const recordingUrl = await getRecordingDownloadUrl(recallBotId);
  if (!recordingUrl) throw new Error(`No recording URL for bot ${recallBotId}`);

  // Archive audio to Vultr Object Storage (non-fatal — pipeline continues even if bucket missing)
  let audioKey: string | null = null;
  try {
    const res = await fetch(recordingUrl);
    if (!res.ok) throw new Error(`Audio fetch failed: ${res.status}`);
    const buf = Buffer.from(await res.arrayBuffer());
    audioKey = await putAudio(`meetings/${meeting.id}.mp4`, buf);
    console.log(`[pipeline] audio archived: ${audioKey}`);
  } catch (err) {
    console.warn(`[pipeline] audio archive skipped:`, (err as Error).message);
  }

  await db
    .update(meetings)
    .set({ ...(audioKey ? { audioStorageKey: audioKey } : {}), status: "processing" })
    .where(eq(meetings.id, meeting.id));

  console.log(`[pipeline] transcribing meeting ${meeting.id}`);
  const segments = await transcribeFromUrl(recordingUrl);

  if (segments.length > 0) {
    await db.insert(transcripts).values(
      segments.map((s: { speaker: string; startSec: number; endSec: number; text: string }) => ({
        meetingId: meeting.id,
        speaker: s.speaker,
        startSec: Math.floor(s.startSec),
        endSec: Math.floor(s.endSec),
        text: s.text,
      })),
    );

    // Embed for pgvector search (non-fatal — search just won't work if this fails)
    try {
      const pending = await db
        .select()
        .from(transcripts)
        .where(and(eq(transcripts.meetingId, meeting.id), isNull(transcripts.embedding)));
      if (pending.length > 0) {
        const vectors = await embedTexts(pending.map((p) => p.text));
        for (let i = 0; i < pending.length; i++) {
          await db.execute(sql`
            UPDATE transcripts
            SET embedding = ${`[${vectors[i].join(",")}]`}::vector
            WHERE id = ${pending[i].id}
          `);
        }
      }
    } catch (err) {
      console.warn(`[pipeline] embedding skipped:`, (err as Error).message);
    }
  }

  console.log(`[pipeline] running agents for meeting ${meeting.id}`);
  const extractor = await runActionExtractor(meeting.id);
  await runStakeholderClassifier(meeting.id);
  const decision = await runDecisionMaker(meeting.id);
  const comms = await runCommsDrafter(meeting.id, decision.output, decision.agentMessageId);
  await runExecutor(meeting.id, comms.workflow, comms.agentMessageId);

  await db
    .update(meetings)
    .set({ status: "complete" })
    .where(eq(meetings.id, meeting.id));

  console.log(`[pipeline] done for meeting ${meeting.id} — ${extractor.actions.length} actions`);
}
