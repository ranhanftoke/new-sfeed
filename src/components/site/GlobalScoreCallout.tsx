import { Trophy } from "lucide-react";

import type { Lang } from "@/lib/i18n";
import { T } from "@/lib/i18n";

export function GlobalScoreCallout({ lang }: { lang: Lang }) {
  const t = T[lang];
  return (
    <aside className="my-8 flex flex-col gap-3 border-l-4 border-primary bg-secondary px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <Trophy className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
        <div>
          <p className="font-display text-base font-bold text-foreground">
            {t.liveScores}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">{t.liveScoresBody}</p>
        </div>
      </div>
      <a
        href="https://bankacem.github.io/GlobalScore"
        target="_blank"
        rel="nofollow noopener noreferrer"
        className="shrink-0 bg-primary px-4 py-2 text-center text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
      >
        GlobalScore ↗
      </a>
    </aside>
  );
}
