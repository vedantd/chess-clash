"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import {
  createWalletClient,
  custom,
  type WalletClient,
  type Account,
} from "viem";
import { baseSepolia } from "viem/chains";

// Embedded wallet context
interface EmbeddedWalletContextType {
  isConnected: boolean;
  account: Account | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  walletClient: WalletClient | null;
}

const EmbeddedWalletContext = createContext<EmbeddedWalletContextType | null>(
  null
);

export function useEmbeddedWallet() {
  const context = useContext(EmbeddedWalletContext);
  if (!context) {
    throw new Error(
      "useEmbeddedWallet must be used within EmbeddedWalletProvider"
    );
  }
  return context;
}

interface EmbeddedWalletProviderProps {
  children: ReactNode;
}

export function WagmiProvider({ children }: EmbeddedWalletProviderProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [account, setAccount] = useState<Account | null>(null);
  const [walletClient, setWalletClient] = useState<WalletClient | null>(null);

  const connect = async () => {
    try {
      // For demo purposes, create a mock wallet
      // In a real implementation, this would integrate with CDP or another embedded wallet service
      const mockAccount: Account = {
        address: "0x742d35Cc6634C0532925a3b844Bc9e7595f7E123" as `0x${string}`,
        type: "json-rpc",
      };

      const client = createWalletClient({
        chain: baseSepolia,
        transport: custom({
          async request({ method, params }) {
            // Mock wallet implementation
            console.log("Mock wallet request:", method, params);
            return { result: "mock-response" };
          },
        }),
      });

      setAccount(mockAccount);
      setWalletClient(client);
      setIsConnected(true);
    } catch (error) {
      console.error("Failed to connect wallet:", error);
    }
  };

  const disconnect = () => {
    setAccount(null);
    setWalletClient(null);
    setIsConnected(false);
  };

  return (
    <EmbeddedWalletContext.Provider
      value={{
        isConnected,
        account,
        connect,
        disconnect,
        walletClient,
      }}
    >
      {children}
    </EmbeddedWalletContext.Provider>
  );
}
