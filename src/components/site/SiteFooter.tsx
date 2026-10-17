import { Link } from "@tanstack/react-router";

import { CATEGORIES, T, type Lang } from "@/lib/i18n";

export function SiteFooter({ lang }: { lang: Lang }) {
  const t = T[lang];
  const pages = [
    { to: "/$lang/about" as const, label: t.about },
    { to: "/$lang/contact" as const, label: t.contact },
    { to: "/$lang/editorial" as const, label: t.editorial },
    { to: "/$lang/privacy" as const, label: t.privacy },
    { to: "/$lang/terms" as const, label: t.terms },
  ];

  return (
    <footer className="mt-14 border-t-2 border-foreground bg-secondary">
      <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-10 sm:grid-cols-3">
        <div>
          <p className="font-display text-xl font-bold text-foreground">{t.siteName}</p>
          <p className="mt-2 text-sm text-muted-foreground">{t.tagline}</p>
        </div>
        <nav aria-label="Sections">
          <p className="eyebrow mb-3 text-muted-foreground">{t.latest}</p>
          <ul className="space-y-1.5">
            {CATEGORIES.map((category) => (
              <li key={category}>
                <Link
                  to="/$lang/category/$slug"
                  params={{ lang, slug: category }}
                  className="text-sm text-foreground hover:text-primary"
                >
                  {t.categories[category]}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <nav aria-label={t.about}>
          <p className="eyebrow mb-3 text-muted-foreground">{t.siteName}</p>
          <ul className="space-y-1.5">
            {pages.map((page) => (
              <li key={page.to}>
                <Link
                  to={page.to}
                  params={{ lang }}
                  className="text-sm text-foreground hover:text-primary"
                >
                  {page.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <div className="border-t border-border px-4 py-5">
        <p className="mx-auto max-w-6xl text-xs leading-relaxed text-muted-foreground">
          {t.footerNote} © {new Date().getFullYear()} {t.siteName}.
        </p>
      </div>
    </footer>
  );
}
