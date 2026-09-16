import { Outlet, createFileRoute, notFound } from "@tanstack/react-router";
import { useEffect } from "react";

import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { StickyAdSlot } from "@/components/site/AdSlot";
import { LANGS, LANG_META, T, isLang, type Lang } from "@/lib/i18n";

export const Route = createFileRoute("/$lang")({
  beforeLoad: ({ params }) => {
    if (!isLang(params.lang)) throw notFound();
  },
  head: ({ params }) => {
    const lang = (isLang(params.lang) ? params.lang : "en") as Lang;
    return {
      meta: [
        { name: "robots", content: "max-image-preview:large" },
        { property: "og:site_name", content: T[lang].siteName },
        { property: "og:locale", content: LANG_META[lang].htmlLang },
      ],
      links: [
        ...LANGS.map((code) => ({
          rel: "alternate",
          hrefLang: LANG_META[code].htmlLang,
          href: `/${code}`,
        })),
        { rel: "alternate", hrefLang: "x-default", href: "/en" },
      ],
    };
  },
  component: LangLayout,
  notFoundComponent: () => (
    <div className="flex min-h-screen items-center justify-center px-4">
      <p className="font-display text-2xl font-bold">404 — Page not found</p>
    </div>
  ),
});

function LangLayout() {
  const { lang: raw } = Route.useParams();
  const lang = (isLang(raw) ? raw : "en") as Lang;
  const dir = LANG_META[lang].dir;

  useEffect(() => {
    document.documentElement.lang = LANG_META[lang].htmlLang;
    document.documentElement.dir = dir;
  }, [lang, dir]);

  return (
    <div dir={dir} lang={LANG_META[lang].htmlLang} className="min-h-screen bg-background">
      <SiteHeader lang={lang} />
      <main className="mx-auto w-full max-w-6xl px-4 py-8">
        <Outlet />
      </main>
      <SiteFooter lang={lang} />
      <StickyAdSlot label={T[lang].advertisement} />
    </div>
  );
}
