-- ============================================================================
-- Ledger · Supabase schema
-- Run this ONCE in your Supabase project's SQL editor.
-- (Dashboard → SQL Editor → New Query → paste this → Run)
-- ============================================================================

-- One row per user. All app data lives in the `data` jsonb column.
-- Conflict model: last-write-wins. Perfect for single-user-per-account.
create table if not exists public.user_data (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  data       jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- Enable Row-Level Security: every user only sees their own row.
alter table public.user_data enable row level security;

-- Allow each authenticated user to read and write their own row.
drop policy if exists "user_data_select_own" on public.user_data;
create policy "user_data_select_own"
  on public.user_data for select
  using (auth.uid() = user_id);

drop policy if exists "user_data_insert_own" on public.user_data;
create policy "user_data_insert_own"
  on public.user_data for insert
  with check (auth.uid() = user_id);

drop policy if exists "user_data_update_own" on public.user_data;
create policy "user_data_update_own"
  on public.user_data for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Keep updated_at fresh on writes.
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

-- Done. Verify with:
--   select * from public.user_data;        -- empty
--   select * from auth.users;              -- empty until first sign-up
