-- Global Wire article archive — paste into Supabase SQL Editor and run once.
-- (Same shape as drizzle/schema.ts; the app reads via Drizzle ORM.)

create table if not exists articles (
  id serial primary key,
  slug text not null,
  title text not null,
  summary text,
  content text,
  link text not null unique,
  source text,
  category text not null,
  lang text not null,
  published_at timestamptz,
  image text,
  tags text[],
  created_at timestamptz default now(),
  unique (lang, slug)
);

create index if not exists articles_lang_cat_pub_idx
  on articles (lang, category, published_at desc);

create index if not exists articles_lang_pub_idx
  on articles (lang, published_at desc);
