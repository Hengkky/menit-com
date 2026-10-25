create extension if not exists pgcrypto;

do $$ begin
  create type public.user_role as enum ('super_admin', 'editor', 'author', 'media_admin', 'reader');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.article_status as enum ('draft', 'review', 'published', 'archived');
exception when duplicate_object then null;
end $$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  role public.user_role not null default 'reader',
  created_at timestamptz not null default now()
);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.articles (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  excerpt text not null default '',
  content text not null default '',
  thumbnail_url text,
  category_id uuid references public.categories(id) on delete set null,
  author_id uuid not null references public.profiles(id) on delete restrict,
  status public.article_status not null default 'draft',
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.article_media (
  id uuid primary key default gen_random_uuid(),
  article_id uuid not null references public.articles(id) on delete cascade,
  storage_path text not null,
  media_type text not null,
  alt_text text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists articles_status_idx on public.articles(status);
create index if not exists articles_published_at_idx on public.articles(published_at desc);
create index if not exists articles_category_id_idx on public.articles(category_id);
create index if not exists article_media_article_id_idx on public.article_media(article_id);

create or replace function public.set_updated_at()
returns trigger language plpgsql security invoker set search_path = public as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists articles_set_updated_at on public.articles;
create trigger articles_set_updated_at
before update on public.articles
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', new.email))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create or replace function public.current_user_role()
returns public.user_role language sql stable security definer set search_path = public as $$
  select role from public.profiles where id = auth.uid();
$$;

alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.articles enable row level security;
alter table public.article_media enable row level security;

drop policy if exists profiles_select_own on public.profiles;
create policy profiles_select_own on public.profiles for select to authenticated
using (id = auth.uid() or public.current_user_role() in ('super_admin', 'editor'));

drop policy if exists profiles_manage_admin on public.profiles;
create policy profiles_manage_admin on public.profiles for all to authenticated
using (public.current_user_role() = 'super_admin')
with check (public.current_user_role() = 'super_admin');

drop policy if exists categories_public_read on public.categories;
create policy categories_public_read on public.categories for select to anon, authenticated
using (is_active = true or public.current_user_role() in ('super_admin', 'editor'));

drop policy if exists categories_manage_editor on public.categories;
create policy categories_manage_editor on public.categories for all to authenticated
using (public.current_user_role() in ('super_admin', 'editor'))
with check (public.current_user_role() in ('super_admin', 'editor'));

drop policy if exists articles_public_read on public.articles;
create policy articles_public_read on public.articles for select to anon, authenticated
using (status = 'published');

drop policy if exists articles_author_insert on public.articles;
create policy articles_author_insert on public.articles for insert to authenticated
with check (author_id = auth.uid() and status = 'draft');

drop policy if exists articles_author_update on public.articles;
create policy articles_author_update on public.articles for update to authenticated
using (author_id = auth.uid() and status = 'draft')
with check (author_id = auth.uid() and status = 'draft');

drop policy if exists articles_editor_manage on public.articles;
create policy articles_editor_manage on public.articles for all to authenticated
using (public.current_user_role() in ('super_admin', 'editor'))
with check (public.current_user_role() in ('super_admin', 'editor'));

drop policy if exists article_media_public_read on public.article_media;
create policy article_media_public_read on public.article_media for select to anon, authenticated
using (exists (select 1 from public.articles a where a.id = article_id and a.status = 'published'));

drop policy if exists article_media_author_manage on public.article_media;
create policy article_media_author_manage on public.article_media for all to authenticated
using (exists (select 1 from public.articles a where a.id = article_id and a.author_id = auth.uid() and a.status = 'draft'))
with check (exists (select 1 from public.articles a where a.id = article_id and a.author_id = auth.uid() and a.status = 'draft'));

drop policy if exists article_media_editor_manage on public.article_media;
create policy article_media_editor_manage on public.article_media for all to authenticated
using (public.current_user_role() in ('super_admin', 'editor'))
with check (public.current_user_role() in ('super_admin', 'editor'));
