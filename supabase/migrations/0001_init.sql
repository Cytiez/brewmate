-- Brewmate initial schema
-- Run in Supabase SQL editor (or via supabase db push) on a fresh project.

create extension if not exists "pgcrypto";

-- ============================================================
-- beans
-- ============================================================
create table public.beans (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  name            text not null,
  roaster         text,
  origin_country  text,
  origin_region   text,
  process         text check (process in ('washed','natural','honey','anaerobic','other')),
  roast_level     text check (roast_level in ('light','medium','dark')),
  altitude_masl   int,
  density         text check (density in ('low','medium','high')),
  flavor_notes    text[] not null default '{}',
  roast_date      date,
  is_active       boolean not null default false,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create index beans_user_active_idx on public.beans (user_id, is_active);

-- ============================================================
-- equipment
-- ============================================================
create table public.equipment (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  kind          text not null check (kind in ('grinder','dripper','kettle')),
  name          text not null,
  grind_unit    text,
  temp_control  boolean,
  is_default    boolean not null default false,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create unique index equipment_one_default_per_kind
  on public.equipment (user_id, kind) where is_default;

-- ============================================================
-- brew_logs
-- ============================================================
create table public.brew_logs (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null references auth.users(id) on delete cascade,
  bean_id             uuid not null references public.beans(id) on delete cascade,
  grinder_id          uuid references public.equipment(id) on delete set null,
  dripper_id          uuid not null references public.equipment(id) on delete restrict,
  kettle_id           uuid references public.equipment(id) on delete set null,
  dose_g              numeric(5,2) not null check (dose_g > 0),
  water_g             numeric(6,1) not null check (water_g > 0),
  water_temp_c        numeric(4,1) check (water_temp_c between 0 and 100),
  grind_size          text not null,
  brew_time_seconds   int not null check (brew_time_seconds > 0),
  bloom_time_seconds  int check (bloom_time_seconds >= 0),
  bloom_water_g       numeric(5,1) check (bloom_water_g >= 0),
  taste_rating        text not null check (taste_rating in
    ('too_bitter','too_sour','too_weak','too_strong','flat','great')),
  taste_note          text,
  brewed_at           timestamptz not null default now(),
  created_at          timestamptz not null default now()
);
create index brew_logs_prefill_idx
  on public.brew_logs (user_id, bean_id, dripper_id, brewed_at desc);
create index brew_logs_user_brewed_idx
  on public.brew_logs (user_id, brewed_at desc);
create index brew_logs_bean_idx
  on public.brew_logs (user_id, bean_id, brewed_at desc);

-- ============================================================
-- ai_suggestions  (one per brew_log)
-- ============================================================
create table public.ai_suggestions (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references auth.users(id) on delete cascade,
  brew_log_id       uuid not null unique references public.brew_logs(id) on delete cascade,
  content           text not null,
  model             text not null default 'openrouter/gemma-2-9b-it:free',
  prompt_tokens     int,
  completion_tokens int,
  created_at        timestamptz not null default now()
);

-- ============================================================
-- ai_usage  (daily rate-limit ledger)
-- ============================================================
create table public.ai_usage (
  user_id  uuid not null references auth.users(id) on delete cascade,
  day      date not null,
  count    int  not null default 0,
  primary key (user_id, day)
);

-- ============================================================
-- Rate-limit RPC (atomic check-and-increment)
-- ============================================================
create or replace function public.check_and_increment_ai_usage(daily_limit int)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  today date := (now() at time zone 'utc')::date;
  new_count int;
begin
  if uid is null then
    return false;
  end if;

  insert into public.ai_usage (user_id, day, count)
  values (uid, today, 1)
  on conflict (user_id, day)
    do update set count = public.ai_usage.count + 1
  returning count into new_count;

  if new_count > daily_limit then
    -- roll back the increment so the user can retry tomorrow without skew
    update public.ai_usage set count = count - 1
      where user_id = uid and day = today;
    return false;
  end if;

  return true;
end;
$$;

revoke all on function public.check_and_increment_ai_usage(int) from public;
grant execute on function public.check_and_increment_ai_usage(int) to authenticated;

-- ============================================================
-- updated_at trigger
-- ============================================================
create or replace function public.tg_touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger beans_touch_updated_at      before update on public.beans      for each row execute function public.tg_touch_updated_at();
create trigger equipment_touch_updated_at  before update on public.equipment  for each row execute function public.tg_touch_updated_at();

-- ============================================================
-- RLS — enable on every table, owner-only policies
-- ============================================================
alter table public.beans          enable row level security;
alter table public.equipment      enable row level security;
alter table public.brew_logs      enable row level security;
alter table public.ai_suggestions enable row level security;
alter table public.ai_usage       enable row level security;

-- beans
create policy "beans_select_own" on public.beans for select using (auth.uid() = user_id);
create policy "beans_insert_own" on public.beans for insert with check (auth.uid() = user_id);
create policy "beans_update_own" on public.beans for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "beans_delete_own" on public.beans for delete using (auth.uid() = user_id);

-- equipment
create policy "equipment_select_own" on public.equipment for select using (auth.uid() = user_id);
create policy "equipment_insert_own" on public.equipment for insert with check (auth.uid() = user_id);
create policy "equipment_update_own" on public.equipment for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "equipment_delete_own" on public.equipment for delete using (auth.uid() = user_id);

-- brew_logs
create policy "brew_logs_select_own" on public.brew_logs for select using (auth.uid() = user_id);
create policy "brew_logs_insert_own" on public.brew_logs for insert with check (auth.uid() = user_id);
create policy "brew_logs_update_own" on public.brew_logs for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "brew_logs_delete_own" on public.brew_logs for delete using (auth.uid() = user_id);

-- ai_suggestions  (writes go through API route with service_role bypass OR server-side using user JWT;
--  here we allow user-owned reads, and inserts via auth user only)
create policy "ai_suggestions_select_own" on public.ai_suggestions for select using (auth.uid() = user_id);
create policy "ai_suggestions_insert_own" on public.ai_suggestions for insert with check (auth.uid() = user_id);

-- ai_usage  (only the RPC mutates this, which runs as security definer; reads scoped to owner)
create policy "ai_usage_select_own" on public.ai_usage for select using (auth.uid() = user_id);
