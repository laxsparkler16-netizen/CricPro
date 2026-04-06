<div align="center">

# 🏏 CricPro

**Live cricket scoring and analytics with AI-powered Tamil commentary**

![React](https://img.shields.io/badge/React-19-61DAFB?style=flat&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=flat&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-06B6D4?style=flat&logo=tailwindcss)
![Vite](https://img.shields.io/badge/Vite-6-646CFF?style=flat&logo=vite)
![Gemini](https://img.shields.io/badge/Gemini-1.5_Flash-4285F4?style=flat&logo=google)

</div>

---

## What is CricPro?

CricPro is a full-featured cricket scoring app for local matches. Set up a game, score ball by ball, track player stats, and enjoy live Tamil commentary powered by Google Gemini AI — all in a clean green and white UI.

---

## Features

- **Match Setup** — team names, overs (5/10/20/50), player count, team colors, and toss (manual or AI coin flip)
- **Player Management** — manually assign players to each team, or enter a full pool and shuffle into balanced teams
- **Live Scoring** — ball-by-ball buttons for 0–6 runs, Wide, No-Ball, and Wicket with real-time striker/non-striker/bowler tracking
- **Wicket Handling** — select dismissal type (Bowled, Caught, LBW, Run Out), pick fielder for Caught/Run Out, then select next batsman and bowler
- **Strike Rotation** — automatic strike rotation on odd runs and end of over
- **Undo** — undo any last action including wickets
- **Second Innings** — full two-innings support with target, required runs, and balls remaining
- **Tamil Commentary** — live fun commentary in Tamil using Gemini AI, with player names, emojis, and banter. Falls back to built-in lines if no API key
- **Match History** — all completed matches with scores, wickets, and Man of the Match
- **Player Stats** — cumulative runs, wickets, and match count across all games
- **Over History** — per-over runs and wickets breakdown
- **Partnership Tracker** — current partnership runs, balls, and run rate

---

## Tech Stack

| Layer | Tech |
|---|---|
| Framework | React 19 + TypeScript |
| Styling | Tailwind CSS v4 |
| Animations | Framer Motion |
| Charts | Recharts |
| AI Commentary | Google Gemini 1.5 Flash |
| Build Tool | Vite 6 |

---

## Getting Started

**Prerequisites:** Node.js 18+

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up your environment — copy `.env.example` to `.env` and add your Gemini API key:
   ```bash
   cp .env.example .env
   ```
   Then edit `.env`:
   ```
   VITE_GEMINI_API_KEY=your_api_key_here
   ```
   Get a free API key at [aistudio.google.com](https://aistudio.google.com/app/apikey)

3. Run the app:
   ```bash
   npm run dev
   ```
   Opens at `http://localhost:3000`

> **Note:** The app works without an API key — Tamil commentary falls back to built-in fun lines.

---

## Project Structure

```
cricscore/
├── src/
│   ├── App.tsx          # Main app — all components, state, and logic
│   ├── index.css        # Tailwind v4 theme + custom utilities
│   ├── main.tsx         # React entry point
│   └── vite-env.d.ts    # Vite env type declarations
├── index.html           # App shell with Google Fonts
├── .env.example         # Environment variable template
└── vite.config.ts       # Vite config
```

---

## How to Play

1. Click **New Match** in the sidebar
2. Choose **Team Selection** or **Shuffle Players** mode
3. Enter team names, overs, and player names
4. Do the toss and pick Bat/Bowl
5. Select openers and opening bowler
6. Score ball by ball on the **Live Scoring** page
7. After all overs or all out, start the second innings
8. Finish the match to save it to history

---

## License

Apache 2.0
