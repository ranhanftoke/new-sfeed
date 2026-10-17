import { createFileRoute } from "@tanstack/react-router";

import { LANGS, T } from "@/lib/i18n";

// Google News only accepts stories published in the last 2 days, max 1000 URLs.
const FRESH_WINDOW_MS = 48 * 60 * 60 * 1000;
const MAX_ENTRIES = 1000;

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function newsDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return `${date.toISOString().slice(0, 19)}+00:00`;
}

export const Route = createFileRoute("/news-sitemap.xml")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const reqOrigin = new URL(request.url).origin;
        const origin = reqOrigin.includes("localhost") ? reqOrigin : "https://new-sfeed.lovable.app";
        const { getArticles } = await import("@/lib/feeds.server");
        const now = Date.now();

        const entries: string[] = [];
        for (const lang of LANGS) {
          if (entries.length >= MAX_ENTRIES) break;
          const publication = escapeXml(T[lang].siteName);
          const articles = (await getArticles(lang))
            .filter((a) => now - new Date(a.publishedAt).getTime() <= FRESH_WINDOW_MS)
            .sort((x, y) => y.publishedAt.localeCompare(x.publishedAt))
            .slice(0, MAX_ENTRIES - entries.length);

          for (const article of articles) {
            entries.push(
              `<url><loc>${escapeXml(`${origin}/${lang}/articles/${article.slug}`)}</loc>` +
                `<news:news><news:publication><news:name>${publication}</news:name>` +
                `<news:language>${lang}</news:language></news:publication>` +
                `<news:publication_date>${newsDate(article.publishedAt)}</news:publication_date>` +
                `<news:title>${escapeXml(article.title)}</news:title></news:news></url>`,
            );
          }
        }

        const xml =
          `<?xml version="1.0" encoding="UTF-8"?>\n` +
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" ` +
          `xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">\n` +
          `${entries.join("\n")}\n</urlset>`;

        return new Response(xml, {
          headers: {
            "content-type": "application/xml; charset=utf-8",
            "cache-control": "public, max-age=900",
          },
        });
      },
    },
  },
});
