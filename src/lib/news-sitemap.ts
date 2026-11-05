export const GOOGLE_NEWS_MAX_AGE_MS = 48 * 60 * 60 * 1000;

/** Google News entries require a real publication date from the publisher, no more than 48 hours old. */
export function isEligibleNewsSitemapArticle(
  publishedAt: string,
  estimated: boolean,
  now = Date.now(),
): boolean {
  if (estimated) return false;
  const publishedTime = new Date(publishedAt).getTime();
  if (!Number.isFinite(publishedTime)) return false;
  const age = now - publishedTime;
  return age >= 0 && age <= GOOGLE_NEWS_MAX_AGE_MS;
}