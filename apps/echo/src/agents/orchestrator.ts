import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db/client";
import { meetings, transcripts } from "@/db/schema";
import { inngest } from "@/lib/inngest";
import { getRecordingDownloadUrl } from "@/integrations/recall";
import { transcribeFromUrl } from "@/integrations/speechmatics";
import { putAudio } from "@/integrations/vultr-storage";

const recordingDoneEventDataSchema = z.object({
  recallBotId: z.string(),
  recordingUrl: z.string().url().optional(),
});

/**
 * Inngest function: fires when Recall's webhook reports recording.done.
 *  - Resolves the playable audio URL from Recall.
 *  - Archives the audio to Vultr Object Storage so the audit drill-down has
 *    a stable backing file.
 *  - Sends the audio to Speechmatics for diarized transcription.
 *  - Inserts segments into the transcripts table.
 *  - Emits echo/agents.start to fan out to the 5-agent pipeline.
 *
 * Each phase is its own Inngest step so a transient failure (e.g. Speechmatics
 * timeout) doesn't replay the whole job — only that step retries.
 */
export const processRecording = inngest.createFunction(
  {
    id: "process-recording",
    retries: 3,
    triggers: [{ event: "echo/meeting.recording_done" }],
  },
  async ({ event, step }) => {
    const { recallBotId } = recordingDoneEventDataSchema.parse(event.data);

    const meeting = await step.run("load-meeting", async () => {
      const [row] = await db
        .select()
        .from(meetings)
        .where(eq(meetings.recallBotId, recallBotId));
      if (!row) throw new Error(`No meeting for botId ${recallBotId}`);
      return row;
    });

    const recordingUrl = await step.run("get-recording-url", async () => {
      const url = await getRecordingDownloadUrl(recallBotId);
      if (!url) throw new Error(`No recording URL for bot ${recallBotId}`);
      return url;
    });

    const audioKey = await step.run("archive-audio", async () => {
      const res = await fetch(recordingUrl);
      if (!res.ok) throw new Error(`Audio fetch failed: ${res.status}`);
      const buf = Buffer.from(await res.arrayBuffer());
      return putAudio(`meetings/${meeting.id}.mp4`, buf);
    });

    await step.run("mark-processing", async () => {
      await db
        .update(meetings)
        .set({ audioStorageKey: audioKey, status: "processing" })
        .where(eq(meetings.id, meeting.id));
    });

    const segments = await step.run("speechmatics-transcribe", async () => {
      return transcribeFromUrl(recordingUrl);
    });

    await step.run("insert-transcripts", async () => {
      if (segments.length === 0) return;
      await db.insert(transcripts).values(
        segments.map((s: { speaker: string; startSec: number; endSec: number; text: string }) => ({
          meetingId: meeting.id,
          speaker: s.speaker,
          startSec: Math.floor(s.startSec),
          endSec: Math.floor(s.endSec),
          text: s.text,
        })),
      );
    });

    await step.sendEvent("trigger-agents", {
      name: "echo/agents.start",
      data: { meetingId: meeting.id },
    });

    return { meetingId: meeting.id, segments: segments.length };
  },
);
