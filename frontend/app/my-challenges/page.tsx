"use client";

import { useEffect, useState } from "react";
import { Navigation } from "@/components/Navigation";
import { ChallengeCard } from "@/components/ChallengeCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useGetUserChallenges } from "@/lib/contracts/hooks";
import { usePrivyAddress } from "@/lib/privy-hooks";
import { useAppStore } from "@/lib/store";
import { Challenge } from "@/lib/types";
import { RefreshCw, Plus, Trophy, Clock, CheckCircle } from "lucide-react";
import Link from "next/link";
import { formatNumber } from "@/lib/utils";

export default function MyChallengesPage() {
  const { address } = usePrivyAddress();
  const {
    data: userChallengesData,
    isLoading,
    error,
    refetch,
  } = useGetUserChallenges(address);
  const { players } = useAppStore();
  const [userChallenges, setUserChallenges] = useState<Challenge[]>([]);

  // Convert user challenges data to our Challenge type
  useEffect(() => {
    if (userChallengesData && Array.isArray(userChallengesData)) {
      const convertedChallenges = userChallengesData.map(
        (challengeData: any) => ({
          id: challengeData.id,
          playerA: challengeData.playerA,
          playerB: challengeData.playerB,
          totalStakeA: challengeData.totalStakeA,
          totalStakeB: challengeData.totalStakeB,
          startTime: challengeData.startTime,
          endTime: challengeData.endTime,
          resolved: challengeData.resolved,
          winner:
            challengeData.winner !==
            "0x0000000000000000000000000000000000000000"
              ? challengeData.winner
              : undefined,
          description: challengeData.description,
          active: challengeData.active,
          userStake: challengeData.userStake, // Include user's stake info
        })
      );
      setUserChallenges(convertedChallenges);
    }
  }, [userChallengesData]);

  const handleRefresh = () => {
    refetch();
    console.log("Refreshing user challenges...");
  };

  const activeChallenges = userChallenges.filter(
    (challenge) => challenge.active && !challenge.resolved
  );
  const resolvedChallenges = userChallenges.filter(
    (challenge) => challenge.resolved
  );

  // Helper function to get player name from token address
  const getPlayerName = (tokenAddress: string) => {
    const player = players.find(
      (p) => p.tokenAddress.toLowerCase() === tokenAddress.toLowerCase()
    );
    return player?.name || "Unknown Player";
  };

  // Helper function to get player symbol from token address
  const getPlayerSymbol = (tokenAddress: string) => {
    const player = players.find(
      (p) => p.tokenAddress.toLowerCase() === tokenAddress.toLowerCase()
    );
    return player?.symbol || "???";
  };

  if (!address) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="p-8 text-center">
              <h1 className="text-2xl font-bold mb-4">My Challenges</h1>
              <p className="text-muted-foreground mb-4">
                Connect your wallet to view your challenges
              </p>
              <p className="text-sm text-muted-foreground">
                You need to connect your wallet to see challenges you've
                participated in.
              </p>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">My Challenges</h1>
            <p className="text-muted-foreground mt-2">
              Challenges you've participated in
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

        {/* User's Stake Summary */}
        {userChallenges.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                Your Participation Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {userChallenges.length}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Total Challenges
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {activeChallenges.length}
                  </div>
                  <div className="text-sm text-muted-foreground">Active</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {resolvedChallenges.length}
                  </div>
                  <div className="text-sm text-muted-foreground">Resolved</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Active Challenges */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
            <Clock className="h-6 w-6 text-green-600" />
            Active Challenges ({activeChallenges.length})
          </h2>
          {activeChallenges.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {activeChallenges.map((challenge) => (
                <Card key={challenge.id.toString()} className="relative">
                  <CardContent className="p-6">
                    <div className="mb-4">
                      <h3 className="font-semibold text-lg mb-2">
                        {challenge.description}
                      </h3>
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>
                          {getPlayerName(challenge.playerA)} vs{" "}
                          {getPlayerName(challenge.playerB)}
                        </span>
                      </div>
                    </div>

                    {/* User's Stake Info */}
                    {challenge.userStake && (
                      <div className="bg-blue-50 p-3 rounded-lg mb-4">
                        <h4 className="font-medium text-sm mb-2">
                          Your Stake:
                        </h4>
                        <div className="space-y-1 text-sm">
                          {challenge.userStake.amountA > 0n && (
                            <div className="flex justify-between">
                              <span>
                                For {getPlayerName(challenge.playerA)}:
                              </span>
                              <span className="font-medium">
                                {formatNumber(challenge.userStake.amountA)}{" "}
                                {getPlayerSymbol(challenge.playerA)}
                              </span>
                            </div>
                          )}
                          {challenge.userStake.amountB > 0n && (
                            <div className="flex justify-between">
                              <span>
                                For {getPlayerName(challenge.playerB)}:
                              </span>
                              <span className="font-medium">
                                {formatNumber(challenge.userStake.amountB)}{" "}
                                {getPlayerSymbol(challenge.playerB)}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="flex justify-between text-sm">
                      <span>Total Stakes:</span>
                      <span className="font-medium">
                        {formatNumber(challenge.totalStakeA)}{" "}
                        {getPlayerSymbol(challenge.playerA)} /{" "}
                        {formatNumber(challenge.totalStakeB)}{" "}
                        {getPlayerSymbol(challenge.playerB)}
                      </span>
                    </div>

                    <Link href={`/challenge/${challenge.id}`}>
                      <Button className="w-full mt-4" variant="outline">
                        View Details
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground mb-4">
                  You haven't participated in any active challenges yet.
                </p>
                <Link href="/challenges">
                  <Button>Browse Challenges</Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Resolved Challenges */}
        <div>
          <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
            <CheckCircle className="h-6 w-6 text-purple-600" />
            Resolved Challenges ({resolvedChallenges.length})
          </h2>
          {resolvedChallenges.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {resolvedChallenges.map((challenge) => (
                <Card key={challenge.id.toString()} className="relative">
                  <CardContent className="p-6">
                    <div className="mb-4">
                      <h3 className="font-semibold text-lg mb-2">
                        {challenge.description}
                      </h3>
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>
                          {getPlayerName(challenge.playerA)} vs{" "}
                          {getPlayerName(challenge.playerB)}
                        </span>
                      </div>
                    </div>

                    {/* Winner Info */}
                    {challenge.winner && (
                      <div className="bg-green-50 p-3 rounded-lg mb-4">
                        <h4 className="font-medium text-sm mb-1">Winner:</h4>
                        <span className="text-green-700 font-semibold">
                          {getPlayerName(challenge.winner)}
                        </span>
                      </div>
                    )}

                    {/* User's Stake Info */}
                    {challenge.userStake && (
                      <div className="bg-blue-50 p-3 rounded-lg mb-4">
                        <h4 className="font-medium text-sm mb-2">
                          Your Stake:
                        </h4>
                        <div className="space-y-1 text-sm">
                          {challenge.userStake.amountA > 0n && (
                            <div className="flex justify-between">
                              <span>
                                For {getPlayerName(challenge.playerA)}:
                              </span>
                              <span className="font-medium">
                                {formatNumber(challenge.userStake.amountA)}{" "}
                                {getPlayerSymbol(challenge.playerA)}
                              </span>
                            </div>
                          )}
                          {challenge.userStake.amountB > 0n && (
                            <div className="flex justify-between">
                              <span>
                                For {getPlayerName(challenge.playerB)}:
                              </span>
                              <span className="font-medium">
                                {formatNumber(challenge.userStake.amountB)}{" "}
                                {getPlayerSymbol(challenge.playerB)}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="flex justify-between text-sm">
                      <span>Final Stakes:</span>
                      <span className="font-medium">
                        {formatNumber(challenge.totalStakeA)}{" "}
                        {getPlayerSymbol(challenge.playerA)} /{" "}
                        {formatNumber(challenge.totalStakeB)}{" "}
                        {getPlayerSymbol(challenge.playerB)}
                      </span>
                    </div>

                    <Link href={`/challenge/${challenge.id}`}>
                      <Button className="w-full mt-4" variant="outline">
                        View Details
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
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
                Error loading your challenges: {String(error)}
              </p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
