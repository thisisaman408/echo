import { eq } from "drizzle-orm";
import { Webhook, WebhookVerificationError } from "svix";
import { z } from "zod";
import { db } from "@/db/client";
import { meetings } from "@/db/schema";
import { env } from "@/lib/env";
import { inngest } from "@/lib/inngest";

export const runtime = "nodejs";

/**
 * Recall.ai webhook. Delivered via Svix — signature verification uses the
 * `svix` library because Recall signs `${svix-id}.${svix-timestamp}.${body}`
 * with base64 (not hex of body) and ships multiple versioned sig tokens.
 *
 * Two events we care about:
 *  - bot.status_change → update meeting row
 *  - recording.done    → emit Inngest event that kicks off the agent pipeline
 */

const statusChangeSchema = z.object({
  event: z.literal("bot.status_change"),
  data: z.object({
    bot_id: z.string(),
    status: z.object({
      code: z.string(),
    }),
  }),
});

const recordingDoneSchema = z.object({
  event: z.literal("recording.done"),
  data: z.object({
    bot_id: z.string(),
    recording: z
      .object({
        id: z.string().optional(),
        url: z.string().url().optional(),
      })
      .optional(),
  }),
});

const envelopeSchema = z.object({
  event: z.string(),
});

function statusCodeToMeetingStatus(
  code: string,
): "scheduled" | "recording" | "processing" | "complete" | "failed" {
  if (code === "done" || code === "call_ended") return "processing";
  if (code === "in_call_recording" || code === "recording") return "recording";
  if (code === "fatal" || code === "error") return "failed";
  return "scheduled";
}

export async function POST(req: Request) {
  const rawBody = await req.text();

  const svixHeaders = {
    "svix-id": req.headers.get("svix-id") ?? "",
    "svix-timestamp": req.headers.get("svix-timestamp") ?? "",
    "svix-signature": req.headers.get("svix-signature") ?? "",
  };

  if (
    !svixHeaders["svix-id"] ||
    !svixHeaders["svix-timestamp"] ||
    !svixHeaders["svix-signature"]
  ) {
    return new Response("Missing Svix headers", { status: 401 });
  }

  let payload: unknown;
  try {
    const wh = new Webhook(env.RECALL_WEBHOOK_SECRET);
    payload = wh.verify(rawBody, svixHeaders);
  } catch (e) {
    if (e instanceof WebhookVerificationError) {
      return new Response("Invalid signature", { status: 401 });
    }
    return new Response("Bad payload", { status: 400 });
  }

  const envelope = envelopeSchema.safeParse(payload);
  if (!envelope.success) {
    return new Response("Bad payload", { status: 400 });
  }

  if (envelope.data.event === "bot.status_change") {
    const statusEvent = statusChangeSchema.safeParse(payload);
    if (statusEvent.success) {
      const mappedStatus = statusCodeToMeetingStatus(
        statusEvent.data.data.status.code,
      );
      await db
        .update(meetings)
        .set({ status: mappedStatus })
        .where(eq(meetings.recallBotId, statusEvent.data.data.bot_id));
    }
  }

  if (envelope.data.event === "recording.done") {
    const recEvent = recordingDoneSchema.safeParse(payload);
    if (recEvent.success) {
      await inngest.send({
        name: "echo/meeting.recording_done",
        data: {
          recallBotId: recEvent.data.data.bot_id,
          recordingUrl: recEvent.data.data.recording?.url,
        },
      });
    }
  }

  return new Response("ok", { status: 200 });
}
