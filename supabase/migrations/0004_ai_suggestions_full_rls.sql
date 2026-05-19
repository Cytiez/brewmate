-- ============================================================
-- 0004 — ai_suggestions: complete the RLS policy set
-- ============================================================
-- The initial migration only wired SELECT and INSERT policies for
-- ai_suggestions. The /api/suggest route uses upsert (which counts as UPDATE
-- under RLS) and users should be able to delete their own suggestions; both
-- were previously blocked.
--
-- These mirror the brew_logs policy pattern (auth.uid() = user_id, with check
-- on update to prevent re-assigning rows to another user).

create policy "ai_suggestions_update_own" on public.ai_suggestions
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "ai_suggestions_delete_own" on public.ai_suggestions
  for delete
  using (auth.uid() = user_id);
