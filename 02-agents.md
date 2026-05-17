# Polly — The 5 Agents

Each agent is a typed module that takes structured inputs, calls its LLM, and emits structured outputs onto the `agent_messages` bus.

---

## 1. Market Scout

**Role:** Polls real-time market data, computes technical indicators, flags setups.

| Property | Value |
|---|---|
| LLM | Gemini 2.0 Flash |
| Frequency | Every 5 min (cron) |
| Reads | Alpaca prices (last 200 bars per ticker on watchlist) |
| Outputs | `ScoutFinding[]` — `{ ticker, signal_type, strength, indicators, timestamp }` |

**Signal types:** momentum_break, oversold_bounce, resistance_test, volume_spike, gap_up, gap_down.

**Indicators computed:**
- RSI (14)
- MACD (12, 26, 9)
- Volume vs 20-day avg
- 50-day / 200-day SMA cross
- ATR (volatility for stop-loss sizing)

**Prompt outline:**
```
You are Market Scout — a technical analyst agent. Given the following price history
and indicators for {ticker}:

  Price (last 50 bars): {ohlcv}
  RSI (14): {rsi}
  MACD: {macd_line}, {signal_line}, {histogram}
  Volume: {volume_zscore} (z-score vs 20-day avg)
  SMA 50 vs 200: {sma_cross}

Identify any actionable setups. Return JSON only:
{
  "signals": [
    { "ticker": "...", "type": "momentum_break|oversold_bounce|...",
      "strength": 0-100, "rationale": "<2 sentences>" }
  ]
}
```

---

## 2. News Reader

**Role:** Reads news + live audio transcripts, extracts catalysts and sentiment per ticker.

| Property | Value |
|---|---|
| LLM | Featherless (domain-specialized financial sentiment model) |
| Frequency | Every 5 min (cron) + reactive on Speechmatics events |
| Reads | NewsAPI, RSS feeds, Speechmatics transcript stream |
| Outputs | `NewsCatalyst[]` — `{ tickers[], event_type, sentiment, urgency, source }` |

**Why Featherless:** open-source, domain-specialized (financial-sentiment fine-tune). MIT license requirement for the Featherless prize is satisfied.

**Event types:** earnings_beat, earnings_miss, fda_approval, sec_filing, ceo_change, fed_action, m_a, partnership, downgrade, upgrade, geopolitical.

**Prompt outline:**
```
You are News Reader — a financial news analyst agent. Extract structured catalysts
from the following text (could be a news article OR a live audio transcript):

  Source: {source_type}  (article | fed_speech | earnings_call | analyst_note)
  Speaker: {speaker_name}  (if known)
  Text: {body}

Return JSON only:
{
  "catalysts": [
    { "tickers": ["TSLA"], "event_type": "...", "sentiment": "bullish|bearish|neutral",
      "urgency": "low|med|high", "rationale": "<2 sentences>",
      "raw_quote": "<verbatim source quote>" }
  ]
}

If the text contains no actionable financial information, return { "catalysts": [] }.
```

---

## 3. Strategist

**Role:** Synthesizes Scout findings + News catalysts into a trade thesis with conviction score.

| Property | Value |
|---|---|
| LLM | Gemini 2.0 Pro (advanced reasoning) |
| Frequency | After Scout + News complete each cycle |
| Reads | Last 30 min of `agent_messages` from Scout + News |
| Outputs | `TradeThesis` — `{ ticker, action, size_hint, conviction, time_horizon, rationale }` |

**Actions:** BUY, SELL, HOLD, REDUCE, EXIT.

**Conviction:** 0–100. Below 50 → Risk Manager skips. Above 75 → eligible for fast-track execution.

**Prompt outline:**
```
You are Strategist — Polly's chief decision-maker. Read recent messages from
Market Scout and News Reader, and produce a trade thesis.

  Scout findings (last 30 min): {scout_messages}
  News catalysts (last 30 min): {news_messages}
  Current portfolio: {positions}
  Available cash: {cash}

Decide whether to act on any ticker. Return JSON only:
{
  "theses": [
    {
      "ticker": "...",
      "action": "BUY|SELL|HOLD|REDUCE|EXIT",
      "size_hint_pct": 0-100,    // % of available capital
      "conviction": 0-100,
      "time_horizon": "intraday|swing|position",
      "rationale": "<3 sentences>",
      "supporting_messages": [<ids>],
      "risks": ["<risk 1>", "<risk 2>"]
    }
  ]
}
```

