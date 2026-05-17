import { z } from "zod";
import { env } from "@/lib/env";

/**
 * Recall.ai client. Uses raw fetch instead of a vendor SDK so we don't pull
 * a heavy dependency for ~3 endpoints. The Recall API is regional — we hit
 * the ap-northeast-1 (Tokyo) edge to match Vultr Tokyo.
 */

const baseUrl = () => `https://${env.RECALL_REGION}.recall.ai/api/v1`;

const authHeaders = () => ({
  Authorization: `Token ${env.RECALL_API_KEY}`,
  "Content-Type": "application/json",
});

export const startBotResponseSchema = z.object({
  id: z.string(),
  status_changes: z.array(z.unknown()).optional(),
  meeting_url: z.unknown().optional(),
});

export type StartBotResponse = z.infer<typeof startBotResponseSchema>;

/**
 * Dispatch a Recall bot to a meeting. Returns the bot id we'll receive in
 * subsequent webhook events.
 */
export async function startBot(meetingUrl: string): Promise<StartBotResponse> {
  const res = await fetch(`${baseUrl()}/bot`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({
      meeting_url: meetingUrl,
      bot_name: "ECHO",
      recording_config: {
        // We use Speechmatics for transcription post-hoc — disable Recall's.
        transcript: null,
        video_mixed_layout: "speaker_view",
      },
      webhook_url: `https://${env.ECHO_PUBLIC_HOSTNAME}/api/recall/webhook`,
    }),
  });
  if (!res.ok) {
    throw new Error(
      `Recall startBot failed: ${res.status} ${await res.text()}`,
    );
  }
  return startBotResponseSchema.parse(await res.json());
}

export const botStatusResponseSchema = z.object({
  id: z.string(),
  status_changes: z
    .array(
      z.object({
        code: z.string(),
        message: z.string().nullable().optional(),
        created_at: z.string(),
      }),
    )
    .optional(),
  video_url: z.string().url().nullable().optional(),
  recording: z
    .object({
      id: z.string().optional(),
      download_url: z.string().url().nullable().optional(),
    })
    .nullable()
    .optional(),
  recordings: z
    .array(
      z.object({
        id: z.string().optional(),
        media_shortcuts: z
          .object({
            video_mixed: z
              .object({
                data: z
                  .object({
                    download_url: z.string().url().nullable().optional(),
                  })
                  .optional(),
              })
              .optional(),
          })
          .optional(),
      }),
    )
    .optional(),
});

export type BotStatusResponse = z.infer<typeof botStatusResponseSchema>;

export async function getBot(botId: string): Promise<BotStatusResponse> {
  const res = await fetch(`${baseUrl()}/bot/${botId}`, {
    headers: authHeaders(),
  });
  if (!res.ok) {
    throw new Error(`Recall getBot failed: ${res.status} ${await res.text()}`);
  }
  return botStatusResponseSchema.parse(await res.json());
}

/**
 * Resolve the playable recording URL for a finished bot. Recall has shipped
 * a few payload shapes over the years; we check the most-recent-first and
 * fall back through legacy fields.
 */
export async function getRecordingDownloadUrl(
  botId: string,
): Promise<string | null> {
  const data = await getBot(botId);
  const fromRecordings = data.recordings?.[0]?.media_shortcuts?.video_mixed
    ?.data?.download_url;
  if (fromRecordings) return fromRecordings;
  if (data.recording?.download_url) return data.recording.download_url;
  if (data.video_url) return data.video_url;
  return null;
}
