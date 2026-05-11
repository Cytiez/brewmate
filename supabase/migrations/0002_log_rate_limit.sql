-- Brewmate 0002 — sibling RPC: limit brew-log creation, not just AI calls.
-- Prevents a stolen anon JWT from spamming inserts into brew_logs.

create table if not exists public.log_creation_usage (
  user_id  uuid not null references auth.users(id) on delete cascade,
  day      date not null,
  count    int  not null default 0,
  primary key (user_id, day)
);

alter table public.log_creation_usage enable row level security;

create policy "log_creation_usage_select_own"
  on public.log_creation_usage
  for select using (auth.uid() = user_id);

-- Atomic check-and-increment, mirroring check_and_increment_ai_usage.
create or replace function public.check_and_increment_log_creation(daily_limit int)
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

  insert into public.log_creation_usage (user_id, day, count)
  values (uid, today, 1)
  on conflict (user_id, day)
    do update set count = public.log_creation_usage.count + 1
  returning count into new_count;

  if new_count > daily_limit then
    update public.log_creation_usage set count = count - 1
      where user_id = uid and day = today;
    return false;
  end if;

  return true;
end;
$$;

revoke all on function public.check_and_increment_log_creation(int) from public;
grant execute on function public.check_and_increment_log_creation(int) to authenticated;
