import { and, asc, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db/client";
import { agentMessages, executedActions, transcripts } from "@/db/schema";
import * as hubspot from "@/integrations/hubspot";
import * as linear from "@/integrations/linear";
import * as slack from "@/integrations/slack";
import * as gmail from "@/integrations/gmail";
import { env } from "@/lib/env";
import { actionItemSchema } from "./action-extractor";
import type { Workflow } from "./decision-maker";

const actionExtractorContentSchema = z.object({
  actions: z.array(actionItemSchema).default([]),
});

/**
 * For an action at a given start_sec, find the transcript segment that
 * contains it. Used so executed_actions can back-link to the audio moment
 * that triggered them — the heart of the audit drill-down UX.
 */
async function findSourceTranscriptId(
  meetingId: string,
  sourceStartSec: number,
): Promise<string | null> {
  const rows = await db
    .select()
    .from(transcripts)
    .where(eq(transcripts.meetingId, meetingId))
    .orderBy(asc(transcripts.startSec));
  for (const r of rows) {
    if (r.startSec <= sourceStartSec && sourceStartSec <= r.endSec) {
      return r.id;
    }
  }
  // Fall back to nearest neighbor by startSec distance.
  let best: { id: string; distance: number } | null = null;
  for (const r of rows) {
    const d = Math.abs(r.startSec - sourceStartSec);
    if (!best || d < best.distance) best = { id: r.id, distance: d };
  }
  return best?.id ?? null;
}

type ExecutorResultRow = {
  integration: "hubspot" | "linear" | "slack" | "gmail";
  status: "success" | "failed" | "skipped";
  externalId?: string | null;
  reason?: string;
};

export type ExecutorResult = {
  results: ExecutorResultRow[];
  durationMs: number;
};

export async function runExecutor(
  meetingId: string,
  workflow: Workflow,
  agentMessageId: string,
): Promise<ExecutorResult> {
  const t0 = Date.now();

  // Pull Action Extractor's actions so we can map source_action_index → source_start_sec
  const [actionRow] = await db
    .select()
    .from(agentMessages)
    .where(
      and(
        eq(agentMessages.meetingId, meetingId),
        eq(agentMessages.agent, "action_extractor"),
      ),
    )
    .orderBy(asc(agentMessages.createdAt))
    .limit(1);
  const actions = actionRow
    ? actionExtractorContentSchema.parse(actionRow.content).actions
    : [];

  const sourceTranscriptForIndex = async (
    idx: number,
  ): Promise<string | null> => {
    if (idx < 0 || idx >= actions.length) return null;
    return findSourceTranscriptId(meetingId, actions[idx].source_start_sec);
  };

  const results: ExecutorResultRow[] = [];

  // ── HubSpot ────────────────────────────────────────────────────────────
  for (const h of workflow.hubspot_updates) {
    const sourceTranscriptId = await sourceTranscriptForIndex(
      h.source_action_index,
    );
    try {
      const deals = await hubspot.searchDeals(h.deal_search_hint);
      const deal = deals[0];
      if (!deal) {
        await db.insert(executedActions).values({
          meetingId,
          agentMessageId,
          sourceTranscriptId,
          integration: "hubspot",
          actionType: "deal_update",
          payload: h,
          status: "skipped",
          errorMessage: `No deal matched query: ${h.deal_search_hint}`,
        });
        results.push({
          integration: "hubspot",
          status: "skipped",
          reason: "no_match",
        });
        continue;
      }
      if (h.stage_change) {
        await hubspot.updateDealStage(deal.id, h.stage_change);
      }
      for (const note of h.notes) {
        await hubspot.createDealNote(deal.id, note);
      }
      await db.insert(executedActions).values({
        meetingId,
        agentMessageId,
        sourceTranscriptId,
        integration: "hubspot",
        actionType: "deal_update",
        externalId: deal.id,
        externalUrl: `https://app.hubspot.com/contacts/_/deal/${deal.id}`,
        payload: h,
        result: { dealId: deal.id, notesAdded: h.notes.length },
        status: "success",
      });
      results.push({
        integration: "hubspot",
        status: "success",
        externalId: deal.id,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      await db.insert(executedActions).values({
        meetingId,
        agentMessageId,
        sourceTranscriptId,
        integration: "hubspot",
        actionType: "deal_update",
        payload: h,
        status: "failed",
        errorMessage: message,
      });
      results.push({
        integration: "hubspot",
        status: "failed",
        reason: message,
      });
    }
  }

  // ── Linear ─────────────────────────────────────────────────────────────
  for (const issue of workflow.linear_issues) {
    const sourceTranscriptId = await sourceTranscriptForIndex(
      issue.source_action_index,
    );
    try {
      const created = await linear.createIssue({
        title: issue.title,
        description: issue.description,
        priority: issue.priority,
        assigneeEmail: issue.assignee_email_hint,
      });
      await db.insert(executedActions).values({
        meetingId,
        agentMessageId,
        sourceTranscriptId,
        integration: "linear",
        actionType: "create_issue",
        externalId: created.id,
        externalUrl: created.url,
        payload: issue,
        result: { identifier: created.identifier },
        status: "success",
      });
      results.push({
        integration: "linear",
        status: "success",
        externalId: created.id,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      await db.insert(executedActions).values({
        meetingId,
        agentMessageId,
        sourceTranscriptId,
        integration: "linear",
        actionType: "create_issue",
        payload: issue,
        status: "failed",
        errorMessage: message,
      });
      results.push({
        integration: "linear",
        status: "failed",
        reason: message,
      });
    }
  }

  // ── Gmail ──────────────────────────────────────────────────────────────
  for (const draft of workflow.gmail_drafts) {
    const sourceTranscriptId = await sourceTranscriptForIndex(
      draft.source_action_index,
    );
    try {
      const created = await gmail.createDraft({
        to: draft.to,
        subject: draft.subject,
        bodyMarkdown: draft.body_markdown,
      });
      await db.insert(executedActions).values({
        meetingId,
        agentMessageId,
        sourceTranscriptId,
        integration: "gmail",
        actionType: "create_draft",
        externalId: created.id,
        externalUrl: created.id
          ? `https://mail.google.com/mail/u/0/#drafts/${created.id}`
          : null,
        payload: draft,
        result: created,
        status: "success",
      });
      results.push({
        integration: "gmail",
        status: "success",
        externalId: created.id,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      await db.insert(executedActions).values({
        meetingId,
        agentMessageId,
        sourceTranscriptId,
        integration: "gmail",
        actionType: "create_draft",
        payload: draft,
        status: "failed",
        errorMessage: message,
      });
      results.push({
        integration: "gmail",
        status: "failed",
        reason: message,
      });
    }
  }

  // ── Slack summary ──────────────────────────────────────────────────────
  if (workflow.slack_summary) {
    const channelHint = env.ECHO_DEFAULT_SLACK_CHANNEL;
    try {
      await slack.postSummary({
        headline: workflow.slack_summary.headline,
        bullets: workflow.slack_summary.bullets,
      });
      await db.insert(executedActions).values({
        meetingId,
        agentMessageId,
        integration: "slack",
        actionType: "post_message",
        payload: { ...workflow.slack_summary, channel: channelHint },
        status: "success",
      });
      results.push({ integration: "slack", status: "success" });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      await db.insert(executedActions).values({
        meetingId,
        agentMessageId,
        integration: "slack",
        actionType: "post_message",
        payload: workflow.slack_summary,
        status: "failed",
        errorMessage: message,
      });
      results.push({
        integration: "slack",
        status: "failed",
        reason: message,
      });
    }
  }

  const durationMs = Date.now() - t0;

  await db.insert(agentMessages).values({
    meetingId,
    agent: "executor",
    urgency: results.some((r) => r.status === "failed") ? "high" : "med",
    content: { results, durationMs },
    parentId: agentMessageId,
    durationMs,
  });

  return { results, durationMs };
}
