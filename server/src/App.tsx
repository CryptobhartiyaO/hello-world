import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Volume2, 
  VolumeX, 
  Cpu, 
  Coins, 
  HelpCircle, 
  Lock, 
  Pickaxe, 
  ExternalLink,
  Github,
  Compass
} from 'lucide-react';
import { RoundPhase, RoundInfo, ChatMessage, PlayerStats, RoundHistoryItem } from './types';
import MiningWheel from './components/MiningWheel';
import StatsGrid from './components/StatsGrid';
import PlayerLeaderboard from './components/PlayerLeaderboard';
import RoundHistory from './components/RoundHistory';
import GlobalChat from './components/GlobalChat';
import { TILE_ANGLES } from './utils/math';
import { 
  setSoundEnabled, 
  isSoundEnabled, 
  playTick, 
  playClick, 
  playSuccessChime, 
  playRoundStarted,
  playHeartbeat 
} from './utils/audio';

// Constants
const SOL_PRICE_INITIAL = 145.24;
const ZINC_PRICE_INITIAL = 0.0912;
const GAME_COORDINATES_COUNT = 30;

// Chat bots response bank
const CHAT_RESPONSES = [
  "Mining coordinates optimized. Let's solve this block!",
  "CONFIDENTIAL MEMO: Arcium secure multiparty computations are compiling.",
  "Coordinate hashes registered on Solana devnet, ready for verification.",
  "ZINC price looking solid today, powered by privacy preserving mining rings.",
  "Which thread cores count are you using guys? I allocated 6 threads.",
  "Coordinates #14 and #27 are hitting multiple times. Keep an eye on them!",
  "Participative proof-of-work is much better than single node racing. Distributed shares rock.",
  "Glow phase is incoming, wrap up coordinate placements solvers!"
];

