import { google } from "googleapis";
import { env } from "@/lib/env";

/**
 * Gmail drafts via the user's OAuth refresh token. We use draft-only — never
 * send — so a human reviews before anything goes out. Switching to send in
 * a future version is a one-line change (`drafts.create` → `messages.send`).
 */

function oauthClient() {
  const c = new google.auth.OAuth2(
    env.GOOGLE_OAUTH_CLIENT_ID,
    env.GOOGLE_OAUTH_CLIENT_SECRET,
    env.GOOGLE_OAUTH_REDIRECT_URI,
  );
  if (!env.GOOGLE_OAUTH_REFRESH_TOKEN) {
    throw new Error(
      "GOOGLE_OAUTH_REFRESH_TOKEN missing — run scripts/google-oauth-dance.ts",
    );
  }
  c.setCredentials({ refresh_token: env.GOOGLE_OAUTH_REFRESH_TOKEN });
  return c;
}

let _gmail: ReturnType<typeof google.gmail> | null = null;
function gmail() {
  if (_gmail) return _gmail;
  _gmail = google.gmail({ version: "v1", auth: oauthClient() });
  return _gmail;
}

export type CreateDraftInput = {
  to: string;
  subject: string;
  bodyMarkdown: string;
  from?: string;
};

function buildRawMime(input: CreateDraftInput): string {
  const lines = [
    `To: ${input.to}`,
    `Subject: ${input.subject}`,
    `Content-Type: text/plain; charset=utf-8`,
    `MIME-Version: 1.0`,
  ];
  if (input.from ?? env.ECHO_GMAIL_DRAFT_FROM) {
    lines.push(`From: ${input.from ?? env.ECHO_GMAIL_DRAFT_FROM}`);
  }
  lines.push("", input.bodyMarkdown);
  return Buffer.from(lines.join("\r\n"), "utf8").toString("base64url");
}

export async function createDraft(input: CreateDraftInput) {
  const raw = buildRawMime(input);
  const res = await gmail().users.drafts.create({
    userId: "me",
    requestBody: { message: { raw } },
  });
  return {
    id: res.data.id ?? null,
    messageId: res.data.message?.id ?? null,
  };
}

export { buildRawMime };
