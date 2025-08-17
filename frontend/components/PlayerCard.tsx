"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  useTokenBalance,
  useTokenAllowance,
  useFaucetMint,
  useApproveToken,
} from "@/lib/contracts/hooks";
import { useEmbeddedWallet } from "./WagmiProvider";
import { CONTRACTS } from "@/lib/contracts/addresses";
import { Player } from "@/lib/types";
import {
  formatNumber,
  formatAddress,
  parseNumber,
  getPlayerImage,
} from "@/lib/utils";
import { Copy, Zap, Check } from "lucide-react";
import toast from "react-hot-toast";

import PlayerTokenABI from "@/lib/contracts/abis/PlayerToken.json";

interface PlayerCardProps {
  player: Player;
}

export function PlayerCard({ player }: PlayerCardProps) {
  const { account } = useEmbeddedWallet();
  const address = account?.address;
  const [faucetAmount, setFaucetAmount] = useState("1000");
  const [isApproving, setIsApproving] = useState(false);
  const [isFauceting, setIsFauceting] = useState(false);
  const [copied, setCopied] = useState(false);

  const { data: balance } = useTokenBalance(player.tokenAddress, address);
  const { data: allowance } = useTokenAllowance(
    player.tokenAddress,
    CONTRACTS.ESCROW_ADDR,
    address
  );

  const { mint: faucetMint } = useFaucetMint();
  const { approve: approveToken } = useApproveToken();

  const handleFaucet = async () => {
    if (!address || !player.faucetEnabled) return;

    setIsFauceting(true);
    try {
      const amount = parseNumber(faucetAmount);
      await faucetMint(player.tokenAddress, amount);
      toast.success(`Minted ${faucetAmount} ${player.symbol}`);
    } catch (error) {
      console.error("Faucet error:", error);
      toast.error("Failed to mint tokens");
    } finally {
      setIsFauceting(false);
    }
  };

  const handleApprove = async () => {
    if (!address) return;

    setIsApproving(true);
    try {
      const maxAmount = BigInt(2) ** BigInt(256) - BigInt(1); // Max uint256
      await approveToken(player.tokenAddress, CONTRACTS.ESCROW_ADDR, maxAmount);
      toast.success(`Approved ${player.symbol} for staking`);
    } catch (error) {
      console.error("Approve error:", error);
      toast.error("Failed to approve tokens");
    } finally {
      setIsApproving(false);
    }
  };

  const copyAddress = () => {
    navigator.clipboard.writeText(player.tokenAddress);
    setCopied(true);
    toast.success("Address copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const needsApproval = allowance === 0n || allowance < (balance || 0n);

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center border-2 border-gray-200">
              <img
                src={getPlayerImage(player.name)}
                alt={player.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  // Fallback to placeholder if image fails to load
                  e.currentTarget.src = "/images/players/placeholder.jpg";
                }}
                onLoad={(e) => {
                  // Add a subtle animation when image loads
                  e.currentTarget.style.opacity = "1";
                }}
                style={{ opacity: 0, transition: "opacity 0.3s ease-in-out" }}
              />
            </div>
            <div>
              <div className="text-lg font-bold">{player.name}</div>
              <div className="text-sm text-muted-foreground">
                {player.symbol}
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={copyAddress}
            className="flex items-center gap-1"
          >
            {copied ? (
              <Check className="h-4 w-4" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm">
          <div className="flex justify-between">
            <span>Your Balance:</span>
            <span className="font-mono">
              {formatNumber(balance || 0n)} {player.symbol}
            </span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>Address:</span>
            <span className="font-mono text-xs">
              {formatAddress(player.tokenAddress)}
            </span>
          </div>
        </div>

        {player.faucetEnabled && (
          <div className="space-y-2">
            <div className="flex gap-2">
              <Input
                type="number"
                value={faucetAmount}
                onChange={(e) => setFaucetAmount(e.target.value)}
                placeholder="Amount to mint"
                className="flex-1"
              />
              <Button
                onClick={handleFaucet}
                disabled={isFauceting}
                className="flex items-center gap-2"
              >
                <Zap className="h-4 w-4" />
                {isFauceting ? "Minting..." : "Faucet"}
              </Button>
            </div>
            <div className="text-xs text-muted-foreground">
              Cap per address: {formatNumber(player.faucetCapPerAddr)}
            </div>
          </div>
        )}

        {needsApproval && (
          <Button
            onClick={handleApprove}
            disabled={isApproving}
            variant="outline"
            className="w-full"
          >
            {isApproving
              ? "Approving..."
              : `Approve ${player.symbol} for Staking`}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
