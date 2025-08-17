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

export default function AdminPage() {
  const { account } = useEmbeddedWallet();
  const address = account?.address;
  const { challenges, players } = useAppStore();
  const [selectedWinner, setSelectedWinner] = useState<"A" | "B">("A");
  const [isResolving, setIsResolving] = useState<string | null>(null);

  const { data: ownerAddress } = useIsOwner();
  const { resolveChallenge, isResolving: isResolvingChallenge } =
    useResolveChallenge();

  const isOwner =
    address &&
    ownerAddress &&
    address.toLowerCase() === ownerAddress.toLowerCase();

  // Filter challenges that are ended but not resolved
  const endedChallenges = Array.from(challenges.values()).filter(
    (challenge) => !challenge.active && !challenge.resolved
  );

  const handleResolve = async (challengeId: bigint) => {
    if (!isOwner) {
      toast.error("Only the owner can resolve challenges");
      return;
    }

    const challenge = challenges.get(challengeId.toString());
    if (!challenge) {
      toast.error("Challenge not found");
      return;
    }

    if (challenge.active) {
      toast.error("Challenge is still active");
      return;
    }

    if (challenge.resolved) {
      toast.error("Challenge already resolved");
      return;
    }

    setIsResolving(challengeId.toString());
    try {
      const winnerToken =
        selectedWinner === "A" ? challenge.playerA : challenge.playerB;

      await resolveChallenge(challengeId, winnerToken);

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
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <p className="text-muted-foreground">
              Please connect your wallet to access admin panel
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!isOwner) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <Shield className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
            <p className="text-muted-foreground">
              Only the contract owner can access this page
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Admin Panel</h1>
          <p className="text-muted-foreground">
            Resolve ended challenges and manage the platform
          </p>
        </div>

        <div className="space-y-6">
          {/* Ended Challenges */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gavel className="h-5 w-5" />
                Ended Challenges ({endedChallenges.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {endedChallenges.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No ended challenges to resolve
                </p>
              ) : (
                <div className="space-y-4">
                  {endedChallenges.map((challenge) => {
                    const playerA = players.find(
                      (p) => p.tokenAddress === challenge.playerA
                    );
                    const playerB = players.find(
                      (p) => p.tokenAddress === challenge.playerB
                    );

                    return (
                      <div
                        key={challenge.id.toString()}
                        className="border rounded-lg p-4 space-y-4"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-medium mb-2">
                              {challenge.description}
                            </h3>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span>
                                {playerA?.name} vs {playerB?.name}
                              </span>
                              <span>
                                Total staked:{" "}
                                {formatNumber(
                                  challenge.totalStakeA + challenge.totalStakeB
                                )}
                              </span>
                            </div>
                          </div>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                              getChallengeStatus(challenge)
                            )}`}
                          >
                            {getChallengeStatus(challenge)}
                          </span>
                        </div>

                        <div className="flex items-center gap-4">
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
                                {playerA?.name} (A)
                              </SelectItem>
                              <SelectItem value="B">
                                {playerB?.name} (B)
                              </SelectItem>
                            </SelectContent>
                          </Select>

                          <Button
                            onClick={() => handleResolve(challenge.id)}
                            disabled={
                              isResolving === challenge.id.toString() ||
                              isResolvingChallenge
                            }
                            size="sm"
                          >
                            {isResolving === challenge.id.toString() ||
                            isResolvingChallenge
                              ? "Resolving..."
                              : "Resolve"}
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Contract Info */}
          <Card>
            <CardHeader>
              <CardTitle>Contract Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Contract Address:
                  </span>
                  <span className="font-mono">
                    {formatAddress(CONTRACTS.ESCROW_ADDR)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Owner:</span>
                  <span className="font-mono">
                    {ownerAddress ? formatAddress(ownerAddress) : "Loading..."}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Total Challenges:
                  </span>
                  <span>{challenges.size}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
