"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function StartBotForm() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const [msg, setMsg] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!url.trim()) return;
    setStatus("loading");
    setMsg("");
    try {
      const res = await fetch("/api/bots/start", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ meetingUrl: url.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed");
      setStatus("ok");
      setMsg("Bot dispatched — it will join within 10 seconds.");
      setUrl("");
      setTimeout(() => {
        setStatus("idle");
        router.refresh();
      }, 3000);
    } catch (err) {
      setStatus("error");
      setMsg(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  return (
    <form onSubmit={submit} className="mb-10 rounded-xl border border-slate-800 bg-slate-900 p-6">
      <h2 className="mb-4 text-sm font-medium uppercase tracking-widest text-slate-500">
        Start a meeting bot
      </h2>
      <div className="flex gap-3">
        <input
          type="url"
          placeholder="https://zoom.us/j/... or meet.google.com/..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="flex-1 rounded-lg border border-slate-700 bg-slate-950 px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 outline-none focus:border-lime-500 focus:ring-1 focus:ring-lime-500"
        />
        <button
          type="submit"
          disabled={status === "loading" || !url.trim()}
          className="rounded-lg bg-lime-500 px-5 py-2.5 text-sm font-medium text-slate-950 transition hover:bg-lime-400 disabled:opacity-50"
        >
          {status === "loading" ? "Dispatching…" : "Send bot"}
        </button>
      </div>
      {msg && (
        <p className={`mt-3 text-xs ${status === "ok" ? "text-lime-400" : "text-rose-400"}`}>
          {msg}
        </p>
      )}
    </form>
  );
}
