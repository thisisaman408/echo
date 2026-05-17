/**
 * Vitest setup. Populates the env vars our zod-validated `env` requires so
 * that integration tests can `import { env } from "@/lib/env"` without
 * blowing up before they get to mock fetch.
 */

const TEST_ENV: Record<string, string> = {
  DEMO_MODE: "true",
  NODE_ENV: "test",
  NEXT_PUBLIC_APP_URL: "http://localhost:3000",
  ECHO_PUBLIC_HOSTNAME: "echo.localhost",
  DATABASE_URL: "postgresql://echo:echo@localhost:5432/echo_test",
  BETTER_AUTH_SECRET: "x".repeat(48),
  BETTER_AUTH_URL: "http://localhost:3000",
  GOOGLE_OAUTH_CLIENT_ID: "test-client-id",
  GOOGLE_OAUTH_CLIENT_SECRET: "test-client-secret",
  GOOGLE_OAUTH_REDIRECT_URI: "http://localhost:3000/api/auth/google/callback",
  GOOGLE_OAUTH_REFRESH_TOKEN: "test-refresh-token",
  RECALL_API_KEY: "test-recall-key",
  RECALL_REGION: "ap-northeast-1",
  RECALL_WEBHOOK_SECRET: "x".repeat(32),
  SPEECHMATICS_API_KEY: "test-speechmatics-key",
  GEMINI_API_KEY: "test-gemini-key",
  FEATHERLESS_API_KEY: "test-featherless-key",
  HUBSPOT_PRIVATE_TOKEN: "test-hubspot-token",
  LINEAR_API_KEY: "test-linear-key",
  LINEAR_TEAM_ID: "test-team-id",
  SLACK_WEBHOOK_URL: "https://hooks.slack.com/services/T000/B000/test",
  VULTR_STORAGE_ACCESS_KEY: "test-access-key",
  VULTR_STORAGE_SECRET_KEY: "test-secret-key",
  VULTR_STORAGE_ENDPOINT: "https://ap-northeast-1.vultrobjects.com",
  VULTR_STORAGE_BUCKET: "echo-test",
};

for (const [k, v] of Object.entries(TEST_ENV)) {
  if (process.env[k] === undefined) process.env[k] = v;
}
