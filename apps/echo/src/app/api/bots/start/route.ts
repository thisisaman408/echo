import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db/client";
import { meetings, users } from "@/db/schema";
import { startBot } from "@/integrations/recall";

export const runtime = "nodejs";

/**
 * POST /api/bots/start { meetingUrl, userId? }
 *
 * Dispatches a Recall bot to the meeting URL and persists a `meetings` row
 * keyed by Recall's bot id so the incoming webhook can match it later.
 *
 * In DEMO_MODE we accept an optional userId — if omitted, we use the single
 * seeded demo user. In production we'd resolve from the session cookie.
 */

const bodySchema = z.object({
  meetingUrl: z.string().url(),
  userId: z.string().optional(),
  title: z.string().optional(),
});

async function resolveUserId(explicit?: string): Promise<string> {
  if (explicit) return explicit;
  const [first] = await db.select().from(users).limit(1);
  if (first) return first.id;
  // Seed demo user on first call so the dashboard isn't empty.
  const [created] = await db
    .insert(users)
    .values({ email: "demo@echo.local", name: "Demo User" })
    .returning();
  return created.id;
}

export async function POST(req: Request) {
  let body: z.infer<typeof bodySchema>;
  try {
    body = bodySchema.parse(await req.json());
  } catch (err) {
    return Response.json(
      { error: "invalid_body", details: (err as Error).message },
      { status: 400 },
    );
  }

  const userId = await resolveUserId(body.userId);

  try {
    const bot = await startBot(body.meetingUrl);
    const [meeting] = await db
      .insert(meetings)
      .values({
        userId,
        meetingUrl: body.meetingUrl,
        recallBotId: bot.id,
        title: body.title,
        status: "scheduled",
      })
      .returning();

    return Response.json({
      meetingId: meeting.id,
      botId: bot.id,
    });
  } catch (err) {
    return Response.json(
      { error: "recall_dispatch_failed", message: (err as Error).message },
      { status: 502 },
    );
  }
}

export async function GET() {
  // Allow simple readiness probes.
  return Response.json({ ok: true });
}
