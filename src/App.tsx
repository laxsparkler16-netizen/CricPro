/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  Trophy,
  Settings2,
  Shuffle,
  Clock,
  Coins,
  Calendar,
  Shield,
  LayoutDashboard, 
  CircleDot, 
  History, 
  Users, 
  Settings, 
  Search, 
  Bell, 
  Menu, 
  X, 
  ChevronRight, 
  Send, 
  ArrowRight,
  Undo2,
  CheckCircle2,
  Plus,
  Bot,
  Play
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// --- Types ---
type View = 'dashboard' | 'match-setup' | 'openers-selection' | 'live-scoring' | 'match-history' | 'roster' | 'settings';

interface MatchRecord {
  id: string;
  date: string;
  teamA: string;
  teamB: string;
  scoreA: number;
  wicketsA: number;
  scoreB: number;
  wicketsB: number;
  mom: string;
}

const TEAM_COLORS = [
  { name: 'Red', value: '#ef4444', glow: 'glow-red' },
  { name: 'Orange', value: '#f97316', glow: 'glow-orange' },
  { name: 'Yellow', value: '#eab308', glow: 'glow-yellow' },
  { name: 'Green', value: '#22c55e', glow: 'glow-green' },
  { name: 'Cyan', value: '#06b6d4', glow: 'glow-cyan' },
  { name: 'Blue', value: '#3b82f6', glow: 'glow-blue' },
  { name: 'Indigo', value: '#6366f1', glow: 'glow-indigo' },
  { name: 'Purple', value: '#a855f7', glow: 'glow-purple' },
  { name: 'Pink', value: '#ec4899', glow: 'glow-pink' },
];

const Card = ({ children, title, className = "", variant = "default" }: { children: React.ReactNode, title?: string, className?: string, variant?: "default" | "glass" | "dark" | "sports" }) => {
  const baseStyles = "rounded-xl p-fluid-4 transition-all duration-300";
  const variants = {
    default: "bg-white border border-green-300 shadow-[0_2px_8px_rgba(0,0,0,0.1)] transition-all duration-500 hover:border-sports-green hover:shadow-[0_4px_16px_rgba(22,163,74,0.2)]",
    glass: "bg-white border border-green-300 shadow-[0_4px_12px_rgba(22,163,74,0.15)]",
    dark: "bg-green-50 border border-green-300 shadow-[0_2px_8px_rgba(0,0,0,0.1)]",
    sports: "bg-white border-l-4 border-l-sports-green shadow-[0_2px_8px_rgba(22,163,74,0.2)]"
  };
  
  return (
    <div className={`${baseStyles} ${variants[variant]} ${className}`}>
      {title && <h3 className={`text-fluid-base font-black mb-3 tracking-tight text-black uppercase tracking-wider`}>{title}</h3>}
      {children}
    </div>
  );
};

const Badge = ({ children, variant, className = "" }: { children: React.ReactNode, variant: 'success' | 'danger' | 'warning' | 'info' | 'live', className?: string }) => {
  const styles = {
    success: "bg-green-200 text-black border-green-400 font-bold",
    danger: "bg-green-200 text-black border-green-400 font-bold",
    warning: "bg-green-200 text-black border-green-400 font-bold",
    info: "bg-green-200 text-black border-green-400 font-bold",
    live: "bg-sports-red text-white border-none animate-pulse font-bold"
  };
  return (
    <span className={`px-2 py-0.5 rounded text-fluid-xs font-black uppercase tracking-wider border ${styles[variant]} ${className}`}>
      {children}
    </span>
  );
};

