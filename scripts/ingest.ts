/**
 * News ingest job — runs in GitHub Actions every 15 minutes.
 * Fetches all RSS feeds (via src/lib/feeds.server.ts) and upserts articles
 * into Postgres. Dedupe is by article link: first seen wins.
 *
 * Required env: DATABASE_URL (set as GitHub Actions secret).
 * Run locally:  DATABASE_URL=postgres://... bun scripts/ingest.ts
 */
import { LANGS } from "../src/lib/i18n";
import { ingest } from "../src/lib/feeds.server";
import { getDb } from "../src/lib/db";
import { articles } from "../drizzle/schema";

async function main() {
  const db = getDb();
  let processed = 0;
  let inserted = 0;

  for (const lang of LANGS) {
    const list = await ingest(lang);
    for (const a of list) {
      processed++;
      const res = await db
        .insert(articles)
        .values({
          slug: a.slug,
          title: a.title,
          summary: a.summary,
          content: a.content,
          link: a.link,
          source: a.source,
          category: a.category,
          lang: a.lang,
          publishedAt: a.publishedAt ? new Date(a.publishedAt) : null,
          image: a.image,
          tags: a.tags,
        })
        .onConflictDoNothing({ target: articles.link });
      // drizzle postgres-js: rowCount is available on the result
      const rc = (res as unknown as { rowCount?: number }).rowCount ?? 0;
      inserted += rc;
    }
    console.log(`[${lang}] fetched=${list.length}`);
  }

  console.log(`ingest done: processed=${processed} inserted=${inserted}`);
}

main().catch((err) => {
  console.error("ingest failed:", err);
  process.exit(1);
});
