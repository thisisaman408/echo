"use client";

import { useEffect, useMemo, useState } from "react";

type AgentMessage = {
  id: string;
  agent:
    | "action_extractor"
    | "stakeholder_classifier"
    | "decision_maker"
    | "comms_drafter"
    | "executor";
  content: unknown;
  durationMs: number | null;
  createdAt: string;
};

const AGENT_LABELS: Record<AgentMessage["agent"], string> = {
  action_extractor: "Action Extractor",
  stakeholder_classifier: "Stakeholder Classifier",
  decision_maker: "Decision Maker",
  comms_drafter: "Comms Drafter",
  executor: "Executor",
};

const AGENT_ACCENT: Record<AgentMessage["agent"], string> = {
  action_extractor: "border-l-cyan-400",
  stakeholder_classifier: "border-l-violet-400",
  decision_maker: "border-l-amber-400",
  comms_drafter: "border-l-emerald-400",
  executor: "border-l-lime-400",
};

export function AgentFeed({
  meetingId,
  initial = [],
}: {
  meetingId: string;
  initial?: AgentMessage[];
}) {
  const [messages, setMessages] = useState<AgentMessage[]>(initial);

  useEffect(() => {
    const seen = new Set(initial.map((m) => m.id));
    const es = new EventSource(`/api/sse/agents?meetingId=${meetingId}`);
    es.onmessage = (e) => {
      if (!e.data) return;
      try {
        const msg = JSON.parse(e.data) as AgentMessage;
        if (seen.has(msg.id)) return;
        seen.add(msg.id);
        setMessages((prev) => [...prev, msg]);
      } catch {
        /* ignore */
      }
    };
    return () => es.close();
  }, [meetingId, initial]);

  const sorted = useMemo(
    () =>
      [...messages].sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      ),
    [messages],
  );

  if (sorted.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-slate-800 p-8 text-center text-sm text-slate-500">
        Waiting for agents…
      </div>
    );
  }

  return (
    <ol className="space-y-3">
      {sorted.map((m) => (
        <li
          key={m.id}
          className={`rounded-lg border border-slate-800 border-l-4 bg-slate-900 p-4 ${
            AGENT_ACCENT[m.agent]
          }`}
        >
          <div className="mb-2 flex items-center justify-between">
            <div className="font-medium text-slate-100">
              {AGENT_LABELS[m.agent]}
            </div>
            <div className="font-mono text-xs text-slate-500">
              {m.durationMs ? `${(m.durationMs / 1000).toFixed(2)}s` : ""}
            </div>
          </div>
          <pre className="max-h-64 overflow-auto rounded bg-slate-950 p-3 text-xs text-slate-300">
            {JSON.stringify(m.content, null, 2)}
          </pre>
        </li>
      ))}
    </ol>
  );
}
