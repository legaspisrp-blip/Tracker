-- ============================================================================
-- Ledger · Full schema reset — run this in Supabase SQL Editor
-- This replaces all previous schemas with the correct auth-based version
-- ============================================================================

-- Drop everything and start clean
drop table if exists public.user_roles;
drop table if exists public.user_data;

-- ── user_data ──────────────────────────────────────────────────────────────
create table public.user_data (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  data       jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.user_data enable row level security;

create policy "user_data_select" on public.user_data
  for select using (auth.uid() = user_id);
create policy "user_data_insert" on public.user_data
  for insert with check (auth.uid() = user_id);
create policy "user_data_update" on public.user_data
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ── user_roles ─────────────────────────────────────────────────────────────
create table public.user_roles (
  id         uuid primary key default gen_random_uuid(),
  email      text not null unique,
  role       text not null default 'assistant',
  added_by   uuid references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.user_roles enable row level security;

create policy "roles_select" on public.user_roles
  for select using (auth.uid() is not null);
create policy "roles_insert" on public.user_roles
  for insert with check (auth.uid() = added_by);
create policy "roles_update" on public.user_roles
  for update using (auth.uid() = added_by);
create policy "roles_delete" on public.user_roles
  for delete using (auth.uid() = added_by);

grant select, insert, update on public.user_data to authenticated;
grant select, insert, update, delete on public.user_roles to authenticated;

-- ── updated_at trigger ─────────────────────────────────────────────────────
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

drop trigger if exists set_updated_at on public.user_data;
create trigger set_updated_at
  before update on public.user_data
  for each row execute function public.touch_updated_at();
