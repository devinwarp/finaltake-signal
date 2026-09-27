import type { QueryId, RawVideo, SearchGroups, SearchInput } from "./oriane";
import { QUERY_IDS } from "./oriane";

interface Evidence {
  sentence: string;
  time: string | null;
}

export interface SignalVideo {
  id: string;
  url: string;
  platform: "tiktok" | "instagram" | "other";
  sourceQueries: QueryId[];
  handle: string;
  followers: number | null;
  date: string | null;
  views: number | null;
  language: string | null;
  caption: string;
  transcript: string;
  evidenceSentence: string | null;
  evidenceTime: string | null;
  needIds: string[];
}

interface QueryMetrics {
  id: QueryId;
  label: string;
  query: string;
  fetchedVideos: number;
  relevantVideos: number;
  needVideos: number;
  needCreators: number;
  needVideoShare: number;
  needCreatorShare: number;
}

interface Need {
  id: string;
  label: string;
  complaintLines: string[];
  videoCount: number;
  creatorCount: number;
  totalViews: number;
  medianViews: number;
  queryMetrics: QueryMetrics[];
}

const STOPWORDS = new Set(["a", "an", "and", "at", "by", "for", "from", "in", "of", "on", "or", "the", "to", "with"]);
const NEGATES_ISSUE = /\b(?:no|not|never|without|non|don'?t|didn'?t|doesn'?t|isn'?t|won'?t|zero)\b/i;

function normalizeText(text: string): string {
  return text.toLocaleLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").replace(/\s+/g, " ").trim();
}

function containsPhrase(text: string, phrase: string): boolean {
  const normalized = normalizeText(text);
  const target = normalizeText(phrase);
  return !!target && ` ${normalized} `.includes(` ${target} `);
}

function topicToken(word: string): string {
  if (word.length > 4 && word.endsWith("ies")) return `${word.slice(0, -3)}y`;
  if (word.length > 4 && word.endsWith("s") && !word.endsWith("ss")) return word.slice(0, -1);
  return word;
}

function topicalWords(category: string): string[] {
  // Search context ("in heat", "for small kitchens") narrows the query but
  // does not have to be repeated in the creator's complaint sentence.
  const subject = normalizeText(category).split(/\b(?:in|on|for|with|during|under|at)\b/u)[0];
  return subject.split(" ")
    .filter((word) => word.length >= 3 && !STOPWORDS.has(word))
    .map(topicToken);
}

function speaksAboutQuery(text: string, sourceIds: QueryId[], input: SearchInput): boolean {
  if (!text.trim()) return false;
  const terms = topicalWords(input.category);
  const spoken = new Set(normalizeText(text).split(" ").map(topicToken));
  if (terms.length && terms.filter((term) => spoken.has(term)).length >= Math.min(2, terms.length)) {
    return true;
  }
  return sourceIds.some((id) => {
    if (id === "heat") return false;
    const phrases = id === "control" ? input.control.split(/\s*\+\s*/) : [input[id]];
    return phrases.some((phrase) => containsPhrase(text, phrase));
  });
}

function isNegated(text: string, issue: RegExp): boolean {
  return NEGATES_ISSUE.test(text) &&
    new RegExp(`${NEGATES_ISSUE.source}.{0,36}${issue.source}`, "i").test(text);
}

const THEMES: Array<{ id: string; label: string; matches: (text: string) => boolean }> = [
  {
    id: "sweat_reapply",
    label: "Heat or moisture makes use and reapplication difficult",
    matches: (text) =>
      /\b(sweat|heat|hot|humid|rain|moisture)\b/i.test(text) &&
      /\b(reappl\w*|use it again|wear\w* off|melt\w*|slip\w*|drip\w*|smear\w*)\b/i.test(text) &&
      /\b(need|have to|must|keep|constant\w*|can'?t|hard|melt\w*|slip\w*|drip\w*|wear\w* off)\b/i.test(text),
  },
  {
    id: "skin_reaction",
    label: "It causes a skin reaction or breakouts",
    matches: (text) => /\b(break(?:s|ing)? out|breakouts?|acne|pimples?|clog\w* pores?|rash)\b/i.test(text) &&
      /\b(made|makes?|gave|gives?|caus\w*|trigger\w*|from|because of|clog\w* pores?)\b/i.test(text) &&
      !/\b(?:no|not|never|without|don'?t|didn'?t|doesn'?t|isn'?t|won'?t|helps?|prevent\w*|clear\w*)\b.{0,40}\b(?:break|acne|pimple|clog|rash)\w*/i.test(text),
  },
  {
    id: "discomfort",
    label: "It feels uncomfortable or irritating",
    matches: (text) => /\b(sting\w*|burn\w*|itch\w*|irritat\w*|painful|hurt\w*|uncomfortable)\b/i.test(text) &&
      !isNegated(text, /\b(?:sting|burn|itch|irritat|hurt|uncomfortable)\w*/),
  },
  {
    id: "compatibility",
    label: "It does not work well with other products or routines",
    matches: (text) => /\b(pilling|pills? (?:with|under|on|up)|clumps? (?:with|under|on|up)|balls? up|doesn'?t mix|won'?t work with|incompatible|doesn'?t fit)\b/i.test(text) &&
      !isNegated(text, /\b(?:pilling|pills?|clumps?|balls? up)\b/),
  },
  {
    id: "appearance",
    label: "The look or feel is not quite right",
    matches: (text) => /\b(white cast|chalky|ashy|ghostly|too (?:greasy|oily|sticky|shiny)|feels? (?:so |too )?(?:greasy|oily|sticky)|greasy (?:finish|feeling)|sticky (?:finish|feeling)|streaky|looks? bad|unflattering)\b/i.test(text) &&
      !isNegated(text, /\b(?:white cast|chalky|ashy|ghostly|greasy|oily|sticky|shiny|streaky)\b/),
  },
  {
    id: "price",
    label: "The price or value is a barrier",
    matches: (text) => /\b(too expensive|pricey|overpriced|costs? too much|can'?t afford|not worth (?:the|its) price|too costly)\b/i.test(text),
  },
  {
    id: "availability",
    label: "It is difficult to find or buy",
    matches: (text) => /\b(sold out|out of stock|can'?t find|hard to find|never available|unavailable everywhere)\b/i.test(text),
  },
  {
    id: "durability",
    label: "It does not hold up in everyday use",
    matches: (text) => /\b(doesn'?t last|didn'?t last|wear\w* off|fad\w* quickly|falls? apart|fell apart|breaks? (?:so |too )?(?:easily|quickly)|leaks?|peels? off|melt\w*|runs? out too fast|stops? working)\b/i.test(text),
  },
  {
    id: "performance",
    label: "It does not perform as expected",
    matches: (text) => /\b(doesn'?t work|didn'?t work|not working|no difference|doesn'?t help|fails? to|not effective|ineffective|not enough)\b/i.test(text),
  },
  {
    id: "repeat_use",
    label: "Repeating or maintaining the routine is difficult",
    matches: (text) => /\b(reappl\w*|refill\w*|recharg\w*|redo|use it again)\b/i.test(text) &&
      /\b(hard|difficult|annoy\w*|can'?t|need|constant\w*|keep)\b/i.test(text),
  },
  {
    id: "usability",
    label: "Using it in real life is harder than expected",
    matches: (text) => /\b(hard to|difficult to|struggl\w*|awkward|messy|tricky|too heavy|too small|too big|won'?t fit|can'?t use)\b/i.test(text),
  },
];

function stringValue(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function numberValue(value: unknown): number | null {
  const number = Number(value);
  return value !== null && value !== undefined && value !== "" &&
    Number.isFinite(number) && number >= 0 ? Math.floor(number) : null;
}

function dateValue(value: unknown): string | null {
  const date = new Date(stringValue(value));
  return Number.isNaN(date.valueOf()) ? null : date.toISOString();
}

function instagramShortcode(id: string): string | null {
  if (!/^\d+$/.test(id)) return /^[a-zA-Z0-9_-]+$/.test(id) ? id : null;
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";
  let value = BigInt(id);
  let code = "";
  while (value > 0n) {
    code = alphabet[Number(value % 64n)] + code;
    value /= 64n;
  }
  return code || null;
}

function videoUrl(raw: RawVideo, platform: SignalVideo["platform"], handle: string): string | null {
  const provided = stringValue(raw.url);
  if (provided) {
    try {
      const url = new URL(provided);
      if (url.protocol === "https:" &&
        ((platform === "tiktok" && /(^|\.)tiktok\.com$/.test(url.hostname)) ||
          (platform === "instagram" && /(^|\.)instagram\.com$/.test(url.hostname)))) {
        return url.toString();
      }
    } catch {
      // Fall through to the platform permalink constructed from documented IDs.
    }
  }
  const platformId = stringValue(raw.platformId);
  if (!platformId) return null;
  if (platform === "tiktok" && /^\d+$/.test(platformId)) {
    return `https://www.tiktok.com/@${encodeURIComponent(handle.replace(/^@/, ""))}/video/${platformId}`;
  }
  if (platform === "instagram") {
    const code = instagramShortcode(platformId);
    return code ? `https://www.instagram.com/reel/${code}/` : null;
  }
  return null;
}

function formatTime(seconds: number): string {
  const whole = Math.floor(seconds);
  return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, "0")}`;
}

function transcriptSegments(raw: RawVideo, transcript: string): Evidence[] {
  if (Array.isArray(raw.transcriptChunks) && raw.transcriptChunks.length) {
    return raw.transcriptChunks.flatMap((item) => {
      if (!item || typeof item !== "object") return [];
      const chunk = item as Record<string, unknown>;
      const text = stringValue(chunk.text);
      if (!text) return [];
      const start = Number(chunk.startSeconds);
      return [{ sentence: text, time: Number.isFinite(start) && start >= 0 ? formatTime(start) : null }];
    });
  }
  const matches = [...transcript.matchAll(/\((\d{1,2}:\d{2}(?::\d{2})?)\)\s*/g)];
  if (matches.length) {
    return matches.map((match, index) => ({
      time: match[1],
      sentence: transcript.slice((match.index ?? 0) + match[0].length, matches[index + 1]?.index ?? transcript.length).trim(),
    })).filter((item) => !!item.sentence);
  }
  return transcript.match(/[^.!?؟。]+[.!?؟。]?/gu)
    ?.map((sentence) => ({ sentence: sentence.trim(), time: null }))
    .filter((item) => !!item.sentence) ?? [];
}

function pickComplaint(
  raw: RawVideo, transcript: string, sourceIds: QueryId[], input: SearchInput,
): { theme: typeof THEMES[number]; evidence: Evidence } | null {
  const segments = transcriptSegments(raw, transcript);
  // Adjacent transcript chunks often split one sentence at a timestamp. Their
  // words are joined, but never rewritten, so evidence remains a verbatim quote.
  for (const theme of THEMES) {
    for (let index = 0; index < segments.length; index++) {
      const current = segments[index];
      let sentence = "";
      for (let length = 1; length <= 3 && index + length <= segments.length; length++) {
        sentence = [sentence, segments[index + length - 1].sentence].filter(Boolean).join(" ");
        if (sentence.length > 420) break;
        // A complaint needs the searched brand or category in the nearby spoken
        // excerpt; a caption hit followed by an unrelated remark is not proof.
        if (speaksAboutQuery(sentence, sourceIds, input) && theme.matches(sentence)) {
          return { theme, evidence: { sentence, time: current.time } };
        }
      }
    }
  }
  return null;
}

function normalizeVideo(raw: RawVideo, sources: QueryId[], input: SearchInput): SignalVideo | null {
  const platform = stringValue(raw.platform).toLowerCase();
  if (platform !== "tiktok" && platform !== "instagram") return null;
  const transcript = stringValue(raw.transcript);
  if (!speaksAboutQuery(transcript, sources, input)) return null;
  const handle = stringValue(raw.profileHandle ?? raw.handle);
  if (!handle) return null;
  const url = videoUrl(raw, platform, handle);
  if (!url) return null;
  const id = stringValue(raw.id) || url;
  return {
    id,
    url,
    platform,
    sourceQueries: sources,
    handle: handle.startsWith("@") ? handle : `@${handle}`,
    followers: numberValue(raw.profileFollowersCount ?? raw.followers),
    date: dateValue(raw.publishedAt ?? raw.date),
    views: numberValue(raw.viewsCount ?? raw.views),
    language: stringValue(raw.transcriptLanguage ?? raw.language) || null,
    caption: stringValue(raw.caption),
    transcript,
    evidenceSentence: null,
    evidenceTime: null,
    needIds: [],
  };
}

function countCreators(videos: SignalVideo[]): number {
  return new Set(videos.map((video) => `${video.platform}:${video.handle.toLowerCase()}`)).size;
}

function queryMetrics(
  id: QueryId,
  input: SearchInput,
  fetchedVideos: number,
  videos: SignalVideo[],
  needId: string | null,
): QueryMetrics {
  const query = id === "heat" ? input.category : input[id];
  const label = id === "competitor" ? "Brand B" : id === "control" ? "Control brands" :
    id === "heat" ? "Category" : input.brand;
  const relevant = videos.filter((video) => video.sourceQueries.includes(id));
  const needVideos = relevant.filter((video) => needId && video.needIds.includes(needId));
  return {
    id, label, query: id === "competitor" ? "Brand B" : id === "control" ? "Control brands" : query,
    fetchedVideos, relevantVideos: relevant.length, needVideos: needVideos.length,
    needCreators: countCreators(needVideos),
    needVideoShare: relevant.length ? needVideos.length / relevant.length : 0,
    needCreatorShare: countCreators(relevant) ? countCreators(needVideos) / countCreators(relevant) : 0,
  };
}

function median(numbers: number[]): number {
  if (!numbers.length) return 0;
  const sorted = [...numbers].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
}

export function analyzeSignal(groups: SearchGroups, input: SearchInput, source: "live" | "backup", fallbackReason: string | null) {
  const videoRows = new Map<string, { raw: RawVideo; sources: Set<QueryId> }>();
  for (const id of QUERY_IDS) {
    for (const raw of groups[id].slice(0, 200)) {
      const key = `${stringValue(raw.platform)}:${stringValue(raw.id) || stringValue(raw.url)}`;
      if (!key || key === ":") continue;
      const existing = videoRows.get(key);
      if (existing) {
        existing.sources.add(id);
      } else {
        videoRows.set(key, { raw, sources: new Set([id]) });
      }
    }
  }
  const videos: SignalVideo[] = [];
  for (const { raw, sources } of videoRows.values()) {
    const video = normalizeVideo(raw, [...sources], input);
    if (!video) continue;
    const match = pickComplaint(raw, video.transcript, video.sourceQueries, input);
    if (match) {
      video.needIds = [match.theme.id];
      video.evidenceSentence = match.evidence.sentence;
      video.evidenceTime = match.evidence.time;
    }
    videos.push(video);
  }

  const needs: Need[] = THEMES.map(({ id, label }) => {
    const evidence = videos.filter((video) => video.needIds.includes(id));
    return {
      id, label,
      complaintLines: evidence.map((video) => video.evidenceSentence).filter((line): line is string => !!line).slice(0, 4),
      videoCount: evidence.length,
      creatorCount: countCreators(evidence),
      totalViews: evidence.reduce((sum, video) => sum + (video.views ?? 0), 0),
      medianViews: median(evidence.map((video) => video.views).filter((count): count is number => count !== null)),
      queryMetrics: QUERY_IDS.map((queryId) => queryMetrics(queryId, input, groups[queryId].length, videos, id)),
    };
  }).filter((need) => need.videoCount > 0)
    .sort((a, b) => b.creatorCount - a.creatorCount || b.videoCount - a.videoCount);

  const heroNeedId = needs[0]?.id ?? null;
  const queries = QUERY_IDS.map((id) => queryMetrics(id, input, groups[id].length, videos, heroNeedId));
  const heat = queries.find((item) => item.id === "heat")!;
  const ordinary = queries.filter((item) => item.id !== "heat");
  const ordinaryDenominator = ordinary.reduce((sum, item) => sum + item.relevantVideos, 0);
  const ordinaryNumerator = ordinary.reduce((sum, item) => sum + item.needVideos, 0);

  return {
    source, fallbackReason, queries, videos, needs, heroNeedId,
    totalRelevantVideos: videos.length,
    heatNeedVideoShare: heat.needVideoShare,
    ordinaryNeedVideoShare: ordinaryDenominator ? ordinaryNumerator / ordinaryDenominator : 0,
  };
}