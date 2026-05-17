import { z } from "zod";
import { env } from "@/lib/env";

/**
 * Speechmatics batch transcription with speaker diarization.
 *
 * Flow:
 *  1. POST /v2/jobs (multipart) with a config JSON + either fetch_data.url
 *     or a binary 'data_file' field. We use fetch_data when we already have
 *     a public URL; otherwise we stream the audio buffer.
 *  2. Poll GET /v2/jobs/:id until status === "done".
 *  3. GET /v2/jobs/:id/transcript?format=json-v2 → word-level results with
 *     speaker labels; we collapse adjacent same-speaker words into segments.
 */

const BASE = "https://asr.api.speechmatics.com/v2";

export type DiarizedSegment = {
  speaker: string;
  startSec: number;
  endSec: number;
  text: string;
};

const submitResponseSchema = z.object({
  id: z.string(),
});

const statusResponseSchema = z.object({
  job: z.object({
    id: z.string(),
    status: z.enum(["running", "done", "rejected"]),
    errors: z.array(z.object({ message: z.string() })).optional(),
  }),
});

const transcriptResultSchema = z.object({
  results: z
    .array(
      z.object({
        start_time: z.number(),
        end_time: z.number(),
        alternatives: z
          .array(
            z.object({
              content: z.string(),
              speaker: z.string().optional(),
            }),
          )
          .optional(),
      }),
    )
    .optional(),
});

type SubmitOptions = {
  language?: string;
  operatingPoint?: "standard" | "enhanced";
};

async function submitJob(
  source:
    | { type: "url"; url: string }
    | { type: "buffer"; buffer: Buffer; filename: string },
  opts: SubmitOptions = {},
): Promise<string> {
  const form = new FormData();
  const config = {
    type: "transcription",
    transcription_config: {
      language: opts.language ?? env.ECHO_TRANSCRIPT_LANGUAGE,
      operating_point: opts.operatingPoint ?? "enhanced",
      diarization: "speaker",
    },
    ...(source.type === "url" ? { fetch_data: { url: source.url } } : {}),
  };
  form.append("config", JSON.stringify(config));
  if (source.type === "buffer") {
    form.append(
      "data_file",
      new Blob([source.buffer as unknown as ArrayBuffer]),
      source.filename,
    );
  }

  const res = await fetch(`${BASE}/jobs`, {
    method: "POST",
    headers: { Authorization: `Bearer ${env.SPEECHMATICS_API_KEY}` },
    body: form,
  });
  if (!res.ok) {
    throw new Error(
      `Speechmatics submit failed: ${res.status} ${await res.text()}`,
    );
  }
  return submitResponseSchema.parse(await res.json()).id;
}

async function waitForJob(
  jobId: string,
  opts: { maxAttempts?: number; intervalMs?: number } = {},
): Promise<void> {
  const maxAttempts = opts.maxAttempts ?? 120; // 120 * 5s = 10min
  const intervalMs = opts.intervalMs ?? 5000;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    await new Promise((r) => setTimeout(r, intervalMs));
    const res = await fetch(`${BASE}/jobs/${jobId}`, {
      headers: { Authorization: `Bearer ${env.SPEECHMATICS_API_KEY}` },
    });
    if (!res.ok) continue;
    const { job } = statusResponseSchema.parse(await res.json());
    if (job.status === "done") return;
    if (job.status === "rejected") {
      const reason = job.errors?.map((e) => e.message).join("; ") ?? "rejected";
      throw new Error(`Speechmatics rejected job ${jobId}: ${reason}`);
    }
  }
  throw new Error(`Speechmatics job ${jobId} timed out`);
}

async function fetchTranscript(jobId: string): Promise<DiarizedSegment[]> {
  const res = await fetch(`${BASE}/jobs/${jobId}/transcript?format=json-v2`, {
    headers: { Authorization: `Bearer ${env.SPEECHMATICS_API_KEY}` },
  });
  if (!res.ok) {
    throw new Error(`Speechmatics transcript fetch failed: ${res.status}`);
  }
  const parsed = transcriptResultSchema.parse(await res.json());
  return collapseToSegments(parsed.results ?? []);
}

/**
 * Collapse word-level speaker-tagged results into per-speaker segments. Adjacent
 * words with the same speaker label are merged so a 5-min meeting produces ~20
 * segments instead of ~500.
 */
export function collapseToSegments(
  words: Array<{
    start_time: number;
    end_time: number;
    alternatives?: Array<{ content: string; speaker?: string }>;
  }>,
): DiarizedSegment[] {
  const segments: DiarizedSegment[] = [];
  let current: DiarizedSegment | null = null;
  for (const w of words) {
    const alt = w.alternatives?.[0];
    if (!alt?.content) continue;
    const speaker = alt.speaker ?? "UU";
    if (current && current.speaker === speaker) {
      current.text += " " + alt.content;
      current.endSec = w.end_time;
    } else {
      if (current) segments.push(current);
      current = {
        speaker,
        startSec: w.start_time,
        endSec: w.end_time,
        text: alt.content,
      };
    }
  }
  if (current) segments.push(current);
  return segments;
}

export async function transcribeFromUrl(
  audioUrl: string,
  opts: SubmitOptions = {},
): Promise<DiarizedSegment[]> {
  const jobId = await submitJob({ type: "url", url: audioUrl }, opts);
  await waitForJob(jobId);
  return fetchTranscript(jobId);
}

export async function transcribeFromBuffer(
  buffer: Buffer,
  filename: string,
  opts: SubmitOptions = {},
): Promise<DiarizedSegment[]> {
  const jobId = await submitJob(
    { type: "buffer", buffer, filename },
    opts,
  );
  await waitForJob(jobId);
  return fetchTranscript(jobId);
}
