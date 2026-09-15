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
      "https://www.skynewsarabia.com/web/rss/section/world.xml",
    ],
    technology: [
      "https://feeds.bbci.co.uk/arabic/scienceandtech/rss.xml",
      "https://www.skynewsarabia.com/web/rss/section/technology.xml",
    ],
    business: [
      "https://feeds.bbci.co.uk/arabic/business/rss.xml",
      "https://www.skynewsarabia.com/web/rss/section/business.xml",
    ],
    sports: [
      "https://www.skynewsarabia.com/web/rss/section/sport.xml",
      "https://feeds.bbci.co.uk/arabic/sports/rss.xml",
    ],
    culture: [
      "https://www.skynewsarabia.com/web/rss/section/varieties.xml",
      "https://feeds.bbci.co.uk/arabic/artandculture/rss.xml",
    ],
    science: [
      "https://feeds.bbci.co.uk/arabic/scienceandtech/rss.xml",
      "https://www.skynewsarabia.com/web/rss/section/technology.xml",
    ],
  },
  zh: {
    world: [
      "https://feeds.bbci.co.uk/zhongwen/simp/rss.xml",
      "https://www.rfi.fr/cn/rss",
      "https://cn.nytimes.com/rss/world.xml",
    ],
    technology: ["https://cn.nytimes.com/rss/technology.xml"],
    business: ["https://cn.nytimes.com/rss/business.xml"],
    sports: ["https://cn.nytimes.com/rss/sports.xml"],
    culture: ["https://cn.nytimes.com/rss/culture.xml"],
    science: ["https://cn.nytimes.com/rss/science.xml"],
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
    "before over under more most new says say said who what when where why how first two three you we they " +
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

function hash(input: string): string {
  let h = 5381;
  for (let i = 0; i < input.length; i++) h = ((h << 5) + h + input.charCodeAt(i)) | 0;
  return Math.abs(h).toString(36).slice(0, 7);
}

export function slugify(title: string, link: string): string {
  const base = title
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "")
    .split("-")
    .slice(0, 10)
    .join("-")
    .slice(0, 90);
  return `${base || "story"}-${hash(link)}`;
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
    if (word.length < 3) continue;
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

function firstImage(item: Record<string, unknown>, html: string): string | null {
  const media = item["media:content"] ?? item["media:thumbnail"];
  for (const entry of asArray(media as Record<string, unknown>)) {
    const url = entry?.["@_url"];
    if (typeof url === "string" && url.startsWith("http")) return url;
  }
  for (const enc of asArray(item["enclosure"] as Record<string, unknown>)) {
    const url = enc?.["@_url"];
    const type = String(enc?.["@_type"] ?? "");
    if (typeof url === "string" && (type.startsWith("image") || /\.(jpg|jpeg|png|webp)/i.test(url))) {
      return url;
    }
  }
  const match = html.match(/<img[^>]+src=["']([^"']+)["']/i);
  return match?.[1] ?? null;
}

function linkOf(item: Record<string, unknown>): string {
  const link = item["link"];
  if (typeof link === "string") return link;
  for (const entry of asArray(link as Record<string, unknown>)) {
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
    const channel = doc?.rss?.channel ?? doc?.feed ?? {};
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
      const summary = body.slice(0, 260);
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

async function ingest(lang: Lang): Promise<Article[]> {
  const jobs: Promise<Article[]>[] = [];
  for (const category of CATEGORIES) {
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

/** Cached article store for a language; refreshes at most every 15 minutes. */
export async function getArticles(lang: Lang): Promise<Article[]> {
  const cached = cache.get(lang);
  if (cached && Date.now() - cached.at < TTL_MS) return cached.articles;

  const existing = inflight.get(lang);
  if (existing) return existing;

  const job = ingest(lang)
    .then((articles) => {
      if (articles.length > 0) cache.set(lang, { at: Date.now(), articles });
      return articles.length > 0 ? articles : (cached?.articles ?? []);
    })
    .catch(() => cached?.articles ?? [])
    .finally(() => inflight.delete(lang));

  inflight.set(lang, job);
  return job;
}
