import { IncomingWebhook } from "@slack/webhook";
import { env } from "@/lib/env";

/**
 * Slack via incoming webhook (DEMO_MODE). One webhook = one channel. For
 * multi-tenant mode (post-hackathon) we swap to OAuth + chat.postMessage.
 */

let _hook: IncomingWebhook | null = null;
function hook(): IncomingWebhook {
  if (_hook) return _hook;
  _hook = new IncomingWebhook(env.SLACK_WEBHOOK_URL);
  return _hook;
}

export type SlackSummaryInput = {
  headline: string;
  bullets: string[];
  meetingLink?: string;
};

type SlackBlock =
  | {
      type: "header";
      text: { type: "plain_text"; text: string };
    }
  | {
      type: "section";
      text: { type: "mrkdwn"; text: string };
    }
  | {
      type: "context";
      elements: Array<{ type: "mrkdwn"; text: string }>;
    };

export async function postSummary(input: SlackSummaryInput) {
  const blocks: SlackBlock[] = [
    {
      type: "header",
      text: { type: "plain_text", text: input.headline.slice(0, 150) },
    },
  ];
  for (const b of input.bullets) {
    blocks.push({
      type: "section",
      text: { type: "mrkdwn", text: `• ${b}` },
    });
  }
  if (input.meetingLink) {
    blocks.push({
      type: "context",
      elements: [
        {
          type: "mrkdwn",
          text: `<${input.meetingLink}|View in ECHO>`,
        },
      ],
    });
  }
  // @slack/webhook expects @slack/types Block[] which is a heavy union;
  // our minimal SlackBlock is structurally compatible at runtime.
  await hook().send({
    text: input.headline,
    blocks: blocks as unknown as Parameters<IncomingWebhook["send"]>[0] extends infer P
      ? P extends { blocks?: infer B }
        ? B
        : never
      : never,
  });
  return { posted: true };
}
