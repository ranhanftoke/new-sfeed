import { XMLParser } from "fast-xml-parser";

import { CATEGORIES, type Category, type Lang } from "./i18n";
import type { Article } from "./news-types";

/** Public RSS/Atom sources per language and category. Failures are tolerated. */
export const FEEDS: Record<Lang, Record<Category, string[]>> = {
  en: {
    world: [
      "https://feeds.bbci.co.uk/news/world/rss.xml",
      "https://www.theguardian.com/world/rss",
      "https://feeds.npr.org/1004/rss.xml",
    ],
    technology: [
      "https://feeds.bbci.co.uk/news/technology/rss.xml",
      "https://www.theverge.com/rss/index.xml",
      "https://techcrunch.com/feed/",
    ],
    business: [
      "https://feeds.bbci.co.uk/news/business/rss.xml",
      "https://www.theguardian.com/uk/business/rss",
    ],
    sports: [
      "https://feeds.bbci.co.uk/sport/rss.xml",
      "https://www.theguardian.com/sport/rss",
    ],
    culture: [
      "https://www.theguardian.com/culture/rss",
      "https://feeds.npr.org/1008/rss.xml",
    ],
    science: [
      "https://feeds.bbci.co.uk/news/science_and_environment/rss.xml",
      "https://www.theguardian.com/science/rss",
    ],
  },
  ar: {
    world: [
      "https://feeds.bbci.co.uk/arabic/rss.xml",
      "https://www.aljazeera.net/aljazeerarss/a7c186be-1baa-4bd4-9d80-a84db769f779/73d0e1b4-532f-45ef-b1f6-3d6b2d6b6b53",
      "https://arabic.cnn.com/api/v1/rss/middle-east/rss.xml",
      "https://www.france24.com/ar/rss",
    ],
    technology: ["https://arabic.cnn.com/api/v1/rss/tech/rss.xml"],
    business: [
      "https://www.france24.com/ar/%D8%A7%D9%82%D8%AA%D8%B5%D8%A7%D8%AF/rss",
      "https://www.aljazeera.net/aljazeerarss/ebusiness.xml",
      "https://arabic.cnn.com/api/v1/rss/business/rss.xml",
    ],
    sports: ["https://arabic.cnn.com/api/v1/rss/sport/rss.xml"],
    culture: ["https://arabic.cnn.com/api/v1/rss/entertainment/rss.xml"],
    science: ["https://arabic.cnn.com/api/v1/rss/health/rss.xml"],
  },
  zh: {
    world: [
      "https://feeds.bbci.co.uk/zhongwen/simp/rss.xml",
      "https://www.rfi.fr/cn/rss",
      "https://feeds.feedburner.com/rsscna/intworld",
    ],
    technology: [
      "https://feeds.feedburner.com/rsscna/technology",
      "https://www.ithome.com/rss/",
    ],
    business: [
      "https://feeds.feedburner.com/rsscna/finance",
      "https://www.ftchinese.com/rss/feed",
    ],
    sports: ["https://feeds.feedburner.com/rsscna/sport"],
    culture: ["https://feeds.feedburner.com/rsscna/lifehealth"],
    science: ["https://www.solidot.org/index.rss"],
  },
};

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  textNodeName: "#text",
  trimValues: true,
});

const STOPWORDS = new Set(
  (
    "the a an and or of to in on for with from by at as is are was were be been will would could should " +
    "this that these those it its his her their our your my not no but if then than so such about after " +
    "before over under more most new says say said who what when where why how first two three you we they have has had having win wins won winning beat beats " +
    "من في على عن الى إلى مع هذا هذه ذلك التي الذي كان كانت يكون بعد قبل بين خلال حول أن إن ما لا هو هي هم " +
    "كل قد لكن أو ثم عند لدى منذ حتى ضد نحو أمام دون سوف كما وقد وقال قال أكثر أول"
  ).split(/\s+/),
);

