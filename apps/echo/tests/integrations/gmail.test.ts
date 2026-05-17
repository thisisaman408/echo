import { describe, expect, it } from "vitest";
import { buildRawMime } from "@/integrations/gmail";

describe("gmail.buildRawMime", () => {
  it("builds a base64url-encoded RFC822 message with the expected headers", () => {
    const raw = buildRawMime({
      to: "sarah@acme.com",
      subject: "Follow up — pricing",
      bodyMarkdown: "Hi Sarah,\n\nFollowing up on pricing.\n\n— ECHO",
    });
    const decoded = Buffer.from(raw, "base64url").toString("utf8");
    expect(decoded).toContain("To: sarah@acme.com");
    expect(decoded).toContain("Subject: Follow up — pricing");
    expect(decoded).toContain("Content-Type: text/plain; charset=utf-8");
    expect(decoded).toContain("Following up on pricing.");
  });

  it("includes a custom From: header when provided", () => {
    const raw = buildRawMime({
      to: "x@y.co",
      subject: "Hello",
      bodyMarkdown: "Hi",
      from: "founder@echo.app",
    });
    const decoded = Buffer.from(raw, "base64url").toString("utf8");
    expect(decoded).toContain("From: founder@echo.app");
  });

  it("uses CRLF line separators per RFC822", () => {
    const raw = buildRawMime({
      to: "x@y.co",
      subject: "X",
      bodyMarkdown: "Body",
    });
    const decoded = Buffer.from(raw, "base64url").toString("utf8");
    expect(decoded).toContain("\r\n");
  });
});
