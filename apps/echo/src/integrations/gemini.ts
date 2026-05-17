import {
  GoogleGenerativeAI,
  type GenerativeModel,
} from "@google/generative-ai";
import type { z } from "zod";
import { env } from "@/lib/env";

/**
 * Gemini client. Three model handles:
 *  - geminiPro: structured reasoning for Decision Maker.
 *  - geminiFlash: faster + cheaper for Comms Drafter and Executor narration.
 *  - text-embedding-004: 768-d embeddings for pgvector search (M3.1).
 */

let _client: GoogleGenerativeAI | null = null;
function client(): GoogleGenerativeAI {
  if (_client) return _client;
  _client = new GoogleGenerativeAI(env.GEMINI_API_KEY);
  return _client;
}

let _pro: GenerativeModel | null = null;
export function geminiPro(): GenerativeModel {
  if (_pro) return _pro;
  _pro = client().getGenerativeModel({ model: env.GEMINI_MODEL_REASONING });
  return _pro;
}

let _flash: GenerativeModel | null = null;
export function geminiFlash(): GenerativeModel {
  if (_flash) return _flash;
  _flash = client().getGenerativeModel({ model: env.GEMINI_MODEL_FAST });
  return _flash;
}

type CompleteJsonOptions = {
  model: GenerativeModel;
  system: string;
  user: string;
  temperature?: number;
  maxRetries?: number;
};

export async function geminiJson<T>(
  opts: CompleteJsonOptions,
  schema: z.ZodType<T>,
): Promise<T> {
  const maxRetries = opts.maxRetries ?? 2;
  let lastErr: unknown;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const temperature =
      attempt === 0 ? (opts.temperature ?? 0.3) : 0;
    const result = await opts.model.generateContent({
      contents: [
        {
          role: "user",
          parts: [{ text: `${opts.system}\n\n${opts.user}` }],
        },
      ],
      generationConfig: {
        responseMimeType: "application/json",
        temperature,
      },
    });
    const raw = result.response.text();
    try {
      return schema.parse(JSON.parse(raw));
    } catch (err) {
      lastErr = err;
    }
  }
  throw new Error(
    `Gemini JSON parse failed after ${maxRetries + 1} attempts: ${
      lastErr instanceof Error ? lastErr.message : String(lastErr)
    }`,
  );
}

/**
 * Single-text embedding via text-embedding-004 (768 dims).
 * The official @google/generative-ai SDK exposes embeddings via
 * `client.getGenerativeModel({ model: ... }).embedContent(...)`.
 */
export async function embedText(text: string): Promise<number[]> {
  const model = client().getGenerativeModel({ model: env.GEMINI_MODEL_EMBEDDING });
  const res = await model.embedContent(text);
  return res.embedding.values;
}

export async function embedTexts(texts: string[]): Promise<number[][]> {
  if (texts.length === 0) return [];
  const model = client().getGenerativeModel({ model: env.GEMINI_MODEL_EMBEDDING });
  const out: number[][] = [];
  // Sequential to stay polite under free-tier rate limits; can swap to
  // batchEmbedContents if we move to a paid quota.
  for (const t of texts) {
    const r = await model.embedContent(t);
    out.push(r.embedding.values);
  }
  return out;
}