function stripHtml(input: string): string {
  return input
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Truncate at a word boundary with an ellipsis. CJK text (no spaces) is cut
 * directly. Never leaves a mid-word cut like "the promising yo".
 */
function smartTruncate(text: string, max: number): string {
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  const lastSpace = cut.lastIndexOf(" ");
  const at = lastSpace > max * 0.4 ? lastSpace : max;
  return cut.slice(0, at).trimEnd() + "\u2026";
}

function hash(input: string): string {
  let h = 5381;
  for (let i = 0; i < input.length; i++) h = ((h << 5) + h + input.charCodeAt(i)) | 0;
  return Math.abs(h).toString(36).slice(0, 7);
}

export function slugify(title: string, link: string): string {
  // Letters only: no digits, no symbols, no punctuation — just the words of
  // the title separated by hyphens (works for Latin, Arabic and CJK titles).
  const base = title
    .toLowerCase()
    .replace(/[^\p{L}]+/gu, "-")
    .replace(/^-+|-+$/g, "")
    .split("-")
    .filter(Boolean)
    .slice(0, 12)
    .join("-")
    .slice(0, 100)
    .replace(/-+$/g, "");
  return base || `story-${hash(link)}`;
}

/** Keyword extraction with no external services: frequency over title + summary. */
export function extractTags(title: string, summary: string): string[] {
  const text = `${title} ${title} ${summary}`;
  const counts = new Map<string, number>();
  const add = (term: string) => counts.set(term, (counts.get(term) ?? 0) + 1);

  const cjk = text.match(/[\u4e00-\u9fff]{2,6}/g);
  if (cjk && cjk.length > 2) {
    for (const chunk of cjk) {
      for (let i = 0; i + 2 <= chunk.length; i += 1) add(chunk.slice(i, i + 2));
    }
  }

  for (const raw of text.split(/[^\p{L}\p{N}]+/u)) {
    const word = raw.trim();
    if (word.length < 4) continue; // skip stubs like #cup / #win
    const lower = word.toLowerCase();
    if (STOPWORDS.has(lower)) continue;
    if (/^[\u4e00-\u9fff]+$/.test(word)) continue;
    add(lower);
  }

  return [...counts.entries()]
    .filter(([, n]) => n > 1 || counts.size < 6)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([term]) => term);
}

function asArray<T>(value: T | T[] | undefined): T[] {
  if (value === undefined) return [];
  return Array.isArray(value) ? value : [value];
}

function text(value: unknown): string {
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  if (value && typeof value === "object" && "#text" in (value as Record<string, unknown>)) {
    return String((value as Record<string, unknown>)["#text"] ?? "");
  }
  return "";
}

