# Global News Aggregator — Build Plan

A fast, automated news site in three languages (English, Arabic, Chinese) built entirely from free RSS feeds. No paid AI services involved, so running costs stay at zero.

## Languages

- Three clean sections: `/en`, `/ar`, `/zh`.
- Each language pulls news from its own sources (English, Arabic and Chinese publishers), so every version shows real articles in that language.
- Full interface translation for menus, labels and buttons; Arabic renders right-to-left.
- Language switcher in the header, with proper hreflang signals linking the three versions.

## News collection

- Curated feed list per language across six categories: World, Technology & AI, Business & Economy, Sports, Culture & Entertainment, Science & Environment.
- Automatic refresh every 15 minutes, running in the background.
- Each item is saved with title, summary, content snippet, publish date, source name and link; duplicates are skipped by unique link/ID.
- Tags are derived from the article's own wording (keyword extraction, no AI service), powering related-story matching.

## Pages

1. Home — breaking hero story, category grids, trending topics, search, language switcher.
2. Category page — filtered stream with pagination.
3. Article page — full formatted item, date, source credit, "Read Original Source ↗" (new tab, nofollow), related stories grid (4–5 links), and for Sports a callout box linking to GlobalScore live scores.
4. About, 5. Contact (form saved in the app, readable by you), 6. Privacy Policy, 7. Terms of Service, 8. Editorial Guidelines & Source Credits.

## Search visibility

- Clean URLs: `/en/articles/[slug]`, `/en/category/[slug]`.
- Auto-updating sitemap covering articles, categories and static pages; crawler-friendly robots file.
- Canonical links, social share cards (OpenGraph + Twitter), and NewsArticle structured data on every article.

## Design & ads

- Mobile-first, fast, no layout jumps; clean editorial typography.
- Empty ad slots ready for AdSense/Ezoic: header leaderboard, in-article banner, sidebar widget, sticky bottom bar.
- I will show you three design directions to pick from before building the interface.

## Technical notes

- TanStack Start routes; language prefix as a route segment with a shared layout.
- Lovable Cloud (Postgres) tables: `articles` (unique index on source link/GUID, indexed by language + category + published_at), `sources`, `tags`/`article_tags`, `contact_messages`, `ingest_state` (lock + pause status). RLS: public read on articles/sources/tags, insert-only public on contact messages, server-side writes for ingestion.
- Ingestion: `rss-parser` inside a server route under `src/routes/api/public/ingest`, triggered by pg_cron every 15 minutes; bounded batch per run, single-flight lease row, idempotent upserts.
- Keyword extraction: stopword-filtered token frequency + title n-grams, stored as tags; related stories = tag overlap then category fallback.
- Reads via route loaders + TanStack Query with a public server function; `sitemap.xml` and `robots.txt` served from server routes.
- Per-route `head()` for title, description, canonical, OG/Twitter, hreflang alternates and JSON-LD.

## Open item

Feed sources: I will start with well-known public feeds per language and category (e.g. major wire services and regional publishers). Tell me if you want specific outlets added or removed.
