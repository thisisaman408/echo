# ECHO — 3-Minute Demo Script

> Two takes: PRIMARY (live demo against production, real Zoom call) and BACKUP (replay against a pre-recorded meeting, no live dependencies). Record both.

---

## Open environment (do once before each take)

- Sign into HubSpot, Linear, Slack in separate browser tabs (visible during demo).
- Open `https://echo.resyl.app/dashboard` in the main browser window.
- Have a Zoom personal-room URL ready in clipboard.
- Open the dashboard, the meeting detail page (after pasting URL), HubSpot deals, Linear inbox, Slack channel, and Gmail drafts side-by-side or rotate as needed.

---

## Script (3:00 total)

### 0:00 – 0:15 · Cold open
> "I'm in 6 meetings today. After each one, I lose 30 minutes to follow-ups — CRM updates, emails to send, tasks to file, summaries to post. Not anymore."

(Talking head, dashboard visible behind you.)

### 0:15 – 0:45 · What ECHO is
> "ECHO is an autonomous multi-agent workflow autopilot. A bot joins your meetings automatically. After each call, five specialist agents — Action Extractor, Stakeholder Classifier, Decision Maker, Comms Drafter, Executor — coordinate to update HubSpot, file Linear tasks, post Slack summaries, and draft Gmail follow-ups. Real updates, not summaries."

(Show landing page → click "See the live dashboard".)

### 0:45 – 1:30 · ACT 1 — The pipeline fires
> "Let me show you what happens when a meeting ends. I'm going to paste a Zoom URL and join the meeting myself."

- `curl -X POST $PROD/api/bots/start -d '{"meetingUrl": "..."}'`  (or use UI button if built)
- Join the Zoom meeting, talk for ~30s with scripted dialogue:
  > "Hi Sarah from Acme — we're going to ship the SAML integration by Friday. I'll send you the proposal today. Marcus can you file the Linear ticket for the SSO testing? Decision: we're moving the Acme deal to negotiation stage."
- End the call.

### 1:30 – 2:15 · The dashboard streams
> "Watch the agent feed."

- Switch to `/dashboard/meetings/[id]`.
- Action Extractor card appears → Stakeholder Classifier → Decision Maker → Comms Drafter → Executor (each ~5s stagger).
- Right panel populates with executed actions:
  > "Linear ticket created. HubSpot deal moved to negotiation. Slack summary posted. Gmail draft to Sarah ready for review."

### 2:15 – 2:45 · ACT 2 — The audit reveal (the originality moat)
> "Here's what makes ECHO different from every other meeting tool: every action is auditable to the moment in audio that caused it."

- Click "Why?" on the Linear ticket → drill-down modal opens.
- Point to the source transcript snippet: speaker name, timestamp.
- Hit play on the audio: the player seeks to the exact moment Marcus said the words.
- Scroll down to show the full agent debate — Action Extractor's structured extraction, Decision Maker's reasoning, Comms Drafter's polished copy.
> "This is the trust layer that lets enterprises deploy AI agents to real systems. You can prove what the agent did, why, and where the evidence came from."

### 2:45 – 3:00 · Closing
> "Built on Vultr Tokyo for low-latency capture and as our system of record. Gemini 2.0 Pro for decision reasoning, Flash for comms drafting. Featherless serving domain-specialized extraction agents. Speechmatics for diarized transcription. Open source under MIT at github.com/thisisaman408/echo. Try it at echo.resyl.app."

---

## Backup take notes

If live Zoom is unreliable, use a pre-recorded MP4 of a 3-min scripted meeting:

1. Manually upload the audio to Vultr Object Storage at `meetings/demo-001.mp4`.
2. Insert a meetings row with `audioStorageKey = "meetings/demo-001.mp4"` and `status = "complete"`.
3. Send Inngest event `echo/meeting.recording_done` with `recallBotId` set to a sentinel.
4. Watch the pipeline fire as if it were live.
5. The dashboard, audit drill-down, and search demos are all identical to PRIMARY.

This decouples the demo from Recall.ai's webhook latency and the live Zoom call.

---

## Hero shots to nail in editing

- 00:55 — slow zoom into the agent feed as cards slide in
- 01:50 — split-screen: dashboard left, HubSpot tab right (deal stage changes live)
- 02:25 — full-screen the audit modal as audio starts playing
- 02:45 — cut to sponsor logos with the tagline overlay

---

## Recording checklist

- [ ] Loom / QuickTime + iPhone for picture-in-picture talking head
- [ ] 1920x1080 export
- [ ] Audio levels: speech ≥ -16 LUFS, no peaks > -3 dB
- [ ] Final length: under 3:00 (judges' attention drops after 3 min)
- [ ] Upload to YouTube as UNLISTED
- [ ] Record the BACKUP take in the same session — don't rely on live Zoom for the second take
- [ ] Confirm both URLs work in incognito before submission
