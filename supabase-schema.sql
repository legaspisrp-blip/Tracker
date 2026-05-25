-- ============================================================================
-- Ledger · Supabase schema (no-auth version)
-- Run this ONCE in your Supabase project's SQL editor.
-- (Dashboard → SQL Editor → New Query → paste this → Run)
--
-- This version uses a device ID (stored in localStorage) instead of auth.
-- No login required. One device = one row in this table.
-- ============================================================================

-- Drop old table if you ran the previous schema
drop table if exists public.user_data;

-- One row per device. All app data lives in the `data` jsonb column.
create table if not exists public.user_data (
  user_id    text primary key,        -- device ID from localStorage (no auth)
  data       jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- Disable Row-Level Security (no auth = no per-user isolation needed)
alter table public.user_data disable row level security;

-- Allow the anon key to read and write freely
grant select, insert, update, delete on public.user_data to anon;

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

-- Done. Verify with:
--   select * from public.user_data;    -- empty until first app load
