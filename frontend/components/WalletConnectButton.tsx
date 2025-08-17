"use client";

import { Button } from "@/components/ui/button";
import { useEmbeddedWallet } from "./WagmiProvider";

export function WalletConnectButton() {
  const { isConnected, account, connect, disconnect } = useEmbeddedWallet();

  if (isConnected && account) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">
          {account.address.slice(0, 6)}...{account.address.slice(-4)}
        </span>
        <Button variant="outline" onClick={disconnect}>
          Disconnect
        </Button>
      </div>
    );
  }

  return <Button onClick={connect}>Connect Wallet</Button>;
}
