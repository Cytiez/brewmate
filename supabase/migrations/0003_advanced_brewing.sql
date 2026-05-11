-- Brewmate 0003 — advanced brewing fields.
-- Adds:
--   * immersion flag (Hario Switch, French Press, Aeropress, etc.)
--   * pours      JSONB array of {time_seconds, water_g} entries for multi-pour
--                recipes (V60 4:6, Tetsu Kasuya, James Hoffmann variants, …)
-- Both columns are optional — older logs and basic brews leave them null/empty.

alter table public.brew_logs
  add column if not exists immersion boolean not null default false,
  add column if not exists pours      jsonb   not null default '[]'::jsonb;

-- Shape guard: must be a JSON array. Individual element shape is enforced at
-- the application layer (Zod) — keeping the DB constraint loose avoids painful
-- migrations later when we add per-pour notes / drawdown markers.
alter table public.brew_logs
  add constraint brew_logs_pours_is_array
  check (jsonb_typeof(pours) = 'array');
