import { describe, expect, it } from "bun:test";

import { GOOGLE_NEWS_MAX_AGE_MS, isEligibleNewsSitemapArticle } from "./news-sitemap";

describe("Google News sitemap freshness", () => {
  const now = Date.parse("2026-11-05T12:00:00.000Z");

  it("includes publisher-dated stories up to 48 hours old", () => {
    expect(
      isEligibleNewsSitemapArticle(new Date(now - GOOGLE_NEWS_MAX_AGE_MS).toISOString(), false, now),
    ).toBe(true);
  });

  it("excludes stories older than 48 hours", () => {
    expect(
      isEligibleNewsSitemapArticle(new Date(now - GOOGLE_NEWS_MAX_AGE_MS - 1).toISOString(), false, now),
    ).toBe(false);
  });

  it("excludes missing-date fallbacks, invalid dates, and future-dated stories", () => {
    expect(isEligibleNewsSitemapArticle(new Date(now).toISOString(), true, now)).toBe(false);
    expect(isEligibleNewsSitemapArticle("not-a-date", false, now)).toBe(false);
    expect(isEligibleNewsSitemapArticle(new Date(now + 1).toISOString(), false, now)).toBe(false);
  });
});