---

## 4. Risk Manager

**Role:** Approves or vetoes Strategist's theses. Calculates position size and stop-loss. Enforces portfolio constraints.

| Property | Value |
|---|---|
| LLM | Gemini 2.0 Flash (fast checks) |
| Frequency | After Strategist outputs each cycle |
| Reads | Strategist thesis + portfolio state + market volatility (Scout's ATR) |
| Outputs | `RiskDecision` — `{ thesis_id, approved, position_size, stop_loss, take_profit, reason }` |

**Hard rules (enforced before LLM call):**
- Max single position: 15% of portfolio
- Max sector exposure: 30%
- Max open positions: 8
- Min conviction to trade: 50
- No new positions if portfolio drawdown > 8% today

**Prompt outline:**
```
You are Risk Manager. Decide whether to approve this trade thesis.

  Thesis: {thesis}
  Portfolio: {positions}
  Cash: {cash}
  Today P&L: {pnl_today}
  Volatility (ATR): {atr}

Hard rules already check passed: position limit, sector exposure, drawdown.
Your job: size the position via Kelly-criterion-lite + set stop-loss / take-profit.

Return JSON only:
{
  "approved": true|false,
  "position_size_shares": <integer>,
  "stop_loss_price": <number or null>,
  "take_profit_price": <number or null>,
  "reason": "<1 sentence>"
}
```

---

## 5. Executor

**Role:** Places approved trades on Alpaca's paper trading API.

| Property | Value |
|---|---|
| LLM | Gemini 2.0 Flash (only to format pre-trade narration; trade itself is deterministic) |
| Frequency | After Risk Manager approves a thesis |
| Reads | RiskDecision |
| Outputs | `TradeFilled` — `{ ticker, side, qty, fill_price, alpaca_order_id } |

**Implementation:** Mostly deterministic code. The LLM only generates the human-readable pre-trade narration ("Executing buy of 5 TSLA @ market…").

```typescript
async function execute(decision: RiskDecision): Promise<TradeFilled> {
  const order = await alpaca.placeOrder({
    symbol: decision.ticker,
    qty: decision.position_size_shares,
    side: decision.action === 'BUY' ? 'buy' : 'sell',
    type: 'market',
    time_in_force: 'day',
    stop_loss: decision.stop_loss_price
      ? { stop_price: decision.stop_loss_price } : undefined,
    take_profit: decision.take_profit_price
      ? { limit_price: decision.take_profit_price } : undefined,
  });
  return { ticker: order.symbol, side: order.side, qty: order.filled_qty,
           fill_price: order.filled_avg_price, alpaca_order_id: order.id };
}
```

---

## 6. Narrator (bonus agent — for dashboard storytelling)

**Role:** Translates the full agent cycle into plain English for the dashboard's "Live Agent Chat" panel.

| Property | Value |
|---|---|
| LLM | Gemini 2.0 Flash |
| Frequency | After every cycle, AND on big P&L events (>1% move) |
| Reads | All messages from the most recent cycle |
| Outputs | `NarratorEvent[]` — `{ tone, headline, body, timestamp }` |

**Why it exists:** demo magic. Watching agent JSON scroll by is boring. Watching Polly *talk through what's happening* is engaging.

**Prompt outline:**
```
You are Narrator — Polly's voice. Read the full agent cycle below and write a
short, punchy commentary for our trading dashboard. Tone: confident,
quantitative, slightly dry humor allowed.

  Scout: {scout_messages}
  News: {news_messages}
  Strategist: {thesis}
  Risk: {risk_decision}
  Executor: {fills}

Write 1-3 sentences. JSON only:
{ "tone": "bullish|bearish|cautious|neutral", "headline": "...", "body": "..." }
```

---

## Agent message bus schema

All agents read/write to a shared `agent_messages` Postgres table:

```typescript
type AgentMessage = {
  id: string;                    // ULID
  cycle_id: string;              // groups all messages in one orchestrator run
  agent: 'scout' | 'news_reader' | 'strategist' | 'risk_manager' | 'executor' | 'narrator';
  parent_id: string | null;      // for threading
  urgency: 'low' | 'med' | 'high';
  content: object;               // typed per agent (see above)
  created_at: Date;
};
```

This is what makes the demo's "agent debate" visualization possible — every reaction is a row, threaded by `parent_id`.
