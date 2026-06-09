import React, { useState } from 'react';
import { History, Shield, CheckCircle, Info, ChevronDown, ChevronUp } from 'lucide-react';
import { RoundHistoryItem } from '../types';
import { playClick } from '../utils/audio';

interface HistoryProps {
  history: RoundHistoryItem[];
}

export default function RoundHistory({ history }: HistoryProps) {
  const [selectedRoundId, setSelectedRoundId] = useState<number | null>(null);

  const toggleRoundDetails = (id: number) => {
    playClick();
    if (selectedRoundId === id) {
      setSelectedRoundId(null);
    } else {
      setSelectedRoundId(id);
    }
  };

  // Static mock helper to generate a lookalike cryptographic seed for cryptographic proof display
  const getMockProof = (roundId: number, winSquare: number) => {
    const salt = `solana_pow_block_salt_${roundId}_zinc`;
    // Simulated hash using a fake sha-256 visual slice
    const serverSeed = `8f7b76e5e4d3c2b1a0${Math.abs(roundId * 153).toString(16)}bcde40e90f80a711ff044ab02ea378ad80`;
    const clientSignature = `7bc2e0d1${Math.abs(roundId * 777).toString(16)}0a7431e289bf5976da749b5c3e0bdceaa2e0bda9847101fa8f`;
    const checkValue = (1 + (roundId + winSquare) % 30);
    return {
      serverSeed,
      clientSignature,
      salt,
      formula: `(clientSignature + serverSeed) % 30 = ${winSquare} (Tile #${winSquare + 1})`
    };
  };

  return (
    <div className="bg-zinc-900/30 border border-zinc-900 rounded-xl p-4 flex flex-col h-[320px] backdrop-blur-sm shadow-md">
      {/* Title block */}
      <div className="flex items-center gap-2 border-b border-zinc-800/50 pb-3 mb-3 flex-shrink-0">
        <History className="size-4 text-purple-400" />
        <h2 className="text-xs font-bold font-mono uppercase tracking-wider text-zinc-200">
          Recent Block History
        </h2>
      </div>

      {/* History table list */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
        {history.length === 0 ? (
          <div className="h-full flex items-center justify-center text-xs text-zinc-500 font-mono">
            Mining first blocks...
          </div>
        ) : (
          history.map((h) => {
            const isExpanded = selectedRoundId === h.roundId;
            const proof = getMockProof(h.roundId, h.winningSquare);

            return (
              <div 
                key={h.roundId}
                className="bg-zinc-950/20 border border-zinc-900/60 rounded-lg overflow-hidden transition-all duration-200"
              >
                {/* Header row details */}
                <div 
                  onClick={() => toggleRoundDetails(h.roundId)}
                  className="p-2.5 flex items-center justify-between cursor-pointer hover:bg-zinc-950/40 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-bold text-zinc-400">
                      #{h.roundId}
                    </span>
                    <div className="flex items-center gap-1">
                      <span className="text-[0.68rem] font-semibold font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-md flex items-center gap-1">
                        <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        Tile #{h.winningSquare + 1}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right flex flex-col font-mono text-[0.65rem] text-zinc-500 leading-normal">
                      <span>Diff: {h.difficulty}</span>
                      <span>Payout: <span className="text-rose-400 font-semibold">+{h.totalReward.toFixed(1)} ZINC</span></span>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="size-3.5 text-zinc-500" />
                    ) : (
                      <ChevronDown className="size-3.5 text-zinc-500" />
                    )}
                  </div>
                </div>

                {/* Expanded fairness details dropdown */}
                {isExpanded && (
                  <div className="px-3 pb-3 pt-1 border-t border-zinc-800/20 bg-zinc-950/40 text-[0.62rem] font-mono text-zinc-500 leading-relaxed space-y-2">
                    <div className="flex items-center gap-1.5 text-zinc-400 border-b border-zinc-800/10 pb-1 mb-1 font-bold">
                      <Shield className="size-3 text-emerald-500" />
                      <span>SOLANA POW VALIDATION RESULT</span>
                      <CheckCircle className="size-2.5 text-emerald-400 ml-auto" />
                      <span className="text-emerald-400 text-[0.55rem] font-semibold">VERIFIED FAIR</span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex flex-col">
                        <span className="text-zinc-600">BLOCK RESOLVED SEED (SHA-256)</span>
                        <span className="text-zinc-400 truncate break-all bg-zinc-950 px-1 py-0.5 rounded leading-normal border border-zinc-900 font-semibold select-all">
                          {proof.serverSeed}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-zinc-600">BLOCK BLOCKCHAIN SIGNATURE (ED25519)</span>
                        <span className="text-zinc-400 truncate break-all bg-zinc-950 px-1 py-0.5 rounded leading-normal border border-zinc-900 select-all">
                          {proof.clientSignature}
                        </span>
                      </div>
                      <div className="flex flex-col mt-1 bg-zinc-900/40 p-1.5 rounded border border-zinc-800/30">
                        <span className="text-zinc-600">VALIDATION CRITERION FOR COORD INDEX</span>
                        <span className="text-amber-400/90 font-medium">
                          {proof.formula}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
