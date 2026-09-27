export type QueryId = "brand" | "competitor" | "control" | "heat";

export interface SearchInput {
  brand: string;
  competitor: string;
  control: string;
  category: string;
}

export type RawVideo = Record<string, unknown>;
export type SearchGroups = Record<QueryId, RawVideo[]>;

export const DEFAULT_SEARCH: SearchInput = {
  brand: "Beauty of Joseon",
  competitor: "Neutrogena",
  control: "Nivea Sun + Skin1004",
  category: "sunscreen in heat",
};

export const QUERY_IDS: QueryId[] = ["brand", "competitor", "control", "heat"];

function searchTerms(id: QueryId, query: string): { values: string[]; operator: "and" | "or" } {
  if (id === "control") {
    return {
      values: query.split(/\s*\+\s*/).map((part) => part.trim()).filter(Boolean),
      operator: "or",
    };
  }
  if (id === "heat") {
    return {
      values: query.split(/\s+/).filter((term) => term && !/^(in|and|the|with|for|of)$/i.test(term)),
      operator: "and",
    };
  }
  return { values: [query.trim()], operator: "or" };
}

function buildRequest(id: QueryId, query: string) {
  const terms = searchTerms(id, query);
  if (!terms.values.length) throw new Error("A search query must contain a searchable term");
  const exactMatch = { includesExactly: terms };

  return {
    name: id,
    operator: "and",
    filters: {
      platform: { includes: ["tiktok", "instagram"] },
      format: { includes: ["video"] },
      publishedAt: {
        after: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
      },
    },
    queries: [{
      operator: "or",
      filters: {
        transcript: exactMatch,
        caption: exactMatch,
      },
    }],
  };
}

async function fetchPage(
  key: string,
  id: QueryId,
  query: string,
  offset: number,
  anchor?: string,
): Promise<{ results: RawVideo[]; totalCount: number; anchor?: string }> {
  const url = new URL("https://connect.oriane.xyz/rest/contents/search");
  url.searchParams.set("projection", "full");
  url.searchParams.set("limit", "100");
  url.searchParams.set("offset", String(offset));
  url.searchParams.set("sort", "publishedAt:desc");
  if (anchor) url.searchParams.set("aiSearchAnchor", anchor);

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify(buildRequest(id, query)),
    signal: AbortSignal.timeout(30000),
  });

  if (!response.ok) {
    throw new Error(`Oriane returned HTTP ${response.status}`);
  }

  const payload: unknown = await response.json();
  if (!payload || typeof payload !== "object") {
    throw new Error("Oriane returned an invalid response");
  }
  const data = (payload as { data?: unknown }).data;
  if (!data || typeof data !== "object" || !Array.isArray((data as { results?: unknown }).results)) {
    throw new Error("Oriane returned a response without video results");
  }
  const metadata = (payload as {
    metadata?: { pagination?: { totalCount?: unknown; aiSearchAnchor?: unknown } };
  }).metadata;
  const results = (data as { results: unknown[] }).results.filter(
    (row): row is RawVideo => !!row && typeof row === "object" && !Array.isArray(row),
  );
  const totalCount = Number(metadata?.pagination?.totalCount);
  return {
    results,
    totalCount: Number.isFinite(totalCount) ? totalCount : offset + results.length,
    anchor: typeof metadata?.pagination?.aiSearchAnchor === "string" ?
      metadata.pagination.aiSearchAnchor : undefined,
  };
}

async function fetchQuery(key: string, id: QueryId, query: string): Promise<RawVideo[]> {
  const first = await fetchPage(key, id, query, 0);
  if (first.results.length < 100 || first.totalCount <= 100) return first.results.slice(0, 200);
  const second = await fetchPage(key, id, query, 100, first.anchor);
  return [...first.results, ...second.results].slice(0, 200);
}

export async function searchOriane(input: SearchInput): Promise<SearchGroups> {
  const key = process.env.ORIANE_API_KEY;
  if (!key) throw new Error("ORIANE_API_KEY is not configured");

  const queries: Record<QueryId, string> = {
    brand: input.brand,
    competitor: input.competitor,
    control: input.control,
    heat: input.category,
  };

  // All four independent queries start together. Failure of any one invalidates
  // the live analysis; a partial result is never presented as category evidence.
  const groups = await Promise.all(
    QUERY_IDS.map((id) => fetchQuery(key, id, queries[id])),
  );
  return Object.fromEntries(QUERY_IDS.map((id, index) => [id, groups[index]])) as SearchGroups;
}

export function isDefaultSearch(input: SearchInput): boolean {
  return QUERY_IDS.every((id) => {
    const field = id === "heat" ? "category" : id;
    return input[field].trim().toLocaleLowerCase() === DEFAULT_SEARCH[field].toLocaleLowerCase();
  });
}