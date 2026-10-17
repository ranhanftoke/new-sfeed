import type { Category, Lang } from "./i18n";

export type Article = {
  slug: string;
  title: string;
  summary: string;
  content: string;
  link: string;
  source: string;
  category: Category;
  lang: Lang;
  publishedAt: string;
  image: string | null;
  tags: string[];
  /** Optional editorial note ("why it matters"). Shown above the auto context box. */
  editorial?: string | null;
};

export type ArticleCardData = Omit<Article, "content">;

export type HomeData = {
  lead: ArticleCardData | null;
  topStories: ArticleCardData[];
  byCategory: { category: Category; articles: ArticleCardData[] }[];
  trending: string[];
};

export type CategoryPageData = {
  articles: ArticleCardData[];
  total: number;
  page: number;
  pageSize: number;
};

export type ArticlePageData = {
  article: Article;
  related: ArticleCardData[];
  inline: ArticleCardData[];
  popular: ArticleCardData[];
  /** True when the article was published less than 6h ago (computed server-side). */
  isDeveloping: boolean;
};
