import { Link, createFileRoute, notFound } from "@tanstack/react-router";

import { AdSlot } from "@/components/site/AdSlot";
import { ArticleCard } from "@/components/site/ArticleCard";
import { GlobalScoreCallout } from "@/components/site/GlobalScoreCallout";
import { WhyItMatters } from "@/components/site/WhyItMatters";
import ReactMarkdown, { type Components } from "react-markdown";
import { T, formatDate, isLang, type Lang } from "@/lib/i18n";
import { getArticleData } from "@/lib/news.functions";

export const Route = createFileRoute("/$lang/articles/$slug")({
  loader: async ({ params }) => {
    const data = await getArticleData({
      data: { lang: params.lang, slug: params.slug },
    });
    if (!data) throw notFound();
    return data;
  },
  head: ({ params, loaderData }) => {
    const lang = (isLang(params.lang) ? params.lang : "en") as Lang;
    const t = T[lang];
    if (!loaderData) {
      return {
        meta: [{ title: `${t.noResults} — ${t.siteName}` }, { name: "robots", content: "noindex" }],
      };
    }
    const { article } = loaderData;
    const url = `https://new-sfeed.lovable.app/${lang}/articles/${article.slug}`;
    const meta = [
      { title: `${article.title} — ${t.siteName}` },
      { name: "description", content: article.summary },
      { name: "news_keywords", content: article.tags.join(", ") },
      { property: "og:title", content: article.title },
      { property: "og:description", content: article.summary },
      { property: "og:type", content: "article" },
      { property: "og:url", content: url },
      { property: "article:published_time", content: article.publishedAt },
      { name: "twitter:card", content: "summary_large_image" },
    ];
    if (article.image?.startsWith("https://")) {
      meta.push(
        { property: "og:image", content: article.image },
        { name: "twitter:image", content: article.image },
      );
    }
    return {
      meta,
      links: [{ rel: "canonical", href: url }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "NewsArticle",
            headline: article.title,
            description: article.summary,
            datePublished: article.publishedAt,
            dateModified: article.publishedAt,
            inLanguage: lang,
            articleSection: t.categories[article.category],
            keywords: article.tags.join(", "),
            image: article.image ? [article.image] : undefined,
            publisher: { "@type": "Organization", name: t.siteName },
            author: { "@type": "Organization", name: article.source },
            isBasedOn: article.link,
            mainEntityOfPage: { "@type": "WebPage", "@id": url },
          }),
        },
      ],
    };
  },
  errorComponent: () => <p className="py-10 text-center text-muted-foreground">—</p>,
  notFoundComponent: () => <p className="py-16 text-center font-display text-2xl">404</p>,
  component: ArticlePage,
});

