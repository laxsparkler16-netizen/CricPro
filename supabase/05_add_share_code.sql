-- ============================================================
-- Migration: Add share_code to matches
-- Run this in the Supabase SQL Editor (one-time)
-- ============================================================

-- Add share_code column if it doesn't exist
alter table public.matches
  add column if not exists share_code char(4) unique;

-- Backfill any existing rows that have no code
update public.matches
  set share_code = lpad(floor(random() * 10000)::text, 4, '0')
  where share_code is null;

-- Make it not null now that all rows have a value
alter table public.matches
  alter column share_code set not null;

-- Set the default for future inserts
alter table public.matches
  alter column share_code set default lpad(floor(random() * 10000)::text, 4, '0');

-- Index for fast lookups
create index if not exists matches_share_code_idx on public.matches(share_code);
