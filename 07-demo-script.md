# Polly — Demo Video Script (3 minutes)

## Goal

Judges have watched 50 agent demos already. Polly's video must:

1. Differentiate in the first 15 seconds
2. Have ONE unforgettable moment (the live audio catalyst)
3. Clearly hit every sponsor for prize eligibility
4. End on a clean "what's next" beat

## Pre-record checklist

- [ ] Polly deployed on Vultr and live at the demo URL
- [ ] Alpaca paper account funded with $100K (default paper balance)
- [ ] Watchlist set: NVDA, TSLA, AAPL, SPY, QQQ
- [ ] Pre-recorded MP3 of a fake "Fed Chair announcement" (record yourself: 30s, hawkish tone)
- [ ] Browser tabs prepared: Polly dashboard + Alpaca paper account (showing $0 P&L start)
- [ ] OBS / Tella / Screen Studio configured for 4K @ 60fps
- [ ] Microphone test (warm tone, no echo)
- [ ] Lighting check if on-camera

## Shot list (3:00 total)

### 0:00–0:15 — Cold open with the problem

**Visual:** Dark interface, Bloomberg-style ticker tape scrolling across the top with TSLA, NVDA, etc. Camera zooms in on a single ticker as the Fed Chair's pre-recorded voice plays: *"…we are raising rates by 25 basis points…"*

**Voiceover:**
> "When the Fed raises rates, billions of dollars move in seconds. Humans can't react fast enough. Most quant funds have entire engineering teams to bridge that gap."

**Cut to:** Polly logo (orange + dark).

> "Meet Polly. A 5-agent trading swarm that hears the news, decides, and trades — before you finish reading the headline."

### 0:15–0:40 — What Polly is

**Visual:** Architecture diagram (ASCII or animated) showing the 5 agents + Speechmatics + Alpaca + Vultr stack.

**Voiceover:**
> "Polly runs five specialist AI agents. Market Scout reads charts. News Reader scans the wire. Strategist forms a thesis. Risk Manager sizes the position. Executor places the trade — all in under five seconds."

**On-screen labels:**
- Gemini Pro → Strategist
- Gemini Flash → Scout, Risk, Narrator
- Featherless → News Reader (open-source, domain-specialized)
- Speechmatics → Live audio transcription
- Alpaca → Paper execution
- Vultr → Deployed here

### 0:40–2:00 — THE HERO MOMENT (live audio reaction)

**This is the demo's centerpiece. 80 seconds.**

**Visual:** Split screen.
- Left: Polly dashboard (3D trading floor + live agent chat)
- Right: Alpaca paper trading screen showing $100,000 cash, no positions

**Voiceover:**
> "Watch this. I'm about to play 30 seconds of audio. Polly is listening live."

**Action:** Click "Start listening" on the audio source panel. Play the pre-recorded Fed audio.

**Visual cascade (timed beats):**

**~0:50:** Live transcript starts streaming on the right.
> "…current economic conditions warrant a tightening of monetary policy…"
**On screen:** Speechmatics logo highlighted.

**~1:00:** A toast popup: "⚡ Catalyst detected: HAWKISH FED ACTION (urgency: HIGH)"
**Voiceover:** "Speechmatics transcribed in real time. Featherless's News Reader flagged the catalyst."

**~1:10:** The 3D trading floor lights up. Strategist's avatar pulses.
**On-screen text:** "Strategist (Gemini Pro): Short rate-sensitive longs. Conviction: 87%."

**~1:25:** Risk Manager approves. Executor avatar moves.
**Voiceover:** "Risk Manager sizes the position. Executor sends the order."

**~1:35:** On the right (Alpaca screen), a trade fills: "SELL 50 TLT @ $89.42." On the left, the equity curve flickers downward briefly, then upward as the short pays off.
**Voiceover:** "Trade filled. From audio to execution in four seconds."

**~1:50:** Narrator panel pops a one-liner: *"Polly faded TLT into Fed hawkishness. Position sized at 12% of capital with a 2% stop. Watching for follow-through."*

### 2:00–2:25 — Multi-agent debate (regular cycle)

**Visual:** Wide shot of the dashboard. Live agent chat scrolls with messages from all 5 agents.

**Voiceover:**
> "Polly runs continuously, debating five tickers every five minutes. Here's a normal cycle on NVDA — Scout sees momentum, News Reader pulls up an analyst upgrade, Strategist agrees but flags an earnings risk, Risk Manager halves the size, Executor places."

**Visual:** Each agent's message lights up in sequence with a subtle color flash.

### 2:25–2:45 — Sponsor stack callouts

**Visual:** Logo grid — Vultr, Gemini, Featherless, Speechmatics — with a one-line description each.

**Voiceover:**
> "Deployed on Vultr. Strategist on Gemini Pro. News Reader on Featherless — open-source under MIT. Live audio on Speechmatics. Paper execution on Alpaca."

### 2:45–3:00 — Closing

**Visual:** Final hero shot of the 3D trading floor with all 5 agents glowing, equity curve trending up.

**Voiceover:**
> "Polly. Five agents. One mission. Built in seven days. Open source. Ready to deploy. The next generation of autonomous trading."

**End card:** URL, GitHub, team name (Captain Jack Sparrow), Milan AI Week badge.

## Voiceover tips

- Pacing: ~140 words per minute
- Tone: confident, slightly dry — think Bloomberg anchor, not startup pitch
- Don't oversell. Let the demo speak. Use phrases like "watch this" not "this is amazing"
- Cut all "um"s and dead air in post

## Editing checklist

- [ ] Color grade: dark, high contrast
- [ ] Background music: minimal — a single ambient pad track at -25dB
- [ ] Captions: yes, burned-in (helps with international judges)
- [ ] Aspect ratio: 16:9, 4K resolution for the final upload
- [ ] Logo flash at 0:00 — Polly + Milan AI Week badge
- [ ] Lower-thirds for each sponsor when their tech appears
- [ ] End card: GitHub URL + demo URL + license (MIT)

## Upload destinations

- YouTube (unlisted) — paste link into lablab submission
- Vimeo — backup
- Tweet preview clip (60s cut) — tag @lablabai

## What NOT to do

- Don't show code in the demo. Judges don't watch demos to see code.
- Don't narrate the obvious ("you can see here..."). Let visuals speak.
- Don't go over 3 minutes. Judges' attention drops sharply after 2:30.
- Don't have raw paper trade losses in the demo cut — pre-record or splice to a winning trade.
- Don't tag Kraken since you're not in the Kraken Challenge.

## Alternative cut (60-second teaser for Twitter)

Same arc, compressed:

- 0:00–0:10 — problem
- 0:10–0:40 — hero moment (Fed audio → trade)
- 0:40–0:55 — sponsor stack
- 0:55–1:00 — closing card + URL

This is your social engagement amplifier. Post Tuesday afternoon for max amplification before judging.
