import { LinearClient } from "@linear/sdk";
import { env } from "@/lib/env";

/**
 * Linear client. We use the SDK because the GraphQL surface for `createIssue`
 * is non-trivial to roll by hand. DEMO_MODE uses a personal API key; OAuth
 * mode swaps the credentials source.
 */

let _client: LinearClient | null = null;
function client(): LinearClient {
  if (_client) return _client;
  _client = new LinearClient({ apiKey: env.LINEAR_API_KEY });
  return _client;
}

const PRIORITY_MAP: Record<"low" | "med" | "high", 0 | 1 | 2 | 3 | 4> = {
  low: 4,
  med: 3,
  high: 2,
};

export type CreateIssueInput = {
  title: string;
  description?: string;
  priority?: "low" | "med" | "high";
  assigneeEmail?: string | null;
  projectId?: string;
};

async function resolveAssigneeId(email: string): Promise<string | undefined> {
  const users = await client().users({
    filter: { email: { eq: email } },
  });
  return users.nodes[0]?.id;
}

export async function createIssue(input: CreateIssueInput) {
  const assigneeId = input.assigneeEmail
    ? await resolveAssigneeId(input.assigneeEmail)
    : undefined;

  const payload = await client().createIssue({
    teamId: env.LINEAR_TEAM_ID,
    title: input.title,
    description: input.description,
    priority: input.priority ? PRIORITY_MAP[input.priority] : undefined,
    assigneeId,
    projectId: input.projectId || env.ECHO_DEFAULT_LINEAR_PROJECT_ID || undefined,
  });

  const issue = await payload.issue;
  if (!issue) {
    throw new Error("Linear createIssue returned no issue");
  }
  return {
    id: issue.id,
    identifier: issue.identifier,
    url: issue.url,
    title: issue.title,
  };
}
