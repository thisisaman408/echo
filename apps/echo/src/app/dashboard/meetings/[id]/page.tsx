import Link from "next/link";
import { notFound } from "next/navigation";
import { asc, eq } from "drizzle-orm";
import { db } from "@/db/client";
import {
  agentMessages,
  executedActions,
  meetings,
  transcripts,
} from "@/db/schema";
import { AgentFeed } from "@/components/agent-feed";
import { ActionList } from "@/components/action-card";

export const dynamic = "force-dynamic";

type Params = { id: string };

export default async function MeetingDetailPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { id } = await params;
  const [meeting] = await db
    .select()
    .from(meetings)
    .where(eq(meetings.id, id))
    .limit(1);
  if (!meeting) notFound();

  const [segs, agentRows, actionRows] = await Promise.all([
    db
      .select()
      .from(transcripts)
      .where(eq(transcripts.meetingId, meeting.id))
      .orderBy(asc(transcripts.startSec)),
    db
      .select()
      .from(agentMessages)
      .where(eq(agentMessages.meetingId, meeting.id))
      .orderBy(asc(agentMessages.createdAt)),
    db
      .select()
      .from(executedActions)
      .where(eq(executedActions.meetingId, meeting.id))
      .orderBy(asc(executedActions.createdAt)),
  ]);

  const serializableAgents = agentRows.map((r) => ({
    ...r,
    createdAt: r.createdAt.toISOString(),
  }));
  const serializableActions = actionRows.map((r) => ({
    ...r,
    createdAt: r.createdAt.toISOString(),
  }));

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <header className="mb-8 flex items-baseline justify-between">
          <div>
            <Link
              href="/dashboard"
              className="text-sm text-slate-400 hover:text-lime-400"
            >
              ← All meetings
            </Link>
            <h1 className="mt-3 text-2xl font-bold tracking-tight">
              {meeting.title ?? meeting.meetingUrl}
            </h1>
            <p className="mt-1 font-mono text-xs text-slate-500">
              {meeting.id} · status {meeting.status}
            </p>
          </div>
        </header>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <section>
            <h2 className="mb-3 text-sm font-medium uppercase tracking-widest text-slate-500">
              Agent feed
            </h2>
            <AgentFeed
              meetingId={meeting.id}
              initial={serializableAgents}
            />
          </section>

          <section>
            <h2 className="mb-3 text-sm font-medium uppercase tracking-widest text-slate-500">
              Executed actions
            </h2>
            <ActionList
              meetingId={meeting.id}
              initial={serializableActions}
            />
          </section>
        </div>

        <section className="mt-12">
          <h2 className="mb-3 text-sm font-medium uppercase tracking-widest text-slate-500">
            Transcript
          </h2>
          {segs.length === 0 ? (
            <div className="rounded-lg border border-dashed border-slate-800 p-6 text-center text-sm text-slate-500">
              No transcript yet.
            </div>
          ) : (
            <ol className="space-y-2">
              {segs.map((s) => (
                <li
                  key={s.id}
                  className="rounded border border-slate-800 bg-slate-900 p-3"
                >
                  <div className="flex items-baseline gap-3">
                    <span className="rounded bg-slate-800 px-2 py-0.5 font-mono text-xs text-slate-300">
                      {s.speakerName ?? s.speaker}
                    </span>
                    <span className="font-mono text-xs text-slate-500">
                      {s.startSec}s – {s.endSec}s
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-slate-200">{s.text}</p>
                </li>
              ))}
            </ol>
          )}
        </section>
      </div>
    </main>
  );
}
