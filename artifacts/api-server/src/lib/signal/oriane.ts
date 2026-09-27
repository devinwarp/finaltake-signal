export type QueryId = "brand" | "competitor" | "control" | "heat";

export interface SearchInput {
  brand: string;
  competitor: string;
  control: string;
  category: string;
}

export type RawVideo = Record<string, unknown>;
export interface SearchGroupDiagnostics {
  reportedTotalCount: number | null;
  isPartial: boolean;
}
export interface SampleWindow {
  startAt: string;
  endAt: string;
  days: number;
}
export type SearchGroups = Record<QueryId, RawVideo[]> & {
  diagnostics?: Partial<Record<QueryId, SearchGroupDiagnostics>>;
  sampleWindow?: SampleWindow;
};

const SAMPLE_WINDOW_DAYS = 90;
const PAGE_SIZE = 100;
const MAX_VIDEOS_PER_QUERY = 200;
const PAGE_TIMEOUT_MS = 10_000;
const SEARCH_TIMEOUT_MS = 25_000;

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

function buildRequest(id: QueryId, query: string, startAt: string, endAt: string) {
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
        after: startAt,
        before: endAt,
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
  startAt: string,
  endAt: string,
  searchSignal: AbortSignal,
  anchor?: string,
): Promise<{ results: RawVideo[]; reportedTotalCount: number | null; anchor?: string }> {
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
    body: JSON.stringify(buildRequest(id, query, startAt, endAt)),
    signal: AbortSignal.any([searchSignal, AbortSignal.timeout(PAGE_TIMEOUT_MS)]),
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
  const totalCount = metadata?.pagination?.totalCount;
  const parsedTotalCount = Number(totalCount);
  return {
    results,
    reportedTotalCount: totalCount !== null && totalCount !== undefined &&
      Number.isFinite(parsedTotalCount) && parsedTotalCount >= 0 ? Math.floor(parsedTotalCount) : null,
    anchor: typeof metadata?.pagination?.aiSearchAnchor === "string" ?
      metadata.pagination.aiSearchAnchor : undefined,
  };
}

async function fetchQuery(
  key: string,
  id: QueryId,
  query: string,
  startAt: string,
  endAt: string,
  searchSignal: AbortSignal,
): Promise<{ videos: RawVideo[]; diagnostics: SearchGroupDiagnostics }> {
  const first = await fetchPage(key, id, query, 0, startAt, endAt, searchSignal);
  const firstResults = first.results.slice(0, MAX_VIDEOS_PER_QUERY);
  const hasMore = first.reportedTotalCount !== null
    ? first.reportedTotalCount > first.results.length
    : first.results.length === PAGE_SIZE;

  if (!hasMore || first.results.length < PAGE_SIZE) {
    return {
      videos: firstResults,
      diagnostics: {
        reportedTotalCount: first.reportedTotalCount,
        isPartial: first.reportedTotalCount !== null &&
          first.reportedTotalCount > first.results.length,
      },
    };
  }

  let second: Awaited<ReturnType<typeof fetchPage>>;
  try {
    second = await fetchPage(key, id, query, PAGE_SIZE, startAt, endAt, searchSignal, first.anchor);
  } catch (error) {
    // Preserve a complete first page when only pagination is unavailable. The
    // caller receives an explicit partial flag and never mistakes it for a full sample.
    if (!searchSignal.aborted) {
      return {
        videos: firstResults,
        diagnostics: {
          reportedTotalCount: first.reportedTotalCount,
          isPartial: true,
        },
      };
    }
    throw error;
  }

  const videos = [...first.results, ...second.results].slice(0, MAX_VIDEOS_PER_QUERY);
  const reportedTotalCount = second.reportedTotalCount ?? first.reportedTotalCount;
  return {
    videos,
    diagnostics: {
      reportedTotalCount,
      isPartial: videos.length >= MAX_VIDEOS_PER_QUERY ||
        (reportedTotalCount !== null && reportedTotalCount > videos.length),
    },
  };
}

export async function searchOriane(input: SearchInput): Promise<SearchGroups> {
  const key = process.env.ORIANE_API_KEY;
  if (!key) throw new Error("ORIANE_API_KEY is not configured");
  const endAt = new Date();
  const startAt = new Date(endAt.getTime() - SAMPLE_WINDOW_DAYS * 24 * 60 * 60 * 1000);
  const sampleWindow = {
    startAt: startAt.toISOString(),
    endAt: endAt.toISOString(),
    days: SAMPLE_WINDOW_DAYS,
  };
  const searchSignal = AbortSignal.timeout(SEARCH_TIMEOUT_MS);

  const queries: Record<QueryId, string> = {
    brand: input.brand,
    competitor: input.competitor,
    control: input.control,
    heat: input.category,
  };

  // All four queries share one deadline. A page-two failure is retained as an
  // explicitly partial query; a page-one or overall timeout fails the search.
  const queryResults = await Promise.all(
    QUERY_IDS.map((id) => fetchQuery(key, id, queries[id], sampleWindow.startAt, sampleWindow.endAt, searchSignal)),
  );
  const groups = Object.fromEntries(QUERY_IDS.map((id, index) => [id, queryResults[index].videos])) as Record<QueryId, RawVideo[]>;
  const diagnostics = Object.fromEntries(
    QUERY_IDS.map((id, index) => [id, queryResults[index].diagnostics]),
  ) as Record<QueryId, SearchGroupDiagnostics>;
  return { ...groups, diagnostics, sampleWindow };
}

export function isDefaultSearch(input: SearchInput): boolean {
  return QUERY_IDS.every((id) => {
    const field = id === "heat" ? "category" : id;
    return input[field].trim().toLocaleLowerCase() === DEFAULT_SEARCH[field].toLocaleLowerCase();
  });
}