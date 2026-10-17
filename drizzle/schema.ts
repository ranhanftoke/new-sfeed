import { index, pgTable, serial, text, timestamp, unique } from "drizzle-orm/pg-core";

/**
 * Permanent article archive. Written by scripts/ingest.ts (GitHub Actions,
 * every 15 min). Read by src/lib/feeds.server.ts getArticles() — DB first,
 * live RSS fallback when DATABASE_URL is not set.
 */
export const articles = pgTable(
  "articles",
  {
    id: serial("id").primaryKey(),
    slug: text("slug").notNull(),
    title: text("title").notNull(),
    summary: text("summary"),
    content: text("content"),
    link: text("link").notNull().unique(),
    source: text("source"),
    category: text("category").notNull(),
    lang: text("lang").notNull(),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    image: text("image"),
    tags: text("tags").array(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (t) => [
    unique("articles_lang_slug_uniq").on(t.lang, t.slug),
    index("articles_lang_cat_pub_idx").on(t.lang, t.category, t.publishedAt),
    index("articles_lang_pub_idx").on(t.lang, t.publishedAt),
  ],
);

export type ArticleRow = typeof articles.$inferSelect;
