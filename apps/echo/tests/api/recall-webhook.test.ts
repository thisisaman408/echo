import { beforeEach, describe, expect, it, vi } from "vitest";
import { Webhook } from "svix";

vi.mock("@/db/client", () => ({
  db: {
    update: vi.fn(() => ({
      set: vi.fn(() => ({
        where: vi.fn(async () => undefined),
      })),
    })),
  },
}));

vi.mock("@/lib/inngest", () => ({
  inngest: {
    send: vi.fn(async () => undefined),
  },
}));

const { POST } = await import("@/app/api/recall/webhook/route");
const { inngest } = await import("@/lib/inngest");

function buildSignedRequest(body: object, secret: string) {
  const payload = JSON.stringify(body);
  const id = "msg_test_123";
  const timestamp = Math.floor(Date.now() / 1000).toString();
  // Svix sign uses the same encoding the verifier expects.
  const wh = new Webhook(secret);
  const signature = wh.sign(id, new Date(Number(timestamp) * 1000), payload);
  return new Request("http://localhost/api/recall/webhook", {
    method: "POST",
    headers: {
      "svix-id": id,
      "svix-timestamp": timestamp,
      "svix-signature": signature,
      "content-type": "application/json",
    },
    body: payload,
  });
}

describe("recall webhook signature verification", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects requests without Svix headers with 401", async () => {
    const req = new Request("http://localhost/api/recall/webhook", {
      method: "POST",
      body: JSON.stringify({ event: "recording.done" }),
    });
    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it("rejects requests with a bad signature with 401", async () => {
    const body = JSON.stringify({ event: "recording.done", data: {} });
    const req = new Request("http://localhost/api/recall/webhook", {
      method: "POST",
      headers: {
        "svix-id": "msg_x",
        "svix-timestamp": "1700000000",
        "svix-signature": "v1,not-a-real-signature",
      },
      body,
    });
    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it("accepts a valid recording.done event and dispatches Inngest", async () => {
    const body = {
      event: "recording.done",
      data: {
        bot_id: "bot_abc",
        recording: { id: "rec_1", url: "https://cdn.recall.ai/rec_1.mp4" },
      },
    };
    const req = buildSignedRequest(body, process.env.RECALL_WEBHOOK_SECRET!);
    const res = await POST(req);
    expect(res.status).toBe(200);
    expect(inngest.send).toHaveBeenCalledWith({
      name: "echo/meeting.recording_done",
      data: {
        recallBotId: "bot_abc",
        recordingUrl: "https://cdn.recall.ai/rec_1.mp4",
      },
    });
  });

  it("accepts a valid bot.status_change event without dispatching Inngest", async () => {
    const body = {
      event: "bot.status_change",
      data: {
        bot_id: "bot_abc",
        status: { code: "in_call_recording" },
      },
    };
    const req = buildSignedRequest(body, process.env.RECALL_WEBHOOK_SECRET!);
    const res = await POST(req);
    expect(res.status).toBe(200);
    expect(inngest.send).not.toHaveBeenCalled();
  });
});
