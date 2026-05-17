import { afterEach, describe, expect, it, vi } from "vitest";
import {
  createDealNote,
  searchDeals,
  updateDealStage,
  upsertContact,
} from "@/integrations/hubspot";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("hubspot.upsertContact", () => {
  it("PATCHes by email and parses the returned contact", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        id: "contact_1",
        properties: { email: "sarah@acme.com", firstname: "Sarah" },
      }),
      text: async () => "",
    });
    vi.stubGlobal("fetch", fetchMock);

    const contact = await upsertContact({
      email: "sarah@acme.com",
      firstname: "Sarah",
    });

    expect(contact.id).toBe("contact_1");
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toMatch(
      /\/crm\/v3\/objects\/contacts\/sarah%40acme\.com\?idProperty=email$/,
    );
    expect(init.method).toBe("PATCH");
  });

  it("falls back to POST create when PATCH returns 404", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: false,
        status: 404,
        text: async () => "",
        json: async () => ({}),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: async () => ({ id: "contact_new", properties: {} }),
        text: async () => "",
      });
    vi.stubGlobal("fetch", fetchMock);

    const c = await upsertContact({ email: "new@a.co" });
    expect(c.id).toBe("contact_new");
    expect(fetchMock.mock.calls[1][1].method).toBe("POST");
  });
});

describe("hubspot.updateDealStage", () => {
  it("PATCHes the deal with the new dealstage property", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ id: "deal_1", properties: { dealstage: "won" } }),
      text: async () => "",
    });
    vi.stubGlobal("fetch", fetchMock);

    const deal = await updateDealStage("deal_1", "won");
    expect(deal.id).toBe("deal_1");
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({
      properties: { dealstage: "won" },
    });
  });
});

describe("hubspot.createDealNote", () => {
  it("creates a note and associates it via type 213", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: "note_1" }),
        text: async () => "",
      })
      .mockResolvedValueOnce({ ok: true, text: async () => "", json: async () => ({}) });
    vi.stubGlobal("fetch", fetchMock);

    const note = await createDealNote("deal_1", "Sync done — see ECHO");
    expect(note.id).toBe("note_1");
    const [assocUrl, assocInit] = fetchMock.mock.calls[1];
    expect(assocUrl).toContain("/associations/deals/deal_1/213");
    expect(assocInit.method).toBe("PUT");
  });
});

describe("hubspot.searchDeals", () => {
  it("POSTs to the v3 search endpoint and returns results array", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        total: 2,
        results: [
          { id: "deal_a", properties: {} },
          { id: "deal_b", properties: {} },
        ],
      }),
      text: async () => "",
    });
    vi.stubGlobal("fetch", fetchMock);

    const deals = await searchDeals("acme expansion", 5);
    expect(deals.map((d) => d.id)).toEqual(["deal_a", "deal_b"]);
    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(body.query).toBe("acme expansion");
    expect(body.limit).toBe(5);
  });
});
