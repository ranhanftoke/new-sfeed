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
    const merged = [...fresh.filter((a) => !seen.has(a.link)), ...existing]
      .sort((a, b) => +new Date(b.publishedAt) - +new Date(a.publishedAt))
      .slice(0, MAX_KEEP);
    await writeJson(`data/${lang}/latest.json`, merged, sha);
    console.log(`[${lang}] fresh=${fresh.length} total=${merged.length}`);
  }
  console.log("ingest done");
}

main().catch((err) => {
  console.error("ingest failed:", err);
  process.exit(1);
});
