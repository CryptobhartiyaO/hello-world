import React from 'react';
import { DollarSign, Pickaxe, Cpu, Layers } from 'lucide-react';

interface StatsProps {
  solPrice: number;
  zincPrice: number;
  globalHashrate: number | string;
  difficulty: string;
  blocksMined: number;
}

export default function StatsGrid({
  solPrice,
  zincPrice,
  globalHashrate,
  difficulty,
  blocksMined
}: StatsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 w-full">
      {/* SOL Price Card */}
      <div className="bg-zinc-900/35 border border-zinc-900 rounded-xl p-3 md:p-4 flex flex-col justify-between backdrop-blur-sm shadow-md hover:border-zinc-800 transition-colors">
        <div className="flex items-center justify-between gap-2 text-zinc-500 font-mono text-[0.62rem] uppercase tracking-wider">
          <span>Solana Price (SOL)</span>
          <DollarSign className="size-3.5 text-purple-400" />
        </div>
        <div className="mt-2 flex items-baseline gap-1.5">
          <span className="text-sm md:text-base font-bold font-mono text-zinc-100">
            ${solPrice.toFixed(2)}
          </span>
          <span className="text-[0.65rem] text-emerald-400 font-mono font-medium">
            +3.4%
          </span>
        </div>
      </div>

      {/* ZINC Price Card */}
      <div className="bg-zinc-900/35 border border-zinc-900 rounded-xl p-3 md:p-4 flex flex-col justify-between backdrop-blur-sm shadow-md hover:border-zinc-800 transition-colors">
        <div className="flex items-center justify-between gap-2 text-zinc-500 font-mono text-[0.62rem] uppercase tracking-wider">
          <span>ZINC Token Price</span>
          <div className="size-3.5 rounded-full bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-[0.5rem] font-bold text-orange-400 font-mono">
            Z
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-1.5">
          <span className="text-sm md:text-base font-bold font-mono text-zinc-100">
            ${zincPrice.toFixed(4)}
          </span>
          <span className="text-[0.65rem] text-amber-400 font-mono font-medium">
            +18.7%
          </span>
        </div>
      </div>

      {/* Global Network Hashrate */}
      <div className="bg-zinc-900/35 border border-zinc-900 rounded-xl p-3 md:p-4 flex flex-col justify-between backdrop-blur-sm shadow-md hover:border-zinc-800 transition-colors">
        <div className="flex items-center justify-between gap-2 text-zinc-500 font-mono text-[0.62rem] uppercase tracking-wider">
          <span>Network Hashrate</span>
          <Cpu className="size-3.5 text-zinc-400 animate-pulse" />
        </div>
        <div className="mt-2">
          <span className="text-sm md:text-base font-bold font-mono text-zinc-100">
            {globalHashrate}
          </span>
        </div>
      </div>

      {/* Blocks Mined */}
      <div className="bg-zinc-900/35 border border-zinc-900 rounded-xl p-3 md:p-4 flex flex-col justify-between backdrop-blur-sm shadow-md hover:border-zinc-800 transition-colors">
        <div className="flex items-center justify-between gap-2 text-zinc-500 font-mono text-[0.62rem] uppercase tracking-wider">
          <span>Active PoW Blocks</span>
          <Layers className="size-3.5 text-rose-400" />
        </div>
        <div className="mt-2 flex items-baseline gap-1.5 justify-between">
          <span className="text-sm md:text-base font-bold font-mono text-rose-400">
            #{blocksMined.toLocaleString()}
          </span>
          <span className="text-[0.6rem] font-mono text-zinc-500">
            Diff: {difficulty}
          </span>
        </div>
      </div>
    </div>
  );
}
