import { createFileRoute } from "@tanstack/react-router";

import { ArticleCard } from "@/components/site/ArticleCard";
import { T, isLang, type Lang } from "@/lib/i18n";
import { searchArticles } from "@/lib/news.functions";

export const Route = createFileRoute("/$lang/search")({
  validateSearch: (search: Record<string, unknown>) => ({
    q: String(search?.["q"] ?? "").slice(0, 120),
  }),
  loaderDeps: ({ search }) => ({ q: search.q }),
  loader: ({ params, deps }) => searchArticles({ data: { lang: params.lang, q: deps.q } }),
  head: ({ params }) => {
    const lang = (isLang(params.lang) ? params.lang : "en") as Lang;
    const t = T[lang];
    return {
      meta: [
        { title: `${t.searchResults} — ${t.siteName}` },
        { name: "description", content: t.siteDescription },
        { name: "robots", content: "noindex, follow" },
        { property: "og:title", content: `${t.searchResults} — ${t.siteName}` },
        { property: "og:description", content: t.siteDescription },
      ],
    };
  },
  errorComponent: () => <p className="py-10 text-center text-muted-foreground">—</p>,
  component: SearchPage,
});

function SearchPage() {
  const { lang: raw } = Route.useParams();
  const lang = (isLang(raw) ? raw : "en") as Lang;
  const t = T[lang];
  const { q } = Route.useSearch();
  const results = Route.useLoaderData();

  return (
    <div>
      <h1 className="border-b-2 border-foreground pb-3 font-display text-2xl font-bold text-foreground">
        {t.searchResults}
        {q ? <span className="text-muted-foreground"> — “{q}”</span> : null}
      </h1>
      {results.length === 0 ? (
        <p className="py-16 text-center text-muted-foreground">{t.noResults}</p>
      ) : (
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((article) => (
            <ArticleCard key={article.slug} article={article} lang={lang} />
          ))}
        </div>
      )}
    </div>
  );
}
