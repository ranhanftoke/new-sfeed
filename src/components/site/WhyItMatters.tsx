import type { Lang } from "@/lib/i18n";
import type { Article } from "@/lib/news-types";

const STRINGS: Record<
  Lang,
  {
    heading: string;
    covers: (topics: string) => string;
    coverage: (n: number) => string;
    developing: string;
    fromSource: (source: string) => string;
  }
> = {
  en: {
    heading: "Why it matters",
    covers: (topics) => `Key topics: ${topics}`,
    coverage: (n) => `${n} related ${n === 1 ? "story" : "stories"} in our coverage below`,
    developing: "Developing story \u2014 we refresh our coverage every hour",
    fromSource: (source) => `Originally reported by ${source} \u2014 full story linked below`,
  },
  ar: {
    heading: "\u0644\u0645\u0627\u0630\u0627 \u064a\u0647\u0645\u0651\u0643 \u0647\u0630\u0627 \u0627\u0644\u062e\u0628\u0631",
    covers: (topics) => `\u0623\u0628\u0631\u0632 \u0627\u0644\u0645\u0648\u0627\u0636\u064a\u0639: ${topics}`,
    coverage: (n) => `${n} \u0645\u0646 \u0627\u0644\u0642\u0635\u0635 \u0630\u0627\u062a \u0627\u0644\u0635\u0644\u0629 \u0636\u0645\u0646 \u062a\u063a\u0637\u064a\u062a\u0646\u0627 \u0623\u062f\u0646\u0627\u0647`,
    developing: "\u062e\u0628\u0631 \u0645\u062a\u0637\u0648\u0651\u0631 \u2014 \u0646\u062d\u062f\u0651\u062b \u062a\u063a\u0637\u064a\u062a\u0646\u0627 \u0643\u0644 \u0633\u0627\u0639\u0629",
    fromSource: (source) => `\u0646\u064f\u0642\u0644 \u0639\u0646 ${source} \u2014 \u0631\u0627\u0628\u0637 \u0627\u0644\u062e\u0628\u0631 \u0627\u0644\u0643\u0627\u0645\u0644 \u0623\u062f\u0646\u0627\u0647`,
  },
  zh: {
    heading: "\u4e3a\u4f55\u503c\u5f97\u5173\u6ce8",
    covers: (topics) => `\u5173\u952e\u8bdd\u9898\uff1a${topics}`,
    coverage: (n) => `\u4e0b\u65b9\u8fd8\u6709 ${n} \u7bc7\u76f8\u5173\u62a5\u9053`,
    developing: "\u8fdb\u5c55\u4e2d\u7684\u65b0\u95fb\u2014\u2014\u6211\u4eec\u6bcf\u5c0f\u65f6\u66f4\u65b0\u62a5\u9053",
    fromSource: (source) => `\u539f\u6587\u6765\u81ea${source}\u2014\u2014\u5b8c\u6574\u62a5\u9053\u94fe\u63a5\u89c1\u4e0b\u65b9`,
  },
};

export function WhyItMatters({
  lang,
  article,
  relatedCount,
  isDeveloping,
}: {
  lang: Lang;
  article: Article;
  relatedCount: number;
  isDeveloping: boolean;
}) {
  const s = STRINGS[lang];
  const points: string[] = [];
  const topics = article.tags.slice(0, 3).join(lang === "zh" ? "\u3001" : " \u00b7 ");
  if (topics) points.push(s.covers(topics));
  if (relatedCount > 0) points.push(s.coverage(relatedCount));
  points.push(isDeveloping ? s.developing : s.fromSource(article.source));

  return (
    <aside className="mt-6 border-s-4 border-primary bg-muted/50 px-4 py-3">
      <p className="eyebrow text-primary">{s.heading}</p>
      {article.editorial ? (
        <p className="mt-2 text-sm leading-relaxed text-foreground">{article.editorial}</p>
      ) : null}
      <ul className="mt-2 space-y-1.5">
        {points.map((point, i) => (
          <li key={i} className="flex gap-2 text-sm text-muted-foreground">
            <span aria-hidden="true" className="text-primary">
              •
            </span>
            <span>{point}</span>
          </li>
        ))}
      </ul>
    </aside>
  );
}
