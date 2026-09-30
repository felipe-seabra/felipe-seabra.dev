-- Portfolio CMS baseline schema.
-- Kept aligned with supabase/schema.sql so local RLS tests run against the real policy definitions.

create extension if not exists pgcrypto;

create table if not exists public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  category text not null default '',
  description text not null default '',
  stack text[] not null default '{}',
  href text not null default '#contact',
  image_url text,
  featured boolean not null default false,
  published boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.timeline_entries (
  id uuid primary key default gen_random_uuid(),
  chapter text not null,
  period text not null,
  title text not null,
  body text not null default '',
  tags text[] not null default '{}',
  published boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.site_content (
  id uuid primary key default gen_random_uuid(),
  locale text not null check (locale in ('en', 'pt')),
  section text not null,
  field text not null,
  value text not null default '',
  updated_at timestamptz not null default now(),
  unique(locale, section, field)
);

create index if not exists projects_public_order_idx on public.projects (published, featured, sort_order);
create index if not exists timeline_public_order_idx on public.timeline_entries (published, sort_order);

alter table public.admins enable row level security;
alter table public.projects enable row level security;
alter table public.timeline_entries enable row level security;
alter table public.site_content enable row level security;

revoke all on table public.admins from anon, authenticated;
grant select on table public.projects to anon, authenticated;
grant select, insert, update, delete on table public.projects to authenticated;
grant select on table public.timeline_entries to anon, authenticated;
grant select, insert, update, delete on table public.timeline_entries to authenticated;
grant select on table public.site_content to anon, authenticated;
grant select, insert, update, delete on table public.site_content to authenticated;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.admins
    where user_id = (select auth.uid())
  );
$$;

revoke execute on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

drop policy if exists "Public can read published projects" on public.projects;
create policy "Public can read published projects" on public.projects for select to anon, authenticated using (published = true);

drop policy if exists "Admins can manage projects" on public.projects;
create policy "Admins can manage projects" on public.projects for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));

drop policy if exists "Public can read published timeline" on public.timeline_entries;
create policy "Public can read published timeline" on public.timeline_entries for select to anon, authenticated using (published = true);

drop policy if exists "Admins can manage timeline" on public.timeline_entries;
create policy "Admins can manage timeline" on public.timeline_entries for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));

drop policy if exists "Public can read site content" on public.site_content;
create policy "Public can read site content" on public.site_content for select to anon, authenticated using (true);

drop policy if exists "Admins can manage site content" on public.site_content;
create policy "Admins can manage site content" on public.site_content for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
