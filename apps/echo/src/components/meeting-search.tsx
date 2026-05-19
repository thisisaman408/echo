"use client";

import Link from "next/link";
import { useState } from "react";

type SearchHit = {
  transcriptId: string;
  meetingId: string;
  speaker: string;
  speakerName: string | null;
  startSec: number;
  endSec: number;
  text: string;
  meetingTitle: string | null;
  score: number;
};

export function MeetingSearch() {
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [hits, setHits] = useState<SearchHit[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function runSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!q.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ q, limit: 20 }),
      });
      if (!res.ok) throw new Error(`Search failed: ${res.status}`);
      const data = (await res.json()) as { results: SearchHit[] };
      setHits(data.results);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <form onSubmit={runSearch} className="mb-6 flex gap-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="What did Sarah say about pricing?"
          className="flex-1 rounded-lg border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-lime-500 focus:outline-none"
        />
        <button
          type="submit"
          disabled={loading || !q.trim()}
          className="rounded-lg bg-lime-500 px-5 py-3 text-sm font-medium text-slate-950 hover:bg-lime-400 disabled:cursor-not-allowed disabled:bg-slate-800 disabled:text-slate-500"
        >
          {loading ? "Searching…" : "Search"}
        </button>
      </form>

      {error && (
        <div className="mb-4 rounded-lg border border-rose-900 bg-rose-950/40 p-3 text-sm text-rose-300">
          {error}
        </div>
      )}

      {hits !== null && hits.length === 0 && (
        <div className="rounded-lg border border-dashed border-slate-800 p-6 text-center text-sm text-slate-500">
          No matches in your meeting history.
        </div>
      )}

      {hits && hits.length > 0 && (
        <ul className="space-y-3">
          {hits.map((h) => (
            <li
              key={h.transcriptId}
              className="rounded-lg border border-slate-800 bg-slate-900 p-4"
            >
              <div className="mb-2 flex items-baseline justify-between">
                <Link
                  href={`/dashboard/meetings/${h.meetingId}#t-${h.transcriptId}`}
                  className="text-sm font-medium text-slate-100 hover:text-lime-400"
                >
                  {h.meetingTitle ?? h.meetingId.slice(0, 8)}
                </Link>
                <div className="flex items-center gap-3 font-mono text-xs text-slate-500">
                  <span>{h.speakerName ?? h.speaker}</span>
                  <span>
                    {Math.floor(h.startSec)}s
                  </span>
                  <span className="rounded bg-slate-800 px-1.5 py-0.5 text-slate-400">
                    {h.score.toFixed(3)}
                  </span>
                </div>
              </div>
              <p className="text-sm text-slate-200">{h.text}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
