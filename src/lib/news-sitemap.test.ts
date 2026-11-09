import { GOOGLE_NEWS_MAX_AGE_MS, isEligibleNewsSitemapArticle } from "./news-sitemap";

function assertEqual(actual: boolean, expected: boolean, rule: string) {
  if (actual !== expected) throw new Error(`Google News sitemap rule failed: ${rule}`);
}

const now = Date.parse("2026-11-05T12:00:00.000Z");
assertEqual(
  isEligibleNewsSitemapArticle(new Date(now - GOOGLE_NEWS_MAX_AGE_MS).toISOString(), false, now),
  true,
  "includes publisher-dated stories up to 48 hours old",
);
assertEqual(
  isEligibleNewsSitemapArticle(new Date(now - GOOGLE_NEWS_MAX_AGE_MS - 1).toISOString(), false, now),
  false,
  "excludes stories older than 48 hours",
);
assertEqual(
  isEligibleNewsSitemapArticle(new Date(now).toISOString(), true, now),
  false,
  "excludes missing-date fallbacks",
);
assertEqual(isEligibleNewsSitemapArticle("not-a-date", false, now), false, "excludes invalid dates");
assertEqual(
  isEligibleNewsSitemapArticle(new Date(now + 1).toISOString(), false, now),
  false,
  "excludes future-dated stories",
);
console.log("Google News sitemap freshness rules passed.");