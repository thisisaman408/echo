"use client";

import { useEffect, useState } from "react";

export type ExecutedAction = {
  id: string;
  integration: "hubspot" | "linear" | "slack" | "gmail";
  actionType: string;
  externalId: string | null;
  externalUrl: string | null;
  status: "pending" | "success" | "failed" | "skipped";
  errorMessage: string | null;
  payload: unknown;
  sourceTranscriptId: string | null;
  agentMessageId: string | null;
  createdAt: string;
};

const INTEGRATION_LABEL: Record<ExecutedAction["integration"], string> = {
  hubspot: "HubSpot",
  linear: "Linear",
  slack: "Slack",
  gmail: "Gmail",
};

const STATUS_PILL: Record<ExecutedAction["status"], string> = {
  pending: "bg-slate-800 text-slate-300",
  success: "bg-lime-900 text-lime-300",
  failed: "bg-rose-950 text-rose-300",
  skipped: "bg-amber-950 text-amber-300",
};

export function ActionList({
  meetingId,
  initial = [],
  onSelect,
}: {
  meetingId: string;
  initial?: ExecutedAction[];
  onSelect?: (a: ExecutedAction) => void;
}) {
  const [actions, setActions] = useState<ExecutedAction[]>(initial);

  useEffect(() => {
    const seen = new Set(initial.map((a) => a.id));
    const es = new EventSource(`/api/sse/actions?meetingId=${meetingId}`);
    es.onmessage = (e) => {
      if (!e.data) return;
      try {
        const a = JSON.parse(e.data) as ExecutedAction;
        if (seen.has(a.id)) return;
        seen.add(a.id);
        setActions((prev) => [a, ...prev]);
      } catch {
        /* ignore */
      }
    };
    return () => es.close();
  }, [meetingId, initial]);

  if (actions.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-slate-800 p-6 text-center text-sm text-slate-500">
        No actions executed yet.
      </div>
    );
  }

  return (
    <ul className="space-y-2">
      {actions.map((a) => (
        <li
          key={a.id}
          className="rounded-lg border border-slate-800 bg-slate-900 p-3 transition hover:border-slate-700"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-slate-100">
                {INTEGRATION_LABEL[a.integration]} · {a.actionType}
              </div>
              {a.externalUrl ? (
                <a
                  href={a.externalUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="font-mono text-xs text-lime-400 hover:underline"
                >
                  {a.externalId ?? "open"}
                </a>
              ) : (
                <div className="font-mono text-xs text-slate-500">
                  {a.externalId ?? "—"}
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_PILL[a.status]}`}
              >
                {a.status}
              </span>
              {onSelect && (
                <button
                  type="button"
                  onClick={() => onSelect(a)}
                  className="rounded border border-slate-700 px-2 py-0.5 text-xs text-slate-300 hover:border-lime-500 hover:text-lime-400"
                >
                  Why?
                </button>
              )}
            </div>
          </div>
          {a.errorMessage && (
            <div className="mt-2 rounded bg-rose-950/40 p-2 text-xs text-rose-300">
              {a.errorMessage}
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}
