-- ============================================================
-- CricPro Supabase Schema
-- Run this first in the Supabase SQL Editor
-- ============================================================

-- Profiles table (extends Supabase auth.users)
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  username text unique not null,
  display_name text not null,
  created_at timestamptz default now()
);

-- Matches table
create table if not exists public.matches (
  id uuid default gen_random_uuid() primary key,
  share_code char(4) unique not null default lpad(floor(random() * 10000)::text, 4, '0'),
  created_by uuid references auth.users(id) on delete cascade not null,
  team_a text not null default 'Team A',
  team_b text not null default 'Team B',
  color_a text not null default '#0ea5e9',
  color_b text not null default '#ef4444',
  overs int not null default 20,
  num_players int not null default 11,
  players_a text[] not null default '{}',
  players_b text[] not null default '{}',
  -- Live scoring state (JSON blob for flexibility)
  score jsonb not null default '{"runs":0,"wickets":0,"balls":0,"battingTeam":"A","battedPlayers":[],"partnership":{"runs":0,"balls":0},"innings":1,"firstInningsScore":null}',
  batsmen jsonb not null default '{"onStrike":{"name":"","runs":0,"balls":0},"nonStriker":{"name":"","runs":0,"balls":0}}',
  current_bowler jsonb not null default '{"name":"","overs":0,"runs":0,"wickets":0}',
  match_stats jsonb not null default '{}',
  toss jsonb not null default '{"winner":null,"choice":null}',
  status text not null default 'setup' check (status in ('setup','live','completed')),
  -- Final result (populated on completion)
  score_a int,
  wickets_a int,
  score_b int,
  wickets_b int,
  man_of_match text,
  completed_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Player stats table (aggregated across matches per user)
create table if not exists public.player_stats (
  id uuid default gen_random_uuid() primary key,
  owner_id uuid references auth.users(id) on delete cascade not null,
  player_name text not null,
  runs int not null default 0,
  wickets int not null default 0,
  matches int not null default 0,
  updated_at timestamptz default now(),
  unique(owner_id, player_name)
);

-- Commentary table (per match)
create table if not exists public.commentary (
  id uuid default gen_random_uuid() primary key,
  match_id uuid references public.matches(id) on delete cascade not null,
  text text not null,
  event text not null,
  created_at timestamptz default now()
);

-- Auto-update updated_at on matches
create or replace function public.handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger matches_updated_at
  before update on public.matches
  for each row execute function public.handle_updated_at();

-- Index for fast share_code lookups
create index if not exists matches_share_code_idx on public.matches(share_code);
