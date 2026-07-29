create extension if not exists pgcrypto;

create table if not exists public.projects (
  id text primary key,
  slug_tr text not null unique,
  slug_en text not null unique,
  published boolean not null default true,
  sort_order integer not null default 0,
  translations jsonb not null default '{}'::jsonb,
  seo jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.projects add column if not exists seo jsonb not null default '{}'::jsonb;
alter table public.projects add column if not exists featured boolean not null default false;
alter table public.projects add column if not exists category text;
alter table public.projects add column if not exists year text;
alter table public.projects add column if not exists location text;
alter table public.projects add column if not exists gallery jsonb not null default '[]'::jsonb;

create index if not exists projects_published_order_idx on public.projects (published, sort_order);

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

drop trigger if exists projects_set_updated_at on public.projects;
create trigger projects_set_updated_at before update on public.projects
for each row execute function public.set_updated_at();

alter table public.projects enable row level security;

-- Public visitors can only read published projects. Server-side writes use the service role key.
drop policy if exists "Public can read published projects" on public.projects;
create policy "Public can read published projects" on public.projects
for select using (published = true);

insert into storage.buckets (id, name, public)
values ('project-images', 'project-images', true)
on conflict (id) do update set public = excluded.public;

create table if not exists public.post_categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  translations jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create table if not exists public.post_tags (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  translations jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  status text not null default 'draft' check (status in ('draft','published','scheduled')),
  author text not null default 'ARZ Mimarlık',
  cover_url text,
  category_id uuid references public.post_categories(id) on delete set null,
  tag_ids uuid[] not null default '{}',
  publish_at timestamptz,
  translations jsonb not null default '{}'::jsonb,
  seo jsonb not null default '{}'::jsonb,
  slugs jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists posts_status_publish_idx on public.posts(status,publish_at);
create unique index if not exists posts_slug_tr_unique on public.posts ((slugs->>'tr')) where slugs ? 'tr';
create unique index if not exists posts_slug_en_unique on public.posts ((slugs->>'en')) where slugs ? 'en';
create unique index if not exists posts_slug_de_unique on public.posts ((slugs->>'de')) where slugs ? 'de';
create unique index if not exists posts_slug_fr_unique on public.posts ((slugs->>'fr')) where slugs ? 'fr';
create unique index if not exists posts_slug_es_unique on public.posts ((slugs->>'es')) where slugs ? 'es';
create unique index if not exists posts_slug_nl_unique on public.posts ((slugs->>'nl')) where slugs ? 'nl';
create unique index if not exists posts_slug_ar_unique on public.posts ((slugs->>'ar')) where slugs ? 'ar';
create unique index if not exists posts_slug_ja_unique on public.posts ((slugs->>'ja')) where slugs ? 'ja';
create unique index if not exists posts_slug_ko_unique on public.posts ((slugs->>'ko')) where slugs ? 'ko';
create unique index if not exists posts_slug_zh_unique on public.posts ((slugs->>'zh')) where slugs ? 'zh';

create table if not exists public.media (
  id uuid primary key default gen_random_uuid(),
  filename text not null,
  storage_path text not null unique,
  url text not null,
  mime_type text not null,
  size_bytes bigint not null default 0,
  width integer,
  height integer,
  alt_texts jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists media_filename_idx on public.media(filename);

create table if not exists public.site_translations (
  key text primary key,
  source_tr text not null,
  translations jsonb not null default '{}'::jsonb,
  stale_locales text[] not null default '{}',
  updated_at timestamptz not null default now()
);

create table if not exists public.ai_budget_settings (
  id text primary key default 'default' check (id = 'default'),
  initial_credit_usd numeric not null default 0,
  warning_threshold_usd numeric not null default 3,
  critical_threshold_usd numeric not null default 1,
  updated_at timestamptz not null default now()
);
insert into public.ai_budget_settings(id, initial_credit_usd, warning_threshold_usd, critical_threshold_usd)
values ('default', 0, 3, 1) on conflict (id) do nothing;

grant usage on schema public to service_role;
grant select, insert, update, delete on table public.ai_budget_settings to service_role;
grant select, insert, update, delete on table public.posts to service_role;
grant select, insert, update, delete on table public.post_categories to service_role;
grant select, insert, update, delete on table public.post_tags to service_role;
grant select, insert, update, delete on table public.media to service_role;
grant usage, select on all sequences in schema public to service_role;

drop trigger if exists posts_set_updated_at on public.posts;
create trigger posts_set_updated_at before update on public.posts for each row execute function public.set_updated_at();
drop trigger if exists site_translations_set_updated_at on public.site_translations;
create trigger site_translations_set_updated_at before update on public.site_translations for each row execute function public.set_updated_at();

alter table public.posts enable row level security;
alter table public.post_categories enable row level security;
alter table public.post_tags enable row level security;
alter table public.media enable row level security;
alter table public.site_translations enable row level security;
alter table public.ai_budget_settings enable row level security;
drop policy if exists "Public can read published posts" on public.posts;
create policy "Public can read published posts" on public.posts for select using (
  status = 'published' and (publish_at is null or publish_at <= now())
);
drop policy if exists "Public can read post categories" on public.post_categories;
create policy "Public can read post categories" on public.post_categories for select using (true);
drop policy if exists "Public can read post tags" on public.post_tags;
create policy "Public can read post tags" on public.post_tags for select using (true);
drop policy if exists "Public can read media" on public.media;
create policy "Public can read media" on public.media for select using (true);
drop policy if exists "Public can read site translations" on public.site_translations;
create policy "Public can read site translations" on public.site_translations for select using (true);

insert into storage.buckets(id,name,public) values ('media','media',true)
on conflict(id) do update set public=excluded.public;

drop policy if exists "Public can view media bucket" on storage.objects;
create policy "Public can view media bucket"
on storage.objects for select
to public
using (bucket_id = 'media');

notify pgrst, 'reload schema';
