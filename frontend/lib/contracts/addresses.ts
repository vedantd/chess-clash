export const CONTRACTS = {
  FACTORY_ADDR: process.env.NEXT_PUBLIC_FACTORY_ADDR as `0x${string}`,
  ESCROW_ADDR: process.env.NEXT_PUBLIC_ESCROW_ADDR as `0x${string}`,
  USDC_ADDR: process.env.NEXT_PUBLIC_USDC_ADDR as `0x${string}`,
  SWAP_ADAPTER_ADDR: process.env.NEXT_PUBLIC_SWAP_ADAPTER_ADDR as `0x${string}`,
} as const;

export const CHAIN_ID = Number(process.env.NEXT_PUBLIC_CHAIN_ID) || 84532; // Base Sepolia default

export const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL || 'https://sepolia.base.org';
