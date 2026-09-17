import { createFileRoute } from "@tanstack/react-router";

import { StaticPage } from "@/components/site/StaticPage";
import { T, isLang, type Lang } from "@/lib/i18n";
import { PAGES } from "@/lib/static-pages";

export const Route = createFileRoute("/$lang/privacy")({
  head: ({ params }) => {
    const lang = (isLang(params.lang) ? params.lang : "en") as Lang;
    const page = PAGES[lang].privacy;
    const title = `${page.title} — ${T[lang].siteName}`;
    return {
      meta: [
        { title },
        { name: "description", content: page.intro.slice(0, 155) },
        { property: "og:title", content: title },
        { property: "og:description", content: page.intro.slice(0, 155) },
        { property: "og:type", content: "website" },
        { property: "og:url", content: `/${lang}/privacy` },
        { name: "twitter:card", content: "summary_large_image" },
      ],
      links: [{ rel: "canonical", href: `/${lang}/privacy` }],
    };
  },
  component: PrivacyPage,
});

function PrivacyPage() {
  const { lang: raw } = Route.useParams();
  const lang = (isLang(raw) ? raw : "en") as Lang;
  const page = PAGES[lang].privacy;

  return (
    <StaticPage title={page.title}>
      <p className="text-lg">{page.intro}</p>
      {page.sections.map((section) => (
        <section key={section.heading}>
          {section.heading ? <h2>{section.heading}</h2> : null}
          {section.body.map((paragraph, i) => (
            <p key={i} className="mt-3">
              {paragraph}
            </p>
          ))}
        </section>
      ))}
    </StaticPage>
  );
}
