<div align="center">

# 🏏 CricPro

**Live cricket scoring and analytics with AI-powered Tamil commentary**

![React](https://img.shields.io/badge/React-19-61DAFB?style=flat&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=flat&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-06B6D4?style=flat&logo=tailwindcss)
![Vite](https://img.shields.io/badge/Vite-6-646CFF?style=flat&logo=vite)
![Supabase](https://img.shields.io/badge/Supabase-Backend-3ECF8E?style=flat&logo=supabase)
![Gemini](https://img.shields.io/badge/Gemini-1.5_Flash-4285F4?style=flat&logo=google)

</div>

---

## What is CricPro?

CricPro is a full-featured cricket scoring app for local matches. Sign in, set up a game, score ball by ball, and share a 4-digit code so anyone can watch live. Player stats and match history are persisted to Supabase, and every ball gets a fun Tamil commentary line powered by Google Gemini AI.

---

## Features

- **Auth** — email/password sign up and sign in via Supabase Auth, with per-user isolated data
- **Match Setup** — team names, overs (5/10/20/50/custom), player count, team colors, and toss (manual or AI coin flip)
- **Player Management** — manually assign players to each team, or enter a full pool and shuffle into balanced teams
- **Live Scoring** — ball-by-ball buttons for 0–6 runs, Wide, No-Ball, and Wicket with real-time striker/non-striker/bowler tracking
- **Wicket Handling** — select dismissal type (Bowled, Caught, LBW, Run Out), pick fielder for Caught/Run Out, then select next batsman and bowler
- **Strike Rotation** — automatic strike rotation on odd runs and end of over
- **Undo** — undo any last action including wickets
- **Second Innings** — full two-innings support with target, required runs, and balls remaining
- **Live Spectating** — share a 4-digit code; anyone can join and watch the match update in real time (read-only)
- **Tamil Commentary** — live fun commentary in Tamil using Gemini AI, with player names, emojis, and banter. Falls back to built-in lines if no API key
- **Match History** — all completed matches synced to Supabase with scores, wickets, and Man of the Match
- **Player Stats** — cumulative runs, wickets, and match count aggregated in Supabase across all games
- **Over History** — per-over runs and wickets breakdown
- **Partnership Tracker** — current partnership runs, balls, and run rate

---

## Tech Stack

| Layer | Tech |
|---|---|
| Framework | React 19 + TypeScript |
| Styling | Tailwind CSS v4 |
| Animations | Framer Motion |
| Backend / Auth / DB | Supabase |
| AI Commentary | Google Gemini 1.5 Flash |
| Build Tool | Vite 6 |

---

## Getting Started

**Prerequisites:** Node.js 18+, a [Supabase](https://supabase.com) project

### 1. Install dependencies

```bash
npm install
```

### 2. Set up Supabase

Run the SQL files in order in your Supabase SQL Editor:

```
supabase/01_schema.sql   — tables, indexes, triggers
supabase/02_rls.sql      — row-level security policies
supabase/03_realtime.sql — enable realtime on matches table
supabase/04_functions.sql — upsert_player_stat RPC
supabase/05_add_share_code.sql — migration (skip if running 01 fresh)
```

### 3. Configure environment

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
VITE_GEMINI_API_KEY=your_gemini_api_key_here   # optional
```

- Supabase keys: project **Settings → API**
- Gemini key (free): [aistudio.google.com](https://aistudio.google.com/app/apikey)

> The app works without a Gemini key — Tamil commentary falls back to built-in lines.

### 4. Run

```bash
npm run dev
```

Opens at `http://localhost:3000`

---

## Project Structure

```
cricpro/
├── src/
│   ├── App.tsx           # All components, state, and logic
│   ├── supabaseClient.ts # Supabase client initialisation
│   ├── index.css         # Tailwind v4 theme + custom utilities
│   ├── main.tsx          # React entry point
│   └── vite-env.d.ts     # Vite env type declarations
├── supabase/
│   ├── 01_schema.sql     # Tables: profiles, matches, player_stats, commentary
│   ├── 02_rls.sql        # Row-level security
│   ├── 03_realtime.sql   # Realtime publication
│   ├── 04_functions.sql  # upsert_player_stat RPC
│   └── 05_add_share_code.sql # share_code migration
├── index.html
├── .env.example
└── vite.config.ts
```

---

## How to Play

1. **Sign up / Sign in** with your email and password
2. Click **New Match** in the sidebar
3. Choose **Team Selection** or **Shuffle Players** mode
4. Enter team names, overs, and player names
5. Do the toss and pick Bat/Bowl
6. Select openers and opening bowler
7. Score ball by ball on the **Live Scoring** page
8. Share the **4-digit code** shown at the top so others can spectate live
9. After all overs or all out, start the second innings
10. Finish the match — results and player stats are saved to Supabase

---

## License

Apache 2.0
