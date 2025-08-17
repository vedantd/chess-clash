"use client";

import { useEffect, useState } from "react";
import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useResolveChallenge, useIsOwner } from "@/lib/contracts/hooks";
import { useEmbeddedWallet } from "@/components/WagmiProvider";
import { CONTRACTS } from "@/lib/contracts/addresses";
import { useAppStore } from "@/lib/store";
import { Challenge, Player } from "@/lib/types";
import { formatNumber, getChallengeStatus, getStatusColor } from "@/lib/utils";
import { Gavel, Shield } from "lucide-react";
import toast from "react-hot-toast";

import ChallengeEscrowABI from "@/lib/contracts/abis/ChallengeEscrow.json";

export default function AdminPage() {
  const { account } = useEmbeddedWallet();
  const address = account?.address;
  const { challenges, players } = useAppStore();
  const [selectedWinner, setSelectedWinner] = useState<"A" | "B">("A");
  const [isResolving, setIsResolving] = useState<string | null>(null);

  const { data: ownerAddress } = useIsOwner();
  const { resolveChallenge } = useResolveChallenge();

  const isOwner =
    address &&
    ownerAddress &&
    address.toLowerCase() === ownerAddress.toLowerCase();

  const openChallenges = Array.from(challenges.values()).filter(
    (challenge) => !challenge.settled && challenge.tokenB
  );

  const handleResolve = async (challengeId: bigint) => {
    if (!isOwner) {
      toast.error("Only the owner can resolve challenges");
      return;
    }

    const challenge = challenges.get(challengeId.toString());
    if (!challenge || !challenge.tokenB) {
      toast.error("Challenge not found or counter not set");
      return;
    }

    setIsResolving(challengeId.toString());
    try {
      const winnerToken =
        selectedWinner === "A" ? challenge.tokenA : challenge.tokenB;

      await resolveChallenge(challengeId, winnerToken, 0n, 0n); // minOut params set to 0 for demo

      toast.success(`Challenge resolved! Winner: ${selectedWinner}`);
    } catch (error) {
      console.error("Resolve error:", error);
      toast.error("Failed to resolve challenge");
    } finally {
      setIsResolving(null);
    }
  };

  if (!address) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center">
            <p className="text-muted-foreground">
              Please connect your wallet to access admin panel
            </p>
          </div>
        </main>
      </div>
    );
  }

  if (!isOwner) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center">
            <Shield className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
            <p className="text-muted-foreground">
              Only the contract owner can access this page
            </p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Gavel className="h-8 w-8" />
            Admin Panel
          </h1>
          <p className="text-muted-foreground mt-2">
            Resolve challenges and manage the platform
          </p>
        </div>

        {openChallenges.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">
                No challenges ready for resolution
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {openChallenges.map((challenge) => {
              const tokenA = players.find(
                (p) => p.tokenAddress === challenge.tokenA
              );
              const tokenB = players.find(
                (p) => p.tokenAddress === challenge.tokenB
              );
              const status = getChallengeStatus(challenge);

              return (
                <Card key={challenge.id.toString()}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>Challenge #{challenge.id.toString()}</span>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          status
                        )}`}
                      >
                        {status}
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-lg font-medium mb-2">
                        {challenge.text}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Author: {challenge.author}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <div className="font-medium text-blue-900">
                          Side A: {tokenA?.symbol}
                        </div>
                        <div className="text-sm text-blue-700">
                          {formatNumber(challenge.stakeA)} staked
                        </div>
                      </div>
                      <div className="p-3 bg-red-50 rounded-lg">
                        <div className="font-medium text-red-900">
                          Side B: {tokenB?.symbol}
                        </div>
                        <div className="text-sm text-red-700">
                          {formatNumber(challenge.stakeB)} staked
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">
                          Select Winner:
                        </span>
                        <Select
                          value={selectedWinner}
                          onValueChange={(value: "A" | "B") =>
                            setSelectedWinner(value)
                          }
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="A">
                              Side A ({tokenA?.symbol})
                            </SelectItem>
                            <SelectItem value="B">
                              Side B ({tokenB?.symbol})
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <Button
                        onClick={() => handleResolve(challenge.id)}
                        disabled={isResolving === challenge.id.toString()}
                        className="flex items-center gap-2"
                      >
                        <Gavel className="h-4 w-4" />
                        {isResolving === challenge.id.toString()
                          ? "Resolving..."
                          : "Resolve Challenge"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
