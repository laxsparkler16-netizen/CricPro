-- ============================================================
-- CricPro Realtime Setup
-- Run this third in the Supabase SQL Editor
-- Enables live score updates for spectators
-- ============================================================

-- Enable realtime for matches table (so spectators see live score updates)
alter publication supabase_realtime add table public.matches;

-- Enable realtime for commentary table
alter publication supabase_realtime add table public.commentary;
