import type { ReactNode } from "react";

export function StaticPage({ title, children }: { title: string; children: ReactNode }) {
  return (
    <article className="mx-auto max-w-3xl">
      <h1 className="border-b-2 border-foreground pb-3 font-display text-3xl font-bold text-foreground">
        {title}
      </h1>
      <div className="article-body mt-6 space-y-4 [&_h2]:mt-8 [&_h2]:font-display [&_h2]:text-xl [&_h2]:font-bold [&_li]:ms-5 [&_li]:list-disc">
        {children}
      </div>
    </article>
  );
}
