import { z } from "zod";
import { env } from "@/lib/env";

/**
 * HubSpot CRM client. DEMO_MODE uses a Private App token (Authorization:
 * Bearer …). The same client works for OAuth mode — only the token source
 * changes. We keep the surface tight: 4 ops cover the demo flows.
 */

const BASE = "https://api.hubapi.com";

const headers = () => ({
  Authorization: `Bearer ${env.HUBSPOT_PRIVATE_TOKEN}`,
  "Content-Type": "application/json",
});

const contactSchema = z.object({
  id: z.string(),
  properties: z
    .object({
      email: z.string().optional(),
      firstname: z.string().optional().nullable(),
      lastname: z.string().optional().nullable(),
    })
    .partial()
    .optional(),
});

const dealSchema = z.object({
  id: z.string(),
  properties: z.record(z.string(), z.unknown()).optional(),
});

const dealSearchSchema = z.object({
  total: z.number().optional(),
  results: z.array(dealSchema).default([]),
});

const noteSchema = z.object({
  id: z.string(),
});

export type UpsertContactInput = {
  email: string;
  firstname?: string;
  lastname?: string;
};

/**
 * Upsert a contact by email. HubSpot's PATCH ?idProperty=email creates if
 * missing and updates if present.
 */
export async function upsertContact(input: UpsertContactInput) {
  const url = `${BASE}/crm/v3/objects/contacts/${encodeURIComponent(
    input.email,
  )}?idProperty=email`;
  const body = {
    properties: {
      email: input.email,
      ...(input.firstname ? { firstname: input.firstname } : {}),
      ...(input.lastname ? { lastname: input.lastname } : {}),
    },
  };
  const res = await fetch(url, {
    method: "PATCH",
    headers: headers(),
    body: JSON.stringify(body),
  });
  if (res.status === 404) {
    const create = await fetch(`${BASE}/crm/v3/objects/contacts`, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify(body),
    });
    if (!create.ok) {
      throw new Error(`HubSpot create contact failed: ${await create.text()}`);
    }
    return contactSchema.parse(await create.json());
  }
  if (!res.ok) {
    throw new Error(`HubSpot upsertContact failed: ${await res.text()}`);
  }
  return contactSchema.parse(await res.json());
}

export async function updateDealStage(dealId: string, stage: string) {
  const res = await fetch(`${BASE}/crm/v3/objects/deals/${dealId}`, {
    method: "PATCH",
    headers: headers(),
    body: JSON.stringify({ properties: { dealstage: stage } }),
  });
  if (!res.ok) {
    throw new Error(`HubSpot updateDealStage failed: ${await res.text()}`);
  }
  return dealSchema.parse(await res.json());
}

/**
 * Create a note and associate it with a deal. Association type id 213 is
 * "note → deal" per HubSpot's well-known association type catalog.
 */
export async function createDealNote(dealId: string, body: string) {
  const noteRes = await fetch(`${BASE}/crm/v3/objects/notes`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({
      properties: {
        hs_note_body: body,
        hs_timestamp: Date.now(),
      },
    }),
  });
  if (!noteRes.ok) {
    throw new Error(`HubSpot createNote failed: ${await noteRes.text()}`);
  }
  const note = noteSchema.parse(await noteRes.json());
  const assocRes = await fetch(
    `${BASE}/crm/v3/objects/notes/${note.id}/associations/deals/${dealId}/213`,
    { method: "PUT", headers: headers() },
  );
  if (!assocRes.ok) {
    throw new Error(`HubSpot associate note failed: ${await assocRes.text()}`);
  }
  return note;
}

/**
 * Free-text search across deals. We use the v3 search endpoint with the
 * `query` field, which fuzzy-matches across deal name and properties.
 */
export async function searchDeals(query: string, limit = 5) {
  const res = await fetch(`${BASE}/crm/v3/objects/deals/search`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({
      query,
      limit,
      sorts: [{ propertyName: "hs_lastmodifieddate", direction: "DESCENDING" }],
    }),
  });
  if (!res.ok) {
    throw new Error(`HubSpot searchDeals failed: ${await res.text()}`);
  }
  return dealSearchSchema.parse(await res.json()).results;
}
