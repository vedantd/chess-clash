"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Send } from "lucide-react";
import { Player } from "@/lib/types";
import { useCreateChallenge, useStakeForA } from "@/lib/contracts/hooks";
import { usePrivyAddress } from "@/lib/privy-hooks";
import { parseNumber } from "@/lib/utils";
import toast from "react-hot-toast";

interface CreateChallengeFormProps {
  players: Player[];
  onSuccess: () => void;
}

export function CreateChallengeForm({
  players,
  onSuccess,
}: CreateChallengeFormProps) {
  const { address } = usePrivyAddress();
  const [description, setDescription] = useState("");
  const [playerA, setPlayerA] = useState("");
  const [playerB, setPlayerB] = useState("");
  const [stakeAmount, setStakeAmount] = useState("");
  const [duration, setDuration] = useState("3600"); // 1 hour default
  const [isCreating, setIsCreating] = useState(false);

  const { createChallenge, isCreating: isCreatingChallenge } = useCreateChallenge();
  const { stakeForA, isStaking } = useStakeForA();

  const selectedPlayerA = players.find((p) => p.tokenAddress === playerA);
  const selectedPlayerB = players.find((p) => p.tokenAddress === playerB);

  // Debug: Log available players
  console.log('Available players for challenge creation:', players);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!address || !playerA || !playerB || !description.trim() || !stakeAmount || !duration) {
      toast.error("Please fill in all fields");
      return;
    }

    if (playerA === playerB) {
      toast.error("Player A and Player B must be different");
      return;
    }

    // Debug: Log the selected players
    console.log('Creating challenge with:', {
      playerA,
      playerB,
      description,
      duration,
      selectedPlayerA,
      selectedPlayerB
    });

    setIsCreating(true);
    try {
      // Create the challenge
      const durationBigInt = BigInt(duration);
      const createResult = await createChallenge(
        playerA as `0x${string}`,
        playerB as `0x${string}`,
        description,
        durationBigInt
      );

      // Wait for the transaction to be mined and get the challenge ID
      // For now, we'll assume it's the next challenge ID
      // In a real implementation, you'd parse the event to get the actual ID
      const challengeId = 0n; // This should come from the event

      // Stake for player A
      const stakeAmountBigInt = parseNumber(stakeAmount);
      await stakeForA(challengeId, stakeAmountBigInt);

      toast.success("Challenge created and staked successfully!");
      setDescription("");
      setPlayerA("");
      setPlayerB("");
      setStakeAmount("");
      setDuration("3600");
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
              Challenge Description
            </label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g., Magnus will beat Gukesh today"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Player A (You're betting on)
              </label>
              <Select value={playerA} onValueChange={setPlayerA}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Player A" />
                </SelectTrigger>
                <SelectContent>
                  {players.map((player) => (
                    <SelectItem key={player.tokenAddress} value={player.tokenAddress}>
                      {player.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Player B (Against)
              </label>
              <Select value={playerB} onValueChange={setPlayerB}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Player B" />
                </SelectTrigger>
                <SelectContent>
                  {players.map((player) => (
                    <SelectItem key={player.tokenAddress} value={player.tokenAddress}>
                      {player.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Stake Amount ({selectedPlayerA?.symbol || "Player A"} tokens)
            </label>
            <Input
              type="number"
              value={stakeAmount}
              onChange={(e) => setStakeAmount(e.target.value)}
              placeholder="0.0"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Duration (seconds)
            </label>
            <Input
              type="number"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="3600"
              required
            />
            <p className="text-sm text-muted-foreground mt-1">
              Default: 3600 seconds (1 hour)
            </p>
          </div>

          <Button
            type="submit"
            disabled={isCreating || isCreatingChallenge || isStaking}
            className="w-full"
          >
            {isCreating || isCreatingChallenge || isStaking ? (
              "Creating Challenge..."
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Create Challenge & Stake
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
