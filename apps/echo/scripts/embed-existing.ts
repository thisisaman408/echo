import "dotenv/config";
import { sql, isNull } from "drizzle-orm";
import { db } from "../src/db/client";
import { transcripts } from "../src/db/schema";
import { embedTexts } from "../src/integrations/gemini";

async function main() {
  const pending = await db
    .select({ id: transcripts.id, text: transcripts.text })
    .from(transcripts)
    .where(isNull(transcripts.embedding));

  console.log(`Embedding ${pending.length} transcript segments...`);
  if (pending.length === 0) {
    console.log("Nothing to embed.");
    process.exit(0);
  }

  const vectors = await embedTexts(pending.map((p) => p.text));

  for (let i = 0; i < pending.length; i++) {
    await db.execute(sql`
      UPDATE transcripts
      SET embedding = ${`[${vectors[i].join(",")}]`}::vector
      WHERE id = ${pending[i].id}
    `);
    console.log(`  [${i + 1}/${pending.length}] embedded ${pending[i].id}`);
  }

  console.log("Done. Search should work now.");
  process.exit(0);
}

main().catch((e) => { console.error(e); process.exit(1); });
