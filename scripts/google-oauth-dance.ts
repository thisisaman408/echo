#!/usr/bin/env tsx
/**
 * One-time Google OAuth dance to get a personal refresh token for DEMO_MODE.
 *
 * Prereqs:
 *  - .env has GOOGLE_OAUTH_CLIENT_ID, GOOGLE_OAUTH_CLIENT_SECRET, and
 *    GOOGLE_OAUTH_REDIRECT_URI matching what's in the Google Cloud Console.
 *  - You added the redirect URI http://localhost:3000/api/auth/google/callback
 *    to your OAuth client.
 *
 * Run:    pnpm tsx scripts/google-oauth-dance.ts
 * Then:   paste GOOGLE_OAUTH_REFRESH_TOKEN="..." into your .env
 */
import { google } from "googleapis";
import readline from "node:readline/promises";
import { config as loadEnv } from "dotenv";

loadEnv({ path: ".env" });
loadEnv({ path: "apps/echo/.env" });
loadEnv({ path: "apps/echo/.env.local" });

const SCOPES = [
  "https://www.googleapis.com/auth/gmail.compose",
  "https://www.googleapis.com/auth/calendar.events.readonly",
  "https://www.googleapis.com/auth/userinfo.email",
  "openid",
];

async function main() {
  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
  const redirectUri =
    process.env.GOOGLE_OAUTH_REDIRECT_URI ??
    "http://localhost:3000/api/auth/google/callback";

  if (!clientId || !clientSecret) {
    console.error(
      "Missing GOOGLE_OAUTH_CLIENT_ID or GOOGLE_OAUTH_CLIENT_SECRET in env.",
    );
    process.exit(1);
  }

  const oauth2 = new google.auth.OAuth2(clientId, clientSecret, redirectUri);
  const url = oauth2.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: SCOPES,
  });

  console.log("\n1. Open this URL in your browser:\n");
  console.log(url);
  console.log("\n2. Sign in, grant access.");
  console.log(
    "\n3. The browser will redirect to your redirect URI with ?code=... — copy that code.",
  );

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  const code = (await rl.question("\nPaste the code here: ")).trim();
  rl.close();

  const { tokens } = await oauth2.getToken(code);
  if (!tokens.refresh_token) {
    console.error(
      "\nNo refresh_token returned. Visit https://myaccount.google.com/permissions,",
    );
    console.error(
      "remove the app, then re-run this script (Google only emits refresh_token on first consent).",
    );
    process.exit(1);
  }

  console.log("\n────────────────────────────────────────");
  console.log("Add this to apps/echo/.env (or your root .env):");
  console.log(`\nGOOGLE_OAUTH_REFRESH_TOKEN="${tokens.refresh_token}"\n`);
  console.log("────────────────────────────────────────");
}

main().catch((err) => {
  console.error("OAuth dance failed:", err);
  process.exit(1);
});
