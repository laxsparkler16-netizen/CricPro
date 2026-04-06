-- ============================================================
-- CricPro Helper Functions
-- Run this fourth in the Supabase SQL Editor
-- ============================================================

-- Upsert player stat (increments existing or inserts new)
create or replace function public.upsert_player_stat(
  p_owner_id uuid,
  p_player_name text,
  p_runs int,
  p_wickets int
)
returns void language plpgsql security definer as $$
begin
  insert into public.player_stats (owner_id, player_name, runs, wickets, matches)
  values (p_owner_id, p_player_name, p_runs, p_wickets, 1)
  on conflict (owner_id, player_name)
  do update set
    runs = player_stats.runs + excluded.runs,
    wickets = player_stats.wickets + excluded.wickets,
    matches = player_stats.matches + 1,
    updated_at = now();
end;
$$;
