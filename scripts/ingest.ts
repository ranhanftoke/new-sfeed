/**
 * News ingest — GitHub Actions every 15 minutes. GitHub-NATIVE storage,
 * no external database: RSS feeds are fetched and merged into
 * data/{lang}/latest.json on the `data` branch via the GitHub API.
 * Dedupe is by article link; each language keeps the newest 500 articles.
 *
 * Env (auto-provided in Actions): GITHUB_TOKEN, GITHUB_REPOSITORY.
 * Local test:
 *   GH_TOKEN=ghp_... GITHUB_REPOSITORY=owner/repo bun scripts/ingest.ts
 */
import { LANGS, type Lang } from "../src/lib/i18n";
import { ingest } from "../src/lib/feeds.server";
import type { Article } from "../src/lib/news-types";

const MAX_KEEP = 500;

// AI article generation (Gemini). Gracefully skipped when GEMINI_API_KEY is absent.
const GEMINI_KEY = process.env.GEMINI_API_KEY || "";
const MAX_GENERATE_PER_RUN = 10;
const GENERATE_DELAY_MS = 7000; // sequential pacing: stays under the free-tier RPM limit
const LANG_NAMES: Record<string, string> = { en: "English", ar: "Arabic", zh: "Chinese (Simplified)" };
const SITE_URL = "https://new-sfeed.lovable.app";

/** Pick up to 3 related articles (same-language pool) for internal linking. */
function relatedLinks(a: Article, pool: Article[]): { title: string; url: string }[] {
  const tags = new Set(a.tags);
  return pool
    .filter((b) => b.slug !== a.slug)
    .map((b) => ({
      b,
      score: b.tags.filter((tt) => tags.has(tt)).length * 3 + (b.category === a.category ? 1 : 0),
    }))
    .filter((e) => e.score > 0)
    .sort((x, y) => y.score - x.score)
    .slice(0, 3)
    .map((e) => ({ title: e.b.title, url: `${SITE_URL}/${e.b.lang}/articles/${e.b.slug}` }));
}

function buildPrompt(a: Article, related: { title: string; url: string }[]): string {
  const langName = LANG_NAMES[a.lang] || "English";
  const relatedBlock =
    related.length > 0 ? related.map((r) => `- [${r.title}](${r.url})`).join("\n") : "(none)";
  return (
    `You are a senior news editor at "Global Wire", a trilingual digital newspaper.
` +
    `Write a complete, professional news article in ${langName} that reads as if written by an experienced human journalist - NOT as AI-generated text.
` +
    `HARD RULES:
` +
    `- Base everything ONLY on the facts in the source material below. NEVER invent quotes, names, figures, dates, places, or events.
` +
    `- You may add ONE short paragraph of widely-known background context.
` +
    `- Natural human writing: vary sentence length and rhythm, concrete details, direct language.
` +
    `- FORBIDDEN AI cliches - never use: "in conclusion", "delve", "moreover", "furthermore", "it's worth noting", "testament to", "landscape", "tapestry", "crucial", "pivotal", "in today's fast-paced world". No emojis. No hype, no clickbait.
` +
    `- SEO structure, output in Markdown:
` +
    `  - Open with a strong lede paragraph (no heading above it).
` +
    `  - Use 2-3 ## subheadings describing each section (natural, keyword-rich).
` +
    `  - 400-550 words total. Short paragraphs of 2-4 sentences.
` +
    `  - **Bold** key facts sparingly (names, figures, dates).
` +
    `  - Naturally weave in 1-2 internal links from RELATED COVERAGE below, using descriptive anchor text (never "click here").
` +
    `  - Close with a Sources line: Sources: [${a.source}](${a.link})
` +
    `- Output ONLY the Markdown article body. No H1 title (it is provided separately).

` +
    `HEADLINE: ${a.title}
` +
    `ORIGINAL SOURCE: ${a.source}
` +
    `PUBLISHED: ${a.publishedAt}
` +
    `SOURCE EXCERPT: ${a.summary}
` +
    `RELATED COVERAGE ON OUR SITE:
${relatedBlock}`
  );
}

