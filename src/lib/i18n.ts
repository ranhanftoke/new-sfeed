export const LANGS = ["en", "ar", "zh"] as const;
export type Lang = (typeof LANGS)[number];

export function isLang(value: string): value is Lang {
  return (LANGS as readonly string[]).includes(value);
}

export const LANG_META: Record<Lang, { label: string; htmlLang: string; dir: "ltr" | "rtl" }> = {
  en: { label: "English", htmlLang: "en", dir: "ltr" },
  ar: { label: "العربية", htmlLang: "ar", dir: "rtl" },
  zh: { label: "中文", htmlLang: "zh-Hans", dir: "ltr" },
};

export const CATEGORIES = [
  "world",
  "technology",
  "business",
  "sports",
  "culture",
  "science",
] as const;
export type Category = (typeof CATEGORIES)[number];

export function isCategory(value: string): value is Category {
  return (CATEGORIES as readonly string[]).includes(value);
}

type Dict = {
  siteName: string;
  tagline: string;
  siteDescription: string;
  categories: Record<Category, string>;
  breaking: string;
  latest: string;
  trending: string;
  related: string;
  readOriginal: string;
  liveScores: string;
  liveScoresBody: string;
  search: string;
  searchPlaceholder: string;
  searchResults: string;
  noResults: string;
  source: string;
  published: string;
  more: string;
  loadMore: string;
  page: string;
  prev: string;
  next: string;
  language: string;
  home: string;
  about: string;
  contact: string;
  privacy: string;
  terms: string;
  editorial: string;
  advertisement: string;
  footerNote: string;
  emptyFeed: string;
  contactName: string;
  contactEmail: string;
  contactSubject: string;
  contactMessage: string;
  contactSend: string;
  contactSent: string;
  minutesAgo: (n: number) => string;
  hoursAgo: (n: number) => string;
  daysAgo: (n: number) => string;
  justNow: string;
};

