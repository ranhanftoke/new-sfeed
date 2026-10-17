import { Link, createFileRoute } from "@tanstack/react-router";

import { AdSlot } from "@/components/site/AdSlot";
import { ArticleCard } from "@/components/site/ArticleCard";
import { T, isLang, type Lang } from "@/lib/i18n";
import { getHomeData } from "@/lib/news.functions";

export const Route = createFileRoute("/$lang/")({
  loader: ({ params }) => getHomeData({ data: { lang: params.lang } }),
  head: ({ params }) => {
    const lang = (isLang(params.lang) ? params.lang : "en") as Lang;
    const t = T[lang];
    const title = `${t.siteName} — ${t.tagline}`;
    return {
      meta: [
        { title },
        { name: "description", content: t.siteDescription },
        { property: "og:title", content: title },
        { property: "og:description", content: t.siteDescription },
        { property: "og:type", content: "website" },
        { property: "og:url", content: `https://new-sfeed.lovable.app/${lang}` },
        { name: "twitter:card", content: "summary_large_image" },
      ],
      links: [{ rel: "canonical", href: `https://new-sfeed.lovable.app/${lang}` }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: t.siteName,
            description: t.siteDescription,
            inLanguage: lang,
          }),
        },
      ],
    };
  },
  errorComponent: () => <p className="py-10 text-center text-muted-foreground">—</p>,
  component: HomePage,
});

function HomePage() {
  const { lang: raw } = Route.useParams();
  const lang = (isLang(raw) ? raw : "en") as Lang;
  const t = T[lang];
  const data = Route.useLoaderData();

  if (!data.lead) {
    return <p className="py-16 text-center text-muted-foreground">{t.emptyFeed}</p>;
  }

  return (
    <div className="flex flex-col gap-12">
      <section className="grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <ArticleCard article={data.lead} lang={lang} variant="lead" />
        <div className="flex flex-col">
          <h2 className="eyebrow border-b-2 border-foreground pb-2 text-foreground">
            {t.latest}
          </h2>
          <div className="mt-2">
            {data.topStories.map((article) => (
              <ArticleCard
                key={article.slug}
                article={article}
                lang={lang}
                variant="compact"
              />
            ))}
          </div>
        </div>
      </section>

      {data.trending.length > 0 ? (
        <section>
          <h2 className="eyebrow border-b-2 border-foreground pb-2 text-foreground">
            {t.trending}
          </h2>
          <ul className="mt-3 flex flex-wrap gap-2">
            {data.trending.map((tag) => (
              <li key={tag}>
                <Link
                  to="/$lang/search"
                  params={{ lang }}
                  search={{ q: tag }}
                  className="inline-block border border-border bg-card px-3 py-1 text-sm text-foreground hover:border-primary hover:text-primary"
                >
                  #{tag}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <div className="grid gap-10 lg:grid-cols-[minmax(0,3fr)_minmax(0,1fr)]">
        <div className="flex flex-col gap-12">
          {data.byCategory.map((group, index) => (
            <section key={group.category}>
              <div className="flex items-end justify-between border-b-2 border-foreground pb-2">
                <h2 className="font-display text-xl font-bold text-foreground">
                  {t.categories[group.category]}
                </h2>
                <Link
                  to="/$lang/category/$slug"
                  params={{ lang, slug: group.category }}
                  className="eyebrow text-primary"
                >
                  {t.more} →
                </Link>
              </div>
              <div className="mt-5 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {group.articles.map((article) => (
                  <ArticleCard key={article.slug} article={article} lang={lang} />
                ))}
              </div>
              {index === 0 ? (
                <AdSlot variant="in-article" label={t.advertisement} className="mt-8" />
              ) : null}
            </section>
          ))}
        </div>
        <aside className="hidden lg:block">
          <AdSlot variant="sidebar" label={t.advertisement} />
        </aside>
      </div>
    </div>
  );
}
