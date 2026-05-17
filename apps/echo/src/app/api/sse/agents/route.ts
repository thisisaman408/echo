import { and, eq, gt } from "drizzle-orm";
import { db } from "@/db/client";
import { agentMessages } from "@/db/schema";
import { pollingStream, sseHeaders } from "@/lib/sse";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const meetingId = url.searchParams.get("meetingId");
  if (!meetingId) {
    return new Response("meetingId required", { status: 400 });
  }

  const stream = pollingStream({
    abortSignal: req.signal,
    fetchNew: async (since) => {
      return db
        .select()
        .from(agentMessages)
        .where(
          and(
            eq(agentMessages.meetingId, meetingId),
            gt(agentMessages.createdAt, since),
          ),
        );
    },
  });

  return new Response(stream, { headers: sseHeaders() });
}
