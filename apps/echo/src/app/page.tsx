import Link from "next/link";
import {
  ArrowRight,
  Headphones,
  MessageSquare,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";

const AGENTS = [
  {
    name: "Action Extractor",
    blurb: "Pulls every commitment, decision, and blocker from the transcript.",
    stack: "Featherless · Llama 3.1",
    color: "border-l-cyan-400",
  },
  {
    name: "Stakeholder Classifier",
    blurb: "Identifies who's in the room. Maps speakers to your CRM.",
    stack: "Featherless · Llama 3.1",
    color: "border-l-violet-400",
  },
  {
    name: "Decision Maker",
    blurb: "Synthesizes a workflow plan: what to do across each tool.",
    stack: "Gemini 2.0 Pro",
    color: "border-l-amber-400",
  },
  {
    name: "Comms Drafter",
    blurb: "Polishes tone-calibrated copy for emails, Slack, and Linear.",
    stack: "Gemini 2.0 Flash",
    color: "border-l-emerald-400",
  },
  {
    name: "Executor",
    blurb: "Fires real API calls. Every action linked to its source audio.",
    stack: "Deterministic + Gemini narration",
    color: "border-l-lime-400",
  },
];

const PROOF = [
  {
    icon: Headphones,
    label: "Auto-capture",
    text: "Recall.ai joins your Zoom, Meet, or Teams calls without an app to open.",
  },
  {
    icon: Zap,
    label: "Real execution",
    text: "Real updates to HubSpot, Linear, Gmail, and Slack — not just summaries.",
  },
  {
    icon: ShieldCheck,
    label: "Auditable memory",
    text: "Click any action → see the 30-second snippet + agent debate that caused it.",
  },
  {
    icon: MessageSquare,
    label: "Searchable",
    text: "Ask 'what did Sarah say about pricing?' — get an exact moment, instantly.",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 -z-10 opacity-30"
          style={{
            background:
              "radial-gradient(ellipse at top, rgba(163, 230, 53, 0.15), transparent 60%)",
          }}
          aria-hidden
        />
        <div className="mx-auto max-w-5xl px-6 pb-24 pt-24 sm:pt-32">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-lime-900/50 bg-lime-950/40 px-3 py-1 text-xs font-medium text-lime-300">
            <Sparkles size={12} /> Milan AI Week · 2026
          </div>
          <h1 className="max-w-3xl text-5xl font-bold leading-tight tracking-tight sm:text-6xl">
            By the time you leave the meeting,{" "}
            <span className="text-lime-400">the work is done.</span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-400">
            ECHO is an autonomous multi-agent workflow autopilot. A bot joins
            your calls automatically. Five specialist agents extract, decide,
            and execute across your CRM, email, tasks, and Slack. Every action
            is auditable to the moment in audio that caused it.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Link
              href="/dashboard"
              className="group inline-flex items-center gap-2 rounded-lg bg-lime-500 px-6 py-3 text-sm font-medium text-slate-950 transition hover:bg-lime-400"
            >
              See the live dashboard
              <ArrowRight
                size={16}
                className="transition group-hover:translate-x-0.5"
              />
            </Link>
            <Link
              href="/dashboard/search"
              className="inline-flex items-center gap-2 rounded-lg border border-slate-800 px-6 py-3 text-sm font-medium text-slate-200 transition hover:border-slate-700 hover:bg-slate-900"
            >
              Try meeting search
            </Link>
            <a
              href="https://github.com/thisisaman408/echo"
              target="_blank"
              rel="noreferrer"
              className="text-sm text-slate-400 hover:text-lime-400"
            >
              View source ↗
            </a>
          </div>
        </div>
      </section>

      {/* Proof grid */}
      <section className="mx-auto max-w-5xl px-6 py-16">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {PROOF.map((p) => {
            const Icon = p.icon;
            return (
              <div
                key={p.label}
                className="rounded-xl border border-slate-800 bg-slate-900 p-6"
              >
                <Icon size={22} className="text-lime-400" />
                <div className="mt-3 text-sm font-medium uppercase tracking-widest text-slate-500">
                  {p.label}
                </div>
                <p className="mt-1 text-slate-200">{p.text}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Agents */}
      <section className="mx-auto max-w-5xl px-6 py-16">
        <div className="mb-10">
          <div className="text-xs font-medium uppercase tracking-widest text-lime-400">
            The pipeline
          </div>
          <h2 className="mt-2 text-3xl font-bold tracking-tight">
            Five specialist agents. One outcome.
          </h2>
          <p className="mt-2 max-w-2xl text-slate-400">
            Each agent has one job. They coordinate by writing to a shared
            message bus. Every step is replayable.
          </p>
        </div>
        <ol className="space-y-3">
          {AGENTS.map((a, i) => (
            <li
              key={a.name}
              className={`rounded-xl border border-slate-800 border-l-4 bg-slate-900 p-5 ${a.color}`}
            >
              <div className="flex items-baseline gap-4">
                <span className="font-mono text-xs text-slate-500">
                  0{i + 1}
                </span>
                <div>
                  <div className="font-medium text-slate-100">{a.name}</div>
                  <p className="mt-1 text-sm text-slate-400">{a.blurb}</p>
                  <div className="mt-2 font-mono text-xs text-slate-500">
                    {a.stack}
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* Sponsor stack */}
      <section className="border-t border-slate-900">
        <div className="mx-auto max-w-5xl px-6 py-12">
          <div className="text-xs font-medium uppercase tracking-widest text-slate-500">
            Powered by
          </div>
          <div className="mt-4 flex flex-wrap items-baseline gap-6 text-sm text-slate-400">
            <span>
              <span className="text-slate-200">Vultr</span> — Tokyo VM + Object
              Storage
            </span>
            <span>
              <span className="text-slate-200">Gemini 2.0</span> — Decision +
              Comms
            </span>
            <span>
              <span className="text-slate-200">Featherless</span> — Extraction
              agents
            </span>
            <span>
              <span className="text-slate-200">Speechmatics</span> —
              Diarized transcription
            </span>
            <span>
              <span className="text-slate-200">Recall.ai</span> — Meeting bot
            </span>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-900">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-6 text-xs text-slate-500">
          <span>MIT licensed · Open source</span>
          <span>Built by Aman Kumar</span>
        </div>
      </footer>
    </main>
  );
}
