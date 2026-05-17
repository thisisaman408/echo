import { sql } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db/client";
import { embedText } from "@/integrations/gemini";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const bodySchema = z.object({
  q: z.string().min(1).max(500),
  limit: z.number().int().positive().max(50).default(10),
});

type SearchHit = {
  transcriptId: string;
  meetingId: string;
  speaker: string;
  speakerName: string | null;
  startSec: number;
  endSec: number;
  text: string;
  meetingTitle: string | null;
  score: number;
};

export async function POST(req: Request) {
  let parsed: z.infer<typeof bodySchema>;
  try {
    parsed = bodySchema.parse(await req.json());
  } catch (err) {
    return Response.json(
      { error: "invalid_body", message: (err as Error).message },
      { status: 400 },
    );
  }

  const queryEmbedding = await embedText(parsed.q);
  const vectorLiteral = `[${queryEmbedding.join(",")}]`;

  // Cosine distance with pgvector: smaller is closer; we present 1 - distance
  // as a "score" for the UI so larger is more relevant.
  const rows = await db.execute<SearchHit>(sql`
    SELECT
      t.id            AS "transcriptId",
      t.meeting_id    AS "meetingId",
      t.speaker       AS "speaker",
      t.speaker_name  AS "speakerName",
      t.start_sec     AS "startSec",
      t.end_sec       AS "endSec",
      t.text          AS "text",
      m.title         AS "meetingTitle",
      (1 - (t.embedding <=> ${vectorLiteral}::vector))::float AS "score"
    FROM transcripts t
    JOIN meetings m ON m.id = t.meeting_id
    WHERE t.embedding IS NOT NULL
    ORDER BY t.embedding <=> ${vectorLiteral}::vector
    LIMIT ${parsed.limit}
  `);

  return Response.json({
    query: parsed.q,
    results: Array.isArray(rows) ? rows : (rows as { rows?: SearchHit[] }).rows ?? [],
  });
}
