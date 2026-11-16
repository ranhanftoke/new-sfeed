import type { Article } from "./news-types";

/**
 * Original Global Wire articles, written by the newsroom (not RSS).
 *
 * One JSON file per article in `content/articles/<slug>.json`. Files are
 * bundled at build time via import.meta.glob, so they work on any host
 * (no runtime filesystem reads). The hourly publisher writes a new file
 * per article; the next deploy picks it up.
 */
const modules = import.meta.glob("../../content/articles/*.json", {
  eager: true,
}) as Record<string, { default: unknown }>;

function isValidArticle(value: unknown): value is Article {
  if (!value || typeof value !== "object") return false;
  const a = value as Record<string, unknown>;
  return (
    typeof a.slug === "string" &&
    a.slug.length > 0 &&
    typeof a.title === "string" &&
    typeof a.summary === "string" &&
    typeof a.content === "string" &&
    typeof a.link === "string" &&
    typeof a.source === "string" &&
    typeof a.category === "string" &&
    typeof a.lang === "string" &&
    typeof a.publishedAt === "string"
  );
}

const ALL: Article[] = Object.values(modules)
  .map((m) => m.default)
  .filter(isValidArticle)
  .map((a) => ({
    ...a,
    publishedAtEstimated: false,
    image: typeof a.image === "string" ? a.image : null,
    tags: Array.isArray(a.tags) ? (a.tags as string[]) : [],
  }));

/** Original articles for a language, newest first. */
export function getOriginalArticles(lang: string): Article[] {
  return ALL.filter((a) => a.lang === lang).sort((x, y) =>
    y.publishedAt.localeCompare(x.publishedAt),
  );
}
