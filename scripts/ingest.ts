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
const MAX_GENERATE_PER_RUN = 25;
const GENERATE_CONCURRENCY = 4;
const LANG_NAMES: Record<string, string> = { en: "English", ar: "Arabic", zh: "Chinese (Simplified)" };

function buildPrompt(a: Article): string {
  const langName = LANG_NAMES[a.lang] || "English";
  return (
    `You are a professional news editor writing for "Global Wire", a trilingual news website.\n` +
    `Write an original, professional news article in ${langName} based ONLY on the facts below.\n` +
    `Rules:\n` +
    `- Do NOT invent quotes, names, numbers, dates, places, or events not present in the source material.\n` +
    `- You may add at most one short paragraph of widely-known background context.\n` +
    `- Structure: strong lede paragraph, 2-3 short body paragraphs, one closing "why it matters" sentence.\n` +
    `- Length: 250-350 words. Neutral, journalistic tone. No clickbait, no markdown headings, no bullet lists.\n` +
    `- Output ONLY the article body text, with paragraphs separated by a blank line.\n\n` +
    `Headline: ${a.title}\n` +
    `Source: ${a.source}\n` +
    `Published: ${a.publishedAt}\n` +
    `Source excerpt: ${a.summary}`
  );
}

async function generateArticle(a: Article): Promise<string | null> {
  try {
    const r = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: buildPrompt(a) }] }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1500,
            thinkingConfig: { thinkingBudget: 0 },
          },
        }),
      },
    );
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
      console.log(`[${lang}] generating ${todo.length} AI articles`);
      for (let i = 0; i < todo.length; i += GENERATE_CONCURRENCY) {
        const batch = todo.slice(i, i + GENERATE_CONCURRENCY);
        const results = await Promise.all(batch.map(generateArticle));
        const now = new Date().toISOString();
        batch.forEach((a, k) => {
          if (results[k]) {
            a.aiArticle = results[k];
            a.aiGeneratedAt = now;
          }
        });
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