function ArticlePage() {
  const { lang: raw } = Route.useParams();
  const lang = (isLang(raw) ? raw : "en") as Lang;
  const t = T[lang];
  const { article, related, inline, popular, isDeveloping } = Route.useLoaderData();
  const L = LABELS[lang];

  const paragraphs = article.content
    .split(/(?<=[.!?。！؟])\s+/)
    .reduce<string[]>((acc, sentence) => {
      const last = acc[acc.length - 1];
      if (last && last.length < 260) acc[acc.length - 1] = `${last} ${sentence}`;
      else acc.push(sentence);
      return acc;
    }, [])
    .filter(Boolean);

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,3fr)_minmax(0,1fr)]">
      <article className="min-w-0">
        <Link
          to="/$lang/category/$slug"
          params={{ lang, slug: article.category }}
          className="eyebrow text-primary"
        >
          {t.categories[article.category]}
        </Link>
        <h1 className="mt-3 font-display text-3xl leading-tight font-bold text-foreground sm:text-4xl">
          {article.title}
        </h1>
        <p className="mt-4 border-y border-border py-3 text-sm text-muted-foreground">
          {t.source}: <span className="font-semibold text-foreground">{article.source}</span> ·{" "}
          {t.published}:{" "}
          <time dateTime={article.publishedAt}>{formatDate(article.publishedAt, lang)}</time>
        </p>

        <WhyItMatters
          lang={lang}
          article={article}
          relatedCount={related.length}
          isDeveloping={isDeveloping}
        />

        {article.image ? (
          <figure className="mt-6">
            <img
              src={article.image}
              alt={article.title}
              width={1200}
              height={675}
              decoding="async"
              referrerPolicy="no-referrer"
              onError={(e) => {
                const fig = e.currentTarget.closest("figure");
                if (fig) (fig as HTMLElement).style.display = "none";
              }}
              className="aspect-[16/9] w-full rounded-sm bg-muted object-cover object-center"
            />
            <figcaption className="mt-2 text-xs text-muted-foreground">
              {article.source}
            </figcaption>
          </figure>
        ) : null}

        {article.aiArticle ? (
          <>
            <div className="article-body mt-6">
              <ReactMarkdown components={mdComponents}>{article.aiArticle}</ReactMarkdown>
            </div>
          </>
        ) : (
          <div className="article-body mt-6 space-y-4">
          {paragraphs.map((paragraph, i) => {
            const linkIdx = i === 0 ? 0 : i === 2 ? 1 : -1;
            const rec = linkIdx >= 0 ? inline[linkIdx] : undefined;
            return (
              <div key={i} className="space-y-4">
                <p>{paragraph}</p>
                {rec ? (
                  <p className="border-s-4 border-primary bg-muted/50 px-4 py-3 text-base">
                    <span className="eyebrow me-2 text-primary">{L.alsoRead}</span>
                    <Link
                      to="/$lang/articles/$slug"
                      params={{ lang, slug: rec.slug }}
                      className="font-semibold text-foreground underline-offset-4 hover:text-primary hover:underline"
                    >
                      {rec.title}
                    </Link>
                  </p>
                ) : null}
              </div>
            );
          })}
          {paragraphs.length < 3 &&
            inline.slice(paragraphs.length < 1 ? 0 : 1).map((rec) => (
              <p key={rec.slug} className="border-s-4 border-primary bg-muted/50 px-4 py-3 text-base">
                <span className="eyebrow me-2 text-primary">{L.alsoRead}</span>
                <Link
                  to="/$lang/articles/$slug"
                  params={{ lang, slug: rec.slug }}
                  className="font-semibold text-foreground hover:text-primary hover:underline"
                >
                  {rec.title}
                </Link>
              </p>
            ))}
          </div>
        )}

        {article.category === "sports" ? <GlobalScoreCallout lang={lang} /> : null}

        <AdSlot variant="in-article" label={t.advertisement} className="my-8" />

        <a
          href={article.link}
          target="_blank"
          rel="nofollow noopener noreferrer"
          className="inline-block border-2 border-foreground px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-foreground hover:text-background"
        >
          {t.readOriginal}
        </a>

        {article.tags.length > 0 ? (
          <ul className="mt-8 flex flex-wrap gap-2">
            {article.tags.map((tag) => (
              <li key={tag}>
                <Link
                  to="/$lang/search"
                  params={{ lang }}
                  search={{ q: tag }}
                  className="inline-block border border-border px-2.5 py-1 text-xs text-muted-foreground hover:border-primary hover:text-primary"
                >
                  #{tag}
                </Link>
              </li>
            ))}
          </ul>
        ) : null}

        {related.length > 0 ? (
          <section className="mt-12">
            <h2 className="eyebrow border-b-2 border-foreground pb-2 text-foreground">
              {t.related}
            </h2>
            <div className="mt-5 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {related.map((item) => (
                <ArticleCard key={item.slug} article={item} lang={lang} />
              ))}
            </div>
          </section>
        ) : null}
      </article>

      <aside className="min-w-0">
        <div className="space-y-8 lg:sticky lg:top-6">
          {popular.length > 0 ? (
            <section>
              <h2 className="eyebrow border-b-2 border-foreground pb-2 text-foreground">
                {L.mostRead}
              </h2>
              <ol className="mt-4 space-y-4">
                {popular.map((item, i) => (
                  <li key={item.slug} className="flex gap-3">
                    <span className="font-display text-3xl leading-none font-bold text-primary">
                      {i + 1}
                    </span>
                    <Link
                      to="/$lang/articles/$slug"
                      params={{ lang, slug: item.slug }}
                      className="text-sm leading-snug font-semibold text-foreground hover:text-primary"
                    >
                      {item.title}
                    </Link>
                  </li>
                ))}
              </ol>
            </section>
          ) : null}
          <div className="hidden lg:block">
            <AdSlot variant="sidebar" label={t.advertisement} />
          </div>
        </div>
      </aside>
    </div>
  );
}

const mdComponents: Components = {
  h2: ({ node, ...props }) => (
    <h2 className="mt-8 font-display text-xl font-bold text-foreground" {...props} />
  ),
  p: ({ node, ...props }) => (
    <p className="mt-4 leading-relaxed text-foreground/90" {...props} />
  ),
  a: ({ node, href, ...props }) => {
    const external = href?.startsWith("http");
    return (
      <a
        href={href}
        {...(external ? { target: "_blank", rel: "nofollow noopener noreferrer" } : {})}
        className="font-medium text-primary underline underline-offset-4 hover:no-underline"
        {...props}
      />
    );
  },
  strong: ({ node, ...props }) => (
    <strong className="font-semibold text-foreground" {...props} />
  ),
  ul: ({ node, ...props }) => (
    <ul className="mt-4 list-disc space-y-2 ps-5 text-foreground/90" {...props} />
  ),
  ol: ({ node, ...props }) => (
    <ol className="mt-4 list-decimal space-y-2 ps-5 text-foreground/90" {...props} />
  ),
  li: ({ node, ...props }) => <li className="leading-relaxed" {...props} />,
};

const LABELS: Record<Lang, { alsoRead: string; mostRead: string }> = {
  en: { alsoRead: "Also read", mostRead: "Most read" },
  ar: { alsoRead: "اقرأ أيضاً", mostRead: "الأكثر قراءة" },
  zh: { alsoRead: "延伸阅读", mostRead: "热门阅读" },
};
