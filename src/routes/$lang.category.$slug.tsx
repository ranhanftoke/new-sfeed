import { Link, createFileRoute, notFound } from "@tanstack/react-router";

import { AdSlot } from "@/components/site/AdSlot";
import { ArticleCard } from "@/components/site/ArticleCard";
import { T, isCategory, isLang, type Category, type Lang } from "@/lib/i18n";
import { getCategoryData } from "@/lib/news.functions";

type Search = { page?: number };

export const Route = createFileRoute("/$lang/category/$slug")({
  validateSearch: (search: Record<string, unknown>): Search => {
    const page = Math.max(1, Math.floor(Number(search?.["page"] ?? 1)) || 1);
    // Keep page 1 free of query clutter (clean canonical URLs).
    return page > 1 ? { page } : {};
  },
  loaderDeps: ({ search }) => ({ page: search.page ?? 1 }),
  beforeLoad: ({ params }) => {
    if (!isCategory(params.slug)) throw notFound();
  },
  loader: ({ params, deps }) =>
    getCategoryData({
      data: { lang: params.lang, category: params.slug, page: deps.page },
    }),
  head: ({ params }) => {
    const lang = (isLang(params.lang) ? params.lang : "en") as Lang;
    const category = (isCategory(params.slug) ? params.slug : "world") as Category;
    const t = T[lang];
    const title = `${t.categories[category]} — ${t.siteName}`;
    const description = `${t.categories[category]}: ${t.siteDescription}`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { property: "og:url", content: `/${lang}/category/${category}` },
        { name: "twitter:card", content: "summary_large_image" },
      ],
      links: [{ rel: "canonical", href: `/${lang}/category/${category}` }],
    };
  },
  errorComponent: () => <p className="py-10 text-center text-muted-foreground">—</p>,
  notFoundComponent: () => <p className="py-10 text-center">404</p>,
  component: CategoryPage,
});

function CategoryPage() {
  const { lang: rawLang, slug } = Route.useParams();
  const lang = (isLang(rawLang) ? rawLang : "en") as Lang;
  const category = (isCategory(slug) ? slug : "world") as Category;
  const t = T[lang];
  const data = Route.useLoaderData();
  const lastPage = Math.max(1, Math.ceil(data.total / data.pageSize));

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,3fr)_minmax(0,1fr)]">
      <div>
        <h1 className="border-b-2 border-foreground pb-3 font-display text-3xl font-bold text-foreground">
          {t.categories[category]}
        </h1>

        {data.articles.length === 0 ? (
          <p className="py-16 text-center text-muted-foreground">{t.emptyFeed}</p>
        ) : (
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {data.articles.map((article) => (
              <ArticleCard key={article.slug} article={article} lang={lang} />
            ))}
          </div>
        )}

        {lastPage > 1 ? (
          <nav className="mt-10 flex items-center justify-between border-t border-border pt-4">
            {data.page > 1 ? (
              <Link
                to="/$lang/category/$slug"
                params={{ lang, slug: category }}
                search={{ page: data.page - 1 }}
                className="eyebrow text-primary"
              >
                ← {t.prev}
              </Link>
            ) : (
              <span />
            )}
            <span className="text-sm text-muted-foreground">
              {t.page} {data.page} / {lastPage}
            </span>
            {data.page < lastPage ? (
              <Link
                to="/$lang/category/$slug"
                params={{ lang, slug: category }}
                search={{ page: data.page + 1 }}
                className="eyebrow text-primary"
              >
                {t.next} →
              </Link>
            ) : (
              <span />
            )}
          </nav>
        ) : null}
      </div>
      <aside className="hidden lg:block">
        <AdSlot variant="sidebar" label={t.advertisement} />
      </aside>
    </div>
  );
}
