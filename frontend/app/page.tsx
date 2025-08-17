"use client";

import { useEffect, useState } from "react";
import { Navigation } from "@/components/Navigation";
import { ChallengeCard } from "@/components/ChallengeCard";
import { CreateChallengeForm } from "@/components/CreateChallengeForm";
import { useGetAllPlayers } from "@/lib/contracts/hooks";
import { useAppStore } from "@/lib/store";
import { Player, Challenge } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

export default function HomePage() {
  const {
    players,
    challenges,
    setPlayers,
    setChallenges,
    isLoadingPlayers,
    isLoadingChallenges,
  } = useAppStore();
  const { data: playersData, isLoading: isLoadingPlayersData } =
    useGetAllPlayers();
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Load players data
  useEffect(() => {
    if (playersData && !isLoadingPlayersData) {
      const formattedPlayers: Player[] = playersData.map((player: any) => ({
        tokenAddress: player.tokenAddress,
        name: player.name,
        symbol: player.symbol,
        initialSupply: player.totalSupply,
        faucetEnabled: player.faucetEnabled,
        faucetCapPerAddr: player.faucetCapPerAddr,
      }));
      setPlayers(formattedPlayers);
    }
  }, [playersData, isLoadingPlayersData, setPlayers]);

  // Mock challenges data for now (will be replaced with real event data)
  useEffect(() => {
    const mockChallenges: Challenge[] = [
      {
        id: 1n,
        author: "0x1234567890123456789012345678901234567890" as `0x${string}`,
        text: "Magnus Carlsen will win the next World Chess Championship",
        tokenA: "0x1234567890123456789012345678901234567890" as `0x${string}`,
        stakeA: 1000n * 10n ** 18n,
        stakeB: 500n * 10n ** 18n,
        settled: false,
        createdAt: Date.now() - 3600000, // 1 hour ago
      },
      {
        id: 2n,
        author: "0x0987654321098765432109876543210987654321" as `0x${string}`,
        text: "Hikaru Nakamura will reach 3000+ rating this year",
        tokenA: "0x0987654321098765432109876543210987654321" as `0x${string}`,
        tokenB: "0x1234567890123456789012345678901234567890" as `0x${string}`,
        stakeA: 2000n * 10n ** 18n,
        stakeB: 1500n * 10n ** 18n,
        settled: true,
        winnerToken:
          "0x1234567890123456789012345678901234567890" as `0x${string}`,
        createdAt: Date.now() - 7200000, // 2 hours ago
      },
    ];
    setChallenges(mockChallenges);
  }, [setChallenges]);

  const handleStakeForA = (challengeId: bigint) => {
    // TODO: Implement stake for A functionality
    console.log("Stake for A:", challengeId);
  };

  const handleStakeForB = (challengeId: bigint) => {
    // TODO: Implement stake for B functionality
    console.log("Stake for B:", challengeId);
  };

  const handleClaim = (challengeId: bigint) => {
    // TODO: Implement claim functionality
    console.log("Claim:", challengeId);
  };

  const challengesArray = Array.from(challenges.values()).sort((a, b) =>
    Number(b.createdAt - a.createdAt)
  );

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Challenge Feed</h1>
            <p className="text-muted-foreground mt-2">
              Create and participate in token-backed challenges
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => window.location.reload()}
              disabled={isLoadingPlayers || isLoadingChallenges}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>

            <Button onClick={() => setShowCreateForm(!showCreateForm)}>
              {showCreateForm ? "Cancel" : "Create Challenge"}
            </Button>
          </div>
        </div>

        {showCreateForm && (
          <div className="mb-8">
            <CreateChallengeForm
              players={players}
              onSuccess={() => setShowCreateForm(false)}
            />
          </div>
        )}

        {isLoadingChallenges ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Loading challenges...</p>
          </div>
        ) : challengesArray.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              No challenges yet. Create the first one!
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {challengesArray.map((challenge) => (
              <ChallengeCard
                key={challenge.id.toString()}
                challenge={challenge}
                players={players}
                onStakeForA={() => handleStakeForA(challenge.id)}
                onStakeForB={() => handleStakeForB(challenge.id)}
                onClaim={() => handleClaim(challenge.id)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
