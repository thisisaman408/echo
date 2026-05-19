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

function summarize(agent: AgentMessage["agent"], content: unknown): string {
  try {
    const c = content as Record<string, unknown>;
    if (agent === "action_extractor") {
      const actions = (c.actions as { description: string }[]) ?? [];
      if (actions.length === 0) return "No action items found.";
      return `Found ${actions.length} action item${actions.length > 1 ? "s" : ""}: ${actions.map((a) => a.description).join("; ")}`;
    }
    if (agent === "stakeholder_classifier") {
      const speakers = (c.speakers as { label: string; name_hint: string | null; role: string }[]) ?? [];
      return `Identified ${speakers.length} speaker${speakers.length !== 1 ? "s" : ""}: ${speakers.map((s) => s.name_hint ?? s.label).join(", ")} — action assignments mapped.`;
    }
    if (agent === "decision_maker") {
      const w = c.workflow as Record<string, unknown[]>;
      const parts = [];
      if (w?.hubspot_updates?.length) parts.push(`${w.hubspot_updates.length} HubSpot update${w.hubspot_updates.length > 1 ? "s" : ""}`);
      if (w?.linear_issues?.length) parts.push(`${w.linear_issues.length} Linear issue${w.linear_issues.length > 1 ? "s" : ""}`);
      if (w?.gmail_drafts?.length) parts.push(`${w.gmail_drafts.length} Gmail draft${w.gmail_drafts.length > 1 ? "s" : ""}`);
      if (w?.slack_summary) parts.push("1 Slack summary");
      return `Decided on: ${parts.join(", ") || "no actions required"}.`;
    }
    if (agent === "comms_drafter") {
      const w = c.workflow as Record<string, unknown>;
      const slack = w?.slack_summary as { headline: string } | undefined;
      return slack?.headline ? `Drafted: "${slack.headline}"` : "Communications drafted and ready for execution.";
    }
    if (agent === "executor") {
      const results = (c.results as { integration: string; status: string }[]) ?? [];
      const ok = results.filter((r) => r.status === "success").map((r) => r.integration);
      const fail = results.filter((r) => r.status === "failed").map((r) => r.integration);
      const skip = results.filter((r) => r.status === "skipped").map((r) => r.integration);
      const parts = [];
      if (ok.length) parts.push(`✓ ${ok.join(", ")}`);
      if (fail.length) parts.push(`✗ ${fail.join(", ")}`);
      if (skip.length) parts.push(`— ${skip.join(", ")} skipped`);
      return parts.join("  |  ") || "Execution complete.";
    }
  } catch { /* */ }
  return "Processing complete.";
}

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
          <div className="mb-2 rounded bg-slate-950/60 px-3 py-2 text-sm text-slate-200 italic">
            {summarize(m.agent, m.content)}
          </div>
          <pre className="max-h-48 overflow-auto rounded bg-slate-950 p-3 text-xs text-slate-400">
            {JSON.stringify(m.content, null, 2)}
          </pre>
        </li>
      ))}
    </ol>
  );
}
