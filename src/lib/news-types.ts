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
};
