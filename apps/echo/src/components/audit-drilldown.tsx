"use client";

import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import type { ExecutedAction } from "./action-card";

type Segment = {
  id: string;
  speaker: string;
  speakerName: string | null;
  startSec: number;
  endSec: number;
  text: string;
};

type AgentRow = {
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

type AuditPayload = {
  action: ExecutedAction;
  sourceSegment: Segment | null;
  contextRange: Segment[];
  agents: AgentRow[];
};

const AGENT_LABEL: Record<AgentRow["agent"], string> = {
  action_extractor: "Action Extractor",
  stakeholder_classifier: "Stakeholder Classifier",
  decision_maker: "Decision Maker",
  comms_drafter: "Comms Drafter",
  executor: "Executor",
};

export function AuditDrilldown({
  action,
  meetingId,
  onClose,
}: {
  action: ExecutedAction;
  meetingId: string;
  onClose: () => void;
}) {
  const [data, setData] = useState<AuditPayload | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [auditRes, audioRes] = await Promise.all([
          fetch(`/api/actions/${action.id}/audit`).then((r) => r.json()),
          fetch(`/api/audio/${meetingId}`).then((r) =>
            r.ok ? r.json() : Promise.resolve(null),
          ),
        ]);
        if (cancelled) return;
        setData(auditRes as AuditPayload);
        setAudioUrl((audioRes as { url?: string } | null)?.url ?? null);
      } catch (err) {
        if (cancelled) return;
        setError((err as Error).message);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [action.id, meetingId]);

  // Seek the audio to the snippet's start time once metadata loads.
  // React Compiler memoizes this for us.
  const handleLoadedMetadata = () => {
    if (data?.sourceSegment && audioRef.current) {
      audioRef.current.currentTime = data.sourceSegment.startSec;
    }
  };

  // Close on Escape.
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-xl border border-slate-800 bg-slate-900 p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 rounded p-1 text-slate-500 hover:bg-slate-800 hover:text-slate-200"
        >
          <X size={18} />
        </button>

        <header className="mb-6">
          <div className="text-xs font-medium uppercase tracking-widest text-lime-400">
            Audit trail
          </div>
          <h2 className="mt-1 text-xl font-bold text-slate-100">
            Why did ECHO {auditVerb(action)}?
          </h2>
          <p className="mt-1 font-mono text-xs text-slate-500">
            {action.integration} · {action.actionType} · {action.id}
          </p>
        </header>

        {error && (
          <div className="mb-4 rounded border border-rose-900 bg-rose-950/40 p-3 text-sm text-rose-300">
            {error}
          </div>
        )}

        {!data && !error && (
          <div className="space-y-3">
            <div className="h-20 animate-pulse rounded bg-slate-800" />
            <div className="h-32 animate-pulse rounded bg-slate-800" />
            <div className="h-32 animate-pulse rounded bg-slate-800" />
          </div>
        )}

        {data && (
          <>
            <section className="mb-6">
              <h3 className="mb-2 text-xs font-medium uppercase tracking-widest text-slate-500">
                Originating moment
              </h3>
              {data.sourceSegment ? (
                <div className="rounded-lg border border-slate-700 bg-slate-950 p-4">
                  <div className="mb-2 flex items-baseline gap-3">
                    <span className="rounded bg-lime-900 px-2 py-0.5 text-xs text-lime-300">
                      {data.sourceSegment.speakerName ??
                        data.sourceSegment.speaker}
                    </span>
                    <span className="font-mono text-xs text-slate-500">
                      {data.sourceSegment.startSec}s –{" "}
                      {data.sourceSegment.endSec}s
                    </span>
                  </div>
                  <p className="text-sm text-slate-100">
                    {data.sourceSegment.text}
                  </p>
                  {audioUrl && (
                    <audio
                      ref={audioRef}
                      onLoadedMetadata={handleLoadedMetadata}
                      src={audioUrl}
                      controls
                      preload="metadata"
                      className="mt-3 w-full"
                    />
                  )}
                </div>
              ) : (
                <div className="rounded border border-dashed border-slate-800 p-4 text-sm text-slate-500">
                  No source transcript linked (Slack summary or aggregate action).
                </div>
              )}
            </section>

            <section className="mb-6">
              <h3 className="mb-2 text-xs font-medium uppercase tracking-widest text-slate-500">
                Agent debate
              </h3>
              <ol className="space-y-2">
                {data.agents.map((a) => (
                  <li
                    key={a.id}
                    className="rounded border border-slate-800 bg-slate-950 p-3"
                  >
                    <div className="mb-1 flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-200">
                        {AGENT_LABEL[a.agent]}
                      </span>
                      <span className="font-mono text-xs text-slate-500">
                        {a.durationMs ? `${(a.durationMs / 1000).toFixed(2)}s` : ""}
                      </span>
                    </div>
                    <pre className="max-h-48 overflow-auto text-xs text-slate-400">
                      {JSON.stringify(a.content, null, 2)}
                    </pre>
                  </li>
                ))}
              </ol>
            </section>

            <section>
              <h3 className="mb-2 text-xs font-medium uppercase tracking-widest text-slate-500">
                Executed payload
              </h3>
              <pre className="max-h-64 overflow-auto rounded border border-slate-800 bg-slate-950 p-3 text-xs text-slate-300">
                {JSON.stringify(data.action.payload, null, 2)}
              </pre>
              {data.action.externalUrl && (
                <a
                  href={data.action.externalUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-block rounded bg-lime-500 px-3 py-1.5 text-xs font-medium text-slate-950 hover:bg-lime-400"
                >
                  Open in {data.action.integration} ↗
                </a>
              )}
            </section>
          </>
        )}
      </div>
    </div>
  );
}

function auditVerb(action: ExecutedAction): string {
  switch (action.integration) {
    case "hubspot":
      return "update HubSpot";
    case "linear":
      return "create this Linear ticket";
    case "gmail":
      return "draft this email";
    case "slack":
      return "post to Slack";
  }
}
