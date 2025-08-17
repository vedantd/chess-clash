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
  author: `0x${string}`;
  text: string;
  tokenA: `0x${string}`;
  tokenB?: `0x${string}`; // undefined until first counter
  stakeA: bigint;
  stakeB: bigint;
  settled: boolean;
  winnerToken?: `0x${string}`;
  createdAt: number; // from block timestamp (frontend adds)
};

export type ChallengeStatus = 'Open' | 'Set counter' | 'Settled';

export type UserStake = {
  stakeA: bigint;
  stakeB: bigint;
};

export type TokenBalance = {
  balance: bigint;
  allowance: bigint;
  symbol: string;
  name: string;
  decimals: number;
};
