# SETUP REQUIRED — Founder action items

> What you need to do before ECHO can run end-to-end. The code is shipped — these are credentials + infra steps only.

---

## Status snapshot (2026-05-17, autonomous build session)

| Area | Status |
|---|---|
| All 22 milestones' code | ✅ shipped (20/22 complete, M1.2 and M1.7/M2.9 blocked on Vultr VM) |
| 24 vitest tests | ✅ passing |
| Typecheck | ✅ clean |
| Lint | ✅ clean |
| GitHub repo (MIT) | ✅ https://github.com/thisisaman408/echo |
| Vultr VM | ⏳ you need to provision |
| Credentials | ⏳ you need to gather |
| Live deploy | ⏳ blocks on Vultr + credentials |
| Demo video recording | ⏳ founder task (script in docs/demo-script.md) |
| Submission forms | ⏳ founder task (drafts in docs/submissions/) |

Total founder time required: **~60–90 minutes** end-to-end before submission.

---

## 1. Provision the Vultr VM (~20 min)

1. Sign into https://my.vultr.com/deploy/
2. Cloud Compute (Regular Performance) → **Tokyo** (ap-northeast-1) → Ubuntu 24.04 → 2 vCPU / 4 GB plan (~$24/mo, well within your $200 credit).
3. Add your SSH key. Note the public IP.
4. Point DNS: in your domain provider (Cloudflare for resyl.app), add an A record `echo` → Vultr IP, TTL 60s.
5. SSH in:
   ```bash
   ssh root@<vultr-ip>
   apt update && apt upgrade -y
   apt install -y curl git build-essential ufw postgresql-16 postgresql-16-pgvector caddy
   curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
   apt install -y nodejs
   npm install -g pnpm@10 pm2
   ufw allow 22 && ufw allow 80 && ufw allow 443 && ufw enable
   ```
6. Configure Postgres:
   ```bash
   sudo -u postgres psql <<EOF
   CREATE USER echo WITH PASSWORD '<PICK_STRONG_PASSWORD>';
   CREATE DATABASE echo OWNER echo;
   \c echo
   CREATE EXTENSION IF NOT EXISTS vector;
   EOF
   ```
7. Configure Caddy:
   ```bash
   cat > /etc/caddy/Caddyfile <<EOF
   echo.resyl.app {
     reverse_proxy localhost:3000
   }
   EOF
   systemctl reload caddy
   ```
8. Smoke test: `curl https://echo.resyl.app` → 502 (Caddy + TLS up, app not deployed yet — expected).

---

## 2. Gather credentials (~30 min)

Open `08-env.example` side-by-side as you fill these. Stop when all 20 are filled.

### Already done (~$200 + $200 + $25 credits live)
- [x] **Speechmatics**: have the $200 credit. Get the key at https://portal.speechmatics.com/manage-access → `SPEECHMATICS_API_KEY`
- [x] **Gemini**: get a free key at https://aistudio.google.com → "Get API key" → `GEMINI_API_KEY`
- [x] **Featherless**: activate Premium via the Featherless Discord hackathon coupon → dashboard → `FEATHERLESS_API_KEY`. Pick a Llama 3.1 instruct model from the catalog for the two `FEATHERLESS_MODEL_*` vars (defaults to `meta-llama/Meta-Llama-3.1-8B-Instruct`).

### To do
- [ ] **Recall.ai** (2 min): https://ap-northeast-1.recall.ai/dashboard/developers → API key → `RECALL_API_KEY`. Generate a webhook secret yourself: `openssl rand -hex 16` → `RECALL_WEBHOOK_SECRET`. Register webhook URL `https://echo.resyl.app/api/recall/webhook` in Recall dashboard with the secret.
- [ ] **Google OAuth (15 min — the slowest one)**:
  1. https://console.cloud.google.com → New project "echo-hackathon"
  2. APIs & Services → Library → enable **Gmail API** + **Google Calendar API**
  3. OAuth consent screen → External → add your email as test user
  4. Credentials → Create OAuth client ID → Web application → Redirect URI: `http://localhost:3000/api/auth/google/callback` AND `https://echo.resyl.app/api/auth/google/callback`
  5. Note `GOOGLE_OAUTH_CLIENT_ID` + `GOOGLE_OAUTH_CLIENT_SECRET`
  6. Run `pnpm tsx scripts/google-oauth-dance.ts` locally to get `GOOGLE_OAUTH_REFRESH_TOKEN`