export const T: Record<Lang, Dict> = {
  en: {
    siteName: "Global Wire",
    tagline: "World news, updated every 15 minutes",
    siteDescription:
      "Global Wire aggregates world, technology, business, sports, culture and science headlines from trusted publishers, updated continuously.",
    categories: {
      world: "World",
      technology: "Technology & AI",
      business: "Business",
      sports: "Sports",
      culture: "Culture",
      science: "Science",
    },
    breaking: "Breaking",
    latest: "Latest",
    trending: "Trending topics",
    related: "Related stories",
    readOriginal: "Read original source ↗",
    liveScores: "GlobalScore — Live Scores & Results ↗",
    liveScoresBody: "Follow live scores, fixtures and results as they happen.",
    search: "Search",
    searchPlaceholder: "Search headlines…",
    searchResults: "Search results",
    noResults: "No stories matched your search.",
    source: "Source",
    published: "Published",
    more: "More",
    loadMore: "Load more",
    page: "Page",
    prev: "Previous",
    next: "Next",
    language: "Language",
    home: "Home",
    about: "About us",
    contact: "Contact",
    privacy: "Privacy policy",
    terms: "Terms of service",
    editorial: "Editorial guidelines",
    advertisement: "Advertisement",
    footerNote:
      "Headlines and summaries are syndicated from public RSS feeds. All rights remain with the original publishers.",
    emptyFeed: "Stories are being fetched. Please refresh in a moment.",
    contactName: "Your name",
    contactEmail: "Email address",
    contactSubject: "Subject",
    contactMessage: "Message",
    contactSend: "Send message",
    contactSent: "Thanks — your message is ready to send from your email app.",
    justNow: "just now",
    minutesAgo: (n) => `${n} min ago`,
    hoursAgo: (n) => `${n} h ago`,
    daysAgo: (n) => `${n} d ago`,
  },
  ar: {
    siteName: "غلوبال واير",
    tagline: "أخبار العالم، تُحدَّث كل 15 دقيقة",
    siteDescription:
      "غلوبال واير يجمع أخبار العالم والتقنية والاقتصاد والرياضة والثقافة والعلوم من مصادر موثوقة، مع تحديث مستمر.",
    categories: {
      world: "العالم",
      technology: "تقنية وذكاء اصطناعي",
      business: "اقتصاد",
      sports: "رياضة",
      culture: "ثقافة",
      science: "علوم",
    },
    breaking: "عاجل",
    latest: "الأحدث",
    trending: "الأكثر تداولاً",
    related: "أخبار ذات صلة",
    readOriginal: "اقرأ المصدر الأصلي ↗",
    liveScores: "GlobalScore — نتائج مباشرة ↗",
    liveScoresBody: "تابع النتائج المباشرة والمباريات لحظة بلحظة.",
    search: "بحث",
    searchPlaceholder: "ابحث في العناوين…",
    searchResults: "نتائج البحث",
    noResults: "لا توجد أخبار مطابقة لبحثك.",
    source: "المصدر",
    published: "تاريخ النشر",
    more: "المزيد",
    loadMore: "تحميل المزيد",
    page: "صفحة",
    prev: "السابق",
    next: "التالي",
    language: "اللغة",
    home: "الرئيسية",
    about: "من نحن",
    contact: "اتصل بنا",
    privacy: "سياسة الخصوصية",
    terms: "شروط الاستخدام",
    editorial: "السياسة التحريرية",
    advertisement: "إعلان",
    footerNote:
      "العناوين والملخصات مأخوذة من خلاصات RSS العامة، وجميع الحقوق محفوظة للناشرين الأصليين.",
    emptyFeed: "جاري تحميل الأخبار، حدّث الصفحة بعد لحظات.",
    contactName: "الاسم",
    contactEmail: "البريد الإلكتروني",
    contactSubject: "الموضوع",
    contactMessage: "الرسالة",
    contactSend: "إرسال",
    contactSent: "شكراً — رسالتك جاهزة للإرسال من تطبيق البريد.",
    justNow: "الآن",
    minutesAgo: (n) => `قبل ${n} دقيقة`,
    hoursAgo: (n) => `قبل ${n} ساعة`,
    daysAgo: (n) => `قبل ${n} يوم`,
  },
  zh: {
    siteName: "环球通讯",
    tagline: "全球新闻，每 15 分钟更新",
    siteDescription:
      "环球通讯汇集国际、科技、财经、体育、文化与科学领域的权威媒体头条，持续更新。",
    categories: {
      world: "国际",
      technology: "科技与人工智能",
      business: "财经",
      sports: "体育",
      culture: "文化",
      science: "科学",
    },
    breaking: "突发",
    latest: "最新",
    trending: "热门话题",
    related: "相关报道",
    readOriginal: "阅读原文 ↗",
    liveScores: "GlobalScore — 实时比分与赛果 ↗",
    liveScoresBody: "实时关注比分、赛程与赛果。",
    search: "搜索",
    searchPlaceholder: "搜索标题…",
    searchResults: "搜索结果",
    noResults: "没有找到相关报道。",
    source: "来源",
    published: "发布时间",
    more: "更多",
    loadMore: "加载更多",
    page: "第",
    prev: "上一页",
    next: "下一页",
    language: "语言",
    home: "首页",
    about: "关于我们",
    contact: "联系我们",
    privacy: "隐私政策",
    terms: "服务条款",
    editorial: "编辑准则",
    advertisement: "广告",
    footerNote: "标题与摘要来自公开 RSS 源，版权归原出版方所有。",
    emptyFeed: "正在获取新闻，请稍后刷新。",
    contactName: "姓名",
    contactEmail: "电子邮箱",
    contactSubject: "主题",
    contactMessage: "留言内容",
    contactSend: "发送",
    contactSent: "谢谢 — 邮件已在您的邮件应用中准备好。",
    justNow: "刚刚",
    minutesAgo: (n) => `${n} 分钟前`,
    hoursAgo: (n) => `${n} 小时前`,
    daysAgo: (n) => `${n} 天前`,
  },
};

export function relativeTime(iso: string, lang: Lang): string {
  const t = T[lang];
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.round(diff / 60000);
  if (min < 1) return t.justNow;
  if (min < 60) return t.minutesAgo(min);
  const h = Math.round(min / 60);
  if (h < 24) return t.hoursAgo(h);
  return t.daysAgo(Math.round(h / 24));
}

export function formatDate(iso: string, lang: Lang): string {
  const locale = lang === "ar" ? "ar" : lang === "zh" ? "zh-CN" : "en-GB";
  return new Date(iso).toLocaleDateString(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
