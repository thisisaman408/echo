import crypto from "node:crypto";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db/client";
import { meetings } from "@/db/schema";
import { env } from "@/lib/env";
import { inngest } from "@/lib/inngest";

export const runtime = "nodejs";

/**
 * Recall.ai webhook. Two events we care about:
 *  - bot.status_change → update meeting row
 *  - recording.done    → emit Inngest event that kicks off the agent pipeline
 *
 * Signature verification uses HMAC-SHA256 of the raw body with the secret
 * we registered when creating the webhook in the Recall dashboard. Constant-
 * time compare so timing differences don't leak the secret.
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

function timingSafeEqual(a: string, b: string): boolean {
  const aBuf = Buffer.from(a);
  const bBuf = Buffer.from(b);
  if (aBuf.length !== bBuf.length) return false;
  return crypto.timingSafeEqual(aBuf, bBuf);
}

export async function POST(req: Request) {
  const rawBody = await req.text();

  const signature =
    req.headers.get("x-recall-signature") ??
    req.headers.get("svix-signature") ??
    "";
  const expected = crypto
    .createHmac("sha256", env.RECALL_WEBHOOK_SECRET)
    .update(rawBody)
    .digest("hex");

  if (!signature || !timingSafeEqual(signature, expected)) {
    return new Response("Invalid signature", { status: 401 });
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(rawBody);
  } catch {
    return new Response("Bad JSON", { status: 400 });
  }

  const envelope = envelopeSchema.safeParse(parsed);
  if (!envelope.success) {
    return new Response("Bad payload", { status: 400 });
  }

  if (envelope.data.event === "bot.status_change") {
    const statusEvent = statusChangeSchema.safeParse(parsed);
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
    const recEvent = recordingDoneSchema.safeParse(parsed);
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
