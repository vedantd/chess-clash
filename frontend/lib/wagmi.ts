import { createPublicClient, http, createWalletClient, custom, type PublicClient, type WalletClient } from 'viem';
import { baseSepolia } from 'viem/chains';

// Create a public client for reading blockchain data
export const publicClient: PublicClient = createPublicClient({
  chain: baseSepolia,
  transport: http(),
});

// Simple embedded wallet configuration
export const EMBEDDED_WALLET_CONFIG = {
  name: "Chess Clash",
  logoUrl: "https://picsum.photos/64",
  chainId: 84532, // Base Sepolia
  rpcUrl: "https://sepolia.base.org",
};

// Theme configuration
export const THEME_CONFIG = {
  "colors-bg-default": "#ffffff",
  "colors-bg-overlay": "rgba(0, 0, 0, 0.8)",
  "colors-bg-skeleton": "rgba(0, 0, 0, 0.05)",
  "colors-bg-primary": "#0052ff",
  "colors-bg-secondary": "#f5f5f5",
  "colors-fg-default": "#000000",
  "colors-fg-muted": "#666666",
  "colors-fg-primary": "#0052ff",
  "colors-fg-onPrimary": "#ffffff",
  "colors-fg-onSecondary": "#000000",
  "colors-line-default": "#e0e0e0",
  "colors-line-heavy": "#333333",
  "colors-line-primary": "#0052ff",
  "font-family-sans": "Inter, system-ui, sans-serif",
  "font-size-base": "16px",
};
