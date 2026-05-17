/**
 * Minimal SSE helpers shared by the agent + action stream routes.
 * We poll Postgres every 1s — for hackathon-scale traffic this is fine and
 * avoids the operational complexity of LISTEN/NOTIFY connections.
 */

export function sseHeaders(): HeadersInit {
  return {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache, no-transform",
    Connection: "keep-alive",
    "X-Accel-Buffering": "no",
  };
}

export function encodeEvent(data: unknown, event?: string): Uint8Array {
  const chunks: string[] = [];
  if (event) chunks.push(`event: ${event}`);
  chunks.push(`data: ${JSON.stringify(data)}`);
  chunks.push("", "");
  return new TextEncoder().encode(chunks.join("\n"));
}

export function pollingStream<T>(opts: {
  intervalMs?: number;
  abortSignal: AbortSignal;
  fetchNew: (since: Date) => Promise<Array<T & { createdAt: Date }>>;
  initialSince?: Date;
}): ReadableStream<Uint8Array> {
  const intervalMs = opts.intervalMs ?? 1000;
  let lastSeen = opts.initialSince ?? new Date(0);
  let cancelled = false;

  return new ReadableStream<Uint8Array>({
    start(controller) {
      const tick = async () => {
        if (cancelled) return;
        try {
          const rows = await opts.fetchNew(lastSeen);
          for (const r of rows) {
            controller.enqueue(encodeEvent(r));
            if (r.createdAt > lastSeen) lastSeen = r.createdAt;
          }
          // Heartbeat comment to keep proxies from closing the connection.
          controller.enqueue(new TextEncoder().encode(`: ping\n\n`));
        } catch (err) {
          controller.enqueue(
            encodeEvent({ error: (err as Error).message }, "error"),
          );
        }
      };
      const interval = setInterval(tick, intervalMs);
      // Fire once immediately so the client doesn't wait `intervalMs` for
      // the first hydration.
      void tick();
      opts.abortSignal.addEventListener("abort", () => {
        cancelled = true;
        clearInterval(interval);
        try {
          controller.close();
        } catch {
          /* already closed */
        }
      });
    },
  });
}
