export enum RoundPhase {
  IDLE = 'idle',
  ACTIVE = 'active',
  CLOSING = 'closing',
  SPIN_GLOW = 'spin_glow',
  WINNER_REVEALED = 'winner_revealed',
  SHOWING_WINNERS = 'showing_winners'
}

export interface TileAngle {
  id: number;
  startDegrees: number;
  endDegrees: number;
  middleDegrees: number;
  labelX: number;
  labelY: number;
  path: string;
}

export interface RoundInfo {
  id: number;
  phase: RoundPhase;
  winningSquare: number | null;
  totalOnWinningTile: number;
  numberOfPlayers: number;
  settledMinerCount: number;
  luckyHash: string;
}

export interface ChatMessage {
  id: string;
  sender: string;
  avatarSeed: string; // seed for cute visual avatar
  text: string;
  timestamp: string;
  isSystem?: boolean;
}

export interface PlayerStats {
  address: string;
  hashrate: number;
  rewardStockpile: number;
  joinedTile: number | null;
  isClaimable: boolean;
}

export interface RoundHistoryItem {
  roundId: number;
  winningSquare: number;
  difficulty: string;
  totalReward: number;
}
