create extension if not exists pgcrypto;

create sequence if not exists public.resource_contributor_number_seq
  start with 1
  increment by 1;

create table if not exists public.contributors (
  id uuid primary key default gen_random_uuid(),
  contributor_number bigint unique not null default nextval('public.resource_contributor_number_seq'),
  name text not null default 'Anonymous Contributor',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint contributors_contributor_number_positive check (contributor_number > 0)
);

create table if not exists public.resource_submissions (
  id uuid primary key default gen_random_uuid(),
  contributor_id uuid not null references public.contributors(id) on delete restrict,
  title text not null,
  url text not null,
  status text not null default 'pending',
  submitter_ip inet,
  user_agent text,
  submitted_at timestamptz not null default now(),
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint resource_submissions_status_check check (status in ('pending', 'approved', 'rejected')),
  constraint resource_submissions_title_check check (char_length(trim(title)) between 1 and 200),
  constraint resource_submissions_url_check check (
    char_length(trim(url)) between 1 and 2000
    and trim(url) ~* '^https?://'
  )
);

create unique index if not exists resource_submissions_url_unique
  on public.resource_submissions (lower(trim(url)));

create index if not exists resource_submissions_status_idx
  on public.resource_submissions (status);

create index if not exists resource_submissions_contributor_idx
  on public.resource_submissions (contributor_id);

create index if not exists resource_submissions_submitted_at_idx
  on public.resource_submissions (submitted_at desc);

create index if not exists resource_submissions_submitter_ip_idx
  on public.resource_submissions (submitter_ip);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_contributors_updated_at on public.contributors;
create trigger set_contributors_updated_at
before update on public.contributors
for each row
execute function public.set_updated_at();

drop trigger if exists set_resource_submissions_updated_at on public.resource_submissions;
create trigger set_resource_submissions_updated_at
before update on public.resource_submissions
for each row
execute function public.set_updated_at();

alter table public.contributors enable row level security;
alter table public.resource_submissions enable row level security;

create or replace function public.anonymize_expired_submission_ips(retention_days integer default 90)
returns integer
language plpgsql
security definer
as $$
declare
  affected_rows integer;
begin
  update public.resource_submissions
  set submitter_ip = null,
      user_agent = null,
      updated_at = now()
  where submitter_ip is not null
    and submitted_at < (now() - make_interval(days => greatest(retention_days, 1)));

  get diagnostics affected_rows = row_count;
  return affected_rows;
end;
$$;
