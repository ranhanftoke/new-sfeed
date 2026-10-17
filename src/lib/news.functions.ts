import { createServerFn } from "@tanstack/react-start";

import { CATEGORIES, isCategory, isLang, type Category, type Lang } from "./i18n";
import type {
  Article,
  ArticleCardData,
  ArticlePageData,
  CategoryPageData,
  HomeData,
} from "./news-types";

function card(a: Article): ArticleCardData {
  const { content: _content, aiArticle: _ai, aiGeneratedAt: _aig, ...rest } = a;
  return rest;
}

function parseLang(value: unknown): Lang {
  return typeof value === "string" && isLang(value) ? value : "en";
}

export const getHomeData = createServerFn({ method: "GET" })
  .inputValidator((input: { lang: string }) => ({ lang: parseLang(input?.lang) }))
  .handler(async ({ data }): Promise<HomeData> => {
    const { getArticles } = await import("./feeds.server");
    const articles = await getArticles(data.lang);
    const cards = articles.map(card);

    const counts = new Map<string, number>();
    for (const a of cards.slice(0, 120)) {
      for (const tag of a.tags) counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
    const trending = [...counts.entries()]
      .filter(([tag]) => tag.length > 2)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 12)
      .map(([tag]) => tag);

    return {
      lead: cards[0] ?? null,
      topStories: cards.slice(1, 7),
      byCategory: CATEGORIES.map((category) => ({
        category,
        articles: cards.filter((a) => a.category === category).slice(0, 6),
      })).filter((group) => group.articles.length > 0),
      trending,
    };
  });

export const getCategoryData = createServerFn({ method: "GET" })
  .inputValidator((input: { lang: string; category: string; page?: number }) => ({
    lang: parseLang(input?.lang),
    category: (isCategory(input?.category) ? input.category : "world") as Category,
    page: Math.max(1, Math.min(50, Math.floor(Number(input?.page ?? 1)) || 1)),
  }))
  .handler(async ({ data }): Promise<CategoryPageData> => {
    const { getArticles } = await import("./feeds.server");
    const all = (await getArticles(data.lang)).filter((a) => a.category === data.category);
    const pageSize = 18;
    const start = (data.page - 1) * pageSize;
    return {
      articles: all.slice(start, start + pageSize).map(card),
      total: all.length,
      page: data.page,
      pageSize,
    };
  });

export const getArticleData = createServerFn({ method: "GET" })
  .inputValidator((input: { lang: string; slug: string }) => ({
    lang: parseLang(input?.lang),
    slug: String(input?.slug ?? "").slice(0, 200),
  }))
  .handler(async ({ data }): Promise<ArticlePageData | null> => {
    const { getArticles } = await import("./feeds.server");
    const all = await getArticles(data.lang);
    const article = all.find((a) => a.slug === data.slug);
    if (!article) return null;

    const tags = new Set(article.tags);
    const scored = all
      .filter((a) => a.slug !== article.slug)
      .map((a) => ({
        a,
        score:
          a.tags.filter((t) => tags.has(t)).length * 3 +
          (a.category === article.category ? 1 : 0),
      }))
      .filter((entry) => entry.score > 0)
      .sort((x, y) => y.score - x.score)
      .slice(0, 8)
      .map((entry) => card(entry.a));

    const used = new Set([article.slug, ...scored.map((r) => r.slug)]);
    const sorted = [...all].sort((x, y) => y.publishedAt.localeCompare(x.publishedAt));
    const inline = sorted
      .filter((a) => !used.has(a.slug) && a.category === article.category)
      .slice(0, 2)
      .map(card);
    inline.forEach((r) => used.add(r.slug));
    const popular = sorted
      .filter((a) => !used.has(a.slug) && a.image)
      .slice(0, 6)
      .map(card);

    const isDeveloping = Date.now() - new Date(article.publishedAt).getTime() < 6 * 3600 * 1000;
    return { article, related: scored, inline, popular, isDeveloping };
  });

export const searchArticles = createServerFn({ method: "GET" })
  .inputValidator((input: { lang: string; q: string }) => ({
    lang: parseLang(input?.lang),
    q: String(input?.q ?? "").trim().slice(0, 120),
  }))
  .handler(async ({ data }): Promise<ArticleCardData[]> => {
    if (!data.q) return [];
    const { getArticles } = await import("./feeds.server");
    const needle = data.q.toLowerCase();
    return (await getArticles(data.lang))
      .filter(
        (a) =>
          a.title.toLowerCase().includes(needle) ||
          a.summary.toLowerCase().includes(needle) ||
          a.tags.some((t) => t.includes(needle)),
      )
      .slice(0, 40)
      .map(card);
  });

export const getSitemapEntries = createServerFn({ method: "GET" }).handler(async () => {
  const { getArticles } = await import("./feeds.server");
  const langs: Lang[] = ["en", "ar", "zh"];
  const result: { lang: Lang; slugs: { slug: string; lastmod: string }[] }[] = [];
  for (const lang of langs) {
    const articles = await getArticles(lang);
    result.push({
      lang,
      slugs: articles.slice(0, 500).map((a) => ({ slug: a.slug, lastmod: a.publishedAt })),
    });
  }
  return result;
});
