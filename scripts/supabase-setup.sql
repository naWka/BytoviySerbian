-- BS-22: хранилище прогресса пользователя в Supabase.
-- Выполнить один раз: Supabase → SQL Editor → New query → вставить → Run.
-- Одна строка на пользователя, весь прогресс приложения — в JSON-поле state.
-- RLS: пользователь видит и меняет ТОЛЬКО свою строку.

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  state jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
  on public.profiles for insert
  with check (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);
