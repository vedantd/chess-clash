import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { ChallengeStatus } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatAddress(address: string): string {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function formatNumber(value: bigint | number, decimals: number = 18): string {
  const num = typeof value === 'bigint' ? Number(value) / Math.pow(10, decimals) : value;
  return num.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 4,
  });
}

export function parseNumber(value: string, decimals: number = 18): bigint {
  const num = parseFloat(value);
  if (isNaN(num)) return 0n;
  return BigInt(Math.floor(num * Math.pow(10, decimals)));
}

export function getChallengeStatus(challenge: any): ChallengeStatus {
  if (challenge.resolved) return 'Resolved';
  if (!challenge.active) return 'Ended';
  return 'Active';
}

export function getStatusColor(status: ChallengeStatus): string {
  switch (status) {
    case 'Active':
      return 'bg-green-100 text-green-800';
    case 'Ended':
      return 'bg-yellow-100 text-yellow-800';
    case 'Resolved':
      return 'bg-blue-100 text-blue-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

export function getTimeAgo(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return `${seconds}s ago`;
}

// Player image mapping utility
export const getPlayerImage = (playerName: string): string => {
  const playerImages: { [key: string]: string } = {
    "Magnus Carlsen": "/images/players/1.jpg",
    "Gukesh D": "/images/players/2.jpg", 
    "Hikaru Nakamura": "/images/players/3.jpg",
    "Ding Liren": "/images/players/4.jpg",
    "Fabiano Caruana": "/images/players/5.jpg",
    "R Praggnanandhaa": "/images/players/6.jpg",
    "Alireza Firouzja": "/images/players/7.jpg",
    "Ian Nepomniachtchi": "/images/players/8.jpg",
  };
  
  return playerImages[playerName] || "/images/players/placeholder.jpg";
};
