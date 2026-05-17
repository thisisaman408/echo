import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { meetings } from "@/db/schema";
import { getSignedAudioUrl } from "@/integrations/vultr-storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Returns a short-lived (1h) signed URL to the meeting's archived audio.
 * Used by the audit drill-down to seek to a transcript moment without
 * exposing storage credentials to the browser.
 */
export async function GET(
  _req: Request,
  ctx: { params: Promise<{ meetingId: string }> },
) {
  const { meetingId } = await ctx.params;
  const [meeting] = await db
    .select()
    .from(meetings)
    .where(eq(meetings.id, meetingId))
    .limit(1);
  if (!meeting) return new Response("not_found", { status: 404 });
  if (!meeting.audioStorageKey) {
    return new Response("no_audio", { status: 404 });
  }
  const url = await getSignedAudioUrl(meeting.audioStorageKey, 3600);
  return Response.json({ url, key: meeting.audioStorageKey });
}