async function generateArticle(
  a: Article,
  related: { title: string; url: string }[],
  attempt = 1,
): Promise<string | null> {
  try {
    const r = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: AbortSignal.timeout(45000),
        body: JSON.stringify({
          contents: [{ parts: [{ text: buildPrompt(a, related) }] }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 2000,
            thinkingConfig: { thinkingBudget: 0 },
          },
        }),
      },
    );
    if (r.status === 429 && attempt === 1) {
      console.error(`gemini 429 for ${a.slug} - waiting 65s and retrying once`);
      await new Promise((res) => setTimeout(res, 65000));
      return generateArticle(a, related, 2);
    }
    if (!r.ok) {
      console.error(`gemini ${r.status} for ${a.slug}`);
      return null;
    }
    const j = (await r.json()) as any;
    const text: string =
      j?.candidates?.[0]?.content?.parts?.map((p: any) => p.text || "").join("") ?? "";
    return text.trim() || null;
  } catch (e) {
    console.error("gemini error", (e as Error).message);
    return null;
  }
}

const token = process.env.GH_TOKEN || process.env.GITHUB_TOKEN;
const repo = process.env.GITHUB_REPOSITORY; // "owner/name"
if (!token || !repo) {
  console.error("missing GH_TOKEN/GITHUB_TOKEN or GITHUB_REPOSITORY");
  process.exit(1);
}

const H: Record<string, string> = {
  Authorization: `Bearer ${token}`,
  Accept: "application/vnd.github+json",
  "Content-Type": "application/json",
};

async function readJson(path: string): Promise<{ articles: Article[]; sha?: string }> {
  const r = await fetch(`https://api.github.com/repos/${repo}/contents/${path}?ref=data`, {
    headers: H,
  });
  if (r.status === 404) return { articles: [] };
  if (!r.ok) throw new Error(`read ${path}: ${r.status}`);
  const j = (await r.json()) as { content?: string; sha?: string };
  const raw = Buffer.from(j.content ?? "", "base64").toString("utf-8");
  const parsed = JSON.parse(raw) as { articles?: Article[] };
  return { articles: Array.isArray(parsed.articles) ? parsed.articles : [], sha: j.sha };
}

async function writeJson(path: string, articles: Article[], sha?: string) {
  const body = JSON.stringify({
    updatedAt: new Date().toISOString(),
    count: articles.length,
    articles,
  });
  const payload: Record<string, unknown> = {
    message: `ingest: ${path} (${articles.length} articles)`,
    content: Buffer.from(body, "utf-8").toString("base64"),
    branch: "data",
  };
  if (sha) payload.sha = sha;
  const r = await fetch(`https://api.github.com/repos/${repo}/contents/${path}`, {
    method: "PUT",
    headers: H,
    body: JSON.stringify(payload),
  });
  if (!r.ok) throw new Error(`write ${path}: ${r.status} ${(await r.text()).slice(0, 200)}`);
}

async function main() {
  for (const lang of LANGS) {
    const fresh = await ingest(lang as Lang);
    const { articles: existing, sha } = await readJson(`data/${lang}/latest.json`);
    const seen = new Set(existing.map((a) => a.link));
    // Preserve editorial notes / AI articles already saved on archived articles.
    const prevByLink = new Map(existing.filter((a) => a.editorial || a.aiArticle).map((a) => [a.link, a]));
    for (const a of fresh) {
      const prev = prevByLink.get(a.link);
      if (!prev) continue;
      if (!a.editorial && prev.editorial) a.editorial = prev.editorial;
      if (!a.aiArticle && prev.aiArticle) {
        a.aiArticle = prev.aiArticle;
        a.aiGeneratedAt = prev.aiGeneratedAt;
      }
    }
    const merged = [...fresh.filter((a) => !seen.has(a.link)), ...existing]
      .sort((a, b) => +new Date(b.publishedAt) - +new Date(a.publishedAt))
      .slice(0, MAX_KEEP);
    if (GEMINI_KEY) {
      const todo = merged.filter((a) => !a.aiArticle).slice(0, MAX_GENERATE_PER_RUN);
      console.log(`[${lang}] generating ${todo.length} AI articles (sequential, paced)`);
      for (const a of todo) {
        const links = relatedLinks(a, merged);
        const text = await generateArticle(a, links);
        if (text) {
          a.aiArticle = text;
          a.aiGeneratedAt = new Date().toISOString();
        }
        await new Promise((res) => setTimeout(res, GENERATE_DELAY_MS));
      }
    } else {
      console.log(`[${lang}] GEMINI_API_KEY absent — skipping AI article generation`);
    }
    await writeJson(`data/${lang}/latest.json`, merged, sha);
    console.log(`[${lang}] fresh=${fresh.length} total=${merged.length}`);
  }
  console.log("ingest done");
}

main().catch((err) => {
  console.error("ingest failed:", err);
  process.exit(1);
});
