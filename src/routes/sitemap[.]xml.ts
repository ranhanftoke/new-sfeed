import { createFileRoute } from "@tanstack/react-router";

import { CATEGORIES, LANGS } from "@/lib/i18n";

const STATIC_PAGES = ["", "/about", "/contact", "/privacy", "/terms", "/editorial"];

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const reqOrigin = new URL(request.url).origin;
        const origin = reqOrigin.includes("localhost") ? reqOrigin : "https://new-sfeed.lovable.app";
        const { getArticles } = await import("@/lib/feeds.server");

        const urls: string[] = [];
        for (const lang of LANGS) {
          for (const page of STATIC_PAGES) {
            urls.push(`<url><loc>${escapeXml(`${origin}/${lang}${page}`)}</loc><changefreq>daily</changefreq><priority>${page === "" ? "1.0" : "0.5"}</priority></url>`);
          }
          for (const category of CATEGORIES) {
            urls.push(
              `<url><loc>${escapeXml(`${origin}/${lang}/category/${category}`)}</loc><changefreq>hourly</changefreq><priority>0.8</priority></url>`,
            );
          }
          const articles = await getArticles(lang);
          for (const article of articles.slice(0, 500)) {
            urls.push(
              `<url><loc>${escapeXml(`${origin}/${lang}/articles/${article.slug}`)}</loc><lastmod>${article.publishedAt}</lastmod><changefreq>hourly</changefreq><priority>0.7</priority></url>`,
            );
          }
        }

        const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join("\n")}\n</urlset>`;

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
