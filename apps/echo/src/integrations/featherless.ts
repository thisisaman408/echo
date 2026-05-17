import OpenAI from "openai";
import type { z } from "zod";
import { env } from "@/lib/env";

/**
 * Featherless serves OpenAI-compatible endpoints, which lets us reuse the
 * `openai` SDK. We use it for the two extractor agents (Action Extractor,
 * Stakeholder Classifier) where domain-specialized open-weight models do
 * better than general-purpose chat models for structured extraction.
 */

let _client: OpenAI | null = null;
function client(): OpenAI {
  if (_client) return _client;
  _client = new OpenAI({
    apiKey: env.FEATHERLESS_API_KEY,
    baseURL: "https://api.featherless.ai/v1",
  });
  return _client;
}

type CompleteJsonOptions = {
  model: string;
  system: string;
  user: string;
  temperature?: number;
  maxRetries?: number;
};

/**
 * Calls the model with response_format=json_object and validates the parsed
 * JSON against a Zod schema. On parse failure we retry with temperature=0
 * for determinism. Throws after `maxRetries` attempts so the caller — usually
 * an Inngest step — can retry the whole step.
 */
export async function completeJson<T>(
  opts: CompleteJsonOptions,
  schema: z.ZodType<T>,
): Promise<{ data: T; usage: OpenAI.Completions.CompletionUsage | null }> {
  const maxRetries = opts.maxRetries ?? 2;
  let lastErr: unknown;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const temperature =
      attempt === 0 ? (opts.temperature ?? 0.2) : 0;
    const res = await client().chat.completions.create({
      model: opts.model,
      messages: [
        { role: "system", content: opts.system },
        { role: "user", content: opts.user },
      ],
      response_format: { type: "json_object" },
      temperature,
    });
    const raw = res.choices[0]?.message?.content ?? "{}";
    try {
      const parsed = schema.parse(JSON.parse(raw));
      return { data: parsed, usage: res.usage ?? null };
    } catch (err) {
      lastErr = err;
    }
  }
  throw new Error(
    `Featherless JSON parse failed after ${maxRetries + 1} attempts: ${
      lastErr instanceof Error ? lastErr.message : String(lastErr)
    }`,
  );
}