/* eslint-disable @typescript-eslint/no-explicit-any */
/** Rewrite known CDN thumbnail URLs to high-resolution versions. */
function upgradeImage(url: string): string {
  return url
    .replace(/(ichef\.bbci\.co\.uk\/(?:ace|news)\/(?:standard|ws))\/\d+\//, "$1/976/")
    .replace(/(ichef\.bbci\.co\.uk\/images\/ic)\/\d+x\d+\//, "$1/976x549/")
    .replace(/([?&](?:w|width|resize)=)\d{2,3}(?=&|$)/, (m, p: string) =>
      url.includes("guim.co.uk") ? m : `${p}1200`,
    );
}

function firstImage(item: Record<string, unknown>, html: string): string | null {
  const candidates: { url: string; width: number }[] = [];
  for (const key of ["media:content", "media:thumbnail"]) {
    for (const entry of asArray<any>(item[key])) {
      const url = entry?.["@_url"];
      if (typeof url === "string" && url.startsWith("http")) {
        candidates.push({ url, width: Number(entry?.["@_width"]) || 0 });
      }
    }
  }
  for (const group of asArray<any>(item["media:group"])) {
    for (const entry of asArray<any>(group?.["media:content"])) {
      const url = entry?.["@_url"];
      if (typeof url === "string" && url.startsWith("http")) {
        candidates.push({ url, width: Number(entry?.["@_width"]) || 0 });
      }
    }
  }
  if (candidates.length > 0) {
    candidates.sort((a, b) => b.width - a.width);
    return upgradeImage(candidates[0]!.url);
  }
  for (const enc of asArray<any>(item["enclosure"])) {
    const url = enc?.["@_url"];
    const type = String(enc?.["@_type"] ?? "");
    if (typeof url === "string" && (type.startsWith("image") || /\.(jpg|jpeg|png|webp)/i.test(url))) {
      return upgradeImage(url);
    }
  }
  const match = html.match(/<img[^>]+src=["']([^"']+)["']/i);
  return match?.[1] ? upgradeImage(match[1]) : null;
}

function linkOf(item: Record<string, unknown>): string {
  const link = item["link"];
  if (typeof link === "string") return link;
  for (const entry of asArray<any>(link)) {
    const href = entry?.["@_href"];
    if (typeof href === "string") return href;
    const inner = text(entry);
    if (inner) return inner;
  }
  return text(item["guid"]) || text(item["id"]);
}

function dateOf(item: Record<string, unknown>): string {
  const raw =
    text(item["pubDate"]) ||
    text(item["published"]) ||
    text(item["updated"]) ||
    text(item["dc:date"]);
  const parsed = raw ? new Date(raw) : new Date();
  return (Number.isNaN(parsed.getTime()) ? new Date() : parsed).toISOString();
}

async function fetchFeed(url: string, lang: Lang, category: Category): Promise<Article[]> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { "user-agent": "GlobalWireBot/1.0 (+news aggregator)", accept: "application/rss+xml, application/xml, text/xml" },
    });
    if (!res.ok) return [];
    const xml = await res.text();
    const doc = parser.parse(xml) as Record<string, any>;
    const channel: any = doc?.["rss"]?.channel ?? doc?.["feed"] ?? {};
    const sourceName =
      stripHtml(text(channel?.title)) || new URL(url).hostname.replace(/^www\./, "");
    const items = asArray<Record<string, unknown>>(channel?.item ?? channel?.entry);

    const articles: Article[] = [];
    for (const item of items.slice(0, 30)) {
      const title = stripHtml(text(item["title"]));
      const link = linkOf(item);
      if (!title || !link) continue;
      const rawBody =
        text(item["content:encoded"]) ||
        text(item["content"]) ||
        text(item["description"]) ||
        text(item["summary"]);
      const body = stripHtml(rawBody);
      const summary = smartTruncate(body, 260);
      articles.push({
        slug: slugify(title, link),
        title,
        summary,
        content: body,
        link,
        source: sourceName,
        category,
        lang,
        publishedAt: dateOf(item),
        image: firstImage(item, rawBody),
        tags: extractTags(title, body),
      });
    }
    return articles;
  } catch {
    return [];
  } finally {
    clearTimeout(timer);
  }
}

const TTL_MS = 15 * 60 * 1000;
type CacheEntry = { at: number; articles: Article[] };
const cache = new Map<Lang, CacheEntry>();
const inflight = new Map<Lang, Promise<Article[]>>();

export async function ingest(lang: Lang): Promise<Article[]> {
  // Specific categories win over the broad "world" wires when an item appears
  // in both, so category pages are never starved by a general feed.
  const ordered = [...CATEGORIES].sort((a, b) =>
    a === "world" ? 1 : b === "world" ? -1 : 0,
  );
  const jobs: Promise<Article[]>[] = [];
  for (const category of ordered) {
    for (const url of FEEDS[lang][category]) jobs.push(fetchFeed(url, lang, category));
  }
  const results = await Promise.all(jobs);

  const byLink = new Map<string, Article>();
  const bySlug = new Set<string>();
  for (const article of results.flat()) {
    if (byLink.has(article.link) || bySlug.has(article.slug)) continue;
    byLink.set(article.link, article);
    bySlug.add(article.slug);
  }
  return [...byLink.values()].sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  );
}

/**
 * Permanent article archive, stored as JSON on the repo's `data` branch
 * (written by scripts/ingest.ts via GitHub Actions). 15-minute memory cache.
 * Repo is configurable via DATA_REPO env ("owner/name").
 */
const DATA_TTL_MS = 15 * 60 * 1000;
const dataCache = new Map<Lang, { at: number; articles: Article[] }>();