- [ ] **HubSpot (5 min)**: https://www.hubspot.com/products/get-started → free dev account → https://app.hubspot.com/private-apps → New private app. Scopes: `crm.objects.deals.read`, `crm.objects.deals.write`, `crm.objects.notes.write`, `crm.objects.contacts.read`, `crm.objects.contacts.write`. → `HUBSPOT_PRIVATE_TOKEN`
- [ ] **Linear (3 min)**: https://linear.app/settings/api → Create new key → `LINEAR_API_KEY`. Get team UUID from any Linear URL (it's in the path) or via API → `LINEAR_TEAM_ID`
- [ ] **Slack (5 min)**: https://api.slack.com/apps → Create New App → From scratch → Incoming Webhooks → Activate → Add new webhook to workspace (pick #echo-test channel) → `SLACK_WEBHOOK_URL`
- [ ] **Vultr Object Storage (5 min)**: https://my.vultr.com/objectstorage/ → Add Object Storage → Tokyo → note the four `VULTR_STORAGE_*` values. Create a bucket named `echo-audio` (or set `VULTR_STORAGE_BUCKET` to match).
- [ ] **Better Auth secret**: `openssl rand -hex 32` → `BETTER_AUTH_SECRET`. (Better Auth itself is not wired in v1 — see DECISIONS.md — but the env validator still requires this value.)
- [ ] **Inngest**: for production, https://inngest.com → free project → `INNGEST_EVENT_KEY` + `INNGEST_SIGNING_KEY`. For dev, leave blank; the in-process dev server runs without keys.

---

## 3. Deploy ECHO to Vultr (~10 min)

```bash
ssh root@<vultr-ip>
cd ~
git clone https://github.com/thisisaman408/echo.git
cd echo
# Create apps/echo/.env with all 20 values from step 2
nano apps/echo/.env
pnpm install
cd apps/echo
pnpm db:migrate
pnpm build
pm2 start "pnpm start" --name echo
pm2 save
```

Verify `https://echo.resyl.app/dashboard` returns the empty-state dashboard.

---

## 4. Run the end-to-end smoke test (~10 min)

1. Open a Zoom personal room.
2. `curl -X POST https://echo.resyl.app/api/bots/start -H 'content-type: application/json' -d '{"meetingUrl":"<your-zoom-url>"}'`
3. Join the meeting yourself. Talk for ~30 seconds following the script in `docs/demo-script.md`. End the call.
4. Watch `https://echo.resyl.app/dashboard` — within ~90 seconds the meeting appears with status `complete` and 5 agent messages.
5. Open the meeting detail page → confirm executed actions populated in HubSpot, Linear, Slack, Gmail drafts.
6. Click "Why?" on any action → drill-down modal opens with transcript snippet + audio.

If any step fails: check `pm2 logs echo` on the VM and DECISIONS.md for known caveats.

---

## 5. Record demo video (~60 min including retakes)

Script: `docs/demo-script.md` (3 min target). Record both PRIMARY (live) and BACKUP (replay) versions. Upload to YouTube as UNLISTED.

---

## 6. Submit (~30 min)

Per-sponsor drafts in `docs/submissions/`:
- `docs/submissions/vultr.md`
- `docs/submissions/gemini.md`
- `docs/submissions/featherless.md`

Paste into lablab.ai submission forms before **2026-05-19 18:00 IST** (2-hour buffer before the 20:00 hard deadline).

Also create:
- Cover image (1280×720) — Canva / Figma
- 5–7 slide deck — Google Slides / Pitch
