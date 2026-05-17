import { z } from "zod";

const booleanString = z
  .enum(["true", "false"])
  .transform((v) => v === "true");

const envSchema = z.object({
  // Mode
  DEMO_MODE: booleanString.default(true),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
  ECHO_PUBLIC_HOSTNAME: z.string().min(1).default("echo.localhost"),

  // Database
  DATABASE_URL: z.string().url(),

  // Auth (Better Auth)
  BETTER_AUTH_SECRET: z.string().min(32),
  BETTER_AUTH_URL: z.string().url().default("http://localhost:3000"),

  // Google OAuth (shared: Better Auth login + Gmail drafts + Recall calendar)
  GOOGLE_OAUTH_CLIENT_ID: z.string().min(1),
  GOOGLE_OAUTH_CLIENT_SECRET: z.string().min(1),
  GOOGLE_OAUTH_REDIRECT_URI: z
    .string()
    .url()
    .default("http://localhost:3000/api/auth/google/callback"),
  GOOGLE_OAUTH_REFRESH_TOKEN: z.string().optional(),

  // Recall.ai
  RECALL_API_KEY: z.string().min(1),
  RECALL_REGION: z.string().default("ap-northeast-1"),
  RECALL_WEBHOOK_SECRET: z.string().min(16),

  // Speechmatics
  SPEECHMATICS_API_KEY: z.string().min(1),

  // Gemini
  GEMINI_API_KEY: z.string().min(1),
  GEMINI_MODEL_REASONING: z.string().default("gemini-2.0-pro-exp"),
  GEMINI_MODEL_FAST: z.string().default("gemini-2.0-flash-exp"),
  GEMINI_MODEL_EMBEDDING: z.string().default("text-embedding-004"),

  // Featherless
  FEATHERLESS_API_KEY: z.string().min(1),
  FEATHERLESS_MODEL_EXTRACTOR: z
    .string()
    .default("meta-llama/Meta-Llama-3.1-8B-Instruct"),
  FEATHERLESS_MODEL_CLASSIFIER: z
    .string()
    .default("meta-llama/Meta-Llama-3.1-8B-Instruct"),

  // HubSpot (DEMO_MODE: private app token)
  HUBSPOT_PRIVATE_TOKEN: z.string().min(1),

  // Linear (DEMO_MODE: personal API key)
  LINEAR_API_KEY: z.string().min(1),
  LINEAR_TEAM_ID: z.string().min(1),

  // Slack
  SLACK_WEBHOOK_URL: z.string().url(),

  // Inngest (optional in dev — Inngest dev server runs without keys)
  INNGEST_EVENT_KEY: z.string().optional(),
  INNGEST_SIGNING_KEY: z.string().optional(),

  // Vultr Object Storage
  VULTR_STORAGE_ACCESS_KEY: z.string().min(1),
  VULTR_STORAGE_SECRET_KEY: z.string().min(1),
  VULTR_STORAGE_ENDPOINT: z.string().url(),
  VULTR_STORAGE_BUCKET: z.string().min(1).default("echo-audio"),

  // Echo app config
  ECHO_DEFAULT_HUBSPOT_PIPELINE_ID: z.string().optional(),
  ECHO_DEFAULT_LINEAR_PROJECT_ID: z.string().optional(),
  ECHO_DEFAULT_SLACK_CHANNEL: z.string().default("#echo-test"),
  ECHO_GMAIL_DRAFT_FROM: z.string().optional(),
  ECHO_MAX_ACTIONS_PER_MEETING: z.coerce.number().int().positive().default(20),
  ECHO_REQUIRE_HUMAN_APPROVAL: booleanString.default(false),
  ECHO_TRANSCRIPT_LANGUAGE: z.string().default("en"),

  // Observability (optional)
  SENTRY_DSN: z.string().optional(),
});

type Env = z.infer<typeof envSchema>;

let cached: Env | null = null;

/**
 * Validated environment. Lazy so build-time imports don't crash without .env.
 * In tests we set process.env then call this — never import a frozen copy.
 */
export function getEnv(): Env {
  if (cached) return cached;
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((i) => `  ${i.path.join(".")}: ${i.message}`)
      .join("\n");
    throw new Error(`Invalid environment variables:\n${issues}`);
  }
  cached = parsed.data;
  return cached;
}

/**
 * Convenience accessor. Throws on first read if env is invalid.
 * Use `getEnv()` if you need a fresh read (tests).
 */
export const env = new Proxy({} as Env, {
  get(_target, prop: string) {
    return getEnv()[prop as keyof Env];
  },
});
