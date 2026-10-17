import { Link } from "@tanstack/react-router";
import { useState } from "react";

import { T, relativeTime, type Lang } from "@/lib/i18n";
import type { ArticleCardData } from "@/lib/news-types";
import { cn } from "@/lib/utils";

function CardImage({ article, isLead, lang }: { article: ArticleCardData; isLead: boolean; lang: Lang }) {
  const [failed, setFailed] = useState(false);
  const show = article.image && !failed;
  return (
    <div
      className={cn(
        "relative w-full overflow-hidden rounded-sm bg-muted",
        isLead ? "aspect-[16/9]" : "aspect-[16/10]",
      )}
    >
      {show ? (
        <img
          src={article.image!}
          alt={article.title}
          loading={isLead ? "eager" : "lazy"}
          decoding="async"
          referrerPolicy="no-referrer"
          width={isLead ? 1200 : 640}
          height={isLead ? 675 : 400}
          onError={() => setFailed(true)}
          className="absolute inset-0 size-full object-cover object-center transition-transform duration-500 group-hover:scale-[1.03]"
        />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-secondary p-4 text-center">
          <span className="eyebrow text-primary">{T[lang].categories[article.category]}</span>
          <span className="font-display text-lg font-bold text-foreground">{article.source}</span>
        </div>
      )}
    </div>
  );
}

export function ArticleCard({
  article,
  lang,
  variant = "default",
}: {
  article: ArticleCardData;
  lang: Lang;
  variant?: "default" | "lead" | "compact";
}) {
  const t = T[lang];
  const time = (
    <span suppressHydrationWarning>{relativeTime(article.publishedAt, lang)}</span>
  );

  if (variant === "compact") {
    return (
      <article className="border-b border-border py-3">
        <Link to="/$lang/articles/$slug" params={{ lang, slug: article.slug }} className="group block">
          <h3 className="font-display text-base leading-snug font-semibold text-foreground group-hover:text-primary">
            {article.title}
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">
            {article.source} · {time}
          </p>
        </Link>
      </article>
    );
  }

  const isLead = variant === "lead";

  return (
    <article className={cn("group flex flex-col", isLead ? "gap-4" : "gap-3 border-b border-border pb-5")}>
      <Link to="/$lang/articles/$slug" params={{ lang, slug: article.slug }} className="flex flex-col gap-3">
        <CardImage article={article} isLead={isLead} lang={lang} />
        <div>
          <span className="eyebrow text-primary">{isLead ? t.breaking : t.categories[article.category]}</span>
          <h2
            className={cn(
              "mt-2 font-display font-bold text-foreground group-hover:text-primary",
              isLead ? "text-3xl leading-tight sm:text-4xl" : "text-lg leading-snug line-clamp-3",
            )}
          >
            {article.title}
          </h2>
          <p className={cn("mt-2 text-muted-foreground", isLead ? "text-base" : "text-sm line-clamp-3")}>
            {article.summary}
          </p>
          <p className="mt-3 text-xs text-muted-foreground">
            {article.source} · {time}
          </p>
        </div>
      </Link>
    </article>
  );
}
