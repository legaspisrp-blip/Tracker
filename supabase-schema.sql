-- ============================================================================
-- Ledger · Supabase schema (auth version)
-- Run this ONCE in your Supabase project SQL editor.
-- Dashboard -> SQL Editor -> New Query -> paste -> Run
--
-- This version uses Supabase Auth. Each user gets their own private row.
-- Row-Level Security ensures no user can see another user's data.
-- ============================================================================

-- Drop old no-auth table
drop table if exists public.user_data;

-- One row per authenticated user
create table if not exists public.user_data (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  data       jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- Enable Row-Level Security
alter table public.user_data enable row level security;

-- Each user can only read their own row
drop policy if exists "user_data_select_own" on public.user_data;
create policy "user_data_select_own"
  on public.user_data for select
  using (auth.uid() = user_id);

-- Each user can only insert their own row
drop policy if exists "user_data_insert_own" on public.user_data;
create policy "user_data_insert_own"
  on public.user_data for insert
  with check (auth.uid() = user_id);

-- Each user can only update their own row
drop policy if exists "user_data_update_own" on public.user_data;
create policy "user_data_update_own"
  on public.user_data for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Keep updated_at fresh on every write
create or replace function public.touch_user_data_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_user_data_updated_at on public.user_data;
create trigger set_user_data_updated_at
  before update on public.user_data
  for each row execute function public.touch_user_data_updated_at();

-- Verify with:
--   select * from public.user_data;    -- empty until first sign-in
--   select * from auth.users;          -- empty until first sign-up
