import Link from "next/link";
import { desc } from "drizzle-orm";
import { db } from "@/db/client";
import { meetings } from "@/db/schema";
import { StartBotForm } from "@/components/start-bot-form";
import { LogoutButton } from "@/components/logout-button";

export const dynamic = "force-dynamic";

const STATUS_BADGE: Record<string, string> = {
  scheduled: "bg-slate-800 text-slate-300",
  recording: "bg-emerald-950 text-emerald-300 animate-pulse",
  processing: "bg-amber-950 text-amber-300",
  complete: "bg-lime-900 text-lime-300",
  failed: "bg-rose-950 text-rose-300",
};

export default async function DashboardPage() {
  const recent = await db
    .select()
    .from(meetings)
    .orderBy(desc(meetings.createdAt))
    .limit(20);

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <header className="mb-12 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">ECHO</h1>
            <p className="text-sm text-slate-400">
              Autonomous meeting workflow autopilot
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard/search"
              className="text-sm text-slate-400 hover:text-lime-400"
            >
              Search
            </Link>
            <Link
              href="/"
              className="text-sm text-slate-400 hover:text-lime-400"
            >
              Home
            </Link>
            <LogoutButton />
          </div>
        </header>

        <StartBotForm />

        <section>
          <h2 className="mb-4 text-sm font-medium uppercase tracking-widest text-slate-500">
            Meeting history
          </h2>
          {recent.length === 0 ? (
            <div className="rounded-lg border border-slate-800 bg-slate-900 p-8 text-center text-slate-400">
              <p className="mb-2">No meetings yet.</p>
              <p className="text-sm">
                Paste a Zoom or Meet URL above and hit "Send bot" to get started.
              </p>
            </div>
          ) : (
            <ul className="space-y-3">
              {recent.map((m) => (
                <li
                  key={m.id}
                  className="rounded-lg border border-slate-800 bg-slate-900 p-4 transition hover:border-slate-700"
                >
                  <Link
                    href={`/dashboard/meetings/${m.id}`}
                    className="flex items-baseline justify-between gap-4"
                  >
                    <div className="min-w-0">
                      <div className="truncate font-medium text-slate-100">
                        {m.title ?? m.meetingUrl}
                      </div>
                      <div className="mt-1 font-mono text-xs text-slate-500">
                        {new Date(m.createdAt).toLocaleString()} · {m.id}
                      </div>
                    </div>
                    <span
                      className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        STATUS_BADGE[m.status] ?? STATUS_BADGE.scheduled
                      }`}
                    >
                      {m.status}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}
