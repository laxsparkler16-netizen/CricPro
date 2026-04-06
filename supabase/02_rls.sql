-- ============================================================
-- CricPro Row Level Security (RLS) Policies
-- Run this second in the Supabase SQL Editor
-- ============================================================

-- Enable RLS on all tables
alter table public.profiles enable row level security;
alter table public.matches enable row level security;
alter table public.player_stats enable row level security;
alter table public.commentary enable row level security;

-- -------------------------------------------------------
-- PROFILES
-- -------------------------------------------------------
-- Anyone can read profiles (needed for display names)
create policy "profiles_select_all"
  on public.profiles for select
  using (true);

-- Users can only insert/update their own profile
create policy "profiles_insert_own"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id);

-- -------------------------------------------------------
-- MATCHES
-- -------------------------------------------------------
-- Anyone authenticated can read all matches (monitor)
create policy "matches_select_authenticated"
  on public.matches for select
  using (auth.role() = 'authenticated');

-- Only authenticated users can create matches
create policy "matches_insert_own"
  on public.matches for insert
  with check (auth.uid() = created_by);

-- Only the match creator can update/delete their match
create policy "matches_update_own"
  on public.matches for update
  using (auth.uid() = created_by);

create policy "matches_delete_own"
  on public.matches for delete
  using (auth.uid() = created_by);

-- -------------------------------------------------------
-- PLAYER STATS
-- -------------------------------------------------------
-- Users can read their own player stats
create policy "player_stats_select_own"
  on public.player_stats for select
  using (auth.uid() = owner_id);

-- Users can insert/update/delete their own player stats
create policy "player_stats_insert_own"
  on public.player_stats for insert
  with check (auth.uid() = owner_id);

create policy "player_stats_update_own"
  on public.player_stats for update
  using (auth.uid() = owner_id);

create policy "player_stats_delete_own"
  on public.player_stats for delete
  using (auth.uid() = owner_id);

-- -------------------------------------------------------
-- COMMENTARY
-- -------------------------------------------------------
-- Anyone authenticated can read commentary
create policy "commentary_select_authenticated"
  on public.commentary for select
  using (auth.role() = 'authenticated');

-- Only the match creator can insert commentary
create policy "commentary_insert_match_owner"
  on public.commentary for insert
  with check (
    auth.uid() = (
      select created_by from public.matches where id = match_id
    )
  );
