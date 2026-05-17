import { serve } from "inngest/next";
import { inngest } from "@/lib/inngest";
import { processRecording, runAgents } from "@/agents/orchestrator";

export const runtime = "nodejs";

/**
 * Inngest serve handler. Local dev: run `npx inngest-cli dev` alongside
 * `pnpm dev` and it auto-discovers this route. Production: register the
 * deployment URL with Inngest Cloud once env keys are configured.
 */
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [processRecording, runAgents],
});
