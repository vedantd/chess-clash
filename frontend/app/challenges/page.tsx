"use client";

import { useEffect, useState } from "react";
import { Navigation } from "@/components/Navigation";
import { ChallengeCard } from "@/components/ChallengeCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useGetAllChallenges, useGetAllPlayers } from "@/lib/contracts/hooks";
import { useAppStore } from "@/lib/store";
import { Challenge } from "@/lib/types";
import { RefreshCw, Plus } from "lucide-react";
import Link from "next/link";

export default function ChallengesPage() {
  const {
    data: challengesData,
    isLoading,
    error,
    refetch,
  } = useGetAllChallenges();
  const { data: playersData } = useGetAllPlayers();
  const { challenges, setChallenges, players, setPlayers } = useAppStore();
  const [usingRealData, setUsingRealData] = useState(false);

  // Load players data
  useEffect(() => {
    if (playersData && Array.isArray(playersData) && playersData.length > 0) {
      setPlayers(playersData);
    }
  }, [playersData, setPlayers]);

  // Load challenges from contract or use mock data
  useEffect(() => {
    const loadChallenges = () => {
      console.log(
        "Debug - loadChallenges called with challengesData:",
        challengesData
      );

      // Check if we have real challenges from contract
      if (
        challengesData &&
        Array.isArray(challengesData) &&
        challengesData.length > 0
      ) {
        console.log(
          `Found ${challengesData.length} real challenges on testnet`
        );

        // Convert contract data to our Challenge type
        const realChallenges = challengesData.map((challenge: any) => ({
          id: challenge.id,
          playerA: challenge.playerA,
          playerB: challenge.playerB,
          totalStakeA: challenge.totalStakeA,
          totalStakeB: challenge.totalStakeB,
          startTime: challenge.startTime,
          endTime: challenge.endTime,
          resolved: challenge.resolved,
          winner:
            challenge.winner !== "0x0000000000000000000000000000000000000000"
              ? challenge.winner
              : undefined,
          description: challenge.description,
          active: challenge.active,
        }));

        console.log(
          "Debug - setting real challenges in store:",
          realChallenges
        );
        setChallenges(realChallenges);
        setUsingRealData(true);
      } else {
        console.log("No real challenges found, using mock data for demo");
        const mockChallenges: Challenge[] = [
          {
            id: 1n,
            playerA:
              "0x1234567890123456789012345678901234567890" as `0x${string}`,
            playerB:
              "0x0987654321098765432109876543210987654321" as `0x${string}`,
            totalStakeA: 8500n * 10n ** 18n,
            totalStakeB: 6200n * 10n ** 18n,
            startTime: BigInt(Math.floor(Date.now() / 1000) - 3600),
            endTime: BigInt(Math.floor(Date.now() / 1000) + 7200),
            resolved: false,
            winner: undefined,
            description:
              "Magnus Carlsen will win the 2024 World Chess Championship",
            active: true,
          },
          {
            id: 2n,
            playerA:
              "0x1111111111111111111111111111111111111111" as `0x${string}`,
            playerB:
              "0x2222222222222222222222222222222222222222" as `0x${string}`,
            totalStakeA: 4200n * 10n ** 18n,
            totalStakeB: 7800n * 10n ** 18n,
            startTime: BigInt(Math.floor(Date.now() / 1000) - 7200),
            endTime: BigInt(Math.floor(Date.now() / 1000) - 600),
            resolved: true,
            winner:
              "0x1111111111111111111111111111111111111111" as `0x${string}`,
            description: "Hikaru Nakamura will reach 3000+ rating in 2024",
            active: false,
          },
        ];
        console.log(
          "Debug - setting mock challenges in store:",
          mockChallenges
        );
        setChallenges(mockChallenges);
        setUsingRealData(false);
      }
    };

    loadChallenges();
  }, [challengesData, setChallenges]);

  const handleRefresh = () => {
    refetch();
    console.log("Refreshing challenges...");
  };

  // Ensure challenges is always an array
  const challengesArray = Array.from(challenges.values());

  console.log("Debug - challenges from store (Map):", challenges);
  console.log("Debug - challengesArray (converted to array):", challengesArray);
  console.log("Debug - challengesData from hook:", challengesData);

  const activeChallenges = challengesArray.filter(
    (challenge) => challenge.active && !challenge.resolved
  );
  const resolvedChallenges = challengesArray.filter(
    (challenge) => challenge.resolved
  );

  console.log("Debug - activeChallenges:", activeChallenges);
  console.log("Debug - resolvedChallenges:", resolvedChallenges);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">All Challenges</h1>
            <p className="text-muted-foreground mt-2">
              View and participate in chess player challenges
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleRefresh}
              variant="outline"
              disabled={isLoading}
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
            <Link href="/">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Challenge
              </Button>
            </Link>
          </div>
        </div>

        {/* Data Source Indicator */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-800">
            {usingRealData ? (
              <>
                <strong>Testnet Connected:</strong> Showing{" "}
                {challengesData?.length || 0} real challenges from Base Sepolia.
              </>
            ) : (
              <>
                <strong>Demo Mode:</strong> Showing mock challenges. Create a
                real challenge to interact with live contracts!
              </>
            )}
          </p>
        </div>

        {/* Active Challenges */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">
            Active Challenges ({activeChallenges.length})
          </h2>
          {activeChallenges.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {activeChallenges.map((challenge) => (
                <ChallengeCard
                  key={challenge.id.toString()}
                  challenge={challenge}
                  players={players}
                  onStakeForA={() => {}}
                  onStakeForB={() => {}}
                />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">
                  No active challenges found.
                </p>
                <Link href="/">
                  <Button className="mt-4">Create First Challenge</Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Resolved Challenges */}
        <div>
          <h2 className="text-2xl font-semibold mb-4">
            Resolved Challenges ({resolvedChallenges.length})
          </h2>
          {resolvedChallenges.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {resolvedChallenges.map((challenge) => (
                <ChallengeCard
                  key={challenge.id.toString()}
                  challenge={challenge}
                  players={players}
                  onStakeForA={() => {}}
                  onStakeForB={() => {}}
                />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">
                  No resolved challenges yet.
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Error State */}
        {error && (
          <Card className="mt-6">
            <CardContent className="p-6">
              <p className="text-red-600">
                Error loading challenges: {String(error)}
              </p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
