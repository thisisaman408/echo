import Link from "next/link";
import { MeetingSearch } from "@/components/meeting-search";

export const dynamic = "force-dynamic";

export default function SearchPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-4xl px-6 py-12">
        <header className="mb-8">
          <Link
            href="/dashboard"
            className="text-sm text-slate-400 hover:text-lime-400"
          >
            ← Dashboard
          </Link>
          <h1 className="mt-3 text-2xl font-bold tracking-tight">
            Search your meetings
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Semantic search across every transcript ECHO has captured.
          </p>
        </header>
        <MeetingSearch />
      </div>
    </main>
  );
}
