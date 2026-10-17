import { Link } from "@tanstack/react-router";

import { LANG_META, T, type Category, type Lang } from "@/lib/i18n";

const CRUMB_LABEL: Record<Lang, string> = {
  en: "Breadcrumb",
  ar: "مسار التنقل",
  zh: "面包屑导航",
};

/**
 * Visible "Home › Category › Story" trail. Every internal crumb is a real
 * <Link> so the site keeps working as a single-page app.
 */
export function Breadcrumbs({
  lang,
  category,
  title,
}: {
  lang: Lang;
  category?: Category;
  title?: string;
}) {
  const t = T[lang];
  const sep = LANG_META[lang].dir === "rtl" ? "‹" : "›";

  return (
    <nav aria-label={CRUMB_LABEL[lang]} className="mb-4">
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
        <li>
          <Link to="/$lang" params={{ lang }} className="transition-colors hover:text-primary">
            {t.home}
          </Link>
        </li>

        {category ? (
          <>
            <li aria-hidden="true">{sep}</li>
            <li>
              <Link
                to="/$lang/category/$slug"
                params={{ lang, slug: category }}
                className="transition-colors hover:text-primary"
              >
                {t.categories[category]}
              </Link>
            </li>
          </>
        ) : null}

        {title ? (
          <>
            <li aria-hidden="true">{sep}</li>
            <li
              aria-current="page"
              className="max-w-[46ch] truncate font-semibold text-foreground/80"
            >
              {title}
            </li>
          </>
        ) : null}
      </ol>
    </nav>
  );
}

/** Schema.org BreadcrumbList for a page's <head>. Paths are site-relative. */
export function breadcrumbJsonLd(crumbs: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((crumb, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: crumb.name,
      item: `https://new-sfeed.lovable.app${crumb.path}`,
    })),
  };
}
