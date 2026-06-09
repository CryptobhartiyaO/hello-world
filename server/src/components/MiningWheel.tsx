import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Pickaxe, Power, Flame, Compass, RefreshCw } from 'lucide-react';
import { RoundPhase, TileAngle } from '../types';
import { TILE_ANGLES } from '../utils/math';
import { playClick } from '../utils/audio';

interface MiningWheelProps {
  phase: RoundPhase;
  winningSquare: number | null;
  spotlightIndex: number | null;
  selectedTiles: number[];
  otherMinersTiles: Record<number, number>; // tileIndex -> count of other miners on it
  onToggleTile: (tileIndex: number) => void;
  countdownText: string;
  isMiningActive: boolean;
  onToggleMining: () => void;
  cores: number;
  onChangeCores: (cores: number) => void;
}

export default function MiningWheel({
  phase,
  winningSquare,
  spotlightIndex,
  selectedTiles,
  otherMinersTiles,
  onToggleTile,
  countdownText,
  isMiningActive,
  onToggleMining,
  cores,
  onChangeCores
}: MiningWheelProps) {
  const [hoveredTile, setHoveredTile] = useState<number | null>(null);

  // Helper to determine the style properties of a single tile/arc
  const getTileStyles = (tileId: number) => {
    const isPlayerSelected = selectedTiles.includes(tileId);
    const otherMinersCount = otherMinersTiles[tileId] || 0;
    const isSpotlight = spotlightIndex === tileId;
    const isWinner = phase === RoundPhase.WINNER_REVEALED && winningSquare === tileId;
    const isWinningPeriod = (phase === RoundPhase.WINNER_REVEALED || phase === RoundPhase.SHOWING_WINNERS) && winningSquare === tileId;

    // 1. Winner Revealed / Showing Winner State
    if (isWinner || isWinningPeriod) {
      return {
        fill: 'rgba(16, 185, 129, 0.24)', // Emerald highlight
        stroke: 'rgba(16, 185, 129, 0.98)',
        strokeWidth: 2.8,
        glowClass: 'drop-shadow-[0_0_25px_rgba(16,185,129,0.5)]',
        opacity: 1
      };
    }

    // 2. Spotlight during Spin Glow
    if (isSpotlight) {
      return {
        fill: 'rgba(245, 158, 11, 0.28)', // Amber flash
        stroke: 'rgba(245, 158, 11, 0.98)',
        strokeWidth: 2.5,
        glowClass: 'drop-shadow-[0_0_22px_rgba(245,158,11,0.45)]',
        opacity: 1
      };
    }

    // 3. User Selected Tile (Active, Idle states)
    if (isPlayerSelected) {
      return {
        fill: 'rgba(244, 63, 94, 0.18)', // Rose/coral player coordinates
        stroke: 'rgba(244, 63, 94, 0.88)',
        strokeWidth: 1.8,
        glowClass: 'drop-shadow-[0_0_15px_rgba(244,63,94,0.3)]',
        opacity: 1
      };
    }

    // 4. Other miners on the tile (adds ambient lighting)
    if (otherMinersCount > 0 && phase === RoundPhase.ACTIVE) {
      const density = Math.min(otherMinersCount / 3, 1);
      return {
        fill: `rgba(168, 85, 247, ${0.05 + density * 0.1})`, // Purple heat map
        stroke: `rgba(168, 85, 247, ${0.15 + density * 0.35})`,
        strokeWidth: 1.2,
        glowClass: '',
        opacity: 0.85
      };
    }

    // 5. Normal Hover
    if (hoveredTile === tileId && phase === RoundPhase.ACTIVE) {
      return {
        fill: 'rgba(255, 255, 255, 0.08)',
        stroke: 'rgba(255, 255, 255, 0.45)',
        strokeWidth: 1.5,
        glowClass: 'drop-shadow-[0_0_12px_rgba(255,255,255,0.15)]',
        opacity: 1
      };
    }

    // 6. Eliminated in closing phase (dimmed down)
    if (phase === RoundPhase.CLOSING) {
      return {
        fill: 'rgba(15, 23, 42, 0.15)',
        stroke: 'rgba(148, 163, 184, 0.08)',
        strokeWidth: 1.0,
        glowClass: '',
        opacity: 0.3
      };
    }

    // 7. Default Idle State
    return {
      fill: 'rgba(255, 255, 255, 0.02)',
      stroke: 'rgba(255, 255, 255, 0.16)',
      strokeWidth: 1.1,
      glowClass: '',
      opacity: 0.65
    };
  };

  // Label text configuration for the center circle overlay
  const getCenterStatusText = () => {
    switch (phase) {
      case RoundPhase.IDLE:
        return {
          header: 'WAITING',
          title: countdownText,
          sub: 'NEXT BLOCK INCOMING',
          color: 'text-zinc-400'
        };
      case RoundPhase.ACTIVE:
        return {
          header: isMiningActive ? 'MINING ACTIVE' : 'MINER READY',
          title: countdownText,
          sub: isMiningActive ? 'SOLVING COORDINATES...' : 'START TO DISCOVER BLOCKS',
          color: isMiningActive ? 'text-amber-500 animate-pulse' : 'text-orange-400'
        };
      case RoundPhase.CLOSING:
        return {
          header: 'CLOSING ROUND',
          title: 'VERIFYING',
          sub: 'COMPILING BLOCK SEEDS',
          color: 'text-amber-400 animate-pulse'
        };
      case RoundPhase.SPIN_GLOW:
        return {
          header: 'SOLVER SPINNING',
          title: spotlightIndex !== null ? `TILE #${spotlightIndex + 1}` : 'ROLLING',
          sub: 'SELECTING WINNING COORDINATE',
          color: 'text-yellow-400 animate-pulse'
        };
      case RoundPhase.WINNER_REVEALED:
      case RoundPhase.SHOWING_WINNERS:
        return {
          header: 'WINNER DETERMINED',
          title: `TILE #${(winningSquare ?? 0) + 1}`,
          sub: selectedTiles.includes(winningSquare ?? -1) 
            ? '🎉 SUCCESSFUL PROOF OF WORK!' 
            : 'ROUND COMPLETE',
          color: selectedTiles.includes(winningSquare ?? -1) ? 'text-emerald-400 animate-bounce' : 'text-emerald-400'
        };
    }
  };

  const centerText = getCenterStatusText();

  return (
    <div className="flex flex-col items-center">
      {/* Outer wrapper frame with absolute inner details */}
      <div 
        id="zinc-wheel-container"
        className="relative w-full max-w-[34rem] aspect-square flex items-center justify-center p-4 rounded-full border border-dashed border-zinc-800 bg-zinc-950/40 shadow-2xl overflow-visible"
      >
        {/* Glow backdrop circles */}
        <div className="absolute inset-[6%] rounded-full bg-[radial-gradient(circle,rgba(249,115,22,0.03),rgba(15,23,42,0)_64%,transparent_75%)] pointer-events-none" />
        <div className="absolute inset-[15%] rounded-full bg-[radial-gradient(circle,rgba(168,85,2purple8,0.02),rgba(15,23,42,0)_56%,transparent_72%)] pointer-events-none" />

        {/* Dynamic rotating ambient halo in active mining */}
        {phase === RoundPhase.ACTIVE && isMiningActive && (
          <motion.div 
            className="absolute inset-[4%] rounded-full border border-orange-500/10 pointer-events-none"
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 18, ease: "linear" }}
          />
        )}

        {/* Circular SVG containing the actual tiles */}
        <svg
          viewBox="0 0 580 580"
          className="relative z-10 w-full h-full overflow-visible select-none drop-shadow-lg"
          aria-label="Zinc Proof of Work Ring"
        >
          <g>
            {TILE_ANGLES.map((tile) => {
              const styles = getTileStyles(tile.id);
              const otherCount = otherMinersTiles[tile.id] || 0;
              const isMine = selectedTiles.includes(tile.id);

              return (
                <g
                  key={tile.id}
                  className={`transition-all duration-300 ease-out ${styles.glowClass} ${phase === RoundPhase.ACTIVE ? 'cursor-pointer' : 'cursor-default'}`}
                  onPointerEnter={() => {
                    if (phase === RoundPhase.ACTIVE) setHoveredTile(tile.id);
                  }}
                  onPointerLeave={() => {
                    if (phase === RoundPhase.ACTIVE) setHoveredTile(null);
                  }}
                  onClick={() => {
                    if (phase === RoundPhase.ACTIVE) {
                      playClick();
                      onToggleTile(tile.id);
                    }
                  }}
                >
                  <path
                    id={`tile-${tile.id}`}
                    d={tile.path}
                    fill={styles.fill}
                    stroke={styles.stroke}
                    strokeWidth={styles.strokeWidth}
                    opacity={styles.opacity}
                    style={{
                      transition: 'fill 180ms ease, stroke 180ms ease, stroke-width 180ms ease, opacity 180ms ease'
                    }}
                  />

                  {/* Tile labels / coordinates marker */}
                  <g pointerEvents="none">
                    {/* Tiny glowing dot inside selected or highlight tiles */}
                    {(isMine || styles.strokeWidth > 2) && (
                      <circle
                        cx={tile.labelX}
                        cy={tile.labelY}
                        r={isMine ? "3.5" : "2.5"}
                        fill={isMine ? "#f43f5e" : "#f59e0b"}
                        className="animate-pulse"
                      />
                    )}

                    {/* Tiny number text or other count display */}
                    <text
                      x={tile.labelX}
                      y={tile.labelY + (isMine || styles.strokeWidth > 2 ? 14 : 4)}
                      textAnchor="middle"
                      className="fill-zinc-400 font-mono text-[0.62rem] pointer-events-none select-none"
                    >
                      {tile.id + 1}
                    </text>

                    {/* Small layout indicator circle for density overlay */}
                    {otherCount > 0 && phase === RoundPhase.ACTIVE && !isMine && (
                      <g transform={`translate(${tile.labelX}, ${tile.labelY - 14})`}>
                        <circle r="6" className="fill-purple-500/25 stroke-purple-500/50 stroke-[0.8]" />
                        <text
                          y="2.5"
                          textAnchor="middle"
                          className="fill-purple-300 font-mono text-[0.55rem] font-bold"
                        >
                          {otherCount}
                        </text>
                      </g>
                    )}
                  </g>
                </g>
              );
            })}
          </g>
        </svg>

        {/* Center UI Overlay (absolute glassmorphic circular box) */}
        <div 
          id="wheel-center-overlay"
          className="absolute inset-[33%] rounded-full bg-zinc-950/90 border border-zinc-800/80 shadow-[inset_0_4px_30px_rgba(0,0,0,0.8),0_20px_50px_rgba(0,0,0,0.7)] flex flex-col items-center justify-center text-center p-4 z-20 overflow-hidden"
        >
          {/* Top category label */}
          <span className="text-[0.58rem] font-bold uppercase tracking-[0.2em] text-zinc-500 font-mono">
            {centerText.header}
          </span>

          {/* Large dynamic value / countdown */}
          <div className="my-1.5 h-10 flex items-center justify-center">
            <span className={`text-2xl md:text-3xl font-bold font-mono tracking-wide ${centerText.color}`}>
              {centerText.title}
            </span>
          </div>

          {/* Small descriptor subheadline */}
          <p className="text-[0.58rem] leading-normal uppercase tracking-wider text-zinc-400 max-w-[12rem] mx-auto font-mono">
            {centerText.sub}
          </p>

          {/* Live total entries statistics on bottom of sphere */}
          {phase === RoundPhase.ACTIVE && (
            <div className="absolute bottom-4 flex justify-center gap-3 text-[0.6rem] font-mono text-zinc-500">
              <span>MINE: {selectedTiles.length} / 30</span>
              <span>•</span>
              <span>MINERS: {Object.values(otherMinersTiles).reduce((a, b) => a + b, 0)}</span>
            </div>
          )}

          {/* Mining details inside complete state */}
          {(phase === RoundPhase.WINNER_REVEALED || phase === RoundPhase.SHOWING_WINNERS) && (
            <div className="absolute bottom-4 flex flex-col items-center gap-0.5 text-[0.6rem] font-mono">
              <span className={selectedTiles.includes(winningSquare ?? -1) ? "text-emerald-400 font-semibold" : "text-zinc-500"}>
                {selectedTiles.includes(winningSquare ?? -1) ? '+2.50 ZINC RECEIVED' : 'Block Reward Claimed'}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Interactive mining Controls placed underneath the wheel */}
      <div 
        id="wheel-controls"
        className="mt-6 w-full max-w-md flex flex-col gap-4 bg-zinc-900/40 p-4 rounded-xl border border-zinc-800/60 backdrop-blur-sm"
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-col gap-0.5">
            <span className="text-xs text-zinc-400 font-mono uppercase tracking-wide">
              Power Cores Allocation
            </span>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="1"
                max="8"
                value={cores}
                disabled={!isMiningActive}
                onChange={(e) => {
                  playClick();
                  onChangeCores(parseInt(e.target.value));
                }}
                className="w-28 accent-rose-500 disabled:opacity-40"
              />
              <span className="text-xs font-bold font-mono text-rose-400">
                {cores} Threads
              </span>
            </div>
          </div>

          {/* Big Start / Stop Miner button */}
          <button
            onClick={() => {
              playClick();
              onToggleMining();
            }}
            disabled={phase !== RoundPhase.ACTIVE}
            className={`px-5 py-2.5 rounded-lg border font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all shadow-md active:translate-y-0.5 ${
              phase !== RoundPhase.ACTIVE 
                ? 'bg-zinc-800/40 text-zinc-600 border-zinc-900 cursor-not-allowed shadow-none'
                : isMiningActive
                ? 'bg-amber-500/10 border-amber-500/50 text-amber-400 hover:bg-amber-500/20'
                : 'bg-rose-600 hover:bg-rose-500 border-transparent text-white hover:shadow-rose-900/30 font-semibold'
            }`}
          >
            {isMiningActive ? (
              <>
                <Power className="size-4 animate-spin text-amber-400" />
                STOP MINING
              </>
            ) : (
              <>
                <Pickaxe className="size-4 animate-bounce" />
                START MINER
              </>
            )}
          </button>
        </div>

        {/* Small helpful mining tip bar */}
        <p className="text-[0.68rem] text-zinc-500 leading-normal font-mono flex items-center gap-1.5 border-t border-zinc-800/40 pt-2 bg-gradient-to-r from-transparent to-transparent">
          <Compass className="size-3.5 text-rose-400 flex-shrink-0" />
          <span>
            {phase === RoundPhase.ACTIVE 
              ? 'Click segment positions directly on the wheel to direct your PoW solver. Allocate more threads to increase hash capacity.'
              : 'Block compilation is currently in progress. Submitting coordinate hashes to Solana blockchain...'}
          </span>
        </p>
      </div>
    </div>
  );
}
