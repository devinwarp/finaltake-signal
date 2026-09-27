import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { Router, type IRouter } from "express";
import { GetSignalConfigResponse, SearchSignalBody, SearchSignalResponse } from "@workspace/api-zod";
import { analyzeSignal } from "../lib/signal/analysis";
import {
  isDefaultSearch, QUERY_IDS, searchOriane,
  type QueryId, type RawVideo, type SearchGroups,
} from "../lib/signal/oriane";

const router: IRouter = Router();

function cacheDirectory(): string {
  const candidates = [
    path.resolve(process.cwd(), "data/cache"),
    path.resolve(process.cwd(), "../../data/cache"),
  ];
  const found = candidates.find((candidate) => existsSync(path.join(candidate, "benefits.json")));
  if (!found) throw new Error("FinalTake Signal cache files are missing");
  return found;
}

async function readCacheFile<T>(name: string): Promise<T> {
  return JSON.parse(await readFile(path.join(cacheDirectory(), name), "utf8")) as T;
}

router.get("/signal/config", async (req, res): Promise<void> => {
  try {
    const config = await readCacheFile<{
      product: string;
      benefits: Array<{ claim: string; source: string; verified: boolean; use_in_ad?: boolean }>;
      never_claim: string[];
    }>("benefits.json");
    res.json(GetSignalConfigResponse.parse({
      product: config.product,
      claims: config.benefits
        .filter((claim) => claim.verified === true && claim.use_in_ad !== false)
        .map((claim) => ({
          claim: claim.claim, source: claim.source, verified: true, useInAd: true,
        })),
      neverClaim: config.never_claim,
    }));
  } catch (error) {
    req.log.error({ error }, "Could not read Signal claim configuration");
    res.status(500).json({ error: "Product claim configuration is unavailable." });
  }
});

async function backupGroups(): Promise<SearchGroups> {
  const rows = await readCacheFile<RawVideo[]>("videos.json");
  if (!Array.isArray(rows)) throw new Error("Backup video file is not an array");
  const subjectFor: Record<QueryId, string> = {
    brand: "brand", competitor: "competitor", control: "control", heat: "category",
  };
  return Object.fromEntries(QUERY_IDS.map((id) => [
    id,
    rows.filter((row) => {
      if (row.subject === subjectFor[id]) return true;
      return Array.isArray(row.subjects) && row.subjects.some(
        (subject) => typeof subject === "string" && subject.startsWith(`${subjectFor[id]}:`),
      );
    }).sort((a, b) => String(b.date ?? "").localeCompare(String(a.date ?? ""))).slice(0, 200),
  ])) as SearchGroups;
}

router.post("/signal/search", async (req, res): Promise<void> => {
  const parsed = SearchSignalBody.safeParse(req.body);
  if (!parsed.success || Object.values(parsed.data ?? {}).some((value) => !value.trim())) {
    res.status(400).json({ error: "Enter a value for all four search queries." });
    return;
  }

  const input = parsed.data;
  try {
    const groups = await searchOriane(input);
    // Never open the cached video data on a successful live search.
    res.json(SearchSignalResponse.parse(analyzeSignal(groups, input, "live", null)));
  } catch (error) {
    req.log.warn({ error }, "Oriane live search failed");
    if (!isDefaultSearch(input)) {
      res.status(502).json({ error: "Oriane search failed. The saved backup is only for the default sunscreen search; retry your custom search later." });
      return;
    }
    try {
      const groups = await backupGroups();
      const reason = error instanceof Error ? error.message : "Oriane is unavailable";
      res.json(SearchSignalResponse.parse(analyzeSignal(
        groups, input, "backup",
        `Oriane live search failed (${reason}). Showing the saved 27 Sep 2026 backup, not live results.`,
      )));
    } catch (cacheError) {
      req.log.error({ error: cacheError }, "Signal backup failed");
      res.status(502).json({ error: "Oriane live search failed and the saved backup is unavailable." });
    }
  }
});

export default router;