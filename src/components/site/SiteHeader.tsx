import { Link, useNavigate } from "@tanstack/react-router";
import { Menu, Search, X } from "lucide-react";
import { useState } from "react";

import { AdSlot } from "./AdSlot";
import { CATEGORIES, LANGS, LANG_META, T, type Lang } from "@/lib/i18n";

export function SiteHeader({ lang }: { lang: Lang }) {
  const t = T[lang];
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const query = q.trim();
    if (!query) return;
    setOpen(false);
    navigate({ to: "/$lang/search", params: { lang }, search: { q: query } });
  }

  return (
    <header className="border-b-2 border-foreground bg-background">
      <div className="mx-auto w-full max-w-6xl px-4">
        <div className="flex items-center justify-between gap-4 py-4">
          <Link to="/$lang" params={{ lang }} className="flex flex-col">
            <span className="font-display text-2xl leading-none font-bold tracking-tight text-foreground sm:text-3xl">
              {t.siteName}
            </span>
            <span className="mt-1 hidden text-xs text-muted-foreground sm:block">
              {t.tagline}
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <form onSubmit={submit} className="hidden items-center md:flex">
              <label className="sr-only" htmlFor="site-search">
                {t.search}
              </label>
              <input
                id="site-search"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder={t.searchPlaceholder}
                className="h-9 w-48 border border-input bg-card px-3 text-sm outline-none focus:border-primary"
              />
              <button
                type="submit"
                aria-label={t.search}
                className="flex h-9 items-center justify-center bg-foreground px-3 text-background"
              >
                <Search className="size-4" aria-hidden="true" />
              </button>
            </form>

            <nav aria-label={t.language} className="flex items-center gap-1">
              {LANGS.map((code) => (
                <Link
                  key={code}
                  to="/$lang"
                  params={{ lang: code }}
                  hrefLang={LANG_META[code].htmlLang}
                  className={
                    code === lang
                      ? "bg-foreground px-2 py-1 text-xs font-semibold text-background"
                      : "px-2 py-1 text-xs font-semibold text-muted-foreground hover:text-foreground"
                  }
                >
                  {code.toUpperCase()}
                </Link>
              ))}
            </nav>

            <button
              type="button"
              aria-label="Menu"
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
              className="md:hidden"
            >
              {open ? <X className="size-6" /> : <Menu className="size-6" />}
            </button>
          </div>
        </div>

        <nav
          aria-label="Sections"
          className="hidden items-center gap-6 border-t border-border py-2 md:flex"
        >
          {CATEGORIES.map((category) => (
            <Link
              key={category}
              to="/$lang/category/$slug"
              params={{ lang, slug: category }}
              className="eyebrow text-foreground hover:text-primary"
              activeProps={{ className: "eyebrow text-primary" }}
            >
              {t.categories[category]}
            </Link>
          ))}
        </nav>

        {open ? (
          <div className="border-t border-border py-3 md:hidden">
            <form onSubmit={submit} className="mb-3 flex">
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder={t.searchPlaceholder}
                aria-label={t.search}
                className="h-10 flex-1 border border-input bg-card px-3 text-sm outline-none focus:border-primary"
              />
              <button
                type="submit"
                aria-label={t.search}
                className="flex h-10 items-center bg-foreground px-3 text-background"
              >
                <Search className="size-4" aria-hidden="true" />
              </button>
            </form>
            <ul className="grid grid-cols-2 gap-2">
              {CATEGORIES.map((category) => (
                <li key={category}>
                  <Link
                    to="/$lang/category/$slug"
                    params={{ lang, slug: category }}
                    onClick={() => setOpen(false)}
                    className="eyebrow block py-1 text-foreground"
                  >
                    {t.categories[category]}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>

      <div className="mx-auto w-full max-w-6xl px-4 pb-3">
        <AdSlot variant="leaderboard" label={t.advertisement} />
      </div>
    </header>
  );
}
