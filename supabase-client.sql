-- ============================================================================
-- user_roles table — run this in Supabase SQL Editor
-- Adds role management on top of the existing schema
-- ============================================================================

create table if not exists public.user_roles (
  id          uuid primary key default gen_random_uuid(),
  email       text not null unique,
  role        text not null default 'assistant', -- 'owner' | 'assistant'
  added_by    uuid references auth.users(id) on delete cascade,
  created_at  timestamptz not null default now()
);

alter table public.user_roles enable row level security;

-- Owner can read all roles
drop policy if exists "roles_select" on public.user_roles;
create policy "roles_select"
  on public.user_roles for select
  using (auth.uid() is not null);

-- Owner can insert/update/delete roles
drop policy if exists "roles_insert" on public.user_roles;
create policy "roles_insert"
  on public.user_roles for insert
  with check (auth.uid() = added_by);

drop policy if exists "roles_update" on public.user_roles;
create policy "roles_update"
  on public.user_roles for update
  using (auth.uid() = added_by);

drop policy if exists "roles_delete" on public.user_roles;
create policy "roles_delete"
  on public.user_roles for delete
  using (auth.uid() = added_by);

-- Grant access to anon/authenticated
grant select, insert, update, delete on public.user_roles to authenticated;
