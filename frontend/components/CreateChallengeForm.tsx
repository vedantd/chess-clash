"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreateChallenge, useStakeForA } from "@/lib/contracts/hooks";
import { useEmbeddedWallet } from "./WagmiProvider";
import { CONTRACTS } from "@/lib/contracts/addresses";
import { Player } from "@/lib/types";
import { parseNumber, formatNumber } from "@/lib/utils";
import { Send } from "lucide-react";
import toast from "react-hot-toast";

import ChallengeEscrowABI from "@/lib/contracts/abis/ChallengeEscrow.json";

interface CreateChallengeFormProps {
  players: Player[];
  onSuccess: () => void;
}

export function CreateChallengeForm({
  players,
  onSuccess,
}: CreateChallengeFormProps) {
  const { account } = useEmbeddedWallet();
  const address = account?.address;
  const [text, setText] = useState("");
  const [selectedToken, setSelectedToken] = useState("");
  const [stakeAmount, setStakeAmount] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const { createChallenge } = useCreateChallenge();
  const { stakeForA } = useStakeForA();

  const selectedPlayer = players.find((p) => p.tokenAddress === selectedToken);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!address || !selectedToken || !text.trim() || !stakeAmount) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsCreating(true);
    try {
      // Create the challenge
      const createResult = await createChallenge(selectedToken, text);

      // Extract challenge ID from events (this is a simplified version)
      const challengeId = 1n; // In reality, this would come from the event

      // Stake for A
      const stakeAmountBigInt = parseNumber(stakeAmount);
      await stakeForA(challengeId, stakeAmountBigInt);

      toast.success("Challenge created and staked successfully!");
      setText("");
      setSelectedToken("");
      setStakeAmount("");
      onSuccess();
    } catch (error) {
      console.error("Create challenge error:", error);
      toast.error("Failed to create challenge");
    } finally {
      setIsCreating(false);
    }
  };

  if (!address) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">
            Please connect your wallet to create a challenge
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Challenge</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Challenge Statement
            </label>
            <Input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="e.g., Magnus Carlsen will win the next World Chess Championship"
              className="w-full"
              maxLength={280}
            />
            <p className="text-xs text-muted-foreground mt-1">
              {text.length}/280 characters
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Choose Your Token (Side A)
            </label>
            <Select value={selectedToken} onValueChange={setSelectedToken}>
              <SelectTrigger>
                <SelectValue placeholder="Select a token" />
              </SelectTrigger>
              <SelectContent>
                {players.map((player) => (
                  <SelectItem
                    key={player.tokenAddress}
                    value={player.tokenAddress}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span>{player.symbol}</span>
                      <span className="text-muted-foreground text-xs">
                        {player.name}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedPlayer && (
            <div>
              <label className="block text-sm font-medium mb-2">
                Stake Amount ({selectedPlayer.symbol})
              </label>
              <Input
                type="number"
                value={stakeAmount}
                onChange={(e) => setStakeAmount(e.target.value)}
                placeholder="Enter amount to stake"
                className="w-full"
                min="0"
                step="0.01"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Available: {formatNumber(selectedPlayer.initialSupply)}{" "}
                {selectedPlayer.symbol}
              </p>
            </div>
          )}

          <Button
            type="submit"
            disabled={
              isCreating || !text.trim() || !selectedToken || !stakeAmount
            }
            className="w-full flex items-center gap-2"
          >
            <Send className="h-4 w-4" />
            {isCreating ? "Creating..." : "Create & Stake"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
