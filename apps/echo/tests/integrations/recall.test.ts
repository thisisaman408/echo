import { afterEach, describe, expect, it, vi } from "vitest";
import {
  getRecordingDownloadUrl,
  startBot,
} from "@/integrations/recall";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("recall.startBot", () => {
  it("POSTs to the regional bot endpoint with a Token auth header", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ id: "bot_123" }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const bot = await startBot("https://zoom.us/j/abc123");

    expect(bot.id).toBe("bot_123");
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("https://ap-northeast-1.recall.ai/api/v1/bot");
    expect(init.method).toBe("POST");
    expect(init.headers.Authorization).toMatch(/^Token /);
    expect(init.headers["Content-Type"]).toBe("application/json");
    const body = JSON.parse(init.body);
    expect(body.meeting_url).toBe("https://zoom.us/j/abc123");
    expect(body.bot_name).toBe("ECHO");
    expect(body.webhook_url).toContain("/api/recall/webhook");
  });

  it("throws with the upstream error body when Recall returns !ok", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 402,
      text: async () => "Insufficient credit",
      json: async () => ({}),
    });
    vi.stubGlobal("fetch", fetchMock);

    await expect(startBot("https://zoom.us/j/x")).rejects.toThrow(
      /Recall startBot failed: 402.*Insufficient credit/,
    );
  });
});

describe("recall.getRecordingDownloadUrl", () => {
  it("returns the v2 media_shortcuts URL when present", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        id: "bot_xyz",
        recordings: [
          {
            id: "rec_1",
            media_shortcuts: {
              video_mixed: {
                data: { download_url: "https://cdn.recall.ai/v2/file.mp4" },
              },
            },
          },
        ],
      }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const url = await getRecordingDownloadUrl("bot_xyz");
    expect(url).toBe("https://cdn.recall.ai/v2/file.mp4");
  });

  it("falls back to the legacy video_url when recordings is absent", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        id: "bot_xyz",
        video_url: "https://cdn.recall.ai/v1/file.mp4",
      }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const url = await getRecordingDownloadUrl("bot_xyz");
    expect(url).toBe("https://cdn.recall.ai/v1/file.mp4");
  });

  it("returns null when neither field is set", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ id: "bot_xyz" }),
    });
    vi.stubGlobal("fetch", fetchMock);

    expect(await getRecordingDownloadUrl("bot_xyz")).toBeNull();
  });
});
