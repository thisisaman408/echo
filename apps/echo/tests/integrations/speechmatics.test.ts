import { describe, expect, it } from "vitest";
import { collapseToSegments } from "@/integrations/speechmatics";

describe("speechmatics.collapseToSegments", () => {
  it("merges consecutive same-speaker words into one segment", () => {
    const segments = collapseToSegments([
      { start_time: 0, end_time: 0.5, alternatives: [{ content: "Hi", speaker: "S1" }] },
      { start_time: 0.5, end_time: 1.0, alternatives: [{ content: "everyone", speaker: "S1" }] },
      { start_time: 1.2, end_time: 1.6, alternatives: [{ content: "Hello", speaker: "S2" }] },
    ]);
    expect(segments).toEqual([
      { speaker: "S1", startSec: 0, endSec: 1.0, text: "Hi everyone" },
      { speaker: "S2", startSec: 1.2, endSec: 1.6, text: "Hello" },
    ]);
  });

  it("returns empty when no words", () => {
    expect(collapseToSegments([])).toEqual([]);
  });

  it("labels unattributed words as UU", () => {
    const segments = collapseToSegments([
      { start_time: 0, end_time: 0.5, alternatives: [{ content: "yo" }] },
    ]);
    expect(segments[0].speaker).toBe("UU");
  });

  it("skips entries with no content", () => {
    const segments = collapseToSegments([
      { start_time: 0, end_time: 0.5, alternatives: [{ content: "" }] },
      { start_time: 0.5, end_time: 1, alternatives: [{ content: "hi", speaker: "S1" }] },
    ]);
    expect(segments).toEqual([
      { speaker: "S1", startSec: 0.5, endSec: 1, text: "hi" },
    ]);
  });
});
