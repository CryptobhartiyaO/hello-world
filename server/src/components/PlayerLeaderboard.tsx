import React from 'react';
import { Users, Coins, Flame } from 'lucide-react';
import { PlayerStats } from '../types';

interface LeaderboardProps {
  players: PlayerStats[];
  userAddress: string;
  userHashrate: number;
  userStockpile: number;
  userActiveTile: number | null;
}

export default function PlayerLeaderboard({
  players,
  userAddress,
  userHashrate,
  userStockpile,
  userActiveTile
}: LeaderboardProps) {
  return (
    <div className="bg-zinc-900/30 border border-zinc-900 rounded-xl p-4 flex flex-col h-[320px] backdrop-blur-sm shadow-md">
      {/* Header section */}
      <div className="flex items-center justify-between border-b border-zinc-800/50 pb-3 mb-3">
        <div className="flex items-center gap-2">
          <Users className="size-4 text-rose-400" />
          <h2 className="text-xs font-bold font-mono uppercase tracking-wider text-zinc-200">
            Active Block Solvers
          </h2>
        </div>
        <div className="flex items-center gap-1.5 text-[0.62rem] font-mono text-zinc-500 bg-zinc-950/50 px-2 py-0.5 rounded-md">
          <Flame className="size-3 text-orange-400 animate-pulse" />
          <span>{players.length + (userHashrate > 0 ? 1 : 0)} Active</span>
        </div>
      </div>

      {/* Solver List */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
        {/* User Card (pinned top when mining) */}
        {userHashrate > 0 && (
          <div className="bg-rose-500/5 border border-rose-500/20 rounded-lg p-2.5 flex items-center justify-between hover:bg-rose-500/10 transition-colors">
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-[0.68rem] font-bold font-mono text-rose-400">
                  {userAddress.substring(0, 6)}...{userAddress.substring(userAddress.length - 4)}
                </span>
                <span className="text-[0.55rem] font-mono bg-rose-500/20 text-rose-400 px-1.5 py-0.2 rounded font-bold uppercase">
                  You
                </span>
              </div>
              <span className="text-[0.58rem] font-mono text-zinc-500 mt-1">
                Target: {userActiveTile !== null ? `Tile #${userActiveTile + 1}` : 'Pending Selection'}
              </span>
            </div>

            <div className="text-right flex flex-col">
              <span className="font-mono text-xs font-bold text-zinc-200">
                {userHashrate} H/s
              </span>
              <span className="text-[0.58rem] font-mono text-zinc-500 flex items-center gap-1 justify-end mt-0.5">
                <Coins className="size-3 text-amber-500" />
                {userStockpile.toFixed(3)} ZINC
              </span>
            </div>
          </div>
        )}

        {/* Other Simulated Miners */}
        {players.map((p, idx) => (
          <div 
            key={p.address + idx}
            className="bg-zinc-950/30 border border-zinc-900/60 rounded-lg p-2.5 flex items-center justify-between hover:bg-zinc-950/50 transition-colors"
          >
            <div className="flex flex-col">
              <span className="text-[0.68rem] font-mono text-zinc-400">
                {p.address.substring(0, 6)}...{p.address.substring(p.address.length - 4)}
              </span>
              <span className="text-[0.58rem] font-mono text-zinc-500 mt-1">
                Target: {p.joinedTile !== null ? `Tile #${p.joinedTile + 1}` : 'Broadcasting Solves'}
              </span>
            </div>

            <div className="text-right flex flex-col">
              <span className="font-mono text-xs font-semibold text-zinc-400">
                {p.hashrate} H/s
              </span>
              <span className="text-[0.58rem] font-mono text-zinc-500 flex items-center gap-0.5 justify-end mt-0.5">
                <Coins className="size-2.5 text-zinc-500" />
                {p.rewardStockpile.toFixed(3)} ZINC
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
