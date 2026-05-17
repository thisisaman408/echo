import { describe, expect, it } from "vitest";
import {
  actionExtractorOutputSchema,
  actionItemSchema,
} from "@/agents/action-extractor";
import { formatTranscriptForExtractor } from "@/agents/prompts/action-extractor";

describe("actionItemSchema", () => {
  it("accepts a fully-populated action item", () => {
    const parsed = actionItemSchema.parse({
      type: "commitment",
      description: "Send the SAML proposal to Sarah by Friday",
      owner_hint: "S1",
      due_hint: "by Friday",
      source_speaker: "S1",
      source_start_sec: 42,
      source_end_sec: 47,
      verbatim_quote: "I'll send the SAML proposal by Friday",
    });
    expect(parsed.type).toBe("commitment");
  });

  it("rejects unknown action types", () => {
    expect(() =>
      actionItemSchema.parse({
        type: "miscellaneous",
        description: "x",
        owner_hint: "S1",
        due_hint: null,
        source_speaker: "S1",
        source_start_sec: 0,
        source_end_sec: 1,
        verbatim_quote: "x",
      }),
    ).toThrow();
  });

  it("allows null due_hint", () => {
    const parsed = actionItemSchema.parse({
      type: "action_item",
      description: "Follow up",
      owner_hint: "unknown",
      due_hint: null,
      source_speaker: "S2",
      source_start_sec: 100,
      source_end_sec: 105,
      verbatim_quote: "follow up",
    });
    expect(parsed.due_hint).toBeNull();
  });
});

describe("actionExtractorOutputSchema", () => {
  it("accepts an empty actions array", () => {
    expect(actionExtractorOutputSchema.parse({ actions: [] })).toEqual({
      actions: [],
    });
  });
});

describe("formatTranscriptForExtractor", () => {
  it("formats segments with speaker + integer second window", () => {
    const formatted = formatTranscriptForExtractor([
      { speaker: "S1", startSec: 0.5, endSec: 4.3, text: "Hello" },
      { speaker: "S2", startSec: 5.1, endSec: 9.9, text: "Hi" },
    ]);
    expect(formatted).toBe("[S1 0-4s]: Hello\n[S2 5-9s]: Hi");
  });
});
