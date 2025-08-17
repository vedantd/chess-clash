export type Player = {
  tokenAddress: `0x${string}`;
  name: string;
  symbol: string;
  initialSupply: bigint;
  faucetEnabled: boolean;
  faucetCapPerAddr: bigint;
  imageUrl?: string; // Optional image URL for player photos
};

export type Challenge = {
  id: bigint;
  playerA: `0x${string}`; // Token address for player A
  playerB: `0x${string}`; // Token address for player B
  totalStakeA: bigint;
  totalStakeB: bigint;
  startTime: bigint;
  endTime: bigint;
  resolved: boolean;
  winner?: `0x${string}`; // Winning player token address
  description: string;
  active: boolean;
};

export type ChallengeStatus = 'Active' | 'Ended' | 'Resolved';

export type UserStake = {
  amountA: bigint;
  amountB: bigint;
  hasStaked: boolean;
};

export type TokenBalance = {
  balance: bigint;
  allowance: bigint;
  symbol: string;
  name: string;
  decimals: number;
};
