"use client";

import { useEffect, useState } from "react";
import { Navigation } from "@/components/Navigation";
import { ChallengeCard } from "@/components/ChallengeCard";
import { CreateChallengeForm } from "@/components/CreateChallengeForm";
import { useGetAllPlayers, useTotalChallenges } from "@/lib/contracts/hooks";
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
  const { data: totalChallenges, refetch: refetchChallenges } = useTotalChallenges();
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Load players data
  useEffect(() => {
    if (playersData && !isLoadingPlayersData && Array.isArray(playersData)) {
      const formattedPlayers: Player[] = playersData.map((player: any) => ({
        tokenAddress: player.tokenAddress,
        name: player.name,
        symbol: player.symbol,
        initialSupply: player.totalSupply,
        faucetEnabled: player.faucetEnabled,
        faucetCapPerAddr: player.faucetCapPerAddr,
      }));
      setPlayers(formattedPlayers);
      console.log("Loaded real players from testnet:", formattedPlayers);
    } else if (!isLoadingPlayersData && players.length === 0) {
      // Only use fallback players if we're not loading and have no real data
      console.log("No real players found, using fallback data for demo");
      const fallbackPlayers: Player[] = [
        {
          tokenAddress: "0x1234567890123456789012345678901234567890" as `0x${string}`,
          name: "Magnus Carlsen",
          symbol: "MAGNUS",
          initialSupply: 1000000n * 10n ** 18n,
          faucetEnabled: true,
          faucetCapPerAddr: 1000n * 10n ** 18n,
        },
        {
          tokenAddress: "0x0987654321098765432109876543210987654321" as `0x${string}`,
          name: "Gukesh D",
          symbol: "GUKE",
          initialSupply: 1000000n * 10n ** 18n,
          faucetEnabled: true,
          faucetCapPerAddr: 1000n * 10n ** 18n,
        },
        {
          tokenAddress: "0x1111111111111111111111111111111111111111" as `0x${string}`,
          name: "Hikaru Nakamura",
          symbol: "HIKARU",
          initialSupply: 1000000n * 10n ** 18n,
          faucetEnabled: true,
          faucetCapPerAddr: 1000n * 10n ** 18n,
        },
        {
          tokenAddress: "0x2222222222222222222222222222222222222222" as `0x${string}`,
          name: "Ding Liren",
          symbol: "DING",
          initialSupply: 1000000n * 10n ** 18n,
          faucetEnabled: true,
          faucetCapPerAddr: 1000n * 10n ** 18n,
        },
      ];
      setPlayers(fallbackPlayers);
    }
  }, [playersData, isLoadingPlayersData, setPlayers, players.length]);

  // Load challenges data from contract + mock data for demo
  useEffect(() => {
    const loadChallenges = async () => {
      // Check if we have real challenges from contract
      if (totalChallenges && typeof totalChallenges === "bigint" && totalChallenges > 0n) {
        console.log(`Found ${totalChallenges} real challenges on testnet`);
        
        // TODO: Load real challenges from contract
        // For now, we'll show empty state to encourage creating real challenges
        setChallenges([]);
        return;
      }

      // Only show mock challenges if no real challenges exist
      console.log("No real challenges found, showing mock data for demo");
      const mockChallenges: Challenge[] = [
        {
          id: 1n,
          playerA: "0x1234567890123456789012345678901234567890" as `0x${string}`,
          playerB: "0x0987654321098765432109876543210987654321" as `0x${string}`,
          totalStakeA: 8500n * 10n ** 18n, // 8500 MAGNUS tokens
          totalStakeB: 6200n * 10n ** 18n, // 6200 GUKE tokens
          startTime: BigInt(Math.floor(Date.now() / 1000) - 3600), // 1 hour ago
          endTime: BigInt(Math.floor(Date.now() / 1000) + 7200), // 2 hours from now
          resolved: false,
          winner: undefined,
          description: "Magnus Carlsen will win the 2024 World Chess Championship",
          active: true,
        },
        {
          id: 2n,
          playerA: "0x1111111111111111111111111111111111111111" as `0x${string}`,
          playerB: "0x2222222222222222222222222222222222222222" as `0x${string}`,
          totalStakeA: 4200n * 10n ** 18n, // 4200 HIKARU tokens
          totalStakeB: 7800n * 10n ** 18n, // 7800 DING tokens
          startTime: BigInt(Math.floor(Date.now() / 1000) - 7200), // 2 hours ago
          endTime: BigInt(Math.floor(Date.now() / 1000) - 600), // 10 minutes ago
          resolved: true,
          winner: "0x1111111111111111111111111111111111111111" as `0x${string}`,
          description: "Hikaru Nakamura will reach 3000+ rating in 2024",
          active: false,
        },
      ];

      setChallenges(mockChallenges);
    };

    loadChallenges();
  }, [totalChallenges, setChallenges]);

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

  const handleRefresh = () => {
    refetchChallenges();
  };

  const challengesArray = Array.from(challenges.values()).sort((a, b) =>
    Number(b.startTime - a.startTime)
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
          <Button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="flex items-center gap-2"
          >
            {showCreateForm ? "Hide Form" : "Create Challenge"}
          </Button>
        </div>

        {/* Create Challenge Form */}
        {showCreateForm && (
          <div className="mb-8">
            <CreateChallengeForm
              players={players}
              onSuccess={() => {
                setShowCreateForm(false);
                // TODO: Refresh challenges list
              }}
            />
          </div>
        )}

        {/* Challenges List */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">
              Active Challenges ({challengesArray.length})
            </h2>
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
              onClick={handleRefresh}
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
          </div>

          {/* Demo Note */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              {totalChallenges && typeof totalChallenges === "bigint" && totalChallenges > 0n ? (
                <>
                  <strong>Testnet Connected:</strong> Found {totalChallenges.toString()} real challenges on Base Sepolia. 
                  Create your own challenge to interact with the live contracts!
                </>
              ) : (
                <>
                  <strong>Demo Mode:</strong> Showing mock challenges for demonstration purposes. 
                  Create your own challenge to test the full functionality on testnet!
                </>
              )}
            </p>
          </div>

          {isLoadingChallenges ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-muted-foreground">
                Loading challenges...
              </p>
            </div>
          ) : challengesArray.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No challenges yet</p>
              <p className="text-sm text-muted-foreground mt-1">
                Create the first challenge to get started!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
        </div>
      </main>
    </div>
  );
}
