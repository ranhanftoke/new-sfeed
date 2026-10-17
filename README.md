# Global News Stream

Build a high-performance, fully automated Multi-Category News Aggregator Web Application with 0-LLM API cost dependency, highly optimized for Google Search Console, Google News, and Baidu SEO.

### 1. Architecture & RSS Data Engine (No API Costs)

- Implement an automated RSS Ingestion Engine using standard RSS/Atom parsing (e.g., rss-parser) fetching from diverse categories:

  * World News, Technology & AI, Business & Economy, Sports & Live Scores, Culture & Entertainment, Science & Environment.

- Generate articles directly from RSS feed items (Title, Description, Full Content/Snippet, PubDate, Source).

- Process incoming articles to automatically extract key concepts for internal tags and related content without calling external LLM APIs.

- Store articles efficiently (e.g., Supabase / Local database) with auto-deduplication by GUID/link.

### 2. SEO & Google-Friendly Architecture (Hreflang & Clean URLs)

- Dynamic Sitemap Generator (`/sitemap.xml`) updated automatically with all fetched articles, categories, and static pages.

- Canonical URLs for all pages to prevent duplicate content.

- Clean URL Routing: `/articles/[slug]` (No unnecessary URL parameter clutter like `?lang=`).

- Support 3 clean language switches: English (`/en`), Arabic (`/ar`), Chinese (`/zh`) with proper `hreflang` tags and RTL/LTR layout handling.

- OpenGraph (OG) metadata, Twitter Cards, and JSON-LD Structured Data (`NewsArticle` Schema) on every article page.

- Auto-generated `robots.txt` optimized for search crawlers.

### 3. Smart Internal & External Linking

- **External Links:** Automatically link back to the original source (`Read Original Source ↗`) using `rel="nofollow noopener noreferrer"` and `target="_blank"`.

- **Internal Links:** Every article must render a "Related Stories" grid with 4-5 internal links based on matching category or tags.

- **Sports Category Integration:** For any article under the "Sports" category, dynamically embed a clean, non-intrusive callout box/widget linking to:

  `https://bankacem.github.io/GlobalScore` ("GlobalScore — Live Scores & Results ↗") opening in a new tab (`target="_blank"`).

### 4. Essential Pages & Trust Signals (Google Quality Guidelines)

Build the following complete pages with modern UI (Tailwind CSS, clean typography, fast loading):

1. **Home Page (`/`):** Hero breaking news, categorized news grids, trending topics, search bar, and language switcher.

2. **Category Pages (`/category/[slug]`):** Filtered news stream with infinite scroll or pagination.

3. **Article Detail Page (`/articles/[slug]`):** Fully formatted article, publication date, source credit, related stories, and live scores widget for sports.

4. **About Us (`/about`):** Professional statement about the news aggregation technology and mission.

5. **Contact Us (`/contact`):** Working contact form and business inquiry info.

6. **Privacy Policy (`/privacy`):** Standard GDPR/AdSense-compliant policy.

7. **Terms of Service (`/terms`):** Terms covering syndicated content and external sources.

8. **Editorial Guidelines & Source Credits (`/editorial`):** Explaining RSS attribution and source linking.

### 5. Mobile-First UI/UX & Monetization Ready

- Ultra-fast desktop and mobile responsive design.

- Clean ad slots placeholder components (Header Leaderboard, In-Article Banner, Sidebar Widget, Sticky Bottom Footer) compatible with AdSense, Ezoic, and Native Ads.

- Smooth navigation, fast loading times, and zero layout shifts (CLS optimized).

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://new-sfeed.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/df9c3eab-704f-43e0-81aa-e6d5f0e358ec).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