async function fetchArchived(lang: Lang): Promise<Article[] | null> {
  const cached = dataCache.get(lang);
  if (cached && Date.now() - cached.at < DATA_TTL_MS) return cached.articles;
  const repo = process.env.DATA_REPO || "ranhanftoke/new-sfeed";
  const save = (arts: Article[]): Article[] | null => {
    if (arts.length > 0) dataCache.set(lang, { at: Date.now(), articles: arts });
    return arts.length > 0 ? arts : (cached?.articles ?? null);
  };
  // 1) Public path: raw.githubusercontent.com (works when repo is public)
  try {
    const res = await fetch(
      `https://raw.githubusercontent.com/${repo}/data/data/${lang}/latest.json`,
      { headers: { "user-agent": "GlobalWireBot/1.0 (+news aggregator)" } },
    );
    if (res.ok) {
      const j = (await res.json()) as { articles?: Article[] };
      const r = save(Array.isArray(j.articles) ? j.articles : []);
      if (r) return r;
    }
  } catch {
    // try private-repo fallback below
  }
  // 2) Private-repo fallback: GitHub API with token (server-side only,
  //    set GITHUB_DATA_TOKEN env on the host; never expose to the client)
  const ghToken = process.env.GITHUB_DATA_TOKEN;
  if (ghToken) {
    try {
      const r = await fetch(
        `https://api.github.com/repos/${repo}/contents/data/${lang}/latest.json?ref=data`,
        {
          headers: {
            Authorization: `Bearer ${ghToken}`,
            Accept: "application/vnd.github+json",
            "user-agent": "GlobalWireBot/1.0 (+news aggregator)",
          },
        },
      );
      if (r.ok) {
        const j = (await r.json()) as { content?: string };
        const parsed = JSON.parse(
          Buffer.from(j.content ?? "", "base64").toString("utf-8"),
        ) as { articles?: Article[] };
        const out = save(Array.isArray(parsed.articles) ? parsed.articles : []);
        if (out) return out;
      }
    } catch {
      // fall through to RSS
    }
  }
  return cached?.articles ?? null;
}

/**
 * Article store for a language.
 * 1) GitHub data-branch archive first (stable URLs, permanent history).
 * 2) Fallback: live RSS + 15-minute in-memory cache (previous behavior).
 */
export async function getArticles(lang: Lang): Promise<Article[]> {
  const archived = await fetchArchived(lang);
  if (archived && archived.length > 0) return archived;

  const cached = cache.get(lang);
  if (cached && Date.now() - cached.at < TTL_MS) return cached.articles;

  const existing = inflight.get(lang);
  if (existing) return existing;

  const job = ingest(lang)
    .then((arts) => {
      if (arts.length > 0) cache.set(lang, { at: Date.now(), articles: arts });
      return arts.length > 0 ? arts : (cached?.articles ?? []);
    })
    .catch(() => cached?.articles ?? [])
    .finally(() => inflight.delete(lang));

  inflight.set(lang, job);
  return job;
}

/**
 * Permanent single-article lookup.
 * latest.json keeps only the newest 500; older articles live forever as
 * individual files at data/{lang}/articles/{slug}.json on the data branch.
 */
const articleFileCache = new Map<string, { at: number; article: Article | null }>();
const ARTICLE_FILE_TTL_MS = 60 * 60 * 1000; // 1h — archived articles are immutable

async function fetchArchivedArticleFile(lang: Lang, slug: string): Promise<Article | null> {
  const key = `${lang}/${slug}`;
  const cached = articleFileCache.get(key);
  if (cached && Date.now() - cached.at < ARTICLE_FILE_TTL_MS) return cached.article;
  const repo = process.env.DATA_REPO || "ranhanftoke/new-sfeed";
  try {
    const res = await fetch(
      `https://raw.githubusercontent.com/${repo}/data/data/${lang}/articles/${encodeURIComponent(slug)}.json`,
      { headers: { "user-agent": "GlobalWireBot/1.0 (+news aggregator)" } },
    );
    if (res.ok) {
      const j = (await res.json()) as { article?: Article };
      if (j.article && j.article.slug === slug) {
        articleFileCache.set(key, { at: Date.now(), article: j.article });
        return j.article;
      }
    }
  } catch {
    // not found — cache the miss briefly to avoid hammering
  }
  articleFileCache.set(key, { at: Date.now(), article: null });
  return null;
}

/** Find one article by slug: latest.json first, then the permanent archive file. */
export async function getArticleBySlug(lang: Lang, slug: string): Promise<Article | null> {
  const all = await getArticles(lang);
  const hit = all.find((a) => a.slug === slug);
  if (hit) return hit;
  return fetchArchivedArticleFile(lang, slug);
}
