"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Player } from "@/lib/types";
import {
  useTokenBalance,
  useTokenAllowance,
  useFaucetMint,
  useApproveToken,
} from "@/lib/contracts/hooks";
import { usePrivyAddress } from "@/lib/privy-hooks";
import { CONTRACTS } from "@/lib/contracts/addresses";
import { formatNumber, parseNumber, getPlayerImage } from "@/lib/utils";
import { Coins, Zap, Check } from "lucide-react";
import toast from "react-hot-toast";

interface PlayerCardProps {
  player: Player;
}

export function PlayerCard({ player }: PlayerCardProps) {
  const { address } = usePrivyAddress();
  const [faucetAmount, setFaucetAmount] = useState("100");
  const [approveAmount, setApproveAmount] = useState("1000");
  const [isFauceting, setIsFauceting] = useState(false);
  const [isApproving, setIsApproving] = useState(false);

  const { data: balance } = useTokenBalance(player.tokenAddress, address);
  const { data: allowance } = useTokenAllowance(
    player.tokenAddress,
    CONTRACTS.ESCROW_ADDR,
    address
  );

  const { mint } = useFaucetMint();
  const { approve } = useApproveToken();

  const handleFaucet = async () => {
    if (!address || !faucetAmount) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsFauceting(true);
    try {
      const amount = parseNumber(faucetAmount);
      await mint(player.tokenAddress, amount);
      toast.success(
        `Successfully minted ${faucetAmount} ${player.symbol} tokens!`
      );
      setFaucetAmount("100");
    } catch (error) {
      console.error("Faucet error:", error);
      toast.error("Failed to mint tokens");
    } finally {
      setIsFauceting(false);
    }
  };

  const handleApprove = async () => {
    if (!address || !approveAmount) {
      toast.error("Please fill in all fields");
      return;
    }
    setIsApproving(true);
    try {
      const amount = parseNumber(approveAmount);
      await approve(player.tokenAddress, CONTRACTS.ESCROW_ADDR, amount);
      toast.success(
        `Successfully approved ${approveAmount} ${player.symbol} tokens for staking!`
      );
      setApproveAmount("1000"); // Reset amount
    } catch (error) {
      console.error("Approve error:", error);
      toast.error(
        "Failed to approve tokens. Make sure you have enough tokens."
      );
    } finally {
      setIsApproving(false);
    }
  };

  const playerImage = getPlayerImage(player.name);

  return (
    <Card className="w-full hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl">
            {playerImage}
          </div>
          <div className="flex-1">
            <CardTitle className="text-xl">{player.name}</CardTitle>
            <p className="text-sm text-muted-foreground">
              {player.symbol} • {formatNumber(player.initialSupply)} total
              supply
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Balance Display */}
        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-2">
            <Coins className="h-4 w-4 text-green-600" />
            <span className="font-medium">Your Balance</span>
          </div>
          <span className="font-bold">
            {balance ? formatNumber(balance as bigint) : "0"} {player.symbol}
          </span>
        </div>

        {/* Allowance Display */}
        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-blue-600" />
            <span className="font-medium">Escrow Allowance</span>
          </div>
          <span className="font-bold">
            {allowance ? formatNumber(allowance as bigint) : "0"}{" "}
            {player.symbol}
          </span>
        </div>

        {/* Faucet Section */}
        {player.faucetEnabled && (
          <div className="space-y-2">
            <label className="block text-sm font-medium">
              Faucet Amount ({player.symbol})
            </label>
            <div className="flex gap-2">
              <Input
                type="number"
                value={faucetAmount}
                onChange={(e) => setFaucetAmount(e.target.value)}
                placeholder="100"
                className="flex-1"
              />
              <Button
                onClick={handleFaucet}
                disabled={isFauceting || !address}
                size="sm"
                className="flex items-center gap-2"
              >
                {isFauceting ? (
                  "Minting..."
                ) : (
                  <>
                    <Zap className="h-4 w-4" />
                    Mint
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Approve Section */}
        <div className="space-y-2">
          <label className="block text-sm font-medium">
            Approve Amount ({player.symbol})
          </label>
          <div className="flex gap-2">
            <Input
              type="number"
              value={approveAmount}
              onChange={(e) => setApproveAmount(e.target.value)}
              placeholder="1000"
              className="flex-1"
            />
            <Button
              onClick={handleApprove}
              disabled={isApproving || !address}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              {isApproving ? (
                "Approving..."
              ) : (
                <>
                  <Check className="h-4 w-4" />
                  Approve
                </>
              )}
            </Button>
          </div>
        </div>

        {!address && (
          <p className="text-center text-sm text-muted-foreground">
            Connect your wallet to interact with this token
          </p>
        )}
      </CardContent>
    </Card>
  );
}