export default function App() {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [historyFilter, setHistoryFilter] = useState('');
  
  // Persistent State (User Entered Data)
  const [matchHistory, setMatchHistory] = useState<MatchRecord[]>([]);
  const [playerStats, setPlayerStats] = useState<{name: string, runs: number, wickets: number, matches: number}[]>([]);
  const [dismissalStats, setDismissalStats] = useState<{name: string, value: number}[]>([
    { name: 'Bowled', value: 0 },
    { name: 'Caught', value: 0 },
    { name: 'LBW', value: 0 },
    { name: 'Run Out', value: 0 },
  ]);

  // Scoring State
  const [matchConfig, setMatchConfig] = useState({ 
    teamA: '', 
    teamB: '', 
    colorA: '#0ea5e9',
    colorB: '#ef4444',
    overs: 20,
    numPlayers: 11,
    playersA: Array(11).fill(''),
    playersB: Array(11).fill(''),
    setupMode: 'manual' as 'manual' | 'shuffle',
    allPlayers: Array(22).fill(''),
    toss: { winner: null as 'Team A' | 'Team B' | null, choice: null as 'Bat' | 'Bowl' | null }
  });
  const [score, setScore] = useState({ 
    runs: 0, 
    wickets: 0, 
    balls: 0, 
    battingTeam: 'A' as 'A' | 'B',
    battedPlayers: [] as string[],
    partnership: { runs: 0, balls: 0 },
    innings: 1,
    firstInningsScore: null as { runs: number, wickets: number, balls: number } | null
  });
  const [showInningsOverModal, setShowInningsOverModal] = useState(false);
  const [showMatchOverModal, setShowMatchOverModal] = useState(false);
  const [batsmen, setBatsmen] = useState({ 
    onStrike: { name: 'Batsman 1', runs: 0, balls: 0 },
    nonStriker: { name: 'Batsman 2', runs: 0, balls: 0 }
  });
  const [showWicketModal, setShowWicketModal] = useState(false);
  const [showNewBatsmanModal, setShowNewBatsmanModal] = useState(false);
  const [newBatsmanPosition, setNewBatsmanPosition] = useState<'striker' | 'non-striker' | null>(null);
  const [showNewBowlerModal, setShowNewBowlerModal] = useState(false);
  const [dismissalType, setDismissalType] = useState<'Bowled' | 'Caught' | 'LBW' | 'Run Out' | null>(null);
  const [fielderName, setFielderName] = useState('');
  const [isTossing, setIsTossing] = useState(false);
  const [scorePopAnimation, setScorePopAnimation] = useState<{ runs: number; timestamp: number; type?: 'dot' | 'single' | 'boundary' | 'six' } | null>(null);
  const [wicketShake, setWicketShake] = useState(false);
  const [commentary, setCommentary] = useState<{text: string, event: string, timestamp: number}[]>([]);
  const [isGeneratingCommentary, setIsGeneratingCommentary] = useState(false);
  const [currentBowler, setCurrentBowler] = useState({ name: 'Bowler', overs: 0, runs: 0, wickets: 0 });
  const [activeSetupStep, setActiveSetupStep] = useState<'mode' | 'teams' | 'players' | 'toss'>('mode');
  const [matchStats, setMatchStats] = useState<{[key: string]: {runs: number, wickets: number, bowlingRuns: number, bowlingWickets: number}}>({});
  const [matchHistoryStack, setMatchHistoryStack] = useState<{
    score: typeof score;
    batsmen: typeof batsmen;
    currentBowler: typeof currentBowler;
    dismissalStats: typeof dismissalStats;
    matchStats: typeof matchStats;
    isWicket: boolean;
  }[]>([]);

  const overHistory = useMemo(() => {
    const history: { over: number, runs: number, wickets: number, totalRuns: number, totalWickets: number }[] = [];
    const snapshots: typeof score[] = [];
    
    matchHistoryStack.forEach(s => {
      if (s.score.balls > 0 && s.score.balls % 6 === 0) {
        const overNum = s.score.balls / 6;
        if (!snapshots[overNum - 1]) {
          snapshots[overNum - 1] = s.score;
        }
      }
    });
    
    if (score.balls > 0 && score.balls % 6 === 0) {
      const overNum = score.balls / 6;
      if (!snapshots[overNum - 1]) {
        snapshots[overNum - 1] = score;
      }
    }
    
    for (let i = 0; i < snapshots.length; i++) {
      if (snapshots[i]) {
        const prevRuns = i > 0 ? snapshots[i-1].runs : 0;
        const prevWickets = i > 0 ? snapshots[i-1].wickets : 0;
        history.push({
          over: i + 1,
          runs: snapshots[i].runs - prevRuns,
          wickets: snapshots[i].wickets - prevWickets,
          totalRuns: snapshots[i].runs,
          totalWickets: snapshots[i].wickets
        });
      }
    }
    return history;
  }, [matchHistoryStack, score]);

  const handleNumPlayersChange = (num: number) => {
    const n = Math.max(1, Math.min(15, num));
    setMatchConfig(prev => ({
      ...prev,
      numPlayers: n,
      playersA: Array(n).fill('').map((_, i) => prev.playersA[i] || ''),
      playersB: Array(n).fill('').map((_, i) => prev.playersB[i] || ''),
      allPlayers: Array(n * 2).fill('').map((_, i) => prev.allPlayers[i] || '')
    }));
  };

  const handleAIToss = () => {
    setIsTossing(true);
    setMatchConfig(prev => ({ ...prev, toss: { winner: null, choice: null } }));
    
    setTimeout(() => {
      const winner = Math.random() > 0.5 ? 'Team A' : 'Team B';
      const choice = Math.random() > 0.5 ? 'Bat' : 'Bowl';
      setMatchConfig(prev => ({
        ...prev,
        toss: { winner, choice }
      }));
      setIsTossing(false);
    }, 2000);
  };

  const shufflePlayers = () => {
    const shuffled = [...matchConfig.allPlayers].sort(() => Math.random() - 0.5);
    const half = matchConfig.numPlayers;
    setMatchConfig(prev => ({
      ...prev,
      playersA: shuffled.slice(0, half),
      playersB: shuffled.slice(half, half * 2),
      teamA: prev.teamA || 'Team A',
      teamB: prev.teamB || 'Team B'
    }));
  };


  const generateCommentary = async (event: string, details: string) => {
    const batter = batsmen.onStrike.name || 'பேட்ஸ்மேன்';
    const bowler = currentBowler.name || 'பவுலர்';
    const runs = score.runs;
    const wickets = score.wickets;

    const fallbacks: {[key: string]: string[]} = {
      'Dot Ball': [
        `🎯 ${bowler} போட்ட பந்து அசத்தல்! ${batter} கையே வீசினான் — ஒரு ரன் கூட இல்ல! 😂`,
        `⚫ டாட் பால்! ${batter} பேட் தூக்கி வைச்சான், பந்து போயிடுச்சு! ${bowler} கலக்குறான்! 💪`,
        `🔒 ${bowler} யார்க்கர் போட்டான்! ${batter} கால் அசையல, பந்து அசையல — டாட்! 😤`,
        `😅 ${batter} ஸ்வீப் அடிக்க பாத்தான், மிஸ் ஆச்சு! ${bowler} சிரிக்குறான்! 🤣`,
        `🧱 ${bowler} லைன் அண்ட் லெங்த் பர்ஃபெக்ட்! ${batter} ஒண்ணும் பண்ண முடியல! 🎯`,
      ],
      'Boundary': [
        `🔥 FOUR! ${batter} கவர் டிரைவ் — பவுண்டரி! ${bowler} முகம் பாருங்க! 😂🏏`,
        `💨 ${batter} பேட் வீசினான் — நான்கு ரன்ஸ்! அட்டகாசம்! ${bowler} தலை குனிஞ்சான்! 🎉`,
        `🏏 FOUR! ${batter} பேட் ஸ்விங் — பவுண்டரி ரோப் தாண்டுச்சு! சூப்பர் ஷாட்! 🔥`,
        `😤 ${bowler} ஃபுல் டாஸ் போட்டான் — ${batter} தண்டிச்சான்! FOUR! 💥`,
        `🎯 ${batter} லேட் கட் — FOUR! ${bowler} என்ன பண்றான்? 😂 அட்டகாசம்!`,
      ],
      'Six': [
        `💥 SIX! ${batter} பேட் சுத்தினான் — பந்து வானத்துல போச்சு! ${bowler} பாவம்! 🚀`,
        `🌟 MAXIMUM! ${batter} ஹெலிகாப்டர் ஷாட்! ${bowler} பந்து திரும்பவே வரல! 😂🏆`,
        `🚀 ${batter} சிக்ஸ் அடிச்சான்! ஆஹா! ${bowler} கண்ணீர் வருதா? 😂💥`,
        `🎆 OUT OF THE PARK! ${batter} அட்டகாசம்! ${bowler} இனிமேல் யார்க்கர் போடு! 🤣`,
        `💫 ${batter} ஸ்வீப் சிக்ஸ்! ${bowler} ஃபீல்டர்ஸ் எல்லாரும் பாத்துக்கிட்டே இருந்தாங்க! 😂🔥`,
      ],
      'Wicket': [
        `🎯 WICKET! ${batter} போயிட்டான்! ${bowler} வாழ்க! கிரவுண்ட் ஆடுது! 🏆🎉`,
        `🔴 OUT! ${batter} என்ன பண்ணிட்டீங்க! ${bowler} கலக்கிட்டான்! 😂💪`,
        `⚡ ${bowler} பந்து ${batter} ஸ்டம்ப் தாண்டுச்சு! BOWLED! வாழ்க! 🎯🏆`,
        `😱 ${batter} OUT! ${score.runs}/${wickets + 1} — அடுத்த பேட்ஸ்மேன் வாங்க! ${bowler} ஹீரோ! 🦸`,
        `🎊 WICKET! ${bowler} ப்ரேக்த்ரூ! ${batter} பவிலியன் போ! கிரவுண்ட் கொண்டாடுது! 🎉`,
      ],
      'Wide': [
        `📏 WIDE! ${bowler} கண்ணு தெரியலையா? பந்து வேற பக்கம் போச்சு! 😂`,
        `❌ ${bowler} வைட் போட்டான்! ஃப்ரீ ரன்! ${batter} சிரிக்குறான்! 🤣`,
        `😅 ${bowler} கண்ட்ரோல் இல்ல! வைட் பால்! அம்பயர் கை தூக்குறான்! 📏`,
      ],
      'No-Ball': [
        `🚫 NO BALL! ${bowler} லைன் தாண்டிட்டான்! ஃப்ரீ ஹிட் வருது! 😤`,
        `⚠️ ${bowler} நோ பால்! ஐயோ! ${batter} ஃப்ரீ ஹிட் ரெடி! 🎯`,
        `😬 ${bowler} ஓவர்ஸ்டெப்! நோ பால்! அடுத்த பந்து ஃப்ரீ ஹிட்! 🔥`,
      ],
      '1 runs': [
        `🏃 ${batter} ஒரு ரன் ஓடினான்! ${runs + 1} ரன்ஸ் ஆச்சு! சின்ன சின்னதா கூட்டுவோம்! 💪`,
        `👟 சிங்கிள்! ${batter} ஸ்ட்ரைக் மாத்தினான்! ஸ்மார்ட் கிரிக்கெட்! 🧠`,
      ],
      '2 runs': [
        `🏃‍♂️ TWO! ${batter} இரண்டு ரன்ஸ் ஓடினான்! நல்லா ஓடுறான்! 💨`,
        `✌️ ${batter} டூ ரன்ஸ்! கேப் கண்டுபிடிச்சான்! 🎯`,
      ],
      '3 runs': [
        `🏃 THREE! ${batter} மூணு ரன்ஸ் ஓடினான்! அட்டகாசம்! 💪🔥`,
        `🌟 ${batter} மூணு ரன்ஸ்! ஃபீல்டர் தூக்கி எறிஞ்சான் — ஆனா லேட்! 😂`,
      ],
    };

    const getEventKey = () => {
      if (event === 'Dot Ball') return 'Dot Ball';
      if (event === 'Boundary') return 'Boundary';
      if (event === 'Six') return 'Six';
      if (event === 'Wicket') return 'Wicket';
      if (event === 'Wide') return 'Wide';
      if (event === 'No-Ball') return 'No-Ball';
      if (details.includes('scored 1')) return '1 runs';
      if (details.includes('scored 2')) return '2 runs';
      if (details.includes('scored 3')) return '3 runs';
      return 'Dot Ball';
    };

    const addFallback = () => {
      const key = getEventKey();
      const list = fallbacks[key] || fallbacks['Dot Ball'];
      const text = list[Math.floor(Math.random() * list.length)];
      setCommentary(prev => [{ text, event, timestamp: Date.now() }, ...prev].slice(0, 20));
    };

    if (!import.meta.env.VITE_GEMINI_API_KEY) {
      addFallback();
      return;
    }

    setIsGeneratingCommentary(true);
    try {
      // @ts-ignore
      const { GoogleGenerativeAI } = await import('@google/genai');
      const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const prompt = `நீ ஒரு வேடிக்கையான தமிழ் கிரிக்கெட் கமெண்டேட்டர். கீழே உள்ள நிகழ்வுக்கு 1-2 வாக்கியங்களில் (max 130 chars) உற்சாகமான தமிழ் கமெண்டரி எழுது.

நிகழ்வு: ${event}
விவரம்: ${details}
ஸ்கோர்: ${score.runs}/${score.wickets}
பேட்ஸ்மேன்: ${batter}
பவுலர்: ${bowler}

விதிகள்:
- டாட் பால்: பேட்ஸ்மேனை கேலி செய், பவுலரை புகழ், "என்ன பண்றீங்க!" use பண்ணு
- பவுண்டரி/சிக்ஸ்: கொண்டாடு, பவுலரை கேலி செய், "அட்டகாசம்!" சொல்
- விக்கெட்: "வாழ்க!" சொல், பேட்ஸ்மேனை கேலி செய், பவுலரை ஹீரோ ஆக்கு
- வைட்/நோ பால்: பவுலரை கேலி செய்
- ஆட்டக்காரர் பெயர்களை use பண்ணு, emojis சேர்
- தமிழ் slang: "சூப்பர்!", "அட்டகாசம்!", "ஆஹா!", "பாவம்!", "கலக்கல்!"`;

      const result = await model.generateContent(prompt);
      const text = result.response.text().trim();
      setCommentary(prev => [{ text, event, timestamp: Date.now() }, ...prev].slice(0, 20));
    } catch (error) {
      console.error('Commentary error:', error);
      addFallback();
    } finally {
      setIsGeneratingCommentary(false);
    }
  };


  // Derived Data
  const formatOvers = (balls: number) => {
    const overs = Math.floor(balls / 6);
    const remainingBalls = balls % 6;
    return `${overs}.${remainingBalls}`;
  };

  const saveMatchState = (isWicket = false) => {
    setMatchHistoryStack(prev => [...prev, {
      score: { ...score },
      batsmen: { ...batsmen },
      currentBowler: { ...currentBowler },
      dismissalStats: [...dismissalStats],
      matchStats: { ...matchStats },
      isWicket
    }]);
  };

  const handleScoreAction = (action: string | number) => {
    if (isInningsOver) return;

    if (typeof action === 'number') {
      saveMatchState(false);
      const newScore = {
        ...score,
        runs: score.runs + action,
        balls: score.balls + 1,
        partnership: { runs: score.partnership.runs + action, balls: score.partnership.balls + 1 }
      };
      setScore(newScore);

      if (action > 0) {
        let runType: 'dot' | 'single' | 'boundary' | 'six' = 'single';
        if (action === 4) runType = 'boundary';
        else if (action === 6) runType = 'six';
        setScorePopAnimation({ runs: action, timestamp: Date.now(), type: runType });
        setTimeout(() => setScorePopAnimation(null), 600);
        const eventType = action === 4 ? 'Boundary' : action === 6 ? 'Six' : `${action} runs`;
        generateCommentary(eventType, `${batsmen.onStrike.name} scored ${action} runs`);
      } else {
        generateCommentary('Dot Ball', `${currentBowler.name} bowls a perfect delivery, ${batsmen.onStrike.name} fails to score`);
      }

      const isTargetReachedNow = newScore.innings === 2 && newScore.firstInningsScore && newScore.runs > newScore.firstInningsScore.runs;
      const isOversCompletedNow = newScore.balls >= matchConfig.overs * 6;

      if (isTargetReachedNow) {
        setShowMatchOverModal(true);
      } else if (isOversCompletedNow) {
        if (newScore.innings === 1) setShowInningsOverModal(true);
        else setShowMatchOverModal(true);
      }

      setBatsmen(prev => ({
        ...prev,
        onStrike: { ...prev.onStrike, runs: prev.onStrike.runs + action, balls: prev.onStrike.balls + 1 }
      }));

      setMatchStats(prev => {
        const batsmanName = batsmen.onStrike.name;
        const bowlerName = currentBowler.name;
        const newStats = { ...prev };
        if (!newStats[batsmanName]) newStats[batsmanName] = { runs: 0, wickets: 0, bowlingRuns: 0, bowlingWickets: 0 };
        if (!newStats[bowlerName]) newStats[bowlerName] = { runs: 0, wickets: 0, bowlingRuns: 0, bowlingWickets: 0 };
        newStats[batsmanName] = { ...newStats[batsmanName], runs: newStats[batsmanName].runs + action };
        newStats[bowlerName] = { ...newStats[bowlerName], bowlingRuns: newStats[bowlerName].bowlingRuns + action };
        return newStats;
      });

      setCurrentBowler(prev => {
        const totalBalls = Math.floor(prev.overs) * 6 + Math.round((prev.overs % 1) * 10) + 1;
        const newOvers = Math.floor(totalBalls / 6) + (totalBalls % 6) / 10;
        if (totalBalls % 6 === 0) setShowNewBowlerModal(true);
        return { ...prev, runs: prev.runs + action, overs: parseFloat(newOvers.toFixed(1)) };
      });

      const isEndOfOver = newScore.balls % 6 === 0;
      const isOddRuns = action % 2 !== 0;
      if (isOddRuns && !isEndOfOver) {
        setBatsmen(prev => {
          if (!prev.nonStriker.name || prev.nonStriker.name === 'OUT') return prev;
          return { onStrike: prev.nonStriker, nonStriker: prev.onStrike };
        });
      } else if (!isOddRuns && isEndOfOver) {
        setBatsmen(prevB => {
          if (!prevB.nonStriker.name || prevB.nonStriker.name === 'OUT') return prevB;
          return { onStrike: prevB.nonStriker, nonStriker: prevB.onStrike };
        });
      }
    } else if (action === 'Wide' || action === 'No-Ball') {
      saveMatchState(false);
      const newScore = {
        ...score,
        runs: score.runs + 1,
        partnership: { ...score.partnership, runs: score.partnership.runs + 1 }
      };
      setScore(newScore);
      const bowlerName = currentBowler.name;
      setMatchStats(prev => {
        const newStats = { ...prev };
        if (!newStats[bowlerName]) newStats[bowlerName] = { runs: 0, wickets: 0, bowlingRuns: 0, bowlingWickets: 0 };
        newStats[bowlerName] = { ...newStats[bowlerName], bowlingRuns: newStats[bowlerName].bowlingRuns + 1 };
        return newStats;
      });
      setCurrentBowler(prev => ({ ...prev, runs: prev.runs + 1 }));
      generateCommentary(action, `${action} called`);
      const isTargetReachedNow = newScore.innings === 2 && newScore.firstInningsScore && newScore.runs > newScore.firstInningsScore.runs;
      if (isTargetReachedNow) setShowMatchOverModal(true);
    } else if (action === 'WICKET') {
      setShowWicketModal(true);
    }
  };

  const confirmWicket = () => {
    if (!dismissalType) return;

    saveMatchState(true);
    setWicketShake(true);
    setTimeout(() => setWicketShake(false), 500);

    const dismissalInfo = dismissalType === 'Caught'
      ? `${batsmen.onStrike.name} caught by ${fielderName}`
      : dismissalType === 'Run Out'
      ? `${batsmen.onStrike.name} run out by ${fielderName}`
      : `${batsmen.onStrike.name} ${dismissalType.toLowerCase()}`;
    generateCommentary('Wicket', `${dismissalInfo}. ${currentBowler.name} takes the wicket`);

    const bowlerName = currentBowler.name;
    setMatchStats(prev => {
      const newStats = { ...prev };
      if (!newStats[bowlerName]) newStats[bowlerName] = { runs: 0, wickets: 0, bowlingRuns: 0, bowlingWickets: 0 };
      newStats[bowlerName] = { ...newStats[bowlerName], bowlingWickets: newStats[bowlerName].bowlingWickets + 1 };
      return newStats;
    });

    const nextWickets = score.wickets + 1;
    const isAllOutNow = nextWickets >= matchConfig.numPlayers;
    const isLastBallOfOver = (score.balls + 1) % 6 === 0;
    const isOversCompletedNow = score.balls + 1 >= matchConfig.overs * 6;

    setScore(prev => {
      const newScore = {
        ...prev,
        wickets: nextWickets,
        balls: prev.balls + 1,
        partnership: { runs: 0, balls: 0 }
      };
      if (isAllOutNow || isOversCompletedNow) {
        if (newScore.innings === 1) setShowInningsOverModal(true);
        else setShowMatchOverModal(true);
      }
      return newScore;
    });

    setCurrentBowler(prev => {
      const totalBalls = Math.floor(prev.overs) * 6 + Math.round((prev.overs % 1) * 10) + 1;
      const newOvers = Math.floor(totalBalls / 6) + (totalBalls % 6) / 10;
      if (totalBalls % 6 === 0) setShowNewBowlerModal(true);
      return { ...prev, wickets: prev.wickets + 1, overs: parseFloat(newOvers.toFixed(1)) };
    });

    setDismissalStats(prev => {
      const next = [...prev];
      const idx = dismissalType === 'Bowled' ? 0 : dismissalType === 'Caught' ? 1 : dismissalType === 'LBW' ? 2 : 3;
      next[idx].value += 1;
      return next;
    });

    setShowWicketModal(false);
    setDismissalType(null);
    setFielderName('');

    if (!isAllOutNow) {
      if (isLastBallOfOver) {
        setBatsmen(prev => ({
          onStrike: prev.nonStriker,
          nonStriker: { name: 'OUT', runs: 0, balls: 0 }
        }));
        setNewBatsmanPosition('non-striker');
      } else {
        setBatsmen(prev => ({
          onStrike: { name: 'OUT', runs: 0, balls: 0 },
          nonStriker: prev.nonStriker
        }));
        setNewBatsmanPosition('striker');
      }
      setShowNewBatsmanModal(true);
    }
  };

  const undoLastAction = () => {
    if (matchHistoryStack.length > 0) {
      const lastState = matchHistoryStack[matchHistoryStack.length - 1];
      setScore(lastState.score);
      setBatsmen(lastState.batsmen);
      setCurrentBowler(lastState.currentBowler);
      setDismissalStats(lastState.dismissalStats);
      setMatchStats(lastState.matchStats);
      setMatchHistoryStack(prev => prev.slice(0, -1));
      setShowNewBatsmanModal(false);
      setShowNewBowlerModal(false);
    }
  };

  const isAllOut = score.wickets >= matchConfig.numPlayers;
  const isOversCompleted = score.balls >= matchConfig.overs * 6;
  const isTargetReached = score.innings === 2 && score.firstInningsScore && score.runs > score.firstInningsScore.runs;
  const isInningsOver = isAllOut || isOversCompleted || isTargetReached;

  const startSecondInnings = () => {
    const nextBattingTeam = score.battingTeam === 'A' ? 'B' : 'A';
    const nextBattingPlayers = nextBattingTeam === 'A' ? matchConfig.playersA : matchConfig.playersB;
    const nextBowlingPlayers = nextBattingTeam === 'A' ? matchConfig.playersB : matchConfig.playersA;
    setScore(prev => ({
      runs: 0, wickets: 0, balls: 0,
      battingTeam: nextBattingTeam,
      battedPlayers: [nextBattingPlayers[0] || '', nextBattingPlayers[1] || ''],
      partnership: { runs: 0, balls: 0 },
      innings: 2,
      firstInningsScore: { runs: prev.runs, wickets: prev.wickets, balls: prev.balls }
    }));
    setBatsmen({
      onStrike: { name: nextBattingPlayers[0] || '', runs: 0, balls: 0 },
      nonStriker: { name: nextBattingPlayers[1] || '', runs: 0, balls: 0 }
    });
    setCurrentBowler({ name: nextBowlingPlayers[0] || '', overs: 0, runs: 0, wickets: 0 });
    setShowInningsOverModal(false);
    setCurrentView('openers-selection');
  };

  const finishMatch = () => {
    const firstInningsScore = score.firstInningsScore?.runs || 0;
    const firstInningsWickets = score.firstInningsScore?.wickets || 0;
    const secondInningsScore = score.runs;
    const secondInningsWickets = score.wickets;
    const newMatch: MatchRecord = {
      id: Date.now().toString(),
      date: new Date().toLocaleDateString(),
      teamA: matchConfig.teamA || 'Team A',
      teamB: matchConfig.teamB || 'Team B',
      scoreA: score.battingTeam === 'A' ? secondInningsScore : firstInningsScore,
      wicketsA: score.battingTeam === 'A' ? secondInningsWickets : firstInningsWickets,
      scoreB: score.battingTeam === 'B' ? secondInningsScore : firstInningsScore,
      wicketsB: score.battingTeam === 'B' ? secondInningsWickets : firstInningsWickets,
      mom: batsmen.onStrike.runs > batsmen.nonStriker.runs ? batsmen.onStrike.name : batsmen.nonStriker.name
    };
    setMatchHistory(prev => [newMatch, ...prev]);
    setPlayerStats(prev => {
      const updatedStats = [...prev];
      Object.entries(matchStats).forEach(([name, stats]) => {
        const s = stats as { runs: number, wickets: number, bowlingRuns: number, bowlingWickets: number };
        const idx = updatedStats.findIndex(p => p.name === name);
        if (idx !== -1) {
          updatedStats[idx] = { ...updatedStats[idx], runs: updatedStats[idx].runs + (s.runs || 0), wickets: updatedStats[idx].wickets + (s.bowlingWickets || 0), matches: updatedStats[idx].matches + 1 };
        } else {
          updatedStats.push({ name, runs: s.runs || 0, wickets: s.bowlingWickets || 0, matches: 1 });
        }
      });
      return updatedStats;
    });
    setMatchStats({});
    setShowMatchOverModal(false);
    setCurrentView('dashboard');
  };


  const renderDashboard = () => {
    const recentMatch = matchHistory[0];
    const totalMatches = matchHistory.length;
    const topScorer = playerStats.length > 0 ? [...playerStats].sort((a, b) => b.runs - a.runs)[0] : null;
    const totalRuns = playerStats.reduce((sum, p) => sum + p.runs, 0);
    const totalWickets = playerStats.reduce((sum, p) => sum + p.wickets, 0);

    if (matchHistory.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
          <div className="relative mb-12">
            <div className="absolute inset-0 bg-gradient-to-r from-sports-blue/20 to-sports-green/20 blur-3xl rounded-full" />
            <div className="relative w-32 h-32 rounded-3xl bg-gradient-to-br from-sports-blue to-sports-green flex items-center justify-center border-2 border-green-300 shadow-[0_0_60px_rgba(22,163,74,0.3)]">
              <CircleDot className="w-16 h-16 text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-black tracking-tighter mb-4">CricPro</h1>
          <p className="text-black text-base max-w-md mb-3 leading-relaxed font-medium">Professional cricket match scoring and analytics.</p>
          <p className="text-black text-sm max-w-md mb-12">Track matches, player stats, and match scores all in one place.</p>
          <button onClick={() => setCurrentView('match-setup')}
            className="flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-sports-blue via-sports-green to-sports-blue text-white rounded-2xl font-black uppercase tracking-widest text-sm hover:shadow-[0_0_40px_rgba(22,163,74,0.4)] transition-all active:scale-95 shadow-[0_0_30px_rgba(22,163,74,0.3)] mb-16 animate-pulse">
            <Plus className="w-5 h-5" /> Start First Match
          </button>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-3xl">
            {[
              { icon: CircleDot, label: 'Match Logic', desc: 'Track ball-by-ball scoring and match flow' },
              { icon: Users, label: 'Player Stats', desc: 'View all players and their performance' },
              { icon: Trophy, label: 'Match Scores', desc: 'Review all match results and history' },
            ].map(({ icon: Icon, label, desc }) => (
              <div key={label} className="group bg-green-50 border border-green-200 rounded-2xl p-6 text-left hover:border-green-300 transition-all">
                <div className="w-12 h-12 bg-gradient-to-br from-sports-blue to-sports-green rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg">
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className="text-sm font-black text-black uppercase tracking-widest mb-2">{label}</div>
                <div className="text-xs text-black leading-relaxed">{desc}</div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-8 pb-12">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-sports-blue/10 via-sports-green/10 to-sports-blue/10 border border-green-200 p-8 md:p-12">
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl md:text-4xl font-black text-black tracking-tighter mb-2">Cricket Matches</h1>
                <p className="text-black text-sm font-medium">{totalMatches} matches • {totalRuns} total runs • {totalWickets} total wickets</p>
              </div>
              <div className="flex items-center gap-3">
                {score.balls > 0 && (
                  <button onClick={() => setCurrentView('live-scoring')}
                    className="flex items-center gap-2 px-6 py-3 bg-sports-green text-white rounded-xl font-black uppercase tracking-widest text-xs hover:bg-sports-blue transition-all active:scale-95 shadow-lg">
                    <Play className="w-4 h-4" /> Continue Match
                  </button>
                )}
                <button onClick={() => setCurrentView('match-setup')}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-sports-blue to-sports-green text-white rounded-xl font-black uppercase tracking-widest text-xs hover:shadow-[0_0_30px_rgba(22,163,74,0.4)] transition-all active:scale-95 shadow-lg">
                  <Plus className="w-4 h-4" /> New Match
                </button>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-black text-black tracking-tighter mb-4">Match Scores</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {matchHistory.map((match) => (
              <div key={match.id}>
                <Card className="p-6 border border-green-300 hover:border-green-400 transition-all">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-black text-black uppercase tracking-widest">{match.date}</span>
                    <div className="w-2 h-2 rounded-full bg-sports-green" />
                  </div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="text-center flex-1">
                      <div className="text-3xl font-black text-black mb-1">{match.scoreA}</div>
                      <div className="text-xs text-black font-bold">{match.teamA}</div>
                    </div>
                    <div className="px-4 text-center">
                      <div className="text-xs font-black text-black uppercase">vs</div>
                    </div>
                    <div className="text-center flex-1">
                      <div className="text-3xl font-black text-black mb-1">{match.scoreB}</div>
                      <div className="text-xs text-black font-bold">{match.teamB}</div>
                    </div>
                  </div>
                  <div className="pt-4 border-t border-green-200 flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-sports-green" />
                    <span className="text-xs text-black">MOM: <span className="text-black font-bold">{match.mom || 'N/A'}</span></span>
                  </div>
                </Card>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-black text-black tracking-tighter mb-4">Player Stats</h2>
          <Card className="p-6">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-green-300">
                    <th className="pb-4 text-xs font-black text-black uppercase tracking-widest">Player</th>
                    <th className="pb-4 text-xs font-black text-black uppercase tracking-widest text-center">Matches</th>
                    <th className="pb-4 text-xs font-black text-black uppercase tracking-widest text-center">Runs</th>
                    <th className="pb-4 text-xs font-black text-black uppercase tracking-widest text-center">Wickets</th>
                    <th className="pb-4 text-xs font-black text-black uppercase tracking-widest text-right">Avg</th>
                  </tr>
                </thead>
                <tbody>
                  {playerStats.length === 0 ? (
                    <tr><td colSpan={5} className="py-8 text-center text-black italic text-xs">No player data yet</td></tr>
                  ) : (
                    playerStats.sort((a, b) => b.runs - a.runs).map((player, idx) => (
                      <tr key={player.name} className="border-b border-green-300 hover:bg-green-50 transition-colors group">
                        <td className="py-4">
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-black text-sports-blue">#{idx + 1}</span>
                            <span className="text-sm font-bold text-black group-hover:text-sports-green transition-colors">{player.name}</span>
                          </div>
                        </td>
                        <td className="py-4 text-center text-sm font-medium text-black">{player.matches}</td>
                        <td className="py-4 text-center"><span className="px-3 py-1 bg-blue-200 text-black rounded-md text-xs font-black">{player.runs}</span></td>
                        <td className="py-4 text-center"><span className="px-3 py-1 bg-green-200 text-black rounded-md text-xs font-black">{player.wickets}</span></td>
                        <td className="py-4 text-right text-sm font-black text-black">{player.matches > 0 ? (player.runs / player.matches).toFixed(1) : '0.0'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>
    );
  };


  const renderMatchHistory = () => (
    <div className="space-y-fluid-4 md:space-y-fluid-6 pb-fluid-8 md:pb-fluid-12">
      <div className="flex items-center justify-between mb-fluid-4">
        <button onClick={() => setCurrentView('dashboard')}
          className="flex items-center gap-2 px-fluid-4 py-fluid-2 bg-green-100 hover:bg-green-200 border border-green-300 rounded-lg font-bold text-fluid-xs text-black transition-all">
          <ArrowRight className="w-4 h-4 rotate-180" /> Back
        </button>
      </div>
      <div>
        <h2 className="text-fluid-xl md:text-fluid-2xl font-black text-black tracking-tighter">Match Archive</h2>
        <p className="text-black text-fluid-xs font-medium">Review and analyze your past performances</p>
      </div>
      <div className="relative group">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-black w-3.5 h-3.5" />
        <input type="text" placeholder="Search opponents..."
          value={historyFilter}
          onChange={(e) => setHistoryFilter(e.target.value)}
          className="pl-10 pr-4 py-fluid-2 md:py-fluid-2.5 bg-white border border-green-300 rounded-xl text-fluid-xs focus:outline-none focus:ring-2 focus:ring-sports-green/40 transition-all w-full md:w-64 shadow-sm text-black font-medium" />
      </div>
      <div className="grid grid-cols-1 gap-fluid-3">
        {matchHistory.length === 0 ? (
          <Card className="p-fluid-8 text-center text-black italic text-fluid-xs border-green-300">No matches found.</Card>
        ) : (
          matchHistory.filter(m => (m.teamA + m.teamB).toLowerCase().includes(historyFilter.toLowerCase())).map((match) => (
            <div key={match.id}>
              <Card className="p-fluid-4 md:p-fluid-6 hover:border-sports-green/60 transition-all border-green-300">
                <div className="flex items-center justify-between gap-fluid-4">
                  <div className="flex items-center gap-fluid-3 md:gap-fluid-6">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-green-100 rounded-xl flex items-center justify-center text-black">
                      <Calendar className="w-5 h-5 md:w-6 md:h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-0.5 md:mb-1">
                        <span className="text-fluid-xs font-black text-black uppercase tracking-widest">{match.date}</span>
                      </div>
                      <div className="text-fluid-sm font-black text-black">{match.teamA} vs {match.teamB}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-fluid-4 md:gap-fluid-12">
                    <div className="text-right">
                      <div className="text-fluid-xs font-black text-black uppercase tracking-widest mb-0.5 md:mb-1">Score</div>
                      <div className="text-fluid-lg md:text-fluid-2xl font-black text-black leading-none">{match.scoreA}/{match.wicketsA} vs {match.scoreB}/{match.wicketsB}</div>
                    </div>
                    <button className="w-8 h-8 md:w-10 md:h-10 bg-green-100 rounded-lg flex items-center justify-center text-black hover:bg-sports-green hover:text-white transition-all">
                      <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
                    </button>
                  </div>
                </div>
              </Card>
            </div>
          ))
        )}
      </div>
    </div>
  );


  const renderOpenersSelection = () => {
    const battingTeam = score.battingTeam;
    const bowlingTeam = battingTeam === 'A' ? 'B' : 'A';
    const battingPlayers = battingTeam === 'A' ? matchConfig.playersA : matchConfig.playersB;
    const bowlingPlayers = bowlingTeam === 'A' ? matchConfig.playersA : matchConfig.playersB;
    const battingTeamName = battingTeam === 'A' ? (matchConfig.teamA || 'Team A') : (matchConfig.teamB || 'Team B');
    const bowlingTeamName = bowlingTeam === 'A' ? (matchConfig.teamA || 'Team A') : (matchConfig.teamB || 'Team B');
    return (
      <div className="max-w-2xl mx-auto space-y-8 pb-12">
        <div className="text-center space-y-3">
          <h2 className="text-3xl font-black text-black tracking-tighter">Select Openers</h2>
          <p className="text-black text-sm font-medium">{battingTeamName} is batting first</p>
        </div>
        <Card className="p-6 space-y-6">
          <div className="space-y-4">
            <label className="text-xs font-black text-black uppercase tracking-widest block">Opening Batsmen ({battingTeamName})</label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black text-black uppercase tracking-widest mb-2 block">Striker</label>
                <select value={batsmen.onStrike.name}
                  onChange={(e) => setBatsmen(prev => ({ ...prev, onStrike: { name: e.target.value, runs: 0, balls: 0 } }))}
                  className="w-full px-3 py-2.5 bg-white border-2 border-green-300 rounded-xl text-black font-bold text-sm outline-none focus:border-sports-green">
                  <option value="">Select striker...</option>
                  {battingPlayers.filter(p => p && p !== batsmen.nonStriker.name).map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-black text-black uppercase tracking-widest mb-2 block">Non-Striker</label>
                <select value={batsmen.nonStriker.name}
                  onChange={(e) => setBatsmen(prev => ({ ...prev, nonStriker: { name: e.target.value, runs: 0, balls: 0 } }))}
                  className="w-full px-3 py-2.5 bg-white border-2 border-green-300 rounded-xl text-black font-bold text-sm outline-none focus:border-sports-green">
                  <option value="">Select non-striker...</option>
                  {battingPlayers.filter(p => p && p !== batsmen.onStrike.name).map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <label className="text-xs font-black text-black uppercase tracking-widest block">Opening Bowler ({bowlingTeamName})</label>
            <select value={currentBowler.name}
              onChange={(e) => setCurrentBowler({ name: e.target.value, overs: 0, runs: 0, wickets: 0 })}
              className="w-full px-3 py-2.5 bg-white border-2 border-green-300 rounded-xl text-black font-bold text-sm outline-none focus:border-sports-green">
              <option value="">Select bowler...</option>
              {bowlingPlayers.filter(p => p).map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <button
            disabled={!batsmen.onStrike.name || !batsmen.nonStriker.name || !currentBowler.name}
            onClick={() => {
              setScore(prev => ({ ...prev, battedPlayers: [batsmen.onStrike.name, batsmen.nonStriker.name] }));
              setCurrentView('live-scoring');
            }}
            className="w-full py-4 bg-sports-green text-white rounded-xl font-black uppercase tracking-widest text-sm hover:bg-sports-blue transition-all shadow-lg disabled:opacity-30 flex items-center justify-center gap-3">
            Start Match <ArrowRight className="w-5 h-5" />
          </button>
        </Card>
      </div>
    );
  };

  const renderMatchSetup = () => (
    <div className="max-w-6xl mx-auto space-y-fluid-12 pb-fluid-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-fluid-6">
        <div className="space-y-fluid-2">
          <div className="flex items-center gap-fluid-3 text-sports-blue mb-2">
            <div className="w-10 h-10 rounded-xl bg-sports-blue/20 flex items-center justify-center">
              <Trophy className="w-5 h-5" />
            </div>
            <span className="text-fluid-xs font-black uppercase tracking-[0.3em]">New Match</span>
          </div>
          <h2 className="text-fluid-4xl md:text-fluid-5xl font-black text-black tracking-tighter">Setup Session</h2>
        </div>
        <div className="flex items-center gap-fluid-4">
          <button onClick={() => setCurrentView('dashboard')}
            className="flex items-center gap-2 px-fluid-4 py-fluid-2 bg-green-100 hover:bg-green-200 border border-green-300 rounded-lg font-bold text-fluid-xs text-black transition-all">
            <ArrowRight className="w-4 h-4 rotate-180" /> Back
          </button>
          <div className="flex items-center gap-fluid-4 bg-green-50 p-fluid-2 rounded-2xl border border-green-200">
            {['mode', 'teams', 'players', 'toss'].map((step, i) => (
              <div key={step} className="flex items-center">
                <button disabled={activeSetupStep === step} onClick={() => setActiveSetupStep(step as any)}
                  className={`px-fluid-6 py-fluid-3 rounded-xl text-fluid-xs font-black uppercase tracking-widest transition-all ${
                    activeSetupStep === step ? 'bg-gradient-to-r from-sports-blue to-sports-green text-white shadow-[0_0_20px_rgba(22,163,74,0.3)]' : 'text-black hover:text-sports-green'
                  }`}>
                  {i + 1}. {step}
                </button>
                {i < 3 && <div className="w-4 h-px bg-green-300 mx-fluid-2" />}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-fluid-8">
        <div className="lg:col-span-2 space-y-fluid-8">
          {activeSetupStep === 'mode' ? (
            <Card className="p-fluid-6 md:p-fluid-12 flex flex-col items-center justify-center text-center space-y-fluid-8">
              <div className="w-20 h-20 rounded-3xl bg-sports-blue/10 flex items-center justify-center">
                <Settings2 className="w-10 h-10 text-sports-blue" />
              </div>
              <div className="space-y-fluid-2 max-w-md">
                <h3 className="text-fluid-2xl font-black text-black tracking-tight">Choose Setup Mode</h3>
                <p className="text-black text-fluid-sm leading-relaxed">Select how you want to organize your teams.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-fluid-6 w-full max-w-2xl">
                <button onClick={() => { setMatchConfig({...matchConfig, setupMode: 'manual'}); setActiveSetupStep('teams'); }}
                  className={`p-fluid-8 rounded-2xl border-2 transition-all text-left group ${matchConfig.setupMode === 'manual' ? 'border-sports-blue bg-sports-blue/5' : 'border-green-200 bg-green-50 hover:border-green-300'}`}>
                  <div className="w-12 h-12 rounded-xl bg-sports-blue/20 flex items-center justify-center text-sports-blue mb-fluid-6 group-hover:scale-110 transition-transform">
                    <Users className="w-6 h-6" />
                  </div>
                  <h4 className="text-fluid-lg font-black text-black mb-2">Team Selection</h4>
                  <p className="text-black text-fluid-xs leading-relaxed">Manually enter names for Team A and Team B.</p>
                </button>
                <button onClick={() => { setMatchConfig({...matchConfig, setupMode: 'shuffle'}); setActiveSetupStep('teams'); }}
                  className={`p-fluid-8 rounded-2xl border-2 transition-all text-left group ${matchConfig.setupMode === 'shuffle' ? 'border-sports-green bg-sports-green/5' : 'border-green-200 bg-green-50 hover:border-green-300'}`}>
                  <div className="w-12 h-12 rounded-xl bg-sports-green/20 flex items-center justify-center text-sports-green mb-fluid-6 group-hover:scale-110 transition-transform">
                    <Shuffle className="w-6 h-6" />
                  </div>
                  <h4 className="text-fluid-lg font-black text-black mb-2">Shuffle Players</h4>
                  <p className="text-black text-fluid-xs leading-relaxed">Enter all players and shuffle into balanced teams.</p>
                </button>
              </div>
            </Card>
          ) : activeSetupStep === 'teams' ? (
            <Card className="p-fluid-6 md:p-fluid-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mb-6">
                <div className="space-y-4">
                  <label className="text-xs font-black text-black uppercase tracking-widest flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-sports-blue" /> Team A Name
                  </label>
                  <input type="text" placeholder="e.g. Titans" value={matchConfig.teamA}
                    onChange={(e) => setMatchConfig({...matchConfig, teamA: e.target.value})}
                    className="w-full px-fluid-4 py-fluid-2.5 bg-white border border-green-300 rounded-xl focus:ring-2 focus:ring-sports-green/40 outline-none font-bold text-black text-fluid-xs transition-all" />
                </div>
                <div className="space-y-4">
                  <label className="text-xs font-black text-black uppercase tracking-widest flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-sports-red" /> Team B Name
                  </label>
                  <input type="text" placeholder="e.g. Warriors" value={matchConfig.teamB}
                    onChange={(e) => setMatchConfig({...matchConfig, teamB: e.target.value})}
                    className="w-full px-fluid-4 py-fluid-2.5 bg-white border border-green-300 rounded-xl focus:ring-2 focus:ring-sports-green/40 outline-none font-bold text-black text-fluid-xs transition-all" />
                </div>
              </div>
              <div className="space-y-4 mb-6">
                <div className="flex items-center gap-2 text-black">
                  <div className="w-6 h-6 rounded-lg bg-green-100 flex items-center justify-center"><Clock className="w-3 h-3" /></div>
                  <span className="text-[10px] font-black uppercase tracking-widest">Format (Overs)</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {[5, 10, 20, 50].map(o => (
                    <button key={o} onClick={() => setMatchConfig({...matchConfig, overs: o})}
                      className={`px-4 py-2 rounded-xl font-black text-xs transition-all ${matchConfig.overs === o ? 'bg-sports-green text-white' : 'bg-green-100 text-black hover:bg-green-200'}`}>
                      {o}
                    </button>
                  ))}
                  <input type="number" placeholder="Custom"
                    className="w-20 px-3 py-2 bg-white border border-green-300 rounded-xl outline-none font-bold text-center text-xs text-black"
                    onChange={(e) => setMatchConfig({...matchConfig, overs: parseInt(e.target.value) || 0})} />
                </div>
              </div>
              <div className="space-y-4 mb-6">
                <div className="flex items-center gap-2 text-black">
                  <div className="w-6 h-6 rounded-lg bg-green-100 flex items-center justify-center"><Users className="w-3 h-3" /></div>
                  <span className="text-[10px] font-black uppercase tracking-widest">Players per Team</span>
                </div>
                <div className="flex items-center gap-4">
                  <input type="range" min="1" max="15" value={matchConfig.numPlayers}
                    onChange={(e) => handleNumPlayersChange(parseInt(e.target.value))}
                    className="flex-1 h-1.5 bg-green-200 rounded-lg appearance-none cursor-pointer accent-sports-green" />
                  <span className="w-10 h-8 bg-green-100 rounded-lg flex items-center justify-center font-black text-black border border-green-300 text-xs">{matchConfig.numPlayers}</span>
                </div>
              </div>
              <div className="pt-6 flex justify-between border-t border-green-300">
                <button onClick={() => setActiveSetupStep('mode')}
                  className="px-6 py-2.5 bg-green-100 hover:bg-green-200 border border-green-300 text-black rounded-xl font-black uppercase tracking-widest text-[10px] transition-all flex items-center gap-2">
                  <Undo2 className="w-3 h-3" /> Back
                </button>
                <button onClick={() => setActiveSetupStep('players')}
                  className="px-6 py-2.5 bg-sports-green text-white rounded-xl font-black uppercase tracking-widest text-[10px] transition-all flex items-center gap-2 hover:bg-sports-blue">
                  Next <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </Card>
          ) : activeSetupStep === 'players' ? (
            <Card className="p-4 md:p-8">
              {matchConfig.setupMode === 'manual' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 pb-3 border-b border-green-300">
                      <div className="w-8 h-8 bg-sports-blue/20 rounded-lg flex items-center justify-center text-sports-blue font-black text-xs">A</div>
                      <h4 className="font-black text-black uppercase tracking-widest text-sm">{matchConfig.teamA || 'Team A'} Players</h4>
                    </div>
                    <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                      {matchConfig.playersA.map((name, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <span className="text-[10px] font-black text-black w-4">{i + 1}</span>
                          <input type="text" placeholder={`Player ${i + 1}`} value={name}
                            onChange={(e) => { const p = [...matchConfig.playersA]; p[i] = e.target.value; setMatchConfig({...matchConfig, playersA: p}); }}
                            className="flex-1 px-3 py-2 bg-white border border-green-300 rounded-lg focus:ring-2 focus:ring-sports-green/40 outline-none font-bold text-black text-xs transition-all" />
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 pb-3 border-b border-green-300">
                      <div className="w-8 h-8 bg-sports-red/20 rounded-lg flex items-center justify-center text-sports-red font-black text-xs">B</div>
                      <h4 className="font-black text-black uppercase tracking-widest text-sm">{matchConfig.teamB || 'Team B'} Players</h4>
                    </div>
                    <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                      {matchConfig.playersB.map((name, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <span className="text-[10px] font-black text-black w-4">{i + 1}</span>
                          <input type="text" placeholder={`Player ${i + 1}`} value={name}
                            onChange={(e) => { const p = [...matchConfig.playersB]; p[i] = e.target.value; setMatchConfig({...matchConfig, playersB: p}); }}
                            className="flex-1 px-3 py-2 bg-white border border-green-300 rounded-lg focus:ring-2 focus:ring-sports-green/40 outline-none font-bold text-black text-xs transition-all" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-green-300">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-sports-green/20 rounded-xl flex items-center justify-center text-sports-green"><Users className="w-5 h-5" /></div>
                      <div>
                        <h4 className="font-black text-black uppercase tracking-widest text-sm">All Players Pool</h4>
                        <p className="text-black text-[10px] font-bold">Enter {matchConfig.numPlayers * 2} players to be shuffled</p>
                      </div>
                    </div>
                    <button onClick={shufflePlayers} disabled={matchConfig.allPlayers.some(p => !p)}
                      className="px-6 py-2.5 bg-sports-green hover:bg-sports-blue text-white rounded-xl font-black uppercase tracking-widest text-[10px] transition-all flex items-center gap-2 disabled:opacity-40">
                      <Shuffle className="w-4 h-4" /> Shuffle Now
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                    {matchConfig.allPlayers.map((name, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <span className="text-[10px] font-black text-black w-4">{i + 1}</span>
                        <input type="text" placeholder={`Player ${i + 1}`} value={name}
                          onChange={(e) => { const p = [...matchConfig.allPlayers]; p[i] = e.target.value; setMatchConfig({...matchConfig, allPlayers: p}); }}
                          className="flex-1 px-3 py-2 bg-white border border-green-300 rounded-lg focus:ring-2 focus:ring-sports-green/40 outline-none font-bold text-black text-xs transition-all" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="mt-8 pt-6 flex justify-between border-t border-green-300">
                <button onClick={() => setActiveSetupStep('teams')}
                  className="px-6 py-2.5 bg-green-100 hover:bg-green-200 border border-green-300 text-black rounded-xl font-black uppercase tracking-widest text-[10px] transition-all flex items-center gap-2">
                  <Undo2 className="w-3 h-3" /> Back
                </button>
                <button onClick={() => {
                    if (matchConfig.setupMode === 'shuffle') shufflePlayers();
                    else setMatchConfig(prev => ({ ...prev, teamA: prev.teamA || 'Team A', teamB: prev.teamB || 'Team B', playersA: prev.playersA.map((p, i) => p || `A-Player ${i + 1}`), playersB: prev.playersB.map((p, i) => p || `B-Player ${i + 1}`) }));
                    setActiveSetupStep('toss');
                  }}
                  className="px-6 py-2.5 bg-sports-green text-white rounded-xl font-black uppercase tracking-widest text-[10px] transition-all flex items-center gap-2 hover:bg-sports-blue">
                  Next: Toss <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </Card>
          ) : (
            <Card className="p-8 space-y-8">
              <div className="text-center space-y-4">
                <motion.div animate={isTossing ? { rotateY: 720, scale: [1, 1.2, 1] } : {}} transition={{ duration: 2 }}
                  className="w-20 h-20 rounded-full bg-sports-green/20 border-2 border-sports-green flex items-center justify-center mx-auto cursor-pointer"
                  onClick={!isTossing ? handleAIToss : undefined}>
                  <Coins className={`w-10 h-10 text-sports-green ${isTossing ? 'animate-bounce' : ''}`} />
                </motion.div>
                <h3 className="text-2xl font-black text-black tracking-tight">The Toss</h3>
                <p className="text-black text-sm font-medium">{isTossing ? 'Flipping coin...' : 'Click coin for AI Toss or select manually.'}</p>
                {!isTossing && !matchConfig.toss.winner && (
                  <button onClick={handleAIToss} className="px-6 py-2 bg-sports-green text-white rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-sports-blue transition-all">AI Toss Now</button>
                )}
              </div>
              {!matchConfig.toss.winner ? (
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-black uppercase tracking-widest block text-center">Select Toss Winner</label>
                  <div className="grid grid-cols-2 gap-4">
                    {(['Team A', 'Team B'] as const).map(team => (
                      <button key={team} onClick={() => setMatchConfig({...matchConfig, toss: {...matchConfig.toss, winner: team}})}
                        className={`p-6 rounded-2xl border-2 transition-all flex flex-col items-center gap-3 ${matchConfig.toss.winner === team ? 'bg-green-100 border-sports-green' : 'border-green-300 bg-white hover:bg-green-50'}`}>
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center font-black text-base text-white"
                          style={{ backgroundColor: team === 'Team A' ? matchConfig.colorA : matchConfig.colorB }}>
                          {team === 'Team A' ? 'A' : 'B'}
                        </div>
                        <span className="font-black text-black text-xs uppercase tracking-widest">{team === 'Team A' ? (matchConfig.teamA || 'Team A') : (matchConfig.teamB || 'Team B')}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center font-black text-xl text-white"
                      style={{ backgroundColor: matchConfig.toss.winner === 'Team A' ? matchConfig.colorA : matchConfig.colorB }}>
                      {matchConfig.toss.winner === 'Team A' ? 'A' : 'B'}
                    </div>
                    <div className="text-center">
                      <span className="text-[10px] font-black text-black uppercase tracking-widest block mb-1">Toss Winner</span>
                      <h4 className="text-xl font-black text-black uppercase">{matchConfig.toss.winner === 'Team A' ? (matchConfig.teamA || 'Team A') : (matchConfig.teamB || 'Team B')}</h4>
                    </div>
                    <button onClick={() => setMatchConfig({...matchConfig, toss: {...matchConfig.toss, winner: null, choice: null}})}
                      className="text-[10px] font-black text-sports-red uppercase tracking-widest hover:underline">Reset Toss</button>
                  </div>
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-black uppercase tracking-widest block text-center">Choose Decision</label>
                    <div className="grid grid-cols-2 gap-4">
                      <button onClick={() => setMatchConfig({...matchConfig, toss: {...matchConfig.toss, choice: 'Bat'}})}
                        className={`p-6 rounded-2xl border-2 transition-all flex flex-col items-center gap-3 ${matchConfig.toss.choice === 'Bat' ? 'border-sports-green bg-green-100' : 'border-green-300 bg-white hover:bg-green-50'}`}>
                        <div className="w-10 h-10 rounded-lg bg-sports-green/20 border border-sports-green flex items-center justify-center text-sports-green"><CircleDot className="w-6 h-6" /></div>
                        <span className="font-black text-black text-xs uppercase tracking-widest">Bat First</span>
                      </button>
                      <button onClick={() => setMatchConfig({...matchConfig, toss: {...matchConfig.toss, choice: 'Bowl'}})}
                        className={`p-6 rounded-2xl border-2 transition-all flex flex-col items-center gap-3 ${matchConfig.toss.choice === 'Bowl' ? 'border-sports-blue bg-blue-50' : 'border-green-300 bg-white hover:bg-green-50'}`}>
                        <div className="w-10 h-10 rounded-lg bg-sports-blue/20 border border-sports-blue flex items-center justify-center text-sports-blue"><Shield className="w-6 h-6" /></div>
                        <span className="font-black text-black text-xs uppercase tracking-widest">Bowl First</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
              <div className="pt-6 flex justify-center border-t border-green-300">
                <button onClick={() => setActiveSetupStep('players')}
                  className="px-8 py-3 bg-green-100 hover:bg-green-200 border border-green-300 text-black rounded-xl font-black uppercase tracking-widest text-[10px] transition-all flex items-center gap-2">
                  <Undo2 className="w-4 h-4" /> Back to Players
                </button>
              </div>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card className="border border-green-300 p-8 flex flex-col justify-between relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="text-xl font-black text-black tracking-tight mb-6">Match Summary</h3>
              <div className="space-y-4">
                {[
                  { label: 'Setup Mode', value: matchConfig.setupMode, color: 'text-sports-green' },
                  { label: 'Players', value: `${matchConfig.numPlayers} per team`, color: 'text-black' },
                  { label: 'Duration', value: `${matchConfig.overs} Overs`, color: 'text-black' },
                ].map(({ label, value, color }) => (
                  <div key={label} className="flex justify-between text-sm">
                    <span className="text-black font-medium">{label}</span>
                    <span className={`font-bold ${color} uppercase tracking-widest text-[10px]`}>{value}</span>
                  </div>
                ))}
                <div className="flex justify-between text-sm">
                  <span className="text-black font-medium">Teams</span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold" style={{ color: matchConfig.colorA }}>{matchConfig.teamA || 'A'}</span>
                    <span className="text-black font-bold">vs</span>
                    <span className="font-bold" style={{ color: matchConfig.colorB }}>{matchConfig.teamB || 'B'}</span>
                  </div>
                </div>
                {matchConfig.toss.winner && (
                  <div className="pt-4 mt-4 border-t border-green-300 space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-black font-medium">Toss Winner</span>
                      <span className="font-bold text-sports-green">{matchConfig.toss.winner === 'Team A' ? (matchConfig.teamA || 'Team A') : (matchConfig.teamB || 'Team B')}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-black font-medium">Decision</span>
                      <span className="font-bold text-sports-blue">{matchConfig.toss.choice} First</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <button
              disabled={!matchConfig.toss.winner || !matchConfig.toss.choice}
              onClick={() => {
                const battingTeam = (matchConfig.toss.winner === 'Team A' && matchConfig.toss.choice === 'Bat') || (matchConfig.toss.winner === 'Team B' && matchConfig.toss.choice === 'Bowl') ? 'A' : 'B';
                const bowlingTeam = battingTeam === 'A' ? 'B' : 'A';
                const finalTeamA = matchConfig.teamA || 'Team A';
                const finalTeamB = matchConfig.teamB || 'Team B';
                const finalPlayersA = matchConfig.playersA.map((p, i) => p || `A-Player ${i + 1}`);
                const finalPlayersB = matchConfig.playersB.map((p, i) => p || `B-Player ${i + 1}`);
                setMatchConfig(prev => ({ ...prev, teamA: finalTeamA, teamB: finalTeamB, playersA: finalPlayersA, playersB: finalPlayersB }));
                const battingPlayers = battingTeam === 'A' ? finalPlayersA : finalPlayersB;
                const bowlingPlayers = bowlingTeam === 'A' ? finalPlayersA : finalPlayersB;
                setScore(prev => ({ ...prev, runs: 0, wickets: 0, balls: 0, battingTeam, battedPlayers: [battingPlayers[0] || '', battingPlayers[1] || ''], partnership: { runs: 0, balls: 0 }, innings: 1, firstInningsScore: null }));
                setBatsmen({ onStrike: { name: battingPlayers[0] || '', runs: 0, balls: 0 }, nonStriker: { name: battingPlayers[1] || '', runs: 0, balls: 0 } });
                setCurrentBowler({ name: bowlingPlayers[0] || '', overs: 0, runs: 0, wickets: 0 });
                setMatchHistoryStack([]);
                setCommentary([]);
                setCurrentView('openers-selection');
              }}
              className="mt-8 w-full py-4 bg-sports-green text-white rounded-xl font-black uppercase tracking-widest text-sm hover:bg-sports-blue transition-all shadow-lg disabled:opacity-30 flex items-center justify-center gap-3">
              Start Match <ArrowRight className="w-5 h-5" />
            </button>
          </Card>
        </div>
      </div>
    </div>
  );

  const renderLiveScoring = () => {
    const currentBattingTeamName = score.battingTeam === 'A' ? (matchConfig.teamA || 'Team A') : (matchConfig.teamB || 'Team B');
    const currentBattingTeamColor = score.battingTeam === 'A' ? matchConfig.colorA : matchConfig.colorB;
    const battingPlayers = score.battingTeam === 'A' ? matchConfig.playersA : matchConfig.playersB;
    const crr = score.balls > 0 ? ((score.runs / score.balls) * 6).toFixed(1) : '0.0';
    const ballsLeft = Math.max(0, matchConfig.overs * 6 - score.balls);
    const target = score.innings === 2 && score.firstInningsScore ? score.firstInningsScore.runs + 1 : null;
    const need = target ? Math.max(0, target - score.runs) : null;

    return (
      <div className="max-w-5xl mx-auto space-y-3 pb-6">
        <AnimatePresence>
          {scorePopAnimation && (
            <motion.div initial={{ opacity: 0, y: 0, scale: 0.5 }} animate={{ opacity: 1, y: -80, scale: 1.5 }} exit={{ opacity: 0, scale: 0 }} transition={{ duration: 0.5 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-50">
              <div className={`text-5xl font-black drop-shadow-lg ${scorePopAnimation.type === 'six' ? 'text-red-600' : scorePopAnimation.type === 'boundary' ? 'text-yellow-600' : 'text-green-600'}`}>
                +{scorePopAnimation.runs}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-center justify-between bg-white border border-green-300 rounded-xl px-4 py-2 shadow-sm">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
            <span className="text-xs font-black text-red-600 uppercase tracking-widest">LIVE</span>
            <span className="font-black text-sm" style={{ color: currentBattingTeamColor }}>{currentBattingTeamName}</span>
            <span className="text-xs text-black font-bold">batting</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-black">{matchConfig.overs} ov match</span>
            <button onClick={undoLastAction} disabled={matchHistoryStack.length === 0}
              className="flex items-center gap-1 px-3 py-1.5 bg-green-100 hover:bg-green-200 border border-green-300 rounded-lg text-xs font-black text-black transition-all disabled:opacity-40">
              <Undo2 className="w-3 h-3" strokeWidth={3} /> Undo
            </button>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-3">
          <div className="col-span-12 md:col-span-4 bg-white border-2 rounded-2xl p-4 flex flex-col justify-center items-center shadow-sm" style={{ borderColor: currentBattingTeamColor }}>
            <div className="text-xs font-black uppercase tracking-widest mb-1" style={{ color: currentBattingTeamColor }}>{currentBattingTeamName}</div>
            <div className="flex items-baseline gap-1">
              <span className="text-6xl font-black text-black leading-none">{score.runs}</span>
              <span className="text-3xl font-black text-red-600">/{score.wickets}</span>
            </div>
            <div className="text-sm font-bold text-black mt-1">{formatOvers(score.balls)} ov</div>
            <div className="flex gap-3 mt-2 text-xs font-bold text-black">
              <span>CRR <span className="text-sports-green font-black">{crr}</span></span>
              <span>Left <span className="text-sports-blue font-black">{ballsLeft}</span></span>
            </div>
            {target && <div className="mt-2 px-3 py-1 bg-orange-100 border border-orange-300 rounded-lg text-xs font-black text-orange-700">Need {need} off {ballsLeft} balls</div>}
          </div>

          <div className="col-span-12 md:col-span-8 grid grid-cols-3 gap-2">
            <div className="bg-green-50 border-2 border-green-400 rounded-xl p-3">
              <div className="text-[10px] font-black text-green-700 uppercase tracking-widest flex items-center gap-1 mb-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse inline-block" /> Striker
              </div>
              <div className="font-black text-black text-sm leading-tight truncate">{batsmen.onStrike.name || '—'}</div>
              <div className="text-xl font-black text-green-700 leading-none mt-1">{batsmen.onStrike.runs}</div>
              <div className="text-[10px] font-bold text-black">({batsmen.onStrike.balls} balls)</div>
            </div>
            <div className="bg-yellow-50 border-2 border-yellow-400 rounded-xl p-3">
              <div className="text-[10px] font-black text-yellow-700 uppercase tracking-widest mb-1">Non-Striker</div>
              <div className="font-black text-black text-sm leading-tight truncate">{batsmen.nonStriker.name || '—'}</div>
              <div className="text-xl font-black text-yellow-700 leading-none mt-1">{batsmen.nonStriker.runs}</div>
              <div className="text-[10px] font-bold text-black">({batsmen.nonStriker.balls} balls)</div>
            </div>
            <div className="bg-red-50 border-2 border-red-400 rounded-xl p-3">
              <div className="text-[10px] font-black text-red-700 uppercase tracking-widest mb-1">Bowler</div>
              <div className="font-black text-black text-sm leading-tight truncate">{currentBowler.name || '—'}</div>
              <div className="text-xl font-black text-red-700 leading-none mt-1">{currentBowler.wickets}-{currentBowler.runs}</div>
              <div className="text-[10px] font-bold text-black">({currentBowler.overs} ov)</div>
            </div>
          </div>
        </div>

        <div className="bg-white border border-green-300 rounded-xl p-3 shadow-sm">
          <div className="text-[10px] font-black text-black uppercase tracking-widest mb-2">Score</div>
          <div className="grid grid-cols-9 gap-1.5">
            {[0, 1, 2, 3, 4, 6, 'Wide', 'No-Ball', 'WICKET'].map((action) => (
              <button key={action} onClick={() => handleScoreAction(action)} disabled={isInningsOver}
                className={`py-3 rounded-lg text-xs font-black transition-all active:scale-95 disabled:opacity-30 uppercase tracking-wide border-2
                  ${action === 0 ? 'bg-slate-100 border-slate-300 text-black hover:bg-slate-200' :
                    action === 1 ? 'bg-green-100 border-green-400 text-green-900 hover:bg-green-200' :
                    action === 2 ? 'bg-green-100 border-green-400 text-green-900 hover:bg-green-200' :
                    action === 3 ? 'bg-green-100 border-green-400 text-green-900 hover:bg-green-200' :
                    action === 4 ? 'bg-yellow-100 border-yellow-400 text-yellow-900 hover:bg-yellow-200' :
                    action === 6 ? 'bg-orange-100 border-orange-400 text-orange-900 hover:bg-orange-200' :
                    action === 'Wide' ? 'bg-purple-100 border-purple-400 text-purple-900 hover:bg-purple-200' :
                    action === 'No-Ball' ? 'bg-blue-100 border-blue-400 text-blue-900 hover:bg-blue-200' :
                    'bg-red-500 border-red-600 text-white hover:bg-red-600'}`}>
                {action}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-12 gap-3">
          <div className="col-span-12 md:col-span-3 bg-white border border-green-300 rounded-xl p-3 shadow-sm">
            <div className="text-[10px] font-black text-black uppercase tracking-widest mb-2">Partnership</div>
            <div className="flex justify-between items-center">
              <div className="text-center"><div className="text-2xl font-black text-sports-green">{score.partnership.runs}</div><div className="text-[10px] font-bold text-black">runs</div></div>
              <div className="text-center"><div className="text-2xl font-black text-sports-blue">{score.partnership.balls}</div><div className="text-[10px] font-bold text-black">balls</div></div>
              <div className="text-center"><div className="text-2xl font-black text-orange-600">{score.partnership.balls > 0 ? ((score.partnership.runs / score.partnership.balls) * 6).toFixed(1) : '0.0'}</div><div className="text-[10px] font-bold text-black">RR</div></div>
            </div>
          </div>

          <div className="col-span-12 md:col-span-5 bg-white border border-green-300 rounded-xl p-3 shadow-sm max-h-40 overflow-y-auto custom-scrollbar">
            <div className="text-[10px] font-black text-black uppercase tracking-widest mb-2">🎙️ Tamil Commentary</div>
            {commentary.length === 0 ? (
              <div className="text-xs text-black text-center py-3">Start scoring to see commentary</div>
            ) : (
              <div className="space-y-1.5">
                {commentary.slice(0, 6).map((item, idx) => (
                  <div key={idx} className={`px-2 py-1.5 rounded-lg text-xs font-medium text-black border-l-4 ${
                    item.event === 'Wicket' ? 'bg-red-50 border-red-500' :
                    item.event === 'Boundary' ? 'bg-yellow-50 border-yellow-500' :
                    item.event === 'Six' ? 'bg-orange-50 border-orange-500' :
                    'bg-green-50 border-green-400'}`}>
                    <span className="font-black text-[10px] uppercase">{item.event}: </span>{item.text}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="col-span-12 md:col-span-4 bg-white border border-green-300 rounded-xl p-3 shadow-sm max-h-40 overflow-y-auto custom-scrollbar">
            <div className="text-[10px] font-black text-black uppercase tracking-widest mb-2">Over History</div>
            {overHistory.length === 0 ? (
              <div className="text-xs text-black text-center py-3">No overs completed yet</div>
            ) : (
              <div className="space-y-1">
                {[...overHistory].reverse().map((over, idx) => (
                  <div key={idx} className="flex items-center justify-between px-2 py-1.5 bg-green-50 border border-green-200 rounded-lg">
                    <span className="text-xs font-black text-black">Ov {over.over}</span>
                    <span className="text-xs font-black text-sports-green">{over.runs} runs</span>
                    {over.wickets > 0 && <span className="text-[10px] font-black text-white bg-red-500 px-1.5 py-0.5 rounded">{over.wickets}W</span>}
                    <span className="text-[10px] font-bold text-black">{over.totalRuns}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <AnimatePresence>
          {showWicketModal && (
            <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-red-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center"><X className="w-5 h-5 text-red-600" strokeWidth={3} /></div>
                  <div><h2 className="text-lg font-black text-black">Wicket!</h2><p className="text-xs font-bold text-black">{batsmen.onStrike.name} is out</p></div>
                </div>
                <div className="mb-4">
                  <label className="text-[10px] font-black text-black uppercase tracking-widest mb-2 block">Dismissal Type</label>
                  <div className="grid grid-cols-2 gap-2">
                    {(['Bowled', 'Caught', 'LBW', 'Run Out'] as const).map(type => (
                      <button key={type} onClick={() => { setDismissalType(type); setFielderName(''); }}
                        className={`py-2 px-3 rounded-lg font-black text-xs transition-all border-2 ${dismissalType === type ? 'bg-red-500 text-white border-red-500' : 'bg-white text-black border-green-300 hover:border-green-400'}`}>
                        {type}
                      </button>
                    ))}
                  </div>
                </div>
                {dismissalType === 'Caught' && (
                  <div className="mb-4">
                    <label className="text-[10px] font-black text-black uppercase tracking-widest mb-2 block">Caught by (Fielder)</label>
                    <select value={fielderName} onChange={(e) => setFielderName(e.target.value)}
                      className="w-full px-3 py-2 bg-white border-2 border-green-300 rounded-lg text-black font-bold text-sm outline-none focus:border-sports-green">
                      <option value="">Select fielder...</option>
                      {matchConfig[score.battingTeam === 'A' ? 'playersB' : 'playersA'].filter(p => p).map(p => <option key={p} value={p}>{p}{p === currentBowler.name ? ' (Bowler)' : ''}</option>)}
                    </select>
                  </div>
                )}
                {dismissalType === 'Run Out' && (
                  <div className="mb-4">
                    <label className="text-[10px] font-black text-black uppercase tracking-widest mb-2 block">Run Out by (Fielder)</label>
                    <select value={fielderName} onChange={(e) => setFielderName(e.target.value)}
                      className="w-full px-3 py-2 bg-white border-2 border-green-300 rounded-lg text-black font-bold text-sm outline-none focus:border-sports-green">
                      <option value="">Select fielder...</option>
                      {matchConfig[score.battingTeam === 'A' ? 'playersB' : 'playersA'].filter(p => p).map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                )}
                <div className="flex gap-2">
                  <button onClick={() => { setShowWicketModal(false); setDismissalType(null); setFielderName(''); }}
                    className="flex-1 py-2.5 bg-green-100 border border-green-300 text-black rounded-xl font-black text-xs hover:bg-green-200">Cancel</button>
                  <button onClick={confirmWicket}
                    disabled={!dismissalType || ((dismissalType === 'Caught' || dismissalType === 'Run Out') && !fielderName.trim())}
                    className="flex-1 py-2.5 bg-red-500 text-white rounded-xl font-black text-xs hover:bg-red-600 disabled:opacity-40">Confirm Out</button>
                </div>
              </motion.div>
            </div>
          )}
          {showNewBatsmanModal && (
            <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-green-300">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center"><Users className="w-5 h-5 text-sports-green" strokeWidth={3} /></div>
                  <div><h2 className="text-lg font-black text-black">New Batsman</h2><p className="text-xs font-bold text-black">{newBatsmanPosition === 'striker' ? 'On Strike' : 'Non-Strike'}</p></div>
                </div>
                <select onChange={(e) => {
                    if (newBatsmanPosition === 'striker') setBatsmen(prev => ({ ...prev, onStrike: { name: e.target.value, runs: 0, balls: 0 } }));
                    else setBatsmen(prev => ({ ...prev, nonStriker: { name: e.target.value, runs: 0, balls: 0 } }));
                  }}
                  className="w-full px-3 py-2.5 bg-white border-2 border-green-300 rounded-xl text-black font-bold text-sm outline-none focus:border-sports-green mb-4">
                  <option value="">Select batsman...</option>
                  {battingPlayers.filter(p => p && p !== batsmen.onStrike.name && p !== batsmen.nonStriker.name && p !== 'OUT').map(p => <option key={p} value={p}>{p}</option>)}
                </select>
                <div className="flex gap-2">
                  <button onClick={() => { setShowNewBatsmanModal(false); setNewBatsmanPosition(null); }}
                    className="flex-1 py-2.5 bg-green-100 border border-green-300 text-black rounded-xl font-black text-xs hover:bg-green-200">Cancel</button>
                  <button onClick={() => { setShowNewBatsmanModal(false); setNewBatsmanPosition(null); }}
                    disabled={newBatsmanPosition === 'striker' ? !batsmen.onStrike.name : !batsmen.nonStriker.name}
                    className="flex-1 py-2.5 bg-sports-green text-white rounded-xl font-black text-xs hover:bg-sports-blue disabled:opacity-40">Confirm</button>
                </div>
              </motion.div>
            </div>
          )}
          {showNewBowlerModal && (
            <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-green-300">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center"><CircleDot className="w-5 h-5 text-sports-green" strokeWidth={3} /></div>
                  <div><h2 className="text-lg font-black text-black">New Bowler</h2><p className="text-xs font-bold text-black">Over complete — select next bowler</p></div>
                </div>
                <select onChange={(e) => setCurrentBowler({ name: e.target.value, overs: 0, runs: 0, wickets: 0 })}
                  className="w-full px-3 py-2.5 bg-white border-2 border-green-300 rounded-xl text-black font-bold text-sm outline-none focus:border-sports-green mb-4">
                  <option value="">Select bowler...</option>
                  {(score.battingTeam === 'A' ? matchConfig.playersB : matchConfig.playersA).filter(p => p && p !== currentBowler.name).map(p => <option key={p} value={p}>{p}</option>)}
                </select>
                <button onClick={() => setShowNewBowlerModal(false)}
                  className="w-full py-2.5 bg-sports-green text-white rounded-xl font-black text-xs hover:bg-sports-blue">Confirm Bowler</button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  const renderSettings = () => (
    <div className="max-w-4xl mx-auto space-y-fluid-8 pb-fluid-12">
      <div className="flex flex-col gap-fluid-2 mb-6">
        <h2 className="text-fluid-3xl font-black text-black tracking-tighter">System Settings</h2>
        <p className="text-black text-fluid-sm font-medium">Manage your application preferences</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-fluid-8">
        <div className="md:col-span-2 space-y-fluid-6">
          <Card title="Match Settings">
            <div className="space-y-fluid-6 mt-fluid-4">
              <div className="space-y-fluid-2">
                <label className="text-fluid-xs font-black text-black uppercase tracking-widest">Default Match Format (Overs)</label>
                <div className="flex gap-fluid-3">
                  {[5, 10, 20, 50].map(o => (
                    <button key={o} className="px-fluid-4 py-fluid-2 bg-green-100 hover:bg-green-200 border border-green-300 rounded-lg font-bold text-black text-fluid-xs transition-all">{o}</button>
                  ))}
                </div>
              </div>
              <div className="space-y-fluid-2">
                <label className="text-fluid-xs font-black text-black uppercase tracking-widest">Default Players Per Team</label>
                <input type="number" min="1" max="15" placeholder="11"
                  className="w-full px-fluid-4 py-fluid-3 bg-white border border-green-300 rounded-xl focus:ring-2 focus:ring-sports-green/40 outline-none font-bold text-black transition-all" />
              </div>
            </div>
          </Card>
          <Card title="Commentary">
            <div className="mt-fluid-4 p-4 bg-green-50 rounded-xl border border-green-200">
              <div className="flex items-center gap-3">
                <div className="text-2xl">🎙️</div>
                <div>
                  <div className="font-black text-black text-sm">Tamil Commentary Active</div>
                  <div className="text-xs text-black font-medium">All commentary is generated in Tamil with playful banter and cricket slang.</div>
                </div>
              </div>
            </div>
          </Card>
        </div>
        <div className="space-y-fluid-6">
          <Card>
            <div className="text-center p-fluid-4">
              <div className="w-20 h-20 bg-sports-green/10 rounded-2xl flex items-center justify-center text-sports-green mx-auto mb-fluid-4 border border-green-300 shadow-lg">
                <Settings className="w-10 h-10" />
              </div>
              <h3 className="text-fluid-lg font-black text-black mb-2">About CricPro</h3>
              <p className="text-fluid-xs text-black mb-fluid-6 leading-relaxed">Track matches between any two teams with live scoring and Tamil commentary.</p>
              <div className="text-fluid-xs text-black font-bold">Version 1.0.0</div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard': return renderDashboard();
      case 'match-setup': return renderMatchSetup();
      case 'openers-selection': return renderOpenersSelection();
      case 'live-scoring': return renderLiveScoring();
      case 'match-history': return renderMatchHistory();
      case 'settings': return renderSettings();
      default: return renderDashboard();
    }
  };

  const getBreadcrumbs = () => {
    const map: Record<View, string> = {
      'dashboard': 'Home / Dashboard', 'match-setup': 'Home / New Match',
      'openers-selection': 'Home / Openers', 'live-scoring': 'Home / Live Scoring',
      'match-history': 'Home / History', 'roster': 'Home / Roster', 'settings': 'Home / Settings',
    };
    return map[currentView] || '';
  };

  const getPageTitle = () => {
    const map: Record<View, string> = {
      'dashboard': 'Dashboard', 'match-setup': 'Match Setup',
      'openers-selection': 'Select Openers', 'live-scoring': 'Live Scoring',
      'match-history': 'Match History', 'roster': 'Player Roster', 'settings': 'Settings',
    };
    return map[currentView] || '';
  };

  const renderSidebar = () => {
    const navItems = [
      { id: 'dashboard', icon: LayoutDashboard, label: 'Home' },
      { id: 'match-setup', icon: Plus, label: 'New Match' },
      { id: 'match-history', icon: History, label: 'Matches' },
      { id: 'settings', icon: Settings, label: 'Settings' },
    ];
    return (
      <>
        <motion.aside initial={false} animate={{ width: isSidebarCollapsed ? 72 : 240 }}
          className="hidden md:flex flex-col bg-gradient-to-b from-white to-green-50 border-r border-green-200 h-screen sticky top-0 z-40 transition-all duration-300">
          <div className="p-5 flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-sports-blue to-sports-green rounded-xl flex items-center justify-center text-white shadow-[0_0_20px_rgba(22,163,74,0.4)] shrink-0">
              <CircleDot className="w-5 h-5" strokeWidth={3} />
            </div>
            {!isSidebarCollapsed && (
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-lg font-black tracking-tighter text-black">
                CRIC<span className="text-sports-green">PRO</span>
              </motion.span>
            )}
          </div>
          <nav className="flex-1 px-2.5 space-y-1 mt-2">
            {navItems.map((item) => (
              <button key={item.id} onClick={() => setCurrentView(item.id as View)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative
                  ${currentView === item.id ? 'bg-sports-green text-white shadow-lg font-black' : 'text-black hover:bg-green-100 hover:text-sports-green font-bold'}`}>
                <item.icon className={`w-4.5 h-4.5 shrink-0 ${currentView === item.id ? 'text-white' : 'group-hover:text-sports-green'}`} strokeWidth={3} />
                {!isSidebarCollapsed && (
                  <motion.span initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="text-xs font-black tracking-tight">{item.label}</motion.span>
                )}
              </button>
            ))}
          </nav>
          <div className="p-3 border-t border-green-200">
            <button onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="w-full flex items-center justify-center p-2 bg-green-100 hover:bg-green-200 rounded-lg text-black transition-colors">
              <Menu className="w-4 h-4" strokeWidth={3} />
            </button>
          </div>
        </motion.aside>

        <AnimatePresence>
          {!isSidebarCollapsed && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsSidebarCollapsed(true)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 md:hidden" />
          )}
        </AnimatePresence>

        <motion.aside initial={{ x: -240 }} animate={{ x: isSidebarCollapsed ? -240 : 0 }}
          className="fixed left-0 top-0 bottom-0 w-[240px] bg-white z-[60] md:hidden shadow-2xl flex flex-col">
          <div className="p-6 flex items-center justify-between border-b border-green-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-sports-green rounded-xl flex items-center justify-center text-white shadow-lg"><CircleDot className="w-6 h-6" strokeWidth={3} /></div>
              <span className="text-xl font-black tracking-tighter text-black">CRIC<span className="text-sports-green">PRO</span></span>
            </div>
            <button onClick={() => setIsSidebarCollapsed(true)} className="p-2 hover:bg-green-100 rounded-xl text-black"><X className="w-6 h-6" strokeWidth={3} /></button>
          </div>
          <nav className="flex-1 px-3 space-y-1 mt-4">
            {navItems.map((item) => (
              <button key={item.id} onClick={() => { setCurrentView(item.id as View); setIsSidebarCollapsed(true); }}
                className={`w-full flex items-center gap-4 px-4 py-4 rounded-xl transition-all font-bold
                  ${currentView === item.id ? 'bg-sports-green text-white shadow-xl font-black' : 'text-black hover:bg-green-100 hover:text-sports-green'}`}>
                <item.icon className={`w-5 h-5 ${currentView === item.id ? 'text-white' : ''}`} strokeWidth={3} />
                <span className="text-sm font-black tracking-tight">{item.label}</span>
              </button>
            ))}
          </nav>
        </motion.aside>
      </>
    );
  };

  return (
    <div className="min-h-screen bg-sports-bg flex flex-col font-sans text-black overflow-hidden">
      <div className="flex flex-1 overflow-hidden">
        {renderSidebar()}
        <div className="flex-1 flex flex-col overflow-hidden">
          <header className="bg-white/90 backdrop-blur-xl border-b border-green-200 h-fluid-14 flex items-center justify-between px-fluid-6 sticky top-0 z-30">
            <div className="flex items-center gap-fluid-4">
              <button onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                className="p-fluid-2 hover:bg-green-100 rounded-lg text-black transition-colors md:hidden">
                <Menu className="w-5 h-5" strokeWidth={3} />
              </button>
              <div className="flex flex-col">
                <div className="text-fluid-xs font-black text-black uppercase tracking-widest">{getBreadcrumbs()}</div>
                <h1 className="text-fluid-base font-black text-black tracking-tight">{getPageTitle()}</h1>
              </div>
            </div>
            <div className="flex items-center gap-fluid-4">
              <div className="hidden lg:flex items-center bg-green-50 rounded-xl px-fluid-4 py-fluid-1.5 w-64 focus-within:ring-2 focus-within:ring-sports-green/40 border border-green-200">
                <Search className="w-3.5 h-3.5 text-black mr-2" strokeWidth={3} />
                <input type="text" placeholder="Quick search..." className="bg-transparent text-fluid-xs outline-none w-full font-bold text-black placeholder-black" />
              </div>
              <button className="p-fluid-2 hover:bg-green-100 rounded-lg text-black relative transition-colors">
                <Bell className="w-4 h-4" strokeWidth={3} />
                <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-sports-green rounded-full border-2 border-white"></span>
              </button>
            </div>
          </header>
          <main className="flex-1 overflow-y-auto p-fluid-4 sm:p-fluid-6 custom-scrollbar bg-transparent">
            <div className="max-w-7xl mx-auto">{renderContent()}</div>
          </main>
        </div>
      </div>

      <AnimatePresence>
        {showInningsOverModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-xl z-[110] flex items-center justify-center p-6">
            <Card className="max-w-md w-full p-8 space-y-6 border-green-300 shadow-2xl">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-sports-green/20 flex items-center justify-center mx-auto border border-green-300"><Trophy className="w-8 h-8 text-sports-green" /></div>
                <h3 className="text-2xl font-black text-black tracking-tight">Innings Over!</h3>
                <div className="p-4 bg-green-50 rounded-2xl border border-green-200">
                  <div className="text-black text-xs font-black uppercase tracking-widest">Final Score</div>
                  <div className="text-3xl font-black text-black">{score.runs}/{score.wickets}</div>
                  <div className="text-sports-green text-xs font-bold">Target: {score.runs + 1}</div>
                </div>
              </div>
              <button onClick={startSecondInnings}
                className="w-full py-4 bg-sports-green text-white rounded-xl font-black uppercase tracking-widest text-sm hover:bg-sports-blue transition-all shadow-lg flex items-center justify-center gap-3">
                Start Second Innings <ArrowRight className="w-5 h-5" />
              </button>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showMatchOverModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-xl z-[110] flex items-center justify-center p-6">
            <Card className="max-w-md w-full p-8 space-y-6 border-green-300 shadow-2xl">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-sports-green/20 flex items-center justify-center mx-auto border border-green-300"><Trophy className="w-8 h-8 text-sports-green" /></div>
                <h3 className="text-2xl font-black text-black tracking-tight">Match Over!</h3>
                <div className="p-4 bg-green-50 rounded-2xl border border-green-200">
                  <div className="text-black text-xs font-black uppercase tracking-widest">Final Score</div>
                  <div className="text-3xl font-black text-black">{score.runs}/{score.wickets}</div>
                </div>
              </div>
              <button onClick={finishMatch}
                className="w-full py-4 bg-sports-green text-white rounded-xl font-black uppercase tracking-widest text-sm hover:bg-sports-blue transition-all shadow-lg flex items-center justify-center gap-3">
                Finish Match <ArrowRight className="w-5 h-5" />
              </button>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button onClick={() => setIsChatOpen(!isChatOpen)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-sports-green text-white rounded-full shadow-lg flex items-center justify-center z-40 hover:bg-sports-blue transition-all"
        whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
        <Bot className="w-6 h-6" />
      </motion.button>

      <AnimatePresence>
        {isChatOpen && (
          <motion.div initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 right-6 w-80 bg-white rounded-2xl shadow-2xl border border-green-300 z-40 overflow-hidden">
            <div className="p-4 border-b border-green-200 flex items-center justify-between bg-green-50">
              <div className="flex items-center gap-2"><Bot className="w-5 h-5 text-sports-green" /><span className="font-black text-black text-sm">AI Assistant</span></div>
              <button onClick={() => setIsChatOpen(false)} className="text-black hover:text-sports-green"><X className="w-4 h-4" strokeWidth={3} /></button>
            </div>
            <div className="p-4 h-48 overflow-y-auto custom-scrollbar">
              <p className="text-xs text-black font-medium">Ask me anything about the match!</p>
            </div>
            <div className="p-3 border-t border-green-200 bg-green-50 flex gap-2">
              <input type="text" placeholder="Ask AI anything..."
                className="flex-1 bg-white rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-sports-green/40 font-medium text-black border border-green-300" />
              <button className="bg-sports-green text-white p-2 rounded-xl hover:bg-sports-blue transition-all"><Send className="w-4 h-4" /></button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