export default function App() {
  const [userAddress] = useState('7xKp3v9Zp8hGq1Nd6XmToR4yW');
  const [userStockpile, setUserStockpile] = useState(() => {
    const saved = localStorage.getItem('zinc_stockpile');
    return saved ? parseFloat(saved) : 12.450;
  });

  // Sound Config state
  const [audioEnabled, setAudioEnabled] = useState(isSoundEnabled());

  // Web Stats state
  const [solPrice, setSolPrice] = useState(SOL_PRICE_INITIAL);
  const [zincPrice, setZincPrice] = useState(ZINC_PRICE_INITIAL);
  const [difficulty] = useState('8.45M');
  const [blocksMined, setBlocksMined] = useState(84102);
  const [globalHashrate, setGlobalHashrate] = useState('45.24 KH/s');

  // Core Game State
  const [phase, setPhase] = useState<RoundPhase>(RoundPhase.ACTIVE);
  const [currentRoundId, setCurrentRoundId] = useState(41235);
  const [countdownSeconds, setCountdownSeconds] = useState(15);
  const [countdownText, setCountdownText] = useState('00:15');
  const [winningSquare, setWinningSquare] = useState<number | null>(null);
  const [spotlightIndex, setSpotlightIndex] = useState<number | null>(null);

  // Active Coordinates (tiles picked by player)
  const [selectedTiles, setSelectedTiles] = useState<number[]>([]);
  const [isMiningActive, setIsMiningActive] = useState(false);
  const [cores, setCores] = useState(4);

  // Live Simulated Solvers / Leaders
  const [activePlayers, setActivePlayers] = useState<PlayerStats[]>([]);
  const [otherMinersTiles, setOtherMinersTiles] = useState<Record<number, number>>({});

  // History Log database
  const [roundHistory, setRoundHistory] = useState<RoundHistoryItem[]>([
    { roundId: 41234, winningSquare: 11, difficulty: '8.41M', totalReward: 12.5 },
    { roundId: 41233, winningSquare: 23, difficulty: '8.39M', totalReward: 15.0 },
    { roundId: 41232, winningSquare: 5, difficulty: '8.38M', totalReward: 10.0 }
  ]);

  // Decryption Hub Chat database
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { id: '1', sender: 'HashRunner', avatarSeed: 'hr', text: 'Tile #12 is looking extremely hot. Directing my solvers there.', timestamp: '19:02' },
    { id: '2', sender: 'SYSTEM', avatarSeed: 'sys', text: 'Solana PoW Block #84,101 completed successfully. 12.50 ZINC distributed across solvers.', timestamp: '19:03', isSystem: true },
    { id: '3', sender: 'SolanaChaser', avatarSeed: 'sc', text: 'Running 8 threads on a high-spec core. Stockpile is accumulating fast!', timestamp: '19:04' },
    { id: '4', sender: 'ZincBillion', avatarSeed: 'zb', text: 'Does anyone notice the active heat mapping? Purple tiles mean other miners are densely piled there.', timestamp: '19:05' }
  ]);

  // Audio Toggler
  const toggleAudio = () => {
    const newState = !audioEnabled;
    setAudioEnabled(newState);
    setSoundEnabled(newState);
    playClick();
  };

  // Click Coordinates handler
  const handleToggleTile = (tileIndex: number) => {
    if (phase !== RoundPhase.ACTIVE) return;
    if (selectedTiles.includes(tileIndex)) {
      setSelectedTiles(selectedTiles.filter(t => t !== tileIndex));
    } else {
      setSelectedTiles([...selectedTiles, tileIndex]);
    }
  };

  // Toggle Start Mining button handler
  const handleToggleMining = () => {
    setIsMiningActive(!isMiningActive);
    if (!isMiningActive && selectedTiles.length === 0) {
      // Auto-assign adjacent coordinates so miner isn't empty on launch
      const adjacent = [11, 12, 13];
      setSelectedTiles(adjacent);
    }
  };

  // Handle core threads slider
  const handleChangeCores = (newCores: number) => {
    setCores(newCores);
  };

  // Submit User text chat message
  const handleSendMessage = (text: string) => {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg: ChatMessage = {
      id: Math.random().toString(),
      sender: userAddress,
      avatarSeed: 'user',
      text,
      timestamp: timeStr
    };
    
    setChatMessages(prev => [...prev, userMsg]);

    // Intelligent chatbot reaction trigger after delay
    setTimeout(() => {
      const lower = text.toLowerCase();
      let responseText = CHAT_RESPONSES[Math.floor(Math.random() * CHAT_RESPONSES.length)];

      if (lower.includes('hot')) {
        responseText = "Coordinates #11, #14 and #23 are hit most frequently in recent block logs. Try wrapping them!";
      } else if (lower.includes('mining') || lower.includes('miner')) {
        responseText = `Yeah! Running ${cores} threads is efficient. Your hash rates are looking solid.`;
      } else if (lower.includes('zinc')) {
        responseText = "Confidential Solana mining with ZINC is super clean. The multiparty solver makes it extremely secure.";
      }

      const replyMsg: ChatMessage = {
        id: Math.random().toString(),
        sender: ['RigSolv003', 'HashChaser', 'BitSlinger', 'BlockArchitect'][Math.floor(Math.random() * 4)],
        avatarSeed: 'reply',
        text: responseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setChatMessages(prev => [...prev, replyMsg]);
    }, 1500 + Math.random() * 1000);
  };

  // Save stockpile changes
  useEffect(() => {
    localStorage.setItem('zinc_stockpile', userStockpile.toString());
  }, [userStockpile]);

  // Initial solvers compilation setup
  useEffect(() => {
    const solversList: PlayerStats[] = [
      { address: '8k8LYnP9dGqW1Nd6', hashrate: 320, rewardStockpile: 8.420, joinedTile: 11, isClaimable: false },
      { address: 'F9zPr3Kx9G2mTnR3', hashrate: 450, rewardStockpile: 15.650, joinedTile: 23, isClaimable: false },
      { address: '3gH6nW9xK2T4vM1n', hashrate: 180, rewardStockpile: 2.110, joinedTile: 5, isClaimable: false },
      { address: 'R5mK9yW2pT3nG1L4', hashrate: 640, rewardStockpile: 24.180, joinedTile: 14, isClaimable: false },
      { address: 'D8b3gN8x4W2rT1yK', hashrate: 520, rewardStockpile: 11.230, joinedTile: 27, isClaimable: false }
    ];
    setActivePlayers(solversList);

    // Initial random tile heatmap distribution of other solvers
    const heatmap: Record<number, number> = {};
    solversList.forEach(s => {
      if (s.joinedTile !== null) {
        heatmap[s.joinedTile] = (heatmap[s.joinedTile] || 0) + 1;
      }
    });
    setOtherMinersTiles(heatmap);
  }, []);

  // Sync statistics and pricing tickers
  useEffect(() => {
    const priceInterval = setInterval(() => {
      setSolPrice(prev => prev + (Math.random() - 0.5) * 0.15);
      setZincPrice(prev => prev + (Math.random() - 0.5) * 0.0002);
      
      // Update hashrate organically
      if (isMiningActive) {
        setGlobalHashrate(`${(45.24 + (cores * 0.24) + (Math.random() - 0.5) * 0.4).toFixed(2)} KH/s`);
      } else {
        setGlobalHashrate(`${(45.24 + (Math.random() - 0.5) * 0.2).toFixed(2)} KH/s`);
      }
    }, 4000);

    return () => clearInterval(priceInterval);
  }, [isMiningActive, cores]);

  // Core Game Loop State Machine
  useEffect(() => {
    let internalTimer: NodeJS.Timeout;

    // 1. ACTIVE MINING COUNTDOWN
    if (phase === RoundPhase.ACTIVE) {
      if (countdownSeconds > 0) {
        internalTimer = setTimeout(() => {
          setCountdownSeconds(prev => prev - 1);
          setCountdownText(`00:${(countdownSeconds - 1).toString().padStart(2, '0')}`);
          
          // Play a slight dynamic heartbeat tick on final countdowns
          if (countdownSeconds <= 4 && audioEnabled) {
            playHeartbeat();
          }

          // Randomly shuffle other miners positions to make dApp feel highly dynamic and active!
          if (Math.random() > 0.6) {
            setActivePlayers(prev => {
              const updated = prev.map(p => {
                const changeTile = Math.random() > 0.7;
                return {
                  ...p,
                  joinedTile: changeTile ? Math.floor(Math.random() * GAME_COORDINATES_COUNT) : p.joinedTile,
                  hashrate: changeTile ? p.hashrate + Math.round((Math.random() - 0.5) * 40) : p.hashrate
                };
              });
              
              // Recalculate segment intensities
              const heatmap: Record<number, number> = {};
              updated.forEach(s => {
                if (s.joinedTile !== null) {
                  heatmap[s.joinedTile] = (heatmap[s.joinedTile] || 0) + 1;
                }
              });
              setOtherMinersTiles(heatmap);
              return updated;
            });
          }
        }, 1000);
      } else {
        // Trigger closing deployment block
        setPhase(RoundPhase.CLOSING);
        setCountdownSeconds(2);
        setCountdownText('CLOSING');
      }
    }

    // 2. CLOSING BLOCK STAGE
    else if (phase === RoundPhase.CLOSING) {
      if (countdownSeconds > 0) {
        internalTimer = setTimeout(() => {
          setCountdownSeconds(prev => prev - 1);
        }, 1000);
      } else {
        // Prepare winning square selection
        const luckyTile = Math.floor(Math.random() * GAME_COORDINATES_COUNT);
        setWinningSquare(luckyTile);

        // Advance to Spin-Glow sequence
        setPhase(RoundPhase.SPIN_GLOW);
      }
    }

    return () => clearTimeout(internalTimer);
  }, [phase, countdownSeconds, audioEnabled]);

  // 3. SPIN-GLOW AND WINNER REVEAL ENGINE
  useEffect(() => {
    if (phase !== RoundPhase.SPIN_GLOW) return;

    // Build the sequential indices start then end
    // From (winningSquare + 1) % 30 around the circle to (winningSquare) (30 tiles)
    const winSq = winningSquare !== null ? winningSquare : 12;
    const pathIndices: number[] = [];
    for (let i = 0; i < GAME_COORDINATES_COUNT; i++) {
      pathIndices.push((winSq + 1 + i) % GAME_COORDINATES_COUNT);
    }

    let currentIndex = 0;
    const stepDuration = 40; // 40ms * 30 elements = 1200ms total spin duration! Matches spinGlowDurationMs!

    const spinTimer = setInterval(() => {
      if (currentIndex < pathIndices.length) {
        const nextTile = pathIndices[currentIndex];
        setSpotlightIndex(nextTile);
        
        // Play tick audio with rising progress frequency!
        if (audioEnabled) {
          playTick(currentIndex, pathIndices.length);
        }

        currentIndex++;
      } else {
        clearInterval(spinTimer);
        // Spin finished -> Reveal winner!
        setPhase(RoundPhase.WINNER_REVEALED);
        setSpotlightIndex(winSq);
        
        if (audioEnabled) {
          playSuccessChime();
        }

        // Auto move to Showing Winners block after 1.1s
        setTimeout(() => {
          setPhase(RoundPhase.SHOWING_WINNERS);
        }, 1100);
      }
    }, stepDuration);

    return () => clearInterval(spinTimer);
  }, [phase, winningSquare, audioEnabled]);

  // 4. PAYOUTS AND REWARD STOCKPILE ENGINE
  useEffect(() => {
    if (phase !== RoundPhase.SHOWING_WINNERS) return;

    const winSq = winningSquare !== null ? winningSquare : 0;
    const hasPlayerWon = selectedTiles.includes(winSq);

    // Calculate payouts
    let rewardPayout = 0;
    if (isMiningActive) {
      if (hasPlayerWon) {
        // Primary coordinates success
        rewardPayout = 2.50 * (cores * 0.75);
      } else if (selectedTiles.length > 0) {
        // Participation reward based on hashes successfully processed by active thread cores
        rewardPayout = 0.05 * (cores * 0.6);
      }
    }

    if (rewardPayout > 0) {
      setUserStockpile(prev => prev + rewardPayout);
    }

    // Append to Round History Database
    const newRoundHistItem: RoundHistoryItem = {
      roundId: currentRoundId,
      winningSquare: winSq,
      difficulty,
      totalReward: 12.5 + (cores * 0.5)
    };
    setRoundHistory(prev => [newRoundHistItem, ...prev]);

    // Simulated log inside Chat Room
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const systemLog: ChatMessage = {
      id: Math.random().toString(),
      sender: 'SYSTEM',
      avatarSeed: 'sys',
      text: `BLOCK #${currentRoundId} SOLVED. Winner coordinate: Tile #${winSq + 1}. Selected tiles: [${selectedTiles.map(x => x + 1).join(', ')}]. ${
        hasPlayerWon 
          ? `🎉 YOU SOLVED THE PROOF! Stockpile credited +${rewardPayout.toFixed(3)} ZINC.` 
          : rewardPayout > 0 
          ? `Participative solve rewards credited +${rewardPayout.toFixed(3)} ZINC.` 
          : 'Participative solver was inactive. No stockpile payouts credited.'
      }`,
      timestamp: timeStr,
      isSystem: true
    };
    setChatMessages(prev => [...prev, systemLog]);

    // Automatically transition to Idle state for next block compilation after 2.8s
    const holdTimer = setTimeout(() => {
      setPhase(RoundPhase.IDLE);
      setCountdownSeconds(4);
      setCountdownText('READY');
    }, 2800);

    return () => clearTimeout(holdTimer);
  }, [phase]);

  // 5. NEXT BLOCK TRANSITION COMPILATION
  useEffect(() => {
    if (phase !== RoundPhase.IDLE) return;

    let countdownTimer: NodeJS.Timeout;
    if (countdownSeconds > 0) {
      countdownTimer = setTimeout(() => {
        setCountdownSeconds(prev => prev - 1);
        setCountdownText(`READY`);
      }, 1000);
    } else {
      // Create new fresh values for upcoming round block
      setBlocksMined(prev => prev + 1);
      setCurrentRoundId(prev => prev + 1);
      
      // Keep selected tiles if miner stays active, otherwise reset!
      if (!isMiningActive) {
        setSelectedTiles([]);
      }

      setWinningSquare(null);
      setSpotlightIndex(null);

      // Transition board state to ACTIVE mining block!
      setPhase(RoundPhase.ACTIVE);
      setCountdownSeconds(15);
      setCountdownText('00:15');

      if (audioEnabled) {
        playRoundStarted();
      }
    }

    return () => clearTimeout(countdownTimer);
  }, [phase, countdownSeconds, audioEnabled]);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans relative overflow-x-hidden antialiased selection:bg-rose-500/30 selection:text-white">
      {/* Absolute Geometric Backdrop Grid lines */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293708_1px,transparent_1px),linear-gradient(to_bottom,#1f293708_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-purple-500/5 rounded-full filter blur-[120px] pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-[600px] h-[600px] bg-rose-500/5 rounded-full filter blur-[150px] pointer-events-none" />

      {/* Decorative architectural layout rails per visual boundaries */}
      <div className="border-b border-zinc-900 bg-zinc-950/60 sticky top-0 z-50 backdrop-blur-md">
        <header className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Arcium / Zinc geometric custom logo representation */}
            <div className="size-8 rounded-lg bg-gradient-to-br from-rose-600 to-amber-500 flex items-center justify-center p-0.5 shadow-md hover:scale-105 transition-transform duration-200">
              <div className="size-full bg-zinc-950 rounded-[6px] flex items-center justify-center font-bold font-mono text-sm tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white to-zinc-400">
                Z
              </div>
            </div>
            <div className="flex flex-col">
              <h1 className="text-sm font-bold font-mono tracking-wider text-white">
                ZINC
              </h1>
              <span className="text-[0.58rem] font-mono text-zinc-500 tracking-widest uppercase">
                POW CONFIDENTIAL SOLVER
              </span>
            </div>
          </div>

          {/* Connected stats / Stockton balance indicators */}
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex flex-col text-right font-mono text-[0.68rem] leading-normal">
              <span className="text-zinc-500 font-semibold uppercase">MINE STOCKPILE</span>
              <span className="text-rose-400 font-bold flex items-center gap-1 justify-end shrink-0">
                <Coins className="size-3.5 text-rose-400" />
                {userStockpile.toFixed(3)} ZINC
              </span>
            </div>

            {/* Audio Toggle button */}
            <button
              onClick={toggleAudio}
              className={`p-2 rounded-lg border transition-all ${
                audioEnabled 
                  ? 'border-orange-500/20 bg-orange-500/5 text-orange-400 hover:bg-orange-500/10' 
                  : 'border-zinc-800 bg-zinc-900/20 text-zinc-500 hover:text-zinc-400'
              }`}
              title={audioEnabled ? "Disable Synth Audio" : "Enable Synth Audio"}
            >
              {audioEnabled ? <Volume2 className="size-4" /> : <VolumeX className="size-4" />}
            </button>

            {/* Wallet Address Label */}
            <div className="bg-zinc-900/60 border border-zinc-800 rounded-lg px-2.5 py-1.5 flex items-center gap-2 max-w-[150px] shadow-sm select-none">
              <span className="size-2 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
              <span className="text-[0.68rem] font-mono font-bold text-zinc-300 truncate">
                {userAddress.substring(0, 6)}...{userAddress.substring(userAddress.length - 4)}
              </span>
            </div>
          </div>
        </header>
      </div>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6 md:py-8 flex flex-col gap-6 md:gap-8 z-10">
        {/* Global Statistics ticker row */}
        <StatsGrid
          solPrice={solPrice}
          zincPrice={zincPrice}
          globalHashrate={globalHashrate}
          difficulty={difficulty}
          blocksMined={blocksMined}
        />

        {/* Master bento layout: wheel center + solvers + chat details */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 items-start">
          
          {/* Wheel column takes major container sizing */}
          <div className="lg:col-span-7 flex flex-col items-center">
            {/* Visual Header */}
            <div className="w-full text-center lg:text-left mb-6">
              <div className="inline-flex items-center gap-1.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[0.62rem] font-mono font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-2.5">
                <span className="size-1.5 rounded-full bg-rose-500 animate-pulse" />
                BLOCK #{currentRoundId} ACTIVE SOLVING
              </div>
              <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white font-mono">
                Decentralized Coordinate Pool
              </h2>
              <p className="text-xs text-zinc-500 font-mono mt-1 leading-relaxed max-w-xl">
                Submit coordinate hashes through participative Proof of Work directly on Solana. Direct threads onto target slices.
              </p>
            </div>

            <MiningWheel
              phase={phase}
              winningSquare={winningSquare}
              spotlightIndex={spotlightIndex}
              selectedTiles={selectedTiles}
              otherMinersTiles={otherMinersTiles}
              onToggleTile={handleToggleTile}
              countdownText={countdownText}
              isMiningActive={isMiningActive}
              onToggleMining={handleToggleMining}
              cores={cores}
              onChangeCores={handleChangeCores}
            />
          </div>

          {/* Right sidebar column for leaderboards, round data, and decryption hub */}
          <div className="lg:col-span-5 flex flex-col gap-6 w-full">
            {/* Decryption chat hub */}
            <GlobalChat
              messages={chatMessages}
              onSendMessage={handleSendMessage}
              userAddress={userAddress}
            />

            {/* Sub-grid of solvers and block logs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
              
              {/* Leaderboard active savers */}
              <PlayerLeaderboard
                players={activePlayers}
                userAddress={userAddress}
                userHashrate={isMiningActive ? cores * 95 : 0}
                userStockpile={userStockpile}
                userActiveTile={selectedTiles.length > 0 ? selectedTiles[0] : null}
              />

              {/* Block history expanded logging */}
              <RoundHistory
                history={roundHistory}
              />

            </div>
          </div>

        </div>

        {/* Footer info link layout */}
        <footer className="mt-8 border-t border-zinc-900/60 pt-6 text-zinc-500 text-xs font-mono flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Compass className="size-4 text-zinc-600" />
            <span>Zinc Pow Confidential Miner Clone • Solved on Solana blockchain</span>
          </div>
          <div className="flex items-center gap-4">
            <a 
              href="https://zinc.cash" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-zinc-300 transition-colors flex items-center gap-1"
            >
              <span>Zinc Official Website</span>
              <ExternalLink className="size-3" />
            </a>
            <span>•</span>
            <span className="text-[0.62rem] text-zinc-600 uppercase font-bold tracking-widest bg-zinc-950 px-2 py-1 rounded">
              VERIFIABLE FAIR SYSTEM
            </span>
          </div>
        </footer>
      </main>
    </div>
  );
}
